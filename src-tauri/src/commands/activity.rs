use chrono::Utc;
use serde::{Deserialize, Serialize};
use sysinfo::System;

/// Mirrors the frontend ActivityState type exactly (camelCase JSON).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityState {
    pub is_active: bool,
    /// ISO 8601 timestamp of the last moment activity was detected.
    pub last_active_at: String,
    pub idle_seconds: u64,
    /// Names of foreground processes with notable CPU usage.
    pub active_processes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessInfo {
    pub name: String,
    pub cpu_usage: f32,
    pub memory_mb: u64,
}

#[tauri::command]
pub fn get_activity_state() -> ActivityState {
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpu_count = sys.cpus().len().max(1) as f32;
    let total_cpu: f32 =
        sys.cpus().iter().map(|c| c.cpu_usage()).sum::<f32>() / cpu_count;

    let is_active = total_cpu > 10.0;
    let now = Utc::now().to_rfc3339();

    let active_processes: Vec<String> = sys
        .processes()
        .values()
        .filter(|p| p.cpu_usage() > 5.0)
        .map(|p| p.name().to_string())
        .collect();

    ActivityState {
        is_active,
        last_active_at: now,
        idle_seconds: if is_active { 0 } else { 30 },
        active_processes,
    }
}

#[tauri::command]
pub fn get_running_processes() -> Vec<ProcessInfo> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let mut processes: Vec<ProcessInfo> = sys
        .processes()
        .values()
        .filter(|p| p.cpu_usage() > 0.1)
        .map(|p| ProcessInfo {
            name: p.name().to_string(),
            cpu_usage: p.cpu_usage(),
            memory_mb: p.memory() / 1024 / 1024,
        })
        .collect();

    processes.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap());
    processes.truncate(20);
    processes
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn activity_state_serialises_camel_case() {
        let state = ActivityState {
            is_active: true,
            last_active_at: "2024-01-01T00:00:00Z".to_string(),
            idle_seconds: 0,
            active_processes: vec!["code".to_string()],
        };
        let json = serde_json::to_string(&state).unwrap();
        assert!(json.contains("isActive"));
        assert!(json.contains("lastActiveAt"));
        assert!(json.contains("idleSeconds"));
        assert!(json.contains("activeProcesses"));
    }
}
