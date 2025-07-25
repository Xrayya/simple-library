import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import "dotenv/config";

const USER_TABLE_NAME = `${process.env.DATABASE_TABLE_PREFIX!}-user`;
const BOOK_CATEGORY_LOG_TABLE_NAME = `${process.env.DATABASE_TABLE_PREFIX!}-book-category`;
const BOOK_TABLE_NAME = `${process.env.DATABASE_TABLE_PREFIX!}-book`;
const BORROW_LOG_TABLE_NAME = `${process.env.DATABASE_TABLE_PREFIX!}-borrow-log`;

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
};

export const userRoleEnum = pgEnum("role", ["user", "admin"]);
export const borrowStatusEnum = pgEnum("borrow_status", [
  "borrowed",
  "returned",
]);

export const users = pgTable(USER_TABLE_NAME, {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  ...timestamps,
});

export type UserType = typeof users.$inferSelect;

export const categories = pgTable(BOOK_CATEGORY_LOG_TABLE_NAME, {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export type CategoryType = typeof categories.$inferSelect;

export const books = pgTable(BOOK_TABLE_NAME, {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  publisher: varchar("publisher", { length: 255 }),
  year: integer("year"),
  edition: integer("edition"),
  description: text("description"),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  coverUrl: text("cover_url"),
  totalCopies: integer("total_copies").notNull().default(1),
  availableCopies: integer("available_copies").notNull().default(1),
  ...timestamps,
});

export type BookType = typeof books.$inferSelect;

// Borrow Logs
export const borrowLogs = pgTable(BORROW_LOG_TABLE_NAME, {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  borrowedAt: timestamp("borrowed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  returnedAt: timestamp("returned_at", { withTimezone: true }),
  status: borrowStatusEnum("status").notNull().default("borrowed"),
  ...timestamps,
});

export type BorrowLogType = typeof borrowLogs.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  borrowLogs: many(borrowLogs),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  category: one(categories, {
    fields: [books.categoryId],
    references: [categories.id],
  }),
  borrowLogs: many(borrowLogs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  books: many(books),
}));

export const borrowLogsRelations = relations(borrowLogs, ({ one }) => ({
  user: one(users, {
    fields: [borrowLogs.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [borrowLogs.bookId],
    references: [books.id],
  }),
}));
