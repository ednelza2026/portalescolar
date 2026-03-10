import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("school_portal.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    date TEXT,
    image_url TEXT,
    likes INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
const admin = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!admin) {
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", "admin123", "admin");
}

// Initial settings
const accessCount = db.prepare("SELECT * FROM settings WHERE key = ?").get("access_count");
if (!accessCount) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("access_count", "0");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/news", (req, res) => {
    const news = db.prepare("SELECT * FROM news ORDER BY date DESC").all();
    res.json(news);
  });

  app.post("/api/news", (req, res) => {
    const { title, content, date, image_url } = req.body;
    const result = db.prepare("INSERT INTO news (title, content, date, image_url) VALUES (?, ?, ?, ?)").run(title, content, date, image_url);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/news/:id/like", (req, res) => {
    db.prepare("UPDATE news SET likes = likes + 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/news/:id", (req, res) => {
    db.prepare("DELETE FROM news WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/events", (req, res) => {
    const events = db.prepare("SELECT * FROM events ORDER BY date ASC").all();
    res.json(events);
  });

  app.post("/api/events", (req, res) => {
    const { title, description, date } = req.body;
    const result = db.prepare("INSERT INTO events (title, description, date) VALUES (?, ?, ?)").run(title, description, date);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/events/:id", (req, res) => {
    db.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/evaluations", (req, res) => {
    const evaluations = db.prepare("SELECT * FROM evaluations ORDER BY date DESC").all();
    res.json(evaluations);
  });

  app.post("/api/evaluations", (req, res) => {
    const { name, student, class: className, teaching_quality, communication, organization, security, pedagogical_activities, staff_service, comment, date } = req.body;
    const result = db.prepare(`
      INSERT INTO evaluations 
      (name, student, class, teaching_quality, communication, organization, security, pedagogical_activities, staff_service, comment, date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, student, className, teaching_quality, communication, organization, security, pedagogical_activities, staff_service, comment, date);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/evaluations/:id", (req, res) => {
    db.prepare("DELETE FROM evaluations WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsObj = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    res.json(settingsObj);
  });

  app.post("/api/settings", (req, res) => {
    const { key, value } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
    res.json({ success: true });
  });

  // --- ACCESS COUNTER ---
  app.post("/api/access", (req, res) => {
    db.prepare("UPDATE settings SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT) WHERE key = 'access_count'").run();
    res.json({ success: true });
  });

  // --- SPONSORS API ---

  // Public: Get only active and non-expired sponsors
  app.get("/api/sponsors", (req, res) => {
    const now = new Date().toISOString();
    // Logic: active=1 AND (start + duration) >= now
    const sponsors = db.prepare(`
      SELECT id, business_name, media_url, media_type, ad_text 
      FROM sponsors 
      WHERE active = 1 
      AND (
        julianday(subscription_start) + subscription_duration_days >= julianday(?)
      )
    `).all(now);
    res.json(sponsors);
  });

  // Admin: List all sponsors
  app.get("/api/admin/sponsors", (req, res) => {
    const sponsors = db.prepare("SELECT * FROM sponsors ORDER BY created_at DESC").all();
    res.json(sponsors);
  });

  // Admin: Create sponsor
  app.post("/api/admin/sponsors", (req, res) => {
    const { business_name } = req.body;
    const username = `patro_${Math.random().toString(36).substring(2, 7)}`;
    const password = Math.random().toString(36).substring(2, 10);
    const result = db.prepare(`
      INSERT INTO sponsors (business_name, username, password, created_at, subscription_start, active) 
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(business_name, username, password, new Date().toISOString(), new Date().toISOString());
    res.json({ id: result.lastInsertRowid, username, password });
  });

  // Sponsor: Login
  app.post("/api/sponsors/login", (req, res) => {
    const { username, password } = req.body;
    const sponsor = db.prepare("SELECT id, business_name FROM sponsors WHERE username = ? AND password = ?").get(username, password);
    if (sponsor) {
      res.json({ success: true, id: sponsor.id, business_name: sponsor.business_name });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  });

  // Sponsor: Update media/text
  app.put("/api/sponsors/:id/media", (req, res) => {
    // Instead of single media_url/type, accept an array of media objects
    const { mediaItems, ad_text } = req.body;
    db.prepare("UPDATE sponsors SET media_url = ?, media_type = ?, ad_text = ? WHERE id = ?")
      .run(JSON.stringify(mediaItems || []), 'json', ad_text, req.params.id);
    res.json({ success: true });
  });

  // Sponsor: Send payment proof
  app.post("/api/sponsors/:id/payment-proof", (req, res) => {
    const { payment_proof_url } = req.body;
    db.prepare("UPDATE sponsors SET payment_proof_url = ?, payment_status = 'pending' WHERE id = ?")
      .run(payment_proof_url, req.params.id);
    res.json({ success: true });
  });

  // Admin: Approve payment
  app.post("/api/admin/sponsors/:id/approve", (req, res) => {
    db.prepare(`
      UPDATE sponsors 
      SET active = 1, 
          payment_status = 'approved', 
          payment_proof_url = NULL,
          subscription_start = ?
      WHERE id = ?
    `).run(new Date().toISOString(), req.params.id);
    res.json({ success: true });
  });

  // Admin: Update duration, status, or name
  app.put("/api/admin/sponsors/:id", (req, res) => {
    const { subscription_duration_days, active, business_name } = req.body;
    if (subscription_duration_days !== undefined) {
      db.prepare("UPDATE sponsors SET subscription_duration_days = ? WHERE id = ?").run(subscription_duration_days, req.params.id);
    }
    if (active !== undefined) {
      db.prepare("UPDATE sponsors SET active = ? WHERE id = ?").run(active ? 1 : 0, req.params.id);
    }
    if (business_name !== undefined) {
      db.prepare("UPDATE sponsors SET business_name = ? WHERE id = ?").run(business_name, req.params.id);
    }
    res.json({ success: true });
  });

  // Sponsor: Update Name
  app.put("/api/sponsors/:id/name", (req, res) => {
    const { business_name } = req.body;
    db.prepare("UPDATE sponsors SET business_name = ? WHERE id = ?").run(business_name, req.params.id);
    res.json({ success: true });
  });

  // Admin/Sponsor: New Password
  app.post("/api/admin/sponsors/:id/new-password", (req, res) => {
    const newPassword = Math.random().toString(36).substring(2, 10);
    db.prepare("UPDATE sponsors SET password = ? WHERE id = ?").run(newPassword, req.params.id);
    res.json({ success: true, password: newPassword });
  });

  // Admin: Delete
  app.delete("/api/admin/sponsors/:id", (req, res) => {
    db.prepare("DELETE FROM sponsors WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json({ success: true, role: user.role, username: user.username });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  });

  app.post("/api/admin/update-credentials", (req, res) => {
    const { currentUsername, newUsername, newPassword } = req.body;
    const result = db.prepare("UPDATE users SET username = ?, password = ? WHERE username = ?").run(newUsername, newPassword, currentUsername);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Falha ao atualizar credenciais" });
    }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    const { comments } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API Key not configured" });
    }

    try {
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
