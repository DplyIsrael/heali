import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "מדיניות פרטיות | Heali",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[800px] px-4 py-16">
      <h1 className="text-[28px] font-bold text-black mb-4">מדיניות פרטיות</h1>
      <p className="text-[15px] text-muted-foreground leading-7">
        מדיניות הפרטיות המלאה של Heali נמצאת בשלבי הכנה ותפורסם בעמוד זה בקרוב.
        עד אז, לכל שאלה בנוגע לאופן שבו אנו אוספים ומשתמשים במידע ניתן לפנות אלינו
        בעמוד{" "}
        <Link href="/contact" className="text-primary underline">
          צור קשר
        </Link>
        .
      </p>
    </main>
  );
}
