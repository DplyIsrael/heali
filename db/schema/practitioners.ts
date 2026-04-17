import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  integer,
  timestamp,
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
  phone: text("phone"),
  city: text("city"),
  clinicCities: text("clinic_cities").array().notNull().default([]),
  area: text("area"),
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

export const practitionerDocuments = pgTable("practitioner_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  practitionerId: uuid("practitioner_id").notNull().references(() => practitionerProfiles.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // pdf, jpg, png
  isApproved: boolean("is_approved"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const practitionerAvailability = pgTable("practitioner_availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  practitionerId: uuid("practitioner_id").notNull().references(() => practitionerProfiles.id, { onDelete: "cascade" }),
  weekday: integer("weekday").notNull(), // 0=Sunday, 1=Monday ... 6=Saturday
  startTime: text("start_time").notNull(), // "HH:MM"
  endTime: text("end_time").notNull(), // "HH:MM"
});

export const availabilityBlocks = pgTable("availability_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  practitionerId: uuid("practitioner_id").notNull().references(() => practitionerProfiles.id, { onDelete: "cascade" }),
  blockedDate: text("blocked_date").notNull(), // "YYYY-MM-DD"
});
