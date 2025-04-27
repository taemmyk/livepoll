"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication";

  if (error === "AccessDenied") {
    errorMessage = "You are not authorized to access the admin area";
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-red-500 bg-red-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mb-4 text-2xl font-bold text-red-600">Authentication Error</h1>
          <p className="mb-6 text-gray-600">
            {errorMessage}
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Link 
            href="/auth/signin" 
            className="px-4 py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Try Again
          </Link>
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