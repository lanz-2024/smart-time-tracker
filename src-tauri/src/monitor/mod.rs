pub mod debounce;
pub mod process_detector;

use std::time::Duration;
use tauri::AppHandle;
use tauri::Emitter;

pub async fn start_activity_monitor(app: AppHandle) {
    let mut debouncer = debounce::ActivityDebouncer::new(3, 6);

    loop {
        let cpu_active = process_detector::is_system_active();
        let new_state = debouncer.update(cpu_active);

        // Emit current activity state to the frontend
        let _ = app.emit("activity-state-changed", new_state);

        tokio::time::sleep(Duration::from_secs(1)).await;
    }
}
