"use client";

import { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJs,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJs.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  ChartDataLabels
);

type VoteData = {
  A: number;
  B: number;
};

export default function VoteClient() {
  const [votes, setVotes] = useState<VoteData>({ A: 0, B: 0 });
  const wsRef = useRef<WebSocket | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [canVote, setCanVote] = useState(false);
  const [pollDuration, setPollDuration] = useState<number>(0);
  const [votesTotal, setVotesTotal] = useState<number>(0);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (
        data.type === "init" ||
        data.type === "update" ||
        data.type === "start" ||
        data.type === "tick" ||
        data.type === "end"
      ) {
        if (data.votes) setVotes(data.votes);
        if (typeof data.pollSeconds === "number") setTimeLeft(data.pollSeconds);
        if (typeof data.votesTotal === "number") setVotesTotal(data.votesTotal);
        setCanVote(data.isPollActive && data.pollSeconds > 0);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendVote = (option: "A" | "B") => {
    if (!canVote) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "vote", option }));
    }
  };

  const chartData = {
    labels: ["Option A", "Option B"],
    datasets: [
      {
        data: [votes.A, votes.B],
        backgroundColor: ["#007bff", "#dc3545"],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    layout: {
      padding: {
        top: 10,
        right: 40,
        bottom: 10,
        left: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      datalabels: {
        color: "#000",
        anchor: "end" as const,
        align: "center" as const,
        formatter: (value: number) => {
          const percent =
            votesTotal > 0 ? ((value / votesTotal) * 100).toFixed(1) : "0.0";
          return `${value} (${percent}%)`;
        },
        font: {
          weight: "bold" as const,
          size: 20,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          font: {
            size: 20,
            weight: "bold" as const,
          },
          color: "#333",
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
      x: {
        display: false,
        beginAtZero: true,
        max: votesTotal || 1,
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
  };

  function formatTime(sec: number): string {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      <div className="flex gap-2 items-center justify-center">
        <input
          type="number"
          value={pollDuration}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value)) setPollDuration(value);
          }}
          className="w-24 px-2 py-1 border rounded text-neutral-700"
          min={1}
          step={1}
        />
        <span className="text-neutral-700">minutes</span>
        <button
          disabled={canVote}
          onClick={() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({ type: "start", duration: pollDuration })
              );
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Poll
        </button>

        <button
          onClick={() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: "end" }));
            }
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          End Poll Countdown
        </button>
      </div>

      <div className="text-center text-lg font-medium text-neutral-700">
        {canVote ? `Poll ends in: ${formatTime(timeLeft)}` : "Closed"}
      </div>
      <div className="text-center text-neutral-600 text-sm">
        <strong>{votesTotal}</strong> votes total
      </div>

      <div className="flex justify-center gap-4">
        <button
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-neutral-50 font-semibold rounded-lg shadow-md transition"
          onClick={() => sendVote("A")}
          disabled={!canVote}
        >
          Vote A
        </button>
        <button
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-neutral-50 font-semibold rounded-lg shadow-md transition"
          onClick={() => sendVote("B")}
          disabled={!canVote}
        >
          Vote B
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
