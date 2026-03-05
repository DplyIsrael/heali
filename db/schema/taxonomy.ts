import { pgTable, uuid, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const treatmentDomains = pgTable("treatment_domains", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const specialties = pgTable("specialties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  domainId: uuid("domain_id").notNull().references(() => treatmentDomains.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  pointsAmount: integer("points_amount").notNull().default(0),
  fieldOfKnowledge: text("field_of_knowledge"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
