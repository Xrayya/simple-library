import { db } from "../../src/db/db";
import {
    books,
    borrowLogs,
    categories,
    refreshTokens,
    users,
} from "../../src/db/schema";

async function main() {
  console.log("Cleaning started...");

  await db.delete(refreshTokens);
  await db.delete(borrowLogs);
  await db.delete(books);
  await db.delete(users);
  await db.delete(categories);

  console.log("Cleaning finished successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Cleaning failed:", err);
  process.exit(1);
});
