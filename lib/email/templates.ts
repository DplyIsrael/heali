/**
 * Email notification templates — stubs for Resend integration.
 * These return HTML strings. When Resend is configured, use these with:
 *   await resend.emails.send({ from, to, subject, html })
 *
 * TODO: Replace with React Email components when Resend credentials available.
 */

export function bookingConfirmedEmail(params: {
  patientName: string;
  practitionerName: string;
  domain: string;
  date: string;
  time: string;
  calendarLink: string;
}) {
  return {
    subject: `אישור טיפול — ${params.domain} עם ${params.practitionerName}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #21544E;">הטיפול שלך אושר!</h1>
        <p>שלום ${params.patientName},</p>
        <p>הטיפול שלך עם <strong>${params.practitionerName}</strong> אושר.</p>
        <p><strong>סוג טיפול:</strong> ${params.domain}</p>
        <p><strong>תאריך:</strong> ${params.date}</p>
        <p><strong>שעה:</strong> ${params.time}</p>
        <a href="${params.calendarLink}" style="display:inline-block;padding:12px 24px;background:#7DE4A8;color:#08190C;border-radius:8px;text-decoration:none;margin-top:16px;">הוסף ליומן Google</a>
        <p style="color:#9f9f9f;margin-top:24px;">צוות Heali</p>
      </div>
    `,
  };
}

export function bookingDeclinedEmail(params: {
  patientName: string;
  practitionerName: string;
}) {
  return {
    subject: "הטיפול שלך לא אושר",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #21544E;">הטיפול לא אושר</h1>
        <p>שלום ${params.patientName},</p>
        <p>לצערנו, הטיפול עם ${params.practitionerName} לא אושר.</p>
        <p>ניתן לחפש מטפלים אחרים באתר.</p>
        <p style="color:#9f9f9f;margin-top:24px;">צוות Heali</p>
      </div>
    `,
  };
}

export function bookingCanceledEmail(params: {
  patientName: string;
  amount: number;
}) {
  return {
    subject: "ביטול טיפול — זיכוי לארנק",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #21544E;">הטיפול בוטל</h1>
        <p>שלום ${params.patientName},</p>
        <p>הטיפול שלך בוטל בהצלחה.</p>
        <p>סכום של <strong>₪${params.amount}</strong> זוכה לארנק שלך.</p>
        <p style="color:#9f9f9f;margin-top:24px;">צוות Heali</p>
      </div>
    `,
  };
}

export function surveyEmail(params: {
  patientName: string;
  practitionerName: string;
  surveyUrl: string;
}) {
  return {
    subject: `איך היה הטיפול עם ${params.practitionerName}?`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #21544E;">ספר/י לנו איך היה</h1>
        <p>שלום ${params.patientName},</p>
        <p>מקווים שנהנית מהטיפול עם ${params.practitionerName}!</p>
        <p>נשמח אם תדרג/י את החוויה:</p>
        <a href="${params.surveyUrl}" style="display:inline-block;padding:12px 24px;background:#7DE4A8;color:#08190C;border-radius:8px;text-decoration:none;margin-top:16px;">דרג/י את הטיפול</a>
        <p style="color:#9f9f9f;margin-top:24px;">צוות Heali</p>
      </div>
    `,
  };
}

export function practitionerNewBookingEmail(params: {
  practitionerName: string;
  patientName: string;
  domain: string;
  date: string;
  time: string;
}) {
  return {
    subject: "טיפול חדש ממתין לאישורך",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #21544E;">טיפול חדש!</h1>
        <p>שלום ${params.practitionerName},</p>
        <p><strong>${params.patientName}</strong> הזמין/ה טיפול ${params.domain}.</p>
        <p><strong>תאריך:</strong> ${params.date}</p>
        <p><strong>שעה:</strong> ${params.time}</p>
        <p>יש לאשר או לדחות את הטיפול בדשבורד.</p>
        <p style="color:#9f9f9f;margin-top:24px;">צוות Heali</p>
      </div>
    `,
  };
}

export function practitionerApprovedEmail(params: {
  practitionerName: string;
  qrPngDataUrl: string;
  scanUrl: string;
  changedFieldLabels?: string[];
}) {
  const changes = params.changedFieldLabels ?? [];
  const statusBlock = changes.length === 0
    ? `<p style="font-size:16px;color:#21544E;font-weight:600;">אושרת!</p>`
    : `
      <p style="font-size:16px;color:#21544E;font-weight:600;margin-bottom:6px;">אושרת עם עדכונים</p>
      <p style="margin:0 0 6px;">השדות הבאים עודכנו על ידי הצוות:</p>
      <ul style="margin:0 0 12px;padding-inline-start:18px;">
        ${changes.map((f) => `<li>${f}</li>`).join("")}
      </ul>`;

  return {
    subject: changes.length === 0 ? "הפרופיל שלך אושר!" : "הפרופיל שלך אושר — בוצעו עדכונים",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #21544E;">ברוך/ה הבא/ה ל-Heali!</h1>
        <p>שלום ${params.practitionerName},</p>
        ${statusBlock}
        <p>הפרופיל שלך גלוי למטופלים. הדפס את ה-QR שלהלן והצג בקליניקה — מטופלים סורקים אותו בסיום הטיפול.</p>
        <div style="text-align:center;margin:24px 0;padding:24px;border:2px solid #21544E;border-radius:12px;">
          <img src="${params.qrPngDataUrl}" alt="QR Code" style="width:240px;height:240px;" />
          <div style="font-size:12px;color:#666;margin-top:12px;word-break:break-all;">${params.scanUrl}</div>
        </div>
        <p style="color:#9f9f9f;margin-top:24px;">צוות Heali</p>
      </div>
    `,
  };
}

// Sent when the practitioner ticks the agreement checkbox at the end of
// onboarding — gives them a copy of what they agreed to. The body here is the
// same placeholder text rendered on the agreement step; swap in the legal
// version when client copy is ready.
export function practitionerAgreementCopyEmail(params: {
  practitionerName: string;
  signedAt: string;
}) {
  return {
    subject: "עותק של הסכם המטפל בהילי",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; line-height: 1.6;">
        <h1 style="color: #21544E;">הסכם מטפל — עותק</h1>
        <p>שלום ${params.practitionerName},</p>
        <p>זהו עותק של ההסכם שאישרת בתאריך <strong>${params.signedAt}</strong>.</p>

        <h3 style="color: #21544E; margin-top: 24px;">הסכם שימוש למטפלים בפלטפורמת Heali</h3>
        <p>הסכם זה מסדיר את תנאי השימוש שלך כמטפל/ת בפלטפורמת Heali. באישורך, אתה מסכים לתנאים הבאים:</p>
        <p><strong>1. זמינות:</strong> אתה מתחייב לעדכן את לוח הזמנים שלך באופן שוטף ולהגיב לבקשות תורים תוך 24 שעות.</p>
        <p><strong>2. מקצועיות:</strong> אתה מתחייב לספק שירות מקצועי ואיכותי לכל מטופל/ת.</p>
        <p><strong>3. ביטולים:</strong> ביטול טיפול חייב להתבצע לפחות 24 שעות מראש.</p>
        <p><strong>4. תשלומים:</strong> התשלומים יועברו אליך בהתאם למדיניות התשלומים של הפלטפורמה.</p>
        <p><strong>5. תוכן:</strong> אתה אחראי לדיוק המידע בפרופיל שלך, כולל תעודות, ניסיון, ותיאור השירותים.</p>
        <p style="font-style: italic; color: #666; font-size: 13px;">* הסכם מלא יפורסם בקרוב. זהו טקסט מקום (placeholder).</p>

        <p style="color: #9f9f9f; margin-top: 24px;">צוות Heali</p>
      </div>
    `,
  };
}

export function practitionerRejectedEmail(params: {
  practitionerName: string;
  reason: string;
}) {
  return {
    subject: "הפרופיל שלך לא אושר",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #21544E;">הפרופיל לא אושר</h1>
        <p>שלום ${params.practitionerName},</p>
        <p>לצערנו, הפרופיל שלך לא אושר.</p>
        <p><strong>סיבה:</strong> ${params.reason}</p>
        <p>ניתן לפנות לתמיכה לבירור נוסף.</p>
        <p style="color:#9f9f9f;margin-top:24px;">צוות Heali</p>
      </div>
    `,
  };
}
