"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Poll } from "../lib/pollService";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if user is loading auth state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and is an admin
  if (!session || !session.user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Admin Access Required</h1>
            <p className="mt-2 text-gray-600">
              Please sign in with an authorized Google account to access the admin panel
            </p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => signIn("google", { callbackUrl: "/admin" })}
              className="flex items-center justify-center w-full px-4 py-3 space-x-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
              </svg>
              <span>Sign in with Google</span>
            </button>
            
            <Link 
              href="/" 
              className="px-4 py-2 text-center text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin is authenticated, show poll management UI
  return <PollManagement user={session.user} />;
}

function PollManagement({ user }: { user: any }) {
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch current poll data
  const fetchPollData = async () => {
    try {
      const response = await fetch("/api/poll");
      
      if (!response.ok) {
        throw new Error("Failed to fetch poll data");
      }
      
      const data = await response.json();
      setCurrentPoll(data.poll);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching poll:", error);
      setError("Failed to load poll data");
      setIsLoading(false);
    }
  };

  // Set up SSE for real-time updates
  useEffect(() => {
    fetchPollData();
    
    // Subscribe to real-time updates
    const eventSource = new EventSource("/api/poll-updates");
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCurrentPoll(data.poll);
    };
    
    eventSource.onerror = () => {
      eventSource.close();
      setError("Real-time connection failed");
    };
    
    return () => {
      eventSource.close();
    };
  }, []);

  const handleCreateNewPoll = () => {
    setShowCreateForm(true);
  };

  const handlePollCreated = () => {
    setShowCreateForm(false);
    fetchPollData();
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const canCreateNewPoll = !currentPoll || (currentPoll && !currentPoll.isActive);

  return (
    <div className="container p-8 mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Poll Management</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Signed in as <span className="font-medium">{user.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Show poll creation form if no poll exists or if we're explicitly showing it */}
      {(!currentPoll || showCreateForm) && (
        <div className="mb-8">
          <PollCreationForm onPollCreated={handlePollCreated} />
        </div>
      )}
      
      {/* Show create new poll button if a poll exists and we're not showing the form */}
      {currentPoll && !showCreateForm && canCreateNewPoll && (
        <div className="mb-8">
          <button
            onClick={handleCreateNewPoll}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Create New Poll
          </button>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">Current Poll</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <CurrentPollStatus 
            poll={currentPoll} 
            onPollUpdated={fetchPollData} 
          />
        )}
      </div>
    </div>
  );
}

interface PollCreationFormProps {
  onPollCreated: () => void;
}

function PollCreationForm({ onPollCreated }: PollCreationFormProps) {
  const [pollTitle, setPollTitle] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [duration, setDuration] = useState<"1" | "2" | "custom" | "unlimited">("1");
  const [customDuration, setCustomDuration] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...pollOptions];
    newOptions.splice(index, 1);
    setPollOptions(newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Filter out empty options
    const filteredOptions = pollOptions.filter(opt => opt.trim() !== "");
    
    if (filteredOptions.length < 2) {
      setError("At least two poll options are required");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Use a very large number (e.g., 1000000) for unlimited duration
      const durationValue = duration === "unlimited" ? 1000000 : (duration === "custom" ? customDuration : parseInt(duration));
      
      const response = await fetch("/api/poll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: pollTitle,
          options: filteredOptions,
          durationMinutes: durationValue,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create poll");
      }
      
      // Reset form
      setPollTitle("");
      setPollOptions(["", ""]);
      setDuration("1");
      setCustomDuration(5);
      
      // Refresh poll data
      onPollCreated();
    } catch (error: any) {
      console.error("Error creating poll:", error);
      setError(error.message || "Failed to create poll");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-xl font-semibold">Create New Poll</h2>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="pollTitle" className="block mb-2 text-sm font-medium text-gray-700">
            Poll Question
          </label>
          <input
            type="text"
            id="pollTitle"
            value={pollTitle}
            onChange={(e) => setPollTitle(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., What's your favorite color?"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Poll Options
          </label>
          
          {pollOptions.map((option, index) => (
            <div key={index} className="flex mb-2 gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md"
                placeholder={`Option ${index + 1}`}
                required
              />
              
              {pollOptions.length > 2 && (
                <button 
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addOption}
            className="px-4 py-2 mt-2 text-sm text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
          >
            + Add Option
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Poll Duration
          </label>
          
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="unlimited"
                checked={duration === "unlimited"}
                onChange={() => setDuration("unlimited")}
                className="mr-2"
              />
              Unlimited
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                value="1"
                checked={duration === "1"}
                onChange={() => setDuration("1")}
                className="mr-2"
              />
              1 minute
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                value="2"
                checked={duration === "2"}
                onChange={() => setDuration("2")}
                className="mr-2"
              />
              2 minutes
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                value="custom"
                checked={duration === "custom"}
                onChange={() => setDuration("custom")}
                className="mr-2"
              />
              Custom
            </label>
            
            {duration === "custom" && (
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(parseInt(e.target.value) || 1)}
                  className="w-16 p-1 border border-gray-300 rounded-md"
                />
                <span className="ml-2">minutes</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? "Creating..." : "Create Poll"}
        </button>
      </form>
    </div>
  );
}

interface CurrentPollStatusProps {
  poll: Poll | null;
  onPollUpdated: () => void;
}

function CurrentPollStatus({ poll, onPollUpdated }: CurrentPollStatusProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isUnlimitedPoll, setIsUnlimitedPoll] = useState(false);

  // Calculate time remaining for an active poll
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  
  useEffect(() => {
    if (!poll) return;
    
    // Check if this is an unlimited poll (durationMinutes is very large)
    setIsUnlimitedPoll(poll.durationMinutes >= 1000000);
    
    // Don't set up timer for unlimited polls or inactive polls
    if (!poll.isActive || !poll.endTime || poll.durationMinutes >= 1000000) return;
    
    const updateTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, poll.endTime! - now);
      
      if (remaining <= 0) {
        setTimeRemaining("Ended");
        return;
      }
      
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [poll]);

  const handlePollControl = async () => {
    if (!poll) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const action = poll.isActive ? "end" : "start";
      
      if (poll.isActive && !confirm("Are you sure you want to end the current poll?")) {
        setIsUpdating(false);
        return;
      }
      
      const response = await fetch("/api/poll", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} poll`);
      }
      
      // Refresh poll data
      onPollUpdated();
    } catch (error: any) {
      console.error(`Error ${poll.isActive ? "ending" : "starting"} poll:`, error);
      setError(error.message || `Failed to ${poll.isActive ? "end" : "start"} poll`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Simulate a vote for a specific option
  const handleSimulateVote = async (optionId: string) => {
    if (!poll || !poll.isActive) return;
    
    setIsVoting(true);
    setVoteMessage(null);
    
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Simulation": "true", // This is a hint that it's a simulated vote
        },
        body: JSON.stringify({ optionId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to simulate vote");
      }
      
      const data = await response.json();
      setVoteMessage(`Vote simulated: ${data.message}`);
      
      // No need to refresh poll data as we should receive real-time updates
    } catch (error: any) {
      console.error("Error simulating vote:", error);
      setError(error.message || "Failed to simulate vote");
    } finally {
      setIsVoting(false);
      // Clear vote message after 3 seconds
      setTimeout(() => setVoteMessage(null), 3000);
    }
  };

  // Toggle results visibility
  const toggleResults = () => {
    setShowResults(!showResults);
  };

  if (!poll) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <p className="mb-4 text-gray-600">No poll has been created yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {error && (
        <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      {voteMessage && (
        <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 rounded-md">
          {voteMessage}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Current Poll</h3>
        {poll.isActive ? (
          <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
            Active
          </span>
        ) : poll.endTime ? (
          <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded-full">
            Ended
          </span>
        ) : (
          <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">
            Ready
          </span>
        )}
      </div>
      
      <p className="mb-4 text-xl font-bold text-black">{poll.title}</p>
      
      <div className="mb-6">
        <h4 className="mb-2 font-medium text-gray-700">Poll Options:</h4>
        <ul className="space-y-3">
          {poll.options.map((option) => (
            <li key={option.id} className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="mr-2 text-lg font-bold text-black">{option.text}</span>
                <span className="text-base font-medium text-gray-800">{option.votes} votes</span>
              </div>
              {poll.isActive && (
                <button
                  onClick={() => handleSimulateVote(option.id)}
                  disabled={isVoting}
                  className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isVoting ? "Voting..." : "Simulate Vote"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        {poll.isActive && !isUnlimitedPoll && (
          <span className="text-sm text-gray-600">
            Time remaining: {timeRemaining}
          </span>
        )}
        {poll.isActive && isUnlimitedPoll && (
          <span className="text-sm text-gray-600">
            Unlimited duration
          </span>
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={handlePollControl}
            disabled={isUpdating}
            className={`px-4 py-2 text-white rounded-md ${
              poll.isActive
                ? "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
                : "bg-green-600 hover:bg-green-700 disabled:bg-green-300"
            }`}
          >
            {isUpdating
              ? (poll.isActive ? "Ending..." : "Starting...")
              : (poll.isActive ? "End Poll Now" : "Start Poll")}
          </button>
          
          <button
            onClick={toggleResults}
            className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            {showResults ? "Hide Results" : "Show Results"}
          </button>
        </div>
      </div>
      
      {showResults && (
        <div className="mt-8 border-t pt-6">
          <h3 className="mb-4 text-lg font-medium">Live Results Preview</h3>
          <div className="border rounded-lg overflow-hidden" style={{ height: "600px" }}>
            <iframe
              src="/results"
              className="w-full h-full"
              title="Poll Results"
            />
          </div>
        </div>
      )}
    </div>
  );
} 
