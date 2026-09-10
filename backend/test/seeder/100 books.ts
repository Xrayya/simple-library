import { faker } from "@faker-js/faker";
import { db } from "../../src/db/db";
import { books, categories } from "../../src/db/schema";

async function main() {
  console.log("Seeding started...");

  // 1. Seed Categories
  const categoryNames = Array.from({ length: 10 }, () => ({
    name: faker.book.genre(),
  }));

  // Use unique names to avoid constraint violations
  const uniqueCategories = Array.from(
    new Set(categoryNames.map((c) => c.name)),
  ).map((name) => ({ name }));

  const insertedCategories = await db
    .insert(categories)
    .values(uniqueCategories)
    .returning({ id: categories.id });

  const categoryIds = insertedCategories.map((c) => c.id);
  console.log(`Inserted ${categoryIds.length} categories.`);

  // 2. Seed Books
  const booksToInsert = Array.from({ length: 100 }, () => {
    const totalCopies = faker.number.int({ min: 1, max: 20 });
    return {
      title: faker.book.title(),
      author: faker.book.author(),
      publisher: faker.company.name(),
      year: faker.date.past({ years: 50 }).getFullYear(),
      edition: faker.number.int({ min: 1, max: 10 }),
      description: faker.lorem.paragraph(),
      categoryId: faker.helpers.arrayElement(categoryIds),
      coverUrl: faker.image.url({
        height: 640,
        width: 480,
      }),
      totalCopies: totalCopies,
      availableCopies: faker.number.int({ min: 0, max: totalCopies }),
    };
  });

  await db.insert(books).values(booksToInsert);
  console.log("Inserted 100 books.");

  console.log("Seeding finished successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
