#![allow(unused)]
use anyhow::anyhow;
use proxifier_rs::auth::Auth;
use proxifier_rs::{NetworkTarget, Port, ServerName};
use std::net::SocketAddrV4;
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt};
use tokio::task::JoinHandle;
use tokio::time::{Instant, timeout};
use tokio::{fs, select};
use tokio_util::sync::CancellationToken;
use tracing::{error, info};
use url::Url;

#[derive(Debug)]
struct Ack {
    proxy: String,
    /// Latency in miliseconds [`core::time::Duration::as_millis`]
    latency: u128,
}

/// Invoke this tauri command by [`check_proxy_list`] to initiate proxy checking, beaware that [`read_file`] must be called prior.
///
/// - [`read_file`] feeds proxy URIs non-blockin and asynchronously through a multi producer multi consumer [`async_channel::bounded`] channel.
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
    timeout_: u64,
    chan: tauri::ipc::Channel<String>,
) -> Result<(), ()> {
    let d = Duration::from_millis(timeout_);
    let _ = tokio::spawn(async move {
        let state = app.state::<crate::AppState>();
        let reinit = {
            let mut rlock = state.proxy_checker.signal.read().await;

            if rlock.is_cancelled() {
                info!("cancelled");
                while !state.proxy_checker.pipe.1.is_empty() {
                    // drain
                    state.proxy_checker.pipe.1.try_recv();
                }

                info!("drained");
                true
            } else {
                false
            }
        };

        if reinit {
            let mut wlock = state.proxy_checker.signal.write().await;
            *wlock = CancellationToken::new();
            info!("reinitialized parent CancellationToken");

            chan.send(format!("{}:re-invoke", crate::events::REINIT));
            return;
        }

        while !state.proxy_checker.pipe.1.is_empty() {
            let app_clone = app.clone();
            tokio::spawn(async move {
                let state = app_clone.state::<crate::AppState>();
                let task = timeout(d, async {
                    let result: anyhow::Result<Ack> = async {
                        let proxy = state.proxy_checker.pipe.1.recv().await?;
                        let uri = proxy.parse::<Url>()?;

                        info!("recv: {:?}", proxy);

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

                                let mut conn = proxifier_rs::socks_with_tls(proxifier_rs::socks5::connect(
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
                                .await?, state.tls_config.clone(), ServerName::try_from("pool.proxyspace.pro")?).await?;

                                conn.write(b"GET /judge.php HTTP/1.1\r\nHost: pool.proxyspace.pro:443\r\nConnection: close\r\n\r\n")
                                    .await?;

                                let mut resp = String::new();
                                conn.read_to_string(&mut resp).await?;
                                info!("network ack: {:?}", resp);
                            }
                            _  => {
                                info!("skipping unknown proxy scheme '{:?}' in {:?}", uri.scheme(), uri);
                            }
                        }

                        Ok(Ack { proxy, latency: now.elapsed().as_millis() })
                    }.await;
                    // todo
                });

                let sig = state.proxy_checker.signal.read().await;
                select! {
                    res = task => {
                        if let Err(err) = res {
                            error!("task aborted because it timed out: {:?}", err)
                        }
                        info!("task finished")
                    }

                    _ = sig.cancelled() => {
                         info!("task was cancelled")
                    }
                };
            });

        };
    }).await;
    Ok(())
}

#[tauri::command]
pub async fn stop_check(state: tauri::State<'_, crate::AppState>) -> Result<(), ()> {
    state.proxy_checker.signal.read().await.cancel();
    Ok(())
}

#[tauri::command]
pub async fn read_file(handle: AppHandle, path: String) -> Result<bool, String> {
    let contents = fs::read(path).await.map_err(|err| err.to_string())?;
    let task = 't1: {
        let state = handle.state::<crate::AppState>();
        let rlock = state.proxy_checker.signal.read().await;
        if rlock.is_cancelled() {
            break 't1;
        }

        let mut lines = contents.lines();

        while let Some(line) = lines.next_line().await.ok().flatten() {
            let _ = handle
                .state::<crate::AppState>()
                .proxy_checker
                .pipe
                .0
                .send(line)
                .await
                .map_err(|err| {
                    info!("err while sending: {err}");
                    err.to_string()
                });
        }
    };
    tokio::spawn(async move { task });
    Ok(true)
}
