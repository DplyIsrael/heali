import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const ARTICLES = [
  {
    id: "1",
    title: "5 יתרונות של רפלקסולוגיה שלא הכרתם",
    category: "רפלקסולוגיה",
    excerpt: "רפלקסולוגיה היא הרבה יותר מעיסוי כפות רגליים. גלו איך היא יכולה לשפר את איכות השינה, להפחית מתח ולחזק את המערכת החיסונית.",
    gradient: "from-[#21544E]/20 to-[#7DE4A8]/10",
    accentColor: "bg-primary",
  },
  {
    id: "2",
    title: "מדיטציה למתחילים: המדריך המלא",
    category: "מדיטציה",
    excerpt: "איך להתחיל לתרגל מדיטציה גם אם מעולם לא ניסיתם? טיפים פרקטיים ותרגילים פשוטים שתוכלו להתחיל עוד היום.",
    gradient: "from-[#7DE4A8]/20 to-[#21544E]/10",
    accentColor: "bg-accent",
  },
  {
    id: "3",
    title: "דיקור סיני: מה אומר המדע?",
    category: "דיקור סיני",
    excerpt: "סקירה של המחקרים האחרונים בנושא דיקור סיני — מה הוכח מדעית ואיך זה יכול לעזור לכם בטיפול בכאב כרוני.",
    gradient: "from-[#f49d8e]/15 to-[#21544E]/10",
    accentColor: "bg-[#f49d8e]",
  },
];

export function ArticlesTeaser() {
  return (
    <section className="mx-auto max-w-[1440px] px-[50px] py-16">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        {/* Title first → right in RTL */}
        <div>
          <h2 className="text-[30px] font-semibold text-foreground">מאמרים אחרונים</h2>
          <p className="mt-1 text-[14px] font-light text-muted-foreground">
            תוכן מקצועי שיעזור לכם להבין יותר על עולמות הטיפול
          </p>
        </div>
        {/* CTA link second → left in RTL */}
        <Link
          href="/articles"
          className="flex items-center gap-1.5 text-[14px] font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          לכל המאמרים
        </Link>
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-3 gap-6">
        {ARTICLES.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.id}`}
            className="group flex flex-col overflow-hidden rounded-[16px] border border-border bg-white transition-shadow hover:shadow-md"
          >
            {/* Thumbnail placeholder */}
            <div className={`relative h-[180px] bg-gradient-to-br ${article.gradient} bg-[#f4f7f7] overflow-hidden`}>
              {/* Decorative pattern */}
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, #21544E 1px, transparent 0)`,
                  backgroundSize: "20px 20px",
                }}
              />
              {/* Category tag */}
              <div className="absolute top-4 right-4">
                <span className={`${article.accentColor} text-white px-3 py-1 rounded-full text-[12px] font-medium`}>
                  {article.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-[17px] font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              <p className="mt-2 text-[13px] font-light text-muted-foreground leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-1 text-[13px] font-medium text-primary">
                <span>קראו עוד</span>
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
