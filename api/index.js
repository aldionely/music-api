const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json()); // Membaca JSON body dari request (penting untuk POST)
app.use(cors());         // Mengizinkan request dari domain lain (panel admin)

// --- Database Sederhana (In-Memory) ---
// Di dunia nyata, ini akan diganti Vercel KV atau database lain.
let db = {
  playlist: [
    { title: "Lagu Pembuka", id: "rbxassetid://1842277490" }, // Contoh ID audio
    { title: "Melodi Santai", id: "rbxassetid://1837095163" }
  ],
  nowPlaying: { title: "Belum ada" },
  command: { action: "null" }
};
// ---------------------------------------

/*
 * Endpoint #1: PLAYLIST
 * - GET /api/playlist : Mengambil daftar putar saat ini
 * - POST /api/playlist : Mengganti seluruh daftar putar
 */
app.get('/api/playlist', (req, res) => {
  res.json({ lagu: db.playlist });
});

app.post('/api/playlist', (req, res) => {
  // req.body diharapkan berisi array: [{ title: "...", id: "..." }, ...]
  db.playlist = req.body;
  res.status(200).json({ message: "Playlist diperbarui!", playlist: db.playlist });
});

/*
 * Endpoint #2: COMMAND (Perintah dari Admin)
 * - GET /api/command : Di-poll oleh Roblox untuk cek perintah
 * - POST /api/command : Dipanggil panel admin untuk mengirim perintah (mis: skip)
 * - DELETE /api/command: Dipanggil Roblox untuk membersihkan perintah
 */
app.get('/api/command', (req, res) => {
  res.json(db.command);
});

app.post('/api/command', (req, res) => {
  // req.body diharapkan: { "action": "skip" }
  db.command = req.body;
  res.status(200).json({ message: "Perintah diterima!", command: db.command });
});

app.delete('/api/command', (req, res) => {
  db.command = { action: "null" };
  res.status(200).json({ message: "Perintah dibersihkan" });
});

/*
 * Endpoint #3: NOW PLAYING (Laporan dari Roblox)
 * - GET /api/now-playing : Dipanggil panel admin untuk melihat lagu saat ini
 * - POST /api/now-playing: Dipanggil Roblox untuk melapor
 */
app.get('/api/now-playing', (req, res) => {
  res.json(db.nowPlaying);
});

app.post('/api/now-playing', (req, res) => {
  // req.body diharapkan: { "title": "Judul Lagu" }
  db.nowPlaying = req.body;
  res.status(200).json({ message: "Status diperbarui" });
});

// --- Ekspor Aplikasi ---
// Ini penting agar Vercel bisa menjalankan aplikasi Anda sebagai Serverless Function
module.exports = app;