import { NextRequest, NextResponse } from "next/server";
import pollService from "../../lib/pollService";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";

// Utility function to check if a user is an admin
async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin === true;
}

// Legacy API key validation (will be deprecated)
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "vibepoll-admin-secret";
function validateApiKey(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  
  const token = authHeader.split(" ")[1];
  return token === ADMIN_API_KEY;
}

// Validate admin authentication (using either session or API key during transition)
async function validateAdminAuth(req: NextRequest) {
  // First, check for session-based auth (preferred)
  if (await isAdmin(req)) {
    return true;
  }
  
  // Fall back to API key auth (legacy)
  return validateApiKey(req);
}

// Get current poll
export async function GET(req: NextRequest) {
  const poll = pollService.getCurrentPoll();
  
  // Hide sensitive data for public endpoints
  if (poll) {
    // Don't expose voter IPs to clients
    return NextResponse.json({ poll });
  }
  
  return NextResponse.json({ poll: null });
}

// Create a new poll (admin only)
export async function POST(req: NextRequest) {
  // Validate admin authentication
  if (!(await validateAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const { title, options, durationMinutes } = body;
    
    // Validate inputs
    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "Invalid poll data. Title and at least 2 options are required." },
        { status: 400 }
      );
    }
    
    if (!durationMinutes || isNaN(Number(durationMinutes)) || durationMinutes < 1) {
      return NextResponse.json(
        { error: "Invalid duration. Must be a positive number." },
        { status: 400 }
      );
    }
    
    // Create poll
    const poll = pollService.createPoll(title, options, Number(durationMinutes));
    
    return NextResponse.json({ success: true, poll });
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { error: "Failed to create poll" },
      { status: 500 }
    );
  }
}

// Start/end poll (admin only)
export async function PATCH(req: NextRequest) {
  // Validate admin authentication
  if (!(await validateAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const { action } = body;
    
    if (action === "start") {
      const poll = pollService.startPoll();
      if (!poll) {
        return NextResponse.json(
          { error: "No poll available to start" },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, poll });
    }
    
    if (action === "end") {
      const poll = pollService.endPoll();
      if (!poll) {
        return NextResponse.json(
          { error: "No active poll to end" },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, poll });
    }
    
    return NextResponse.json(
      { error: "Invalid action. Use 'start' or 'end'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating poll:", error);
    return NextResponse.json(
      { error: "Failed to update poll" },
      { status: 500 }
    );
  }
} 