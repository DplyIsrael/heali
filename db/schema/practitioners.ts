import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { practitionerStatusEnum, pricingModelEnum } from "./enums";

export const practitionerProfiles = pgTable("practitioner_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  // Treatment domains and specialties stored as UUID arrays (join queries as needed)
  domainIds: uuid("domain_ids").array().notNull().default([]),
  specialtyIds: uuid("specialty_ids").array().notNull().default([]),
  pricingModel: pricingModelEnum("pricing_model").notNull().default("per_treatment"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  languages: text("languages").array().notNull().default([]),
  bio: text("bio"),
  certificationDescription: text("certification_description"),
  phone: text("phone"),
  city: text("city"),
  clinicCities: text("clinic_cities").array().notNull().default([]),
  clinicAddresses: text("clinic_addresses").array().notNull().default([]),
  homeVisits: boolean("home_visits").notNull().default(false),
  area: text("area"),
  // Denormalized from users.full_name (kept in sync by a DB trigger) so public
  // reads don't need to join users — keeps practitioner emails out of anon reads.
  displayName: text("display_name"),
  profilePhotoUrl: text("profile_photo_url"),
  qrCodeUrl: text("qr_code_url"),
  verificationStatus: practitionerStatusEnum("verification_status").notNull().default("draft"),
  rejectionReason: text("rejection_reason"),
  isPubliclyVisible: boolean("is_publicly_visible").notNull().default(false),
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").notNull().default(0),
  agreementSignedAt: timestamp("agreement_signed_at", { withTimezone: true }),
  onboardingStep: integer("onboarding_step").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Bank details for payouts — isolated in an admin/service-role-only table so
// they are NOT exposed via the public practitioner_profiles read policy.
export const practitionerBankDetails = pgTable("practitioner_bank_details", {
  practitionerId: uuid("practitioner_id")
    .primaryKey()
    .references(() => practitionerProfiles.id, { onDelete: "cascade" }),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankBranchNumber: text("bank_branch_number"),
  bankNumber: text("bank_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// One row per uploaded client invoice during onboarding step 5. Five rows
// (slot_index 0-4) are required to advance.
export const practitionerClientInvoices = pgTable("practitioner_client_invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  practitionerId: uuid("practitioner_id").notNull().references(() => practitionerProfiles.id, { onDelete: "cascade" }),
  slotIndex: integer("slot_index").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

// One row per uploaded client reference/testimonial during onboarding step 6.
// Five rows (slot_index 0-4) are required to advance.
export const practitionerClientReferences = pgTable("practitioner_client_references", {
  id: uuid("id").primaryKey().defaultRandom(),
  practitionerId: uuid("practitioner_id").notNull().references(() => practitionerProfiles.id, { onDelete: "cascade" }),
  slotIndex: integer("slot_index").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const practitionerDocuments = pgTable("practitioner_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  practitionerId: uuid("practitioner_id").notNull().references(() => practitionerProfiles.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // pdf, jpg, png
  isApproved: boolean("is_approved"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const practitionerAvailability = pgTable(
  "practitioner_availability",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    practitionerId: uuid("practitioner_id").notNull().references(() => practitionerProfiles.id, { onDelete: "cascade" }),
    weekday: integer("weekday").notNull(), // 0=Sunday, 1=Monday ... 6=Saturday
    startTime: text("start_time").notNull(), // "HH:MM"
    endTime: text("end_time").notNull(), // "HH:MM"
  },
  // No two slots on the same weekday can start at the same time for one
  // practitioner — prevents accidental duplicate inserts when the UI
  // double-fires saveAvailabilitySlot.
  (t) => [unique().on(t.practitionerId, t.weekday, t.startTime)]
);

export const availabilityBlocks = pgTable(
  "availability_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    practitionerId: uuid("practitioner_id").notNull().references(() => practitionerProfiles.id, { onDelete: "cascade" }),
    blockedDate: text("blocked_date").notNull(), // "YYYY-MM-DD"
  },
  (t) => [unique().on(t.practitionerId, t.blockedDate)]
);
