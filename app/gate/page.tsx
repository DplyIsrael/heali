"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

/**
 * Temporary site-wide access gate. Shown by the middleware to anyone without a
 * valid gate cookie. Submits the password to /api/gate, which validates it
 * server-side and sets the gate cookie; we then hard-navigate to the original
 * destination so the middleware re-evaluates with the new cookie.
 *
 * Text is intentionally hardcoded (not via next-intl) to keep this temporary
 * screen self-contained and decoupled from the rest of the app.
 */
export default function GatePage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Only allow same-origin, single-slash paths to prevent open-redirects.
  const safeNext = (): string => {
    if (typeof window === "undefined") return "/";
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Full navigation (not router.push) so middleware re-runs with the cookie.
        window.location.href = safeNext();
        return;
      }
      if (res.status === 429) {
        setError("יותר מדי ניסיונות. נסו שוב מאוחר יותר.");
      } else {
        setError("סיסמה שגויה. נסו שוב.");
      }
    } catch {
      setError("אירעה שגיאה. נסו שוב.");
    }
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-border-input bg-white p-8 shadow-sm">
        <h1 className="text-[28px] font-semibold text-primary">Heali</h1>
        <p className="mt-2 text-[16px] font-light text-[#666]">
          האתר בגישה מוגבלת. הזינו את סיסמת הגישה כדי להמשיך.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            type="password"
            autoFocus
            autoComplete="off"
            placeholder="סיסמת גישה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="סיסמת גישה"
            aria-invalid={!!error}
          />

          {error && <p className="text-[14px] text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading || !password}>
            {isLoading ? (
              <Spinner size="sm" className="border-white/30 border-t-white" />
            ) : (
              "כניסה"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
