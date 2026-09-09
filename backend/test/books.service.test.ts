import {
  afterAll,
  beforeAll,
  describe,
  expect,
  setDefaultTimeout,
  test,
} from "bun:test";
import { db } from "../src/db/db";
import { books, categories } from "../src/db/schema";
import { deleteBook, getBooks, getTotalBookCount, insertBook, updateBook } from "../src/services/books";

setDefaultTimeout(20000);

let mockCategoryId: string;

const mockCategory = {
  name: "Science Fiction",
};

const mockBooks = [
  {
    title: "Dune",
    author: "Frank Herbert",
    publisher: "Chilton Books",
    year: 1965,
    edition: 1,
    description: "A science fiction masterpiece.",
    totalCopies: 5,
  },
  {
    title: "Dune Messiah",
    author: "Frank Herbert",
    publisher: "Putnam",
    year: 1969,
    edition: 1,
    description: "Second book in the Dune series.",
    totalCopies: 3,
  },
  {
    title: "Dune Messiah",
    author: "Frank Herbert",
    publisher: "Putnam",
    year: 1969,
    edition: 2, // Differs only in edition from the second book
    description: "Second book in the Dune series.",
    totalCopies: 3,
  },
];

let createdBookIds: string[] = [];

describe("Books Service", () => {
  beforeAll(async () => {
    const [cat] = await db
      .insert(categories)
      .values(mockCategory)
      .returning({ id: categories.id });
    mockCategoryId = cat.id;
  });

  afterAll(async () => {
    await db.delete(books);
    await db.delete(categories);
  });

  test("should insert a single book successfully", async () => {
    const result = await insertBook({
      ...mockBooks[0],
      categoryId: mockCategoryId,
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe(mockBooks[0].title);
    expect(result[0].bookId).toBeString();
    expect(result[0].timestamp).toBeDate();
    createdBookIds.push(result[0].bookId);
  });

  test("should insert remaining books successfully", async () => {
    for (const bookData of mockBooks.slice(1)) {
      const result = await insertBook({
        ...bookData,
        categoryId: mockCategoryId,
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe(bookData.title);
      expect(result[0].bookId).toBeString();
      expect(result[0].timestamp).toBeDate();
      createdBookIds.push(result[0].bookId);
    }
    expect(createdBookIds).toHaveLength(3);
  });

  test("should get books and verify every field", async () => {
    const booksList = await getBooks({ id: createdBookIds[0] });

    expect(booksList).toHaveLength(1);
    const book = booksList[0];
    
    expect(book.id).toBe(createdBookIds[0]);
    expect(book.title).toBe(mockBooks[0].title);
    expect(book.author).toBe(mockBooks[0].author);
    expect(book.publisher).toBe(mockBooks[0].publisher);
    expect(book.year).toBe(mockBooks[0].year);
    expect(book.edition).toBe(mockBooks[0].edition);
    expect(book.description).toBe(mockBooks[0].description);
    expect(book.categoryId).toBe(mockCategoryId);
    expect(book.categoryName).toBe(mockCategory.name);
    expect(book.coverUrl).toBeNull();
    expect(book.totalCopies).toBe(mockBooks[0].totalCopies);
    expect(book.availableCopies).toBe(mockBooks[0].totalCopies);
    expect(book.createdAt).toBeDate();
    expect(book.updatedAt).toBeNull();
  });

  test("should filter books by title and edition to distinguish similar entries", async () => {
    const results = await getBooks({ 
      title: "Dune Messiah",
      edition: 2 
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(createdBookIds[2]);
    expect(results[0].edition).toBe(2);
  });

  test("should filter books by year range", async () => {
    const results = await getBooks({
      publishedYearFrom: 1966,
      publishedYearUntil: 1970,
    });

    expect(results).toHaveLength(2); // Should return both Dune Messiah editions
    results.forEach((b) => {
      expect(b.year).toBe(1969);
      expect(b.title).toBe("Dune Messiah");
      expect(b.author).toBe("Frank Herbert");
      expect(b.publisher).toBe("Putnam");
    });
  });

  test("should get books via search string across multiple fields", async () => {
    const results = await getBooks({ searchString: "Putnam" });

    expect(results).toHaveLength(2);
    expect(results[0].publisher).toBe("Putnam");
  });

  test("should return total book count", async () => {
    const count = await getTotalBookCount();
    expect(count).toBe(3);
  });

  test("should update book information", async () => {
    const updatedTitle = "Dune: The Deluxe Edition";
    const updated = await updateBook({
      bookId: createdBookIds[0],
      updatedBookInfo: { title: updatedTitle },
    });

    expect(updated.id).toBe(createdBookIds[0]);
    expect(updated.title).toBe(updatedTitle);
  });

  test("should delete all books", async () => {
    for (const id of createdBookIds) {
      const deleted = await deleteBook({ bookId: id });
      expect(deleted.bookId).toBe(id);
    }

    const count = await getTotalBookCount();
    expect(count).toBe(0);
  });
});
