import { eq } from "drizzle-orm";
import db from "../db/db";
import { books, categories } from "../db/schema";

type ReturnedBookType = {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  year: number | null;
  edition: number | null;
  description: string | null;
  categoryName: string;
  coverUrl: string | null;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date | null;
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
}): Promise<{ id: string; title: string; timestamp: Date }[]> {
  const result = await db()
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
      id: books.id,
      title: books.title,
      timestamp: books.createdAt,
    });

  return result;
}

// WARNING: I just realized that these null optional is kinda dangerous
export async function getAllBooks(): Promise<ReturnedBookType[]> {
  const result = await db()
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      publisher: books.publisher,
      year: books.year,
      edition: books.edition,
      description: books.description,
      categoryName: categories.name,
      coverUrl: books.coverUrl,
      totalCopies: books.totalCopies,
      availableCopies: books.availableCopies,
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
    })
    .from(books)
    .innerJoin(categories, eq(books.categoryId, categories.id));

  return result;
}

export async function getBooksFiltered(): Promise<ReturnedBookType[]> {
  const result = await db()
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      publisher: books.publisher,
      year: books.year,
      edition: books.edition,
      description: books.description,
      categoryName: categories.name,
      coverUrl: books.coverUrl,
      totalCopies: books.totalCopies,
      availableCopies: books.availableCopies,
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
    })
    .from(books)
    .innerJoin(categories, eq(books.categoryId, categories.id));

  return result;
}
