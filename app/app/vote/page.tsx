"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePolls } from "../lib/usePolls";

export default function VotePage() {
  const { poll, loading, error, hasVoted, vote } = usePolls();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState<string>("");

  // Timer effect to update the time remaining display
  useEffect(() => {
    if (!poll || !poll.isActive || !poll.endTime) return;
    
    // Don't show timer for unlimited polls (durationMinutes >= 1000000)
    if (poll.durationMinutes >= 1000000) {
      setTimeDisplay("Unlimited poll");
      return;
    }

    // Update time remaining initially
    updateTimeRemaining();

    // Set up interval to update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    // Function to calculate and update time remaining
    function updateTimeRemaining() {
      if (!poll || !poll.endTime) return;
      
      const timeLeft = Math.max(0, poll.endTime - Date.now());
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      
      setTimeDisplay(`Time remaining: ${minutes}:${seconds.toString().padStart(2, "0")}`);
      
      // Clear interval if time has run out
      if (timeLeft <= 0) {
        clearInterval(interval);
        setTimeDisplay("Poll has ended");
      }
    }

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [poll]);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOption) {
      setVoteError("Please select an option");
      return;
    }
    
    setIsSubmitting(true);
    setVoteError(null);
    
    const result = await vote(selectedOption);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setVoteSuccess(true);
    } else {
      setVoteError(result.error || "Failed to submit vote");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl">Loading poll...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-600">Error: {error}</p>
          <Link href="/" className="mt-4 text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // No active poll
  if (!poll || !poll.isActive) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">No Active Poll</h1>
          <p className="mb-6 text-gray-600">
            There is no active poll at the moment. Please check back later.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/" 
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Return Home
            </Link>
            <Link 
              href="/results" 
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              View Results
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // User already voted or just voted successfully
  if (hasVoted || voteSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-green-500 bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold">Thank You!</h1>
            <p className="text-gray-600">
              Your vote has been recorded successfully.
            </p>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-medium">{poll.title}</h2>
            <p className="text-sm text-gray-500">
              You have already voted in this poll.
            </p>
            {timeDisplay && (
              <p className="text-sm text-gray-500">{timeDisplay}</p>
            )}
          </div>
          
          <div className="mt-6 space-y-4">
            <Link 
              href="/results" 
              className="block w-full px-4 py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              View Results
            </Link>
            <Link 
              href="/" 
              className="block w-full px-4 py-2 text-center text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show voting form for active poll
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Cast Your Vote</h1>
        
        {voteError && (
          <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
            {voteError}
          </div>
        )}
        
        <form onSubmit={handleVote}>
          <div className="mb-6">
            <h2 className="mb-3 text-xl font-medium">{poll.title}</h2>
            {timeDisplay && (
              <p className="mb-3 text-sm text-gray-600">{timeDisplay}</p>
            )}
            
            <div className="space-y-2">
              {poll.options.map((option) => (
                <label key={option.id} className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="pollOption"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => setSelectedOption(option.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    required
                  />
                  <span className="ml-2">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !selectedOption}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSubmitting ? "Submitting..." : "Submit Vote"}
          </button>
          
          <div className="mt-4 text-center">
            <Link href="/results" className="text-sm text-blue-600 hover:underline">
              View current results without voting
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 