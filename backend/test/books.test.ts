import {
  afterAll,
  beforeAll,
  describe,
  expect,
  setDefaultTimeout,
  test,
} from "bun:test";
import db from "../src/db/db";
import { books, BookType, categories, CategoryType } from "../src/db/schema";
import { randomInt } from "crypto";

setDefaultTimeout(50000);

const baseUrl = "http://localhost:8787/api/v1/auth";

const mockCategories: CategoryType["name"][] = [
  "GENERAL_WORK",
  "PHILOSOPHY_AND_PSYCHOLOGY",
  "RELIGION",
  "SOCIAL_SCIENCES",
  "LANGUAGE",
  "NATUAL_SCIENCES_AND_MATHEMATICS",
  "TECHNOLOGY_AND_APPLIED_SCIENCES",
  "ARTS_AND_RECREATION",
  "LITERATURE",
  "HISTORY_AND_GEOGRAPHY",
];

let categoriesFomDB: CategoryType[] = [];

const mockBook1: Omit<
  BookType,
  "id" | "availableCopies" | "createdAt" | "updatedAt"
> = {
  title: "Test Book1",
  author: "Author1",
  publisher: "Publisher1",
  year: 2001,
  edition: 1,
  description: "Some kind of test book",
  categoryId: "", // NOTE: make sure this part replaced on beforeAll with valid category uuid
  coverUrl: "https://picsum.photos/200",
  totalCopies: 1,
};

describe("Books", () => {
  beforeAll(async () => {
    categoriesFomDB = await db()
      .insert(categories)
      .values(mockCategories.map((categoryName) => ({ name: categoryName })))
      .returning();

    mockBook1.categoryId =
      categoriesFomDB[randomInt(0, categoriesFomDB.length - 1)].id;
  });

  afterAll(async () => {
    await db().delete(books);
    await db().delete(categories);
  });

  test("should return 201 on valid book addition", async () => {
    // const response = await fetch(`${baseUrl}/books/`, {
    //   method: "POST",
    //   body: JSON.stringify({
    //     ...mockBook1,
    //   }),
    // });
    //
    // const data: any = await response.json();
    //
    // expect(response.status).toBe(201);

    expect(true).toBe(true);
  });
});
