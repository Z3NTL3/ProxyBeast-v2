use std::sync::Arc;
use std::{time::Duration};
use crate::{SeqCst, CancellationToken};
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio::sync::Mutex;
use tokio::time::timeout;
use http::Uri;
use tracing::info;
use tokio::select;
use proxifier_rs::{RootCertStore,ClientConfig,ServerName, Port};

/*
 * CAUTION: This part is incomplete and still under progressive development.
 */
#[tauri::command]
pub async fn check_proxy(app: AppHandle, timeout_: u64, proxy_uri: String, chan: tauri::ipc::Channel<String>) ->  Result<(),()> {
    tokio::spawn(async move {
        let app_clone = app.clone();
        let d = Duration::from_millis(timeout_);

        let task = tokio::spawn(async move {
            info!("running task on mt runtime in parallel");

            info!("parsing");
            let uri = proxy_uri.parse::<Uri>().unwrap();
            info!("parsed");

            match uri.scheme_str().unwrap() {
                "http" | "https" => {

                },
                "socks4" => {

                }
                "socks5" => {
                    info!("entered socks5 branch");


                    let mut root_cert_store = RootCertStore::empty();
                    root_cert_store.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());

                    let config = Arc::new(
                        ClientConfig::builder()
                            .with_root_certificates(root_cert_store)
                            .with_no_client_auth(),
                    );

                    let mut conn = proxifier_rs::socks_with_tls(proxifier_rs::socks5::connect(
                        proxifier_rs::Context {
                            proxy: "23.27.184.40:5641".parse().unwrap(),
                            destination: proxifier_rs::NetworkTarget::Domain("httpbin.org".parse().unwrap(), Port(443)),
                        },
                        proxifier_rs::auth::Auth::UserPass("adsdadsasdqw123".into(), "adasdasdas".into()), // or Auth::NoAuth
                    )
                    .await.unwrap(), config, ServerName::try_from("httpbin.org").unwrap()).await.unwrap();

                    conn.write(b"GET /headers HTTP/1.1\r\nHost: httpbin.org:443\r\nConnection: close\r\n\r\n")
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
        let held = state.proxy_checker.lock().await;

        select! {
            res = timeout_task => {
                if let Err(err) = res {
                    info!("task timed out {:?}", err)
                }
                info!("task finished")
            }
            _ = held.cancelled() => {
                info!("task cancelled out")
            }
        }
    }).await.unwrap();
    Ok(())
}

#[tauri::command]
pub async fn stop_check(state: tauri::State<'_, crate::AppState>) -> Result<(),()>{
    state.proxy_checker.lock().await.cancel();
    Ok(())
}
