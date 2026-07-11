use serde::{Deserialize, Serialize};
use serde_with::{DurationMilliSeconds, serde_as};
use std::time::Duration;

#[serde_as]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppConfig {
    #[serde(rename(serialize = "poolSize", deserialize = "poolSize"))]
    pub pool_size: u64,

    #[serde_as(as = "DurationMilliSeconds<u64>")]
    #[serde(rename(serialize = "timeoutMS", deserialize = "timeoutMS"))]
    pub timeout: Duration,

    // Fields with defaults
    #[serde(default = "default_judge")]
    pub judge: String,
    #[serde(
        default = "default_scheme",
        rename(serialize = "scheme", deserialize = "scheme")
    )]
    pub enforce_scheme: String,

    #[serde(default = "default_tls")]
    pub use_tls: bool,
    #[serde(default = "default_retry")]
    pub retry: bool,
}

fn default_judge() -> String {
    "google.com".into()
}

fn default_scheme() -> String {
    "uri".into()
}

fn default_tls() -> bool {
    true
}

fn default_retry() -> bool {
    true
}
