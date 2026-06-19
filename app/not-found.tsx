import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" dir="rtl">
      <div className="text-center">
        <h1 className="text-[64px] font-bold text-primary mb-2">404</h1>
        <h2 className="text-[24px] font-semibold text-black mb-2">הדף לא נמצא</h2>
        <p className="text-[16px] text-muted-foreground mb-6">הדף שחיפשת אינו קיים או שהועבר.</p>
        <Link
          href="/"
          className="inline-flex h-[44px] items-center justify-center rounded-[8px] bg-accent px-6 text-[16px] text-black"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
