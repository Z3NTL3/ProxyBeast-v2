use serde::{Deserialize, Serialize};
use serde_with::{DurationMilliSeconds, serde_as};
use std::time::Duration;

#[serde_as]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppConfig {
    #[serde(rename(serialize = "poolSize", deserialize = "poolSize"))]
    pub pool_size: u64,
    #[serde(rename(serialize = "timeoutMS", deserialize = "timeoutMS"))]
    #[serde_as(as = "DurationMilliSeconds<u64>")]
    pub timeout: Duration,
    pub judge: String,
}
