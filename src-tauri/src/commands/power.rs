#[cfg(target_os = "macos")]
use std::process::Command;

#[tauri::command]
pub fn prevent_sleep() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        Command::new("caffeinate")
            .arg("-di")
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn allow_sleep() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        Command::new("pkill")
            .arg("caffeinate")
            .output()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
