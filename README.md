<div align="center">
  <img width="400"  alt="proxybeast-gif" src="https://github.com/user-attachments/assets/c6ddb867-d918-445c-a715-32466bb590dc" />
</div>

# Proxybeast

ProxyBeast is a powerful, complete and free proxy checker with zero dependency and advanced capabilities.

#### Features
- High-performance
- Reliable
- Supports all proxy protocols (HTTP/HTTPS, SOCKS4/SOCKS5)
- Proxy anonimity level
- Proxy latency
- ``User/Pass`` and ``NoAuth`` negotiations supported
- Ease of use
- Small bundle size
  

> Check out the proxy client crate we made for ProxyBeast-v2 <br>
> [proxifier-rs crate](https://github.com/z3ntl3/proxifier-rs)


#### Awesome ProxyBeast-v2

##### Did you know?
- ProxyBeast has a ``LiveLog`` pane in the GUI, which shows all the neccessary logs. This was realised using ``Tokio-Tracing``. Specifically by composing multiple [Layer](https://docs.rs/tracing-subscriber/latest/tracing_subscriber/layer/index.html)'s together. One [Layer](https://docs.rs/tracing-subscriber/latest/tracing_subscriber/layer/index.html)'s responsibility is to watch log event data and send it efficiently to the GUI.

<img width="200" alt="image" src="https://github.com/user-attachments/assets/5dd2861a-fd6f-4b95-adbe-c2f5f1a90e4d" />


- ProxyBeast has it's own proxy client library implementation. It's based on ``CONNECT`` methods and allows for proxy relay to a destination target. Read more about it [here](https://github.com/z3ntl3/proxifier-rs)
