#![allow(unused)]
use anyhow::anyhow;
use http::Uri;
use proxifier_rs::auth::Auth;
use proxifier_rs::{NetworkTarget, Port, ServerName, {
    http::tunnel as http_tunnel,
    https::HttpsProxy,
    socks4::connect as socks4_connect,
    socks5::connect as socks5_connect
}};
use serde::de::Unexpected::Seq;
use std::net::{SocketAddr, SocketAddrV4, ToSocketAddrs};
use std::sync::Arc;
use std::sync::atomic::AtomicU64;
use std::sync::atomic::Ordering::{Acquire, Relaxed, Release, SeqCst};
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt};
use tokio::task::JoinHandle;
use tokio::time::{Instant, timeout};
use tokio::{fs, join, select};
use tokio_util::sync::CancellationToken;
use tracing::{error, info};
use url::Url;
use tauri::path::BaseDirectory;
use base64::prelude::*;
use crate::models;

#[derive(Debug)]
struct Ack<'a> {
    proxy: &'a str,
    /// Latency in miliseconds [`core::time::Duration::as_millis`]
    latency: u128,
}

#[tauri::command]
pub async fn save_settings(app: AppHandle, payload: models::AppConfig) -> Result<bool, String> {
    let resource_path = app.path().resolve("config.json", BaseDirectory::Resource).map_err(|err| err.to_string())?;
    let ser = serde_json::to_vec(&payload).map_err(|err| err.to_string())?;
    tokio::fs::write(resource_path, &ser).await.map_err(|err| err.to_string())?;

    let state = app.state::<crate::AppState>();
    let mut guard = state.app_config.write().await;
    guard.pool_size = payload.pool_size;
    guard.timeout = payload.timeout;

    Ok(true)
}

#[tauri::command]
pub async fn retrieve_settings(app: AppHandle) -> Result<models::AppConfig, String> {
    let state = app.state::<crate::AppState>();
    let guard = state.app_config.read().await;

    Ok(guard.clone())
}

#[tauri::command]
pub async fn stop_check(state: tauri::State<'_, crate::AppState>) -> Result<(), ()> {
    if state.proxy_checker.workers_state.load(SeqCst) {
        state.proxy_checker.signal.read().await.cancel();
    }
    Ok(())
}

#[tauri::command]
pub async fn read_file(handle: AppHandle, path: String) -> Result<u16, String> {
    let state = handle.state::<crate::AppState>();
    let sender = state.proxy_checker.pipe.0.clone();

    let is_set = state.proxy_checker.fd_state.load(SeqCst);
    if is_set {
        info!("ongoing so not sending anything");
        return Err(anyhow!("Clear your proxy file before uploading a new one").to_string());
    }

    {
        let receiver = state.proxy_checker.pipe.1.clone();
        while !receiver.is_empty() {
            receiver.try_recv();
        }
    }

    let contents = fs::read(path).await;
    let mut load: u16 = 0;

    match contents {
        Ok(contents) => {
            state.proxy_checker.fd_state.store(true, SeqCst);
            let mut lines = contents.lines();
            while let Some(line) = lines.next_line().await.ok().flatten() {
                load += 1;

                let sender_clone = sender.clone();
                tokio::spawn(async move {
                    sender_clone.send(line).await;
                });
            };
        }
        Err(err) => {
            return Err(err.to_string());
        }
    }
    Ok(load)
}

/// Invoke this tauri command by [`check_proxy_list`] to initiate proxy checking, beaware that [`read_file`] must be called prior.
///
/// - [`read_file`] feeds proxy URIs non-blocking and asynchronously through a multi producer multi consumer [`async_channel::bounded`] channel.
/// - [`check_proxy_list`] consumes the feed after the user presses `Start Check` from GUI to invoke [`check_proxy_list`]
///
/// This command will exit instantly if no messages are found in the pipe. GUI alerts the user to provide a proxy list file.
///
/// # Procedures
/// Before starting any operation the following is asserted:
/// - If the given token was cancelled then the pipe should be drained out when not empty
/// - Subsequently the token should be renewed using [`tokio::sync::RWLock`] in [`crate::AppState`]
///
///
/// # Arguments
/// - timeout: Timeout in miliseconds for each task to complete, acts as max timeout for each proxy being asserted.
///
/// # Stop ongoing operation
/// Press `Stop Check` from the GUI, for more details read paragraph "Cancel Safety"
///
/// # Cancel Safety
/// - Safety via [`tokio_util::sync::CancellationToken>`]
///
/// This Tauri command is cancel safe. Invoke [`stop_check`] to gracefully terminate all ongoing operations on the multithreaded async runtime.
/// The user invokes this by pressing `Stop Check` button in the GUI.
#[tauri::command(rename_all = "snake_case")]
pub async fn check_proxy_list(
    app: AppHandle,
    chan: tauri::ipc::Channel<String>,
) -> Result<(), String> {
    let state = app.state::<crate::AppState>();
    let ongoing = state.proxy_checker.workers_state.load(SeqCst);
    let fd_state = state.proxy_checker.fd_state.load(SeqCst);
    if ongoing | !fd_state {
        if(!fd_state) {
            return Err("Upload a proxy list file".into());
        }

        return Err("Cannot upload new proxy file when there is ongoing operation.".into())
    }

    let d = state.app_config.read().await.timeout;
    info!("timeout set: {:?}", d);

    tokio::spawn(async move {
        let mut count = Arc::new(AtomicU64::new(0));
        let state = app.state::<crate::AppState>();
        let mut tasks: Vec<JoinHandle<()>> = vec![];

        state.proxy_checker.workers_state.store(true, SeqCst);

        info!("worker pool starting");
        chan.send("proxy-checker:start".into());

        let sender = state.proxy_checker.pipe.0.clone();
        let receiver = state.proxy_checker.pipe.1.clone();
        let token = state.proxy_checker.signal.read().await;

        // it's absolutely guaranteed that unwrap call will resolve to T
        // and will never fail
        for i in 0..=sender.capacity().unwrap() {
            let count = count.clone();
            if token.is_cancelled() {
                break;
            }

            let app_clone = app.clone();
            let chan = chan.clone();
            let sender = sender.clone();
            let receiver = receiver.clone();
            let token = token.clone();

            let t = tokio::spawn(async move {
                let state = app_clone.state::<crate::AppState>();
                while receiver.len() != 0 && !token.is_cancelled() {
                    let app_clone = app_clone.clone();
                    let proxy = receiver.try_recv();
                    if proxy.is_ok() {
                        let proxy = proxy.unwrap();
                        let task = timeout(d, async {
                            let result: anyhow::Result<Ack> = async {
                                let proxy = &proxy;
                                let uri = proxy.parse::<Url>()?;
                                info!("proxy recv: {:?}", proxy);

                                let mut auth = Auth::NoAuth;
                                let now = Instant::now();
                                match uri.scheme() {
                                    "http" => todo!(),
                                    "https" => todo!(),
                                    "socks4" => todo!(),
                                    "socks5" => {
                                        if let Some(pass) = uri.password() {
                                            auth = Auth::UserPass(uri.username().into(), pass.into())
                                        }

                                        let mut conn = proxifier_rs::socks_with_tls(socks5_connect(
                                            proxifier_rs::Context {
                                                proxy: format!("{}:{}",
                                                    uri.host_str().ok_or_else(|| anyhow!("couldn't retrieve host portion"))?,
                                                    uri.port().ok_or_else(|| anyhow!("couldn't retrieve port portion"))?.to_string()
                                                ).parse()?,
                                                // make it so that judges are configurable, not supported yet
                                                destination: NetworkTarget::Domain("pool.proxyspace.pro".parse()?, Port(443)),
                                            },
                                            auth,
                                        )
                                        .await?, state.tls_config.clone(), ServerName::try_from("google.com")?).await?;

                                        conn.write(b"GET / HTTP/1.1\r\nHost: google.com:443\r\nConnection: close\r\n\r\n")
                                            .await?;

                                        let mut resp = String::new();
                                        conn.read_to_string(&mut resp).await?;
                                        // info!("network ack: {:?}", resp);
                                    }
                                    _  => {
                                        //info!("skipping unknown proxy scheme '{:?}' in {:?}", uri.scheme(), uri);
                                        return Err(anyhow!("unknown proxy scheme"));
                                    }
                                }

                                Ok(Ack { proxy, latency: now.elapsed().as_millis() })
                            }.await;
                            result
                        });

                        select! {
                            // prioritize cancellation
                            biased;
                            _ = token.cancelled() => {
                                 info!("task was cancelled");
                                 break;
                            }
                            res = task => {
                                match res {
                                    Ok(res) => {
                                        match res {
                                            Ok(ack) => {
                                                count.fetch_add(1, SeqCst);
                                                info!("proxy:good:{}:latency:{}", ack.proxy, ack.latency);
                                                chan.send(format!("proxy|good|{}|latency|{}", ack.proxy, ack.latency));
                                            }
                                            Err(err) => {
                                                count.fetch_add(1, SeqCst);
                                                info!("proxy:bad:{}", proxy);
                                                chan.send(format!("proxy|bad|{}", proxy));
                                            }
                                        }
                                    }
                                    Err(err) => {
                                        count.fetch_add(1, SeqCst);
                                        error!("task aborted because it timed out: {:?}", err);
                                        chan.send(format!("proxy|bad|{}", proxy));
                                    }
                                }

                                info!("task finished");
                            }
                        };
                    }
                }
            });
            tasks.push(t);
        }

        for task in tasks {
            task.await;
        }

        info!("pool completed");
        drop(token);

        {
            let mut wlock = state.proxy_checker.signal.write().await;
            *wlock = CancellationToken::new();
        }

        // op done
        state.proxy_checker.fd_state.store(false, SeqCst);
        state.proxy_checker.workers_state.store(false, SeqCst);

        info!("worker pool OP completion");
        chan.send("proxy-checker:end".into());
        info!("COUNT: {}", count.load(SeqCst));
    });
    Ok(())
}
