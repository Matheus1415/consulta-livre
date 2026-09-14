import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Erro: A variável DATABASE_URL não foi encontrada. Verifique seu arquivo .env!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const db = drizzle(pool);

async function runMigrate() {
  console.log("Aplicando migrations no banco de dados...");

  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("Migrations aplicadas com sucesso!");
  } catch (error) {
    console.error("Erro ao aplicar migrations:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigrate();