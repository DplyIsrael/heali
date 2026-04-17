import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
    }

    // Get practitioner profile to find their QR token
    const { data: profile } = await supabase
      .from("practitioner_profiles")
      .select("id, qr_code_url, user_id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "פרופיל מטפל לא נמצא" }, { status: 404 });
    }

    // Build the scan URL — this is what patients scan
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://heali.vercel.app";
    const scanUrl = `${siteUrl}/scan/${profile.id}`;

    // Generate QR code as SVG string
    const qrSvg = await QRCode.toString(scanUrl, {
      type: "svg",
      width: 300,
      margin: 2,
      color: { dark: "#21544E", light: "#FFFFFF" },
    });

    // Build a simple printable HTML page that looks like a PDF
    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <title>Heali QR Code</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
    .card { text-align: center; padding: 48px; border: 2px solid #21544E; border-radius: 20px; max-width: 400px; }
    .logo { font-size: 32px; font-weight: bold; color: #21544E; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #666; margin-bottom: 32px; }
    .qr { margin: 0 auto 24px; }
    .qr svg { width: 300px; height: 300px; }
    .instructions { font-size: 16px; color: #21544E; font-weight: 600; margin-bottom: 8px; }
    .sub-instructions { font-size: 13px; color: #999; }
    @media print { body { background: #fff; } .card { border: none; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Heali</div>
    <div class="subtitle">הפלטפורמה שלך לטיפולים</div>
    <div class="qr">${qrSvg}</div>
    <div class="instructions">סרקו את הברקוד בסוף הטיפול</div>
    <div class="sub-instructions">הסריקה מאשרת את נוכחותכם ומאפשרת לנו לשלוח סקר שביעות רצון</div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="heali-qr-${profile.id}.html"`,
      },
    });
  } catch (err) {
    console.error("QR generation error:", err);
    return NextResponse.json({ error: "שגיאה ביצירת הברקוד" }, { status: 500 });
  }
}
