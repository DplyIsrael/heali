import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "תנאי שימוש | Heali",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[800px] px-4 py-16">
      <h1 className="text-[28px] font-bold text-black mb-4">תנאי שימוש</h1>
      <p className="text-[15px] text-muted-foreground leading-7">
        תנאי השימוש המלאים של Heali נמצאים בשלבי הכנה ויפורסמו בעמוד זה בקרוב.
        עד אז, לכל שאלה בנוגע לשימוש בפלטפורמה ניתן לפנות אלינו בעמוד{" "}
        <Link href="/contact" className="text-primary underline">
          צור קשר
        </Link>
        .
      </p>
    </main>
  );
}
