import express from "express";
import { Pool } from "pg";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    );

    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title TEXT,
      content TEXT,
      date TEXT,
      image_url TEXT,
      likes INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT,
      description TEXT,
      date TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id SERIAL PRIMARY KEY,
      name TEXT,
      student TEXT,
      class TEXT,
      teaching_quality INTEGER,
      communication INTEGER,
      organization INTEGER,
      security INTEGER,
      pedagogical_activities INTEGER,
      staff_service INTEGER,
      comment TEXT,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS sponsors (
      id SERIAL PRIMARY KEY,
      business_name TEXT,
      username TEXT UNIQUE,
      password TEXT,
      media_url TEXT,
      media_type TEXT,
      ad_text TEXT,
      active INTEGER DEFAULT 0,
      subscription_start TEXT,
      subscription_duration_days INTEGER DEFAULT 30,
      payment_proof_url TEXT,
      payment_status TEXT DEFAULT 'none',
      created_at TEXT
    );
  `);

  // Seed admin if not exists
  const { rows: admins } = await pool.query("SELECT * FROM users WHERE username = $1", ["admin"]);
  if (admins.length === 0) {
    await pool.query("INSERT INTO users (username, password, role) VALUES ($1, $2, $3)", ["admin", "admin123", "admin"]);
  }

  // Initial settings
  const { rows: accessCount } = await pool.query("SELECT * FROM settings WHERE key = $1", ["access_count"]);
  if (accessCount.length === 0) {
    await pool.query("INSERT INTO settings (key, value) VALUES ($1, $2)", ["access_count", "0"]);
  }

  // Column migration for events
  try {
    await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT");
  } catch (e) {
    console.log("Migration (events image_url) skipped or failed:", (e as Error).message);
  }
}

const app = express();
app.use(express.json({ limit: '10mb' }));

let dbInitPromise: Promise<void> | null = null;
app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api')) return next();
  try {
    if (!dbInitPromise) dbInitPromise = initDb();
    await dbInitPromise;
    next();
  } catch (e) {
    console.error("DB Error:", e);
    res.status(500).json({ error: "Failed to connect to database" });
  }
});

const PORT = parseInt(process.env.PORT || '3000', 10);

  // API Routes
  app.get("/api/news", async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT * FROM news ORDER BY date DESC");
      res.json(rows);
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const { title, content, date, image_url } = req.body;
      const { rows } = await pool.query("INSERT INTO news (title, content, date, image_url) VALUES ($1, $2, $3, $4) RETURNING id", [title, content, date, image_url]);
      res.json({ id: rows[0].id });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/news/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await pool.query("UPDATE news SET likes = likes + 1 WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.delete("/api/news/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await pool.query("DELETE FROM news WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT * FROM events ORDER BY date ASC");
      res.json(rows);
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const { title, description, date, image_url } = req.body;
      const { rows } = await pool.query("INSERT INTO events (title, description, date, image_url) VALUES ($1, $2, $3, $4) RETURNING id", [title, description, date, image_url]);
      res.json({ id: rows[0].id });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await pool.query("DELETE FROM events WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.get("/api/evaluations", async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT * FROM evaluations ORDER BY date DESC");
      res.json(rows);
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/evaluations", async (req, res) => {
    try {
      const { name, student, class: className, teaching_quality, communication, organization, security, pedagogical_activities, staff_service, comment, date } = req.body;
      const { rows } = await pool.query(`
        INSERT INTO evaluations 
        (name, student, class, teaching_quality, communication, organization, security, pedagogical_activities, staff_service, comment, date) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
      `, [name, student, className, teaching_quality, communication, organization, security, pedagogical_activities, staff_service, comment, date]);
      res.json({ id: rows[0].id });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.delete("/api/evaluations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await pool.query("DELETE FROM evaluations WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT * FROM settings");
      const settingsObj = rows.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
      res.json(settingsObj);
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const { key, value } = req.body;
      await pool.query("INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [key, value]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  // --- ACCESS COUNTER ---
  app.post("/api/access", async (req, res) => {
    try {
      await pool.query("UPDATE settings SET value = (CAST(value AS INTEGER) + 1)::text WHERE key = 'access_count'");
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  // --- SPONSORS API ---

  app.get("/api/sponsors", async (req, res) => {
    try {
      const now = new Date().toISOString();
      const { rows } = await pool.query(`
        SELECT id, business_name, media_url, media_type, ad_text 
        FROM sponsors 
        WHERE active = 1 
        AND (
          subscription_start::timestamp + (subscription_duration_days * interval '1 day') >= $1::timestamp
        )
      `, [now]);
      res.json(rows);
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.get("/api/admin/sponsors", async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT * FROM sponsors ORDER BY created_at DESC");
      res.json(rows);
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/admin/sponsors", async (req, res) => {
    try {
      const { business_name } = req.body;
      const username = `patro_${Math.random().toString(36).substring(2, 7)}`;
      const password = Math.random().toString(36).substring(2, 10);
      const { rows } = await pool.query(`
        INSERT INTO sponsors (business_name, username, password, created_at, subscription_start, active) 
        VALUES ($1, $2, $3, $4, $5, 0) RETURNING id
      `, [business_name, username, password, new Date().toISOString(), new Date().toISOString()]);
      res.json({ id: rows[0].id, username, password });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/sponsors/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const { rows } = await pool.query("SELECT id, business_name FROM sponsors WHERE username = $1 AND password = $2", [username, password]);
      if (rows.length > 0) {
        res.json({ success: true, id: rows[0].id, business_name: rows[0].business_name });
      } else {
        res.status(401).json({ error: "Credenciais inválidas" });
      }
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.put("/api/sponsors/:id/media", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { mediaItems, ad_text } = req.body;
      await pool.query("UPDATE sponsors SET media_url = $1, media_type = $2, ad_text = $3 WHERE id = $4", 
        [JSON.stringify(mediaItems || []), 'json', ad_text, id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/sponsors/:id/payment-proof", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { payment_proof_url } = req.body;
      await pool.query("UPDATE sponsors SET payment_proof_url = $1, payment_status = 'pending' WHERE id = $2", [payment_proof_url, id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/admin/sponsors/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await pool.query(`
        UPDATE sponsors 
        SET active = 1, 
            payment_status = 'approved', 
            payment_proof_url = NULL,
            subscription_start = $1
        WHERE id = $2
      `, [new Date().toISOString(), id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.put("/api/admin/sponsors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { subscription_duration_days, active, business_name } = req.body;
      if (subscription_duration_days !== undefined) {
        await pool.query("UPDATE sponsors SET subscription_duration_days = $1 WHERE id = $2", [subscription_duration_days, id]);
      }
      if (active !== undefined) {
        await pool.query("UPDATE sponsors SET active = $1 WHERE id = $2", [active ? 1 : 0, id]);
      }
      if (business_name !== undefined) {
        await pool.query("UPDATE sponsors SET business_name = $1 WHERE id = $2", [business_name, id]);
      }
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.put("/api/sponsors/:id/name", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { business_name } = req.body;
      await pool.query("UPDATE sponsors SET business_name = $1 WHERE id = $2", [business_name, id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/admin/sponsors/:id/new-password", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const newPassword = Math.random().toString(36).substring(2, 10);
      await pool.query("UPDATE sponsors SET password = $1 WHERE id = $2", [newPassword, id]);
      res.json({ success: true, password: newPassword });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.delete("/api/admin/sponsors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await pool.query("DELETE FROM sponsors WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const { rows } = await pool.query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, password]);
      if (rows.length > 0) {
        res.json({ success: true, role: rows[0].role, username: rows[0].username });
      } else {
        res.status(401).json({ error: "Credenciais inválidas" });
      }
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/admin/update-credentials", async (req, res) => {
    try {
      const { currentUsername, newUsername, newPassword } = req.body;
      const result = await pool.query("UPDATE users SET username = $1, password = $2 WHERE username = $3", [newUsername, newPassword, currentUsername]);
      if ((result.rowCount ?? 0) > 0) {
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Falha ao atualizar credenciais" });
      }
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { comments } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key not configured" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise os seguintes comentários de pais sobre a escola e gere um breve relatório de transparência destacando pontos positivos e áreas de melhoria em português: \n\n${comments.join("\n")}`,
      });
      res.json({ analysis: response.text });
    } catch (error) {
      console.error("AI Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze comments" });
    }
  });

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    (async () => {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })();
  } else if (!process.env.VERCEL) {
    // Local production build serving
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

export default app;
