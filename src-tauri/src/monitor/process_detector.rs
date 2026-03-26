use sysinfo::System;

/// Returns true if there is meaningful CPU activity (any CPU core > 10% usage).
pub fn is_system_active() -> bool {
    let mut sys = System::new_all();
    sys.refresh_all();
    let cpu_count = sys.cpus().len().max(1) as f32;
    let total_cpu: f32 = sys.cpus().iter().map(|c| c.cpu_usage()).sum::<f32>() / cpu_count;
    total_cpu > 10.0
}
