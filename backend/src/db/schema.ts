// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => name);

export const users = createTable("users", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username", { length: 256 }).notNull().unique(),
  password: text("password", { length: 256 }),
  resetPassword: text("reset_password", { length: 64 }),
  isAdmin: int("isAdmin", { mode: "boolean" }),
});
export type SelectUsers = InferSelectModel<typeof users>;
export type InsertUsers = InferInsertModel<typeof users>;

export const projects = createTable("projects", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { length: 512 }).notNull().unique(),
  disabled: int("is_disabled", { mode: "boolean" }).default(false),
});
export type SelectProjects = InferSelectModel<typeof projects>;
export type InsertProjects = InferInsertModel<typeof projects>;

export const bookings = createTable("bookings", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  projectId: int("project_id").references(() => projects.id),
  userId: int("user_id").references(() => users.id),
  distance: int("distance_m", { mode: "number" }).notNull(),
  date: int("isAdmin", { mode: "timestamp" }).notNull(),
});
export type SelectBookings = InferSelectModel<typeof users>;
export type InsertBookings = InferInsertModel<typeof users>;
