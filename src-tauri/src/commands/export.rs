use serde::{Deserialize, Serialize};

/// Matches the frontend TimeEntry shape for export operations.
#[derive(Debug, Serialize, Deserialize)]
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

#[tauri::command]
pub fn export_time_entries(entries: Vec<TimeEntry>, format: String) -> Result<String, String> {
    match format.as_str() {
        "csv" => {
            let mut csv = String::from(
                "id,projectId,taskId,startTime,endTime,duration,notes,tags,autoLogged\n",
            );
            for entry in &entries {
                let tags = entry.tags.join(";");
                csv.push_str(&format!(
                    "{},{},{},{},{},{},{},{},{}\n",
                    entry.id,
                    entry.project_id,
                    entry.task_id.as_deref().unwrap_or(""),
                    entry.start_time,
                    entry.end_time.as_deref().unwrap_or(""),
                    entry.duration,
                    entry.notes.as_deref().unwrap_or(""),
                    tags,
                    entry.auto_logged,
                ));
            }
            Ok(csv)
        }
        "json" => serde_json::to_string_pretty(&entries).map_err(|e| e.to_string()),
        _ => Err(format!("Unsupported format: {}", format)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_entry() -> TimeEntry {
        TimeEntry {
            id: "id-1".to_string(),
            project_id: "proj-1".to_string(),
            task_id: None,
            start_time: "2024-01-01T09:00:00Z".to_string(),
            end_time: Some("2024-01-01T10:00:00Z".to_string()),
            duration: 3600,
            notes: None,
            tags: vec![],
            auto_logged: false,
        }
    }

    #[test]
    fn export_csv_includes_header() {
        let result = export_time_entries(vec![sample_entry()], "csv".to_string()).unwrap();
        assert!(result.starts_with("id,projectId"));
        assert!(result.contains("id-1,proj-1"));
    }

    #[test]
    fn export_json_is_valid() {
        let result = export_time_entries(vec![sample_entry()], "json".to_string()).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&result).unwrap();
        assert!(parsed.is_array());
        assert_eq!(parsed[0]["id"], "id-1");
    }

    #[test]
    fn export_unsupported_format_errors() {
        let result = export_time_entries(vec![], "xml".to_string());
        assert!(result.is_err());
    }
}
