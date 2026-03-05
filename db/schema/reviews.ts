import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { bookings } from "./bookings";
import { reviewStatusEnum } from "./enums";

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().unique().references(() => bookings.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  reviewerFirstName: text("reviewer_first_name"),
  status: reviewStatusEnum("status").notNull().default("submitted"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
