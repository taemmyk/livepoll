"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePolls } from "../lib/usePolls";

// Define animations for vote popups
const animations = `
@keyframes popup {
  0% { opacity: 0; transform: scale(0.5) translateY(0); }
  20% { opacity: 1; transform: scale(1.5) translateY(-15px); }
  50% { opacity: 1; transform: scale(1.2) translateY(-20px); }
  100% { opacity: 0; transform: scale(1) translateY(-30px); }
}

@keyframes barGrow {
  0% { width: 0; }
  100% { width: 100%; }
}

.vote-popup {
  position: absolute;
  font-weight: bold;
  font-size: 3rem;
  animation: popup 1.5s forwards;
  z-index: 20;
  filter: drop-shadow(0 0 3px black);
}

.bar-grow {
  animation: barGrow 1s ease-out forwards;
}
`;

// Colors for bars - more vibrant colors for better TV visibility
const barColors = [
  { bg: "rgba(40, 150, 235, 0.85)", border: "rgb(25, 130, 220)", text: "white" }, // Blue
  { bg: "rgba(240, 70, 110, 0.85)", border: "rgb(220, 50, 90)", text: "white" }, // Pink
  { bg: "rgba(50, 180, 180, 0.85)", border: "rgb(30, 160, 160)", text: "white" }, // Teal
  { bg: "rgba(240, 190, 50, 0.85)", border: "rgb(220, 170, 30)", text: "black" }, // Yellow
  { bg: "rgba(140, 80, 240, 0.85)", border: "rgb(120, 60, 220)", text: "white" }, // Purple
  { bg: "rgba(240, 140, 40, 0.85)", border: "rgb(220, 120, 20)", text: "white" }, // Orange
];

export default function ResultsPage() {
  const { poll, loading, error } = usePolls();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [votePopups, setVotePopups] = useState<{index: number, value: number, id: string}[]>([]);
  const previousVotesRef = useRef<number[]>([]);
  const [animatingIndices, setAnimatingIndices] = useState<number[]>([]);
  const [timeDisplay, setTimeDisplay] = useState<string>("");

  // Track vote changes and add popups
  useEffect(() => {
    if (!poll) return;

    const currentVotes = poll.options.map(option => option.votes);
    
    if (previousVotesRef.current.length > 0) {
      // Find which options have new votes
      const changedIndices: number[] = [];
      const newPopups: {index: number, value: number, id: string}[] = [];
      
      currentVotes.forEach((votes, index) => {
        const previousVotes = previousVotesRef.current[index] || 0;
        const diff = votes - previousVotes;
        
        if (diff > 0) {
          changedIndices.push(index);
          
          // Create a popup for each new vote
          for (let i = 0; i < diff; i++) {
            newPopups.push({
              index,
              value: 1, // Always +1 for cartoonish effect
              id: `popup-${Date.now()}-${index}-${i}`,
            });
          }
        }
      });
      
      if (newPopups.length > 0) {
        // Trigger shake animation
        setAnimatingIndices(changedIndices);
        setVotePopups(prev => [...prev, ...newPopups]);
        
        // Clear shake animation after it completes
        setTimeout(() => {
          setAnimatingIndices([]);
        }, 500);
      }
    }
    
    // Store current votes for next comparison
    previousVotesRef.current = currentVotes;
  }, [poll]);

  // Remove popups after animation completes
  useEffect(() => {
    if (votePopups.length === 0) return;
    
    // Clear popups after 1.5 seconds (animation duration)
    const timeoutId = setTimeout(() => {
      setVotePopups([]);
    }, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [votePopups]);

  // Timer effect to update the time remaining display
  useEffect(() => {
    // Don't show timer for unlimited polls (durationMinutes >= 1000000)
    if (!poll || !poll.isActive || !poll.endTime || (poll && poll.durationMinutes >= 1000000)) {
      // For unlimited active polls, set a static message
      if (poll && poll.isActive && poll.durationMinutes >= 1000000) {
        setTimeDisplay("Unlimited poll");
      }
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

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-3xl font-bold">Loading poll results...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-3xl font-bold text-red-600">Error: {error}</p>
          <Link href="/" className="mt-8 text-2xl text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // No poll available
  if (!poll) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl p-12 text-center bg-white rounded-lg shadow-lg">
          <h1 className="mb-6 text-4xl font-bold">No Poll Available</h1>
          <p className="mb-8 text-2xl text-gray-600">
            There is no poll available at the moment.
          </p>
          <Link 
            href="/" 
            className="px-6 py-3 text-2xl text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total votes
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  
  // Calculate max votes for scaling
  const maxVotes = Math.max(...poll.options.map(option => option.votes), 1);

  // Calculate poll status
  let pollStatus = "";
  if (poll.isActive) {
    pollStatus = "Active";
  } else if (poll.endTime) {
    pollStatus = "Ended";
  } else {
    pollStatus = "Not started";
  }

  // Set initial time display for non-active polls
  if (!timeDisplay && poll) {
    if (poll.isActive && poll.durationMinutes >= 1000000) {
      setTimeDisplay("Unlimited poll");
    } else if (!poll.isActive && poll.endTime) {
      const endDate = new Date(poll.endTime);
      setTimeDisplay(`Ended at: ${endDate.toLocaleTimeString()}`);
    } else if (!poll.isActive) {
      setTimeDisplay("Not started");
    }
  }

  return (
    <>
      <style jsx global>{animations}</style>
      
      <div className="container p-6 mx-auto max-w-6xl h-screen">
        <div className="p-8 bg-white rounded-lg shadow-lg h-full flex flex-col">
          <div className="flex flex-col mb-6 md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-4xl font-bold">Poll Results</h1>
              <p className="mt-2 text-2xl text-gray-600">
                {timeDisplay}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <span className={`px-5 py-2 text-xl font-bold rounded-full ${
                poll.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {pollStatus}
              </span>
              <span className="ml-6 text-2xl font-semibold text-gray-700">
                {totalVotes} {totalVotes === 1 ? "vote" : "votes"} total
              </span>
            </div>
          </div>
          
          {/* Custom chart heading */}
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900">{poll.title}</h2>
          </div>
          
          {/* Custom chart container */}
          <div className="flex-grow relative overflow-hidden" ref={chartContainerRef}>
            <div className="h-full flex flex-col justify-around space-y-10 px-6">
              {poll.options.map((option, index) => {
                // Calculate percentage width based on votes (min 5% for visibility)
                const percentage = Math.max((option.votes / maxVotes * 85), 8);
                const colorIndex = index % barColors.length;
                const color = barColors[colorIndex];
                const isAnimating = animatingIndices.includes(index);
                
                // Calculate percentage text
                const votePercent = totalVotes > 0 
                  ? ((option.votes / totalVotes) * 100).toFixed(1) + '%' 
                  : '0%';
                  
                // Find popups for this option
                const optionPopups = votePopups.filter(popup => popup.index === index);
                
                return (
                  <div key={option.id} className="relative h-24">
                    {/* Background bar (light gray) */}
                    <div className="absolute inset-0 bg-gray-200 rounded-lg border border-gray-300"></div>
                    
                    {/* Actual colored bar with animation */}
                    <div 
                      className={`absolute top-0 bottom-0 left-0 rounded-lg transition-width duration-1000 ease-out ${isAnimating ? "animate-pulse" : ""}`}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color.bg,
                        borderRight: `5px solid ${color.border}`,
                      }}
                    >
                      {/* Option text inside the bar */}
                      <div className="absolute inset-0 flex items-center">
                        <span 
                          className={`ml-6 font-bold text-3xl truncate pr-4`}
                          style={{
                            color: color.text,
                            textShadow: color.text === 'white' ? 
                              '0 0 10px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.8)' : 
                              '0 0 8px rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.6)'
                          }}
                        >
                          {option.text}
                        </span>
                      </div>
                    </div>
                    
                    {/* Vote count and percentage display */}
                    <div className="absolute right-0 top-0 bottom-0 flex items-center">
                      <span className="mr-6 text-2xl font-bold text-gray-900">
                        {option.votes} ({votePercent})
                      </span>
                    </div>
                    
                    {/* Vote popups */}
                    {optionPopups.map(popup => (
                      <div 
                        key={popup.id}
                        className="vote-popup"
                        style={{
                          top: "-15px",
                          left: `${Math.min(percentage - 5, 95)}%`,
                          color: color.border,
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                        }}
                      >
                        +{popup.value}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-6">
            {poll.isActive && (
              <Link 
                href="/vote" 
                className="px-6 py-3 text-xl text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Cast Your Vote
              </Link>
            )}
            
            <Link 
              href="/" 
              className="px-6 py-3 text-xl text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 