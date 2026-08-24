import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    borrowLogs: r.many.borrowLogs({
      from: r.users.id,
      to: r.borrowLogs.userId,
    }),
    refreshTokens: r.many.refreshTokens({
      from: r.users.id,
      to: r.refreshTokens.ownerId,
    }),
  },
  books: {
    category: r.one.categories({
      from: r.books.categoryId,
      to: r.categories.id,
      optional: false,
    }),
    borrowLogs: r.many.borrowLogs({
      from: r.books.id,
      to: r.borrowLogs.bookId,
    }),
  },
  categories: {
    books: r.many.books({
      from: r.categories.id,
      to: r.books.categoryId,
    }),
  },
  borrowLogs: {
    user: r.one.users({
      from: r.borrowLogs.userId,
      to: r.users.id,
      optional: false,
    }),
    book: r.one.books({
      from: r.borrowLogs.bookId,
      to: r.books.id,
      optional: false,
    }),
  },
  refreshTokens: {
    owner: r.one.users({
      from: r.refreshTokens.ownerId,
      to: r.users.id,
      optional: false,
    }),
  },
}));
