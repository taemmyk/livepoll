# LivePoll

**LivePoll** is a real-time voting application prototype, rewritten from scratch. It lets users vote between two options, with live-updating results and a countdown timer controlled by the server. Built to explore **WebSocket**, **custom server in Next.js**, and **real-time UI**.

---

Deployed at: [https://livepoll-8hcv.onrender.com](https://livepoll-8hcv.onrender.com)

## 🛠️ Project Background

This repository was originally forked from [9arm's VibePoll repo](https://github.com/thananon/vibepoll).
However, after reviewing the original code, I decided to **start over from scratch**, using the same concept but rewriting:

- All frontend and backend code
- New architecture based on **Next.js 14 App Router**
- WebSocket instead of Server-Sent Events
  > The codebase has been fully replaced. The fork is kept only for historical reference.

## 🙌 Acknowledgments

- Thanks to the original [VibePoll project](https://www.youtube.com/watch?v=c8MVDTou5lw&t=575s) for the idea and interface inspiration.
- This repo is a personal rewrite with architectural changes and updated technologies for educational purpose.

## 🚀 Feature Roadmap

- **Real-time Updates**: WebSocket-powered, no page reloads
- **Countdown Timer**: Controlled by the server and synchronized across all clients
- **Live Chart**: Displays votes with animated bar chart using Chart.js
- **Start/End Poll Controls**: Admin can set poll duration and end it at any time
- **Deploy-ready**: Runs on Render.com using a custom Node.js server

| Feature                                                                                                     | Status     |
| ----------------------------------------------------------------------------------------------------------- | ---------- |
| **Real-time polling** with automatic updates: ~~via Server-Sent Events~~ WebSocket-powered, no page reloads | ✅ Done    |
| **Admin panel** with Google OAuth authentication                                                            | ⬜ Planned |
| **Interactive voting interface**: Displays votes with animated bar chart using Chart.js                     | ✅ Done    |
| **Dynamic results page** with animated visualization                                                        | ⬜ Planned |
| **Time limit poll controls**: Admin can set poll duration and end it at any time                            | ✅ Done    |
| **IP-based vote tracking** to prevent duplicate votes                                                       | ⬜ Planned |
| **Mobile-responsive design** for all devices                                                                | ✅ Done    |
| **Deploy-ready**: Runs on Render.com using a custom Node.js server                                          | ✅ Done    |

## 📦 Tech Stack

- [Next.js 15](https://nextjs.org/)
- [React 19](https://reactjs.org/)
- [WebSocket (ws)](https://github.com/websockets/ws)
- [Chart.js](https://www.chartjs.org/)
- [Render](https://render.com/) for deployment

## 🛠️ Getting Started

1. ### Install dependencies
   ```bash
   cd ../livepoll
   npm install
   ```
2. ### Run the app
   #### Development
   ```bash
   npm run dev
   ```
   You can override the port:
   ```bash
   PORT=3001 npm start
   ```
   - Runs the Next.js app and custom WebSocket server with hot-reloading
   - WebSocket server runs on the same port (default: localhost:3000)
   #### Build for Production
   ```bash
   npm run build
   ```
   This runs:
   - `next build` — Builds the frontend
   - `tsc -p tsconfig.server.json` — Compiles `server.ts` to `dist/server.js`
   #### Start in Production
   ```bash
   npm start
   ```

## ☁️ Deployment Notes

- The original VibePoll is designed for Vercel, but this version uses custom server, so it’s deployed on Render (Node environment).
- **Start command**: `npm run build && npm start`
- Set all secrets in Render dashboard
- LivePoll is deployed to Render with a custom Node.js server.

  ```yaml
  services:
  - type: web
     name: livepoll
     env: node
     buildCommand: npm install && npm run build
     startCommand: npm start
     envVars: - key: NODE_ENV
        value: production
        Render automatically detects the port from the server (process.env.PORT).
  ```
