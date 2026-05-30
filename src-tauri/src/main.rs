#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  Manager, WindowEvent,
};

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_autostart::init(
      tauri_plugin_autostart::MacosLauncher::LaunchAgent,
      None,
    ))
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .setup(|app| {
      let open = MenuItem::with_id(app, "open", "Open Irshad", true, None::<&str>)?;
      let quick_reply = MenuItem::with_id(app, "quick-reply", "Quick Reply", true, None::<&str>)?;
      let toggle_autostart = MenuItem::with_id(app, "toggle-autostart", "Toggle Autostart", true, None::<&str>)?;
      let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&open, &quick_reply, &toggle_autostart, &quit])?;

      let _tray = TrayIconBuilder::new()
        .tooltip("Irshad")
        .icon(app.default_window_icon().cloned().unwrap_or_default())
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| match event.id.as_ref() {
          "open" => {
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.show();
              let _ = window.set_focus();
            }
          }
          "quick-reply" => {
            let _ = app.emit("desktop:quick-reply", ());
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.show();
              let _ = window.set_focus();
            }
          }
          "toggle-autostart" => {
            let _ = app.emit("desktop:toggle-autostart", ());
          }
          "quit" => {
            app.exit(0);
          }
          _ => {}
        })
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
