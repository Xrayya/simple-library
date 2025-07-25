import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle({ client });

// async function pingDB() {
//   try {
//     const result = await client`SELECT version();`;
//     console.log("DB Connected. Version:", result[0].version);
//     await client.end(); // penting untuk close connection
//   } catch (err) {
//     console.error("DB Connection failed:", err);
//     process.exit(1);
//   }
// }
//
// pingDB();

export default db;
