import { pgTable, uuid, numeric, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { practitionerProfiles } from "./practitioners";
import { bookings } from "./bookings";
import { creditStatusEnum } from "./enums";

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
