#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, WindowEvent};

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_autostart::init())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .setup(|app| {
      let _tray = tauri::tray::TrayIconBuilder::new()
        .tooltip("Irshad")
        .icon(app.default_window_icon().cloned().unwrap_or_default())
        .on_tray_icon_event(|tray, event| {
          if let tauri::tray::TrayIconEvent::DoubleClick { .. } = event {
            if let Some(window) = tray.app_handle().get_webview_window("main") {
              let _ = window.show();
              let _ = window.set_focus();
            }
          }
        })
        .build(app)?;

      if let Some(window) = app.get_webview_window("main") {
        let app_handle = app.handle().clone();
        window.on_window_event(move |event| {
          if let WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            if let Some(hidden_window) = app_handle.get_webview_window("main") {
              let _ = hidden_window.hide();
            }
          }
        });
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running irshad desktop app");
}

