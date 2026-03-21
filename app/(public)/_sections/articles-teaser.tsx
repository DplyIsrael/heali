"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

const ARTICLES = [
  {
    title: "איך דיקור סיני יכול לעזור לכאבי גב",
    description: "דיקור סיני הוא שיטה עתיקה שמשלבת החדרת מחטים דקיקות לנקודות ספציפיות בגוף",
    category: "דיקור סיני",
    date: "09/10/2025",
    author: "מאי בוזו",
    image: "/images/articles/article-1.jpg",
  },
  {
    title: "היתרונות של רפלקסולוגיה לבריאות הכללית",
    description: "רפלקסולוגיה היא טיפול שמבוסס על לחיצה על נקודות בכפות הרגליים והידיים",
    category: "רפלקסולוגיה",
    date: "15/10/2025",
    author: "ליאת גולדנברג",
    image: "/images/articles/article-2.jpg",
  },
  {
    title: "מדיטציה יומית: המדריך למתחילים",
    description: "מדיטציה היא כלי פשוט וחזק שיכול לשפר את איכות החיים שלכם בצורה משמעותית",
    category: "מדיטציה",
    date: "22/10/2025",
    author: "דוד כהן",
    image: "/images/articles/article-3.jpg",
  },
];

export function ArticlesTeaser() {
  const t = useTranslations("home.articles");

  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-10 md:py-16">
      <div className="mb-6 md:mb-8 flex items-end justify-between">
        <h2 className="text-[24px] md:text-[30px] font-semibold text-foreground">
          {t("title")}
        </h2>
        <Link
          href="/articles"
          className="flex items-center gap-1 text-[14px] font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          {t("viewAll")}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {ARTICLES.map((article) => (
          <Link
            key={article.title}
            href="/articles"
            className="group overflow-hidden rounded-[20px] border border-border-input bg-white transition-shadow hover:shadow-lg"
          >
            {/* Image area */}
            <div className="relative h-[160px] md:h-[184px] w-full">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-2 start-2 flex gap-2">
                <span className="rounded-full bg-accent/90 px-3 py-1 text-[12px] font-medium text-foreground">
                  {article.category}
                </span>
                <span className="rounded-full bg-white/90 px-3 py-1 font-poppins text-[12px] text-muted-foreground">
                  {article.date}
                </span>
              </div>
            </div>

            {/* Content area */}
            <div className="p-4">
              <h3 className="text-[16px] font-medium text-foreground line-clamp-1">
                {article.title}
              </h3>
              <p className="mt-1 text-[14px] font-light leading-[18px] text-muted-foreground line-clamp-2">
                {article.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex size-[31px] items-center justify-center rounded-full bg-muted text-[12px] font-medium text-white">
                  {article.author.charAt(0)}
                </div>
                <span className="text-[14px] font-light text-foreground">
                  {t("publishedBy")} {article.author}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
