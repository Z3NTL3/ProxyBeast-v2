use crate::{CancellationToken, SeqCst};
use http::Uri;
use proxifier_rs::{Port, ServerName};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio::select;
use tokio::sync::Mutex;
use tokio::task::JoinHandle;
use tokio::time::timeout;
use tracing::info;

/*
 * CAUTION: This part is incomplete and still under progressive development.
 */
#[tauri::command(rename_all = "snake_case")]
pub async fn check_proxy(
    app: AppHandle,
    timeout_: u64,
    proxy_uri: String,
    chan: tauri::ipc::Channel<String>,
) -> Result<(), ()> {
    tokio::spawn(async move {
        let app_clone = app.clone();
        let d = Duration::from_millis(timeout_);

        // swap later on to proper Ok type
        let task: JoinHandle<()> = tokio::spawn(async move {
            let state = app_clone.state::<crate::AppState>();
            let uri = proxy_uri.parse::<Uri>().unwrap();

            match uri.scheme_str().unwrap() {
                "http" => {},
                "https" => {},
                "socks4" => {},
                "socks5" => {
                    let mut conn = proxifier_rs::socks_with_tls(proxifier_rs::socks5::connect(
                        proxifier_rs::Context {
                            proxy: "23.27.184.40:5641".parse().unwrap(),
                            destination: proxifier_rs::NetworkTarget::Domain("pool.proxyspace.pro".parse().unwrap(), Port(443)),
                        },
                        proxifier_rs::auth::Auth::UserPass("adsdadsasdqw123".into(), "adasdasdas".into()), // or Auth::NoAuth
                    )
                    .await.unwrap(), state.tls_config.clone(), ServerName::try_from("pool.proxyspace.pro").unwrap()).await.unwrap();

                    conn.write(b"GET /judge.php HTTP/1.1\r\nHost: pool.proxyspace.pro:443\r\nConnection: close\r\n\r\n")
                        .await.unwrap();

                    let mut resp = String::new();
                    conn.read_to_string(&mut resp).await.unwrap();
                    info!("network ack: {:?}", resp);
                }
                _  => {
                    info!("scheme {:?}", uri);
                }
            }
        });

        let timeout_task = timeout(d, task);
        let state = app.state::<crate::AppState>();
        let held = state.proxy_checker.signal.read().await;

        select! {
            res = timeout_task => {
                if let Err(err) = res {
                    info!("task timed out {:?}", err)
                }
                info!("task finished")
            }
            _ = held.cancelled() => {
                info!("task cancelled out");
                chan.send("cancelled:".into()).unwrap();
            }
        }
    }).await.unwrap();
    Ok(())
}

#[tauri::command]
pub async fn stop_check(state: tauri::State<'_, crate::AppState>) -> Result<(), ()> {
    state.proxy_checker.signal.read().await.cancel();
    Ok(())
}
