use std::{time::Duration};
use crate::{SeqCst, CancellationToken};
use tauri::{AppHandle, Manager};
use tokio::sync::{Mutex, oneshot};
use tokio::time::timeout;

#[tauri::command]
pub async fn check_proxy(app: AppHandle, timeout: u64, proxy_uri: String, chan: tauri::ipc::Channel<String>) ->  Result<(),()> {
    let (tx, rx) = oneshot::channel::<String>();
    let state = app.state::<Mutex<crate::AppState>>();

    tokio::spawn(async move {
        let d = Duration::from_millis(timeout);
        let state = app.state::<Mutex<crate::AppState>>();


    }).await.unwrap();
    Ok(())
}

#[tauri::command]
pub async fn stop_check(state: tauri::State<'_, crate::AppState>) -> Result<(),()>{
    state.proxy_checker.lock().await.cancel();
    Ok(())
}
