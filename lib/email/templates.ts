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

export function practitionerApprovedEmail(params: { practitionerName: string }) {
  return {
    subject: "הפרופיל שלך אושר!",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #21544E;">ברוך/ה הבא/ה ל-Heali!</h1>
        <p>שלום ${params.practitionerName},</p>
        <p>הפרופיל שלך אושר ומעכשיו הוא גלוי למטופלים באתר.</p>
        <p>ניתן להיכנס לדשבורד ולהגדיר את שעות הקבלה.</p>
        <p style="color:#9f9f9f;margin-top:24px;">צוות Heali</p>
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
