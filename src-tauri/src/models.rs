use serde::{Deserialize, Serialize};
use serde_with::{DisplayFromStr, DurationMilliSeconds, serde_as};
use std::time::Duration;

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
pub enum Scheme {
    URI,
    MULTI,
    HTTP,
    HTTPS,
    SOCKS4,
    SOCKS5,
}

impl std::fmt::Display for Scheme {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Scheme::URI => write!(f, "URI"),
            Scheme::MULTI => write!(f, "MULTI"),
            Scheme::HTTP => write!(f, "HTTP"),
            Scheme::HTTPS => write!(f, "HTTPS"),
            Scheme::SOCKS4 => write!(f, "SOCKS4"),
            Scheme::SOCKS5 => write!(f, "SOCKS5"),
        }
    }
}

impl core::str::FromStr for Scheme {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s {
            "URI" => Scheme::URI,
            "MULTI" => Scheme::MULTI,
            "HTTP" => Scheme::HTTP,
            "HTTPS" => Scheme::HTTPS,
            "SOCKS4" => Scheme::SOCKS4,
            "SOCKS5" => Scheme::SOCKS5,
            _ => Scheme::URI,
        })
    }
}

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

    #[serde_as(as = "DisplayFromStr")]
    #[serde(
        default = "default_scheme",
        rename(serialize = "scheme", deserialize = "scheme")
    )]
    pub enforce_scheme: Scheme,

    #[serde(default = "default_tls")]
    pub use_tls: bool,
    #[serde(default = "default_retry")]
    pub retry: bool,
}

fn default_judge() -> String {
    "google.com".into()
}

fn default_scheme() -> Scheme {
    Scheme::URI
}

fn default_tls() -> bool {
    true
}

fn default_retry() -> bool {
    true
}
