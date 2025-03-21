"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          製造業向けAIアシスタント
        </h1>

        <div className="space-y-4">
          <Link href="/chat/agent" className="block w-full">
            <button
              type="button"
              className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              mastra Agent機能
            </button>
          </Link>

          <Link href="/chat/workflow" className="block w-full">
            <button
              type="button"
              className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              mastra Workflow機能
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
