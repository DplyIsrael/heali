import { pgTable, uuid, numeric, text, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { practitionerProfiles } from "./practitioners";
import { bookings } from "./bookings";
import { creditStatusEnum, refundRequestStatusEnum } from "./enums";

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    practitionerId: uuid("practitioner_id").notNull().references(() => practitionerProfiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.patientId, t.practitionerId)]
);

export const credits = pgTable("credits", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  sourceBookingId: uuid("source_booking_id").references(() => bookings.id, { onDelete: "set null" }),
  status: creditStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const refundRequests = pgTable("refund_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sourceCreditId: uuid("source_credit_id").references(() => credits.id, { onDelete: "set null" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason"),
  status: refundRequestStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  resolvedByAdminId: uuid("resolved_by_admin_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});
