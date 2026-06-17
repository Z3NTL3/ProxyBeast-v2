#[tauri::command]
pub async fn start_check(state: tauri::State<'_, crate::AppState>, chan: tauri::ipc::Channel<String>) ->  Result<(),()> {
    todo!()
}

#[tauri::command]
pub fn stop_check(state: tauri::State<crate::AppState>) {
    state.proxy_checker.store(crate::Signal::Stop as u8, crate::SeqCst);
}
