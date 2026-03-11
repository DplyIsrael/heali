"use client";

import { Logo } from "@/components/shared/logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  progress?: number;
}

export function AuthLayout({ children, progress }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen">
      {/* Progress bar */}
      {progress !== undefined && (
        <div className="absolute top-0 right-0 left-0 z-10 h-1 bg-muted/30">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Right (in RTL, first in DOM): form area — 60% */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-[60%] lg:px-20">
        <div className="mx-auto w-full max-w-[499px]">
          {children}
        </div>
      </div>

      {/* Left (in RTL, second in DOM): branded teal panel — 40%, hidden on mobile */}
      <div className="hidden lg:flex relative w-[40%] flex-col items-center justify-center bg-primary p-12 overflow-hidden">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative mb-8">
          <Logo light />
        </div>

        {/* Branding text */}
        <div className="relative text-center">
          <p className="text-[46px] font-light leading-tight text-white">
            כל הכלים במקום אחד
            <br />
            בכדי למצוא את המטפל
            <br />
            <span className="font-bold">שמרגיש לך טבעי ונכון.</span>
          </p>
          <p className="mt-6 text-[18px] text-accent">
            בHeali תמצאו את המטפלים שמרגישים לכם נכון, כי ריפוי מתחיל בחיבור
            אישי.
          </p>
        </div>
      </div>
    </div>
  );
}
