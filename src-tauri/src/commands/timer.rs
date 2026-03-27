use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

/// Mirror of the frontend TimeEntry type (ISO 8601 strings, duration in seconds).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimeEntry {
    pub id: String,
    pub project_id: String,
    pub task_id: Option<String>,
    pub start_time: String,
    pub end_time: Option<String>,
    pub duration: u64,
    pub notes: Option<String>,
    pub tags: Vec<String>,
    pub auto_logged: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum TimerStatus {
    Idle,
    Running,
    Paused,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerState {
    pub status: TimerStatus,
    /// ISO 8601 timestamp when the current segment started.
    pub started_at: Option<String>,
    /// ISO 8601 timestamp when the timer was paused.
    pub paused_at: Option<String>,
    /// Seconds accumulated from completed segments (before current segment).
    pub accumulated_seconds: u64,
    pub project_id: Option<String>,
    pub task_id: Option<String>,
}

impl Default for TimerState {
    fn default() -> Self {
        Self {
            status: TimerStatus::Idle,
            started_at: None,
            paused_at: None,
            accumulated_seconds: 0,
            project_id: None,
            task_id: None,
        }
    }
}

pub struct TimerStateWrapper(pub Mutex<TimerState>);

/// Returns elapsed seconds for the current running segment only (not accumulated).
#[tauri::command]
pub fn get_elapsed_seconds(state: State<'_, TimerStateWrapper>) -> u64 {
    let timer = state.0.lock().unwrap();
    if timer.status != TimerStatus::Running {
        return 0;
    }
    if let Some(ref started_at) = timer.started_at {
        if let Ok(started) = started_at.parse::<DateTime<Utc>>() {
            let delta = Utc::now().signed_duration_since(started);
            return delta.num_seconds().max(0) as u64;
        }
    }
    0
}

#[tauri::command]
pub fn start_timer(
    project_id: String,
    task_id: Option<String>,
    started_at: String,
    state: State<'_, TimerStateWrapper>,
) -> Result<(), String> {
    let mut timer = state.0.lock().unwrap();
    timer.status = TimerStatus::Running;
    timer.started_at = Some(started_at);
    timer.paused_at = None;
    timer.accumulated_seconds = 0;
    timer.project_id = Some(project_id);
    timer.task_id = task_id;
    Ok(())
}

#[tauri::command]
pub fn pause_timer(state: State<'_, TimerStateWrapper>) -> Result<(), String> {
    let mut timer = state.0.lock().unwrap();
    if timer.status != TimerStatus::Running {
        return Err("Timer is not running".to_string());
    }
    // Accumulate the current segment's elapsed time
    if let Some(ref started_at) = timer.started_at {
        if let Ok(started) = started_at.parse::<DateTime<Utc>>() {
            let delta = Utc::now().signed_duration_since(started);
            timer.accumulated_seconds += delta.num_seconds().max(0) as u64;
        }
    }
    timer.status = TimerStatus::Paused;
    timer.paused_at = Some(Utc::now().to_rfc3339());
    timer.started_at = None;
    Ok(())
}

#[tauri::command]
pub fn resume_timer(resumed_at: String, state: State<'_, TimerStateWrapper>) -> Result<(), String> {
    let mut timer = state.0.lock().unwrap();
    if timer.status != TimerStatus::Paused {
        return Err("Timer is not paused".to_string());
    }
    timer.status = TimerStatus::Running;
    timer.started_at = Some(resumed_at);
    timer.paused_at = None;
    Ok(())
}

#[tauri::command]
pub fn stop_timer(state: State<'_, TimerStateWrapper>) -> Result<TimeEntry, String> {
    let mut timer = state.0.lock().unwrap();

    let project_id = timer
        .project_id
        .take()
        .ok_or_else(|| "No active project".to_string())?;
    let task_id = timer.task_id.take();
    let start_time = timer
        .started_at
        .take()
        .or_else(|| {
            // If paused, reconstruct a plausible start_time (accumulated time ago)
            Some(
                (Utc::now() - chrono::Duration::seconds(timer.accumulated_seconds as i64))
                    .to_rfc3339(),
            )
        })
        .unwrap_or_else(|| Utc::now().to_rfc3339());

    // Compute total duration
    let segment_seconds = if timer.status == TimerStatus::Running {
        if let Ok(started) = start_time.parse::<DateTime<Utc>>() {
            Utc::now()
                .signed_duration_since(started)
                .num_seconds()
                .max(0) as u64
        } else {
            0
        }
    } else {
        0
    };
    let total_seconds = timer.accumulated_seconds + segment_seconds;

    let end_time = Utc::now().to_rfc3339();

    // Reset state
    timer.status = TimerStatus::Idle;
    timer.started_at = None;
    timer.paused_at = None;
    timer.accumulated_seconds = 0;
    timer.project_id = None;
    timer.task_id = None;

    Ok(TimeEntry {
        id: Uuid::new_v4().to_string(),
        project_id,
        task_id,
        start_time,
        end_time: Some(end_time),
        duration: total_seconds,
        notes: None,
        tags: vec![],
        auto_logged: false,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn timer_state_defaults_to_idle() {
        let state = TimerState::default();
        assert_eq!(state.status, TimerStatus::Idle);
        assert_eq!(state.accumulated_seconds, 0);
        assert!(state.started_at.is_none());
    }

    #[test]
    fn time_entry_serialises_camel_case() {
        let entry = TimeEntry {
            id: "abc".to_string(),
            project_id: "proj-1".to_string(),
            task_id: None,
            start_time: "2024-01-01T00:00:00Z".to_string(),
            end_time: Some("2024-01-01T01:00:00Z".to_string()),
            duration: 3600,
            notes: None,
            tags: vec![],
            auto_logged: false,
        };
        let json = serde_json::to_string(&entry).unwrap();
        assert!(json.contains("projectId"));
        assert!(json.contains("startTime"));
        assert!(json.contains("autoLogged"));
    }
}
