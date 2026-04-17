import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchArticleBySlug } from "../actions";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) return { title: "מאמר לא נמצא" };
  return {
    title: `${article.title} | Heali`,
    description: article.content.slice(0, 160),
    openGraph: {
      title: article.title,
      description: article.content.slice(0, 160),
      images: article.backgroundImageUrl ? [article.backgroundImageUrl] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const date = new Date(article.createdAt).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[800px] px-4 md:px-[30px] py-6 md:py-10">
        {/* Back */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 mb-6 text-[16px] text-muted hover:text-black transition-colors"
        >
          <div className="size-[36px] rounded-full border border-border flex items-center justify-center">
            <ArrowRight className="size-4" />
          </div>
          חזרה למאמרים
        </Link>

        {/* Hero image */}
        {article.backgroundImageUrl && (
          <div className="relative w-full h-[300px] md:h-[400px] rounded-[16px] overflow-hidden mb-6">
            <Image
              src={article.backgroundImageUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          {article.categoryName && (
            <span className="text-[13px] px-3 py-1 rounded-full border border-[#d7d7d7] text-black">
              {article.categoryName}
            </span>
          )}
          <span className="text-[14px] text-muted">{date}</span>
        </div>

        {/* Title */}
        <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-2">
          {article.title}
        </h1>

        <p className="text-[16px] text-muted mb-8">
          פורסם ע״י {article.authorName}
        </p>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-[16px] leading-relaxed text-[#333] whitespace-pre-line">
          {article.content}
        </div>

        {/* Related practitioners */}
        <RelatedPractitioners categoryName={article.categoryName} />
      </div>
    </div>
  );
}

async function RelatedPractitioners({ categoryName }: { categoryName: string }) {
  if (!categoryName) return null;

  const supabase = await createClient();

  // Find practitioners with matching domain names
  const { data: domains } = await supabase
    .from("treatment_domains")
    .select("id")
    .ilike("name", `%${categoryName}%`)
    .limit(3);

  if (!domains || domains.length === 0) return null;

  const domainIds = domains.map((d: { id: string }) => d.id);

  const { data: practitioners } = await supabase
    .from("practitioner_profiles")
    .select("id, user_id, price, city, average_rating, total_reviews, bio, profile_photo_url, domain_ids, users!inner(full_name)")
    .eq("verification_status", "approved")
    .eq("is_publicly_visible", true)
    .overlaps("domain_ids", domainIds)
    .limit(3);

  if (!practitioners || practitioners.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-[24px] font-semibold text-black mb-6">מטפלים מהתחום</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {practitioners.map((p: Record<string, unknown>) => {
          const users = p.users as unknown as { full_name: string };
          return (
            <Link key={p.id as string} href={`/practitioners/${p.id}`} className="rounded-[16px] border border-border bg-white p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-[48px] rounded-full bg-muted/20 overflow-hidden relative">
                  {p.profile_photo_url ? (
                    <Image src={p.profile_photo_url as string} alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-[14px]">{users.full_name.slice(0, 2)}</div>
                  )}
                </div>
                <div>
                  <p className="text-[16px] font-medium text-black">{users.full_name}</p>
                  <p className="text-[14px] text-muted">{(p.city as string) ?? ""}</p>
                </div>
              </div>
              <p className="text-[13px] text-[#9f9f9f] line-clamp-2">{(p.bio as string) ?? ""}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
