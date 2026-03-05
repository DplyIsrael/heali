**Product Requirements Document (PRD) \- Heali for DEV**

Version: 1.0 

Status: Draft for Dev (contains open items flagged as MISSING / TBD)

Platforms: Responsive Web (Mobile-first), RTL-first (Hebrew default)

# **1\. Product Overview**

Heali is a wellness and complementary care platform connecting patients with verified practitioners. The platform supports practitioner discovery, onboarding, booking, treatment lifecycle management, content consumption, and practitioner tools to support revenue generation.

## **1.1 Primary Goals**

* Enable users to find the right practitioner via personalized matching and categories.  
* Support practitioners via onboarding, verification, profile management, and revenue tools.  
* Manage the full treatment lifecycle from discovery through booking, delivery confirmation, and follow-ups.  
* Support treatment packages and gifting.  
* Track what treatments or treatment packages are most popular with patients, which practitioners are most popular, patient statistics, etc.

# **2\. Users and Roles**

## **2.1 Patient (Consumer)**

* Browse and search practitioners.  
* View practitioner profiles and book treatments.  
* Manage upcoming and past treatments.  
* Read articles/blog content.  
* Manage personal information and preferences (with some restrictions \- see section 6).

## **2.2 Practitioner (Provider)**

* Complete onboarding and verification.  
* Set services, specialties, pricing, languages, and profile content.  
* Manage incoming booking requests, schedule, and treatment history.  
* View analytics of their treatments, payments etc.  
* Create content (subject to admin approval).

## **2.3 Admin**

* Full access to all system tables and data.  
* Resolve issues and manage operational workflows.  
* Edit practitioner details, add treatments, approve refunds/credits, moderate reviews and content.  
* Has a dashboard allowing to filter any information within the system.

# **3\. Platforms, Language, and UI Principles**

* Initial platform: responsive web application (mobile-first).  
* RTL-first UI, Hebrew as default language.  
* All UI components, navigation, and flows must fully support right-to-left layout.  
* Analytics and tracking integration.  
* Conncted to google analytics tools.

# **4\. Information Architecture and Navigation**

## **4.1 Main Navigation Items**

* Home  
* Practitioner Search / Discovery  
* Treatment Packages / Individual treatments  
* My Treatments  
* Articles / Blog  
* Contact Us  
* Login / Sign Up

Navigation must be consistent across public and authenticated pages.

# **5\. Authentication and Account Management**

## **5.1 Supported Methods**

* Email \+ password login.  
* Google Sign-In.  
* Email registration with email verification.  
* Forgot password flow.

## **5.2 Legal Consent**

* During registration, users must accept Terms of Use and Privacy Policy.

# **6\. Patient Onboarding**

## **6.1 Onboarding Steps**

1. Welcome screen.  
2. About screen.  
3. Personal details form (ALL required): full name, date of birth, gender, city, phone number.  
4. Profile photo upload (optional).  
5. Confirmation step (required).  
6. Personalized questionnaire (male/female): MISSING (questions not specified; referenced as pending in design).

## **6.2 How Onboarding Data Is Used**

* Used to personalize practitioner recommendations.  
* At the end of onboarding, display 3-4 recommended practitioners with a button to view their profiles.  
* Include an "Other" option if the user does not want to choose from recommended practitioners.  
  Match by area /city and expertise of practitioner \= request of clients, at least one of them. Each area will contain a list of cities within it and will be used to search practitioners.

## **6.3 Editing Patient Data After Onboarding**

* Only city/area can be edited directly by the user.  
* Email or phone changes are handled offline by admin (support workflow).

# **7\. Practitioner Onboarding and Verification**

## **7.1 Required Steps**

7. Select treatment domains.  
8. Select specialties.  
9. Set pricing (per treatment).  
10. Upload certificates and documents.  
11. Select languages.  
12. Write profile summary.  
13. Sign provider agreement and accept Terms/Privacy (TBD \- referenced as pending).  
14. Submit for approval.

## **7.2 Approval Workflow**

* After submission, practitioner status becomes "Pending approval" for a few days.  
* Practitioner receives an email indicating their profile is under review.  
* While pending, profile is visible only to admin, not to the public.  
* After approval, practitioner receives a welcome email and profile is published.

## **7.3 Profile Edit Permissions During Review**

* Allow editing during review (except email).  
* After approval: lock down fields according to business rules (TBD).   
  1st phase: only price can be updated other requested changes should be forwarded to admin.

# **8\. Practitioner Discovery and Profiles**

## **8.1 Matching and Recommendation**

* At the end of patient onboarding, run a matching process and show 3-4 matched practitioners.  
* Matching parameters include: rating, at least one matching treatment domain requested by the patient, gender, and geographic location.  
* Decision for phase 2: will be decided whether matching runs on every login or only on first registration only.

## **8.2 Browsing and Favorites**

* Users can browse practitioners by categories and treatment domains.  
* Users can mark practitioners as favorites.

## **8.3 Practitioner Card (Required Fields)**

* Name  
* Treatment category/domains  
* Rating (to be calculated)  
* Number of ratings  
* Price  
* Location (areas \+ cities in those areas)

## **8.4 Practitioner Profile (Required Unless Marked Optional)**

* Full biography  
* Languages (from list)  
* Certificates (at least one)  
* Ratings and reviews (optional at first; grows over time)  
* Price per session  
* Book treatment. implementation details: practitioner will mark open slots on calender. Patients will book their wanted slot, but final approval will come from practitioner – only then the booking is complete. See paragraph 9\.  
* Image/logo  
* Barcode: system wil create a unique barcode per practitioner

## **8.5 Reviews Moderation**

* Patient reviews/ratings require admin approval before they are displayed.  
* Display reviewers first name only.  
* Admin can remove/edit reviews as needed.

## **8.6 Dynamic Pricing**

* Practitioner can change pricing at any time.  
* Pricing changes do not affect treatments already booked/closed only future ones

# **9\. Booking and Treatment Lifecycle (Patient)**

## **9.1 Booking Flow**

15. Enter main screen with two tabs: Favorites and Matched.  
16. Select a tab.  
17. Select a practitioner.  
18. Select date and time.  
19. Show status to patient: "Sent to practitioner for approval".  
20. After practitioner approval: booking is confirmed in system and confirmation email is sent to patient.  
21. Practitioner receives email to approve booking; approving via email sets approval status in the system automatically (implementation: TBD).

## **9.2 My Treatments Area**

* Upcoming treatments.  
* Completed treatments \- each row includes a link to rate the treatment.  
* Canceled treatments.

## **9.3 Treatment Confirmation (Attendance Proof)**

* Completed treatment requires confirmation.  
* Each practitioner has a unique QR code, generated upon approval to website.  
* Patient scans QR code upon arrival for treatment to confirm attendance.  
* Alternative: practitioner can send their QR code to the patient for confirmation later.  
* When patient receives QR code, send a notification/confirmation to practitioner.  
* Approximately 2 hours after QR scan, send a link to a satisfaction survey.  
* Survey result is published to the site and linked to practitioner profile (subject to admin moderation rules).

## **9.4 Treatment Record Fields (per booking)**

* Practitioner name  
* Order/booking number  
* Treatment type  
* Date and time  
* Location with Waze link  
* Price paid  
* Re-book option  
* Add to Google Calendar  
* Contact practitioner button \- opens in-app chat that sends email to practitioner (implementation: TBD)

## **9.5 Cancellation and Refunds**

* Payment is charged at booking time.  
* Cancel button prompts for cancellation reason.  
* Cancellation more than 24 hours before treatment yields a credit in the user personal area; user chooses whether to use it for another treatment or request a refund.  
* Ask to schedule another treatment or reschedule existing one.  
* If user selects 'No': show 'Refund' action; on click, show confirmation that cancellation will be approved and credit will appear in personal area.  
* If cancellation is less than 24 hours before treatment: do not allow cancellation.

# **10\. Practitioner Dashboard**

Dashboard provides KPIs and drilldowns (each metric opens a detailed list):

* Total treatments.  
* Upcoming treatments.  
* Completed treatments: paid / pending payout.  
* Canceled treatments.  
* Revenue: paid / pending payout.  
* Filters: by date, by patient name.  
* Phase 2: trend indicators vs previous periods (TBD). Each field can be filtered \+ multiple fields, show trends

# **11\. Content and Articles**

## **11.1 Content Features**

* Articles list.  
* Author name.  
* Search.  
* Article detail: title, content, author, date, category.  
* At end of article, suggest practitioners relevant to the article domain (matching logic: TBD).

## **11.2 Content Roles and Permissions**

* Practitioners or admins can create articles.  
* The writer/admin can edit and delete their articles.  
* All published content requires admin approval for later changes.

# **12\. Non-Functional Requirements and Open Decisions**

## **12.1 Non-Functional Requirements**

* RTL-first user experience.  
* Mobile-first responsive design.  
* Secure authentication and data storage.  
* Accessibility compliance: will be provided.  
* Provider payment processing and payment flow with 'Grow' app.  
* Notification channels: email, SMS, in-app, WhatsApp (exact scope and providers: TBD).  
* Comply with an accessibility standard.

# **13\. Data Model (High-Level \- Dev Appendix)**

## **13.1 Entities**

* User (Patient)
* User (Practitioner)
* Admin (role)
* PractitionerProfile
* PractitionerDocuments (certificates)
* TreatmentDomain
* Specialty
* Booking (Treatment)
* Review
* Article (fields: title, content, author, category\_id, practitioner\_id, background\_image\_url, status)
* TreatmentPackage (fields: name, description, num\_treatments, price, background\_image\_url, gradient\_theme)
* Category (fields: name, points\_amount, field\_of\_knowledge; linked to specialties)
* Credit/Refund (Patient wallet credit)

## **13.2 Key Statuses (Suggested)**

* Practitioner onboarding status: Draft, Submitted, PendingApproval, Approved, Rejected.  
* Booking status: Requested, PendingPractitionerApproval, Confirmed, Completed, Canceled.   
* Review status: Submitted, Approved, Rejected, Removed 

