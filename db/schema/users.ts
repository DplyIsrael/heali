import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // matches auth.users.id
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull(),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
