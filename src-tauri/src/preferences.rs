use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesktopPreferences {
  pub minimize_to_tray_on_close: bool,
}

impl Default for DesktopPreferences {
  fn default() -> Self {
    Self {
      minimize_to_tray_on_close: true,
    }
  }
}

impl DesktopPreferences {
  pub fn load(path: PathBuf) -> Self {
    fs::read_to_string(path)
      .ok()
      .and_then(|contents| serde_json::from_str::<DesktopPreferences>(&contents).ok())
      .unwrap_or_default()
  }

  pub fn save(&self, path: PathBuf) -> Result<(), String> {
    if let Some(parent) = path.parent() {
      fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    let serialized = serde_json::to_string_pretty(self).map_err(|error| error.to_string())?;
    fs::write(path, serialized).map_err(|error| error.to_string())
  }
}
