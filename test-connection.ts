import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
console.log("Iniciando teste com a nova string do .env...");

if (!dbUrl) {
  console.log("ERRO: DATABASE_URL não encontrada!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log("Enviando query para o Neon com a nova senha...");
    const result = await pool.query("SELECT NOW()");
    console.log("CONECTADO COM SUCESSO!");
    console.log("Hora no banco:", result.rows[0].now);
    await pool.end();
  } catch (err: any) {
    console.error("FALHA PERSISTENTE:");
    console.error("Mensagem:", err.message);
  }
}

testConnection();
