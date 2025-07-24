import VoteClient from "@/components/vote-client";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 max-w-full py-10 font-sans">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        LiveVote WebApp
      </h1>
      <VoteClient />
    </main>
  );
}