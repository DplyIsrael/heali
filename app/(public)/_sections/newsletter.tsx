"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — wire to Resend in Phase 12
    setEmail("");
  };

  return (
    <section className="mx-auto max-w-[1440px] px-[50px] py-16">
      <div className="rounded-[24px] bg-primary/5 border border-primary/10 px-[60px] py-12 text-right">
        <h2 className="text-[28px] font-medium text-foreground">
          רוצה להתעדכן בכל מה שעושה טוב לגוף ולנפש?
        </h2>
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex items-center justify-end gap-3"
        >
          {/* Input first → right in RTL (natural Hebrew typing position) */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="כתובת מייל לקבלת עדכונים"
            className="h-[48px] w-[320px] rounded-[10px] border border-border bg-white px-4 font-[family-name:var(--font-poppins)] text-[14px] placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            required
          />
          {/* Button second → left in RTL */}
          <Button
            type="submit"
            className="rounded-[10px] bg-primary px-8 text-[15px] font-semibold text-white hover:bg-primary/90"
          >
            שליחה
          </Button>
        </form>
      </div>
    </section>
  );
}
