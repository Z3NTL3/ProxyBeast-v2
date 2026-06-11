use std::time::Duration;
use tauri::menu::{MenuBuilder, PredefinedMenuItem};
use tauri::{async_runtime, AppHandle, Emitter, Listener, Manager};
use tracing::field::Visit;
use tracing::{info, Level, Subscriber};
use tracing_subscriber::filter::filter_fn;
use tracing_subscriber::prelude::*;
use tracing_subscriber::{fmt, Layer, Registry};

use std::sync::OnceLock;

static LIVE_LOGS: &'static str = "live-logs";
static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();

// pub(crate) mod commands;
pub(crate) mod events {
    pub const WINDOW_LOADED: &'static str = "window_loaded";
    pub const WINDOW_LOAD_PROGRESS: &'static str = "load_progress";
}

struct LiveLogs;
impl<S: Subscriber> Layer<S> for LiveLogs {
    fn enabled(
        &self,
        _: &tracing::Metadata<'_>,
        _: tracing_subscriber::layer::Context<'_, S>,
    ) -> bool {
        true
    }

    fn on_event(&self, event: &tracing::Event<'_>, _: tracing_subscriber::layer::Context<'_, S>) {
        let mut  visitor: MessageVisitor = Default::default();
        event.record(&mut visitor);

        let log = format!("{:?}", visitor.0);
        APP_HANDLE
            .get()
            .unwrap()
            .app_handle()
            .emit_to("main", "activity", &log[..])
            .unwrap();
    }
}

#[derive(Default)]
#[repr(transparent)]
struct MessageVisitor(String);

impl Visit for MessageVisitor {
    fn record_debug(&mut self, field: &tracing::field::Field, value: &dyn core::fmt::Debug) {
        if field.name() == "message" {
            self.0 = format!("{:?}", value);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        // .invoke_handler(tauri::generate_handler![])
        .setup(|app| {
            APP_HANDLE.set(app.app_handle().to_owned()).unwrap();
            let subscriber = Registry::default()
                .with(fmt::layer())
                .with(LiveLogs.with_filter(filter_fn(|metadata| {
                    if metadata.target() == LIVE_LOGS {
                        true
                    } else {
                        false
                    }
                })));
            tracing::subscriber::set_global_default(subscriber).unwrap();

            let windows = app.webview_windows();
            let main_window = windows.get("main").unwrap();

            main_window.hide()?;
            main_window.center()?;

            let boot_window = tauri::webview::WebviewWindowBuilder::new(
                app,
                "bootstrapper",
                tauri::WebviewUrl::App("/bootstrap".into()),
            )
            .center()
            .closable(false)
            .focused(true)
            .resizable(false)
            .title("Bootstrap")
            .maximizable(false)
            .inner_size(520 as f64, 380 as f64)
            .decorations(false)
            .visible(false)
            .always_on_top(true)
            .build()?;

            let bootstrap = boot_window.clone();
            let main = main_window.clone();

            boot_window.listen(events::WINDOW_LOADED, move |_| bootstrap.show().unwrap());
            main_window.listen(events::WINDOW_LOADED, move |_| {
                let bootstrap_ = boot_window.clone();
                let main_ = main.clone();

                async_runtime::spawn(async move {
                    for num in vec![
                        rand::random_range(0.0..=0.2),
                        rand::random_range(0.2..0.4),
                        rand::random_range(0.4..0.8),
                    ] {
                        bootstrap_
                            .emit_to("bootstrapper", events::WINDOW_LOAD_PROGRESS, num)
                            .unwrap();
                        tokio::time::sleep(Duration::from_millis(700)).await;
                    }

                    tokio::time::sleep(Duration::from_millis(300)).await;
                    bootstrap_
                        .emit_to("bootstrapper", events::WINDOW_LOAD_PROGRESS, 1.0)
                        .unwrap();

                    tokio::time::sleep(Duration::from_millis(1500)).await;
                    bootstrap_.close().unwrap();
                    main_.show().unwrap();
                    main_.set_focus().unwrap();

                    info!(target: LIVE_LOGS ,"Application bootstrapped.");
                });
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
