"use client";

import { useState, useEffect } from "react";
import { Poll } from "./pollService";

// Hook to handle real-time poll updates
export function usePolls() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Fetch initial poll data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current poll
        const response = await fetch("/api/poll");
        if (!response.ok) {
          throw new Error("Failed to fetch poll data");
        }
        
        const data = await response.json();
        setPoll(data.poll);
        
        // Check if user has voted
        const voteResponse = await fetch("/api/vote");
        if (voteResponse.ok) {
          const voteData = await voteResponse.json();
          setHasVoted(voteData.hasVoted);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching poll:", error);
        setError("Failed to load poll data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const eventSource = new EventSource("/api/poll-updates");
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPoll(data.poll);
    };
    
    eventSource.onerror = () => {
      eventSource.close();
      setError("Real-time connection failed");
    };
    
    return () => {
      eventSource.close();
    };
  }, []);

  // Vote in poll
  const vote = async (optionId: string) => {
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to vote");
      }
      
      // Update vote status
      setHasVoted(true);
      
      return { success: true };
    } catch (error: any) {
      console.error("Error voting:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    poll,
    loading,
    error,
    hasVoted,
    vote,
  };
} 