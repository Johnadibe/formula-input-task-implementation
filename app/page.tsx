"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FormulaInput from '@/components/FormulaInput';

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="w-full max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold text-center">Formula Input</h1>

          <div className="p-4 border rounded-lg shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-lg font-semibold">#</span>
              <span>New Variable</span>
            </div>

            <FormulaInput />
          </div>

          <div className="text-sm text-gray-500">
            <p>Features:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Type variable names for autocomplete suggestions</li>
              <li>Use operators (+, -, *, /, ^, (, ))</li>
              <li>Click on variables to edit them</li>
              <li>Press backspace to delete variables</li>
              <li>Press = button to calculate the result</li>
            </ul>
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
}