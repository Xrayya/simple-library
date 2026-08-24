import { and, eq } from "drizzle-orm";
import { borrowLogs } from "../db/schema";
import { UnauthorizedError } from "../exceptions/auth";
import { db } from "../db/db";

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

function transformQueryResult(
  queryResult: {
    book: {
      author: string;
      availableCopies: number;
      category: {
        name: string;
      };
      categoryId: string;
      coverUrl: string | null;
      createdAt: Date;
      description: string | null;
      edition: number | null;
      id: string;
      publisher: string | null;
      title: string;
      totalCopies: number;
      updatedAt: Date | null;
      year: number | null;
    };
    bookId: string;
    borrowedAt: Date;
    createdAt: Date;
    dueAt: Date;
    id: string;
    returnedAt: Date | null;
    status: "borrowed" | "canceled" | "returned";
    updatedAt: Date | null;
    userId: string;
  }[],
): {
  borrowingInfo: ReturnedBorrowingType;
  bookInfo: ReturnedBookWithCategoryNameType;
}[] {
  return queryResult.map(
    ({
      book: {
        category: { name: categoryName },
        ...bookRest
      },
      ...borrowingRest
    }) => ({
      borrowingInfo: borrowingRest,
      bookInfo: {
        ...bookRest,
        categoryName,
      },
    }),
  );
}

export async function getUserBorrowing({ userId }: { userId: string }): Promise<
  {
    borrowingInfo: ReturnedBorrowingType;
    bookInfo: ReturnedBookWithCategoryNameType;
  }[]
> {
  const result = await db.query.borrowLogs.findMany({
    where: {
      userId: { eq: userId },
    },
    with: {
      book: {
        with: {
          category: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  });

  return transformQueryResult(result);
}

export async function getBorrowings(): Promise<
  {
    borrowingInfo: ReturnedBorrowingType;
    bookInfo: ReturnedBookWithCategoryNameType;
  }[]
> {
  const result = await db.query.borrowLogs.findMany({
    with: {
      book: {
        with: {
          category: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  });

  return transformQueryResult(result);
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
  const result = await db
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
  const result = await db
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
  const result = await db
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
