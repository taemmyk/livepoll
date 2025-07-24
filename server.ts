import next from "next";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const votes: Record<"A" | "B", number> = { A: 0, B: 0 };
let countdown = 3 * 60; // 3 min

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server });

  const interval = setInterval(() => {
    const message = JSON.stringify({ type: "countdown", time: countdown });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });

    if (countdown <= 0) {
      clearInterval(interval);
    } else {
      countdown--;
    }
  }, 1000);

  wss.on("connection", (ws) => {
    console.log("🤝 Client connected");
    ws.send(JSON.stringify({ type: "update", votes }));
    ws.send(JSON.stringify({ type: "countdown", time: countdown }));

    ws.on("message", (msg) => {
      const data = JSON.parse(msg.toString()) as {
        type: string;
        option?: "A" | "B";
      };
      if (
        data.type === "vote" &&
        (data.option === "A" || data.option === "B")
      ) {
        votes[data.option]++;

        const update = JSON.stringify({ type: "update", votes });

        wss?.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(update);
          }
        });
      }
    });

    ws.on("close", () => {
      console.log("👋 Client disconnected");
    });
  });

  server.listen(3000, () => {
    console.log("WS Ready on http://localhost:3000");
  });
});
