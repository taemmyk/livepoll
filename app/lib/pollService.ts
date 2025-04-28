import { EventEmitter } from "events";

// Types
export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type Poll = {
  id: string;
  title: string;
  options: PollOption[];
  startTime: number | null;
  endTime: number | null;
  isActive: boolean;
  durationMinutes: number;
};

type VoterInfo = {
  ip: string;
  timestamp: number;
  optionId: string;
};

// Singleton class to maintain poll state
class PollService {
  private static instance: PollService;
  private currentPoll: Poll | null = null;
  private voters: VoterInfo[] = [];
  private eventEmitter: EventEmitter;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(1000); // Support many concurrent connections
  }

  public static getInstance(): PollService {
    if (!PollService.instance) {
      PollService.instance = new PollService();
    }
    return PollService.instance;
  }

  // Create a new poll
  public createPoll(title: string, options: string[], durationMinutes: number): Poll {
    // Force end any active poll before creating a new one
    if (this.currentPoll && this.currentPoll.isActive) {
      this.endPoll();
    }
    
    // Generate unique IDs for poll and options
    const pollId = Date.now().toString();
    
    const pollOptions: PollOption[] = options.map((text) => ({
      id: Math.random().toString(36).substring(2, 9), // Simple ID generation
      text,
      votes: 0,
    }));

    const newPoll: Poll = {
      id: pollId,
      title,
      options: pollOptions,
      startTime: null,
      endTime: null,
      isActive: false,
      durationMinutes,
    };

    this.currentPoll = newPoll;
    this.voters = []; // Reset voters for new poll
    
    // Emit event for listeners
    this.eventEmitter.emit("poll-updated", this.currentPoll);
    
    return newPoll;
  }

  // Start the current poll
  public startPoll(): Poll | null {
    if (!this.currentPoll) {
      return null;
    }

    const now = Date.now();
    const durationMs = this.currentPoll.durationMinutes * 60 * 1000;
    
    this.currentPoll = {
      ...this.currentPoll,
      startTime: now,
      endTime: now + durationMs,
      isActive: true,
    };

    // Emit event for listeners
    this.eventEmitter.emit("poll-updated", this.currentPoll);
    
    // Set up automatic poll ending for non-unlimited polls
    if (this.currentPoll.durationMinutes < 1000000) {
      setTimeout(() => {
        this.endPoll();
      }, durationMs);
    }

    return this.currentPoll;
  }

  // End the current poll
  public endPoll(): Poll | null {
    if (!this.currentPoll || !this.currentPoll.isActive) {
      return null;
    }

    this.currentPoll = {
      ...this.currentPoll,
      isActive: false,
      endTime: Date.now(),
    };

    // Emit event for listeners
    this.eventEmitter.emit("poll-updated", this.currentPoll);
    
    return this.currentPoll;
  }

  // Record a vote
  public vote(optionId: string, voterIp: string): { success: boolean; message: string } {
    if (!this.currentPoll || !this.currentPoll.isActive) {
      return { success: false, message: "No active poll" };
    }

    // Check if this IP already voted in this poll
    const hasVoted = this.voters.some((voter) => voter.ip === voterIp);
    if (hasVoted) {
      return { success: false, message: "You have already voted in this poll" };
    }

    // Find the option
    const option = this.currentPoll.options.find((opt) => opt.id === optionId);
    if (!option) {
      return { success: false, message: "Invalid option" };
    }

    // Record vote
    option.votes++;
    
    // Record voter info
    this.voters.push({
      ip: voterIp,
      timestamp: Date.now(),
      optionId,
    });

    // Emit event for listeners
    this.eventEmitter.emit("poll-updated", this.currentPoll);
    
    return { success: true, message: "Vote recorded" };
  }

  // Get current poll
  public getCurrentPoll(): Poll | null {
    return this.currentPoll;
  }

  // Check if a voter has voted in the current poll
  public hasVoted(voterIp: string): boolean {
    if (!this.currentPoll) {
      return false;
    }
    
    return this.voters.some((voter) => voter.ip === voterIp);
  }

  // Subscribe to poll updates
  public subscribe(callback: (poll: Poll | null) => void): () => void {
    this.eventEmitter.on("poll-updated", callback);
    
    // Return unsubscribe function
    return () => {
      this.eventEmitter.off("poll-updated", callback);
    };
  }
}

export default PollService.getInstance(); 