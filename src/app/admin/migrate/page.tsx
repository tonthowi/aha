"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MigratePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [secretKey, setSecretKey] = useState("");

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="mb-4">You need to be logged in to access this page.</p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const runMigration = async () => {
    if (!secretKey) {
      toast.error("Please enter the migration secret key");
      return;
    }

    try {
      setIsLoading(true);
      setResults(null);

      const response = await fetch(`/api/migrate-posts?key=${encodeURIComponent(secretKey)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Migration failed");
      }

      setResults(data);
      toast.success("Migration completed successfully");
    } catch (error: any) {
      console.error("Migration error:", error);
      toast.error(error.message || "Failed to run migration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Post Migration Tool</h1>
        <p className="mb-4 text-gray-600">
          This tool will update all existing posts to include the authorId field,
          which is necessary for proper ownership detection in the application.
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">
            <strong>Warning:</strong> This is a one-time migration. Running it multiple times
            is safe but unnecessary. Make sure you have a backup of your data before proceeding.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 mb-1">
            Migration Secret Key
          </label>
          <input
            type="password"
            id="secretKey"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter the migration secret key"
          />
        </div>

        <button
          onClick={runMigration}
          disabled={isLoading}
          className={`btn-primary w-full ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "Running Migration..." : "Run Migration"}
        </button>

        {results && (
          <div className="mt-8 p-4 bg-white border border-gray-200 rounded-md">
            <h2 className="text-xl font-semibold mb-2">Migration Results</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
} 