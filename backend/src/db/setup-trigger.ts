import { sql } from "drizzle-orm";
import db from "./db";

const up = async () => {
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await db.execute(sql`
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON book
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

up()
  .then(() => {
    console.log("Trigger created successfully");
  })
  .catch((error) => {
    console.error("Error creating trigger:", error);
  });
