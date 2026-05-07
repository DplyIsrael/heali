import { pgTable, uuid, text, date, numeric, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { practitionerProfiles } from "./practitioners";
import { treatmentDomains } from "./taxonomy";
import { bookingStatusEnum, paymentStatusEnum } from "./enums";

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  practitionerId: uuid("practitioner_id").notNull().references(() => practitionerProfiles.id, { onDelete: "cascade" }),
  domainId: uuid("domain_id").notNull().references(() => treatmentDomains.id),
  scheduledDate: date("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(), // "HH:MM"
  status: bookingStatusEnum("status").notNull().default("requested"),
  priceAtBooking: numeric("price_at_booking", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  paymentReference: text("payment_reference"),
  qrScannedAt: timestamp("qr_scanned_at", { withTimezone: true }),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
