"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — wire to Resend in Phase 12
    setEmail("");
  };

  return (
    <section className="w-full bg-[#08190C]">
      <div className="mx-auto max-w-[1440px] px-[50px] py-16">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-[30px] font-semibold text-white">
            רוצה להתעדכן בכל{" "}
            <br />
            מה שעושה טוב לגוף ולנפש?
          </h2>
          <p className="mt-3 text-[16px] font-light text-white/60 max-w-[500px]">
            הירשמו לניוזלטר שלנו וקבלו טיפים, מאמרים והצעות מיוחדות ישירות למייל.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex items-center gap-3"
          >
            {/* Input first → right in RTL */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="כתובת מייל לקבלת עדכונים"
              className="h-[48px] w-[340px] rounded-[10px] bg-white/10 border border-white/20 px-4 text-[14px] text-white font-[family-name:var(--font-poppins)] placeholder:text-white/40 outline-none focus:border-accent/60 transition-colors"
              required
            />
            {/* Button second → left in RTL */}
            <button
              type="submit"
              className="h-[48px] rounded-[10px] bg-accent px-8 text-[15px] font-semibold text-foreground hover:bg-accent/90 transition-colors"
            >
              שליחה
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
