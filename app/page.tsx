import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-4xl font-bold text-center">VibePoll</h1>
      <p className="text-xl text-center max-w-2xl">
        Real-time interactive polling platform
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link 
          href="/vote" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Vote in Current Poll
        </Link>
        
        <Link 
          href="/results" 
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          View Results
        </Link>
        
        <Link 
          href="/admin" 
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Admin Panel
        </Link>
      </div>
    </div>
  );
}
