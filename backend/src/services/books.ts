import { and, count, eq, gte, ilike, lte, or } from "drizzle-orm";
import { books, categories } from "../db/schema";
import { db } from "../db/db";

type ReturnedBookType = {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  year: number | null;
  edition: number | null;
  description: string | null;
  categoryId: string;
  coverUrl: string | null;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date | null;
};

type ReturnedBookWithCategoryNameType = ReturnedBookType & {
  categoryName: string;
};

export async function insertBook({
  title,
  author,
  publisher,
  year,
  edition,
  description,
  categoryId,
  coverUrl,
  totalCopies,
}: {
  title: string;
  author: string;
  publisher: string;
  year: number;
  edition: number;
  description: string;
  categoryId: string;
  coverUrl?: string;
  totalCopies: number;
}): Promise<{ bookId: string; title: string; timestamp: Date }[]> {
  const result = await db
    .insert(books)
    .values({
      title,
      author,
      publisher,
      year,
      edition,
      description,
      categoryId,
      coverUrl,
      totalCopies,
      availableCopies: totalCopies,
    })
    .returning({
      bookId: books.id,
      title: books.title,
      timestamp: books.createdAt,
    });

  return result;
}

export async function getBooks(
  filter?: Partial<
    Omit<typeof books.$inferSelect, "coverUrl" | "createdAt" | "updatedAt">
  > & {
    searchString?: string;
    publishedYearFrom?: number;
    publishedYearUntil?: number;
    pageIndex?: number;
    pageSize?: number;
  },
): Promise<{ books: ReturnedBookWithCategoryNameType[]; totalCount: number }> {
  const conditions: any[] = [];

  if (filter?.id) {
    conditions.push(eq(books.id, filter.id));
  } else {
    if (filter?.title) {
      conditions.push(ilike(books.title, `%${filter.title}%`));
    }
    if (filter?.author) {
      conditions.push(ilike(books.author, `%${filter.author}%`));
    }
    if (filter?.publisher) {
      conditions.push(ilike(books.publisher, `%${filter.publisher}%`));
    }

    if (filter?.year) {
      conditions.push(eq(books.year, filter.year));
    } else {
      if (filter?.publishedYearFrom) {
        conditions.push(gte(books.year, filter.publishedYearFrom));
      }
      if (filter?.publishedYearUntil) {
        conditions.push(lte(books.year, filter.publishedYearUntil));
      }
    }

    if (filter?.edition) {
      conditions.push(eq(books.edition, filter.edition));
    }
    if (filter?.categoryId) {
      conditions.push(eq(books.categoryId, filter.categoryId));
    }

    const hasFieldFilter =
      filter?.title ||
      filter?.author ||
      filter?.publisher ||
      filter?.year ||
      filter?.publishedYearFrom ||
      filter?.publishedYearUntil ||
      filter?.edition ||
      filter?.categoryId;

    if (!hasFieldFilter && filter?.searchString) {
      const searchConditions = [
        ilike(books.title, `%${filter.searchString}%`),
        ilike(books.author, `%${filter.searchString}%`),
        ilike(books.publisher, `%${filter.searchString}%`),
        ilike(books.description, `%${filter.searchString}%`),
      ];

      const searchNum = parseInt(filter.searchString);
      if (!isNaN(searchNum)) {
        searchConditions.push(eq(books.year, searchNum));
        searchConditions.push(eq(books.edition, searchNum));
        searchConditions.push(eq(books.totalCopies, searchNum));
        searchConditions.push(eq(books.availableCopies, searchNum));
      }

      conditions.push(or(...searchConditions));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalCountResult = await db
    .select({ count: count(books.id) })
    .from(books)
    .where(whereClause);

  const totalCount = totalCountResult[0]!.count;

  const pageIndex = filter?.pageIndex ?? 0;
  const pageSize = filter?.pageSize ?? 10;

  const booksResult = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      publisher: books.publisher,
      year: books.year,
      edition: books.edition,
      description: books.description,
      categoryId: books.categoryId,
      categoryName: categories.name,
      coverUrl: books.coverUrl,
      totalCopies: books.totalCopies,
      availableCopies: books.availableCopies,
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
    })
    .from(books)
    .innerJoin(categories, eq(books.categoryId, categories.id))
    .where(whereClause)
    .limit(pageSize)
    .offset(pageIndex * pageSize);

  return { books: booksResult, totalCount };
}

export async function getTotalBookCount(): Promise<number> {
  const result = await db.select({ count: count(books.id) }).from(books);

  return result[0]!.count;
}

export async function updateBook({
  bookId,
  updatedBookInfo,
}: {
  bookId: string;
  updatedBookInfo: {
    title?: string | undefined;
    author?: string | undefined;
    publisher?: string | undefined;
    year?: number | undefined;
    edition?: number | undefined;
    description?: string | undefined;
    categoryId?: string | undefined;
    coverUrl?: string | undefined;
    totalCopies?: number | undefined;
  };
}): Promise<ReturnedBookType> {
  const result = await db
    .update(books)
    .set(updatedBookInfo)
    .where(eq(books.id, bookId))
    .returning();

  return result[0];
}

export async function deleteBook({
  bookId,
}: {
  bookId: string;
}): Promise<{ bookId: string; title: string; timestamp: Date }> {
  const result = await db.delete(books).where(eq(books.id, bookId)).returning({
    bookId: books.id,
    title: books.title,
    timestamp: books.createdAt,
  });

  return result[0];
}
