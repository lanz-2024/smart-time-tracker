mod commands;
mod monitor;
mod store;

use commands::timer::TimerStateWrapper;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::default().build())
        .manage(TimerStateWrapper(std::sync::Mutex::new(
            commands::timer::TimerState::default(),
        )))
        .invoke_handler(tauri::generate_handler![
            commands::timer::start_timer,
            commands::timer::stop_timer,
            commands::timer::pause_timer,
            commands::timer::resume_timer,
            commands::timer::get_elapsed_seconds,
            commands::activity::get_activity_state,
            commands::activity::get_running_processes,
            commands::power::prevent_sleep,
            commands::power::allow_sleep,
            commands::export::export_time_entries,
            commands::updater::check_for_updates,
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                monitor::start_activity_monitor(handle).await;
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
