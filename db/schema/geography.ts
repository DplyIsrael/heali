import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const areas = pgTable("areas", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cities = pgTable("cities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  areaId: uuid("area_id").notNull().references(() => areas.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
