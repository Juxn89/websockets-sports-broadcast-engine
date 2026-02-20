# Notes
## JS Mastery Assets
1. [GitHub: websocket-crash-course](https://github.com/JavaScript-Mastery-Pro/websocket-crash-course)
2. [GitHub: sportz-websockets](https://github.com/adrianhajdin/sportz-websockets)
3. [GitHub: sportz-frontend](https://github.com/JavaScript-Mastery-Pro/sportz-frontend)
4. [Assets - GDrive: Sportz (WebSockets)](https://drive.google.com/drive/folders/1eNN1YP6TdfqdCXjmpTSI9o6aXCeaZU4P)

## 🤖 IA
1. [Skills - The agent skills directory by Vecel](https://skills.sh/)
2. [Skills](https://agentskills.io/)
3. [AGENTS.md](https://agents.md/)

## 🛠️ Tools
1. [Neon - Fast Postgres Databases for Teams and Agents](https://neon.com/)

## Communication Patterns
1. Broadcast
2. Unicast
3. Multicast

## Technologies
### WebSockets
**WebSockets** provide a persistent, full-duplex (two-way) communication channel over a single TCP connection, enabling real-time, low-latency data exchange between clients (like browsers) and servers. Unlike HTTP, which requires new requests for each interaction, **WebSockets** keep the connection open, allowing the server to push updates immediately. They are ideal for live chat, gaming, and financial applications.

Two-way real-time apps
- ✅ Chat
- ✅ Collaboration
- ✅ Dashboard

### WebRTC (Web Real-Time Communication)
**WebRTC (Web Real-Time Communication)** is an open-source technology enabling web browsers and mobile applications to exchange audio, video, and arbitrary data directly between peers (P2P) in real-time without needing plugins. It leverages JavaScript APIs like getUserMedia() and RTCPeerConnection for high-quality, low-latency communication.

Heavy media, peer-to-peer
- ✅ Voice calls
- ✅ Video calls
- ✅ File transfers

### Webtransport
The **WebTransport** interface of the **WebTransport** API provides functionality to enable a user agent to connect to an HTTP/3 server, initiate reliable and unreliable transport in either or both directions, and close the connection once it is no longer needed.

Ultra low latency streaming
- ✅ High-performance
- ✅ Real-time systems

### Server-Sent Events (SSE)
**Server-Sent Events (SSE)** is a web technology that enables a server to push real-time updates to a client over a single, persistent HTTP connection. This is a one-way (unidirectional) communication channel, ideal for scenarios where the client primarily needs to receive updates from the server, such as live data feeds, notifications, and stock prices.

One-way server updates
- ✅ Tckers
- ✅ Feeds
- ✅ Streaming data

### 🤔 Basic questions
1. 🔀 **Does the server need to push updates?**

|**Answers**|**Best option**|
|----------|---------------|
|Yes ✅|**SSE**, **WebSockets**|

2. 🔀 **Does the client need to talk back?**

|**Answers**|**Best option**|
|----------|---------------|
|Yes ✅|**WebSockets**|

2. 🔀 **Is it heavy audio/video or huge data?**

|**Answers**|**Best option**|
|----------|---------------|
|Yes ✅|**WebRTC**|

## Useful links
### Repositories
1. [A collection of **.gitignore** templates](https://github.com/github/gitignore)