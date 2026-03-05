import { Play } from "lucide-react";

const TESTIMONIALS = [
  { name: "רחל כהן", text: "הטיפולים שמצאתי דרך Heali שינו את חיי לחלוטין. מטפל מקצועי ואדיב.", thumbnail: null },
  { name: "דוד לוי", text: "ממליץ בחום! השירות מצוין והמטפלים מקצועיים ואמינים.", thumbnail: null },
  { name: "שרה גולד", text: "סוף סוף מצאתי מטפל שמתאים לי. תהליך הקביעה פשוט ומהיר.", thumbnail: null },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1440px] px-[50px] py-16">
      <div className="mb-8 text-right">
        <h2 className="text-[32px] font-medium text-foreground">המלצות משתמשים</h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {TESTIMONIALS.map((item) => (
          <div
            key={item.name}
            className="group relative overflow-hidden rounded-[16px] bg-muted aspect-video flex items-center justify-center cursor-pointer"
          >
            {/* Placeholder thumbnail */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20" />

            {/* Play button */}
            <div className="relative flex size-14 items-center justify-center rounded-full bg-accent shadow-lg transition-transform group-hover:scale-110">
              <Play className="size-6 fill-foreground text-foreground ms-1" />
            </div>

            {/* Name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-right text-[15px] font-medium text-white">{item.name}</p>
              <p className="text-right text-[13px] font-light text-white/80 line-clamp-2">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
