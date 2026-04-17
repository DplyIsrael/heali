import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL!;
const client = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // ─── 1. Areas & Cities ───
  console.log("  → Areas & Cities");
  const [areaCenter] = await db
    .insert(schema.areas)
    .values({ name: "מרכז" })
    .returning();
  const [areaNorth] = await db
    .insert(schema.areas)
    .values({ name: "צפון" })
    .returning();
  const [areaSouth] = await db
    .insert(schema.areas)
    .values({ name: "דרום" })
    .returning();
  const [areaJerusalem] = await db
    .insert(schema.areas)
    .values({ name: "ירושלים" })
    .returning();

  const cityValues = [
    { name: "תל אביב - יפו", areaId: areaCenter.id },
    { name: "רמת גן", areaId: areaCenter.id },
    { name: "הרצליה", areaId: areaCenter.id },
    { name: "פתח תקווה", areaId: areaCenter.id },
    { name: "ראשון לציון", areaId: areaCenter.id },
    { name: "חיפה", areaId: areaNorth.id },
    { name: "נצרת", areaId: areaNorth.id },
    { name: "טבריה", areaId: areaNorth.id },
    { name: "באר שבע", areaId: areaSouth.id },
    { name: "אילת", areaId: areaSouth.id },
    { name: "ירושלים", areaId: areaJerusalem.id },
    { name: "בית שמש", areaId: areaJerusalem.id },
  ];
  await db.insert(schema.cities).values(cityValues);

  // ─── 2. Treatment Domains ───
  console.log("  → Treatment Domains");
  const domainValues = [
    { name: "דיקור סיני" },
    { name: "נטורופתיה" },
    { name: "רפלקסולוגיה" },
    { name: "עיסוי רפואי" },
    { name: "הומאופתיה" },
    { name: "שיאצו" },
    { name: "ריפוי בעיסוק" },
    { name: "פסיכותרפיה" },
    { name: "יוגה טיפולית" },
    { name: "מדיטציה" },
    { name: "ארומתרפיה" },
    { name: "רייקי" },
  ];
  const domains = await db
    .insert(schema.treatmentDomains)
    .values(domainValues)
    .returning();

  // ─── 3. Specialties ───
  console.log("  → Specialties");
  const specialtyValues = [
    { name: "כאבי גב", domainId: domains[0].id },
    { name: "מיגרנות", domainId: domains[0].id },
    { name: "פוריות", domainId: domains[0].id },
    { name: "תזונה קלינית", domainId: domains[1].id },
    { name: "צמחי מרפא", domainId: domains[1].id },
    { name: "ניקוי רעלים", domainId: domains[1].id },
    { name: "רפלקסולוגיה לנשים בהריון", domainId: domains[2].id },
    { name: "רפלקסולוגיה לילדים", domainId: domains[2].id },
    { name: "עיסוי שוודי", domainId: domains[3].id },
    { name: "עיסוי רקמות עמוקות", domainId: domains[3].id },
    { name: "עיסוי ספורט", domainId: domains[3].id },
    { name: "חרדות ודיכאון", domainId: domains[7].id },
    { name: "טראומה", domainId: domains[7].id },
    { name: "טיפול זוגי", domainId: domains[7].id },
    { name: "קונדליני יוגה", domainId: domains[8].id },
    { name: "מיינדפולנס", domainId: domains[9].id },
  ];
  await db.insert(schema.specialties).values(specialtyValues);

  // ─── 4. Categories ───
  console.log("  → Categories");
  const categoryValues = [
    { name: "רפואה סינית", pointsAmount: 100, fieldOfKnowledge: "רפואה משלימה" },
    { name: "טיפול טבעי", pointsAmount: 80, fieldOfKnowledge: "נטורופתיה" },
    { name: "גוף ונפש", pointsAmount: 120, fieldOfKnowledge: "טיפול הוליסטי" },
    { name: "בריאות נשים", pointsAmount: 90, fieldOfKnowledge: "רפואת נשים" },
    { name: "ספורט ושיקום", pointsAmount: 110, fieldOfKnowledge: "פיזיותרפיה" },
  ];
  const categories = await db
    .insert(schema.categories)
    .values(categoryValues)
    .returning();

  // ─── 5. Users (Admin + Patients + Practitioners) ───
  console.log("  → Users");

  // Admin user
  const [_adminUser] = await db
    .insert(schema.users)
    .values({
      id: "00000000-0000-0000-0000-000000000001",
      email: "admin@heali.co.il",
      fullName: "מנהל מערכת",
      role: "admin",
      onboardingCompleted: true,
    })
    .returning();

  // Patient users
  const patientData = [
    { id: "00000000-0000-0000-0000-000000000010", email: "patient1@example.com", fullName: "יעל כהן" },
    { id: "00000000-0000-0000-0000-000000000011", email: "patient2@example.com", fullName: "דוד לוי" },
    { id: "00000000-0000-0000-0000-000000000012", email: "patient3@example.com", fullName: "נועה ישראלי" },
    { id: "00000000-0000-0000-0000-000000000013", email: "patient4@example.com", fullName: "אורי אברהם" },
    { id: "00000000-0000-0000-0000-000000000014", email: "patient5@example.com", fullName: "מיכל רוזנברג" },
  ];
  const patients = await db
    .insert(schema.users)
    .values(
      patientData.map((p) => ({
        ...p,
        role: "patient" as const,
        onboardingCompleted: true,
      }))
    )
    .returning();

  // Patient profiles
  await db.insert(schema.patientProfiles).values([
    { userId: patients[0].id, dateOfBirth: "1990-05-15", gender: "female" as const, city: "תל אביב - יפו", phone: "0501234567" },
    { userId: patients[1].id, dateOfBirth: "1985-11-20", gender: "male" as const, city: "חיפה", phone: "0527654321" },
    { userId: patients[2].id, dateOfBirth: "1995-03-08", gender: "female" as const, city: "ירושלים", phone: "0541112233" },
    { userId: patients[3].id, dateOfBirth: "1988-07-22", gender: "male" as const, city: "רמת גן", phone: "0509998877" },
    { userId: patients[4].id, dateOfBirth: "1992-01-10", gender: "female" as const, city: "הרצליה", phone: "0536665544" },
  ]);

  // Practitioner users
  const practitionerData = [
    { id: "00000000-0000-0000-0000-000000000020", email: "liat@heali.co.il", fullName: "ליאת גולדנברג" },
    { id: "00000000-0000-0000-0000-000000000021", email: "yossi@heali.co.il", fullName: "דר׳ יוסי כהן" },
    { id: "00000000-0000-0000-0000-000000000022", email: "michal@heali.co.il", fullName: "מיכל אברהם" },
    { id: "00000000-0000-0000-0000-000000000023", email: "rina@heali.co.il", fullName: "רינה שמש" },
    { id: "00000000-0000-0000-0000-000000000024", email: "avi@heali.co.il", fullName: "אבי מזרחי" },
    { id: "00000000-0000-0000-0000-000000000025", email: "sara@heali.co.il", fullName: "שרה ברק" },
  ];
  const practitioners = await db
    .insert(schema.users)
    .values(
      practitionerData.map((p) => ({
        ...p,
        role: "practitioner" as const,
        onboardingCompleted: true,
      }))
    )
    .returning();

  // ─── 6. Practitioner Profiles ───
  console.log("  → Practitioner Profiles");
  const practProfiles = await db
    .insert(schema.practitionerProfiles)
    .values([
      {
        userId: practitioners[0].id,
        domainIds: [domains[0].id, domains[2].id],
        specialtyIds: [],
        pricingModel: "per_treatment" as const,
        price: "250.00",
        languages: ["עברית", "אנגלית"],
        bio: "מטפלת מוסמכת בדיקור סיני ורפלקסולוגיה עם 12 שנות ניסיון. מתמחה בטיפול בכאבים כרוניים, מיגרנות ובעיות פוריות.",
        phone: "0501111111",
        city: "תל אביב - יפו",
        area: "מרכז",
        verificationStatus: "approved",
        isPubliclyVisible: true,
        averageRating: "4.80",
        totalReviews: 24,
      },
      {
        userId: practitioners[1].id,
        domainIds: [domains[1].id],
        specialtyIds: [],
        pricingModel: "per_treatment" as const,
        price: "300.00",
        languages: ["עברית", "אנגלית", "רוסית"],
        bio: "נטורופת קליני עם תואר שני ברפואה טבעית. מומחה בתזונה קלינית, צמחי מרפא וניקוי רעלים. גישה מבוססת מחקר.",
        phone: "0502222222",
        city: "חיפה",
        area: "צפון",
        verificationStatus: "approved",
        isPubliclyVisible: true,
        averageRating: "4.90",
        totalReviews: 31,
      },
      {
        userId: practitioners[2].id,
        domainIds: [domains[2].id],
        specialtyIds: [],
        pricingModel: "per_treatment" as const,
        price: "200.00",
        languages: ["עברית"],
        bio: "רפלקסולוגית מוסמכת המתמחה בטיפול בנשים בהריון ובילדים. 8 שנות ניסיון בקליניקה פרטית.",
        phone: "0503333333",
        city: "ירושלים",
        area: "ירושלים",
        verificationStatus: "approved",
        isPubliclyVisible: true,
        averageRating: "4.70",
        totalReviews: 18,
      },
      {
        userId: practitioners[3].id,
        domainIds: [domains[3].id, domains[10].id],
        specialtyIds: [],
        pricingModel: "per_hour" as const,
        price: "280.00",
        languages: ["עברית", "אנגלית"],
        bio: "מטפלת בעיסוי רפואי וארומתרפיה. מתמחה בשחרור שרירים, טיפול בפציעות ספורט ושיקום לאחר ניתוחים.",
        phone: "0504444444",
        city: "רמת גן",
        area: "מרכז",
        verificationStatus: "approved",
        isPubliclyVisible: true,
        averageRating: "4.60",
        totalReviews: 15,
      },
      {
        userId: practitioners[4].id,
        domainIds: [domains[7].id, domains[9].id],
        specialtyIds: [],
        pricingModel: "per_treatment" as const,
        price: "350.00",
        languages: ["עברית", "אנגלית", "צרפתית"],
        bio: "פסיכותרפיסט קליני עם התמחות בטיפול בחרדות, דיכאון וטראומה. משלב מדיטציה ומיינדפולנס בתהליך הטיפולי.",
        phone: "0505555555",
        city: "תל אביב - יפו",
        area: "מרכז",
        verificationStatus: "approved",
        isPubliclyVisible: true,
        averageRating: "4.95",
        totalReviews: 42,
      },
      {
        userId: practitioners[5].id,
        domainIds: [domains[5].id, domains[8].id],
        specialtyIds: [],
        pricingModel: "per_treatment" as const,
        price: "220.00",
        languages: ["עברית"],
        bio: "מטפלת בשיאצו ויוגה טיפולית. מתמחה באיזון אנרגטי, הפחתת מתח ושיפור גמישות הגוף.",
        phone: "0506666666",
        city: "הרצליה",
        area: "מרכז",
        verificationStatus: "pending_approval",
        isPubliclyVisible: false,
        averageRating: "0",
        totalReviews: 0,
      },
    ])
    .returning();

  // ─── 7. Practitioner Availability ───
  console.log("  → Practitioner Availability");
  const availabilityValues = [];
  for (const profile of practProfiles.slice(0, 5)) {
    // Sunday-Thursday, 09:00-17:00
    for (let day = 0; day <= 4; day++) {
      availabilityValues.push({
        practitionerId: profile.id,
        weekday: day,
        startTime: "09:00",
        endTime: "17:00",
      });
    }
  }
  await db.insert(schema.practitionerAvailability).values(availabilityValues);

  // ─── 8. Bookings ───
  console.log("  → Bookings");
  const bookings = await db
    .insert(schema.bookings)
    .values([
      {
        patientId: patients[0].id,
        practitionerId: practProfiles[0].id,
        domainId: domains[0].id,
        scheduledDate: "2026-03-20",
        scheduledTime: "10:00",
        status: "confirmed",
        priceAtBooking: "250.00",
        paymentStatus: "charged",
      },
      {
        patientId: patients[0].id,
        practitionerId: practProfiles[1].id,
        domainId: domains[1].id,
        scheduledDate: "2026-03-22",
        scheduledTime: "14:00",
        status: "confirmed",
        priceAtBooking: "300.00",
        paymentStatus: "charged",
      },
      {
        patientId: patients[1].id,
        practitionerId: practProfiles[2].id,
        domainId: domains[2].id,
        scheduledDate: "2026-03-18",
        scheduledTime: "11:00",
        status: "completed",
        priceAtBooking: "200.00",
        paymentStatus: "charged",
      },
      {
        patientId: patients[2].id,
        practitionerId: practProfiles[0].id,
        domainId: domains[0].id,
        scheduledDate: "2026-03-15",
        scheduledTime: "16:00",
        status: "completed",
        priceAtBooking: "250.00",
        paymentStatus: "charged",
      },
      {
        patientId: patients[3].id,
        practitionerId: practProfiles[3].id,
        domainId: domains[3].id,
        scheduledDate: "2026-03-25",
        scheduledTime: "09:00",
        status: "requested",
        priceAtBooking: "280.00",
        paymentStatus: "pending",
      },
      {
        patientId: patients[4].id,
        practitionerId: practProfiles[4].id,
        domainId: domains[7].id,
        scheduledDate: "2026-03-10",
        scheduledTime: "15:00",
        status: "canceled",
        priceAtBooking: "350.00",
        paymentStatus: "refunded",
        cancellationReason: "אילוצים אישיים",
      },
      {
        patientId: patients[1].id,
        practitionerId: practProfiles[4].id,
        domainId: domains[9].id,
        scheduledDate: "2026-03-12",
        scheduledTime: "10:00",
        status: "completed",
        priceAtBooking: "350.00",
        paymentStatus: "charged",
      },
    ])
    .returning();

  // ─── 9. Reviews ───
  console.log("  → Reviews");
  // Only completed bookings get reviews
  const completedBookings = bookings.filter((b) => b.status === "completed");
  await db.insert(schema.reviews).values([
    {
      bookingId: completedBookings[0].id,
      rating: 5,
      comment: "טיפול מצוין! מיכל מקצועית ואכפתית מאוד. הרגשתי שיפור כבר אחרי הטיפול הראשון.",
      reviewerFirstName: "דוד",
      status: "approved",
    },
    {
      bookingId: completedBookings[1].id,
      rating: 5,
      comment: "ליאת מדהימה! הדיקור עזר לי עם כאבי הגב שסבלתי מהם חודשים. ממליצה בחום.",
      reviewerFirstName: "נועה",
      status: "approved",
    },
    {
      bookingId: completedBookings[2].id,
      rating: 4,
      comment: "חוויה טובה מאוד. אבי מקצועי ונעים. הטיפול עזר לי להתמודד עם חרדות.",
      reviewerFirstName: "דוד",
      status: "approved",
    },
  ]);

  // ─── 10. Articles ───
  console.log("  → Articles");
  await db.insert(schema.articles).values([
    {
      title: "5 יתרונות של רפלקסולוגיה שלא הכרתם",
      content:
        "רפלקסולוגיה היא שיטת טיפול עתיקה שמבוססת על לחיצה על נקודות ספציפיות בכפות הרגליים. המחקר המודרני מראה שהיא יכולה לסייע בהפחתת מתחים, שיפור השינה, הקלה על כאבים כרוניים, חיזוק המערכת החיסונית ושיפור מצב הרוח הכללי. בניגוד למה שנהוג לחשוב, רפלקסולוגיה אינה רק עיסוי כפות רגליים — היא מערכת טיפולית שלמה שמתייחסת לגוף כולו דרך מפת הרפלקסים ברגליים.",
      authorId: practitioners[2].id,
      practitionerId: practProfiles[2].id,
      categoryId: categories[0].id,
      slug: "5-benefits-reflexology",
      status: "approved",
    },
    {
      title: "מדיטציה למתחילים: המדריך המלא",
      content:
        "מדיטציה היא אחד הכלים החזקים ביותר לשיפור בריאות הנפש. אם מעולם לא ניסיתם — אל תדאגו, זה קל יותר ממה שאתם חושבים. התחילו עם 5 דקות ביום: שבו בנוח, עצמו עיניים, והתמקדו בנשימה. כשמחשבות עולות — וזה יקרה — פשוט שימו לב אליהן ותחזרו בעדינות לנשימה. עם הזמן, תוכלו להאריך את הזמן ולגלות יתרונות מדהימים: הפחתת חרדות, שיפור ריכוז, שינה טובה יותר ותחושת רוגע עמוקה.",
      authorId: practitioners[4].id,
      practitionerId: practProfiles[4].id,
      categoryId: categories[2].id,
      slug: "meditation-beginners-guide",
      status: "approved",
    },
    {
      title: "נטורופתיה: מה זה ולמי זה מתאים?",
      content:
        "נטורופתיה היא גישה רפואית הוליסטית שמשלבת תזונה, צמחי מרפא, ויטמינים ומינרלים לטיפול במגוון מצבים בריאותיים. בניגוד לרפואה הקונבנציונלית שמתמקדת בתסמינים, נטורופתיה מחפשת את שורש הבעיה. היא מתאימה למי שמחפש גישה טבעית לבריאות, סובל מבעיות עיכול, עייפות כרונית, בעיות עור, או חוסר איזון הורמונלי. חשוב לבחור נטורופת מוסמך עם הכשרה מוכרת.",
      authorId: practitioners[1].id,
      practitionerId: practProfiles[1].id,
      categoryId: categories[1].id,
      slug: "naturopathy-what-is-it",
      status: "approved",
    },
    {
      title: "איך להתמודד עם כאבי גב כרוניים בשיטות טבעיות",
      content:
        "כאבי גב הם אחת התלונות הנפוצות ביותר. לפני שפונים לניתוח או לתרופות, כדאי לנסות שיטות טבעיות: דיקור סיני, עיסוי רפואי, יוגה טיפולית ושינויים תזונתיים. מחקרים מראים שדיקור סיני יעיל במיוחד לכאבי גב תחתון. שילוב של עיסוי עמוק עם תרגילי מתיחה יכול להביא להקלה משמעותית תוך מספר שבועות.",
      authorId: practitioners[0].id,
      practitionerId: practProfiles[0].id,
      categoryId: categories[4].id,
      slug: "chronic-back-pain-natural-methods",
      status: "approved",
    },
    {
      title: "טיפול בחרדות: הגישה ההוליסטית",
      content:
        "חרדה משפיעה על מיליוני אנשים ברחבי העולם. הגישה ההוליסטית לטיפול בחרדות משלבת פסיכותרפיה, מדיטציה, תזונה נכונה ופעילות גופנית. מחקרים מראים שמיינדפולנס יכול להפחית חרדה ב-30% עד 50%. שילוב של שיחות טיפוליות עם טכניקות הרגעה מעשיות נותן את התוצאות הטובות ביותר.",
      authorId: practitioners[4].id,
      practitionerId: practProfiles[4].id,
      categoryId: categories[2].id,
      slug: "anxiety-holistic-approach",
      status: "draft",
    },
  ]);

  // ─── 11. Treatment Packages ───
  console.log("  → Treatment Packages");
  await db.insert(schema.treatmentPackages).values([
    {
      name: "חבילת היכרות",
      description: "3 טיפולים במחיר מיוחד — מושלם למי שרוצה להתחיל",
      numTreatments: 3,
      pricePerTreatment: "200.00",
      gradientTheme: "teal",
    },
    {
      name: "חבילת ריפוי",
      description: "6 טיפולים לתהליך ריפוי מעמיק ומתמשך",
      numTreatments: 6,
      pricePerTreatment: "180.00",
      gradientTheme: "green",
    },
    {
      name: "חבילת פרימיום",
      description: "10 טיפולים — החבילה המשתלמת ביותר עם ליווי אישי",
      numTreatments: 10,
      pricePerTreatment: "160.00",
      gradientTheme: "purple",
    },
    {
      name: "חבילה זוגית",
      description: "4 טיפולים לזוגות — חוויה משותפת של ריפוי",
      numTreatments: 4,
      pricePerTreatment: "350.00",
      gradientTheme: "orange",
    },
  ]);

  // ─── 12. Credits (for canceled booking patient) ───
  console.log("  → Credits");
  const canceledBooking = bookings.find((b) => b.status === "canceled");
  if (canceledBooking) {
    await db.insert(schema.credits).values({
      patientId: patients[4].id,
      amount: "350.00",
      sourceBookingId: canceledBooking.id,
      status: "active",
    });
  }

  // ─── 13. Notifications ───
  console.log("  → Notifications");
  await db.insert(schema.notifications).values([
    {
      userId: patients[0].id,
      type: "booking_confirmed",
      payload: { bookingId: bookings[0].id, practitionerName: "ליאת גולדנברג", date: "2026-03-20" },
    },
    {
      userId: patients[0].id,
      type: "booking_confirmed",
      payload: { bookingId: bookings[1].id, practitionerName: "דר׳ יוסי כהן", date: "2026-03-22" },
    },
    {
      userId: practitioners[0].id,
      type: "new_booking",
      payload: { bookingId: bookings[0].id, patientName: "יעל כהן", date: "2026-03-20" },
    },
    {
      userId: practitioners[4].id,
      type: "new_review",
      payload: { rating: 4, reviewerName: "דוד" },
    },
    {
      userId: practitioners[5].id,
      type: "profile_pending",
      payload: { message: "הפרופיל שלך נמצא בבדיקה" },
    },
  ]);

  // ─── 14. Favorites ───
  console.log("  → Favorites");
  await db.insert(schema.favorites).values([
    { patientId: patients[0].id, practitionerId: practProfiles[0].id },
    { patientId: patients[0].id, practitionerId: practProfiles[4].id },
    { patientId: patients[1].id, practitionerId: practProfiles[2].id },
    { patientId: patients[2].id, practitionerId: practProfiles[0].id },
    { patientId: patients[2].id, practitionerId: practProfiles[1].id },
  ]);

  console.log("\n✅ Seed complete!");
  console.log("   → 4 areas, 12 cities");
  console.log("   → 12 treatment domains, 16 specialties, 5 categories");
  console.log("   → 1 admin, 5 patients, 6 practitioners (5 approved, 1 pending)");
  console.log("   → 7 bookings (2 confirmed, 3 completed, 1 canceled, 1 requested)");
  console.log("   → 3 reviews, 5 articles, 4 treatment packages");
  console.log("   → 1 credit, 5 notifications, 5 favorites");

  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
