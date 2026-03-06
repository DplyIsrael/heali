"use client";

import { Play } from "lucide-react";

const TESTIMONIALS = [
  { id: 1, name: "רחל כהן", text: "טיפול מדהים שעזר לי להתגבר על כאבי גב כרוניים", tall: true, gradient: "from-[#21544E]/40 to-[#21544E]/20" },
  { id: 2, name: "דוד לוי", text: "ממליץ בחום! המטפל הכי מקצועי שפגשתי", tall: false, gradient: "from-[#3a8a7a]/30 to-[#7de4a8]/20" },
  { id: 3, name: "שרה גולד", text: "סוף סוף מצאתי מטפלת שמבינה אותי באמת", tall: true, gradient: "from-[#21544E]/30 to-[#3a8a7a]/20" },
  { id: 4, name: "יעקב מזרחי", text: "הפלטפורמה הכי נוחה שיש – תהליך הזמנה מהיר ופשוט", tall: false, gradient: "from-[#7de4a8]/30 to-[#21544E]/20" },
  { id: 5, name: "מירב שלום", text: "חוויה מרגיעה ומחדשת. אחרי טיפול אחד כבר הרגשתי שינוי", tall: true, gradient: "from-[#3a8a7a]/40 to-[#7de4a8]/10" },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1440px] px-[50px] py-16">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[30px] font-semibold text-foreground text-center">
          שמעו ממשתמשים
        </h2>
        <p className="mt-2 text-[16px] font-light text-muted-foreground text-center">
          סיפורים אמיתיים מאנשים שמצאו את הטיפול שמתאים להם.
        </p>
      </div>

      {/* Masonry-like grid */}
      <div className="flex gap-4 justify-center">
        {TESTIMONIALS.map((item) => (
          <div
            key={item.id}
            className={`group relative overflow-hidden rounded-[16px] cursor-pointer ${
              item.tall ? "w-[220px] h-[320px]" : "w-[220px] h-[260px] self-center"
            }`}
          >
            {/* Background — gradient placeholder for video thumbnail */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} bg-[#e8eeec]`} />

            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #21544E 1px, transparent 0)`,
                backgroundSize: "16px 16px",
              }}
            />

            {/* Play button — centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-[56px] items-center justify-center rounded-full bg-accent shadow-lg transition-transform group-hover:scale-110">
                <Play className="size-5 fill-foreground text-foreground ms-0.5" />
              </div>
            </div>

            {/* Name + text overlay at bottom */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent p-4 pt-12">
              <p className="text-[14px] font-medium text-white">{item.name}</p>
              <p className="mt-0.5 text-[12px] font-light text-white/75 line-clamp-2">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
