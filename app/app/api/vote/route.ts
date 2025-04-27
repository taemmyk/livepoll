import { NextRequest, NextResponse } from "next/server";
import pollService from "../../lib/pollService";

// Vote in a poll
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { optionId } = body;
    
    if (!optionId) {
      return NextResponse.json(
        { error: "Option ID is required" },
        { status: 400 }
      );
    }
    
    // Check if this is a simulated vote from the admin panel
    const isAdminSimulation = req.headers.get("X-Admin-Simulation") === "true";
    
    // For admin simulations, use a unique IP for each simulation to bypass duplicate vote check
    // For regular votes, get voter IP from the request
    let ip;
    if (isAdminSimulation) {
      // Generate a unique "fake" IP for each simulated vote
      ip = `admin-sim-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    } else {
      const forwardedFor = req.headers.get("x-forwarded-for");
      ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
    }
    
    // Record the vote
    const result = pollService.vote(optionId, ip);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json(
      { error: "Failed to record vote" },
      { status: 500 }
    );
  }
}

// Check if user has voted
export async function GET(req: NextRequest) {
  // Get voter IP from the request
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
  
  const hasVoted = pollService.hasVoted(ip);
  
  return NextResponse.json({ hasVoted });
} 