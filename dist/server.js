"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const next_1 = __importDefault(require("next"));
const http_1 = require("http");
const ws_1 = require("ws");
const url_1 = require("url");
const dev = process.env.NODE_ENV !== "production";
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
const votes = { A: 0, B: 0 };
let isPollActive = false;
let pollSeconds = 0;
let interval = null;
let votesTotal = 0;
app.prepare().then(() => {
    const server = (0, http_1.createServer)((req, res) => {
        const parsedUrl = (0, url_1.parse)(req.url, true);
        handle(req, res, parsedUrl);
    });
    const wss = new ws_1.WebSocketServer({ server });
    function broadcast(data) {
        const msg = JSON.stringify(data);
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(msg);
            }
        });
    }
    wss.on("connection", (ws) => {
        console.log("🤝 Client connected");
        ws.send(JSON.stringify({
            type: "init",
            votes,
            isPollActive,
            pollSeconds,
        }));
        ws.on("message", (msg) => {
            const data = JSON.parse(msg.toString());
            // send vote
            if (data.type === "vote" &&
                isPollActive &&
                (data.option === "A" || data.option === "B")) {
                votes[data.option]++;
                votesTotal++;
                broadcast({
                    type: "update",
                    votes,
                    isPollActive,
                    pollSeconds,
                    votesTotal,
                });
            }
            // start poll
            if (data.type === "start" && typeof data.duration === "number") {
                if (!Number.isFinite(data.duration) || data.duration <= 0)
                    return;
                isPollActive = true;
                pollSeconds = data.duration * 60; // minutes
                votes.A = 0;
                votes.B = 0;
                votesTotal = 0;
                if (interval)
                    clearInterval(interval);
                interval = setInterval(() => {
                    if (pollSeconds <= 0) {
                        isPollActive = false;
                        clearInterval(interval);
                        interval = null;
                        broadcast({
                            type: "end",
                            votes,
                            isPollActive,
                            pollCountdown: 0,
                            votesTotal,
                        });
                    }
                    else {
                        pollSeconds--;
                        broadcast({
                            type: "tick",
                            votes,
                            isPollActive,
                            pollSeconds,
                            votesTotal,
                        });
                    }
                }, 1000);
                broadcast({
                    type: "start",
                    votes,
                    isPollActive,
                    pollSeconds,
                    votesTotal,
                });
            }
            // end poll
            if (data.type === "end") {
                if (interval)
                    clearInterval(interval);
                pollSeconds = 5;
                interval = setInterval(() => {
                    if (pollSeconds <= 0) {
                        clearInterval(interval);
                        interval = null;
                        broadcast({
                            type: "end",
                            votes,
                            isPollActive,
                            pollSeconds: 0,
                            votesTotal,
                        });
                    }
                    else {
                        pollSeconds--;
                        broadcast({
                            type: "tick",
                            votes,
                            isPollActive,
                            pollSeconds,
                            votesTotal,
                        });
                    }
                }, 1000);
            }
        });
        ws.on("close", () => {
            console.log("👋 Client disconnected");
        });
    });
    const port = parseInt(process.env.PORT || "3000", 10);
    server.listen(port, () => {
        console.log(`✅ Server ready at http://localhost:${port}`);
    });
});
