# Heali — UI/UX Flow Document

**Version:** 1.1
**Status:** In Progress — Figma Review Active
**Last Updated:** 2026-03-04

---

## 1. Document Purpose

This document will map every user-facing flow in the Heali platform. It is intentionally a skeleton — only confirmed requirements from the PRD are listed. All screen layouts, component designs, navigation patterns, and visual flows will be completed after Figma wireframe review.

---

## 2. Design Principles (from PRD)

- RTL-first (Hebrew default)
- Mobile-first responsive design
- Consistent navigation across public and authenticated pages
- Accessibility compliance (standard TBD)

---

## 3. Navigation

**Confirmed items from PRD:**
- Home
- Practitioner Search / Discovery
- Treatment Packages / Individual treatments
- My Treatments
- Articles / Blog
- Contact Us
- Login / Sign Up

> **[PENDING FIGMA]** — Layout, placement, mobile behavior, active states, responsive breakpoints.

---

## 4. Login & Registration Section (from Figma)

> **Figma Source:** 11 screens covering login, email verification, role selection, patient registration (2 screens), and practitioner registration (6 screens: personal details, professional profile, treatment areas, Google Calendar, submission confirmation, account approved).

### 4.0 Shared Layout (All Login & Registration Screens)

**Structure:** Two-column layout (desktop)
- **Left column (~60%):** White background — form content area
- **Right column (~40%):** Dark teal (`#21544E`) branded panel with grid pattern overlay (4% opacity)
- **Logo:** "Heali" top-right corner on the teal panel, white text, font: PloniMLv2AAA-Bold, 42px, tracking: 1.68px. Subtitle "Website concept" below.
- **Progress bar:** Green line (`#7DE4A8`) at the very top of the page, grows left-to-right as user advances through steps.

**Consistent Elements Across Screens:**
- Bottom-left action buttons: Primary (teal `#21544E`, white text) + Secondary (light gray `#F4F7F7`, black text)
- All text right-aligned (RTL)
- Font family: Discovery Fs (various weights: Light, Regular, Medium, Demi-bold)
- Input font: Poppins/Arimo for placeholder text
- Input fields: white bg, border `#CDDBDB`, rounded-[10px], height 48px

### 4.1 Screen 1 — Login

**Figma Node:** `1:12772`

**Layout:**
- Title: "ברוכים הבאים לHeali" (40px, Demi-bold, black)
- Subtitle: "הזן את פרטי ההתחברות שלך כדי לקבל גישה לחשבון שלך במערכת" (18px, Light, `#666`)
- **Tab switcher:** Pill-style toggle inside a gray container (`#F7F7F7`, rounded-[10px])
  - Active tab: green bg (`#7DE4A8`), Medium weight — "התחברות" (Login)
  - Inactive tab: transparent bg, Regular weight — "הרשמה" (Register)
- **Email field:** Label "כתובת מייל", placeholder "הקלד/י כאן את כתובת המייל שלך"
- **Password field:** Label "סיסמה", placeholder same as email (note: should be password-specific)
- **Forgot password link:** "שכחתי את הסיסמה שלי" (16px, Light, `#666`) — right-aligned below password field
- **Login button:** Full-width, teal bg (`#21544E`), white text "התחברות", rounded-[10px], height 44px, font: Assistant Bold 16px
- **Divider:** Horizontal line with "או" (or) centered between lines
- **Social buttons row:** Two equal-width buttons in gray (`#F7F7F7`), rounded-[10px], height 48px
  - "התחברות עם גוגל" + Google icon (right side)
  - "התחברות עם מייל" + Email/SMS icon (right side)
- **Legal text:** Bottom center, 14px, faded (`rgba(102,102,102,0.4)`) — "בהמשך השימוש, אתה מסכים ל**תנאי השימוש ולמדיניות הפרטיות** של תנועת אור" (Terms bolded)
- **Right panel:** Branded text visible —
  - "כל הכלים במקום אחד / בכדי למצוא את המטפל / **שמרגיש לך טבעי ונכון.**" (46px, white, last line bold)
  - Subtext in green (`#7DE4A8`): "בHeali תמצאו את המטפלים שמרגישים לכם נכון, כי ריפוי מתחיל בחיבור אישי." (18px)

| Hebrew (HE) | English (EN) |
|---|---|
| ברוכים הבאים לHeali | Welcome to Heali |
| הזן את פרטי ההתחברות שלך כדי לקבל גישה לחשבון שלך במערכת | Enter your login details to access your account |
| התחברות | Login |
| הרשמה | Register |
| כתובת מייל | Email address |
| הקלד/י כאן את כתובת המייל שלך | Enter your email address here |
| סיסמה | Password |
| שכחתי את הסיסמה שלי | I forgot my password |
| או | or |
| התחברות עם גוגל | Login with Google |
| התחברות עם מייל | Login with email |
| בהמשך השימוש, אתה מסכים לתנאי השימוש ולמדיניות הפרטיות של תנועת אור | By continuing, you agree to the Terms of Use and Privacy Policy of Tnu'at Or |
| כל הכלים במקום אחד בכדי למצוא את המטפל שמרגיש לך טבעי ונכון. | All the tools in one place to find the practitioner that feels natural and right for you. |
| בHeali תמצאו את המטפלים שמרגישים לכם נכון, כי ריפוי מתחיל בחיבור אישי. | At Heali you'll find the practitioners that feel right, because healing starts with a personal connection. |

**Functionality:**
- Tab switcher toggles between Login and Register forms (same page, different content)
- Email + Password → Submit → Server validates → On success: redirect based on role
- "Forgot password" link → navigates to forgot password flow
- Google button → triggers Supabase Google OAuth
- Email button → TBD (may be magic link or just focuses email field)
- Legal links open Terms / Privacy Policy

---

### 4.2 Screen 2 — Email Verification (OTP)

**Figma Node:** `1:13034`

**Layout:**
- Title: "אימות כתובת אימייל" (40px, Demi-bold, black)
- Subtitle: "קוד אימות נשלח לכתובת האימייל שהוזנה. יש להזין את הקוד כאן כדי לאשר את הכתובת." (18px, Light, `#666`)
- **OTP Input:** 5 large input boxes in a row (126px wide x 144px tall each), gap 18px, white bg, border `#CDDBDB`, rounded-[8px]
- **Bottom buttons:**
  - Primary: "אישור" (Confirm) — teal bg, 170px wide
  - Secondary: "חזור" (Back) — light gray bg, 170px wide
- Right panel: teal with grid, no branded text on this screen

| Hebrew (HE) | English (EN) |
|---|---|
| אימות כתובת אימייל | Email address verification |
| קוד אימות נשלח לכתובת האימייל שהוזנה. יש להזין את הקוד כאן כדי לאשר את הכתובת. | A verification code was sent to the email address entered. Enter the code here to verify the address. |
| אישור | Confirm |
| חזור | Back |

**Functionality:**
- 5-digit OTP code entry
- Auto-focus advances to next box on input
- "Confirm" validates OTP against server
- "Back" returns to login/register screen
- On success → proceed to role selection (Screen 3)

---

### 4.3 Screen 3 — Role Selection

**Figma Node:** `1:12964`

**Layout:**
- Title: "ברוכים הבאים לHeali / בשביל לתת לך את ההצעות הכי טובות, נשמח להכיר אותך קצת" (40px, Demi-bold, multiline)
- **Two selection cards** (600px wide x 156px tall each, centered):
  - **Card 1 — "מחפש/ת טיפול" (Looking for treatment):**
    - Green border (`#7DE4A8`) when selected, shadow: `0px 4px 24px rgba(0,0,0,0.08)`
    - Icon: Green circle (`#7DE4A8`) with search icon, 64px, border ring `rgba(125,228,168,0.2)`
    - Title: "מחפש/ת טיפול" (20px, Medium)
    - Description: Lorem ipsum placeholder (18px, Light, `#666`)
  - **Card 2 — "מטפל/ת" (Practitioner):**
    - No border (unselected state), same shadow
    - Icon: Purple circle (`#AD7FFF`) with person icon, 64px, border ring `rgba(173,127,255,0.2)`
    - Title: "מטפל/ת" (20px, Medium)
    - Description: Lorem ipsum placeholder (18px, Light, `#666`)
- **Bottom buttons:** "המשך" (Continue) + "חזור" (Back)
- Progress bar: ~30% filled

| Hebrew (HE) | English (EN) |
|---|---|
| ברוכים הבאים לHeali בשביל לתת לך את ההצעות הכי טובות, נשמח להכיר אותך קצת | Welcome to Heali. To give you the best offers, we'd love to get to know you a bit |
| מחפש/ת טיפול | Looking for treatment |
| מטפל/ת | Practitioner |
| המשך | Continue |
| חזור | Back |

**Functionality:**
- Single-select between two cards (radio behavior)
- Selected card gets green border highlight
- "Continue" → If Patient selected: go to Screen 4 (Patient Registration). If Practitioner: go to Screen 5 (Practitioner Registration).
- "Back" → return to email verification

---

### 4.4 Screen 4 — Patient Registration Form

**Figma Node:** `1:13164`

**Layout:**
- Title: "שמחים שבחרת להצטרף אלינו!" (40px, Demi-bold)
- Subtitle: Long welcome text about Heali's mission (18px, Light, `#666`)
- **Profile photo upload:** 144x144px square, gray bg (`#F4F7F7`), rounded-[8px], upload icon centered. Below: "העלאת תמונה" button (bordered, black text, 141px wide)
- **Form fields (all stacked, 499px wide):**
  - שם מלא (Full name) — text input
  - תאריך לידה (Date of birth) — date input, placeholder "00/00/00000"
  - עיר מגורים (City of residence) — text input
  - מספר נייד (Mobile number) — text input
  - מגדר (Gender) — dropdown select with chevron icon, placeholder "בחירה" (Choose)
- **Bottom buttons:** "המשך" (Continue) + "חזור" (Back)
- Progress bar: ~65% filled

| Hebrew (HE) | English (EN) |
|---|---|
| שמחים שבחרת להצטרף אלינו! | Happy you chose to join us! |
| העלאת תמונה | Upload photo |
| שם מלא | Full name |
| תאריך לידה | Date of birth |
| עיר מגורים | City of residence |
| מספר נייד | Mobile number |
| מגדר | Gender |
| בחירה | Choose |
| הקלד/י כאן... | Type here... |

**Functionality:**
- Photo upload optional (per PRD)
- All other fields required (per PRD)
- Gender is a dropdown (not free text)
- Date of birth uses date picker
- "Continue" → validates all required fields → proceeds to Screen 5 (Questionnaire — content TBD)
- "Back" → return to role selection

---

### 4.5 Screen 5 — Practitioner Registration Form (Questionnaire Placeholder)

**Figma Node:** `1:13354`

**Layout:**
- Same header as Screen 4: "שמחים שבחרת להצטרף אלינו!" + same subtitle
- **5 form fields** (all labeled "לורם איפסום" — placeholder text):
  - All text inputs, same styling as Screen 4
  - Labels and field content are placeholder — actual questionnaire content is MISSING per PRD
- **Bottom buttons:** "המשך" (Continue) + "חזור" (Back)
- Progress bar: ~90% filled

**Note:** This screen appears to be the personalized questionnaire step referenced in the PRD (Step 6 of patient onboarding). The field labels are all placeholder ("לורם איפסום" = Lorem ipsum). Actual questions are pending business input per PRD.

**Functionality:**
- Dynamic form — questions will be defined later
- May have male/female variants per PRD
- "Continue" → triggers practitioner matching → show results
- "Back" → return to patient registration form

---

### 4.6 Practitioner Path — Screen 6: Personal Details & Bank Info

**Figma Node:** `1:13249`

> After selecting "מטפל/ת" on the Role Selection screen (4.3), the practitioner enters a multi-step registration flow. This is Screen 6 — the first practitioner-specific screen.

**Layout:**
- Title: "שמחים שבחרת להצטרף אלינו!" (40px, Demi-bold)
- Subtitle: "זה יכול להיות מגע, איזון, או רגע אחד של שקט באמצע כל הרעש, ב-Heali תוכלו למצוא מגוון מטפלים מוסמכים בתחומים שונים ולבחור את מי שמרגיש לכם נכון - כי ריפוי מתחיל קודם כול בחיבור אישי." (18px, Light, `#666`)
- **Profile photo upload:** 144x144px square, gray bg (`#F4F7F7`), rounded-[8px], upload arrow icon centered. Below: "העלאת תמונה" button (bordered black, 141px wide, rounded-[8px])
- **Form fields (all stacked, 499px wide):**
  - שם מלא (Full name) — text input, placeholder "הקלד/י כאן..."
  - תאריך לידה (Date of birth) — date input, placeholder "00/00/00000"
  - עיר מגורים (City of residence) — text input, placeholder "הקלד/י כאן..."
  - מספר נייד (Mobile number) — text input, placeholder "הקלד/י כאן..."
  - מגדר (Gender) — dropdown select with chevron icon, placeholder "בחירה"
- **Bank Details Section** ("פרטי חשבון בנק", 26px, Medium):
  - שם הבנק (Bank name) — text input, full width (417px), e.g. "דיסקונט"
  - Row with 3 fields:
    - מספר חשבון בנק (Bank account number) — 191px wide, e.g. "11047378738"
    - מספר סניף (Branch number) — 99px wide, e.g. "065"
    - מספר בנק (Bank number) — 99px wide, e.g. "11"
- **Bottom buttons:** "המשך" (Continue) + "חזור" (Back)
- Progress bar: ~25% filled

| Hebrew (HE) | English (EN) |
|---|---|
| שמחים שבחרת להצטרף אלינו! | Happy you chose to join us! |
| זה יכול להיות מגע, איזון, או רגע אחד של שקט באמצע כל הרעש... | It can be touch, balance, or one moment of quiet in the middle of all the noise... |
| העלאת תמונה | Upload photo |
| שם מלא | Full name |
| תאריך לידה | Date of birth |
| עיר מגורים | City of residence |
| מספר נייד | Mobile number |
| מגדר | Gender |
| בחירה | Choose |
| הקלד/י כאן... | Type here... |
| פרטי חשבון בנק | Bank account details |
| שם הבנק | Bank name |
| מספר בנק | Bank number |
| מספר סניף | Branch number |
| מספר חשבון בנק | Bank account number |

**Functionality:**
- Photo upload optional
- All personal detail fields required
- Gender is a dropdown (not free text)
- Date of birth uses date picker
- Bank details required for practitioner payouts
- Bank fields are numeric-only (account, branch, bank number)
- "Continue" → validates all required fields → proceeds to Screen 7 (Professional Profile)
- "Back" → return to role selection

---

### 4.7 Practitioner Path — Screen 7: Professional Profile

**Figma Node:** `1:13730`

**Layout:**
- Title: "הפרטים האלו יעזרו למשתמשים אחרים להכיר אותך טוב יותר ולהבין את הייחוד שלך" (40px, Demi-bold, multiline, right-aligned, width 691px)
- **Form fields (all stacked, 499px wide):**
  - שפות (Languages) — dropdown multi-select with chips. Selected values appear as removable chips inside the input (e.g., "עברית ✕"). Chip styling: gradient bg (`#EBECEC` → white), rounded-[5px], 14px Regular, 23px height, with ✕ icon (8px)
  - אודות (About) — **textarea**, 157px tall, placeholder "הקלד/י כאן..."
  - תיאור הסמכה (Certification description) — **textarea**, 157px tall, placeholder "הקלד/י כאן..."
- **Bottom buttons:** "המשך" (Continue) + "חזור" (Back)
- Progress bar: ~40% filled

| Hebrew (HE) | English (EN) |
|---|---|
| הפרטים האלו יעזרו למשתמשים אחרים להכיר אותך טוב יותר ולהבין את הייחוד שלך | These details will help other users get to know you better and understand your uniqueness |
| שפות | Languages |
| עברית | Hebrew |
| אודות | About |
| תיאור הסמכה | Certification description |
| הקלד/י כאן... | Type here... |

**Functionality:**
- Languages is a multi-select dropdown with chip display (add/remove languages)
- About textarea is free-text biography (shown on practitioner profile)
- Certification description is free-text (explains practitioner's qualifications)
- All fields required
- "Continue" → proceeds to Screen 8 (Treatment Areas)
- "Back" → return to Personal Details

---

### 4.8 Practitioner Path — Screen 8: Treatment Areas

**Figma Nodes:** `1:13799` (empty state), `1:13882` (with uploaded document)

> This screen can be repeated — practitioners can add multiple treatment areas via the "הוספת תחום טיפול נוסף +" link.

**Layout (Empty State — 1:13799):**
- Title: "ספר לנו קצת על תחומי הטיפול שלך" (40px, Demi-bold)
- **Treatment area form (499px wide):**
  - תחום טיפול (Treatment field) — dropdown select, placeholder "בחירה", full width
  - תחום התמחות (Specialization) — dropdown select, placeholder "בחירה", full width
  - **Price row (two fields side by side):**
    - מחיר לטיפול (Price per treatment) — text input, 331px wide, placeholder "הקלד/י כאן..."
    - מודל (Model) — dropdown select, 147px wide, value "לפי שעה" (Per hour), with small chevron
  - **Certificate section:**
    - Title: "תעודת הסמכה" (30px, Regular)
    - Upload button: "העלאת קובץ +" — bordered (black), centered text, 246px wide, rounded-[8px]
- **Link:** "הוספת תחום טיפול נוסף +" (16px, Regular, black, underlined) — adds another treatment area block
- **Bottom buttons:** "המשך" (Continue) + "חזור" (Back)
- Progress bar: ~55% filled

**Layout (With Uploaded Document — 1:13882):**
- Same as empty state, but the certificate section shows:
  - **Uploaded file row** inside a bordered container (border `#CDDBDB`, rounded-[10px], 52px height, full width):
    - Right side: Link icon (chain) + file name ("שם המסמך", 14px, teal `#21544E`) + file size ("142 kb", 14px, `#666`)
    - Left side: Delete icon (trash, red-tinted)

| Hebrew (HE) | English (EN) |
|---|---|
| ספר לנו קצת על תחומי הטיפול שלך | Tell us a bit about your treatment areas |
| תחום טיפול | Treatment field |
| תחום התמחות | Specialization |
| מחיר לטיפול | Price per treatment |
| מודל | Model |
| לפי שעה | Per hour |
| בחירה | Choose |
| תעודת הסמכה | Certification document |
| העלאת קובץ + | Upload file + |
| הוספת תחום טיפול נוסף + | Add another treatment area + |
| שם המסמך | Document name |

**Functionality:**
- Treatment field and Specialization are dependent dropdowns (specialization options filter based on selected treatment field)
- Price is numeric input in ILS (₪)
- Model dropdown: "לפי שעה" (per hour) and potentially other options
- Certificate upload accepts PDF, JPG, PNG (per PRD)
- Uploaded documents show inline with name, size, link icon, and delete option
- Delete icon removes the uploaded certificate
- "הוספת תחום טיפול נוסף +" duplicates the entire treatment area block (treatment field, specialization, price, model, certificate) to allow multiple treatment domains
- At least one complete treatment area required
- "Continue" → proceeds to Screen 9 (Google Calendar Connection)
- "Back" → return to Professional Profile

---

### 4.9 Practitioner Path — Screen 9: Google Calendar Connection

**Figma Node:** `1:19943`

**Layout:**
- Title: "חיבור ליומן גוגל שלך" (40px, Demi-bold)
- Subtitle: "זה יכול להיות מגע, איזון, או רגע אחד של שקט באמצע כל הרעש, ב-Heali תוכלו למצוא מגוון מטפלים מוסמכים בתחומים שונים ולבחור את מי שמרגיש לכם נכון - כי ריפוי מתחיל קודם כול בחיבור אישי." (18px, Light, `#666`)
- **Two form fields (499px wide):**
  - כתובת מייל (Email address) — text input, placeholder "הקלד/י כאן..."
  - סיסמה (Password) — password input, placeholder "הקלד/י כאן..."
- **Bottom buttons:** "המשך" (Continue) + "חזור" (Back)
- Progress bar: ~85% filled

| Hebrew (HE) | English (EN) |
|---|---|
| חיבור ליומן גוגל שלך | Connect to your Google Calendar |
| כתובת מייל | Email address |
| סיסמה | Password |
| הקלד/י כאן... | Type here... |

**Functionality:**
- This connects the practitioner's Google Calendar for availability management
- In production, this should trigger Google OAuth for Calendar API scope (not collect raw credentials)
- Email + Password fields shown in Figma — implementation should use OAuth popup instead
- "Continue" → completes registration → proceeds to Screen 10 (Submission Confirmation)
- "Back" → return to Treatment Areas

---

### 4.10 Practitioner Path — Screen 10: Submission Confirmation

**Figma Node:** `1:13975`

**Layout:**
- **Centered content block** (460px wide, top ~231px):
  - **Confirmation illustration:** 177px circle with person silhouette, light green gradient background, decorative sparkle icons around it
  - Title: "הפרטים התקבלו בהצלחה" (40px, Demi-bold)
  - Description (multiline, centered, 18px, Light, `#666`):
    - "הפרטים שלך נמצאים כעת בבדיקה על-ידי צוות המערכת."
    - "התהליך עשוי להימשך מספר ימים, ונעדכן אותך ברגע שהפרופיל יאושר."
  - **CTA button:** "לעמוד הבית" — green bg (`#7DE4A8`), black text, 331px wide, rounded-[8px], Poppins Bold 16px
- No bottom navigation buttons (final step before approval)
- Progress bar: 100% filled

| Hebrew (HE) | English (EN) |
|---|---|
| הפרטים התקבלו בהצלחה | Details received successfully |
| הפרטים שלך נמצאים כעת בבדיקה על-ידי צוות המערכת. | Your details are currently being reviewed by the system team. |
| התהליך עשוי להימשך מספר ימים, ונעדכן אותך ברגע שהפרופיל יאושר. | The process may take a few days, and we'll update you as soon as your profile is approved. |
| לעמוד הבית | To home page |

**Functionality:**
- Practitioner registration is complete — status set to "Pending Approval"
- Admin team reviews submitted details (see Section 21)
- Practitioner receives email/notification when profile is approved or rejected
- "לעמוד הבית" button → navigates to public home page
- No edit capability from this screen — practitioner must wait for approval

---

### 4.11 Practitioner Path — Screen 11: Account Approved

**Figma Node:** `1:14034`

> This screen is shown when the practitioner returns after their account has been approved by admin.

**Layout:**
- **Centered content block** (460px wide, top ~231px):
  - **Confirmation illustration:** 177px circle with green checkmark (✓), light green gradient background, decorative sparkle icons
  - Title: "החשבון שלך אושר" (40px, Demi-bold)
  - Description (centered, 18px, Light, `#666`): "החשבון שלך אושר בהצלחה, תוכל להוריד כעת את הברקוד לסריקה עבור המטופל בסוף כל טיפול בשביל שנוכל לאמת את התשלום"
  - **QR download link:** "הורדת קוד QR בקובץ PDF" — blue text (`#2563EB`), 18px, Bold, underlined
  - **CTA button:** "כניסה למערכת" — green bg (`#7DE4A8`), black text, 331px wide, rounded-[8px], Poppins Bold 16px
- No bottom navigation buttons

| Hebrew (HE) | English (EN) |
|---|---|
| החשבון שלך אושר | Your account has been approved |
| החשבון שלך אושר בהצלחה, תוכל להוריד כעת את הברקוד לסריקה עבור המטופל בסוף כל טיפול בשביל שנוכל לאמת את התשלום | Your account has been approved successfully. You can now download the barcode for scanning by the patient at the end of each treatment so we can verify the payment |
| הורדת קוד QR בקובץ PDF | Download QR code as PDF |
| כניסה למערכת | Enter the system |

**Functionality:**
- Shown after admin approves the practitioner's profile
- QR code is generated per practitioner — used by patients to confirm treatment completion
- "הורדת קוד QR בקובץ PDF" → downloads a PDF file containing the practitioner's unique QR code
- "כניסה למערכת" → navigates to Practitioner Dashboard (Section 18)
- QR code can also be viewed/printed later from the practitioner dashboard

---

### 4.12 Login & Registration — Complete Flow Map

```
┌─────────────────────┐
│  Screen 1 (4.1)     │
│  Login / Register   │
│  (Tab Switch)       │
└─────────┬───────────┘
          │ Submit credentials
          ▼
┌─────────────────────┐
│  Screen 2 (4.2)     │
│  Email OTP          │
│  Verification       │
└─────────┬───────────┘
          │ OTP confirmed
          ▼
┌─────────────────────┐
│  Screen 3 (4.3)     │
│  Role Selection     │
│  Patient / Prac     │
└───┬─────────────┬───┘
    │             │
    ▼             ▼
┌─────────┐   ┌──────────────────────┐
│Screen 4 │   │ Screen 6 (4.6)       │
│(4.4)    │   │ Practitioner:        │
│Patient  │   │ Personal Details     │
│Reg Form │   │ & Bank Info          │
└───┬─────┘   └──────────┬───────────┘
    │                     │
    ▼                     ▼
┌─────────┐   ┌──────────────────────┐
│Screen 5 │   │ Screen 7 (4.7)       │
│(4.5)    │   │ Practitioner:        │
│Question │   │ Professional Profile │
│naire    │   │ (Languages, About,   │
└───┬─────┘   │  Certification Desc) │
    │         └──────────┬───────────┘
    ▼                     │
 Matching                 ▼
 Results        ┌──────────────────────┐
 (Section 10)   │ Screen 8 (4.8)       │
                │ Practitioner:        │
                │ Treatment Areas      │
                │ (Domains, Pricing,   │
                │  Certificate Upload) │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Screen 9 (4.9)       │
                │ Practitioner:        │
                │ Google Calendar      │
                │ Connection           │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Screen 10 (4.10)     │
                │ Submission           │
                │ Confirmation         │
                │ (Pending Approval)   │
                └──────────┬───────────┘
                           │ Admin approves
                           ▼
                ┌──────────────────────┐
                │ Screen 11 (4.11)     │
                │ Account Approved     │
                │ (QR Code Download)   │
                │ → Prac Dashboard     │
                └──────────────────────┘
```

### 4.13 Practitioner Registration — Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Two-column layout (form left, teal panel right) on all screens | Yes |
| Progress bar grows across all steps | Yes |
| Continue/Back navigation on all form steps | Yes |
| Profile photo upload (optional) | Yes |
| Personal details: name, DOB, city, phone, gender | Yes |
| Bank details: bank name, bank number, branch, account number | Yes |
| Languages multi-select with removable chips | Yes |
| About textarea (free text biography) | Yes |
| Certification description textarea | Yes |
| Treatment area: domain dropdown | Yes |
| Treatment area: specialization dropdown | Yes |
| Treatment area: price input + pricing model dropdown | Yes |
| Certificate file upload with inline preview (name, size, delete) | Yes |
| Add multiple treatment areas ("הוספת תחום טיפול נוסף +") | Yes |
| Google Calendar connection (email + password / OAuth) | Yes |
| Submission confirmation with review notice | Yes |
| Account approved screen with QR code PDF download | Yes |
| CTA to practitioner dashboard after approval | Yes |

---

## 5. Design Tokens (extracted from Login section)

| Token | Value | Usage |
|---|---|---|
| **Primary Dark** | `#21544E` | Primary buttons, right panel bg, logo area |
| **Primary Green** | `#7DE4A8` | Active tabs, selected card borders, progress bar, accent text |
| **Purple Accent** | `#AD7FFF` | Practitioner role icon |
| **Text Primary** | `#000000` (black) | Headings, labels, active tab text |
| **Text Secondary** | `#666666` | Subtitles, descriptions |
| **Text Placeholder** | `rgba(102,102,102,0.44)` | Input placeholder text |
| **Text Legal** | `rgba(102,102,102,0.4)` | Legal/consent text |
| **Background Light** | `#F7F7F7` | Tab container, social buttons |
| **Background Lighter** | `#F4F7F7` | Secondary buttons, photo upload area |
| **Input Border** | `#CDDBDB` | Form input borders |
| **Card Shadow** | `0px 4px 24px rgba(0,0,0,0.08)` | Selection cards |
| **Border Radius — Input** | `10px` | Inputs, buttons |
| **Border Radius — Card** | `16px` | Selection cards |
| **Border Radius — Small** | `8px` | Photo upload, tab pills, OTP boxes |
| **Font — Heading** | Discovery Fs Demi-bold, 40px | Page titles |
| **Font — Subheading** | Discovery Fs Light, 18px | Subtitles/descriptions |
| **Font — Label** | Discovery Fs Regular, 16px | Form field labels |
| **Font — Input** | Poppins/Arimo Regular, 14px | Input text and placeholders |
| **Font — Button Primary** | Assistant Bold, 16px | Main CTA buttons |
| **Font — Button Secondary** | Discovery Fs Demi-bold / Medium, 16px | Navigation buttons |
| **Font — Logo** | PloniMLv2AAA Bold, 42px, tracking 1.68px | Heali logo |
| **Button Height** | 44px | Primary/secondary action buttons |
| **Input Height** | 48px | Form inputs |

---

## 6. Home Page — Before Login (from Figma)

> **Figma Nodes:** `1:1024`, `1:35` (two variants, virtually identical)

### 6.0 Page Structure Overview

Full-width, long-scrolling landing page with 10 distinct sections. Desktop layout is 1440px wide.

### 6.1 Header / Navigation Bar

**Layout:** Fixed top bar, white background
- **Right side:** "Heali" logo (same branding as login screens)
- **Center:** Navigation links (right-to-left): חיפוש מטפלים | אודות | חבילות טיפול | מאמרים | יצירת קשר
- **Left side:** Two buttons:
  - "התחברות" (Login) — green bg (`#7DE4A8`), pill shape
  - "הרשמה" (Register) — outlined/light, pill shape

| Hebrew (HE) | English (EN) |
|---|---|
| חיפוש מטפלים | Search Practitioners |
| אודות | About |
| חבילות טיפול | Treatment Packages |
| מאמרים | Articles |
| יצירת קשר | Contact Us |
| התחברות | Login |
| הרשמה | Register |

### 6.2 Hero Section

**Layout:** Two-column split
- **Left (~55%):** Large lifestyle image of a person (wellness context), overlapping the content area
- **Right (~45%):** Dark teal overlay background
  - Headline (white, large, ~46px): "כל הכלים במקום אחד בכדי למצוא את המטפל **שמרגיש לך טבעי ונכון.**" (last line bold)
  - Subtext (green `#7DE4A8`, 18px): "בHeali תמצאו את המטפלים שמרגישים לכם נכון, כי ריפוי מתחיל בחיבור אישי."

**Search Bar:** Full-width green-bordered search input overlaying the bottom of the hero
- Placeholder: "חיפוש מטפלים, תחום או תחושה" (Search practitioners, domain, or feeling)
- CTA text: "מצא את הטיפול שלך" (Find your treatment)
- **Popular category pills** below the search bar: פסיכולוגיה | יוגה | מדיטציה | דיקור סיני
- Label: "קטגוריות פופולריות" (Popular categories)

| Hebrew (HE) | English (EN) |
|---|---|
| כל הכלים במקום אחד בכדי למצוא את המטפל שמרגיש לך טבעי ונכון. | All the tools in one place to find the practitioner that feels natural and right for you. |
| מצא את הטיפול שלך | Find your treatment |
| חיפוש מטפלים, תחום או תחושה | Search practitioners, domain, or feeling |
| קטגוריות פופולריות | Popular categories |
| פסיכולוגיה | Psychology |
| יוגה | Yoga |
| מדיטציה | Meditation |
| דיקור סיני | Acupuncture |

### 6.3 Treatment Domains Carousel

**Section title:** "הכירו את עולמות הריפוי שלנו" (Discover our healing worlds)
**Subtitle:** "תתחילו לגלות, לבחור ולהרגיש מה באמת עושה לכם טוב." (Start discovering, choosing, and feeling what truly does you good.)

**Layout:** Horizontal scrollable carousel with domain cards
- Each card shows:
  - Domain image/icon (circular or card-style thumbnail)
  - Domain name
  - Practitioner count: "כ X מטפלים נמצאו בתחום" (~X practitioners found in domain)
- **CTA link:** "צפייה בכל המטפלים" (View all practitioners)
- Navigation: Left/right arrows + dot pagination, play button (auto-scroll?)

| Hebrew (HE) | English (EN) |
|---|---|
| הכירו את עולמות הריפוי שלנו | Discover our healing worlds |
| תתחילו לגלות, לבחור ולהרגיש מה באמת עושה לכם טוב. | Start discovering, choosing, and feeling what truly does you good. |
| כ מטפלים נמצאו בתחום | ~X practitioners found in domain |
| צפייה בכל המטפלים | View all practitioners |

### 6.4 Practitioners Grid

**Section title:** "גלו את המטפלים שלנו (2858)" (Discover our practitioners — with total count)

**Toolbar:**
- Search input: "חפש מטפלים או תחומים..." (Search practitioners or domains...)
- Filter button: "חיפוש" (Search)
- Sort dropdowns: "מיון לפי התמחות" (Sort by specialty) | "מיון לפי קטגוריה" (Sort by category)

**Practitioner Card Layout** (grid of cards, 4 per row):
- Profile photo (circular or rounded)
- Badge: "זמין לקבל היום" (Available to receive today) — green tag
- Name: e.g., "ליאת גולדנברג"
- Short description/bio snippet
- Rating: star + "דרוג 500)" (Rating 500)
- Location: e.g., "יפו - תל אביב"
- **Two action buttons per card:**
  - "צפייה בפרופיל" (View profile) — outlined/secondary
  - "קביעת טיפול" (Book treatment) — primary green
- Category tags on card

| Hebrew (HE) | English (EN) |
|---|---|
| גלו את המטפלים שלנו | Discover our practitioners |
| חפש מטפלים או תחומים... | Search practitioners or domains... |
| חיפוש | Search |
| מיון לפי התמחות | Sort by specialty |
| מיון לפי קטגוריה | Sort by category |
| זמין לקבל היום | Available today |
| דרוג | Rating |
| צפייה בפרופיל | View profile |
| קביעת טיפול | Book treatment |

### 6.5 Treatment Packages Section

**Content:** Horizontal cards showing treatment package offers
- Package description text (placeholder lorem ipsum)
- Count: "כ 16 חבילות" (~16 packages)
- Cards with colored backgrounds (gradient/pastel tones)

| Hebrew (HE) | English (EN) |
|---|---|
| כ 16 חבילות | ~16 packages |

### 6.6 Help / Contact Banner

**Layout:** Full-width dark teal (`#21544E`) banner
- Headline (white, large): "צריכים עזרה? אנחנו כאן בשבילך תמיד." (Need help? We're always here for you.)
- CTA button: "צור איתנו קשר" (Contact us) — green button

| Hebrew (HE) | English (EN) |
|---|---|
| צריכים עזרה? אנחנו כאן בשבילך תמיד. | Need help? We're always here for you. |
| צור איתנו קשר | Contact us |

### 6.7 Video Testimonials / Content Section

**Section title:** "המלצות משתמשים" (User recommendations) — or video content area
- Grid/carousel of video thumbnails with play buttons
- Green play button overlay on video cards
- Various lifestyle/treatment imagery

| Hebrew (HE) | English (EN) |
|---|---|
| המלצות משתמשים | User recommendations |

### 6.8 FAQ Section

**Section title:** "שאלות נפוצות" (Frequently asked questions)
**Subtitle:** "אספנו את כל מה שרציתם לדעת על טיפולים, מטפלים והתהליך כדי שיהיה קל, ברור ופשוט להתחיל." (We gathered everything you wanted to know about treatments, practitioners, and the process to make it easy, clear, and simple to start.)

**Layout:** Expandable accordion items
- Each item shows a question: e.g., "לורם איפסום דולר יאפסום?" (placeholder)
- Expands to show answer text
- Chevron icon for expand/collapse

| Hebrew (HE) | English (EN) |
|---|---|
| שאלות נפוצות | Frequently asked questions |
| אספנו את כל מה שרציתם לדעת על טיפולים, מטפלים והתהליך כדי שיהיה קל, ברור ופשוט להתחיל. | We gathered everything you wanted to know about treatments, practitioners, and the process to make it easy, clear, and simple to start. |

### 6.9 Newsletter Signup

**Layout:** Section with email input
- Headline: "רוצה להתעדכן בכל מה שעושה טוב לגוף ולנפש?" (Want to stay updated on everything good for body and soul?)
- Email input: "כתובת מייל לקבלת עדכונים" (Email address for updates)
- Button: "שליחה" (Send)

| Hebrew (HE) | English (EN) |
|---|---|
| רוצה להתעדכן בכל מה שעושה טוב לגוף ולנפש? | Want to stay updated on everything good for body and soul? |
| כתובת מייל לקבלת עדכונים | Email address for updates |
| שליחה | Send |

### 6.10 Footer

**Layout:** Full-width dark teal (`#21544E`) background, multi-column

**Columns:**
1. **קטגוריות (Categories):** עיסוי טיפולי | רפלקסולוגיה | היפנוזה טיפולית | טיפול בצמחי מרפא
2. **קישורים (Links):** דף הבית | בלוג | שאלות תשובות
3. **About/description text** — lorem ipsum placeholder
4. **Heali logo** — bottom right

**Bottom bar:** נגישות (Accessibility) | פרטיות (Privacy) | תנאי שימוש (Terms of Use) + social media icons (left side)

| Hebrew (HE) | English (EN) |
|---|---|
| קטגוריות | Categories |
| עיסוי טיפולי | Therapeutic massage |
| רפלקסולוגיה | Reflexology |
| היפנוזה טיפולית | Therapeutic hypnosis |
| טיפול בצמחי מרפא | Herbal medicine |
| קישורים | Links |
| דף הבית | Home page |
| בלוג | Blog |
| שאלות תשובות | FAQ |
| נגישות | Accessibility |
| פרטיות | Privacy |
| תנאי שימוש | Terms of Use |

### 6.11 Home Page — Functionality Summary

| Element | Action |
|---|---|
| Nav: חיפוש מטפלים | → Discovery page |
| Nav: אודות | → About page |
| Nav: חבילות טיפול | → Treatment packages page |
| Nav: מאמרים | → Articles page |
| Nav: יצירת קשר | → Contact page |
| Nav: התחברות | → Login screen (Section 4.1) |
| Nav: הרשמה | → Register tab on login screen |
| Hero search bar | → Discovery page with search query |
| Popular category pills | → Discovery page filtered by category |
| Domain carousel cards | → Discovery page filtered by domain |
| "צפייה בכל המטפלים" | → Discovery page (all practitioners) |
| Practitioner card: צפייה בפרופיל | → Practitioner profile page |
| Practitioner card: קביעת טיפול | → Booking flow (requires login) |
| Treatment package cards | → Package detail / booking |
| "צור איתנו קשר" banner | → Contact page |
| Video thumbnails | → Play video (modal or inline) |
| FAQ accordion | → Expand/collapse answer |
| Newsletter "שליחה" | → Subscribe email to newsletter |
| Footer links | → Respective pages |
| Footer: נגישות/פרטיות/תנאי שימוש | → Legal pages |

---

## 7. About Page (from Figma)

> **Figma Node:** `1:13492`

### 7.1 Layout

**Structure:** Full-width single-column page

- **Header:** Same shared navigation bar as Home page (Section 6.1). "אודות" (About) link is bold/active state.
- **Hero Section:** Full-width dark teal (`#21544E`) background with grid pattern overlay (same as login right panel)
  - Section label: "אודות" (About) — white, 24px, top of section
  - Main headline: "!נעים להכיר" (Nice to meet you!) — white, 70px, Discovery Fs
  - Two paragraphs of body text — white, 20px, RTL alignment (currently lorem ipsum placeholder in Figma)
  - **Decorative elements:** Two overlapping circles (dark gray + green `#7DE4A8`) positioned to the left, dotted heart-shaped connector line between them
- **Footer:** Same shared footer as Home page (Section 6.10) — dark `#08190C` background, categories column, links column, Heali logo, social icons (YouTube, Instagram, TikTok, Facebook), legal links (נגישות, פרטיות, תנאי שימוש), "© 2025 Heali"

### 7.2 Text — Hebrew / English

| Hebrew (HE) | English (EN) |
|---|---|
| אודות | About |
| !נעים להכיר | Nice to meet you! |
| (body text is lorem ipsum placeholder) | (pending real content) |

### 7.3 Functionality

| Element | Action |
|---|---|
| Header nav links | Same as Home page navigation (Section 6.11) |
| Footer links | Same as Home page footer (Section 6.10) |

**Notes:**
- Body text is placeholder (lorem ipsum) — actual About content pending from business.
- Page is purely informational, no interactive elements beyond navigation.
- Decorative circles + dotted heart line are visual brand elements, not functional.

---

## 8. Contact Us Page (from Figma)

> **Figma Node:** `1:13610`

### 8.1 Layout

**Structure:** Full-width single-column page, white background for content area

- **Header:** Same shared navigation bar as Home page (Section 6.1). *(Note: In Figma, "אודות" appears bold instead of "יצירת קשר" — likely a Figma inconsistency, should be "יצירת קשר" active on this page.)*

**Content Area:**
- **Headline:** "יצירת קשר" (Contact Us) — 70px, black, Discovery Fs
- **Subheadline:** "אנחנו מאמינים בתקשורת פתוחה" (We believe in open communication) — 40px
- **Description:** "מוזמנים ליצור קשר בכל נושא" (Feel free to contact us about any topic) — 18px

**Contact Methods — Three pill buttons in a row:**
1. Phone: `054-8411474` — with phone icon
2. Email: `info@heali.co.il` — with email icon
3. WhatsApp: `0503-822282` — with WhatsApp icon

**Contact Form Card:**
- White background, rounded-[20px], shadow
- **Fields (stacked):**
  - שם מלא (Full name) — text input
  - טלפון (Phone) — text input
  - אימייל (Email) — text input
  - הודעה (Message) — textarea, ~141px tall
- **Submit button:** "שליחה" (Send) — green pill (`#7DE4A8`), black text

- **Footer:** Same shared footer as Home page (Section 6.10)

### 8.2 Text — Hebrew / English

| Hebrew (HE) | English (EN) |
|---|---|
| יצירת קשר | Contact Us |
| אנחנו מאמינים בתקשורת פתוחה | We believe in open communication |
| מוזמנים ליצור קשר בכל נושא | Feel free to contact us about any topic |
| שם מלא | Full name |
| טלפון | Phone |
| אימייל | Email |
| הודעה | Message |
| שליחה | Send |

### 8.3 Functionality

| Element | Action |
|---|---|
| Phone pill (054-8411474) | → `tel:054-8411474` (initiate phone call) |
| Email pill (info@heali.co.il) | → `mailto:info@heali.co.il` (open email client) |
| WhatsApp pill (0503-822282) | → WhatsApp deep link to this number |
| Contact form "שליחה" | → Validate fields → Submit to server → Show success message |
| Header nav links | Same as Home page navigation (Section 6.11) |
| Footer links | Same as Home page footer (Section 6.10) |

**Form Validation (inferred from field types):**
- Full name: required, text
- Phone: required, Israeli phone format
- Email: required, valid email format
- Message: required, free text

---

## 9. Home Page — After Login (from Figma)

> **Figma Node:** `1:2044` — Figma section name: "After login"

### 9.0 Overview

Authenticated version of the home page. Different header, different hero content, adds sidebar with points and messages, and shows personalized therapist recommendations.

### 9.1 Authenticated Header

**Layout:** Same 1440x80px top bar, but replaces Login/Register buttons with authenticated user controls.

**Right side:** Heali logo + navigation links (order RTL):
- דף בית (Home) | חיפוש מטפלים (Search Therapists) | הטיפולים שלי (My Treatments) | חבילות טיפול (Treatment Packages) | מאמרים (Articles)

**Left side (user controls):**
- Icon bar: notification bell, 2x message icons (20px each) — with red notification dot (6px)
- Points badge: "150 נקודות" (150 points) — teal `#21544E` bg, white text, rounded-[8px], 136x36px, with coin/star icon
- User avatar (44px circle) + name "מאי בוזו" + dropdown chevron

**Key difference from pre-login header:**
- Nav loses: אודות, יצירת קשר
- Nav gains: הטיפולים שלי (My Treatments), דף בית (Home)
- Login/Register buttons → user avatar + points + notifications

| Hebrew (HE) | English (EN) |
|---|---|
| דף בית | Home |
| דף הבית | Home page |
| חיפוש מטפלים | Search Therapists |
| הטיפולים שלי | My Treatments |
| חבילות טיפול | Treatment Packages |
| מאמרים | Articles |
| 150 נקודות | 150 points |

### 9.2 Hero Section

**Layout:** Full-width banner with masked background image and decorative ellipse

- **Headline:** "כאן מתחיל החיבור האמיתי שלכם" (This is where your real connection begins) — large, ~838px wide
- **Subheadline:** "כתבו מה אתם מחפשים, ואנו נציג בפניכם מטפלים ותחומים מקצועיים שיכולים להתאים לצרכים האישיים שלכם, מתוך אמינות ושקט נפשי מלא."

**Search bar (840x62px):**
- Placeholder: "חיפוש מטפלים, תחום או תחושה..." (Search therapists, field, or feeling...)
- CTA button: "מצא את הטיפול שלך" (Find your treatment) — 191x42px, with AI magic wand icon (vuesax/bold/magicpen) + sparkle icon

| Hebrew (HE) | English (EN) |
|---|---|
| כאן מתחיל החיבור האמיתי שלכם | This is where your real connection begins |
| כתבו מה אתם מחפשים, ואנו נציג בפניכם מטפלים ותחומים מקצועיים שיכולים להתאים לצרכים האישיים שלכם, מתוך אמינות ושקט נפשי מלא. | Write what you're looking for, and we'll present therapists and professional fields that can fit your personal needs, with full reliability and peace of mind. |
| חיפוש מטפלים, תחום או תחושה... | Search therapists, field, or feeling... |
| מצא את הטיפול שלך | Find your treatment |

### 9.3 My Points Widget (Left Sidebar)

**Layout:** Small card, 266x102px, positioned in sidebar area

| Hebrew (HE) | English (EN) |
|---|---|
| הנקודות שלי | My points |
| צברת 150 נקודות | You accumulated 150 points |
| עוד 120 נקודות תקבל מאיתנו טיפול חינם | 120 more points and you'll get a free treatment from us |

### 9.4 Recent Messages Sidebar

**Layout:** Left column, 346x609px, below points widget

- **Section heading:** "הודעות אחרונות" (Recent messages)
- **4 message cards** (346x114px each):
  - Sender name: "ליאת גולדנברג" (placeholder)
  - Timestamp badge: "היום ב-6:10PM" (Today at 6:10PM)
  - Message preview text (lorem ipsum placeholder)
  - Thumbnail image (90x90px, rounded) with verified badge (badge-check icon)
- **Bottom link:** "צפייה בכל ההודעות" (View all messages) — 346x42px

| Hebrew (HE) | English (EN) |
|---|---|
| הודעות אחרונות | Recent messages |
| היום ב-6:10PM | Today at 6:10PM |
| צפייה בכל ההודעות | View all messages |

### 9.5 Therapist Recommendation Sections (Main Content)

**Layout:** Right area, 980px wide, 3 sections stacked vertically, each containing a row of 3 practitioner cards.

**Section headings:**

| Hebrew (HE) | English (EN) |
|---|---|
| מטפלים בהתאמה אישית | Therapists in personal match |
| מטפלים על בסיס חיפושים אחרונים | Therapists based on recent searches |
| מטפלים שזמינים השבוע | Therapists available this week |

**Practitioner cards:** Same card design as Home pre-login (Section 6.4) — 300x408px each, with:
- Profile photo area (300x177px) with gradient background
- Favorite/save heart icon (top corner)
- Availability badge variations: "זמין לקבל היום" / "זמין לקבל השבוע" / "זמין לקבל החודש"
- Name, description, rating (4.8/5), location, category tag pills
- Two action buttons: "צפייה בפרופיל" + "קביעת טיפול"

| Hebrew (HE) | English (EN) |
|---|---|
| זמין לקבל היום | Available to receive today |
| זמין לקבל השבוע | Available to receive this week |
| זמין לקבל החודש | Available to receive this month |

### 9.6 Help Banner + Footer

Same as Home pre-login (Sections 6.6 and 6.10). Footer categories column adds "מדיטציה" (Meditation).

### 9.7 Home After Login — Functionality Summary

| Element | Action |
|---|---|
| Nav: דף בית | → Current page (home) |
| Nav: חיפוש מטפלים | → Looking for Therapists page (Section 10) |
| Nav: הטיפולים שלי | → My Treatments page |
| Nav: חבילות טיפול | → Treatment Packages page |
| Nav: מאמרים | → Articles page |
| Points badge | → Points/rewards detail page (TBD) |
| Notification icon | → Notifications panel/page |
| Message icons | → Messages page |
| User avatar dropdown | → Profile menu (settings, logout) |
| Hero search bar | → Discovery page with search query |
| "מצא את הטיפול שלך" | → Triggers AI-assisted search |
| Points widget | → Points/rewards detail |
| "צפייה בכל ההודעות" | → Full messages page |
| Message card click | → Open conversation with that practitioner |
| Practitioner card: צפייה בפרופיל | → Profile Therapists page (Section 11) |
| Practitioner card: קביעת טיפול | → Booking flow |
| Practitioner card: heart icon | → Toggle save to favorites |

---

## 10. Looking for Therapists (from Figma)

> **Figma Node:** `1:7091` — Figma section name: "Looking for therapists"

### 10.0 Overview

Practitioner search/discovery page with left sidebar filters and a grid of practitioner cards. Authenticated users only.

### 10.1 Layout

**Structure:** 1440x2533px page, two-column layout
- **Header:** Authenticated header (same as Section 9.1, "חיפוש מטפלים" is bold/active)
- **Page title:** "חיפוש מטפלים" (Search Therapists) — top-right breadcrumb, 180x18px
- **Left sidebar:** Filter panel (385x763px, x=30, y=190)
- **Right main area:** Therapist card grid (940x1752px, x=450, y=190)
- **Footer:** Same shared footer

### 10.2 Filter Panel (Left Sidebar)

**Section heading:** "פילטרים" (Filters) — 345px wide

**Filter controls (top to bottom):**

1. **Free text search:** placeholder "חיפוש חופשי..." (Free search...) — text input with search icon, 345x50px
2. **Category dropdown:** "מיון לפי קטגוריה" (Sort by Category) — with chevron, 345x50px
3. **Specialty dropdown:** "מיון לפי התמחות" (Sort by Specialty) — with chevron, 345x50px
4. **Price range slider:** "מ - מחיר: ₪40 עד מחיר: ₪40" (From Price: ₪40 to Price: ₪40) — dual-handle slider, 345x37px
5. **Gender dropdown:** "מיון לפי מגדר" (Sort by Gender) — with chevron, 345x50px
6. **Area search:** placeholder "חפש לפי אזור..." (Search by Area...) — with chevron, 345x50px
7. **Availability dropdown:** "מיון לפי זמינות" (Sort by Availability) — with chevron, 345x50px
8. **Rating slider:** "חפש לפי דירוג : 4 כוכבים" (Search by Rating: 4 Stars) — single-handle slider with star icon, 345x49px

**Submit button:** "חיפוש" (Search) — 345x50px, bottom of filters

| Hebrew (HE) | English (EN) |
|---|---|
| פילטרים | Filters |
| חיפוש חופשי... | Free search... |
| מיון לפי קטגוריה | Sort by Category |
| מיון לפי התמחות | Sort by Specialty |
| מ - מחיר: ₪40 עד מחיר: ₪40 | From - Price: ₪40 to Price: ₪40 |
| מיון לפי מגדר | Sort by Gender |
| חפש לפי אזור... | Search by Area... |
| מיון לפי זמינות | Sort by Availability |
| חפש לפי דירוג : 4 כוכבים | Search by Rating: 4 Stars |
| חיפוש | Search |

### 10.3 Therapist Cards Grid

**Layout:** 3 columns x 4 rows (12 cards), 300x408px each, 20px column gap, ~40px row gap

**Card structure:** Identical to Home page cards (Section 6.4 / 9.5):
- Image area with availability badge "זמין לקבל היום" + verified icon
- Favorite heart icon (top corner)
- Name, description, rating, location, category tags, divider
- Two buttons: "צפייה בפרופיל" + "קביעת טיפול"

### 10.4 Looking for Therapists — Functionality Summary

| Element | Action |
|---|---|
| Filter: חיפוש חופשי | → Free-text search across practitioners/domains |
| Filter: מיון לפי קטגוריה | → Dropdown: filter by treatment category |
| Filter: מיון לפי התמחות | → Dropdown: filter by specialty |
| Filter: Price range slider | → Filter by price range (dual handles) |
| Filter: מיון לפי מגדר | → Dropdown: filter by gender |
| Filter: חפש לפי אזור | → Dropdown/search: filter by geographic area |
| Filter: מיון לפי זמינות | → Dropdown: filter by availability |
| Filter: Rating slider | → Filter by minimum star rating |
| "חיפוש" button | → Apply all filters, refresh grid results |
| Card: צפייה בפרופיל | → Profile Therapists page (Section 11) |
| Card: קביעת טיפול | → Booking flow (requires login) |
| Card: heart icon | → Toggle save to favorites |

---

## 11. Profile Therapists (from Figma)

> **Figma Nodes:** `1:7855` (State 1 — not in favorites), `1:8263` (State 2 — in favorites)
> **Figma section name:** "profile therapists"

### 11.0 Overview

Full practitioner profile page. Two variants represent the favorites toggle state. Page has a sticky left sidebar with action buttons and a scrollable right content area.

### 11.1 Layout

**Structure:** bg `#fafafa`, two-column layout
- **Header:** Authenticated header (same as Section 9.1, "חיפוש מטפלים" is bold/active)
- **Back button:** "חזור" (Back) — top-right, 24px, with circular arrow icon (46px), positioned at x=1290
- **Left sidebar:** Action card (411x376px, white bg, border `#e5e5e5`, rounded-[8px])
- **Right content area:** Profile info + scrollable sections (~943px wide)

### 11.2 Profile Header (Right Content)

**Layout:** Horizontal — photo on right, info on left

- **Profile photo:** 181x181px, rounded-[22.8px], border `#e5e5e5` 2.28px, with background image
- **Name:** "ליאת גולדנברג" — 26px, Medium weight
- **Badge:** "מדורגת גבוהה" (Highly rated) — purple pill, bg `#e9deff`, text `#ad80ff`, with trophy icon, rounded-full, 118x27px
- **Rating:** star icon + "4.8/5 (דרוג 500)" — 16px
- **Info row (3 items with icons, RTL):**
  - Location: globe icon + "יפו - תל אביב" — 14px, `#575757`
  - Languages: message icon + "שפות: עברית, אנגלית, רוסית, ספרדית" — 14px, `#575757`
  - Price: wallet icon + "מחיר לטיפול : 150₪" — 14px, `#575757`
- **Category tags:** pill tags "מדיטציה טיפולית" + "דיקור סיני" — 12px, border `#d7d7d7`, gradient bg, rounded-full

| Hebrew (HE) | English (EN) |
|---|---|
| חזור | Back |
| מדורגת גבוהה | Highly rated |
| יפו - תל אביב | Jaffa - Tel Aviv |
| שפות: עברית, אנגלית, רוסית, ספרדית | Languages: Hebrew, English, Russian, Spanish |
| מחיר לטיפול : 150₪ | Price per treatment: 150₪ |
| מדיטציה טיפולית | Therapeutic meditation |
| דיקור סיני | Acupuncture |

### 11.3 Left Sidebar — Action Card

**Layout:** White card, border `#e5e5e5`, rounded-[8px], 411x376px

**3 action buttons (stacked, 331px wide each):**

| Button | Style | State 1 (1:7855) | State 2 (1:8263) |
|---|---|---|---|
| קביעת תורים (Book appointments) | Green `#7de4a8`, bold 16px, rounded-[8px], with edit icon | Same | Same |
| שליחת הודעה (Send message) | Gray `#f4f7f7`, medium 16px, rounded-[8px], with message icon | Same | Same |
| Favorites toggle | Gray `#f4f7f7`, medium 16px, rounded-[8px], with heart icon | שמירה במעודפים (Save to favorites) | הסרה מהמעודפים (Remove from favorites) |

**Below buttons:** 3 lines of placeholder text with checkmarks (lorem ipsum ✓)

| Hebrew (HE) | English (EN) |
|---|---|
| קביעת תורים | Book appointments |
| שליחת הודעה | Send message |
| שמירה במעודפים | Save to favorites |
| הסרה מהמעודפים | Remove from favorites |

### 11.4 About Me Section

- **Heading:** "קצת עלי" (A bit about me) — 26px, Medium
- **Body:** Lorem ipsum placeholder text — 16px, Light, `#9f9f9f`, 664px wide

| Hebrew (HE) | English (EN) |
|---|---|
| קצת עלי | A bit about me |

### 11.5 Certification Section

- **Heading:** "הסמכה" (Certification) — 26px, Medium
- **Body:** Real content example — "לימודי מטפל ברפואה סינית 4 שנים במכללת רידמן כנרת. לאורך כל שנותי העשרתי את עצמי בקורסי המשך שצללו להבנת המנגנונים של הרפואה הסינית, העמקה בצמחי מרפא סינים ובשלל שיטות תומכות כמו קנזיוטייפינג, דיקור קרקפת, שיטת האיזון של דר טאן ועוד..."

| Hebrew (HE) | English (EN) |
|---|---|
| הסמכה | Certification |
| לימודי מטפל ברפואה סינית 4 שנים במכללת רידמן כנרת... | 4 years of Chinese medicine therapist studies at Ridman Kinneret College... |

### 11.6 Articles Section

- **Heading:** "מאמרים" (Articles) — 30px, Demi-bold
- **3 article cards** (horizontal row, ~246px wide each):
  - Article image (246x184px, rounded top corners)
  - Category tag pill: "דיקור סיני" + date pill: "09/10/2025"
  - Title: "שם המאמר לורם איפסום" (Article name lorem ipsum) — 16px, Medium
  - Description: placeholder text — 14px, Light, `#9f9f9f`
  - Author line: "פורסם ע"י מאי בוזו" (Published by Mai Buzo) + profile thumbnail (31px)
  - Share/link icon (28px) bottom-left

| Hebrew (HE) | English (EN) |
|---|---|
| מאמרים | Articles |
| שם המאמר לורם איפסום | Article name (placeholder) |
| פורסם ע"י מאי בוזו | Published by Mai Buzo |

### 11.7 Comments/Reviews Section

- **Heading:** "תגובות (473)" (Comments (473)) — 20px, Demi-bold
- **Link:** "צפייה בכל התגובות" (View all comments) — 16px, Light, left-aligned
- **4 review cards** in 2x2 grid (each 399px wide, white bg, border `#f4f4f4`, rounded-[8px]):
  - User avatar: gray circle (42px) with initial letter "A"
  - User name: "מאי בוזו" — 16px, Regular
  - Time: "שלושה שבועות" (Three weeks) — 14px, `#9f9f9f`
  - Star rating row: 5 stars (gold, 112x15px)
  - Review text: placeholder lorem ipsum — 14px, Light, 72px tall

| Hebrew (HE) | English (EN) |
|---|---|
| תגובות | Comments |
| צפייה בכל התגובות | View all comments |
| שלושה שבועות | Three weeks |

### 11.8 Similar Practitioners Section

- **Heading:** "מטפלים דומים" (Similar practitioners) — 30px, Demi-bold
- **3 practitioner cards** (same card design as Section 6.4 / 10.3) — 300x408px each, horizontal row
- Same card structure: photo, availability badge, name, description, rating, location, price tag "מחיר לשעה:146" (Price per hour: 146), two action buttons

| Hebrew (HE) | English (EN) |
|---|---|
| מטפלים דומים | Similar practitioners |
| מחיר לשעה:146 | Price per hour: 146 |

### 11.9 Sticky Sidebar Note

The word "sticky" appears in the Figma design at bottom-left (60px, SemiBold, with a horizontal line) — this is a design annotation indicating the left sidebar action card should be **position: sticky** while the right content scrolls.

### 11.10 Profile Therapists — Functionality Summary

| Element | Action |
|---|---|
| "חזור" back button | → Navigate back (to search results or previous page) |
| "קביעת תורים" | → Open booking/appointment flow |
| "שליחת הודעה" | → Open message/chat with this practitioner |
| "שמירה במעודפים" | → Add practitioner to favorites (toggles to "הסרה מהמעודפים") |
| "הסרה מהמעודפים" | → Remove practitioner from favorites (toggles to "שמירה במעודפים") |
| Article card click | → Open article detail page |
| "צפייה בכל התגובות" | → Expand or navigate to full reviews list |
| Similar practitioner: צפייה בפרופיל | → Navigate to that practitioner's profile |
| Similar practitioner: קביעת טיפול | → Open booking flow for that practitioner |

---

## 12. Treatment Order Section (from Figma)

> **Figma Source:** 3 modal screens covering appointment scheduling, order summary, and booking confirmation. These modals overlay the Practitioner Profile page (Section 11) with a dark backdrop (`rgba(0,0,0,0.62)`).

### 12.0 Shared Modal Behavior

- All 3 modals appear as **overlay dialogs** on top of the Practitioner Profile page
- Dark semi-transparent backdrop: `rgba(0,0,0,0.62)`, full viewport
- Modals are centered horizontally and vertically
- White background, `rounded-[16px]`
- Close button (X icon, 33px) positioned top-left of modal

### 12.1 Screen 1 — Appointment Scheduling Modal

**Figma Node:** `1:17871`

**Container:** White bg, `rounded-[16px]`, `px-[21px] py-[34px]`, content width 479px

**Layout (top to bottom, RTL-aligned):**

1. **Title:** "הזמנת טיפול" — 20px, Medium, black
2. **Subtitle:** "מלא/י את הפרטים הבאים כדי להשלים את ההזמנה." — 16px, Light, `#9f9f9f`

3. **Treatment Type Dropdown:**
   - White bg, border `#cddbdb`, `rounded-[10px]`, height 50px
   - Angle-down chevron icon (24px) on the left side
   - Selected value: "דיקור סיני" — 14px, Poppins Regular, `#666`, right-aligned

4. **Date Range Navigator:**
   - Center text: "01 מרץ 2025 - 31 אפריל 2025" — 14px, Discovery Fs Regular, black
   - Left arrow (30px, rotated 180°) and right arrow (30px) for navigation

5. **Week Day Strip** (7 columns, RTL order):
   - Day names: 12px, Regular, `rgba(24,24,24,0.8)`, center-aligned
   - Day numbers: 14px, Medium, black, center-aligned
   - Column width: ~63.7px each (except selected: 35px)
   - **Selected day** (e.g., "רביעי" / 28): text `#13d464`, bg `#e0ffed`, border `#13d464` 1px, `rounded-[10px]`, `p-[10px]`
   - **Days with availability:** small green dot (4px, `#13d464`, `rounded-[28px]`) below the number
   - Days shown (sample): ראשון 1, שני 30, שלישי 29, רביעי 28, חמישי 27, שישי 26, שבת 25

6. **Divider line**

7. **Time Slot Sections** (3 groups):
   - **"שעות בוקר"** (Morning hours) — 14px, Regular, with sun/morning icon (20px)
     - Row of 4 time slots + 1 selected slot below
     - Each slot: 111px wide, 40px tall, border `#dcdcdc`, `rounded-[8px]`, "09:30" centered 14px Regular
     - **Selected slot:** bg `#e0ffed`, border `#13d464`, text `#13d464`
   - **"שעות צהריים"** (Afternoon hours) — 14px, Regular, with midday sun icon (20px)
     - Row of 4 time slots (same styling as morning)
   - **"שעות ערב"** (Evening hours) — 14px, Regular, with moon/evening icon (20px)
     - Row of 4 time slots (same styling as morning)

8. **CTA Button:** "הזמנת טיפול" — bg `#7de4a8`, `rounded-[8px]`, width 468px, `px-[10px] py-[12px]`, text `#08190c` 16px Poppins Bold, center-aligned

| Hebrew (HE) | English (EN) |
|---|---|
| הזמנת טיפול | Order treatment |
| מלא/י את הפרטים הבאים כדי להשלים את ההזמנה. | Fill in the following details to complete the order. |
| דיקור סיני | Acupuncture |
| מרץ | March |
| אפריל | April |
| ראשון | Sunday |
| שני | Monday |
| שלישי | Tuesday |
| רביעי | Wednesday |
| חמישי | Thursday |
| שישי | Friday |
| שבת | Saturday |
| שעות בוקר | Morning hours |
| שעות צהריים | Afternoon hours |
| שעות ערב | Evening hours |

**Functionality:**
- User selects treatment type from dropdown (pre-filled from practitioner's offerings)
- Navigate date range with left/right arrows
- Select a day from the week strip (green highlight + availability dots indicate open slots)
- Select a time slot from the morning/afternoon/evening groups
- Tap "הזמנת טיפול" → opens Order Summary Modal (Screen 2)

### 12.2 Screen 2 — Order Summary Modal

**Figma Node:** `1:18389`

**Container:** White bg, `rounded-[16px]`, 474px × 596px, centered

**Close Button:** X icon (33px) at position `left-[16px] top-[18px]`

**Layout (centered content, width 378px, RTL-aligned):**

1. **Treatment Title:** "טיפול דיקור סיני" — 26px, Demi-bold, black, right-aligned (w-[187px])
2. **Date/Time:** "יום חמישי, 28/10, 11:00 - 12:00" — 16px, Light, `#9f9f9f`

3. **Divider line**

4. **Section Heading:** "סיכום הזמנה" — 24px, Regular, black, right-aligned

5. **Price Breakdown** (justify-between rows):
   - "סה"כ מחיר לטיפול" → "₪150" — 16px, Light, `#9f9f9f`
   - "מע"מ (20%)" → "₪50" — 16px, Light, `#9f9f9f`
   - "סה"כ" → "₪200" — 18px, Medium, `#575757`

6. **Divider line**

7. **Package Upsell Section:**
   - Flash/lightning icon (16px) + "חבילה משתלמת" — 22px, Medium, `#13d464`
   - "שדרג את החוויה שלך עם חבילת הטיפולים וחסוך משמעותית." — 16px, Light, `#9f9f9f`
   - "למידע נוסף ורכישת חבילה" — 18px, Medium, `#575757`, **underlined** (link)

8. **Package Redemption Checkbox:**
   - Checkbox: 22px × 22px, bg `#f0f0f0`, border black 1px, `rounded-[2px]`
   - Label: "מימוש טיפול מהחבילה שלי (06/10)" — 16px, Light, black

9. **CTA Button:** "אישור והזמנה" — bg `#7de4a8`, `rounded-[8px]`, full content width (378px), `px-[10px] py-[12px]`, text `#08190c` 16px Poppins Bold, center-aligned

| Hebrew (HE) | English (EN) |
|---|---|
| טיפול דיקור סיני | Acupuncture treatment |
| יום חמישי, 28/10, 11:00 - 12:00 | Thursday, 28/10, 11:00 - 12:00 |
| סיכום הזמנה | Order summary |
| סה"כ מחיר לטיפול | Total treatment price |
| מע"מ (20%) | VAT (20%) |
| סה"כ | Total |
| חבילה משתלמת | Worthwhile package |
| שדרג את החוויה שלך עם חבילת הטיפולים וחסוך משמעותית. | Upgrade your experience with treatment packages and save significantly. |
| למידע נוסף ורכישת חבילה | For more info and package purchase |
| מימוש טיפול מהחבילה שלי (06/10) | Redeem treatment from my package (06/10) |
| אישור והזמנה | Confirm and order |

**Functionality:**
- Close button (X) → dismiss modal, return to profile page
- Review order details (treatment, date/time, pricing)
- Package upsell link → navigates to package info/purchase page
- Checkbox toggles package redemption (06/10 = 6 of 10 treatments used)
- Tap "אישור והזמנה" → submit booking → opens Confirmation Modal (Screen 3)

### 12.3 Screen 3 — Booking Confirmation Modal

**Figma Node:** `1:18823`

**Container:** White bg, `rounded-[16px]`, 660px × 492px, `px-[21px] py-[34px]`, centered

**Layout (centered content, width 577px):**

1. **Confirmation Illustration:** 176.93px circle graphic — green checkmark inside concentric green/light-green circles with decorative "+" sparkle elements

2. **Gap:** 51px

3. **Success Title:** "ההזמנה שלך בוצעה בהצלחה" — 30px, Bold, black, center-aligned

4. **Success Messages** (center-aligned, 16px, Light, `#9f9f9f`, leading-[20px]):
   - "הטיפול שלך עם [שם המטפל] נקבע בהצלחה!"
   - "תקבל/י מייל אישור עם כל הפרטים."

5. **Gap:** 40px

6. **CTA Button:** "צפייה בהזמנה" — bg `#7de4a8`, `rounded-[8px]`, width 332px, `px-[10px] py-[12px]`, text `#08190c` 16px Poppins Bold, center-aligned

| Hebrew (HE) | English (EN) |
|---|---|
| ההזמנה שלך בוצעה בהצלחה | Your order was placed successfully |
| הטיפול שלך עם [שם המטפל] נקבע בהצלחה! | Your treatment with [practitioner name] was set successfully! |
| תקבל/י מייל אישור עם כל הפרטים. | You'll receive a confirmation email with all the details. |
| צפייה בהזמנה | View order |

**Functionality:**
- "[שם המטפל]" is a dynamic placeholder — replaced with actual practitioner name
- Confirmation email triggered on booking success (server-side)
- "צפייה בהזמנה" → navigates to the booking/order detail page (My Treatments)

### 12.4 Treatment Order — Full Flow Summary

| Step | Screen | User Action | Next |
|---|---|---|---|
| 1 | Practitioner Profile (Section 11) | Clicks "קביעת תורים" sidebar button | → Opens Scheduling Modal |
| 2 | Scheduling Modal (12.1) | Selects treatment type, date, and time slot → clicks "הזמנת טיפול" | → Opens Order Summary Modal |
| 3 | Order Summary Modal (12.2) | Reviews pricing, optionally redeems package → clicks "אישור והזמנה" | → Opens Confirmation Modal |
| 4 | Confirmation Modal (12.3) | Reads success message → clicks "צפייה בהזמנה" | → Navigates to My Treatments / Order detail |

---

## 13. Favorites Section (from Figma)

> **Figma Source:** 2 screens showing the "My Favorites" page with two variants — one with the tab switcher and favorite heart icons, one with credits/loyalty badges.

### 13.0 Page Layout

**Figma Node (Screen 1):** `1:8671`
**Figma Node (Screen 2):** `1:9069`

**Page Container:** 1440px wide, bg `#fafafa`

**Structure (top to bottom):**
1. Authenticated header (same as Section 9 — After Login)
2. Tab switcher (Screen 1 only)
3. Page title + description
4. Practitioner card grid (4×2 = 8 cards)

### 13.1 Tab Switcher (Screen 1)

- **Container:** White bg, `rounded-[10px]`, 567px × 51px, positioned center-right area (`left-[822px] top-[129px]`), padding `px-[16px] py-[10px]`
- **Two equal tabs side-by-side:**

| Tab | State | Width | Background | Font | Weight | Tracking |
|---|---|---|---|---|---|---|
| המעודפים שלי (My Favorites) | **Active** | 262px | `#7de4a8`, `rounded-[8px]` | Discovery Fs | Regular, 18px | `-0.36px` |
| ההתאמות שלי (My Matches) | Inactive | 263px | white | Discovery Fs | Light, 18px | `-0.36px` |

> **Note:** Screen 2 (node `1:9069`) does not show the tab switcher — it may represent an alternate state or the tab bar scrolled out of view.

### 13.2 Page Title Section

- Positioned below tab switcher, right-aligned, width ~943px
- **Heading:** "המעודפים שלי" — 30px, Demi-bold, black
- **Subtitle:** "כל המטפלים שהוספת למועדפים יופיעו כאן, כדי שתוכל לחזור אליהם בקלות מתי שתרצה." — 16px, Light, `#9f9f9f`, leading-[22px]

### 13.3 Card Grid

- **Grid:** 4 columns × 2 rows = 8 practitioner cards
- **Container width:** 1321px, positioned at `left-[69px]`
- **Gap:** 40px between cards (horizontal and vertical)
- **Total grid height:** ~856px (2 rows of 408px cards + 40px row gap)

### 13.4 Practitioner Card (Favorites Variant)

Each card: **300px × 408px**, `shadow-[0px_4px_21px_0px_rgba(0,0,0,0.07)]`

**Top Image Area (300px × 177px):**
- Background: gradient from `#ebecec` (4.086%) to white (120.21%), `rounded-tl-[20px] rounded-tr-[20px]`, border white
- Practitioner cutout photo (transparent background, absolute positioned)
- **Bottom overlay row** (280px wide, over image):
  - Right: Availability badge — bg `#eefff3`, `rounded-[45px]`, h-28px
    - Green dot: 8px, `#00d22c`, `rounded-[88px]`
    - Text: "זמין לקבל היום" — 14px, Regular, `#0d8a27`
  - Left: Chat/message icon (28px)

**Screen 1 — Top-right badge:** Favorite/heart icon (`imgFrame2147240165`), 34×34px, top-right of image area. Contextually in **filled/active state** since these are favorited practitioners.

**Screen 2 — Top-right badge:** Green credits/loyalty badge replacing the heart icon:
- Outer circle: 21×21px, bg `#dcfce7`, `rounded-[14.913px]`
- Inner circle: 11.5px, bg `#7de4a8`, white border 0.313px
- Leaf icon ("ל") inside (6.8px)
- "+10" text next to badge — 12px, Light, black

**Bottom Content Area (300px × 231px):**
- White bg, `rounded-bl-[20px] rounded-br-[20px]`, padding 10px
- **Treatment tags row** (two pills):
  - "דיקור סיני" — 12px, Light, `rounded-[100px]`, border `#d7d7d7` (Screen 2) / `#9f9f9f` (Screen 1), gradient bg
  - "מחיר לטיפול 146₪" — 12px, Light, 107px wide, same pill styling
- **Practitioner name:** "ליאת גולדנברג" — 20px, Medium, black
- **Description:** placeholder text — 14px, Light, `#9f9f9f`, leading-[18px]
- **Info row** (justify-between):
  - Right: Globe icon (20px) + "יפו - תל אביב" — 14px, Regular, black
  - Left: Star icon (20px) + "4.8/5" (16px, Regular) + "(דרוג 500)" (16px, Light)
- **Divider line**
- **Action buttons** (8px gap, full width):
  - "צפייה בפרופיל" (View profile) — bg `#f4f7f7`, 136px, `rounded-[8px]`, 16px Regular
  - "קביעת טיפול" (Book treatment) — bg `#7de4a8`, 136px, `rounded-[8px]`, 16px Regular

### 13.5 Text Table

| Hebrew (HE) | English (EN) |
|---|---|
| המעודפים שלי | My favorites |
| כל המטפלים שהוספת למועדפים יופיעו כאן, כדי שתוכל לחזור אליהם בקלות מתי שתרצה. | All therapists you added to favorites will appear here, so you can return to them easily whenever you want. |
| ההתאמות שלי | My matches |
| זמין לקבל היום | Available to receive today |
| דיקור סיני | Acupuncture |
| מחיר לטיפול 146₪ | Price per treatment ₪146 |
| ליאת גולדנברג | Liat Goldenberg |
| 4.8/5 (דרוג 500) | 4.8/5 (500 ratings) |
| יפו - תל אביב | Jaffa - Tel Aviv |
| צפייה בפרופיל | View profile |
| קביעת טיפול | Book treatment |
| +10 | +10 (credits badge) |

### 13.6 Differences from "Looking for Therapists" (Section 10)

| Feature | Looking for Therapists (Section 10) | Favorites (Section 13) |
|---|---|---|
| Search bar | Present | **Absent** |
| 8 filter controls | Present (treatment type, location, language, rating, price, gender, availability, sort) | **Absent** |
| Tab switcher | Not present | Present — "המעודפים שלי" / "ההתאמות שלי" toggle |
| Page heading | Not present (filters act as page context) | "המעודפים שלי" (30px) + descriptive subtitle |
| Card grid | 3×4 (12 cards) | 4×2 (8 cards) |
| Card design | Same practitioner card component | Same card component with minor border color variation |

### 13.7 Favorites — Functionality Summary

| Element | Action |
|---|---|
| "המעודפים שלי" tab | → Show favorited practitioners grid |
| "ההתאמות שלי" tab | → Switch to matched practitioners view |
| Heart icon (Screen 1) | → Toggle favorite status (remove from favorites) |
| "+10" credits badge (Screen 2) | → Indicates loyalty/points earned from this practitioner |
| "צפייה בפרופיל" button | → Navigate to practitioner profile (Section 11) |
| "קביעת טיפול" button | → Open booking/appointment flow (Section 12) |
| Availability badge | → Informational — practitioner is available today |

---

## 14. Patient Onboarding Screens

**Confirmed steps from PRD:**
1. Welcome screen
2. About screen
3. Personal details form (required: full name, DOB, gender, city, phone)
4. Profile photo upload (optional)
5. Confirmation step (required)
6. Personalized questionnaire — male/female variants (MISSING — questions not specified)
7. Display 3-4 matched practitioners + "Other" option

**Note:** Screens 3-5 from the Login section (Role Selection, Patient Registration, Questionnaire) cover PRD steps 3-6. Welcome and About screens (PRD steps 1-2) were not present in the Login Figma frames — they may be separate or combined with Role Selection.

> **[PENDING FIGMA]** — Welcome screen, About screen, Confirmation step, Matching results display.

---

## 15. Practitioner Discovery & Profile Screens

**Confirmed from PRD:**

### Practitioner Card fields:
- Name, treatment category/domains, rating, number of ratings, price, location

### Practitioner Profile fields:
- Biography, languages, certificates, ratings/reviews, price, image/logo, barcode, "Book Treatment" action

### Browsing:
- Browse by categories and treatment domains
- Favorites functionality

> **[PENDING FIGMA]** — Card design, profile layout, search/filter UI, favorites UI.

---

## 16. My Treatments (from Figma)

> **Figma Source:** 5 screens — Active treatments tab, Completed treatments tab, Canceled treatments tab, Payment Confirmation modal, Rating/Review modal. All screens use the authenticated header with "הטיפולים שלי" as the active nav item.

### 16.0 Shared Elements

**Page Background:** `#fafafa`

**Page Header:**
- Title: "הטיפולים שלי" — 30px, Demi-bold, black
- Subtitle: "מעקב אחר טיפולים פעילים, טיפולים שהושלמו בצורה מסודרת ונוחה." — 16px, Light, `#9f9f9f`

**Tab Switcher:**
- Container: 849px × 51px, white bg, `rounded-[10px]`, `px-[16px] py-[10px]`
- 3 equal-width tabs, each showing label + count in parentheses
- Active tab: bg `#7de4a8`, Regular font
- Inactive tabs: white bg, Light font
- All tabs: 18px, `tracking-[-0.36px]`
- Tab labels (RTL): "פעילים (2)" | "הושלמו (12)" | "בוטלו (3)"

**Treatment Card (shared structure across all tabs):**
- Container: 849px × 137px, white bg, border `#cddbdb`, `rounded-[10px]`, `px-[20px] py-[7px]`
- **Right side — Practitioner info:**
  - Practitioner thumbnail: 90×90px, gradient bg `#ebecec` → white, `rounded-[10px]`
  - Info column (473px):
    - Order number: "מספר הזמנה: 376ר437" — `#9f9f9f` (red `#e70202` for canceled)
    - Practitioner name: e.g. "ליאת גולדנברג" — 20px, Medium
    - Treatment type: e.g. "דיקור סיני" — `#9f9f9f`
    - Info row with icon badges (gap between badges):
      - Each badge: `#f6f6f6` circle 20px, icon 12px inside
      - Calendar icon (vuesax/bold/calendar) + date: "25/10/25"
      - Timer icon (vuesax/bold/timer) + time: "16:00-18:00"
      - Globe icon + location: "תל אביב - יפו"
      - Wallet icon (vuesax/bold/empty-wallet) + price: "סה״כ שולם ₪150"
- **Vertical divider:** 122px line, rotated 90° (separates info from actions)
- **Left side — Action buttons (160px wide):** varies per tab state (see below)

### 16.1 Screen 1 — Active Treatments Tab (פעילים)

**Figma Node:** `1:10276`

**Active tab:** "פעילים (2)" highlighted with `#7de4a8` background

**Card action buttons (stacked vertically):**
- **"ביטול טיפול"** (Cancel Treatment): bg `#ffe0e2`, text `#e70202`, close icon (X), 160px wide
- **"שליחת הודעה"** (Send Message): bg `#f4f7f7`, 160px wide

**Note:** One card (third) shows only "שליחת הודעה" without the cancel button — indicates the cancellation window (>24h rule) has passed for that treatment.

### 16.2 Screen 2 — Completed Treatments Tab (הושלמו)

**Figma Node:** `1:10544`

**Active tab:** "הושלמו (12)" highlighted with `#7de4a8` background

**Card action buttons (stacked vertically):**
- **"הזמנה חוזרת"** (Re-order): bg `#21544e`, white text, rotate-right icon 14px, 160px wide
- **"שליחת הודעה"** (Send Message): bg `#f4f7f7`, 160px wide

**Order number:** Normal color `#9f9f9f` (not red)

### 16.3 Screen 3 — Canceled Treatments Tab (בוטלו)

**Figma Node:** `1:10829`

**Active tab:** "בוטלו (3)" highlighted with `#7de4a8` background

**Card action buttons (stacked vertically):**
- **"הזמנה חוזרת"** (Re-order): bg `#21544e`, white text, rotate-right icon, 160px wide
- **"יתרת זכות : 1000₪"** (Credit Balance): 18px, Regular, black, center-aligned — displays remaining credit from cancellation

**Order number:** Red color `#e70202`, label changes to "מספר הזמנה שבוטלה: 376ר437" (includes "שבוטלה" = "that was canceled")

**No "שליחת הודעה" button** on canceled treatment cards.

### 16.4 Screen 4 — Payment Confirmation Modal (אישור תשלום)

**Figma Node:** `1:11352`

**Modal container:** White bg, `rounded-[16px]`, `px-[21px] py-[34px]`

**Layout (top to bottom):**
1. **Confirmation illustration:** 176.931px (checkmark illustration)
2. Gap: 51px
3. **Title:** "אישור תשלום" — 30px, Bold, black, center-aligned
4. **Description:** placeholder text — 16px, Light, `#9f9f9f`, `leading-[20px]`, center-aligned
5. Gap: 40px
6. **Buttons row** (gap 28px, centered):
   - **"אישור"** (Approve): bg `#7de4a8`, 227px wide, Poppins Bold 16px
   - **"דחייה"** (Reject): bg `#f4f7f7`, 227px wide, Poppins Bold 16px

### 16.5 Screen 5 — Rating & Review Modal (דירוג)

**Figma Node:** `1:11637`

**Modal container:** White bg, `rounded-[16px]`

**Close button (X):** 33px, positioned `left-[15px] top-[18px]`

**Layout (top to bottom):**
1. **Title:** "איך הייתה החוויה שלך עם שם המטפל?" — 26px, Demi-bold, black, right-aligned, width 560px
2. **Rating options row** (gap 15px, 5 options):
   - Each option: 100×100px, white bg, border `#cddbdb`, `rounded-[8px]`
   - Star icon: 41.729×39.642px, positioned `left-[28.32px] top-[16.51px]`
   - Labels (16px, Regular, `#1a1f25`, centered below star):
     - "אהבתי מאוד" | "טוב מאוד" | "ממוצע" | "גרוע" | "רע מאוד"
   - Rating order (RTL): best → worst (right to left)
3. **Comment textarea:** 560×144px, white bg, border `#cddbdb`, `rounded-[10px]`, `pl-[12px] pr-[8px] py-[8px]`
   - Placeholder: "הוספת תגובה..." — 14px, Regular, `rgba(102,102,102,0.44)`, `tracking-[-0.28px]`
4. **Submit button:** "שליחת דירוג" — bg `#7de4a8`, full width 560px, `rounded-[8px]`, `px-[10px] py-[12px]`, Poppins Bold 16px, text `#08190c`

### 16.6 Tab State Comparison

| Feature | Active (פעילים) | Completed (הושלמו) | Canceled (בוטלו) |
|---|---|---|---|
| Tab highlight | `#7de4a8` | `#7de4a8` | `#7de4a8` |
| Order # color | `#9f9f9f` | `#9f9f9f` | `#e70202` (red) |
| Order # label | "מספר הזמנה" | "מספר הזמנה" | "מספר הזמנה שבוטלה" |
| Button 1 | ביטול טיפול (cancel) | הזמנה חוזרת (re-order) | הזמנה חוזרת (re-order) |
| Button 1 style | bg `#ffe0e2`, text `#e70202` | bg `#21544e`, white text | bg `#21544e`, white text |
| Button 2 | שליחת הודעה (message) | שליחת הודעה (message) | יתרת זכות (credit balance) |
| Button 2 style | bg `#f4f7f7` | bg `#f4f7f7` | 18px Regular, black text |

### 16.7 Hebrew / English Text Reference

| Hebrew | English | Context |
|---|---|---|
| הטיפולים שלי | My Treatments | Page title |
| מעקב אחר טיפולים פעילים, טיפולים שהושלמו בצורה מסודרת ונוחה. | Track active treatments, completed treatments in an organized and convenient way. | Subtitle |
| פעילים | Active | Tab label |
| הושלמו | Completed | Tab label |
| בוטלו | Canceled | Tab label |
| ביטול טיפול | Cancel Treatment | Active tab button |
| שליחת הודעה | Send Message | Active/Completed tab button |
| הזמנה חוזרת | Re-order | Completed/Canceled tab button |
| יתרת זכות | Credit Balance | Canceled tab text |
| מספר הזמנה | Order Number | Card field |
| מספר הזמנה שבוטלה | Canceled Order Number | Canceled card field |
| סה״כ שולם | Total Paid | Card info badge |
| דיקור סיני | Chinese Acupuncture | Treatment type example |
| אישור תשלום | Payment Confirmation | Modal title |
| אישור | Approve | Modal button |
| דחייה | Reject | Modal button |
| איך הייתה החוויה שלך עם שם המטפל? | How was your experience with [practitioner name]? | Rating modal title |
| אהבתי מאוד | Loved it | Rating option (best) |
| טוב מאוד | Very good | Rating option |
| ממוצע | Average | Rating option |
| גרוע | Bad | Rating option |
| רע מאוד | Very bad | Rating option (worst) |
| הוספת תגובה... | Add a comment... | Textarea placeholder |
| שליחת דירוג | Submit Rating | Rating submit button |

### 16.8 Functionality Summary

| Feature | Figma-confirmed | PRD-confirmed only |
|---|---|---|
| 3-tab layout (active/completed/canceled) | Yes | Yes |
| Cancel treatment button (active) | Yes | Yes |
| Send message button | Yes | Yes |
| Re-order button (completed/canceled) | Yes | Yes |
| Credit balance display (canceled) | Yes | Yes |
| Red order number (canceled) | Yes | — |
| Payment confirmation modal | Yes | — |
| Rating/review modal (5-star + comment) | Yes | Yes |
| Cancel button conditional visibility | Yes (1 of 3 cards missing it) | Yes (>24h rule) |
| QR code attendance scanning | — | Yes |
| Add to Google Calendar | — | Yes |
| Waze link for location | — | Yes |
| Cancellation reason prompt | — | Yes |
| Satisfaction survey (post-treatment) | — | Yes |

### 16.9 PRD Features Not Yet in Figma

- **QR Attendance:** Patient scans practitioner's unique QR code at appointment
- **Add to Google Calendar:** Action on active treatment cards
- **Waze link:** Location field linking to Waze navigation
- **Cancellation reason modal:** Prompt for selecting/entering cancellation reason
- **Satisfaction survey:** Sent ~2 hours after QR scan; review published after admin moderation

---

## 17. Practitioner Onboarding Screens (from Figma)

> **Figma Source:** 10 screens covering login, role selection, personal details, professional profile, treatment areas, Google Calendar connection, submission confirmation, and account approval.
>
> **Full screen-by-screen documentation:** See **Section 4.6–4.13** for detailed layouts, Hebrew/English text references, and functionality per screen.

**Practitioner Registration Steps (Figma-confirmed):**

| Step | Section | Screen | Content |
|---|---|---|---|
| 1 | 4.1 | Login | Email/password, Google sign-in (shared with patient) |
| 2 | 4.2 | Email OTP | 5-digit verification code (shared with patient) |
| 3 | 4.3 | Role Selection | Select "מטפל/ת" (practitioner card, purple accent) |
| 4 | 4.6 | Personal Details & Bank Info | Photo, name, DOB, city, phone, gender + bank account details |
| 5 | 4.7 | Professional Profile | Languages (multi-select), about (textarea), certification description (textarea) |
| 6 | 4.8 | Treatment Areas | Domain, specialization, pricing model, certificate upload (repeatable) |
| 7 | 4.9 | Google Calendar | Connect Google Calendar for availability |
| 8 | 4.10 | Submission Confirmation | "הפרטים התקבלו בהצלחה" — pending admin review |
| — | 4.11 | Account Approved | Post-approval: QR code download + enter system |

**PRD steps mapped to Figma screens:**
1. Select treatment domains → Screen 8 (4.8) — "תחום טיפול" dropdown
2. Select specialties → Screen 8 (4.8) — "תחום התמחות" dropdown
3. Set pricing → Screen 8 (4.8) — "מחיר לטיפול" + "מודל" fields
4. Upload certificates → Screen 8 (4.8) — "תעודת הסמכה" upload
5. Select languages → Screen 7 (4.7) — "שפות" multi-select
6. Write profile summary → Screen 7 (4.7) — "אודות" + "תיאור הסמכה" textareas
7. Sign provider agreement → **NOT in Figma yet** (TBD)
8. Submit for approval → Screen 10 (4.10) — confirmation screen

**Post-approval rules (Phase 1):** only price can be updated directly; other changes forwarded to admin for review.

**Missing from Figma (still TBD):**
- Provider agreement / Terms acceptance step (PRD step 7)
- Draft save/resume during onboarding (confirmed in PRD, no Figma indicator)

---

## 18. Practitioner Dashboard Screens

> **Figma Source:** 17 screens — Dashboard home, Dashboard context menu, My Patients, My Calendar, Cancel Treatment dialog, Add/Edit Treatment Times, Manual Date & Time, My Articles listing, Create New Article, Article Sent for Approval, Article Approved, Messages Chat, Messages Delete action, Profile Business Details, Profile Personal Details, Add Treatment Area confirmation, Notifications panel. All screens use the authenticated practitioner header with navigation: דשבורד | המטופלים שלי | היומן שלי | מאמרים.

### 18.0 Shared Layout — Practitioner Authenticated Header

Identical across all dashboard screens:

| Zone | Content |
|------|---------|
| **Top bar** | Dark header (`#21544E`). Right: Heali logo. Left: bell icon (notifications), user avatar circle. |
| **Nav bar** | White bar below header. Right-aligned nav items: **דשבורד** · **המטופלים שלי** · **היומן שלי** · **מאמרים**. Active item has green underline (`#7DE4A8`). Left: search icon, "חיפוש" placeholder. |

---

### 18.1 Practitioner Dashboard — Home

> **Figma Node:** `1:14095`
> **Route (proposed):** `/practitioner/dashboard`
> **Active nav item:** דשבורד

**Layout (top → bottom, RTL):**

#### A. KPI Cards Row (4 cards, equal width)

Four summary cards displayed in a horizontal row. Each card follows the same structure:

| Card | Label (Hebrew) | Label (English) | Value | Color Accent | Trend |
|------|----------------|-----------------|-------|--------------|-------|
| 1 | סה"כ טיפולים סגורים | Total Closed Treatments | 2,000 | Blue (`#3B82F6`) | +18% יותר מחודש שעבר |
| 2 | סה"כ טיפולים פעילים | Total Active Treatments | 2,000 | Yellow (`#F59E0B`) | +18% יותר מחודש שעבר |
| 3 | סה"כ מטופלים | Total Patients | 2,000 | Green (`#22C55E`) | +18% יותר מחודש שעבר |
| 4 | סה"כ הכנסות | Total Revenue | ₪13,250 | Purple (`#AD7FFF`) | +18% יותר מחודש שעבר |

**Card structure:**
- White card with subtle border radius
- Left-aligned colored circle icon (matching card accent color)
- Right side: label text (gray, small), large bold value below
- Bottom: green upward arrow icon + trend text "+18% יותר מחודש שעבר" (18% more than last month)

#### B. Main Content Area (two-column layout, RTL)

**Right column (≈65%) — מטופלים אחרונים (Recent Patients):**

| Element | Description |
|---------|-------------|
| **Section header** | "מטופלים אחרונים" (Recent Patients) — bold, right-aligned |
| **Controls row** | Right: search input with magnifying glass icon + "חיפוש" placeholder. Left: filter button with sliders icon |
| **Data table** | 5 columns (RTL order): שם המטופל (Patient Name), סוג טיפול (Treatment Type), תאריך טיפול (Treatment Date), סטטוס טיפול (Treatment Status), סכום הטיפול (Treatment Amount) |
| **Table rows** | Each row: patient avatar circle + name, treatment type text, date in DD/MM/YYYY format, status badge, amount in ₪, 3-dot action menu (⋮) |

**Status badges:**

| Badge | Hebrew | Background | Text Color |
|-------|--------|------------|------------|
| Open | פתוח | `#DCFCE7` (light green) | `#16A34A` (green) |
| Closed | סגור | `#FFE3E3` (light red) | `#E70202` (red) |

**Left column (≈35%) — הודעות אחרונות (Recent Messages):**

| Element | Description |
|---------|-------------|
| **Section header** | "הודעות אחרונות" (Recent Messages) — bold |
| **Message cards** | 4 stacked cards. Each: user avatar circle (right), sender name bold + message preview gray (center), timestamp top-left |
| **Footer link** | "צפייה בכל ההודעות" (View All Messages) — centered link text |

#### C. Sample Data (from Figma mockup)

| Patient Name | Treatment Type | Date | Status | Amount |
|-------------|---------------|------|--------|--------|
| ישראל ישראלי | פיזיותרפיה | 01/01/2025 | פתוח | ₪350 |
| ישראל ישראלי | פיזיותרפיה | 01/01/2025 | סגור | ₪350 |
| ישראל ישראלי | פיזיותרפיה | 01/01/2025 | פתוח | ₪350 |
| ישראל ישראלי | פיזיותרפיה | 01/01/2025 | סגור | ₪350 |
| ישראל ישראלי | פיזיותרפיה | 01/01/2025 | פתוח | ₪350 |

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| סה"כ טיפולים סגורים | Total Closed Treatments | KPI card label |
| סה"כ טיפולים פעילים | Total Active Treatments | KPI card label |
| סה"כ מטופלים | Total Patients | KPI card label |
| סה"כ הכנסות | Total Revenue | KPI card label |
| יותר מחודש שעבר | More than last month | KPI trend text |
| מטופלים אחרונים | Recent Patients | Section header |
| שם המטופל | Patient Name | Table column |
| סוג טיפול | Treatment Type | Table column |
| תאריך טיפול | Treatment Date | Table column |
| סטטוס טיפול | Treatment Status | Table column |
| סכום הטיפול | Treatment Amount | Table column |
| פתוח | Open | Status badge |
| סגור | Closed | Status badge |
| הודעות אחרונות | Recent Messages | Sidebar header |
| צפייה בכל ההודעות | View All Messages | Sidebar link |
| חיפוש | Search | Search placeholder |

---

### 18.2 Practitioner Dashboard — Home (Context Menu)

> **Figma Node:** `1:17205`
> **Route (proposed):** `/practitioner/dashboard` (same page, menu overlay)
> **Active nav item:** דשבורד

Identical to Screen 18.1, but with the 3-dot (⋮) action menu expanded on one table row. The context menu appears as a floating white dropdown with shadow, anchored below the ⋮ button.

**Context Menu Items:**

| Hebrew | English | Icon |
|--------|---------|------|
| שליחת הודעה למטופל | Send Message to Patient | ✉️ (envelope icon) |
| ביטול טיפול | Cancel Treatment | ✖️ (X / cancel icon) |

**Behavior notes:**
- Menu appears on click of the ⋮ button in any table row
- Click outside the menu dismisses it
- "שליחת הודעה למטופל" → opens messaging flow to that patient
- "ביטול טיפול" → triggers treatment cancellation flow (likely with confirmation dialog)

---

### 18.3 Practitioner Dashboard — My Patients

> **Figma Node:** `1:14366`
> **Route (proposed):** `/practitioner/patients`
> **Active nav item:** המטופלים שלי

**Layout (top → bottom, RTL):**

Full-width content area (no sidebar). Table width ≈1340px centered.

#### A. Page Header & Controls

| Element | Description |
|---------|-------------|
| **Page title** | "המטופלים שלי" (My Patients) — large bold heading, right-aligned |
| **Controls row** | Right: search input with magnifying glass icon + "חיפוש" placeholder. Left: filter button with sliders icon |

#### B. Patients Data Table

| Column (Hebrew) | Column (English) | Description |
|-----------------|------------------|-------------|
| שם המטופל | Patient Name | Avatar circle + full name |
| סוג טיפול | Treatment Type | Treatment category text |
| תאריך טיפול | Treatment Date | DD/MM/YYYY format |
| סטטוס טיפול | Treatment Status | Status badge (פתוח green / סגור red) |
| תשלומים | Payments | Payment amount in ₪ |
| — | Actions | 3-dot (⋮) menu per row |

**Key differences from Dashboard home table (18.1):**
- **Full width** — no messages sidebar; table spans entire content area
- **Column change** — "סכום הטיפול" (Treatment Amount) is replaced by "תשלומים" (Payments)
- **Active nav** — "המטופלים שלי" is underlined instead of "דשבורד"
- Same status badges: פתוח (`#DCFCE7`/`#16A34A`), סגור (`#FFE3E3`/`#E70202`)
- Same 3-dot (⋮) context menu per row (see 18.2 for menu items)

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| המטופלים שלי | My Patients | Page title + nav item |
| שם המטופל | Patient Name | Table column |
| סוג טיפול | Treatment Type | Table column |
| תאריך טיפול | Treatment Date | Table column |
| סטטוס טיפול | Treatment Status | Table column |
| תשלומים | Payments | Table column |
| פתוח | Open | Status badge |
| סגור | Closed | Status badge |
| חיפוש | Search | Search placeholder |

---

### 18.4 Practitioner Dashboard — Functionality Summary

| Feature | Details |
|---------|---------|
| **KPI Cards** | 4 metric cards with colored icons, large values, and month-over-month trend indicators |
| **Recent Patients Table** | Sortable/filterable table with patient name, treatment type, date, status, and amount |
| **Row Actions** | 3-dot menu: Send message to patient, Cancel treatment |
| **Recent Messages Sidebar** | 4 latest message previews with link to full messages view |
| **My Patients Page** | Dedicated full-width patient list with search and filter; "Payments" column replaces "Amount" |
| **Search & Filter** | Available on both dashboard and My Patients views; search by text, filter by criteria |
| **Status System** | Binary: פתוח (Open/green) and סגור (Closed/red) |

**Confirmed KPIs from PRD:**
- Total treatments (split: closed + active in Figma)
- Total patients
- Total revenue
- Month-over-month trend percentage
- Filters: search input + filter button on all table views

**Phase 2 (TBD):** drill-down views from KPI cards, date range filters, export functionality.

---

### 18.5 Practitioner Calendar — My Calendar (היומן שלי)

> **Figma Node:** `1:14548`
> **Route (proposed):** `/practitioner/calendar`
> **Active nav item:** היומן שלי

**Layout (RTL, two-column with sidebar):**

Page title "היומן שלי" (My Calendar) — 30px bold, right-aligned. Below the title: search bar (left) + green action button (right).

#### A. Action Button

| Element | Description |
|---------|-------------|
| **Button** | "הוספה/עריכה זמני טיפול" (Add/Edit Treatment Times) |
| **Style** | bg `#7DE4A8`, text `#08190C`, 14px medium, rounded-[8px], 219px wide |
| **Position** | Far right, aligned with page title |

#### B. Search Bar

| Element | Description |
|---------|-------------|
| **Container** | White bg, border `#CDDBDB`, rounded-[10px], 661px × 50px |
| **Placeholder** | "חיפוש חופשי..." (Free search...) — 14px, `#666` |
| **Icon** | Magnifying glass, right side |

#### C. Right Sidebar (375px wide)

**Mini Calendar (top):**
- White card with border `#CDDBDB`, rounded-[10px], 375px × 369px
- Month/year header: "אוגוסט 2024" (August 2024) with left/right arrows for navigation
- 7-column grid (RTL): יום א' (Sun) → יום ש' (Sat)
- Day headers in gray `#666`, day numbers in black
- **Selected/highlighted day:** green circle border (`#13D464`), bg `#CCFFE1`, green text — e.g., day 13
- Standard days: plain black numbers

**Upcoming Treatments (below calendar):**
- Section header: "טיפולים קרובים" (Upcoming Treatments) — 24px medium
- 3 treatment appointment cards stacked vertically (gap 20px)

**Appointment Card Structure (375px × 96px):**

| Zone | Content |
|------|---------|
| **Top row right** | Treatment type bold (e.g., "דיקור סיני" / Chinese Acupuncture) — 18px |
| **Top row right (below)** | Date: "יום חמישי, 24/08/25" — 14px, `#9F9F9F` |
| **Top row left** | 3-dot (⋮) action button in circular border (`#CDDBDB`, 34px) |
| **Bottom row right** | Patient avatar (18px circle) + "שם המטופל: מאי בוזו" (Patient Name: Mai Buzo) — label gray `#666`, name black |
| **Bottom row left** | Timer icon (gray bg `#F6F6F6`, 20px circle) + time range "16:00 - 18:00" in green `#13D464` |

#### D. Main Content Area (932px wide) — Day Schedule

| Element | Description |
|---------|-------------|
| **Container** | White card, border `#CDDBDB`, rounded-[10px], 932px × 988px |
| **Day header** | "יום שישי , 13 לאוגוסט" (Friday, 13 August) — 24px medium |
| **Time grid** | Vertical hourly slots from 8:00 to 17:00 |
| **Time labels** | Right column (160px): "8:00 בבוקר", "9:00 בבוקר", ..., "12:00 בצהריים", ..., "16:00 בצהריים" |
| **Slot rows** | 80px height each, alternating white/`#FAFAFA` backgrounds |
| **Grid lines** | Horizontal dividers `#E8E8E8` (white rows) / `#ECECF1` (gray rows) |

**Booked Appointment Blocks (overlaid on time grid):**

Two appointment types are visible, color-coded:

| Type | Background | Border | Text Color | Example |
|------|-----------|--------|------------|---------|
| **Active/Confirmed** | `#DCFCE7` (light green) | `#13D464` (green) | Black title, green time | Occupies ~10:00–12:00 range |
| **Pending/External** | `#F0E9FD` (light purple) | `#AD80FF` (purple) | Purple title `#AD80FF`, purple time | Occupies ~12:00–14:00 range |

Each booked block shows: treatment name, date, patient name + avatar, time range, and ⋮ action button.

**Inline Action — Cancel Treatment:**
- A hand cursor icon hovers over the green appointment block
- A small white tooltip/popup appears: "ביטול טיפול" (Cancel Treatment) — white card with border `#EAEBEB`, shadow, rounded-[10px], 177px × 51px

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| היומן שלי | My Calendar | Page title + nav item |
| הוספה/עריכה זמני טיפול | Add/Edit Treatment Times | Action button |
| חיפוש חופשי... | Free search... | Search placeholder |
| אוגוסט 2024 | August 2024 | Mini calendar month |
| יום א' / ב' / ג' / ד' / ה' / ו' / ש' | Sun / Mon / Tue / Wed / Thu / Fri / Sat | Day abbreviations |
| טיפולים קרובים | Upcoming Treatments | Sidebar section |
| דיקור סיני | Chinese Acupuncture | Treatment type (sample) |
| שם המטופל | Patient Name | Card label |
| יום שישי , 13 לאוגוסט | Friday, 13 August | Day schedule header |
| בבוקר | Morning (AM) | Time label suffix |
| בצהריים | Afternoon (PM) | Time label suffix |
| ביטול טיפול | Cancel Treatment | Inline action tooltip |

---

### 18.6 Practitioner Calendar — Cancel Treatment Confirmation Dialog

> **Figma Node:** `1:17191`
> **Route (proposed):** Modal overlay on `/practitioner/calendar`
> **Trigger:** Click "ביטול טיפול" from appointment context menu

**Layout:** Centered modal dialog, white bg, rounded-[16px], padding 21px horizontal / 34px vertical.

| Element | Description |
|---------|-------------|
| **Close button** | Top-left corner (33px), X icon |
| **Warning icon** | Large centered illustration (≈177px) — gray circle with red triangle warning sign |
| **Title** | "ביטול טיפול" (Cancel Treatment) — 30px bold, black, centered |
| **Confirmation text** | "האם אתה בטוח שאתה רוצה לבטל את הטיפול עם מאי בוזו?" (Are you sure you want to cancel the treatment with Mai Buzo?) — 16px light, `#9F9F9F`, centered, leading-[20px] |
| **Confirm button** | "ביטול טיפול" (Cancel Treatment) — bg `#E70202` (red), border `#E70202`, white text 16px bold, rounded-[8px], 221px wide |

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| ביטול טיפול | Cancel Treatment | Dialog title + button |
| האם אתה בטוח שאתה רוצה לבטל את הטיפול עם מאי בוזו? | Are you sure you want to cancel the treatment with Mai Buzo? | Confirmation text |

**Behavior notes:**
- Modal overlay with backdrop (dims background)
- X button or click outside dismisses without action
- Red confirm button executes the cancellation
- Patient name is dynamic (inserted from context)

---

### 18.7 Practitioner Calendar — Add/Edit Treatment Times (Slot Picker)

> **Figma Node:** `1:15249`
> **Route (proposed):** Modal/drawer on `/practitioner/calendar`
> **Trigger:** Click "הוספה/עריכה זמני טיפול" green button

**Layout:** White modal, rounded-[20px], padding 10px, width 480px.

#### A. Modal Header

| Element | Description |
|---------|-------------|
| **Title** | "עריכה / הוספת זמני טיפול" (Edit / Add Treatment Times) — 20px medium, right-aligned |
| **Search bar** | Full-width, white bg, border `#CDDBDB`, rounded-[10px], 50px height. Placeholder: "חיפוש חופשי..." |

#### B. Week Navigation & Day Strip

| Element | Description |
|---------|-------------|
| **Date range** | "01 מרץ 2025 - 31 אפריל 2025" — 14px regular, centered |
| **Navigation arrows** | Left/right circular buttons (30px) to navigate weeks |
| **Day strip** | 7 days in a horizontal row (RTL): ראשון (Sun) → שבת (Sat) |
| **Day format** | Day name (12px, `rgba(24,24,24,0.8)`) above date number (14px medium, black) |
| **Selected day** | Green border `#13D464`, bg `#E0FFED`, green text — e.g., "רביעי 28" |
| **Days with appointments** | Small green dot (`#13D464`, 4px) below the date number |

#### C. Manual Entry Link

| Element | Description |
|---------|-------------|
| **Divider** | Horizontal line above and below |
| **Link text** | "הוספת תאריך ושעה בצורה ידנית +" (Add date and time manually +) — 14px demi-bold, black, underlined |

#### D. Time Slot Grid

Time slots organized in 3 groups by time of day, each with an icon:

**שעות בוקר (Morning Hours)** — sunrise icon:

| Row | Slots |
|-----|-------|
| 1 | 08:30 · 09:30 · 10:30 · 11:30 |
| 2 | **12:30** (selected — green border `#13D464`, bg `#E0FFED`, green text) |

**שעות צהריים (Afternoon Hours)** — sun icon:

| Row | Slots |
|-----|-------|
| 1 | 13:30 · 14:30 · 15:30 · 16:30 |

**שעות ערב (Evening Hours)** — moon icon:

| Row | Slots |
|-----|-------|
| 1 | 17:30 · 18:30 · 19:30 · 20:30 |

**Slot chip style:**
- Default: border `#DCDCDC`, rounded-[8px], 111px × 40px, black text 14px centered
- Selected: border `#13D464`, bg `#E0FFED`, green text `#13D464`

#### E. Submit Button

| Element | Description |
|---------|-------------|
| **Button** | "הזמנת טיפול" (Book Treatment) — bg `#7DE4A8`, text `#08190C`, 16px bold, rounded-[8px], full width (468px) |

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| עריכה / הוספת זמני טיפול | Edit / Add Treatment Times | Modal title |
| חיפוש חופשי... | Free search... | Search placeholder |
| ראשון / שני / שלישי / רביעי / חמישי / שישי / שבת | Sunday / Monday / Tuesday / Wednesday / Thursday / Friday / Saturday | Day names |
| הוספת תאריך ושעה בצורה ידנית + | Add date and time manually + | Manual entry link |
| שעות בוקר | Morning Hours | Time group label |
| שעות צהריים | Afternoon Hours | Time group label |
| שעות ערב | Evening Hours | Time group label |
| הזמנת טיפול | Book Treatment | Submit button |

---

### 18.8 Practitioner Calendar — Manual Date & Time Entry

> **Figma Node:** `1:15721`
> **Route (proposed):** Modal overlay (sub-modal from 18.7)
> **Trigger:** Click "הוספת תאריך ושעה בצורה ידנית +" link in slot picker

**Layout:** White modal, rounded-[20px], padding 10px, width 468px.

| Element | Description |
|---------|-------------|
| **Close button** | Top-right corner (30px), arrow/close icon |
| **Title** | "הוספת תאריך ושעה בצורה ידנית" (Add Date and Time Manually) — 20px medium, right-aligned |
| **Date picker input** | Full-width, white bg, border `#EAEBEB`, rounded-[8px], 50px height. Right: placeholder "בחירה לפי תאריכים" (Select by dates). Left: calendar icon (16px) |
| **Time section label** | "שעה" (Hour) — 16px regular, right-aligned |
| **Time dropdown** | Full-width, white bg, border `#CDDBDB`, rounded-[10px], 50px height. Right: placeholder "בחירה" (Select). Left: chevron-down icon (24px) |
| **Submit button** | "שמירה" (Save) — bg `#7DE4A8`, text `#08190C`, 16px bold, rounded-[8px], full width |

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| הוספת תאריך ושעה בצורה ידנית | Add Date and Time Manually | Modal title |
| בחירה לפי תאריכים | Select by dates | Date picker placeholder |
| שעה | Hour | Field label |
| בחירה | Select | Time dropdown placeholder |
| שמירה | Save | Submit button |

---

### 18.9 Practitioner Calendar — Functionality Summary

| Feature | Details |
|---------|---------|
| **Mini Calendar** | Monthly calendar with day selection; highlighted day shows appointments. Navigation arrows for month switching |
| **Day Schedule View** | Hourly time grid (8:00–17:00) with booked appointments as colored overlay blocks |
| **Appointment Colors** | Green (`#DCFCE7`/`#13D464`) for active/confirmed; Purple (`#F0E9FD`/`#AD80FF`) for pending/external |
| **Upcoming Treatments Sidebar** | List of next 3 appointments with treatment type, date, patient name, and time range |
| **Appointment Actions** | 3-dot menu on each appointment → "ביטול טיפול" (Cancel Treatment) with confirmation dialog |
| **Cancel Confirmation** | Red warning dialog with patient name, requires explicit red button click to confirm |
| **Add/Edit Treatment Times** | Slot picker modal with week strip navigation, time slots grouped by morning/afternoon/evening |
| **Manual Date/Time Entry** | Sub-modal with date picker input + time dropdown for custom slot creation |
| **Search** | Free text search across calendar/appointments |

**Appointment card color semantics (from Figma):**

| Color | Background | Border | Meaning |
|-------|-----------|--------|---------|
| Green | `#DCFCE7` | `#13D464` | Active / Confirmed appointment |
| Purple | `#F0E9FD` | `#AD80FF` | Pending / External sync (Google Calendar) |

---

### 18.10 Practitioner Articles — My Articles Listing (המאמרים שלי)

> **Figma Node:** `1:15745`
> **Route (proposed):** `/practitioner/articles`
> **Active nav item:** דשבורד (note: Figma shows דשבורד as Demi-bold; expected active item should be מאמרים — likely a Figma oversight)

**Layout (top → bottom, RTL):**

Uses the standard practitioner authenticated header (see 18.0).

#### A. Page Header & Controls

| Element | Description |
|---------|-------------|
| **Title** | "המאמרים שלי" (My Articles) — 30px medium, black, right-aligned, width 520px |
| **Search bar** | Below title. White bg, border `#CDDBDB`, rounded-[10px], 520px × 50px. Placeholder: "חיפוש חופשי..." |
| **Upload button** | Bottom-left of page. "העלאת מאמר חדש +" (Upload New Article +) — bg `#7DE4A8`, text `#08190C`, 16px bold, rounded-[8px], 246px wide |

#### B. Article Card Grid

- **Grid:** 5 columns × 2 rows = 10 article cards
- **Container:** width 1339px, gap 27px horizontal, gap 40px vertical
- **Direction:** RTL

**Article Card Structure (246px wide):**

| Zone | Content |
|------|---------|
| **Image** | Top portion, 246×184px, rounded-[16.749px] corners. Cover photo of article |
| **Tag pills** | Overlaid on bottom of image. Two pills: category (e.g., "דיקור סיני") + date (e.g., "09/10/2025"). Each: border `#9F9F9F`, rounded-[100px], 12px light text, gradient background |
| **Card body** | White, 246×128px, rounded bottom corners (20px). Contains: |
| — Title | "שם המאמר לורם איפסום" — 16px medium, black |
| — Description | Lorem ipsum snippet — 14px light, `#9F9F9F`, leading-[18px], truncated |
| — Author | Profile avatar (31px) + "פורסם ע"י מאי בוזו" (Published by Mai Buzo) — 14px light, black |
| **3-dot menu** | Circular button (34px) with ⋮ icon, positioned top-left of card body area. Border `#CDDBDB`, white bg |
| **Edit arrow** | Small arrow icon (28px) bottom-left of card body |

#### C. Article Context Menu (3-dot)

Floating white dropdown, border `#EAEBEB`, shadow, rounded-[10px], 177px × 73px:

| Hebrew | English | Text Color |
|--------|---------|------------|
| מחיקת מאמר | Delete Article | `#E70202` (red) |
| עריכת מאמר | Edit Article | Black |

Hand cursor icon shown hovering over the menu in Figma mockup.

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| המאמרים שלי | My Articles | Page title |
| העלאת מאמר חדש + | Upload New Article + | Action button |
| חיפוש חופשי... | Free search... | Search placeholder |
| שם המאמר לורם איפסום | Article Name Lorem Ipsum | Card title (sample) |
| פורסם ע"י מאי בוזו | Published by Mai Buzo | Card author attribution |
| דיקור סיני | Chinese Acupuncture | Category tag (sample) |
| מחיקת מאמר | Delete Article | Context menu item |
| עריכת מאמר | Edit Article | Context menu item |

---

### 18.11 Practitioner Articles — Create New Article (יצירת מאמר חדש)

> **Figma Node:** `1:16292`
> **Route (proposed):** Modal overlay on `/practitioner/articles`
> **Trigger:** Click "העלאת מאמר חדש +" button

**Layout:** White modal, rounded-[20px], overflow hidden, padding 30px, width 636px.

| Element | Description |
|---------|-------------|
| **Close button** | Top-left corner (33px), X icon |
| **Title** | "יצירת מאמר חדש" (Create New Article) — 30px bold, black, right-aligned |

**Form Fields (top → bottom):**

| # | Label (Hebrew) | Label (English) | Type | Placeholder | Height |
|---|---------------|-----------------|------|-------------|--------|
| 1 | סוג קטגוריה | Category Type | Dropdown | "בחירה" (Select) | 50px |
| 2 | — | — | Upload button | "העלאת תמונת רקע" (Upload Background Image) | 50px |
| 3 | שם המאמר | Article Name | Text input | "הקלד/י כאן..." (Type here...) | 48px |
| 4 | תוכן המאמר | Article Content | Textarea | "הקלד/י כאן..." (Type here...) | 576px |

**Field styling:**
- All fields: white bg, border `#CDDBDB`, rounded-[10px]
- Labels: 16px regular, black, right-aligned
- Placeholders: 14px regular, `#666` (dropdowns) or `rgba(102,102,102,0.44)` (text inputs)
- Dropdowns: chevron-down icon (24px) on left side

**Submit Button:**

| Element | Description |
|---------|-------------|
| **Button** | "יצירת מאמר" (Create Article) — bg `#7DE4A8`, text `#08190C`, 16px bold, rounded-[8px], full width, 48px height |

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| יצירת מאמר חדש | Create New Article | Modal title |
| סוג קטגוריה | Category Type | Field label |
| בחירה | Select | Dropdown placeholder |
| העלאת תמונת רקע | Upload Background Image | Upload field |
| שם המאמר | Article Name | Field label |
| תוכן המאמר | Article Content | Field label |
| הקלד/י כאן... | Type here... | Text input placeholder |
| יצירת מאמר | Create Article | Submit button |

---

### 18.12 Practitioner Articles — Article Sent for Approval (המאמר נשלח לאישור)

> **Figma Node:** `1:16569`
> **Route (proposed):** Modal overlay (follows article creation)
> **Trigger:** After submitting new article via 18.11

**Layout:** White modal, rounded-[16px], padding 21px horizontal / 34px vertical, centered content.

| Element | Description |
|---------|-------------|
| **Title** | "המאמר נשלח לאישור" (The Article Was Sent for Approval) — 30px bold, black, centered |
| **Description** | "המאמר נשלח לאישור מנהל המערכת. עדכון יישלח מיד לאחר השלמת האישור." (The article was sent for admin approval. An update will be sent immediately after approval is completed.) — 16px light, `#9F9F9F`, centered, leading-[20px] |
| **Confirm button** | "אישור" (Confirm) — bg `#7DE4A8`, text `#08190C`, 16px bold, rounded-[8px], 332px wide |

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| המאמר נשלח לאישור | The Article Was Sent for Approval | Dialog title |
| המאמר נשלח לאישור מנהל המערכת. עדכון יישלח מיד לאחר השלמת האישור. | The article was sent for admin approval. An update will be sent immediately after approval is completed. | Description |
| אישור | Confirm | Button |

---

### 18.13 Practitioner Articles — Article Approved (המאמר שלך אושר)

> **Figma Node:** `1:16822`
> **Route (proposed):** Modal/notification overlay
> **Trigger:** Admin approves the article (async notification)

**Layout:** White modal, rounded-[16px], padding 21px horizontal / 34px vertical, centered content.

| Element | Description |
|---------|-------------|
| **Illustration** | Green checkmark success illustration (≈177px) — circle with check icon and sparkle decorations |
| **Title** | "המאמר שלך אושר" (Your Article Was Approved) — 30px bold, black, centered |
| **Description** | "האדמין אישר את המאמר שלך ותוכל לצפות ולערוך אותו מעכשיו במסך המאמרים שלך." (The admin approved your article and you can now view and edit it in your articles screen.) — 16px light, `#9F9F9F`, centered, leading-[20px], 396px wide |
| **Action button** | "צפייה בהזמנה" (View Article) — bg `#7DE4A8`, text `#08190C`, 16px bold, rounded-[8px], 332px wide |

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| המאמר שלך אושר | Your Article Was Approved | Dialog title |
| האדמין אישר את המאמר שלך ותוכל לצפות ולערוך אותו מעכשיו במסך המאמרים שלך. | The admin approved your article and you can now view and edit it in your articles screen. | Description |
| צפייה בהזמנה | View Article | Action button |

---

### 18.14 Practitioner Articles — Functionality Summary

| Feature | Details |
|---------|---------|
| **My Articles Listing** | Grid of 10 article cards (5×2) with image, tags, title, description, author attribution |
| **Article Card Tags** | Category pill (e.g., "דיקור סיני") + date pill (e.g., "09/10/2025"), gradient background, pill-shaped |
| **Card Actions** | 3-dot menu per card: Delete Article (red), Edit Article (black). Edit arrow on card body |
| **Create New Article** | Modal form: category dropdown, background image upload, article name, content textarea |
| **Admin Approval Flow** | Article submitted → "Sent for Approval" confirmation → Admin reviews → "Article Approved" notification |
| **Search** | Free text search across practitioner's articles |

**Article lifecycle (from Figma):**
1. Practitioner clicks "העלאת מאמר חדש +" → Create Article modal (18.11)
2. Fills form and clicks "יצירת מאמר" → Sent for Approval confirmation (18.12)
3. Admin reviews and approves → Article Approved notification (18.13)
4. Article appears in My Articles listing (18.10) where practitioner can edit or delete

---

### 18.15 Practitioner Messages — Chat View

> **Figma Node:** `1:18856`
> **Route (proposed):** `/practitioner/messages` or `/practitioner/messages/:conversationId`

**Layout (two-panel, RTL):**

Full-page chat interface inside a white rounded container (1337px × 785px), positioned below header. Vertical divider splits conversation list (right) from chat area (left).

#### A. Conversation List (Right Panel, ≈323px)

| Element | Description |
|---------|-------------|
| **Search bar** | Above list. White bg, border `#CDDBDB`, rounded-[10px], 286px × 50px. Placeholder: "חיפוש הודעה..." (Search message...) |
| **Conversation cards** | Stacked vertically, gap 4px. Each card: 276px × 117px |

**Conversation Card Structure:**

| Zone | Content |
|------|---------|
| **Avatar** | Right side, 50px circle, gradient bg `#EBECEC → white` |
| **Name** | "ליאת גולדנברג" (Liat Goldenberg) — 16px medium, black |
| **Timestamp** | "היום ב-6:10PM" (Today at 6:10PM) — 12px light, gradient pill (18px height, rounded-[8px]) |
| **Preview** | "זהו טקסט דמה שנועד להמחיש את לורם איפסום דולור...." — 14px light, `#9F9F9F`, 2-line truncated |

**Selected card:** gradient background `#EBECEC → white`, border `#CDDBDB`, distinct from other white-bg cards.

#### B. Chat Area (Left Panel, ≈1013px)

**Chat Header:**

| Element | Description |
|---------|-------------|
| **Contact photo** | 79px circle, border `#E5E5E5`, rounded-[100px] |
| **Contact name** | "ליאת גולדנברג" — 26px medium, right-aligned |
| **More options** | Horizontal 3-dot icon (⋯), 39px, top-left corner |

**Divider line** below header.

**Timestamp:** "15 באפריל 2024, 15:00" (15 April 2024, 15:00) — 16px light, `#0C0C0C`, centered.

**Message Bubbles:**

| Type | Alignment | Background | Border | Style |
|------|-----------|------------|--------|-------|
| **Incoming (patient)** | Right-aligned | White `#FFFFFF` | `#F4F7F7` | rounded-[10px], p-[10px] |
| **Outgoing (practitioner)** | Left-aligned | `#EEFFF3` (light green) | White | rounded-[10px], p-[10px], with practitioner avatar (41px circle) |

**Message Input Bar (bottom):**

| Element | Description |
|---------|-------------|
| **Container** | `#F6F6F6` bg, 833px wide, 56px height, rounded-[28px], border 2px white, backdrop-blur |
| **Placeholder** | "הקלד/י את ההודעה כאן....." (Type your message here.....) — 18px light, `#828194` |
| **Send button** | Green arrow (38px), rotated 180°, left side of input |
| **Emoji button** | Gray circle (56px), `#F6F6F6` bg, smile icon inside |
| **Attachment button** | Image/file icon (56px), to the left of emoji |

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| חיפוש הודעה... | Search message... | Search placeholder |
| ליאת גולדנברג | Liat Goldenberg | Contact name (sample) |
| היום ב-6:10PM | Today at 6:10PM | Timestamp badge |
| הקלד/י את ההודעה כאן..... | Type your message here..... | Input placeholder |
| 15 באפריל 2024, 15:00 | 15 April 2024, 15:00 | Chat date separator |

---

### 18.16 Practitioner Messages — Chat with Delete Action

> **Figma Node:** `1:19002`
> **Route (proposed):** `/practitioner/messages/:conversationId` (same page, menu overlay)

Identical to 18.15, but with the horizontal 3-dot (⋯) menu expanded. A small dropdown appears:

| Element | Description |
|---------|-------------|
| **Dropdown** | White bg, border `rgba(177,181,185,0.25)`, shadow `0px 4px 24px rgba(0,0,0,0.08)`, rounded-[16px], 180px wide |
| **Menu item** | "מחיקה" (Delete) — 14px regular, `#E70202` (red), right-aligned |

Hand cursor icon shown hovering over the menu in Figma.

**Behavior:** Clicking "מחיקה" deletes the conversation thread.

---

### 18.17 Practitioner Profile — Business Details Tab (פרטי העסק)

> **Figma Node:** `1:19282`
> **Route (proposed):** `/practitioner/profile?tab=business`

**Layout (top → bottom, RTL):**

Uses the standard practitioner authenticated header. A user dropdown menu is shown open in the top-left with: "אזור אישי" (Personal Area) in black and "התנתקות" (Logout) in red `#E70202`.

#### A. Tab Switcher

| Element | Description |
|---------|-------------|
| **Container** | White bg, rounded-[10px], 567px × 51px, two equal tabs |
| **Active tab** | "פרטי העסק" (Business Details) — bg `#7DE4A8`, 18px regular, black, rounded-[8px] |
| **Inactive tab** | "פרטים אישיים" (Personal Details) — white bg, 18px light, black |

#### B. Business Form (Right Column, 499px)

| # | Label (Hebrew) | Label (English) | Type | Value/Placeholder |
|---|---------------|-----------------|------|-------------------|
| 1 | תחום טיפול | Treatment Area | Dropdown | "דיקור סיני" |
| 2 | תחום התמחות | Specialization | Dropdown | "כאבי ראש" |
| 3 | מחיר לטיפול | Price per Treatment | Text input | "₪1,000" |
| 4 | מודל | Model | Small dropdown (147px) | "לפי שעה" (Per hour) |

**Certification Section:**
- Header: "תעודת הסמכה" (Certification) — 30px regular, bold
- File row: link icon (24px) + "שם המסמך" (Document Name, `#21544E`) + "142 kb" (`#666`) + delete icon (trash, left side)

**Add more link:** "הוספת תחום טיפול נוסף +" (Add additional treatment area +) — 16px regular, black, underlined

**QR Code link:** "הורדת קוד QR בקובץ PDF" (Download QR Code as PDF) — 18px bold, `#2563EB` (blue), underlined, centered

#### C. Bank Details (Left Column, 417px)

Header: "פרטי חשבון בנק" (Bank Account Details) — 26px medium

| # | Label (Hebrew) | Label (English) | Width | Value |
|---|---------------|-----------------|-------|-------|
| 1 | שם הבנק | Bank Name | Full | "דיסקונט" |
| 2 | מספר חשבון בנק | Bank Account Number | 191px | "11047378738" |
| 3 | מספר סניף | Branch Number | 99px | "065" |
| 4 | מספר בנק | Bank Number | 99px | "11" |

#### D. Action Buttons (Bottom)

| Button | Hebrew | English | Background | Width |
|--------|--------|---------|------------|-------|
| Save | שמירת שינויים | Save Changes | `#7DE4A8` (green) | 136px |
| Cancel | ביטול שינויים | Cancel Changes | `#F4F7F7` (light gray) | 136px |

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| פרטי העסק | Business Details | Active tab |
| פרטים אישיים | Personal Details | Inactive tab |
| אזור אישי | Personal Area | User dropdown |
| התנתקות | Logout | User dropdown (red) |
| תחום טיפול | Treatment Area | Field label |
| תחום התמחות | Specialization | Field label |
| מחיר לטיפול | Price per Treatment | Field label |
| מודל | Model | Field label |
| לפי שעה | Per hour | Dropdown value |
| תעודת הסמכה | Certification | Section header |
| שם המסמך | Document Name | File label |
| הוספת תחום טיפול נוסף + | Add additional treatment area + | Link |
| הורדת קוד QR בקובץ PDF | Download QR Code as PDF | Link (blue) |
| פרטי חשבון בנק | Bank Account Details | Section header |
| שם הבנק | Bank Name | Field label |
| מספר חשבון בנק | Bank Account Number | Field label |
| מספר סניף | Branch Number | Field label |
| מספר בנק | Bank Number | Field label |
| שמירת שינויים | Save Changes | Button |
| ביטול שינויים | Cancel Changes | Button |

---

### 18.18 Practitioner Profile — Personal Details Tab (פרטים אישיים)

> **Figma Node:** `1:19152`
> **Route (proposed):** `/practitioner/profile?tab=personal`

Same layout as 18.17, but with "פרטים אישיים" (Personal Details) as the active tab (green bg). Contains personal info form fields for the practitioner (name, email, phone, etc.) and password change section.

> **Note:** Figma returned empty data for this node. The Personal Details tab likely mirrors the patient profile form pattern (see Section 20) with practitioner-specific fields. To be updated when Figma data becomes available.

---

### 18.19 Practitioner Profile — Add Treatment Area Confirmation

> **Figma Node:** `1:19506`
> **Route (proposed):** Modal overlay on `/practitioner/profile`
> **Trigger:** Click "הוספת תחום טיפול נוסף +" and submitting new area

**Layout:** White modal, rounded-[16px], padding 21px horizontal / 34px vertical, centered content.

| Element | Description |
|---------|-------------|
| **Close button** | Top-left corner (33px), X icon |
| **Illustration** | Green confirmation/warning illustration (≈177px) — circle with alert triangle icon and sparkle decorations |
| **Title** | "הבקשה להוספת תחום נשלחה" (The Request to Add an Area Was Sent) — 30px bold, black, centered |
| **Description** | "הבקשה להוספת תחום נשלחה למנהל המערכת, נעדכן אותך ברגע שהיא תאושר." (The request to add an area was sent to the system admin, we'll update you as soon as it's approved.) — 16px light, `#9F9F9F`, centered, leading-[20px], 385px wide |

**Hebrew / English Translation Table:**

| Hebrew | English | Context |
|--------|---------|---------|
| הבקשה להוספת תחום נשלחה | The Request to Add an Area Was Sent | Dialog title |
| הבקשה להוספת תחום נשלחה למנהל המערכת, נעדכן אותך ברגע שהיא תאושר. | The request to add an area was sent to the system admin, we'll update you as soon as it's approved. | Description |

---

### 18.20 Practitioner Messages & Profile — Functionality Summary

| Feature | Details |
|---------|---------|
| **Messages — Chat Interface** | Two-panel layout: conversation list (right) + active chat (left). Real-time messaging with patient |
| **Message Bubbles** | Incoming (white) vs outgoing (light green `#EEFFF3`). Practitioner avatar shown next to outgoing messages |
| **Message Input** | Text input with emoji picker, image attachment, and send (green arrow) buttons |
| **Conversation Search** | Search across message threads via "חיפוש הודעה..." |
| **Delete Conversation** | 3-dot menu → "מחיקה" (red) to delete a thread |
| **Profile — Tab System** | Two tabs: "פרטי העסק" (Business) and "פרטים אישיים" (Personal). Active tab has green `#7DE4A8` bg |
| **Business Details Form** | Treatment area, specialization, pricing model, price, certification upload |
| **Bank Details** | Bank name, account number, branch number, bank number |
| **Certification Upload** | File display with name + size, link icon, delete (trash) icon |
| **Add Treatment Area** | Submits request to admin for approval → confirmation dialog (18.19) |
| **QR Code Download** | Blue link to download practitioner's QR code as PDF |
| **User Dropdown Menu** | "אזור אישי" (Personal Area) + "התנתקות" (Logout, red) |
| **Save/Cancel** | Green save + gray cancel buttons at page bottom |

### 18.21 Practitioner Notifications Panel

> **Figma Node:** `1:19793`
> **Proposed Route:** Overlay/drawer on any practitioner page (triggered by bell icon in header)

#### Layout Description

The notifications panel is a **slide-in drawer/overlay** (white background, 713px wide) that appears over the current page content. It displays a chronological list of notifications relevant to the practitioner.

#### Header

| Element | Details |
|---------|---------|
| **Title** | "התראות" (Notifications) — 20px bold, `#414042` |
| **Bell Icon** | Outline bell icon to the right of the title |
| **Close Button** | X icon, top-left corner (RTL layout), closes the panel |

#### Notification Item Structure

Each notification row follows a consistent layout:

| Element | Details |
|---------|---------|
| **Icon/Avatar** | 51×51px circle on the right side. Either a patient photo (masked circle) or a status icon circle |
| **Title** | 18px demi-bold, `#414042` — notification type label |
| **Description** | 16px regular, `#666666` — details of the notification |
| **Timestamp** | 14px light, `#B8B8B8` — relative time (e.g., "לפני 12 שעות") |
| **Divider** | Horizontal line (`#E5E5E5`) separating each notification |
| **Read State** | Opacity 33% on the entire row indicates a read/old notification |

#### Notification Types

| Type | Icon | Title | Description Example |
|------|------|-------|---------------------|
| **New Treatment** | Patient photo avatar (circle) | טיפול חדש | "מאי בוזו הזמינה טיפול דיקור סיני" (Mai Buzo booked an acupuncture treatment) |
| **Treatment Area Approved** | Green circle (`#DCFCE7`) with white checkmark | הוספת תחום טיפול אושר | "מנהל המערכת אישר את תחום הטיפול החדש שלך" (Admin approved your new treatment area) |
| **Treatment Area Not Approved** | Red circle (`#FFE3E3`) with white X | הוספת תחום טיפול לא אושר | "מנהל המערכת לא אישר את תחום הטיפול החדש שלך" (Admin did not approve your new treatment area) |
| **Article Approved** | Green circle (`#DCFCE7`) with white checkmark | המאמר שלך אושר | "מנהל המערכת אישר את המאמר שלך" (Admin approved your article) |
| **Treatment Cancelled** | Patient photo avatar (circle) | ביטול טיפול | "מאי בוזו ביטלה את הטיפול דיקור סיני" (Mai Buzo cancelled the acupuncture treatment) |

#### Hebrew / English Text Table

| Hebrew | English | Context |
|--------|---------|---------|
| התראות | Notifications | Panel title |
| טיפול חדש | New Treatment | Notification type — patient booked |
| הוספת תחום טיפול אושר | Treatment Area Addition Approved | Notification type — admin approved |
| הוספת תחום טיפול לא אושר | Treatment Area Addition Not Approved | Notification type — admin rejected |
| המאמר שלך אושר | Your Article Approved | Notification type — admin approved article |
| ביטול טיפול | Treatment Cancelled | Notification type — patient cancelled |
| לפני 12 שעות | 12 hours ago | Timestamp format |
| מנהל המערכת אישר | The system admin approved | Description text |
| מנהל המערכת לא אישר | The system admin did not approve | Description text |

### 18.22 Practitioner Notifications — Functionality Summary

| Feature | Details |
|---------|---------|
| **Panel Trigger** | Bell icon in practitioner header opens notifications drawer as overlay |
| **Notification List** | Chronological list of all practitioner-relevant notifications |
| **Patient-Initiated** | New treatment bookings and treatment cancellations show patient avatar + name |
| **Admin-Initiated** | Treatment area approvals/rejections and article approvals show status icon (green check / red X) |
| **Read/Unread State** | Unread notifications at full opacity; read notifications at 33% opacity |
| **Timestamp** | Relative time format ("לפני X שעות/דקות") |
| **Close Action** | X button closes the panel and returns to the underlying page |

---

## 19. Articles (from Figma)

> **Figma Source:** 3 screens — Articles listing page, Article detail (side-by-side layout), Article detail (full-width hero layout). All screens use the authenticated header with "מאמרים" as the active nav item.

### 19.0 Shared Elements

**Page Background:** `#fafafa`

**Authenticated Header (same as Section 9):**
- Navigation items (RTL, 18px): דף בית, חיפוש מטפלים, הטיפולים שלי, חבילות טיפול, **מאמרים** (Demi-bold = active)
- Right cluster: notification icon, message icons, points badge ("150 נקודות", bg `#21544e`, white text, 16px Regular, `rounded-[8px]`, 136×36px), user avatar (44px mask) + "מאי בוזו" (16px Regular) + dropdown arrow
- Logo: "Heali" (PloniMLv2AAA-Bold, 41.937px, tracking 1.6775px) + "Website concept" (PloniMLv2AAA-Regular, 13.115px)

### 19.1 Screen 1 — Articles Listing Page

**Figma Node:** `1:9531`

**Layout:** Vertical stack, gap 30px, positioned at `left-[50px] top-[124px]`, width 1339.266px, items right-aligned

#### 19.1.1 Page Header

- **Title:** "מרכז הידע שלנו" — 30px, Demi-bold, black, right-aligned
- **Subtitle:** "כאן תמצאי מאמרים שיעשו לך סדר ויתנו לך כלים לטפל בעצמך בצורה חכמה ומודעת." — 16px, Light, `#9f9f9f`, leading-[22px]
- Container: width 943.266px, gap 16px vertical

#### 19.1.2 Search Bar

- **Container:** white bg, border `#cddbdb` solid 1px, `rounded-[10px]`, 520px × 50px, `px-[10px] py-[12.07px]`, flex row, gap 7.1px, items right-aligned
- **Placeholder text:** "חיפוש חופשי..." — 14px, Regular, `#666`, tracking `-0.28px`
- **Search icon:** 22.202px × 24px, positioned right of input

#### 19.1.3 Article Card Grid

- **Grid:** 5 columns × 2 rows = 10 cards
- **Container:** width 1339px (full parent), gap 27px horizontal, gap 40px vertical
- **Direction:** RTL (right-to-left flow)

#### 19.1.4 Article Card

Each card is a stacked inline-grid element.

**Image Area:** 246.089px × 184.235px, `rounded-[16.749px]`, object-cover

**Tag Overlay** (positioned at bottom of image area, ml-[85px], flex row, gap 8px):

| Tag | Content | Size | Style |
|---|---|---|---|
| Category | "דיקור סיני" | auto width, h-24px | 12px, Light, black, border `#9f9f9f`, `rounded-[100px]`, gradient bg `linear-gradient(~104deg, #ebecec 161%, white 99%)`, `px-[10px] py-[8px]` |
| Date | "09/10/2025" | 79px × 24px | Same styling as category tag |

**Content Area:** 246px × 128px, white bg, border white, `rounded-bl-[20px] rounded-br-[20px]`, `pt-[16px] px-[10px] pb-[11px]`

**Content Layout (vertical, gap 6px, width 226px, items right-aligned):**

1. **Title:** "שם המאמר לורם איפסום" — 16px, Medium, black, right-aligned, full width
2. **Description:** "תיאור איפסום דולור סיט אמט, קונסקטור אדיפיסינג אלית. פוסיליס קוואם אוגו..." — 14px, Light, `#9f9f9f`, leading-[18px], full width, truncated
3. **Author Row** (flex row, gap 6px, items center):
   - Profile avatar: 31px × 30.969px circular image
   - "פורסם ע"י מאי בוזו" — 14px, Light, black, right-aligned
4. **Navigation Arrow:** 28px icon, positioned `left-[5px] top-[92px]` (absolute, bottom-left of content area)

### 19.2 Screen 2 — Article Detail (Side-by-Side Layout)

**Figma Node:** `1:9788`

**"חזור" (Back) Button:** flex row, gap 13px, items center, positioned `left-[1289px] top-[124px]`
- Arrow icon: 46.233px, rotated 180°
- Text: "חזור" — 24px, Light, black

**Layout:** Two-column, article image on the left, content on the right

#### 19.2.1 Article Image (Left Column)

- **Size:** 476px × 356px, `rounded-[16.749px]`, positioned `left-[50px] top-[208px]`
- Object-cover fill

#### 19.2.2 Article Content (Right Column)

- **Container:** width 692.266px, positioned `left-[697px] top-[201px]`, flex-col, gap 20px, items right-aligned

**Content (top to bottom):**

1. **Tag Row** (flex row, gap 8px):
   - "דיקור סיני" — category pill (same style as listing, but border `#d7d7d7`)
   - "09/10/2025" — date pill (same style, border `#d7d7d7`)

2. **Article Title:** "מרכז הידע שלנו" — 30px, Demi-bold, black, right-aligned, full width (placeholder for article title)

3. **Article Body** (flex-col, gap 20px, 16px Light, `#9f9f9f`, leading-[22px], right-aligned):
   - 3 Hebrew lorem ipsum paragraphs, each with multi-line content and line breaks
   - Full width of container (692px)

4. **Author Attribution** (flex row, gap 8.912px, items center):
   - Profile avatar: 46.044px × 45.999px
   - "פורסם ע"י מאי בוזו" — 20px, Light, black, leading-[32.676px]

#### 19.2.3 Related Practitioners Section

- **Positioned:** `left-[68px] top-[1039px]`, width 1322px, flex-col, gap 30px, items right-aligned

**Heading:** "מטפלים מהתחום" — 30px, Demi-bold, black, right-aligned

**Practitioner Cards:** 4 cards in a horizontal row, gap 40px, each 300px × 408px
- Same card design as Section 13 (Favorites) practitioner cards
- Shadow: `0px 4px 21px 0px rgba(0,0,0,0.07)`
- Top image area: 177px height, gradient bg `#ebecec` → white, `rounded-tl-[20px] rounded-tr-[20px]`
- Cutout practitioner photo (transparent bg)
- Heart/favorite icon: 34px, top-right (`left-[255px] top-[11px]`)
- Availability badge: "זמין לקבל היום" — bg `#eefff3`, `rounded-[45px]`, green dot `#00d22c` (8px), text `#0d8a27` 14px Regular
- Chat icon: 28px, bottom-left
- Content area: 231px height, white bg, `rounded-bl-[20px] rounded-br-[20px]`, p-[10px]
- Treatment tag pills: "דיקור סיני" + "מחיר לטיפול 146₪" (border `#d7d7d7`)
- Name: "ליאת גולדנברג" — 20px, Medium
- Description: placeholder — 14px, Light, `#9f9f9f`
- Location: globe icon + "יפו - תל אביב" — 14px Regular
- Rating: star icon + "4.8/5 (דרוג 500)" — 16px Regular + Light
- Divider line
- Buttons: "צפייה בפרופיל" (bg `#f4f7f7`, 136px) | "קביעת טיפול" (bg `#7de4a8`, 136px) — both `rounded-[8px]`, 16px Regular, `#08190c`

### 19.3 Screen 3 — Article Detail (Full-Width Hero Layout)

**Figma Node:** `1:10030`

**"חזור" (Back) Button:** Same as Screen 2, positioned `left-[1263px] top-[120px]`

**Layout:** Single-column, full-width hero image at top, content below

#### 19.3.1 Hero Image

- **Container:** 1340px wide, positioned `left-[50px] top-[187px]`
- **Image:** Full-width, `rounded-[16.749px]`, with dark overlay `rgba(0,0,0,0.25)` on top
- Masked with rounded corners

#### 19.3.2 Article Content (Full Width)

- **Container:** width 1254px (wider than Screen 2), flex-col, gap 20px, items right-aligned

**Content (top to bottom):**

1. **Tag Row:** Same as Screen 2 — "דיקור סיני" + "09/10/2025" pills (border `#d7d7d7`)

2. **Article Title:** "מרכז הידע שלנו" — 30px, Demi-bold, black, right-aligned, full width

3. **Article Body:** Same styling as Screen 2 (16px Light, `#9f9f9f`, leading-[22px]) but **full 1254px width** instead of 692px — 3 paragraphs of Hebrew lorem ipsum

4. **Author Attribution:** Same as Screen 2 — profile avatar (46px) + "פורסם ע"י מאי בוזו" (20px Light)

#### 19.3.3 Related Practitioners Section

- Same as Screen 2 — "מטפלים מהתחום" heading + 4 practitioner cards (identical design)

### 19.4 Screen Comparison — Side-by-Side vs Full-Width Hero

| Feature | Screen 2 (Side-by-Side) | Screen 3 (Full-Width Hero) |
|---|---|---|
| Article image | Left column, 476×356px, beside content | Full-width hero, 1340px, dark overlay, above content |
| Content width | 692px (right column) | 1254px (full width below hero) |
| Tag position | Above title, right-aligned in content column | Same — above title, right-aligned |
| Author position | Below article body, in content column | Same — below article body |
| Related practitioners | Below article, full width | Same — below article, full width |
| Back button position | `left-[1289px]` | `left-[1263px]` |

### 19.5 Text Table

| Hebrew (HE) | English (EN) |
|---|---|
| מאמרים | Articles |
| מרכז הידע שלנו | Our knowledge center |
| כאן תמצאי מאמרים שיעשו לך סדר ויתנו לך כלים לטפל בעצמך בצורה חכמה ומודעת. | Here you'll find articles that will help you organize and give you tools to take care of yourself wisely and mindfully. |
| חיפוש חופשי... | Free search... |
| שם המאמר לורם איפסום | Article title lorem ipsum |
| תיאור איפסום דולור סיט אמט, קונסקטור אדיפיסינג אלית. פוסיליס קוואם אוגו... | Description lorem ipsum dolor sit amet... |
| פורסם ע"י מאי בוזו | Published by Mai Bozo |
| דיקור סיני | Acupuncture |
| 09/10/2025 | 09/10/2025 |
| חזור | Back |
| מטפלים מהתחום | Practitioners from the field |
| זמין לקבל היום | Available to receive today |
| ליאת גולדנברג | Liat Goldenberg |
| מחיר לטיפול 146₪ | Price per treatment ₪146 |
| 4.8/5 (דרוג 500) | 4.8/5 (500 ratings) |
| יפו - תל אביב | Jaffa - Tel Aviv |
| צפייה בפרופיל | View profile |
| קביעת טיפול | Book treatment |

### 19.6 Articles — Functionality Summary

| Element | Action |
|---|---|
| Search bar (listing page) | → Free text search across articles |
| Article card | → Navigate to article detail page |
| Navigation arrow (card) | → Navigate to article detail |
| Category tag pill | → Filter by category (behavior TBD) |
| "חזור" back button | → Return to previous page |
| Author profile link | → Navigate to author profile (behavior TBD) |
| "צפייה בפרופיל" button (related practitioner) | → Navigate to practitioner profile (Section 11) |
| "קביעת טיפול" button (related practitioner) | → Open booking/appointment flow (Section 12) |

### 19.7 PRD-Confirmed Features Not Yet Visible in Figma

- Article creation/editor UI for practitioners and admins
- Admin approval workflow for articles
- Suggested practitioners matching logic at end of article

---

## 20. Patient Profile / Settings — הפרופיל שלי (from Figma)

> **Figma Source:** 1 screen — Profile page with personal info form, password change form, photo upload, and user dropdown menu. No active nav item highlighted (all Light font). Accessed via the header avatar dropdown.

**Figma Node:** `1:12486`

### 20.0 Page Layout

**Page Background:** `#fafafa`

**Page Title:** "הפרופיל שלי" — 30px, Demi-bold, black, right-aligned

**Content Card:** 1337px × 951px, white bg, `rounded-[10px]`, centered

**Two-column layout inside content card:**
- Right column (personal info): `left-[839px]`, w-[499px]
- Left column (password change): `left-[183px]`, w-[499px]

### 20.1 User Dropdown Menu (Header)

**Trigger:** Clicking the avatar/name in header (arrow rotated 180° = pointing up when open)

**Dropdown:** 184px × 63px, white bg, `rounded-[10px]`, shadow `0px 0px 10px rgba(0,0,0,0.1)`, `px-[13px] py-[21px]`
- "אזור אישי" (Personal area) — 14px, Regular, black
- "התנתקות" (Logout) — 14px, Regular, `#e70202` (red)
- Gap: 20px between items

### 20.2 Profile Photo Upload

**Photo placeholder:** 144×144px, bg `#f4f7f7`, `rounded-[8px]`, border `rgba(177,181,185,0.25)`
- Upload icon (image_arrow_up) centered inside

**Upload button:** "העלאת תמונה" — white bg, border black, `rounded-[8px]`, `px-[12px] py-[8px]`, w-[141px], 14px Regular, black

### 20.3 Personal Info Form (Right Column)

Form fields (vertical stack, gap 30px):

| # | Label (Hebrew) | Label (English) | Input Type | Placeholder |
|---|---|---|---|---|
| 1 | שם מלא | Full name | Text | הקלד/י כאן... |
| 2 | תאריך לידה | Date of birth | Date | 00/00/00000 |
| 3 | כתובת מייל | Email address | Email | הקלד/י כאן... |
| 4 | עיר מגורים | City of residence | Text | 00/00/00000 |
| 5 | מספר נייד | Mobile number | Tel | הקלד/י כאן... |
| 6 | מגדר | Gender | Dropdown | בחירה (Select) |

**Input field styling (shared):**
- h-[48px] (text) or h-[50px] (dropdown), white bg, border `#cddbdb`, `rounded-[10px]`
- Padding: `pl-[12px] pr-[8px] py-[8px]`
- Placeholder: 14px, Regular, `rgba(102,102,102,0.44)`, `tracking-[-0.28px]`
- Label: 16px, Regular, black, right-aligned, gap 12px above input
- Dropdown: down arrow icon 24px on left side

### 20.4 Password Change Form (Left Column)

**Section heading:** "שינוי סיסמה" — 18px, Medium, black, `tracking-[-0.36px]`

Form fields (vertical stack, gap 30px):

| # | Label (Hebrew) | Label (English) |
|---|---|---|
| 1 | סיסמה נוכחית | Current password |
| 2 | סיסמה חדשה | New password |
| 3 | אימות סיסמה חדשה | Confirm new password |

**Submit link:** "החלפת סיסמה" — 16px, Regular, `#21544e`, underlined

### 20.5 Action Buttons (Bottom)

**Layout:** Horizontal row, gap 8px, bottom-left of content card

- **"שמירת שינויים"** (Save changes): bg `#7de4a8`, `rounded-[8px]`, p-[10px], w-[136px], 16px Regular, black
- **"ביטול שינויים"** (Cancel changes): bg `#f4f7f7`, same dimensions and typography

### 20.6 Hebrew / English Text Reference

| Hebrew | English | Context |
|---|---|---|
| הפרופיל שלי | My Profile | Page title |
| אזור אישי | Personal area | Dropdown menu |
| התנתקות | Logout | Dropdown menu (red) |
| העלאת תמונה | Upload photo | Photo upload button |
| שם מלא | Full name | Form label |
| תאריך לידה | Date of birth | Form label |
| כתובת מייל | Email address | Form label |
| עיר מגורים | City of residence | Form label |
| מספר נייד | Mobile number | Form label |
| מגדר | Gender | Form label |
| בחירה | Select | Dropdown placeholder |
| הקלד/י כאן... | Type here... | Input placeholder |
| שינוי סיסמה | Change password | Section heading |
| סיסמה נוכחית | Current password | Form label |
| סיסמה חדשה | New password | Form label |
| אימות סיסמה חדשה | Confirm new password | Form label |
| החלפת סיסמה | Change password | Submit link |
| שמירת שינויים | Save changes | Action button |
| ביטול שינויים | Cancel changes | Action button |

### 20.7 Functionality Summary

| Feature | Figma-confirmed | PRD note |
|---|---|---|
| Profile photo upload | Yes | — |
| Full name field | Yes | — |
| Date of birth field | Yes | — |
| Email field | Yes | PRD: changes handled by admin |
| City of residence field | Yes | PRD: editable by patient |
| Mobile number field | Yes | PRD: changes handled by admin |
| Gender dropdown | Yes | — |
| Password change (3 fields) | Yes | — |
| Save / Cancel buttons | Yes | — |
| User dropdown (personal area + logout) | Yes | — |

---

## 21. Admin Screens (from Figma)

> **Figma Source:** 6 screens — Dashboard home with stats + treatments table + context menu, Treatments list with filters panel, Treatments list with context menu, Update Payment Status dialog, Cancel Treatment confirmation dialog, Site Credit for cancelled treatment dialog. All screens use the authenticated admin header with navigation: דשבורד | טיפולים | מטפלים | מטופלים | קטגוריות | חבילות טיפול | מאמרים.

### 21.0 Shared Layout — Admin Authenticated Header

> **Figma Node:** Extracted from all admin screens

The admin header is **identical in structure** to the practitioner header but has **7 navigation items** instead of 4.

#### Header Bar (80px height, white background)

| Element | Position | Details |
|---------|----------|---------|
| **Heali Logo** | Far right | "Heali" bold + "Website concept" subtitle |
| **Navigation** | Center-right | 7 items, 18px, active item is demi-bold, others light weight |
| **Icon Group** | Center-left | Message (×2) + notification bell icons, 20px each |
| **User Avatar** | Far left | 44px circle photo + name "מאי בוזו" + dropdown chevron |

#### Admin Navigation Items (RTL order, right to left)

| Position | Hebrew | English | Route Proposal |
|----------|--------|---------|----------------|
| 1 (rightmost) | דשבורד | Dashboard | `/admin` |
| 2 | טיפולים | Treatments | `/admin/treatments` |
| 3 | מטפלים | Practitioners | `/admin/practitioners` |
| 4 | מטופלים | Patients | `/admin/patients` |
| 5 | קטגוריות | Categories | `/admin/categories` |
| 6 | חבילות טיפול | Treatment Packages | `/admin/packages` |
| 7 (leftmost) | מאמרים | Articles | `/admin/articles` |

---

### 21.1 Admin Dashboard Home

> **Figma Node:** `1:20007`
> **Proposed Route:** `/admin`

#### Layout Description

Full-width admin dashboard page with **greeting section**, **4 KPI stat cards**, and an embedded **treatments data table** with context menu.

#### Greeting Section

| Element | Details |
|---------|---------|
| **Title** | "צהריים טובים לורם איפסום!" (Good afternoon Lorem Ipsum!) — 30px medium, `#000` |
| **Subtitle** | Lorem ipsum placeholder — 16px regular, `#9F9F9F` |

#### KPI Stat Cards (4 cards in a horizontal row, 136px height)

| Card | Label (Hebrew) | Label (English) | Value | Icon Bg | Icon Color |
|------|---------------|-----------------|-------|---------|------------|
| 1 (rightmost) | סה"כ מטפלים | Total Practitioners | 3,250 | `#F3E8FF` (purple) | `#9333EA` |
| 2 | סה"כ מטופלים | Total Patients | 2,000 | `#DBEAFE` (blue) | `#2563EB` |
| 3 | מטפלים שממתינים לאישור | Practitioners Pending Approval | 2,000 | `#FEF9C3` (yellow) | `#CA8A04` |
| 4 (leftmost) | סה"כ חבילות שנמכרו | Total Packages Sold | 2,000 | `#DCFCE7` (green) | `#16A34A` |

Each card includes:
- Icon in colored rounded square (56×56px, 8px radius)
- Value: 30px medium, `#000`
- Label: 16px light, `#000`
- Trend: "+18% יותר מחודש שעבר" — green `#16A34A` for percentage, `#9F9F9F` for text

#### Treatments Table (embedded below stats)

Same structure as the dedicated Treatments page (21.2) — see below. Includes column headers, data rows with zebra striping, 3-dot action menus, and context menu.

---

### 21.2 Admin Treatments List with Filters Panel

> **Figma Node:** `1:23736`
> **Proposed Route:** `/admin/treatments` (with filters panel open)

#### Layout Description

Full-width treatments management page. Page title "טיפולים" (Treatments) with subtitle. Contains a **filter toolbar**, a **data table**, and an overlaid **filters panel**.

#### Page Header

| Element | Details |
|---------|---------|
| **Title** | "טיפולים" — 30px medium, `#000` |
| **Subtitle** | Lorem ipsum placeholder — 16px regular, `#9F9F9F` |

#### Filter Toolbar (above table)

| Element | Type | Placeholder Text |
|---------|------|------------------|
| **Settings Icon** | Icon button (52×50px) | Filter/settings gear icon (rotated 90°) |
| **Status Filter** | Dropdown (248×50px) | "הצג לפי: כל הסטטוסים" |
| **Treatment Type Filter** | Dropdown (248×50px) | "הצג לפי: כל סוגי הטיפולים" |
| **Category Filter** | Dropdown (248×50px) | "הצג לפי: כל הקטגוריות" |
| **Free Search** | Text input (440×50px) | "חיפוש חופשי..." with search icon |

All dropdowns: white bg, border `#CDDBDB`, 10px radius, 14px Poppins text `#666`.

#### Filters Panel (overlay, 385×344px)

| Element | Details |
|---------|---------|
| **Title** | "פילטרים" (Filters) — 24px medium, `#000` |
| **Payment Filter** | Dropdown: "הצג לפי: כל התשלומים" |
| **Date Filter** | Input with calendar icon: "סינון לפי תאריכים" |
| **Search Button** | Full-width, bg `#21544E`, text white, "חיפוש" — 10px radius, 50px height |

#### Data Table Columns (RTL, right to left)

| Column | Hebrew | English | Notes |
|--------|--------|---------|-------|
| 1 | מספר הזמנה | Order Number | e.g., "8954489" |
| 2 | קטגוריה | Category | e.g., "דיקור סיני" |
| 3 | מטפל | Practitioner | Avatar (18px circle) + name |
| 4 | מטופל | Patient | Avatar (18px circle) + name |
| 5 | תאריך טיפול | Treatment Date | e.g., "08/12/25" |
| 6 | סוג טיפול | Treatment Type | e.g., "טיפול בודד", "חבילת הריון" |
| 7 | סטטוס טיפול | Treatment Status | Badge (see below) |
| 8 | סטטוס תשלום | Payment Status | Text color (see below) |
| 9 | סכום עסקה | Transaction Amount | e.g., "₪500" |
| 10 | Actions | — | 3-dot menu button (34px circle) |

#### Treatment Status Badges

| Status | Hebrew | Badge Bg | Text Color |
|--------|--------|----------|------------|
| Future | עתידי | `#DCFCE7` | `#16A34A` (green) |
| Cancelled | בוטל | `#FFE3E3` | `#E70202` (red) |
| Closed | נסגר | `#DBEAFE` | `#2563EB` (blue) |

#### Payment Status Text

| Status | Hebrew | Text Color |
|--------|--------|------------|
| Paid | שולם | `#16A34A` (green) |
| Not Paid | לא שולם | `#E70202` (red) |

#### Table Row Styling

- **Zebra striping:** Alternating `#FFFFFF` and `#FAFAFA` backgrounds
- **Row height:** 54px for striped rows, 34px for non-striped
- **Text:** 16px light, `#000`, tracking `-0.32px`

---

### 21.3 Admin Treatments List with Context Menu

> **Figma Node:** `1:21594`
> **Proposed Route:** `/admin/treatments` (with row context menu open)

Same layout as 21.2 but showing a **context menu** triggered by the 3-dot button on a row.

#### Context Menu (241×166px, white, shadow, 12px radius)

| Item | Hebrew | English | Notes |
|------|--------|---------|-------|
| 1 | ביטול טיפול | Cancel Treatment | Opens cancel confirmation (21.5) |
| 2 | עדכון סטטוס תשלום | Update Payment Status | Opens payment status dialog (21.4) |
| 3 | פרופיל מטפל | Practitioner Profile | Navigates to practitioner profile |
| 4 | פרופיל מטופל | Patient Profile | Navigates to patient profile |

Items separated by `#EAEBEB` divider lines. Text: 16px light, `#000`.

---

### 21.4 Admin — Update Payment Status Dialog

> **Figma Node:** `1:22137`
> **Proposed Route:** Modal overlay on `/admin/treatments`

#### Layout Description

Centered modal dialog (518×299px, white, 16px radius) with X close button.

| Element | Details |
|---------|---------|
| **Close Button** | X icon, top-left (33×33px) |
| **Title** | "עדכון סטטוס תשלום" (Update Payment Status) — 30px bold, `#000`, centered |
| **Description** | "יש לבחור את סטטוס התשלום של הטיפול כדי לשמור על נתונים מעודכנים." — 16px light, `#9F9F9F`, centered |
| **Status Dropdown** | Full-width (398px), border `#CDDBDB`, "עסקה שולמה" (Transaction Paid) — 14px regular, `#666` |
| **Save Button** | Full-width, bg `#7DE4A8`, text `#08190C`, "שמירה" — 16px bold, 8px radius |

---

### 21.5 Admin — Cancel Treatment Confirmation Dialog

> **Figma Node:** `1:22418`
> **Proposed Route:** Modal overlay on `/admin/treatments`

#### Layout Description

Centered modal dialog (white, 10px radius) with X close button.

| Element | Details |
|---------|---------|
| **Close Button** | X icon, top-left (33×33px) |
| **Title** | "אישור ביטול טיפול" (Cancel Treatment Confirmation) — 30px bold, `#000`, centered |
| **Description** | "פעולה זו תבטל את הטיפול עבור המטופל. לאחר האישור ניתן יהיה לבחור האם להעניק זיכוי." — 16px light, `#9F9F9F`, centered, 358px wide |
| **Cancel Button** | bg `#E70202` (red), text white, "ביטול טיפול" — 16px bold, 288px wide, 8px radius |

---

### 21.6 Admin — Site Credit for Cancelled Treatment Dialog

> **Figma Node:** `1:22695`
> **Proposed Route:** Modal overlay (follows 21.5 cancel confirmation)

#### Layout Description

Centered modal dialog (white, 10px radius) with X close button. Appears after treatment cancellation is confirmed.

| Element | Details |
|---------|---------|
| **Close Button** | X icon, top-left (33×33px) |
| **Title** | "זיכוי באתר עבור טיפול מבוטל" (Site Credit for Cancelled Treatment) — 30px bold, `#000`, centered |
| **Description** | "הטיפול בוטל בהצלחה. ניתן לבחור האם להעניק זיכוי באתר, שיאפשר טיפול ללא עלות בעתיד." — 16px light, `#9F9F9F`, centered, 358px wide |
| **Yes Button** | bg `#7DE4A8`, text `#08190C`, "כן" — 16px bold, 210px wide, 8px radius |
| **No Button** | bg `#F4F7F7`, text `#000`, "לא" — 16px medium, 210px wide, 8px radius |

---

### 21.7 Admin Screens — Hebrew / English Text Table

| Hebrew | English | Context |
|--------|---------|---------|
| דשבורד | Dashboard | Admin nav item (active) |
| טיפולים | Treatments | Admin nav item + page title |
| מטפלים | Practitioners | Admin nav item |
| מטופלים | Patients | Admin nav item |
| קטגוריות | Categories | Admin nav item |
| חבילות טיפול | Treatment Packages | Admin nav item |
| מאמרים | Articles | Admin nav item |
| צהריים טובים לורם איפסום! | Good afternoon Lorem Ipsum! | Dashboard greeting |
| סה"כ מטפלים | Total Practitioners | KPI card label |
| סה"כ מטופלים | Total Patients | KPI card label |
| מטפלים שממתינים לאישור | Practitioners Pending Approval | KPI card label |
| סה"כ חבילות שנמכרו | Total Packages Sold | KPI card label |
| יותר מחודש שעבר | more than last month | Trend text |
| מספר הזמנה | Order Number | Table column header |
| קטגוריה | Category | Table column header |
| מטפל | Practitioner | Table column header |
| מטופל | Patient | Table column header |
| תאריך טיפול | Treatment Date | Table column header |
| סוג טיפול | Treatment Type | Table column header |
| סטטוס טיפול | Treatment Status | Table column header |
| סטטוס תשלום | Payment Status | Table column header |
| סכום עסקה | Transaction Amount | Table column header |
| טיפול בודד | Single Treatment | Treatment type value |
| חבילת הריון | Pregnancy Package | Treatment type value |
| עתידי | Future | Treatment status badge |
| בוטל | Cancelled | Treatment status badge |
| נסגר | Closed | Treatment status badge |
| שולם | Paid | Payment status |
| לא שולם | Not Paid | Payment status |
| פילטרים | Filters | Filters panel title |
| הצג לפי: כל הסטטוסים | Show by: All Statuses | Filter dropdown |
| הצג לפי: כל סוגי הטיפולים | Show by: All Treatment Types | Filter dropdown |
| הצג לפי: כל הקטגוריות | Show by: All Categories | Filter dropdown |
| הצג לפי: כל התשלומים | Show by: All Payments | Filter dropdown |
| סינון לפי תאריכים | Filter by Dates | Date filter |
| חיפוש חופשי | Free Search | Search input |
| חיפוש | Search | Filters panel button |
| ביטול טיפול | Cancel Treatment | Context menu item |
| עדכון סטטוס תשלום | Update Payment Status | Context menu item + dialog title |
| פרופיל מטפל | Practitioner Profile | Context menu item |
| פרופיל מטופל | Patient Profile | Context menu item |
| עסקה שולמה | Transaction Paid | Payment status dropdown option |
| שמירה | Save | Save button |
| אישור ביטול טיפול | Cancel Treatment Confirmation | Dialog title |
| זיכוי באתר עבור טיפול מבוטל | Site Credit for Cancelled Treatment | Dialog title |
| כן | Yes | Credit dialog confirm |
| לא | No | Credit dialog decline |

### 21.8 Admin Treatments — Functionality Summary

| Feature | Details |
|---------|---------|
| **Dashboard KPI Cards** | 4 stat cards: Total Practitioners, Total Patients, Pending Approval, Packages Sold. Each with icon, value, trend percentage |
| **Treatments Data Table** | 9-column data table with order number, category, practitioner, patient, date, type, treatment status, payment status, amount |
| **Zebra Striping** | Alternating row backgrounds (`#FFF` / `#FAFAFA`) for readability |
| **Filter Toolbar** | Inline dropdowns for status, treatment type, category + free text search |
| **Advanced Filters Panel** | Overlay panel with payment filter, date range filter, and search button |
| **Row Context Menu** | 3-dot button per row → 4 actions: cancel treatment, update payment, view practitioner profile, view patient profile |
| **Update Payment Status** | Modal dialog with status dropdown + save button |
| **Cancel Treatment Flow** | Step 1: Confirmation dialog with red cancel button → Step 2: Credit dialog (Yes/No) for granting site credit |
| **Treatment Status System** | 3 statuses: עתידי (Future/green), בוטל (Cancelled/red), נסגר (Closed/blue) |
| **Payment Status System** | 2 statuses: שולם (Paid/green text), לא שולם (Not Paid/red text) |

---

## 22. Notification Touchpoints (from PRD)

| Event | Recipient |
|---|---|
| Email verification | New user |
| Profile under review | Practitioner |
| Profile approved (welcome email) | Practitioner |
| New booking request | Practitioner |
| Booking confirmed | Patient |
| Satisfaction survey (~2h after QR scan) | Patient |
| Cancellation credit issued | Patient |

> Notification channels (email, SMS, in-app, WhatsApp) — scope and providers TBD.

### 22.1 Notifications Full Page — from Figma

**Figma Node:** `1:6279`

> This screen (1440×917px) shows the authenticated home page with the in-page notification panel open. The home page sections (hero, categories, practitioner rows, footer) are the same as Section 9. The key new content is the notification panel and additional home page sections not previously documented.

#### 22.1.1 Notification Panel (Overlay on Home Page)

**Panel header:** "התראות" title

**Notification items:** Separated by horizontal divider lines (713px wide), each item ~51px height

**Three notification types confirmed:**

| Type | Title | Description | Timestamp | Action Button |
|---|---|---|---|---|
| Discount | "50% הנחה" | "קיבלת מאיתנו 50% הנחה לטיפול הבא שלך" | "לפני 12 שעות" | "מימוש הטבה" (136×36px) |
| Points | "נקודות" | "קיבלת מאיתנו מתנה 10 נקודות" | "לפני 12 שעות" | — |
| Cancellation | "ביטול טיפול" | "מאי בוזו ביטלה את הטיפול שלך" | "לפני 12 שעות" | "הזמן טיפול חדש" (136×36px) |

**Each notification item anatomy:**
- Right side: Icon (28px, inside 51px div container)
- Title: e.g. "50% הנחה" or "נקודות" — bold heading
- Description: one-line summary
- Timestamp: "לפני 12 שעות" — secondary text
- Left side (optional): Action button

#### 22.1.2 Recent Messages Section (Home Page)

**Section heading:** "הודעות אחרונות"

**Message preview cards (4 items):**
- Name: "ליאת גולדנברג" — Medium
- Timestamp: "היום ב-6:10PM" — Light
- Preview: "זהו טקסט דמה שנועד להמחיש את לורם איפסום דולור...." — Light, `#9f9f9f`

**View all link:** "צפייה בכל ההודעות" — navigates to Messages page (Section 25)

#### 22.1.3 Help Section (Home Page)

- Heading: "צריכים עזרה? אנחנו כאן בשבילך תמיד."
- CTA: "צור איתנו קשר" — navigates to Contact Us (Section 8)

### 22.2 Notification Type Comparison (Alerts Panel vs In-Page Panel)

| Feature | Alerts Panel (Section 26) | In-Page Panel (22.1) |
|---|---|---|
| Container | 526px standalone panel | 713px overlay on home page |
| Notification height | ~variable per type | ~51px fixed |
| Types | Message + Promotion | Discount + Points + Cancellation |
| Separators | Gap 40px | Horizontal line dividers |
| Actions | Underlined text links | Green CTA buttons |

---

## 24. Care Packages — חבילות טיפול (from Figma)

> **Figma Source:** 3 screens — All Packages browsing page (category cards), Package Purchase modal, My Packages list page. All screens use the authenticated header with "חבילות טיפול" as the active nav item.

### 24.0 Shared Elements

**Page Background:** `#fafafa`

**Page Header:**
- Title: "חבילות טיפול" — 30px, Demi-bold, black, right-aligned
- Subtitle: "כל החבילות הפעילות שלך במקום אחד, לצד חבילות נוספות שיכולות להשתלב בהמשך הדרך." — 16px, Light, `#9f9f9f`, `leading-[22px]`, right-aligned

**Tab Switcher:**
- Container: 567px × 51px, white bg, `rounded-[10px]`, `px-[16px] py-[10px]`
- 2 tabs (not 3 like My Treatments):
  - "כל החבילות" (All Packages) — 263px
  - "החבילות שלי" (My Packages) — 262px
- Active tab: bg `#7de4a8`, Regular font
- Inactive tab: white bg, Light font
- All tabs: 18px, `tracking-[-0.36px]`

### 24.1 Screen 1 — All Packages (כל החבילות)

**Figma Node:** `1:11665`

**Active tab:** "כל החבילות" highlighted with `#7de4a8` background

**Category Cards Grid:**
- Layout: Horizontal row, 4 cards, gap 26px
- Each card: 295px × 329px, `rounded-[16px]`, border white, overflow hidden
- Shadow: `0px 3.525px 17.625px 0px rgba(100,111,198,0.25)`

**Card gradient backgrounds (top to bottom):**

| Card | Theme | From | To |
|---|---|---|---|
| 1 | Gold | `#ffd28b` | `#ffc15e` |
| 2 | Green | `#7de4a8` | `#4bb377` |
| 3 | Peach | `#ffd2c1` | `#ffa480` |
| 4 | Teal | `#7ac1b9` | `#3d9b90` |

**Card anatomy (each card):**
- **Center icon circle:** 110px, `rounded-[68px]`, border 3.4px white, `backdrop-blur-[11.333px]`
  - Radial gradient matching card theme
  - Shadow matches card theme (e.g. gold: `0px 4.533px 22.667px 0px #f2bd68`)
  - Icon inside: ~74px (treatment category illustration)
  - Positioned at vertical center minus 35.5px offset
- **Badge (top-left):** "סה״כ 16 חבילות" — 14px, Regular, `rounded-[45px]`, h-[28px], `px-[10px] py-[2px]`, border 0.7px
  - Badge colors per card theme:

| Card | Badge bg | Badge border | Badge text |
|---|---|---|---|
| Gold | `#fff6e6` | `#fed085` | `#fed085` |
| Green | `#deffec` | `#4cb578` | `#4cb578` |
| Peach | `#ffdfd2` | `#ffa987` | `#ffa987` |
| Teal | `#b6f0ea` | `#449f94` | `#449f94` |

- **Text block (bottom area, left-[24px] top-[211px], w-[252px]):**
  - Title: placeholder "לורם איפסום דולור" — 20px, Bold, white
  - Description: placeholder text — 14px, Light, white, `leading-[19.17px]`
- **Navigation arrow button (bottom-left):** 38px circle, left-pointing arrow icon
- **Decorative grid pattern:** Checkerboard squares 37.274px, `opacity-[0.10]` to `opacity-[0.16]`, `rgba(243,246,246,0.9)`, positioned at corners

### 24.2 Screen 2 — Package Purchase Modal (רכישת חבילה)

**Figma Node:** `1:12064`

**Modal container:** White bg, `rounded-[16px]`, `px-[21px] py-[34px]`

**Layout (flex-col, gap 40px, w-[479px]):**

1. **Package icon:** 54px circle, `rounded-[33.382px]`, border 1.669px white, `backdrop-blur-[5.564px]`
   - Radial gradient (green): `#8de5b2` → `#6ccd95` → `#4bb477`
   - Category illustration inside: ~36.6px

2. **Package info (gap 14px):**
   - Name: "שם החבילה לורם איפסום" — 20px, Medium, black, right-aligned
   - Description: placeholder text — 16px, Light, `#9f9f9f`, `leading-[22px]`, right-aligned

3. **Treatment quantity selector (gap 14px):**
   - Label: "בחירת כמות טיפולים" — 16px, Regular, black, right-aligned
   - Dropdown: h-[50px], white bg, border `#cddbdb`, `rounded-[10px]`, `pl-[12px] pr-[8px] py-[8px]`
     - Value: "06 טיפולים" — 14px, Poppins Regular, `#666`, `tracking-[-0.28px]`, right-aligned
     - Down arrow icon: 24px (left side of dropdown)

4. **Total row:** bg `#f4f7f7`, h-[56px], `rounded-[10px]`, `px-[13px] py-[9px]`
   - Left: "₪200" — 18px, Medium, black
   - Right: "סה״כ לתשלום" — 18px, Medium, black

5. **Purchase button:** "רכישת חבילה" — bg `#7de4a8`, `rounded-[8px]`, `px-[10px] py-[12px]`, w-[468px], Poppins Bold 16px, text `#08190c`, center-aligned

### 24.3 Screen 3 — My Packages (החבילות שלי)

**Figma Node:** `1:12088`

**Active tab:** "החבילות שלי" highlighted with `#7de4a8` background

**Package Cards List:**
- Layout: Vertical stack, gap 30px, w-[609px]
- Each card: 609px × 166px, white bg, border `#cddbdb`, `rounded-[10px]`, `px-[20px] py-[26px]`

**Card anatomy (each card):**
- **Right side — Package icon:** 110px circle, `rounded-[68px]`, border 3.4px white, `backdrop-blur-[11.333px]`
  - Same radial gradient as category cards (varies per package type)
  - Category illustration: ~74px
- **Left side — Package info (w-[440px], gap 24px):**
  - **Top block (w-[252px], h-[64px], gap 5px):**
    - Order number: "מספר הזמנה: 7487849ר8" — 14px, Light, `#9f9f9f`
    - Package name: "חבילת לורם איפסום" — 20px, Medium, black
    - Description: placeholder text — 14px, Light, `#9f9f9f`, `leading-[19.17px]`
  - **Info badges row (gap 30px):**
    - Calendar icon (vuesax/bold/calendar) + "תוקף חבילה: 15.10.25" — 14px, Light, `#575757`
    - Flash icon (vuesax/bold/flash) + "טיפולים שנותרו: 10" — 14px, Light, `#575757`
    - Wallet icon (vuesax/bold/empty-wallet) + "סה״כ שולם ₪150" — 14px, Light, `#575757`
    - Each icon badge: `#f6f6f6` circle 20px, icon 12px, `rounded-[45px]`, p-[3px]

**Status Badges (positioned top-right area of card):**
- Active: "חבילה פעילה" — bg `#eefff3`, text `#0d8a27`, 14px Regular, `rounded-[45px]`, h-[28px], `px-[10px] py-[2px]`
- Expired: "חבילה נגמרה" — bg `#ffe0e2`, text `#e70202`, same dimensions

### 24.4 Hebrew / English Text Reference

| Hebrew | English | Context |
|---|---|---|
| חבילות טיפול | Care Packages / Treatment Packages | Page title & nav item |
| כל החבילות הפעילות שלך במקום אחד, לצד חבילות נוספות שיכולות להשתלב בהמשך הדרך. | All your active packages in one place, alongside additional packages that can fit in along the way. | Page subtitle |
| כל החבילות | All Packages | Tab label |
| החבילות שלי | My Packages | Tab label |
| סה״כ 16 חבילות | Total 16 packages | Category card badge |
| שם החבילה לורם איפסום | Package name lorem ipsum | Modal — package name |
| בחירת כמות טיפולים | Select treatment quantity | Modal — dropdown label |
| 06 טיפולים | 06 treatments | Modal — dropdown value |
| סה״כ לתשלום | Total to pay | Modal — total label |
| רכישת חבילה | Purchase package | Modal — CTA button |
| חבילת לורם איפסום | Lorem ipsum package | My Packages — card name |
| מספר הזמנה | Order number | Card field |
| תוקף חבילה | Package expiry | Card info badge |
| טיפולים שנותרו | Treatments remaining | Card info badge |
| סה״כ שולם | Total paid | Card info badge |
| חבילה פעילה | Active package | Status badge |
| חבילה נגמרה | Package expired | Status badge |

### 24.5 Functionality Summary

| Feature | Figma-confirmed | Notes |
|---|---|---|
| 2-tab layout (all packages / my packages) | Yes | 567px switcher, 2 tabs |
| Category cards browsing (4 color themes) | Yes | 295×329px gradient cards |
| Package count badge per category | Yes | "סה״כ 16 חבילות" |
| Package purchase modal | Yes | Quantity selector + total + CTA |
| Treatment quantity dropdown | Yes | Dropdown with "06 טיפולים" |
| Total price calculation | Yes | ₪200 shown |
| My packages list view | Yes | Vertical card list |
| Package status badges (active/expired) | Yes | Green/red pill badges |
| Remaining treatments counter | Yes | "טיפולים שנותרו: 10" |
| Package expiry date | Yes | "תוקף חבילה: 15.10.25" |
| Navigation arrow on category cards | Yes | 38px circle button |

---

## 25. Messages (from Figma)

> **Figma Source:** 2 screens — Messages chat view (clean state), Messages chat view (with popover states: delete menu + emoji picker). No dedicated nav item is active; all header nav items use Light font.

### 25.0 Shared Layout

**Page Background:** `#fafafa`

**Main Container:** 1340px × 785px, white bg, `rounded-[10px]`, positioned `left-[50px] top-[102px]`, `overflow-clip`

**Two-Panel Split Layout:**
- **Vertical divider** at x=1014px, full height (785px) — separates chat area from conversation sidebar
- **Horizontal divider** at y=124px, width 1013px — separates chat header from message area

### 25.1 Screen 1 — Messages Chat View

**Figma Node:** `1:12603`

#### 25.1.1 Right Sidebar — Conversation List

**Search Bar (above sidebar):**
- Position: 286px × 50px, white bg, border `#cddbdb`, `rounded-[10px]`, `px-[10px] py-[12.07px]`
- Search icon: 22.202×24px (right side)
- Placeholder: "חיפוש הודעה..." — 14px, Poppins Regular, `#666`, `tracking-[-0.28px]`

**Conversation Items (vertical stack, gap 4px, w-[276px]):**
- Each item: h-[117px], `rounded-[10px]`, `py-[10px]`
- **Normal state:** white bg
- **Selected/active state:** gradient bg `#ebecec` → white, border `#cddbdb`
- **Avatar:** 50px, `rounded-[55.556px]`, gradient bg `#ebecec` → white
- **Name:** "ליאת גולדנברג" — 16px, Medium, black, right-aligned
- **Timestamp badge:** "היום ב-6:10PM" — 12px, Light, gradient bg `#ebecec` → white, h-[18px], `rounded-[8px]`, `px-[12px] py-[4px]`, w-[91px]
- **Message preview:** "זהו טקסט דמה שנועד להמחיש את לורם איפסום דולור...." — 14px, Light, `#9f9f9f`, `leading-[18px]`
- 6 conversation items visible in the screenshot

#### 25.1.2 Chat Header (above horizontal divider)

**Three-dot menu:** 39px (bx-dots-horizontal-rounded icon), positioned top-left of chat area

**Practitioner Info (right-aligned):**
- **Avatar:** 79px, `rounded-[100px]`, border 0.994px `#e5e5e5`
- **Name:** "ליאת גולדנברג" — 26px, Medium, black
- **"Highly rated" badge:** "מדורגת גבוהה" — bg `#e9deff`, text `#ad80ff`, 14px Regular, `rounded-[100px]`, h-[27px], w-[118px], with verification icon 22px
- **Rating:** star icon (grade) + "4.8/5" (16px Regular) + "(דרוג 500)" (16px Light)
- **Specialty tags row (gap 10px):**
  - "דיקור סיני" + "מדיטציה טיפולית" — 12px, Light, border `#d7d7d7`, `rounded-[100px]`, h-[24px], `px-[10px] py-[8px]`, gradient bg `#ebecec` → white

#### 25.1.3 Chat Messages Area

**Date separator:** "15 באפריל 2024, 15:00" — 16px, Light, `#0c0c0c`, `leading-[22px]`, center-aligned

**Patient messages (right-aligned):**
- White bg, border `#f4f7f7`, `rounded-[10px]`, p-[10px]
- Text: 16px, Light, black, `leading-[22px]`, right-aligned
- Example: "היי רציתי לברר לגבי מחיר של טיפול אצלך ואם לורם איספסםםו?"

**Practitioner messages (left-aligned):**
- bg `#eefff3` (light green), border white, `rounded-[10px]`, p-[10px]
- Small practitioner avatar: 41×42px beside message
- Text: 16px, Light, black, `leading-[22px]`, right-aligned
- Example: "היי, המחיר של טיפול הוא לורם אנפסום"

#### 25.1.4 Message Input Bar (bottom)

**Layout:** horizontal row, gap 14px

- **Emoji button:** 56px circle, bg `#f6f6f6`, `rounded-[100px]`, smile icon 24px centered
- **Attachment button:** 56px, image icon (bx-image.svg)
- **Text input field:** 833px × 56px, bg `#f6f6f6`, border 2px white, `rounded-[28px]`, `backdrop-blur-[19.5px]`, p-[5px]
  - Placeholder: "הקלד/י את ההודעה כאן....." — 18px, Light, `#828194`
  - Send arrow button: 38px, rotated 180° (pointing left / RTL send direction)

### 25.2 Screen 2 — Messages with Popover States

**Figma Node:** `1:12301`

Same layout as Screen 1, with two additional overlay elements:

#### 25.2.1 Delete Conversation Dropdown

**Trigger:** Three-dot menu button (top-left)

**Dropdown:**
- White bg, `rounded-[16px]`, border `rgba(177,181,185,0.25)`
- Shadow: `0px 4px 24px rgba(0,0,0,0.08)`
- Padding: `px-[8px] py-[14px]`
- Single option: "מחיקה" (Delete) — 14px, Regular, `#e70202`, p-[4px], `rounded-[8px]`, w-[180px]
- Hand cursor icon indicating interactive state

#### 25.2.2 Emoji Picker Popover

**Trigger:** Emoji (smile) button in input bar

**Popover:**
- White bg, `rounded-[100px]`, p-[10px], w-[272.608px]
- Shadow: `0px 2px 20px rgba(0,0,0,0.1)`
- **Quick emoji row:** 😍 🎉 🥺 ☺️ ❤️ 😞 🤩 😩
  - Size: 22.869px, Regular font, gap 9.801px, `leading-[35.938px]`
- **Triangle pointer:** 33px, pointing downward toward the emoji button

### 25.3 Message Bubble Comparison

| Feature | Patient (sender) | Practitioner (receiver) |
|---|---|---|
| Alignment | Right-aligned | Left-aligned |
| Background | white | `#eefff3` (light green) |
| Border | `#f4f7f7` | white |
| Avatar | None shown | 41×42px beside message |
| Text style | 16px, Light, black | 16px, Light, black |

### 25.4 Hebrew / English Text Reference

| Hebrew | English | Context |
|---|---|---|
| חיפוש הודעה... | Search message... | Search bar placeholder |
| היום ב-6:10PM | Today at 6:10PM | Conversation timestamp |
| 15 באפריל 2024, 15:00 | April 15, 2024, 15:00 | Chat date separator |
| היי רציתי לברר לגבי מחיר של טיפול אצלך ואם לורם איספסםםו? | Hi, I wanted to ask about the price of a treatment with you and if lorem ipsum? | Patient message example |
| היי, המחיר של טיפול הוא לורם אנפסום | Hi, the price of a treatment is lorem ipsum | Practitioner message example |
| הקלד/י את ההודעה כאן..... | Type your message here..... | Input placeholder |
| מחיקה | Delete | Dropdown menu option |
| מדורגת גבוהה | Highly rated | Practitioner badge |
| דיקור סיני | Acupuncture | Specialty tag |
| מדיטציה טיפולית | Therapeutic meditation | Specialty tag |
| ליאת גולדנברג | Liat Goldenberg | Practitioner name |

### 25.5 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Two-panel split (chat + conversation list) | Yes |
| Conversation search bar | Yes |
| Conversation list with avatar, name, timestamp, preview | Yes |
| Active/selected conversation highlight | Yes (gradient bg + border) |
| Chat header with practitioner info, rating, specialties | Yes |
| Date separator in chat | Yes |
| Patient vs practitioner message bubble styling | Yes (white vs green) |
| Practitioner avatar beside messages | Yes |
| Message input with placeholder | Yes |
| Send button (arrow) | Yes |
| Emoji picker (quick emoji row) | Yes |
| Image/attachment button | Yes |
| Three-dot menu → Delete conversation | Yes |

---

## 26. Alerts / Notifications — התראות (from Figma)

> **Figma Source:** 5 screens — Alerts panel (notification list), 50% Discount reward modal, 50% Discount success confirmation, Free Treatment reward modal, Free Treatment success confirmation. This is a slide-over panel + modal flow, not a full page.

### 26.0 Shared Elements

**Reward Modal Layout (shared by Screens 2 & 4):**
- Container: white bg, `rounded-[24px]`, `overflow-clip`, w-[600px]
- Hero section: bg `#21544e`, h-[307px], `overflow-clip`, confetti illustration
- Close button (X): `right-[17.09px] top-[18.93px]`, 36px, `rounded-[50px]`, icon 24px
- Hero text: 64px, Regular, white, center, `leading-[1.06]`
- Content section: `left-[68px] top-[369.17px]`, w-[465px], gap 14px
- CTA button: "מימוש הטבה" — bg `#7de4a8`, `rounded-[8px]`, `px-[10px] py-[12px]`, w-[468px], Poppins Bold 16px, text `#08190c`

**Success Confirmation Layout (shared by Screens 3 & 5):**
- Container: white bg, `rounded-[16px]`, `px-[21px] py-[34px]`
- Confirmation illustration (checkmark): 176.931px
- Gap: 51px
- Title: 30px, Bold, black, center
- Gap: 18px
- Description: 16px, Light, `#9f9f9f`, center, `leading-[20px]`

### 26.1 Screen 1 — Alerts Panel (התראות)

**Figma Node:** `1:3402`

**Panel container:** White bg, `rounded-[20px]`, w-[526px]

**Header bar:**
- bg `#21544e`, `rounded-tl-[20px] rounded-tr-[20px]`, `px-[20px] py-[17px]`
- Right: Bell icon (27px) + "התראות" — 20px, Light, white
- Left: Close button (X icon), 33px

**Notification list:** Vertical stack, gap 40px, w-[486px], `left-[20px] top-[100px]`

**Notification Type 1 — New Message:**
- **Avatar:** 32px, `rounded-[55.556px]`, gradient bg `#ebecec` → white (practitioner photo)
- **Title:** "יש לך הודעה חדשה" — 14px, Demi-bold, black, `leading-[52px]`
- **Description:** "קיבלת הודעה חדשה מיותם ישראלי" — 14px, Light, `#9f9f9f`, `leading-[26px]`
- **Timestamp:** "23.03.25 שעה 08:45" — 14px, Light, `#9f9f9f`, `leading-[26px]`
- **Action link:** "צפייה בהודעה" — 14px, Medium, black, underlined
- Info column: w-[217px]

**Notification Type 2 — Promotion / Reward:**
- **Icon:** 32px, bg `#7de4a8`, border 2px `#d6ffe7`, `rounded-[27px]`, flash icon 20px (vuesax/bold/flash)
- **Title:** varies — 14px, Demi-bold, black, `leading-[52px]`
  - "50 אחוז הנחה על הטיפול הבא"
  - "טיפול חינם"
- **Description:** varies — 14px, Light, `#535768`, `leading-[26px]`
  - "קיבלת מאיתנו 50% הנחה לטיפול הבא במימוש של 50 נקודות"
  - "קיבלת מאיתנו טיפול חינם במימוש של 1,000 נקודות"
- **Timestamp:** "23.03.25 שעה 08:45" — 14px, Light, `#828194`, `leading-[26px]`
- **Action link:** "צפייה בהטבה" — 14px, Medium, black, underlined
- Info column: w-[255px]

**Notification type differences:**

| Feature | Message | Promotion |
|---|---|---|
| Icon | Practitioner avatar (32px, gradient) | Flash icon (32px, green circle) |
| Description color | `#9f9f9f` | `#535768` |
| Timestamp color | `#9f9f9f` | `#828194` |
| Action text | "צפייה בהודעה" | "צפייה בהטבה" |
| Info width | 217px | 255px |

### 26.2 Screen 2 — 50% Discount Reward Modal

**Figma Node:** `1:4183`

**Hero text:** "קיבלת מאיתנו 50% הנחה" — 64px, Regular, white, center, two lines

**Content:**
- Title: "הרווחת 50% הנחה על הטיפול הבא שלך." — 30px, Medium, black, right-aligned
- Description: "מימוש ההטבה יתבצע באמצעות 500 נקודות שצברת." — 20px, Light, `#9f9f9f`, center, `leading-[22px]`

**CTA:** "מימוש הטבה" (Redeem benefit)

### 26.3 Screen 3 — 50% Discount Success Confirmation

**Figma Node:** `1:5563`

- **Title:** "ההטבה נוספה בהצלחה" — 30px, Bold, black, center
- **Description:** "הנחת 50% נוספה לחשבון שלך ותופעל אוטומטית בתשלום בעת הזמנת הטיפול הבא. אין צורך לבצע פעולה נוספת, פשוט להזמין וליהנות מההנחה." — 16px, Light, `#9f9f9f`, center, `leading-[20px]`

### 26.4 Screen 4 — Free Treatment Reward Modal

**Figma Node:** `1:4873`

**Hero text:** "טיפול חינם מחכה לך." — 64px, Regular, white, center, two lines

**Content:**
- Title: "הרווחת טיפול חינם!" — 30px, Medium, black, right-aligned
- Description: "מימוש ההטבה מתבצע באמצעות 1,000 נקודות, ולאחר המימוש הטיפול יתווסף לחשבון שלך ויופעל אוטומטית בתשלום בעת הזמנת הטיפול הבא." — 20px, Light, `#9f9f9f`, center, `leading-[22px]`

**CTA:** "מימוש הטבה" (Redeem benefit)

### 26.5 Screen 5 — Free Treatment Success Confirmation

**Figma Node:** `1:6259`

- **Title:** "ההטבה נוספה בהצלחה!" — 30px, Bold, black, center (with exclamation mark)
- **Description:** "הרווחת טיפול חינם, והוא נוסף לחשבון שלך. ההטבה תופעל אוטומטית בתשלום בעת הזמנת הטיפול הבא ללא צורך בפעולה נוספת." — 16px, Light, `#9f9f9f`, center, `leading-[20px]`, w-[385px]

### 26.6 Reward Redemption Flow

```
Alerts Panel → "צפייה בהטבה" click
  ├── 50% Discount path:
  │     Reward Modal (Screen 2) → "מימוש הטבה" → Success (Screen 3)
  └── Free Treatment path:
        Reward Modal (Screen 4) → "מימוש הטבה" → Success (Screen 5)
```

### 26.7 Reward Modal Comparison

| Feature | 50% Discount (Screen 2) | Free Treatment (Screen 4) |
|---|---|---|
| Hero text | "קיבלת מאיתנו 50% הנחה" | "טיפול חינם מחכה לך." |
| Title | "הרווחת 50% הנחה על הטיפול הבא שלך." | "הרווחת טיפול חינם!" |
| Points required | 500 נקודות | 1,000 נקודות |
| CTA | "מימוש הטבה" | "מימוש הטבה" |
| Success title | "ההטבה נוספה בהצלחה" | "ההטבה נוספה בהצלחה!" |

### 26.8 Hebrew / English Text Reference

| Hebrew | English | Context |
|---|---|---|
| התראות | Alerts / Notifications | Panel title |
| יש לך הודעה חדשה | You have a new message | Message notification title |
| קיבלת הודעה חדשה מיותם ישראלי | You received a new message from Yotam Israeli | Message notification desc |
| צפייה בהודעה | View message | Message action link |
| צפייה בהטבה | View benefit | Promotion action link |
| 50 אחוז הנחה על הטיפול הבא | 50 percent discount on the next treatment | Promo notification title |
| טיפול חינם | Free treatment | Promo notification title |
| קיבלת מאיתנו 50% הנחה לטיפול הבא במימוש של 50 נקודות | You received from us 50% discount for the next treatment by redeeming 50 points | Promo desc |
| קיבלת מאיתנו טיפול חינם במימוש של 1,000 נקודות | You received from us a free treatment by redeeming 1,000 points | Promo desc |
| קיבלת מאיתנו 50% הנחה | You received from us a 50% discount | Modal hero text |
| טיפול חינם מחכה לך. | A free treatment is waiting for you. | Modal hero text |
| הרווחת 50% הנחה על הטיפול הבא שלך. | You earned 50% discount on your next treatment. | Modal title |
| הרווחת טיפול חינם! | You earned a free treatment! | Modal title |
| מימוש ההטבה יתבצע באמצעות 500 נקודות שצברת. | The benefit will be redeemed using 500 points you accumulated. | Modal desc |
| מימוש הטבה | Redeem benefit | CTA button |
| ההטבה נוספה בהצלחה | The benefit was added successfully | Success title |
| הנחת 50% נוספה לחשבון שלך ותופעל אוטומטית בתשלום בעת הזמנת הטיפול הבא. | 50% discount was added to your account and will be activated automatically at payment when booking your next treatment. | Success desc |
| אין צורך לבצע פעולה נוספת, פשוט להזמין וליהנות מההנחה. | No need for further action, just book and enjoy the discount. | Success desc |
| הרווחת טיפול חינם, והוא נוסף לחשבון שלך. | You earned a free treatment, and it was added to your account. | Success desc |

### 26.9 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Alerts slide-over panel (526px) | Yes |
| Dark header with bell icon + close button | Yes |
| Two notification types (message + promotion) | Yes |
| Practitioner avatar for message notifications | Yes |
| Green flash icon for promotion notifications | Yes |
| Underlined action links per notification | Yes |
| Timestamp on each notification | Yes |
| Reward redemption modal with confetti hero | Yes |
| Points-based redemption (50 / 1,000 points) | Yes |
| Success confirmation with checkmark illustration | Yes |
| Auto-apply benefit at next booking checkout | Yes (described in confirmation text) |

---

## 27. Admin Panel — Practitioners Management (from Figma)

> **Figma Source:** 3 screens covering the all-practitioners list with filters and actions, individual practitioner profile view (admin side), and the practitioner approval/rejection modal.

### 27.0 Shared Admin Header

**Structure:** Same global header as public pages, 80px height, white bg, 1440px width centered.

**Admin Nav Items (right-to-left):**
- דשבורד (Dashboard) — Light
- טיפולים (Treatments) — Light or Demi-bold when active
- מטפלים (Practitioners) — Demi-bold when active
- מטופלים (Patients) — Light
- קטגוריות (Categories) — Light
- חבילות טיפול (Treatment Packages) — Light
- מאמרים (Articles) — Light

**Left side:** Same user controls — message icons (×2), notification bell, user avatar + name + dropdown chevron.

**Logo:** "Heali" top-left, PloniMLv2AAA-Bold 42px, tracking 1.68px, "Website concept" subtitle.

### 27.1 Screen 1 — All Practitioners List

**Figma Node:** `1:24022`

**Page Background:** `#fafafa`

**Page Title:**
- "כל המטפלים" — 30px, Medium, black, right-aligned
- Subtitle: "נמצאו 1,000 מטפלים במערכת" — 16px, Regular, `#9f9f9f`, right-aligned

**Filter Bar (3 controls, horizontal row):**
1. **Free text search** (right): w-520px, h-50px, white bg, border `#CDDBDB`, rounded-[10px], placeholder "חיפוש חופשי..." (Poppins 14px, `#666`), search icon on right side
2. **Category dropdown** (center): w-348px, h-50px, same border style, text "הצג לפי: כל הקטגוריות" (Poppins 14px, `#666`), chevron-down icon on left
3. **Status dropdown** (left): w-348px, h-50px, same border style, text "הצג לפי: כל הסטטוסים" (Poppins 14px, `#666`), chevron-down icon on left

**Data Table:**
- Container: white bg, rounded-[10px], shadow `0px 1px 2px rgba(0,0,0,0.05)`, w-1340px, h-775px
- **Header row columns (right-to-left):** שם המטפל (Practitioner Name) | תחום טיפול (Treatment Area) | תחום התמחות (Specialization) | תאריך הצטרפות (Join Date) | כמות טיפולים (Treatment Count) | סטטוס (Status)
- Header font: Discovery Fs Light, 16px, black, tracking -0.32px
- Separator line below header

**Table Row:**
- Height: ~54px, alternating bg: white / `#fafafa`
- Each row contains (right-to-left):
  - Practitioner avatar (18px circle, rounded-[21px]) + name (Discovery Fs Light 16px)
  - Treatment area text (e.g. "דיקור סיני")
  - Specialization text (e.g. "כאבי ראש")
  - Join date (e.g. "08/12/25")
  - Treatment count (e.g. "300")
  - **Status badge:** rounded-[4px], px-[8px], 14px Regular, centered
  - **Actions button** (leftmost): 34×34px circle, white bg, border `#CDDBDB`, rounded-[50px], 3-dots icon inside

**Status Badge Variants:**

| Status | Hebrew | Background | Text Color |
|---|---|---|---|
| Approved | אושר | `#DCFCE7` | `#16A34A` |
| Pending | ממתין | `#FFEDDE` | `#FF8D28` |
| Rejected | נדחה | `#FFE1E1` | `#FF383C` |
| Not Approved | לא אושר | `#FFE3E3` | `#E70202` |

**Context Menu — Pending Practitioner (3 items):**
- Container: white bg, w-241px, h-126px, rounded-[12px], shadow `0px 21px 42.2px -14px rgba(0,0,0,0.25)`, px-[16px], py-[20px]
- Items: Discovery Fs Light 16px, black, right-aligned, tracking -0.32px
  1. "אישור מטפל" (Approve Practitioner)
  2. "דחיית מטפל" (Reject Practitioner)
  3. "צפייה בפרטי מטפל" (View Practitioner Details)
- Divider between items: 1px line

**Context Menu — Approved Practitioner (2 items):**
- Container: white bg, w-241px, h-86px, same shadow/radius
- Items:
  1. "מחיקת מטפל" (Delete Practitioner)
  2. "צפייה בפרופיל מטפל" (View Practitioner Profile)

### 27.2 Screen 2 — Practitioner Profile (Admin View)

**Figma Node:** `1:26639`

**Page Background:** `#fafafa`

**Back Navigation (top-right):**
- Arrow-in-circle icon (46px, rotated 180°) + "חזור" (24px, Light, black)

**Practitioner Header (right section, top):**
- **Profile photo:** 181×181px, rounded-[22.8px], border `#E5E5E5` 2.28px
- **Name:** "ליאת גולדנברג" — 26px, Medium, black
- **Rating badge:** purple bg `#E9DEFF`, rounded-[100px], h-27px, w-118px
  - Icon (22px) + "מדורגת גבוהה" — 14px, Regular, `#AD80FF`
- **Star rating:** star icon + "4.8/5" (Regular 16px) + "(דרוג 500)" (Light 16px)
- **Info row (icons + text, 14px Light, `#575757`):**
  - Globe icon: "יפו - תל אביב" (location)
  - Message icon: "שפות: עברית, אנגלית, רוסית, ספרדית" (languages)
  - Wallet icon: "מחיר לטיפול : 150₪" (price per treatment)
  - Each icon: 20px, `#F6F6F6` bg, border `#9F9F9F` 0.6px, rounded-[45px], p-[3px]
- **Treatment type tags:** Pill badges, h-24px, rounded-[100px], border `#D7D7D7` 1px, px-[10px], gradient bg (subtle gray-to-white)
  - "דיקור סיני", "מדיטציה טיפולית" — 12px, Light, black

**About Me Section:**
- Title: "קצת עלי" — 26px, Medium, black, right-aligned
- Body: Lorem ipsum Hebrew text — 16px, Light, `#9F9F9F`, leading-[22px], w-664px

**Certification Section:**
- Title: "הסמכה" — 26px, Medium, black, right-aligned
- Body: Hebrew text about Chinese medicine studies — 16px, Light, `#9F9F9F`, leading-[22px], w-664px

**Articles Section:**
- Title: "מאמרים" — 30px, Demi-bold, black, right-aligned
- **Article cards row (3 cards, horizontal):**
  - Card width: 246px
  - **Image area:** 246×184px, rounded top corners (16.75px), masked image
  - **Tag bar** (overlaid on image bottom): date pill ("09/10/2025") + category pill ("דיקור סיני"), same gradient style as treatment tags
  - **Content area:** white bg, rounded-bl-[20px] rounded-br-[20px], border white, h-128px, px-[10px], pt-[16px], pb-[11px]
    - Article title: "שם המאמר לורם איפסום" — 16px, Medium, black
    - Description: truncated Lorem ipsum — 14px, Light, `#9F9F9F`, leading-[18px]
    - Author row: avatar (31px) + "פורסם ע"י מאי בוזו" — 14px, Light, black
    - Navigation arrow icon: 28px, bottom-left of card

**Reviews Section:**
- Title bar: "תגובות (473)" — 20px, Demi-bold, black, right-aligned + "צפייה בכל התגובות" — 16px, Light, black, left-aligned
- Container: white bg, w-845px, h-430px
- **Review cards (2×2 grid):**
  - Card: white bg, border `#F4F4F4`, rounded-[8px], p-[16px], w-399px
  - Header row: avatar circle (42px, `#F4F5F7` bg, letter initial, Poppins 16px) + name ("מאי בוזו" 16px Regular) + time ("שלושה שבועות" 14px Regular `#9F9F9F`) + star rating (5 stars)
  - Body: review text — 14px, Light, black, leading-[24px], h-72px

**Left Sidebar (Sticky):**
- **Edit button:** "עריכת פרטי מטפל" — full-width (479px), green bg `#7DE4A8`, rounded-[8px], py-[12px], font: Poppins Bold 16px / Arimo Bold, text `#08190C`
- **Bank Details Card:** white bg, border `#E5E5E5`, rounded-[8px], w-479px, h-292px, px-[24px]
  - Title: "פרטי חשבון בנק" — 26px, Medium, black
  - Fields (standard input style — white bg, border `#CDDBDB`, rounded-[10px], h-48px):
    - "שם הבנק" (Bank name): full width, value "דיסקונט"
    - Row of 3 fields:
      - "מספר חשבון בנק" (Account number): w-191px, value "11047378738"
      - "מספר סניף" (Branch number): w-99px, value "065"
      - "מספר בנק" (Bank number): w-99px, value "11"
  - Field labels: 16px, Regular, black
  - Field values: 14px, Regular, `#666`, tracking -0.28px

### 27.3 Screen 3 — Practitioner Approval Modal

**Figma Node:** `1:24547`

**Container:** white bg, rounded-[16px], px-[21px], py-[34px], w-[full], centered
**Close button:** X icon, 33px, top-left corner

**Practitioner Info (same layout as profile header):**
- Profile photo: 181×181px, rounded-[22.8px], border `#E5E5E5` 2.28px
- Name: "ליאת גולדנברג" — 26px, Medium, black
- Purple rating badge: "מדורגת גבוהה" (same style as profile)
- Star rating: "4.8/5 (דרוג 500)"
- Info row: location, languages, price (same icon/text style)
- Treatment tags: "דיקור סיני", "מדיטציה טיפולית"

**About Me Section:**
- Title: "קצת עלי" — 26px, Medium, black
- Body text: 16px, Light, `#9F9F9F`, leading-[22px], w-664px

**Certification Section:**
- Title: "הסמכה" — 26px, Medium, black
- Body text: 16px, Light, `#9F9F9F`, leading-[22px], w-664px

**Certification Document Section:**
- Title: "תעודת הסמכה" — 30px, Regular, black, tracking -0.6px
- Document row: white bg, border `#CDDBDB`, rounded-[10px], h-52px, full width
  - Right side: link icon (24px) + document name ("שם המסמך" 14px Regular `#21544E`) + file size ("142 kb" 14px Poppins `#666`)
  - Left side: delete/trash icon

**Action Buttons (bottom center):**
- **Approve:** green circle (51px), bg `#DCFCE7`, rounded-[36.2px], checkmark icon (28px), inset white border 2.455px
- **Reject:** red circle (51px), bg `#FFE3E3`, rounded-[36.2px], X icon (28px), inset white border 2.455px
- Gap between buttons: 26px

### 27.4 Practitioner Management Flow

```
Admin Nav → "מטפלים" (active)
  └── All Practitioners List (Screen 1)
        ├── Filter: free text search
        ├── Filter: category dropdown
        ├── Filter: status dropdown
        └── Per-row "..." actions menu:
              ├── Pending practitioner:
              │     ├── "אישור מטפל" → Approve
              │     ├── "דחיית מטפל" → Reject
              │     └── "צפייה בפרטי מטפל" → Approval Modal (Screen 3)
              └── Approved practitioner:
                    ├── "מחיקת מטפל" → Delete
                    └── "צפייה בפרופיל מטפל" → Profile View (Screen 2)
```

### 27.5 Hebrew / English Text Reference

| Hebrew | English | Context |
|---|---|---|
| כל המטפלים | All Practitioners | Page title |
| נמצאו 1,000 מטפלים במערכת | 1,000 practitioners found in system | Subtitle |
| חיפוש חופשי... | Free search... | Search placeholder |
| הצג לפי: כל הקטגוריות | Show by: All categories | Category filter |
| הצג לפי: כל הסטטוסים | Show by: All statuses | Status filter |
| שם המטפל | Practitioner name | Table header |
| תחום טיפול | Treatment area | Table header |
| תחום התמחות | Specialization area | Table header |
| תאריך הצטרפות | Join date | Table header |
| כמות טיפולים | Treatment count | Table header |
| סטטוס | Status | Table header |
| אושר | Approved | Status badge |
| ממתין | Pending | Status badge |
| נדחה | Rejected | Status badge |
| לא אושר | Not approved | Status badge |
| אישור מטפל | Approve practitioner | Context menu |
| דחיית מטפל | Reject practitioner | Context menu |
| צפייה בפרטי מטפל | View practitioner details | Context menu |
| מחיקת מטפל | Delete practitioner | Context menu |
| צפייה בפרופיל מטפל | View practitioner profile | Context menu |
| חזור | Back | Navigation |
| עריכת פרטי מטפל | Edit practitioner details | Button |
| פרטי חשבון בנק | Bank account details | Section title |
| שם הבנק | Bank name | Field label |
| מספר חשבון בנק | Bank account number | Field label |
| מספר סניף | Branch number | Field label |
| מספר בנק | Bank number | Field label |
| קצת עלי | About me | Section title |
| הסמכה | Certification | Section title |
| מאמרים | Articles | Section title |
| תגובות | Reviews | Section title |
| צפייה בכל התגובות | View all reviews | Link |
| תעודת הסמכה | Certification document | Section title |
| שם המסמך | Document name | File label |
| מדורגת גבוהה | Highly rated | Badge |

### 27.6 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Full practitioners list with search and filters | Yes |
| Category and status dropdown filters | Yes |
| Alternating row backgrounds in table | Yes |
| 4 status badge variants (approved/pending/rejected/not approved) | Yes |
| Context menu per row with role-based actions | Yes |
| Practitioner profile view (admin) with all sections | Yes |
| Bank account details display | Yes |
| Articles grid on practitioner profile | Yes |
| Reviews grid (2×2) with star ratings | Yes |
| Practitioner approval modal with full profile review | Yes |
| Approve/Reject circular action buttons | Yes |
| Certification document with download/delete | Yes |
| Edit practitioner details button | Yes |

---

## 28. Admin Panel — Patient Management (from Figma)

> **Figma Source:** 3 screens covering the patient profile view (admin side), add points modal, and site credit (free treatments) modal.

### 28.1 Screen 1 — Patient Profile (Admin View)

**Figma Node:** `1:22975`

**Container:** white bg, full width

**Action Buttons (top-left, horizontal row):**
- **"הוספת נקודות" (Add Points):** w-210px, green bg `#7DE4A8`, rounded-[8px], py-[12px], Poppins/Arimo Bold 16px, text `#08190C`
- **"הוספת זיכוי באתר" (Add Site Credit):** w-210px, gray bg `#F4F7F7`, rounded-[8px], py-[12px], px-[24px], Poppins/Arimo Medium 16px, black text
- Gap: 14px

**Profile Photo:** 115×115px, rounded-[14.5px], border `#E5E5E5` 1.45px

**Patient Name:** "ליאת גולדנברג" — 26px, Medium, black, right-aligned

**Personal Details Row (horizontal, right-to-left):**

| Field | Hebrew Label | Example Value | Label Width |
|---|---|---|---|
| תאריך לידה (Date of Birth) | 16px Regular black | 08/10/1990 | 74px |
| עיר מגורים (City) | 16px Regular black | תל אביב יפו, ישראל | 101px |
| כתובת מייל (Email) | 16px Regular black | dcfck@gmail.com | 100px |
| מספר נייד (Mobile) | 16px Regular black | 0538684747 | 64px |
| מגדר (Gender) | 16px Regular black | נקבה | 33px |

- Label font: Discovery Fs Regular, 16px, black
- Value font: Discovery Fs Regular, 14px, `#666`, tracking -0.28px
- Gap between label and value: 12px vertical
- Gap between field groups: 36px horizontal

**Points Badge:**
- Container: teal bg `#21544E`, rounded-[8px], w-136px, h-36px, px-[10px]
- Sparkle icon (20px) + "150 נקודות" — 16px, Regular, white

**Treatment History Section:**
- Title: "היסטוריית טיפולים" — 26px, Medium, black, right-aligned

**Treatment History Table:**
- **Header columns (right-to-left):** מספר הזמנה (Order #) | קטגוריה (Category) | מטפל (Practitioner) | תאריך טיפול (Treatment Date) | סוג טיפול (Treatment Type) | סטטוס טיפול (Treatment Status)
- Header font: Discovery Fs Light, 16px, black, tracking -0.32px
- Separator line below header

**Table Row:**
- Alternating bg: white / `#fafafa`, h-~54px
- Row data (right-to-left):
  - Order number: "8954489" (Light 16px, tracking -0.32px)
  - Category: "דיקור סיני" (Light 16px)
  - Practitioner: avatar (18px circle) + "מאי בוזו" (Light 16px), gap-[6px]
  - Date: "08/12/25" (Light 16px, center-aligned)
  - Type: "טיפול בודד" (Light 16px)
  - Status badge: "עתידי" (Future) — bg `#DCFCE7`, text `#16A34A`, 14px Regular, rounded-[4px], w-55px, centered
  - Actions button: 34px circle, white bg, border `#CDDBDB`, rounded-[50px], 3-dots icon

### 28.2 Screen 2 — Add Points Modal

**Figma Node:** `1:23444`

**Overlay:** centered modal
**Container:** white bg, rounded-[16px], w-518px, h-299px, px-[21px], py-[34px]
**Close button:** X icon (33px), top-right area (positioned at left edge of overlay since RTL)

**Content (centered, w-398px):**
- **Title:** "הוספת נקודות" — 30px, Bold, black, center-aligned
- **Description:** "יש לבחור את מספר הנקודות להוספה לחשבון המשתמש." — 16px, Light, `#9F9F9F`, center-aligned, leading-[20px], w-268px
- Gap: 18px between title section and input

**Input Field:**
- Full width (398px), h-50px, white bg, border `#CDDBDB`, rounded-[10px], px-[8px] right / px-[12px] left, py-[8px]
- Placeholder: "הזן כאן את סכום הנקודות" — 14px, Regular, `#666`, right-aligned, tracking -0.28px

**Save Button:**
- Full width (398px), green bg `#7DE4A8`, rounded-[8px], py-[12px]
- Text: "שמירה" — Poppins/Arimo Bold 16px, text `#08190C`, center-aligned
- Gap: 30px between input and button

### 28.3 Screen 3 — Site Credit Modal (Free Treatment)

**Figma Node:** `1:23722`

**Overlay:** centered modal
**Container:** white bg, rounded-[16px], w-518px, h-299px, px-[21px], py-[34px]
**Close button:** X icon (33px), top-right area

**Content (centered, w-398px):**
- **Title:** "זיכוי באתר" — 30px, Bold, black, center-aligned
- **Description:** "יש לבחור את כמות הטיפולים מתנה שתרצה להעניק למשתמש" — 16px, Light, `#9F9F9F`, center-aligned, leading-[20px], w-268px
- Gap: 18px between title section and dropdown

**Dropdown Select:**
- Full width (398px), h-50px, white bg, border `#CDDBDB`, rounded-[10px], px-[8px] right / px-[12px] left, py-[8px]
- Selected value: "טיפול אחד מתנה" — 14px, Regular, black, right-aligned, tracking -0.28px
- Chevron-down icon (24px) on left side

**Save Button:**
- Full width (398px), green bg `#7DE4A8`, rounded-[8px], py-[12px]
- Text: "שמירה" — Poppins/Arimo Bold 16px, text `#08190C`, center-aligned
- Gap: 30px between dropdown and button

### 28.4 Patient Management Flow

```
Patient Profile (Screen 1)
  ├── "הוספת נקודות" button → Add Points Modal (Screen 2) → "שמירה" → Points updated
  ├── "הוספת זיכוי באתר" button → Site Credit Modal (Screen 3) → "שמירה" → Credit applied
  └── Treatment history table:
        └── Per-row "..." actions → [TBD — action menu not shown in Figma]
```

### 28.5 Modal Comparison

| Feature | Add Points (Screen 2) | Site Credit (Screen 3) |
|---|---|---|
| Title | הוספת נקודות | זיכוי באתר |
| Description | יש לבחור את מספר הנקודות להוספה לחשבון המשתמש. | יש לבחור את כמות הטיפולים מתנה שתרצה להעניק למשתמש |
| Input type | Text input (number) | Dropdown select |
| Placeholder/Default | הזן כאן את סכום הנקודות | טיפול אחד מתנה |
| CTA | שמירה | שמירה |
| Container size | 518×299px | 518×299px |

### 28.6 Hebrew / English Text Reference

| Hebrew | English | Context |
|---|---|---|
| הוספת נקודות | Add Points | Button + Modal title |
| הוספת זיכוי באתר | Add Site Credit | Button |
| זיכוי באתר | Site Credit | Modal title |
| נקודות | Points | Badge label |
| היסטוריית טיפולים | Treatment History | Section title |
| מספר הזמנה | Order Number | Table header |
| קטגוריה | Category | Table header |
| מטפל | Practitioner | Table header |
| תאריך טיפול | Treatment Date | Table header |
| סוג טיפול | Treatment Type | Table header |
| סטטוס טיפול | Treatment Status | Table header |
| עתידי | Future | Status badge |
| טיפול בודד | Single Treatment | Treatment type |
| תאריך לידה | Date of Birth | Field label |
| עיר מגורים | City of Residence | Field label |
| כתובת מייל | Email Address | Field label |
| מספר נייד | Mobile Number | Field label |
| מגדר | Gender | Field label |
| נקבה | Female | Gender value |
| יש לבחור את מספר הנקודות להוספה לחשבון המשתמש. | Please choose the number of points to add to the user's account. | Modal description |
| הזן כאן את סכום הנקודות | Enter the points amount here | Input placeholder |
| שמירה | Save | CTA button |
| יש לבחור את כמות הטיפולים מתנה שתרצה להעניק למשתמש | Please choose the number of gift treatments to grant the user | Modal description |
| טיפול אחד מתנה | One free treatment | Dropdown default |

### 28.7 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Patient profile with personal details display | Yes |
| Points balance badge (teal) | Yes |
| Add Points action button (green) | Yes |
| Add Site Credit action button (gray) | Yes |
| Treatment history table with alternating rows | Yes |
| Future treatment status badge (green) | Yes |
| 3-dots action menu per treatment row | Yes |
| Add Points modal with text input | Yes |
| Site Credit modal with dropdown select | Yes |
| Close (X) button on both modals | Yes |
| Save button on both modals (green) | Yes |

---

## 23. Screens Pending Figma Input

| Area | Status |
|---|---|
| All screen layouts & components | Pending |
| Color system, typography, design tokens | Pending |
| Navigation & responsive behavior | Pending |
| Form designs & validation states | Pending |
| Empty states & loading states | Pending |
| Error pages | Pending |
| Mobile vs desktop differences | Pending |

---

*This document will be completed screen-by-screen after Figma wireframe review.*


---

## 29. Admin Panel — Edit Practitioner Details (from Figma)

> **Figma Source:** 1 screen — the full editable form for modifying a practitioner's profile, accessible via the "עריכת פרטי מטפל" button on the profile page. Includes articles management with context menu.

**Figma Node:** `1:27161`

**Page Background:** `#fafafa`

**Page Title:** "עריכת פרטי מטפל" — 26px, Medium, black, right-aligned

**Back Navigation:** Arrow (rotated 180deg) + "חזור" (24px, Light)

**Form Container:** white bg, rounded-[10px], w-1337px, h-1341px, centered

### 29.1 Right Column — Personal Details (w-499px)

Standard field style: white bg, border `#CDDBDB`, rounded-[10px], h-48px (text inputs) or h-50px (dropdowns). Label: Regular 16px black. Value: Regular 14px `#666`, tracking -0.28px.

| Field | Hebrew Label | Example Value | Type |
|---|---|---|---|
| שם מלא | Full Name | לורם איפסום | Text input |
| תאריך לידה | Date of Birth | 01/01/1990 | Text input |
| כתובת מייל | Email | fdkjdmkskmdls@gmail.com | Text input |
| עיר מגורים | City | תל אביב, ישראל | Text input |
| מספר נייד | Mobile | 05260606066 | Text input |
| מגדר | Gender | בחירה | Dropdown (chevron-down) |
| שפות | Languages | עברית x | Multi-select with removable tags |

**Language tag style:** gradient bg (gray to white), rounded-[5px], h-23px, px-[8px], 14px Regular black, X icon to remove.

### 29.2 Left Column — Professional Details (w-499px)

| Field | Hebrew Label | Example Value | Type |
|---|---|---|---|
| אודות | About Me | Lorem ipsum text | Textarea h-157px |
| תיאור הסמכה | Certification Description | Lorem ipsum text | Textarea h-157px |
| תחום טיפול | Treatment Area | דיקור סיני | Dropdown |
| תחום התמחות | Specialization | כאבי ראש | Dropdown |
| מודל | Pricing Model | לפי שעה | Dropdown, w-147px |
| מחיר לטיפול | Price per Treatment | 1,000 ILS | Text input, w-331px |

**Certification Document (below professional fields):**
- Section title: "תעודת הסמכה" — 30px, Regular, black, leading-[50px], tracking -0.6px
- Document row: white bg, border `#CDDBDB`, rounded-[10px], h-52px, full width
  - Right: link icon (24px) + "שם המסמך" (14px Regular `#21544E`) + "142 kb" (Poppins 14px `#666`)
  - Left: trash/delete icon

### 29.3 Articles Section (below both columns)

- Same 3-card horizontal grid as on the profile view
- Each article card has a 3-dots button
- **Article context menu:** w-241px, h-93px, shadow `0px 21px 42.2px -14px rgba(0,0,0,0.25)`, rounded-[12px]
  1. "עריכת מאמר" — 16px, Light, black
  2. "מחיקת מאמר" — 16px, Light, `#E70202` (red)
- Divider between items

### 29.4 Edit Form Flow

```
Practitioner Profile (Admin)
  └── "עריכת פרטי מטפל" (green, sticky sidebar)
        └── Edit Practitioner Details page
              ├── Personal details (right column)
              ├── Professional details + certification (left column)
              └── Articles with edit/delete per card
```

### 29.5 Hebrew / English Text Reference

| Hebrew | English | Context |
|---|---|---|
| עריכת פרטי מטפל | Edit Practitioner Details | Page title + button |
| שם מלא | Full Name | Field label |
| בחירה | Select | Dropdown placeholder |
| שפות | Languages | Field label |
| אודות | About Me | Textarea label |
| תיאור הסמכה | Certification Description | Textarea label |
| תחום טיפול | Treatment Area | Dropdown label |
| תחום התמחות | Specialization Area | Dropdown label |
| מודל | Pricing Model | Dropdown label |
| לפי שעה | Per hour | Pricing option |
| מחיר לטיפול | Price per treatment | Field label |
| תעודת הסמכה | Certification Document | Section title |
| שם המסמך | Document name | File label |
| עריכת מאמר | Edit article | Context menu |
| מחיקת מאמר | Delete article | Context menu (red) |

### 29.6 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Editable personal details (name, DOB, email, city, mobile) | Yes |
| Gender dropdown | Yes |
| Multi-select languages with removable tags | Yes |
| About Me textarea | Yes |
| Certification Description textarea | Yes |
| Treatment area and specialization dropdowns | Yes |
| Pricing model dropdown + price field | Yes |
| Certification document with link + delete | Yes |
| Articles section with per-card 3-dots menu | Yes |
| Edit article action | Yes |
| Delete article action (red text) | Yes |

---

## 30. Admin Panel — All Patients List (from Figma)

> **Figma Source:** 1 screen — patients management list with search, filters, Active/Blocked status badges, and context menus.

**Figma Node:** `1:24631`

**Page Background:** `#fafafa`

**Active Nav Item:** "מטופלים" — Demi-bold

**Page Title:**
- "מטופלים" — 30px, Medium, black, right-aligned, tracking -0.6px
- Subtitle: "נמצאו 1,000 מטפלים במערכת" — 16px, Regular, `#9F9F9F`

**Filter Bar:** Same 3-control layout as Practitioners list
1. Free text search (right, w-520px): "חיפוש חופשי..."
2. Category dropdown (center, w-348px): "הצג לפי: כל הקטגוריות"
3. Status dropdown (left, w-348px): "הצג לפי: כל הסטטוסים"

**Table Container:** white bg, rounded-[10px], shadow `0px 1px 2px rgba(0,0,0,0.05)`, w-1340px, h-775px

**Table Header Columns (right-to-left):** שם מטופל | מגדר | מספר נייד | תאריך הצטרפות | כמות טיפולים | סטטוס

**Table Row:** Alternating white / `#fafafa`. Columns: avatar (18px) + name | gender | mobile | date (center) | count | status badge | 3-dots button.

**Status Badge Variants (patients):**

| Status | Hebrew | Background | Text Color |
|---|---|---|---|
| Active | פעיל | `#DCFCE7` | `#16A34A` |
| Blocked | חסום | `#FFE1E1` | `#FF383C` |

**Context Menu — Active Patient (2 items):**
- w-241px, h-94px, shadow `0px 21px 42.2px -14px rgba(0,0,0,0.25)`, rounded-[12px]
  1. "חסום מטופל" (Block Patient)
  2. "צפייה בפרופיל מטופל" (View Patient Profile)

**Context Menu — Blocked Patient (1 item):**
- w-241px, h-50px, same shadow
  1. "בטל חסימה" (Unblock)

### 30.1 Patient List Flow

```
Admin Nav → "מטופלים"
  └── All Patients List
        └── Per-row "..." menu:
              ├── Active: Block / View Profile
              └── Blocked: Unblock
```

### 30.2 Patients vs. Practitioners List Comparison

| Feature | Patients | Practitioners |
|---|---|---|
| Unique columns | Gender, Mobile | Treatment Area, Specialization |
| Status variants | פעיל / חסום | אושר / ממתין / נדחה / לא אושר |
| Active menu | Block + View Profile | Delete + View Profile |
| Pending menu | N/A | Approve + Reject + View Details |
| Blocked menu | Unblock (1 item) | N/A |

### 30.3 Hebrew / English Text Reference

| Hebrew | English | Context |
|---|---|---|
| מטופלים | Patients | Page title + nav |
| שם מטופל | Patient name | Table header |
| מגדר | Gender | Table header |
| מספר נייד | Mobile | Table header |
| פעיל | Active | Status badge |
| חסום | Blocked | Status badge |
| חסום מטופל | Block patient | Context menu |
| צפייה בפרופיל מטופל | View patient profile | Context menu |
| בטל חסימה | Unblock | Context menu |
| נקבה | Female | Gender value |
| זכר | Male | Gender value |

### 30.4 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Patients list with search + 2 filters | Yes |
| Active (green) and Blocked (red) status badges | Yes |
| Alternating row backgrounds | Yes |
| Gender column | Yes |
| Mobile number column | Yes |
| Block patient action | Yes |
| Unblock patient action (blocked rows only) | Yes |
| View patient profile action | Yes |

---

## 31. Admin Panel — Notifications Panel (from Figma)

> **Figma Source:** 1 screen — admin internal notifications panel showing pending approval items requiring action.

**Figma Node:** `1:20680`

**Container:** white bg, w-713px content area
**Close Button:** X icon (33px), top-left, 16x16px inset

**Panel Header:**
- Outline bell icon (24px) + "התראות" — 34px, Bold, black, tracking -0.68px, right-aligned

**Notification Row (right-to-left):**
1. Practitioner avatar — 51x51px photo, card-shaped mask (99.7x81.6px)
2. Text block (w-263px, right-aligned):
   - Title: 18px, Demi-bold, `#414042`, leading-[25.477px]
   - Description: 16px, Regular, `#666`, tracking -0.32px
3. CTA button (left): `#7DE4A8`, rounded-[8px], p-[10px], w-136px, 16px Regular, black text

**Separator:** 1px horizontal divider between each row

**Notification Types:**

| Type | Title | Description | CTA Label |
|---|---|---|---|
| Add Specialty | אישור הוספת תחום | מאי בוזו רוצה להוסיף תחום הסמכנה חדש | צפייה בפרטים |
| New Practitioner | אישור מטפל | מאי בוזו רוצה נרשמה למערכת | צפייה בפרופיל |

### 31.1 Admin Notifications Flow

```
Admin header → bell icon
  └── Notifications Panel
        ├── "אישור הוספת תחום" → "צפייה בפרטים" → [Detail TBD]
        └── "אישור מטפל" → "צפייה בפרופיל" → Practitioner Approval Modal (27.3)
```

### 31.2 Hebrew / English Text Reference

| Hebrew | English | Context |
|---|---|---|
| התראות | Alerts / Notifications | Panel title |
| אישור הוספת תחום | Approve adding a specialty area | Notification title |
| מאי בוזו רוצה להוסיף תחום הסמכנה חדש | Mai Buzo wants to add a new certification area | Description |
| צפייה בפרטים | View details | CTA for specialty type |
| אישור מטפל | Approve Practitioner | Notification title |
| מאי בוזו רוצה נרשמה למערכת | Mai Buzo wants to register to the system | Description |
| צפייה בפרופיל | View profile | CTA for practitioner type |

### 31.3 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Admin notifications panel with X close button | Yes |
| Bell icon + "התראות" header | Yes |
| Scrollable notification list | Yes |
| Two notification types | Yes |
| Practitioner avatar per row | Yes |
| Green CTA button per row | Yes |
| Horizontal dividers between rows | Yes |
| Different CTA labels per notification type | Yes |

---

## 32. Confirmed Screen References

Nodes reviewed and confirmed as matching previously documented sections — no new UI components:

| Figma Node | Documented Section | Description |
|---|---|---|
| `1:26900` | 27.2 | Practitioner Profile (Admin View) — same layout, shows sticky sidebar annotation |
| `1:26148` | 28.1 | Patient Profile component — same header + treatment history table |


---

## 33. Admin — Approve Add Specialty Modal

**Figma Node:** `1:21187`
**Screen type:** Modal overlay (admin action)
**Hebrew title:** אישור הוספת תחום

---

### 33.1 Layout

| Property | Value |
|---|---|
| Modal width | 571px |
| Modal height | ~706px |
| Border radius | 16px |
| Background | `#FFFFFF` |
| Overlay | Semi-transparent dark backdrop |
| Alignment | Centered on screen |

**Modal structure (top → bottom):**

1. **Header row** — back arrow (right) + title "אישור הוספת תחום" (center)
2. **Practitioner row** — circular avatar (48px) + practitioner name (right-aligned, RTL)
3. **Form fields** (stacked, RTL labels):
   - תחום טיפול — full-width dropdown, value "דיקור סיני"
   - תחום התמחות — full-width dropdown, value "כאבי ראש"
   - מודל + מחיר לטיפול — side-by-side row:
     - מודל dropdown: w-147px, value "לפי שעה"
     - מחיר לטיפול input: w-331px, value "₪1,000"
4. **Certification document row** — document icon + file name/link
5. **Action buttons row** — two equal-width buttons side by side

---

### 33.2 Components

#### Header
| Element | Spec |
|---|---|
| Back arrow icon | Right side, navigates to previous screen |
| Title text | "אישור הוספת תחום" — Discovery Fs Demi-bold 20px `#000000` |
| Alignment | Title centered, arrow right |

#### Practitioner Row
| Element | Spec |
|---|---|
| Avatar | Circular, 48px, practitioner photo |
| Name | Discovery Fs Regular 16px `#000000`, RTL |

#### Form Fields
| Field | Type | Width | Value shown |
|---|---|---|---|
| תחום טיפול | Dropdown select | Full width | דיקור סיני |
| תחום התמחות | Dropdown select | Full width | כאבי ראש |
| מודל | Dropdown select | 147px | לפי שעה |
| מחיר לטיפול | Text input | 331px | ₪1,000 |

All fields: h-50px, border `#CDDBDB`, border-radius 10px, RTL label above.

#### Certification Document Row
| Element | Spec |
|---|---|
| Document icon | Left side of row |
| File reference | Clickable filename or link |
| Purpose | Admin reviews uploaded certification |

#### Action Buttons
| Button | Label | Width | Background | Text color | Font |
|---|---|---|---|---|---|
| Approve | אישור | 241px | `#7DE4A8` | `#08190C` | Poppins Bold 16px |
| Reject | דחייה | 241px | `#F4F7F7` | `#000000` | Discovery Fs Regular 16px |

Buttons are equal width, side by side, gap ~12px, h-50px, border-radius 8px.

---

### 33.3 Colors & Typography

| Token | Value | Usage |
|---|---|---|
| Modal background | `#FFFFFF` | Modal card |
| Approve button bg | `#7DE4A8` | Primary action |
| Reject button bg | `#F4F7F7` | Secondary / cancel action |
| Input border | `#CDDBDB` | All form fields |
| Title text | `#000000` | Modal header |
| Approve text | `#08190C` | Approve button label |

| Element | Font | Weight | Size |
|---|---|---|---|
| Modal title | Discovery Fs | Demi-bold | 20px |
| Field labels | Discovery Fs | Regular | 16px |
| Input values | Discovery Fs | Regular | 14–16px |
| Approve button | Poppins | Bold | 16px |
| Reject button | Discovery Fs | Regular | 16px |

---

### 33.4 Flow

```
Admin clicks "approve specialty" action on practitioner
        ↓
Modal opens: "אישור הוספת תחום"
        ↓
Admin reviews: Treatment area + Specialization + Pricing model + Price
        ↓
Admin reviews uploaded certification document
        ↓
    [אישור]              [דחייה]
       ↓                    ↓
Specialty approved     Specialty rejected
Modal closes           Modal closes
List updates           List updates
```

---

### 33.5 Hebrew / English Reference

| Hebrew | English | Context |
|---|---|---|
| אישור הוספת תחום | Approve Add Specialty | Modal title |
| תחום טיפול | Treatment Area | Dropdown label |
| דיקור סיני | Acupuncture | Sample treatment area value |
| תחום התמחות | Specialization | Dropdown label |
| כאבי ראש | Headaches | Sample specialization value |
| מודל | Pricing Model | Dropdown label |
| לפי שעה | Per Hour | Sample pricing model value |
| מחיר לטיפול | Price per Treatment | Input label |
| אישור | Approve | Primary action button |
| דחייה | Reject | Secondary action button |
| מסמך הסמכה | Certification Document | Document row label |

---

### 33.6 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Modal overlay on admin page | Yes |
| Back arrow navigation | Yes |
| Practitioner avatar + name in modal | Yes |
| 4 review fields (2 dropdowns + pricing model + price) | Yes |
| Side-by-side pricing model + price layout | Yes |
| Certification document row for admin review | Yes |
| Two equal-width action buttons | Yes |
| Green approve / gray reject button style | Yes |

---

## 34. Admin — Categories Management

**Figma Nodes:** `1:24889` (Categories List), `1:25865` (New Category Modal)
**Screen type:** Full admin page + modal
**Hebrew title:** קטגוריות

---

### 34.1 Categories List Page (Node 1:24889)

#### Layout

| Property | Value |
|---|---|
| Page width | 1440px full-width |
| Header | 80px white admin header (standard nav) |
| Active nav item | קטגוריות — Discovery Fs Demi-bold |
| Background | `#FAFAFA` |

**Page structure (top → bottom):**

1. Standard 80px admin header + navigation
2. Page title block — "קטגוריות" + subtitle
3. Filter/action bar — "הוספת קטגוריה +" button (left) + search (right)
4. Data table — categories list with context menus

#### Page Title Block
| Element | Spec |
|---|---|
| Title | "קטגוריות" — Discovery Fs Bold ~28px `#000000` |
| Subtitle | "נמצאו 1,000 קטגוריות במערכת" — Regular 16px `#666666` |

#### Filter Bar
| Element | Width | Height | Style |
|---|---|---|---|
| "הוספת קטגוריה +" button | 254px | 50px | bg `#7DE4A8`, border-radius 8px, Poppins Bold 16px `#08190C` |
| Free text search field | 978px | 50px | border `#CDDBDB`, border-radius 10px, placeholder RTL |

Filter bar is a flex row: button on left, search on right (RTL layout).

#### Data Table
| Column | Hebrew | Type | Notes |
|---|---|---|---|
| 1 | שם קטגוריה | Text | Category name |
| 2 | תחומי דעת | Underlined number | Clickable count → related specialties |
| 3 | נקודות | Number | Point value assigned to category |
| 4 | תאריך יצירה | Date | Creation date |
| 5 | (actions) | 3-dots menu | Per-row context menu |

Table rows: alternating white / `#FAFAFA`, 56px row height, right-aligned RTL text.

#### Context Menu (per row)
| Option | Color | Action |
|---|---|---|
| עריכת קטגוריה | `#000000` | Open edit category modal |
| מחיקת קטגוריה | `#E70202` | Delete category (destructive) |

Context menu: white card, border-radius 8px, h-94px, shadow.

---

### 34.2 New Category Modal (Node 1:25865)

#### Layout

| Property | Value |
|---|---|
| Modal content width | 479px |
| Border radius | 16px |
| Background | `#FFFFFF` |
| Overlay | Semi-transparent dark backdrop |
| Alignment | Centered on screen |

**Modal structure (top → bottom):**

1. **Close button (X)** — top-left, 33px
2. **Title** — "קטגוריה חדשה" — centered
3. **3 input fields** (stacked, each with label above)
4. **"הוספת שדה נוסף +"** — underlined link below last field
5. **Submit button** — "יצירת קטגוריה"

#### Close Button
| Element | Spec |
|---|---|
| Position | Top-left of modal |
| Size | 33px × 33px |
| Style | X icon, no background |

#### Modal Title
| Element | Spec |
|---|---|
| Text | "קטגוריה חדשה" |
| Font | Discovery Fs Bold 30px |
| Color | `#000000` |
| Alignment | Centered |

#### Form Fields (×3)
| Field | Label | Placeholder |
|---|---|---|
| 1 | שם הקטגוריה | הקלד/י כאן.. |
| 2 | סכום נקודות | הקלד/י כאן.. |
| 3 | תחום דעת | הקלד/י כאן.. |

All field specs:
- Label: Discovery Fs Regular 16px `#000000`
- Input: h-50px, border `#CDDBDB`, border-radius 10px, full modal width
- Placeholder: Discovery Fs Regular 14px, color `rgba(102, 102, 102, 0.44)`

#### "הוספת שדה נוסף +" Link
| Element | Spec |
|---|---|
| Text | הוספת שדה נוסף + |
| Style | Underlined, clickable |
| Function | Dynamically adds another input field |

#### Submit Button
| Property | Value |
|---|---|
| Label | יצירת קטגוריה |
| Width | 468px |
| Height | 50px |
| Background | `#7DE4A8` |
| Border radius | 8px |
| Font | Poppins Bold 16px |
| Text color | `#08190C` |

---

### 34.3 Colors & Typography

| Token | Value | Usage |
|---|---|---|
| Page background | `#FAFAFA` | Admin page bg |
| Modal background | `#FFFFFF` | Modal card |
| Add/Submit button bg | `#7DE4A8` | Primary actions |
| Input border | `#CDDBDB` | All form inputs |
| Delete menu item | `#E70202` | Destructive action |
| Placeholder text | `rgba(102,102,102,0.44)` | Input placeholders |
| Subtitle text | `#666666` | Page subtitle |

| Element | Font | Weight | Size |
|---|---|---|---|
| Active nav | Discovery Fs | Demi-bold | 16px |
| Page title | Discovery Fs | Bold | ~28px |
| Page subtitle | Discovery Fs | Regular | 16px |
| Table text | Discovery Fs | Regular | 14–16px |
| Modal title | Discovery Fs | Bold | 30px |
| Field labels | Discovery Fs | Regular | 16px |
| Placeholder | Discovery Fs | Regular | 14px |
| Add/Submit buttons | Poppins | Bold | 16px |

---

### 34.4 Flow

```
Admin clicks "קטגוריות" in nav
        ↓
Categories list page loads
Shows: title + subtitle (count) + filter bar + table
        ↓
[הוספת קטגוריה +]        [3-dots per row]
        ↓                        ↓
New Category Modal         Context menu opens
"קטגוריה חדשה"                  ↓
        ↓              [עריכת קטגוריה] → Edit modal
Fill fields:           [מחיקת קטגוריה] → Delete confirm
- שם הקטגוריה
- סכום נקודות
- תחום דעת
[+ הוספת שדה נוסף] → adds field
        ↓
[יצירת קטגוריה]
        ↓
Modal closes, list refreshes
```

---

### 34.5 Hebrew / English Reference

| Hebrew | English | Context |
|---|---|---|
| קטגוריות | Categories | Nav item + page title |
| נמצאו 1,000 קטגוריות במערכת | 1,000 categories found in system | Page subtitle |
| הוספת קטגוריה + | Add Category + | Primary action button |
| שם קטגוריה | Category Name | Table column + field label |
| תחומי דעת | Specialties / Fields of Knowledge | Table column (clickable count) |
| נקודות | Points | Table column |
| תאריך יצירה | Creation Date | Table column |
| עריכת קטגוריה | Edit Category | Context menu option |
| מחיקת קטגוריה | Delete Category | Context menu option (destructive) |
| קטגוריה חדשה | New Category | Modal title |
| שם הקטגוריה | Category Name | Form field label |
| סכום נקודות | Points Amount | Form field label |
| תחום דעת | Field of Knowledge | Form field label |
| הוספת שדה נוסף + | Add Another Field + | Dynamic field link |
| יצירת קטגוריה | Create Category | Submit button |

---

### 34.6 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Full-width admin categories list page | Yes |
| Active nav highlight for "קטגוריות" | Yes |
| Page title + dynamic count subtitle | Yes |
| "הוספת קטגוריה +" green action button | Yes |
| Free-text search field (wide) | Yes |
| Table: 4 data columns + actions | Yes |
| "תחומי דעת" column as clickable underlined number | Yes |
| 3-dots context menu per row | Yes |
| Edit + Delete options in context menu | Yes |
| Delete option in red (#E70202) | Yes |
| New Category modal with X close | Yes |
| 3 standard form fields in modal | Yes |
| Dynamic "הוספת שדה נוסף +" link | Yes |
| Green "יצירת קטגוריה" submit button | Yes |


---

## 35. Admin — Treatment Packages Management

**Figma Nodes:** `1:21247` (Packages List), `1:26607` (Create Package Modal)
**Screen type:** Full admin page + modal
**Hebrew title:** חבילות טיפול

---

### 35.1 Treatment Packages List Page (Node 1:21247)

#### Layout

| Property | Value |
|---|---|
| Page width | 1440px full-width |
| Header | 80px white admin header (standard nav) |
| Active nav item | חבילות טיפול — Discovery Fs Demi-bold |
| Background | `#FAFAFA` |

**Page structure (top → bottom):**

1. Standard 80px admin header + navigation
2. Greeting block — personalized greeting + subtitle
3. 4 stat cards row
4. "הוספת חבילה חדשה+" action button
5. Package cards grid (4 columns)

#### Greeting Block
| Element | Spec |
|---|---|
| Greeting | "צהריים טובים [name]!" — Discovery Fs Medium 30px `#000000`, RTL |
| Subtitle | Lorem placeholder — Regular 16px `#9f9f9f`, RTL |

#### Stat Cards Row (×4)

Each card: w-310px, h-136px, white bg, border `rgba(205,219,219,0.6)`, border-radius 10px, shadow `0px 1px 2px rgba(0,0,0,0.05)`, padding 15px/19px.

| Card | Hebrew Label | Value | Icon bg | Icon |
|---|---|---|---|---|
| 1 | אזור הכי נמכר | תל אביב | `#fef9c3` (yellow) | location pin |
| 2 | הכי פחות נמכרת | חבילת ספורט | `#dbeafe` (blue) | bubble |
| 3 | הכי נמכרת | חבילת הריון | `#f3e8ff` (purple) | crown |
| 4 | סה"כ חבילות שנמכרו | 2,000 | `#dcfce7` (green) | flash/lightning |

Card internal layout: label (Light 16px) + value (Medium 30px) stacked right-aligned, icon square (56px, rounded-8px) on left.

#### Add Button
| Property | Value |
|---|---|
| Label | הוספת חבילה חדשה+ |
| Width | 254px |
| Background | `#7DE4A8` |
| Border radius | 8px |
| Font | Poppins Bold 16px `#08190C` |

#### Package Cards Grid (4 columns, h-329px each)

Each card: w-295px, h-329px, rounded-16px, overflow hidden, gradient background, decorative grid pattern (opacity 16%). Contains:

| Element | Spec |
|---|---|
| Decorative grid | Semi-transparent squares pattern, opacity 16%, top + bottom edge |
| Center icon | 110px circle, glassmorphism (backdrop-blur), 3.4px white border, shadow, category icon inside (74px) |
| Card title | Discovery Fs Bold 20px white, bottom area |
| Card description | Discovery Fs Light 14px white, 2 lines, truncated |
| Arrow button (bottom-left) | White circle 38px, border `#eaebeb`, navigation arrow |
| 3-dots menu (top-left) | White card 40px, rounded-10px, border `#eaebeb` |

Card gradient colors:

| Card # | Gradient (from → to) | Theme |
|---|---|---|
| 1 | `#ffd28b` → `#ffc15e` | Orange/yellow — Sport |
| 2 | `#7de4a8` → `#4bb377` | Green — Wellness |
| 3 | `#ffd2c1` → `#ffa480` | Salmon/peach — Maternity |
| 4 | `#7ac1b9` → `#3d9b90` | Teal — Medical |

#### Context Menu (per card, 3-dots)
| Option | Color | Action |
|---|---|---|
| עריכת חבילה | `#000000` | Open edit package modal |
| מחיקת חבילה | `#000000` | Delete package |

Menu: white card, rounded-12px, h-98px, w-241px, shadow `0px 21px 42.2px -14px rgba(0,0,0,0.25)`, horizontal divider between options.

---

### 35.2 Create Package Modal (Node 1:26607)

#### Layout

| Property | Value |
|---|---|
| Modal content width | 479px |
| Border radius | 16px |
| Background | `#FFFFFF` |
| Padding | 21px horizontal, 34px vertical |

**Modal structure (top → bottom):**

1. X close button — top-left, 33px
2. Title — "יצירת חבילה" — centered
3. 4 form fields + 1 upload row
4. Submit button

#### Modal Title
| Element | Spec |
|---|---|
| Text | יצירת חבילה |
| Font | Discovery Fs Bold 30px |
| Color | `#000000` |
| Alignment | Centered |

#### Form Fields

| # | Label | Type | Height | Notes |
|---|---|---|---|---|
| 1 | שם החבילה | Text input | 50px | Standard text |
| 2 | תיאור החבילה | Textarea | 155px | Multi-line description |
| 3 | כמות טיפולים בחבילה | Text input | 50px | Number of treatments |
| 4 | מחיר לטיפול | Text input | 50px | Price per treatment |
| 5 | (no label) | Upload row | 50px | "העלאת תמונת רקע" + upload icon |

All inputs: border `#CDDBDB`, border-radius 10px, placeholder "הקלד/י כאן.." `rgba(102,102,102,0.44)` Regular 14px. Labels: Discovery Fs Regular 16px.

#### Upload Row
| Element | Spec |
|---|---|
| Text | העלאת תמונת רקע |
| Icon | Upload arrow icon (20px), left side |
| Style | Same border/radius as inputs |

#### Submit Button
| Property | Value |
|---|---|
| Label | יצירת חבילה |
| Width | 468px |
| Height | 50px (py-12px) |
| Background | `#7DE4A8` |
| Border radius | 8px |
| Font | Poppins Bold 16px `#08190C` |

---

### 35.3 Colors & Typography

| Token | Value | Usage |
|---|---|---|
| Page background | `#FAFAFA` | Admin page bg |
| Modal background | `#FFFFFF` | Modal card |
| Stat card background | `#FFFFFF` | Stat cards |
| Add/Submit button bg | `#7DE4A8` | Primary actions |
| Input border | `#CDDBDB` | All form inputs |
| Placeholder text | `rgba(102,102,102,0.44)` | Input placeholders |
| Stat subtitle | `#9F9F9F` | Greeting subtitle |
| Card text | `#FFFFFF` | Package card title/desc |

| Element | Font | Weight | Size |
|---|---|---|---|
| Active nav | Discovery Fs | Demi-bold | 18px |
| Greeting | Discovery Fs | Medium | 30px |
| Stat card label | Discovery Fs | Light | 16px |
| Stat card value | Discovery Fs | Medium | 30px |
| Package card title | Discovery Fs | Bold | 20px |
| Package card desc | Discovery Fs | Light | 14px |
| Modal title | Discovery Fs | Bold | 30px |
| Field labels | Discovery Fs | Regular | 16px |
| Placeholder | Discovery Fs | Regular | 14px |
| Action buttons | Poppins | Bold | 16px |

---

### 35.4 Flow

```
Admin clicks "חבילות טיפול" in nav
        ↓
Packages list page loads
Shows: greeting + 4 stat cards + card grid (4 packages)
        ↓
[הוספת חבילה חדשה+]        [3-dots on card]
        ↓                        ↓
Create Package Modal        Context menu opens
"יצירת חבילה"                   ↓
        ↓             [עריכת חבילה] → Edit modal
Fill fields:           [מחיקת חבילה] → Delete confirm
- שם החבילה
- תיאור החבילה
- כמות טיפולים
- מחיר לטיפול
- Upload bg image
        ↓
[יצירת חבילה]
        ↓
Modal closes, grid refreshes
```

---

### 35.5 Hebrew / English Reference

| Hebrew | English | Context |
|---|---|---|
| חבילות טיפול | Treatment Packages | Nav + page title |
| אזור הכי נמכר | Best-Selling Area | Stat card label |
| תל אביב | Tel Aviv | Sample stat value |
| הכי פחות נמכרת | Least Sold | Stat card label |
| חבילת ספורט | Sport Package | Sample package name |
| הכי נמכרת | Best Seller | Stat card label |
| חבילת הריון | Pregnancy Package | Sample package name |
| סה"כ חבילות שנמכרו | Total Packages Sold | Stat card label |
| הוספת חבילה חדשה + | Add New Package + | Primary CTA |
| יצירת חבילה | Create Package | Modal title + submit button |
| שם החבילה | Package Name | Form field |
| תיאור החבילה | Package Description | Form field |
| כמות טיפולים בחבילה | Number of Treatments in Package | Form field |
| מחיר לטיפול | Price per Treatment | Form field |
| העלאת תמונת רקע | Upload Background Image | Upload row |
| עריכת חבילה | Edit Package | Context menu option |
| מחיקת חבילה | Delete Package | Context menu option |

---

### 35.6 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Full-width admin packages page | Yes |
| Active nav "חבילות טיפול" | Yes |
| Personalized greeting + subtitle | Yes |
| 4 stat cards with icons | Yes |
| Stat cards: best-selling area, least/most sold, total count | Yes |
| Colored icon backgrounds per stat card | Yes |
| "הוספת חבילה חדשה+" green button | Yes |
| Package cards as gradient cards (not table) | Yes |
| 4 different gradient color themes per card | Yes |
| Glassmorphism circle icon on each card | Yes |
| Decorative grid pattern on cards (opacity 16%) | Yes |
| 3-dots menu per card | Yes |
| Edit + Delete options in context menu | Yes |
| Create Package modal with X close | Yes |
| 4 form fields + background image upload | Yes |
| Textarea for description (h-155px) | Yes |
| Green submit button "יצירת חבילה" | Yes |

---

## 36. Admin — Profile & Account Settings

**Figma Node:** `1:21508`
**Screen type:** Full admin page (settings/profile)
**Hebrew title:** אזור אישי

---

### 36.1 Layout

| Property | Value |
|---|---|
| Page width | 1440px full-width |
| Header | 80px white admin header — active nav "חבילות טיפול" |
| Background | `#FAFAFA` |
| Content card | White, 1337×796px, rounded-10px, centered |

**Visible on page load:**
- Admin header dropdown menu open: shows "אזור אישי" (black) + "התנתקות" (red `#E70202`) — white card, w-184px, h-63px, rounded-10px, shadow `0px 0px 10px rgba(0,0,0,0.1)`

**Content card — two-column layout (gap-230px):**

| Column | Width | Contents |
|---|---|---|
| Left (profile photo + basic info) | 499px | Avatar upload widget + שם מלא + כתובת מייל |
| Right (password change) | 499px | "שינוי סיסמה" title + 3 password fields + "החלפת סיסמה" link |

---

### 36.2 Components

#### Header User Dropdown
| Element | Spec |
|---|---|
| Card width | 184px |
| Card height | 63px |
| Border radius | 10px |
| Shadow | `0px 0px 10px rgba(0,0,0,0.1)` |
| "אזור אישי" | Discovery Fs Regular 14px `#000000` |
| "התנתקות" | Discovery Fs Regular 14px `#E70202` (red) |
| Gap between items | 20px |

#### Avatar Upload Widget (Left column, top)
| Element | Spec |
|---|---|
| Upload area | 144×144px, bg `#F4F7F7`, rounded-8px, border `rgba(177,181,185,0.25)` |
| Upload icon | Arrow-up icon centered inside |
| "העלאת תמונה" button | White, border `#000000` (black), rounded-8px, w-141px, Discovery Fs Regular 14px |
| Position | Button overlaps bottom of avatar area |

#### Profile Info Fields (Left column, below avatar)
| Field | Label | Type | Height |
|---|---|---|---|
| 1 | שם מלא | Text input | 48px |
| 2 | כתובת מייל | Text input | 48px |

All inputs: border `#CDDBDB`, rounded-10px, placeholder "הקלד/י כאן..." `rgba(102,102,102,0.44)` Regular 14px.

#### Password Change Section (Right column)
| Element | Spec |
|---|---|
| Section title | "שינוי סיסמה" — Discovery Fs Medium 18px `#000000` |
| Field 1 | סיסמה נוכחית (Current Password) — h-48px, standard |
| Field 2 | סיסמה חדשה (New Password) — h-48px, standard |
| Field 3 | אימות סיסמה חדשה (Confirm New Password) — h-48px, standard |
| "החלפת סיסמה" link | Underlined, Discovery Fs Regular 16px `#21544E` (teal), below fields |

Gap between password fields: 30px.

#### Footer Action Buttons
| Button | Label | Width | Background | Color |
|---|---|---|---|---|
| Save | שמירת שינויים | 136px | `#7DE4A8` | `#000000` |
| Cancel | ביטול שינויים | 136px | `#F4F7F7` | `#000000` |

Both: h-48px (py-10px), rounded-8px, Discovery Fs Regular 16px. Gap: 8px. Position: bottom-left of content area.

---

### 36.3 Colors & Typography

| Token | Value | Usage |
|---|---|---|
| Page background | `#FAFAFA` | Admin page bg |
| Content card | `#FFFFFF` | Settings card |
| Avatar placeholder bg | `#F4F7F7` | Upload area |
| Input border | `#CDDBDB` | All form inputs |
| Save button bg | `#7DE4A8` | Primary save action |
| Cancel button bg | `#F4F7F7` | Cancel action |
| Logout text | `#E70202` | Destructive action |
| Password link | `#21544E` | Teal — primary brand |

| Element | Font | Weight | Size |
|---|---|---|---|
| Dropdown items | Discovery Fs | Regular | 14px |
| Upload button | Discovery Fs | Regular | 14px |
| Field labels | Discovery Fs | Regular | 16px |
| Placeholder | Discovery Fs | Regular | 14px |
| Password section title | Discovery Fs | Medium | 18px |
| Password link | Discovery Fs | Regular | 16px |
| Action buttons | Discovery Fs | Regular | 16px |

---

### 36.4 Flow

```
Admin clicks avatar/name in header
        ↓
Dropdown opens: "אזור אישי" + "התנתקות"
        ↓
Admin clicks "אזור אישי"
        ↓
Profile settings page loads
Two columns: [Profile photo + name/email] | [Password change]
        ↓
[שמירת שינויים]    [ביטול שינויים]    [החלפת סיסמה]
        ↓                ↓                  ↓
   Save changes      Cancel/reset      Submit password
                                          change only
```

---

### 36.5 Hebrew / English Reference

| Hebrew | English | Context |
|---|---|---|
| אזור אישי | Personal Area / My Account | Dropdown menu item |
| התנתקות | Logout | Dropdown menu item (red) |
| העלאת תמונה | Upload Photo | Avatar button |
| שם מלא | Full Name | Form field |
| כתובת מייל | Email Address | Form field |
| שינוי סיסמה | Change Password | Section title |
| סיסמה נוכחית | Current Password | Form field |
| סיסמה חדשה | New Password | Form field |
| אימות סיסמה חדשה | Confirm New Password | Form field |
| החלפת סיסמה | Replace Password | Underlined CTA link |
| שמירת שינויים | Save Changes | Footer button |
| ביטול שינויים | Cancel Changes | Footer button |

---

### 36.6 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Admin header dropdown with user menu | Yes |
| "אזור אישי" and "התנתקות" in dropdown | Yes |
| "התנתקות" in red (#E70202) | Yes |
| Profile settings page with white card | Yes |
| Two-column layout (profile | password) | Yes |
| Avatar upload area (144px, gray bg) | Yes |
| "העלאת תמונה" button overlapping avatar | Yes |
| Full name + email fields | Yes |
| Password section with 3 fields | Yes |
| "החלפת סיסמה" teal underlined link | Yes |
| Save + Cancel footer buttons | Yes |
| Green save / gray cancel button style | Yes |

---

## 37. Admin — Articles Management

**Figma Nodes:** `1:25052` (Articles List), `1:25663` (Create Article Modal)
**Screen type:** Full admin page + modal
**Hebrew title:** מאמרים

---

### 37.1 Articles List Page (Node 1:25052)

#### Layout

| Property | Value |
|---|---|
| Page width | 1440px full-width |
| Header | 80px white admin header (standard nav) |
| Active nav item | מאמרים — Discovery Fs Demi-bold |
| Background | `#FAFAFA` |

**Page structure (top → bottom):**

1. Standard 80px admin header + navigation
2. Page title block — "מאמרים" + subtitle
3. Filter/action bar — upload button (left) + search (right)
4. Article cards grid — 5 columns × 2 rows

#### Page Title Block
| Element | Spec |
|---|---|
| Title | "מאמרים" — Discovery Fs Medium 30px `#000000` |
| Subtitle | "נמצאו 1,000 מאמרים במערכת" — Regular 16px `#9F9F9F` |

#### Filter Bar
| Element | Width | Height | Style |
|---|---|---|---|
| "העלאת מאמר חדש +" | 246px | 50px (py-12) | bg `#7DE4A8`, rounded-8px, Poppins Bold 16px `#08190C` |
| Free text search | 520px | 50px | border `#CDDBDB`, rounded-10px, search icon right, Poppins Regular placeholder `#666666` "חיפוש חופשי..." |

#### Article Cards Grid

Layout: 5 columns, 2 rows, gap-27px. Each article card is a stacked composite:

**Card structure (top → bottom):**

| Element | Spec |
|---|---|
| Thumbnail | 246×184px, rounded-16.749px, cover photo |
| Info panel | White, w-246px, h-128px, rounded-bl-20px, rounded-br-20px, border white |
| Tags row | Below info panel, overlapping bottom of thumbnail |

**Info panel contents:**
- Article title: Discovery Fs Medium 16px `#000000`
- Description: Discovery Fs Light 14px `#9F9F9F`, 2 lines truncated (leading-18px)
- Author row: "פורסם ע"י [name]" + author avatar (31px circle) — Light 14px `#000000`

**Tags row (below card):**
- Category pill: "דיקור סיני" — border `#9F9F9F`, rounded-100px, h-24px, px-10px, gradient bg (`#ebebec` → `#FFFFFF`), Discovery Fs Light 12px
- Date pill: "09/10/2025" — same style, w-79px

**Per-card action elements:**
- **← arrow button** (bottom-left): 28px circle, border `#CDDBDB` (from `imgFrame2147224127`) — navigates to article detail
- **3-dots menu** (top of card, floated): 34px circle, white bg, border `#CDDBDB`, rounded-50px — opens context menu

#### Context Menu (per card)
| Option | Color | Action |
|---|---|---|
| עריכת מאמר | `#000000` | Open edit article modal |
| מחיקת מאמר | `#E70202` | Delete article (destructive) |

Menu: white card, rounded-10px, h-73px, gap-16px, shadow `0px 2px 20px rgba(0,0,0,0.1)`.

---

### 37.2 Create Article Modal (Node 1:25663)

#### Layout

| Property | Value |
|---|---|
| Modal content width | 636px |
| Border radius | 20px |
| Background | `#FFFFFF` |
| Padding | 30px |

**Modal structure (top → bottom):**

1. X close button — top-left, 33px
2. Title — "יצירת מאמר חדש" — right-aligned
3. 5 form fields (stacked)
4. Submit button

#### Modal Title
| Element | Spec |
|---|---|
| Text | יצירת מאמר חדש |
| Font | Discovery Fs Bold 30px |
| Color | `#000000` |
| Letter spacing | -0.6px |
| Alignment | Right (RTL) |

#### Form Fields

| # | Label | Type | Height | Placeholder font |
|---|---|---|---|---|
| 1 | סוג קטגוריה | Dropdown | 50px | Poppins Regular "בחירה" `#666` |
| 2 | שיוך למטפל | Dropdown | 50px | Poppins Regular "בחירה" `#666` |
| 3 | (no label) | Upload row | 50px | "העלאת תמונת רקע" + upload icon |
| 4 | שם המאמר | Text input | 48px | Poppins Regular "הקלד/י כאן..." `rgba(102,102,102,0.44)` |
| 5 | תוכן המאמר | Textarea (large) | 576px | Poppins Regular "הקלד/י כאן..." `rgba(102,102,102,0.44)` |

All fields: border `#CDDBDB`, border-radius 10px, full modal width. Labels: Discovery Fs Regular 16px. Dropdowns have angle-down-small icon on left.

#### Submit Button
| Property | Value |
|---|---|
| Label | יצירת מאמר |
| Width | Full modal width (636px) |
| Height | 48px |
| Background | `#7DE4A8` |
| Border radius | 8px |
| Font | Poppins Bold 16px `#08190C` |

---

### 37.3 Colors & Typography

| Token | Value | Usage |
|---|---|---|
| Page background | `#FAFAFA` | Admin page bg |
| Modal background | `#FFFFFF` | Modal card |
| Upload/Submit button bg | `#7DE4A8` | Primary actions |
| Input border | `#CDDBDB` | All form inputs |
| Placeholder (Poppins) | `rgba(102,102,102,0.44)` | Input placeholders |
| Search placeholder | `#666666` | Search field |
| Subtitle | `#9F9F9F` | Page subtitle |
| Card description | `#9F9F9F` | Article card desc text |
| Delete menu item | `#E70202` | Destructive action |
| Tag border | `#9F9F9F` | Category/date pill border |

| Element | Font | Weight | Size |
|---|---|---|---|
| Active nav | Discovery Fs | Demi-bold | 18px |
| Page title | Discovery Fs | Medium | 30px |
| Upload button | Poppins | Bold | 16px |
| Search placeholder | Poppins | Regular | 14px |
| Card title | Discovery Fs | Medium | 16px |
| Card description | Discovery Fs | Light | 14px |
| Card author | Discovery Fs | Light | 14px |
| Tag pills | Discovery Fs | Light | 12px |
| Modal title | Discovery Fs | Bold | 30px |
| Field labels | Discovery Fs | Regular | 16px |
| Dropdown placeholder | Poppins | Regular | 14px |
| Submit button | Poppins | Bold | 16px |

---

### 37.4 Flow

```
Admin clicks "מאמרים" in nav
        ↓
Articles list page loads
Shows: title + count subtitle + filter bar + 5×2 card grid
        ↓
[העלאת מאמר חדש +]       [3-dots per card]
        ↓                       ↓
Create Article Modal       Context menu
"יצירת מאמר חדש"               ↓
        ↓            [עריכת מאמר] → Edit modal
Select:              [מחיקת מאמר] → Delete confirm (red)
- סוג קטגוריה
- שיוך למטפל
- Upload image
- שם המאמר
- תוכן המאמר (large textarea)
        ↓
[יצירת מאמר]
        ↓
Modal closes, grid refreshes
```

---

### 37.5 Hebrew / English Reference

| Hebrew | English | Context |
|---|---|---|
| מאמרים | Articles | Nav + page title |
| נמצאו 1,000 מאמרים במערכת | 1,000 articles found in system | Page subtitle |
| העלאת מאמר חדש + | Upload New Article + | Primary CTA button |
| חיפוש חופשי... | Free search... | Search placeholder |
| שם המאמר | Article Name | Card title + form field |
| פורסם ע"י | Published by | Author row prefix |
| דיקור סיני | Acupuncture | Sample category tag |
| עריכת מאמר | Edit Article | Context menu option |
| מחיקת מאמר | Delete Article | Context menu (red) |
| יצירת מאמר חדש | Create New Article | Modal title |
| סוג קטגוריה | Category Type | Dropdown field |
| שיוך למטפל | Assign to Practitioner | Dropdown field |
| העלאת תמונת רקע | Upload Background Image | Upload row |
| תוכן המאמר | Article Content | Large textarea field |
| יצירת מאמר | Create Article | Submit button |
| בחירה | Select / Choose | Dropdown placeholder |

---

### 37.6 Functionality Summary

| Feature | Figma-confirmed |
|---|---|
| Full-width admin articles page | Yes |
| Active nav highlight for "מאמרים" | Yes |
| Page title + dynamic count subtitle | Yes |
| "העלאת מאמר חדש +" green CTA button | Yes |
| Free-text search with icon | Yes |
| Article cards displayed as grid (not table) | Yes |
| 5-column card grid layout | Yes |
| Card: thumbnail + info panel + tags | Yes |
| Rounded thumbnail (16.749px) | Yes |
| Article title + truncated description | Yes |
| Author name + avatar row | Yes |
| Category tag pill + date pill per card | Yes |
| ← arrow navigation button per card | Yes |
| 3-dots context menu per card | Yes |
| Delete option in red (#E70202) | Yes |
| Create Article modal with X close | Yes |
| Wider modal (636px vs standard 479px) | Yes |
| Rounded-20px modal (vs standard 16px) | Yes |
| Category + practitioner dropdowns | Yes |
| Large textarea for content (h-576px) | Yes |
| Green "יצירת מאמר" submit button | Yes |

