use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ActivityStatus {
    Active,
    Idle,
}

pub struct ActivityDebouncer {
    active_threshold: u32,
    idle_threshold: u32,
    active_count: u32,
    idle_count: u32,
    pub current_state: ActivityStatus,
}

impl ActivityDebouncer {
    pub fn new(active_threshold: u32, idle_threshold: u32) -> Self {
        Self {
            active_threshold,
            idle_threshold,
            active_count: 0,
            idle_count: 0,
            current_state: ActivityStatus::Idle,
        }
    }

    pub fn update(&mut self, is_active: bool) -> ActivityStatus {
        if is_active {
            self.active_count += 1;
            self.idle_count = 0;
            if self.active_count >= self.active_threshold {
                self.current_state = ActivityStatus::Active;
            }
        } else {
            self.idle_count += 1;
            self.active_count = 0;
            if self.idle_count >= self.idle_threshold {
                self.current_state = ActivityStatus::Idle;
            }
        }
        self.current_state.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transitions_to_active_after_threshold() {
        let mut d = ActivityDebouncer::new(3, 6);
        assert_eq!(d.update(true), ActivityStatus::Idle);
        assert_eq!(d.update(true), ActivityStatus::Idle);
        assert_eq!(d.update(true), ActivityStatus::Active);
    }

    #[test]
    fn test_transitions_to_idle_after_threshold() {
        let mut d = ActivityDebouncer::new(3, 6);
        // Become active first
        for _ in 0..3 {
            d.update(true);
        }
        // Now apply idle signals — need 6 consecutive
        for _ in 0..5 {
            d.update(false);
        }
        assert_eq!(d.update(false), ActivityStatus::Idle);
    }

    #[test]
    fn test_stays_active_before_idle_threshold() {
        let mut d = ActivityDebouncer::new(3, 6);
        for _ in 0..3 {
            d.update(true);
        }
        // 5 idle signals — not enough to flip
        for _ in 0..5 {
            d.update(false);
        }
        assert_eq!(d.current_state, ActivityStatus::Active);
    }

    #[test]
    fn test_resets_idle_count_on_active_signal() {
        let mut d = ActivityDebouncer::new(3, 6);
        for _ in 0..3 {
            d.update(true);
        }
        // 4 idle signals then 1 active — idle count resets
        for _ in 0..4 {
            d.update(false);
        }
        d.update(true);
        assert_eq!(d.idle_count, 0);
        assert_eq!(d.current_state, ActivityStatus::Active);
    }
}
