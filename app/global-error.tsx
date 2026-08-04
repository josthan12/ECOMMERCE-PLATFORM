"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          alignItems: "center",
          background: "#071528",
          color: "#fffaf0",
          display: "flex",
          fontFamily: "system-ui, sans-serif",
          justifyContent: "center",
          margin: 0,
          minHeight: "100vh",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <main>
          <title>Something went wrong | PokeSunshineTCG</title>
          <h1>Something went wrong</h1>
          <p>Please try again. If the problem continues, come back shortly.</p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              background: "#f6d777",
              border: 0,
              borderRadius: "8px",
              color: "#071528",
              cursor: "pointer",
              font: "inherit",
              fontWeight: 700,
              marginTop: "16px",
              padding: "12px 18px",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
