import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./taxonomy";
import { practitionerProfiles } from "./practitioners";
import { articleStatusEnum } from "./enums";

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  practitionerId: uuid("practitioner_id").references(() => practitionerProfiles.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id),
  backgroundImageUrl: text("background_image_url"),
  slug: text("slug").notNull().unique(),
  status: articleStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
