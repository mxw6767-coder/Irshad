#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod preferences;

use preferences::DesktopPreferences;
use serde::Serialize;
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  AppHandle, Emitter, Manager, WindowEvent,
};

#[derive(Debug, Clone, Serialize)]
struct DesktopPreferencesResponse {
  minimize_to_tray_on_close: bool,
}

fn preferences_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
  let config_dir = app.path().app_config_dir().map_err(|error| error.to_string())?;
  Ok(config_dir.join("desktop-preferences.json"))
}

#[tauri::command]
fn get_desktop_preferences(app: AppHandle) -> Result<DesktopPreferencesResponse, String> {
  let preferences = DesktopPreferences::load(preferences_path(&app)?);
  Ok(DesktopPreferencesResponse {
    minimize_to_tray_on_close: preferences.minimize_to_tray_on_close,
  })
}

#[tauri::command]
fn set_minimize_to_tray_on_close(app: AppHandle, enabled: bool) -> Result<DesktopPreferencesResponse, String> {
  let path = preferences_path(&app)?;
  let preferences = DesktopPreferences {
    minimize_to_tray_on_close: enabled,
  };
  preferences.save(path)?;
  Ok(DesktopPreferencesResponse {
    minimize_to_tray_on_close: enabled,
  })
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_autostart::init(
      tauri_plugin_autostart::MacosLauncher::LaunchAgent,
      None,
    ))
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      get_desktop_preferences,
      set_minimize_to_tray_on_close
    ])
    .setup(|app| {
      let preferences = DesktopPreferences::load(preferences_path(app.handle())?);
      let open = MenuItem::with_id(app, "open", "Open Irshad", true, None::<&str>)?;
      let quick_reply = MenuItem::with_id(app, "quick-reply", "Quick Reply", true, None::<&str>)?;
      let toggle_autostart = MenuItem::with_id(app, "toggle-autostart", "Toggle Autostart", true, None::<&str>)?;
      let minimize_to_tray = MenuItem::with_id(
        app,
        "toggle-minimize",
        if preferences.minimize_to_tray_on_close {
          "Disable Minimize on Close"
        } else {
          "Enable Minimize on Close"
        },
        true,
        None::<&str>,
      )?;
      let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&open, &quick_reply, &toggle_autostart, &minimize_to_tray, &quit])?;
      let tray_icon = app
        .default_window_icon()
        .cloned()
        .ok_or_else(|| "missing default window icon".to_string())?;

      let _tray = TrayIconBuilder::new()
        .tooltip("Irshad")
        .icon(tray_icon)
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
          "toggle-minimize" => {
            let _ = app.emit("desktop:toggle-minimize-to-tray", ());
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
            let preferences = DesktopPreferences::load(preferences_path(&app_handle).unwrap_or_default());
            if preferences.minimize_to_tray_on_close {
              api.prevent_close();
              if let Some(hidden_window) = app_handle.get_webview_window("main") {
                let _ = hidden_window.hide();
              }
            }
          }
        });
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running irshad desktop app");
}
