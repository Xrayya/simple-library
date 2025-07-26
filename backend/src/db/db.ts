import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

function db() {
  const client = postgres(process.env.DATABASE_URL!, { prepare: false });
  return drizzle({ client });
}

// async function pingDB() {
//   try {
//     const result = await db().execute(sql`SELECT version();`);
//     console.log("DB Connected. Version:", result[0].version);
//   } catch (err) {
//     console.error("DB Connection failed:", err);
//     process.exit(1);
//   }
// }
//
// pingDB();

export default db;
