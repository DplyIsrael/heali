import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Globe, MessageSquare, Wallet, ArrowRight, Heart, Edit, Trophy } from "lucide-react";
import { PractitionerCard, type PractitionerCardData } from "@/components/shared/practitioner-card";
import { StartConversationButton } from "@/components/messaging/start-conversation-button";
import { fetchPractitionerById, fetchPractitionerReviews, fetchSimilarPractitioners, fetchPractitionerCertificates, fetchPractitionerArticles } from "./actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const practitioner = await fetchPractitionerById(id);
  if (!practitioner) return { title: "מטפל לא נמצא" };
  return {
    title: `${practitioner.name} — ${practitioner.domainNames.join(", ")} | Heali`,
    description: practitioner.bio?.slice(0, 160) ?? `${practitioner.name} — מטפל/ת ב-${practitioner.domainNames.join(", ")}`,
    openGraph: {
      title: `${practitioner.name} | Heali`,
      description: practitioner.bio?.slice(0, 160),
      images: practitioner.image ? [practitioner.image] : undefined,
    },
  };
}

export default async function PractitionerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const [practitioner, reviews, certificates, articles] = await Promise.all([
    fetchPractitionerById(id),
    fetchPractitionerReviews(id),
    fetchPractitionerCertificates(id),
    fetchPractitionerArticles(id),
  ]);

  if (!practitioner) {
    notFound();
  }

  const similar = await fetchSimilarPractitioners(id, practitioner.domainIds);

  const pricingLabel = practitioner.pricingModel === "per_hour" ? "לשעה" : "לטיפול";

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-[1440px] px-4 md:px-[30px] py-6 md:py-10">
        {/* Back button */}
        <Link
          href="/discovery"
          className="inline-flex items-center gap-2 mb-6 text-[16px] text-muted hover:text-black transition-colors"
        >
          <div className="size-[36px] rounded-full border border-border flex items-center justify-center">
            <ArrowRight className="size-4" />
          </div>
          חזור
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content — right side in RTL */}
          <div className="flex-1 min-w-0">
            {/* Profile header */}
            <div className="flex flex-col sm:flex-row gap-6 items-start mb-10">
              {/* Photo */}
              <div className="relative w-[140px] h-[140px] sm:w-[181px] sm:h-[181px] rounded-[22px] overflow-hidden border-2 border-[#e5e5e5] shrink-0">
                <Image
                  src={practitioner.image}
                  alt={practitioner.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-[24px] sm:text-[26px] font-medium text-black">
                    {practitioner.name}
                  </h1>
                  {practitioner.isHighlyRated && (
                    <div className="flex items-center gap-1 bg-[#e9deff] rounded-full px-3 py-1">
                      <Trophy className="size-3 text-[#ad80ff]" />
                      <span className="text-[12px] text-[#ad80ff] font-medium">מדורגת גבוהה</span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="size-[18px] fill-[#f5a623] text-[#f5a623]" />
                  <span className="text-[16px] text-[#666]">
                    {practitioner.rating} (דרוג {practitioner.reviews})
                  </span>
                </div>

                {/* Info row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-[14px] text-[#575757]">
                  <div className="flex items-center gap-1.5">
                    <Globe className="size-4 text-primary" />
                    <span>{practitioner.city}</span>
                  </div>
                  {practitioner.languages.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="size-4 text-primary" />
                      <span>שפות: {practitioner.languages.join(", ")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Wallet className="size-4 text-primary" />
                    <span>מחיר {pricingLabel}: {practitioner.price}₪</span>
                  </div>
                </div>

                {/* Domain tags */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {practitioner.domainNames.map((d) => (
                    <span
                      key={d}
                      className="px-3 py-1 rounded-full border border-[#d7d7d7] text-[12px] text-black"
                      style={{ backgroundImage: "linear-gradient(104deg, #ebecec 161%, white 99%)" }}
                    >
                      {d}
                    </span>
                  ))}
                  {practitioner.specialtyNames.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full border border-[#d7d7d7] text-[12px] text-black"
                      style={{ backgroundImage: "linear-gradient(112deg, #ebecec 161%, white 99%)" }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* About me */}
            {practitioner.bio && (
              <section className="mb-10">
                <h2 className="text-[22px] sm:text-[26px] font-medium text-black mb-4">קצת עלי</h2>
                <p className="text-[16px] font-light text-[#9f9f9f] leading-relaxed whitespace-pre-line">
                  {practitioner.bio}
                </p>
              </section>
            )}

            {/* Certification */}
            {certificates.length > 0 && (
              <section className="mb-10">
                <h2 className="text-[22px] sm:text-[26px] font-medium text-black mb-4">הסמכה</h2>
                <div className="flex flex-col gap-2">
                  {certificates.map((cert, i) => (
                    <a
                      key={i}
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-[8px] border border-border-input bg-white px-4 py-3 hover:bg-muted/5 transition-colors"
                    >
                      <Globe className="size-4 text-primary" />
                      <span className="text-[14px] text-primary underline">{cert.name}</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Practitioner articles */}
            {articles.length > 0 && (
              <section className="mb-10">
                <h2 className="text-[24px] sm:text-[30px] font-semibold text-black mb-6">מאמרים</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {articles.map((article) => (
                    <Link key={article.id} href={`/articles/${article.slug}`} className="group">
                      <div className="rounded-[16px] border border-border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-[140px] bg-muted/20 overflow-hidden">
                          {article.image ? (
                            <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                          )}
                          <div className="absolute bottom-2 right-2 flex gap-1.5">
                            {article.category && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#9f9f9f]/40 bg-white/90 text-black">{article.category}</span>
                            )}
                            <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#9f9f9f]/40 bg-white/90 text-black">{article.date}</span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="text-[15px] font-medium text-black line-clamp-2">{article.title}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[20px] font-semibold text-black">
                  תגובות ({practitioner.reviews})
                </h2>
                {practitioner.reviews > 4 && (
                  <button className="text-[16px] font-light text-primary hover:underline">
                    צפייה בכל התגובות
                  </button>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-[8px] border border-[#f4f4f4] bg-white p-5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-[42px] rounded-full bg-muted/20 flex items-center justify-center text-[16px] font-medium text-muted">
                          {review.reviewerName[0]}
                        </div>
                        <div>
                          <p className="text-[16px] text-black">{review.reviewerName}</p>
                          <p className="text-[14px] text-[#9f9f9f]">
                            {new Date(review.createdAt).toLocaleDateString("he-IL")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`size-[15px] ${
                              i < review.rating
                                ? "fill-[#f5a623] text-[#f5a623]"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[14px] font-light text-[#9f9f9f] line-clamp-3">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[16px] text-muted">אין תגובות עדיין</p>
              )}
            </section>

            {/* Similar practitioners */}
            {similar.length > 0 && (
              <section>
                <h2 className="text-[24px] sm:text-[30px] font-semibold text-black mb-6">
                  מטפלים דומים
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similar.map((p) => (
                    <PractitionerCard key={p.id} practitioner={p as PractitionerCardData} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar — left side in RTL */}
          <aside className="w-full lg:w-[411px] shrink-0 order-first lg:order-last">
            <div className="sticky top-[100px] rounded-[8px] border border-[#e5e5e5] bg-white p-6">
              <div className="flex flex-col gap-3">
                {/* Book appointment */}
                <Link
                  href={`/practitioners/${id}/book`}
                  className="flex items-center justify-center gap-2 w-full h-[44px] rounded-[8px] bg-accent text-[16px] font-bold text-black"
                >
                  <Edit className="size-4" />
                  קביעת תורים
                </Link>

                {/* Send message — opens or creates a conversation thread */}
                <StartConversationButton practitionerUserId={practitioner.userId} />

                {/* Save to favorites */}
                <button className="flex items-center justify-center gap-2 w-full h-[44px] rounded-[8px] bg-[#f4f7f7] text-[16px] text-black">
                  <Heart className="size-4" />
                  שמירה במועדפים
                </button>
              </div>

              {/* Info bullets */}
              <div className="mt-6 flex flex-col gap-3 text-[14px] text-[#9f9f9f]">
                <div className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>מטפל/ת מאומת/ת עם תעודות הסמכה</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>זמין/ה לקביעת תורים באופן מיידי</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>ביטול חינם עד 24 שעות לפני הטיפול</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
