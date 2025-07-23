"use client";

import { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJs,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJs.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type VoteData = {
  A: number;
  B: number;
};

export default function VoteClient() {
  const [votes, setVotes] = useState<VoteData>({ A: 0, B: 0 });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "update") {
        setVotes(data.votes);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendVote = (option: "A" | "B") => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "vote", option }));
    }
  };

  const chartData = {
    labels: ["Option A", "Option B"],
    datasets: [
      {
        label: "Votes",
        data: [votes.A, votes.B],
        backgroundColor: ["#007bff", "#dc3545"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex justify-center gap-4">
        <button
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-neutral-50 font-semibold rounded-lg shadow-md transition"
          onClick={() => sendVote("A")}
        >
          Vote A
        </button>
        <button
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-neutral-50 font-semibold rounded-lg shadow-md transition"
          onClick={() => sendVote("B")}
        >
          Vote B
        </button>
      </div>

      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
