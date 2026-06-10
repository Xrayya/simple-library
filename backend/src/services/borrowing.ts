import { and, eq, getTableColumns } from "drizzle-orm";
import db from "../db/db";
import { books, borrowLogs, categories } from "../db/schema";
import { UnauthorizedError } from "../exceptions/auth";

type ReturnedBorrowingType = {
  id: string;
  userId: string;
  bookId: string;
  borrowedAt: Date;
  dueAt: Date;
  returnedAt: Date | null;
  status: "borrowed" | "returned" | "canceled";
  createdAt: Date;
  updatedAt: Date | null;
};

type ReturnedBookWithCategoryNameType = {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  year: number | null;
  edition: number | null;
  description: string | null;
  categoryId: string;
  categoryName: string;
  coverUrl: string | null;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date | null;
};

export async function getUserBorrowing({ userId }: { userId: string }): Promise<
  {
    borrowingInfo: ReturnedBorrowingType;
    bookInfo: ReturnedBookWithCategoryNameType;
  }[]
> {
  const result = await db()
    .select({
      borrowingInfo: getTableColumns(borrowLogs),
      bookInfo: { ...getTableColumns(books), categoryName: categories.name },
    })
    .from(borrowLogs)
    .innerJoin(books, eq(borrowLogs.bookId, books.id))
    .innerJoin(categories, eq(books.categoryId, categories.id))
    .where(eq(borrowLogs.userId, userId));

  return result;
}

export async function getBorrowings(): Promise<
  {
    borrowingInfo: ReturnedBorrowingType;
    bookInfo: ReturnedBookWithCategoryNameType;
  }[]
> {
  const result = await db()
    .select({
      borrowingInfo: getTableColumns(borrowLogs),
      bookInfo: { ...getTableColumns(books), categoryName: categories.name },
    })
    .from(borrowLogs)
    .innerJoin(books, eq(borrowLogs.bookId, books.id))
    .innerJoin(categories, eq(books.categoryId, categories.id));

  return result;
}

export async function addBorrowing({
  userId,
  bookId,
  dueAt,
}: {
  userId: string;
  bookId: string;
  dueAt: Date;
}): Promise<ReturnedBorrowingType> {
  const result = await db()
    .insert(borrowLogs)
    .values({
      userId,
      bookId,
      dueAt,
    })
    .returning();

  return result[0];
}

export async function changeBorrowingBook({
  userId,
  newBookId,
  borrowingId,
}: {
  userId: string;
  newBookId: string;
  borrowingId: string;
}): Promise<ReturnedBorrowingType> {
  const result = await db()
    .update(borrowLogs)
    .set({
      bookId: newBookId,
    })
    .where(and(eq(borrowLogs.id, borrowingId), eq(borrowLogs.userId, userId)))
    .returning();

  if (result.length < 1) {
    throw new UnauthorizedError();
  }

  return result[0];
}

export async function cancelBorrowing({
  userId,
  borrowingId,
}: {
  userId: string;
  borrowingId: string;
}): Promise<ReturnedBorrowingType> {
  const result = await db()
    .update(borrowLogs)
    .set({
      status: "canceled",
    })
    .where(and(eq(borrowLogs.id, borrowingId), eq(borrowLogs.userId, userId)))
    .returning();

  if (result.length < 1) {
    throw new UnauthorizedError();
  }

  return result[0];
}
