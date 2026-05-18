import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["patient", "practitioner", "admin"]);

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const practitionerStatusEnum = pgEnum("practitioner_status", [
  "draft",
  "submitted",
  "pending_approval",
  "approved",
  "rejected",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "requested",
  "pending_practitioner_approval",
  "confirmed",
  "completed",
  "canceled",
  "declined",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "tokenized", // card saved via CardCom Low Profile; not yet charged
  "charged",
  "failed",
  "refunded",
  "credited",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "submitted",
  "approved",
  "rejected",
  "removed",
]);

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
]);

export const creditStatusEnum = pgEnum("credit_status", [
  "active",
  "used",
  "refunded",
]);

export const pricingModelEnum = pgEnum("pricing_model", [
  "per_treatment",
  "per_hour",
  "per_package",
  "per_heali_package",
]);
