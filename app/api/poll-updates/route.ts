import { NextRequest } from "next/server";
import pollService from "../../lib/pollService";

// Server-Sent Events endpoint for real-time poll updates
export async function GET(req: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Function to send data to the client
  const sendData = (data: any) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  // Send initial poll state
  const initialPoll = pollService.getCurrentPoll();
  sendData({ poll: initialPoll });

  // Subscribe to poll updates
  const unsubscribe = pollService.subscribe((poll) => {
    sendData({ poll });
  });

  // Handle connection close
  req.signal.addEventListener("abort", () => {
    unsubscribe();
    writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// Disable body parsing for SSE
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";
export const preferredRegion = "auto"; 