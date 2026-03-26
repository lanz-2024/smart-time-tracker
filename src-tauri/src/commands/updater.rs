use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub available: bool,
    pub version: Option<String>,
    pub url: Option<String>,
}

#[tauri::command]
pub async fn check_for_updates() -> Result<UpdateInfo, String> {
    let client = reqwest::Client::new();
    let response = client
        .get("https://api.github.com/repos/lanz-2024/smart-time-tracker/releases/latest")
        .header("User-Agent", "smart-time-tracker")
        .send()
        .await;

    match response {
        Ok(resp) if resp.status().is_success() => {
            let release: serde_json::Value =
                resp.json().await.map_err(|e| e.to_string())?;
            let latest_version = release["tag_name"]
                .as_str()
                .unwrap_or("v0.0.0")
                .trim_start_matches('v');
            let current_version = env!("CARGO_PKG_VERSION");

            let available = latest_version != current_version;
            Ok(UpdateInfo {
                available,
                version: if available {
                    Some(latest_version.to_string())
                } else {
                    None
                },
                url: if available {
                    release["html_url"].as_str().map(|s| s.to_string())
                } else {
                    None
                },
            })
        }
        _ => Ok(UpdateInfo {
            available: false,
            version: None,
            url: None,
        }),
    }
}
