import { pgTable, uuid, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";

export const treatmentPackages = pgTable("treatment_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  numTreatments: integer("num_treatments").notNull(),
  pricePerTreatment: numeric("price_per_treatment", { precision: 10, scale: 2 }).notNull(),
  backgroundImageUrl: text("background_image_url"),
  gradientTheme: text("gradient_theme").notNull().default("teal"), // teal | green | purple | orange
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
