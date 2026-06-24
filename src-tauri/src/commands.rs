use proxifier_rs::auth::Auth;
use url::Url;
use proxifier_rs::{NetworkTarget, Port, ServerName};
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt};
use tokio::task::JoinHandle;
use tokio::time::timeout;
use tokio::{fs, select};
use tracing::info;
use anyhow::anyhow;

/*
 * CAUTION: This part is incomplete and still under progressive development.
 */
#[tauri::command(rename_all = "snake_case")]
pub async fn check_proxy_list(
    app: AppHandle,
    timeout_: u64,
    chan: tauri::ipc::Channel<String>,
) -> Result<(), ()> {
    tokio::spawn(async move {
        let app_clone = app.clone();
        let d = Duration::from_millis(timeout_);

        let task: JoinHandle<anyhow::Result<()>> = tokio::spawn(async move {
            let state = app_clone.state::<crate::AppState>();
            let mut pipe = state.proxy_checker.pipe.1.clone();

            pipe.changed().await?;
            let proxy: String = pipe.borrow_and_update().to_string(); // *pipe.borrow_and_update() -> cannot be held accross .await as noted by docs
            let uri = proxy.parse::<Url>()?;

            info!("recv: {:?}", proxy);

            let mut auth = Auth::NoAuth;
            match uri.scheme() {
                "http" => {},
                "https" => {},
                "socks4" => {},
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
            Ok(())
        });

        let timeout_task = timeout(d, task);
        let state = app.state::<crate::AppState>();
        let held = state.proxy_checker.signal.read().await;

        select! {
            res = timeout_task => {
                if let Err(err) = res {
                    info!("task timed out {:?}", err)
                    } else if let Ok(Ok(v)) = res {
                    let b = v;
                }

                info!("task finished");
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

#[tauri::command]
pub async fn read_file(handle: AppHandle, path: String) -> Result<bool, String> {
    let contents = fs::read(path).await.map_err(|err| err.to_string())?;
    tokio::spawn(async move {
        let mut lines = contents.lines();

        while let Some(line) = lines.next_line().await.ok().flatten() {
            let _ = handle.state::<crate::AppState>()
                .proxy_checker
                .pipe
                .0
                .send(line)
                .map_err(|err| {
                    info!("err while sending: {err}");
                    err.to_string()
                });
        }
    });
    Ok(true)
}
