"use client";

import { STATUS_CODES } from "http";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; cause?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <h1 className="text-center text-3xl font-black">
        {error.cause}
        {error.message === "User not found" ? "401" : ""}
      </h1>
      <h3 className="text-center">{error.message}</h3>
      <p className="text-center text-gray-500">{STATUS_CODES[error.message]}</p>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Attempt to recover by trying to re-render the invoices route
          () => reset()
        }
      >
        Try again
      </button>
    </main>
  );
}
