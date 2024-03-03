import { defineConfig, type Config } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/schema.ts",
  driver: "pg",
  out: "./drizzle",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  tablesFilter: ["bun-loconta_*"],
});
