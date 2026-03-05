import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // e.g. "new_booking", "booking_approved", "new_review", "new_practitioner"
  payload: jsonb("payload").notNull().default({}),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
