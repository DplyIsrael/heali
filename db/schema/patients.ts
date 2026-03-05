import { pgTable, uuid, text, date, jsonb, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { genderEnum } from "./enums";

export const patientProfiles = pgTable("patient_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  city: text("city"),
  area: text("area"),
  phone: text("phone"),
  profilePhotoUrl: text("profile_photo_url"),
  questionnaireResponses: jsonb("questionnaire_responses"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
