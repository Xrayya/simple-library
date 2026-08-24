import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./relations";
import { env } from "../env";

const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle({ client, relations });

// async function pingDB() {
//   try {
//     const result = await db.execute(sql`SELECT version();`);
//     console.log("DB Connected. Version:", result[0].version);
//   } catch (err) {
//     console.error("DB Connection failed:", err);
//     process.exit(1);
//   }
// }
//
// pingDB();

