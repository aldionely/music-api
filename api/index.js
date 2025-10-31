// Versi 3.0 - Perbaikan Final API
import { createClient } from '@vercel/kv';
import express from 'express';
import cors from 'cors';

// Initialize App
const app = express();

// Initialize KV client
// Otomatis membaca environment variables dari Vercel
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Middleware
app.use(express.json());
app.use(cors());

/*
 * Endpoint #1: PLAYLIST
 * =======================
 */

// GET: Mengambil playlist dari KV
app.get('/api/playlist', async (req, res) => {
  try {
    let playlist = await kv.get('playlist');
    if (!playlist || playlist.length === 0) {
      // Sediakan playlist default jika belum ada
      playlist = [{ title: "Lagu Default (Set di Admin)", id: "rbxassetid://1842277490" }];
      await kv.set('playlist', playlist); // Simpan default
    }
    res.json({ lagu: playlist }); // Tetap kirim { lagu: [...] }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil playlist dari KV' });
  }
});

// POST: Menyimpan playlist baru (INI KODE YANG SUDAH DIPERBAIKI)
app.post('/api/playlist', async (req, res) => {
  try {
    // KITA SEKARANG MENERIMA ARRAY SECARA LANGSUNG DARI BODY
    const playlistArray = req.body; 

    if (!Array.isArray(playlistArray)) {
      return res.status(400).json({ error: "Input harus berupa array JSON" });
    }
    
    await kv.set('playlist', playlistArray); // Simpan array baru
    res.status(200).json({ message: "Playlist diperbarui!", playlist: playlistArray });
  } catch (error) {
    console.error(error); // Ini akan mencetak error KV jika ada
    res.status(500).json({ error: 'Gagal menyimpan playlist ke KV', details: error.message });
  }
});

/*
 * Endpoint #2: COMMAND (Perintah dari Admin)
 * ==========================================
 */
app.get('/api/command', async (req, res) => {
  try {
    let command = await kv.get('command');
    if (!command) {
      command = { action: "null" };
    }
    res.json(command);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil perintah dari KV' });
  }
});

app.post('/api/command', async (req, res) => {
  try {
    // req.body diharapkan: { "action": "skip" }
    await kv.set('command', req.body);
    res.status(200).json({ message: "Perintah diterima!", command: req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyimpan perintah ke KV' });
  }
});

app.delete('/api/command', async (req, res) => {
  try {
    await kv.set('command', { action: "null" });
    res.status(200).json({ message: "Perintah dibersihkan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal membersihkan perintah di KV' });
  }
});

/*
 * Endpoint #3: NOW PLAYING (Laporan dari Roblox)
 * ===============================================
 */
app.get('/api/now-playing', async (req, res) => {
  try {
    let nowPlaying = await kv.get('nowPlaying');
    if (!nowPlaying) {
      nowPlaying = { title: "Belum ada" };
    }
    res.json(nowPlaying);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil status dari KV' });
  }
});

app.post('/api/now-playing', async (req, res) => {
  try {
    // req.body diharapkan: { "title": "Judul Lagu" }
    await kv.set('nowPlaying', req.body);
    res.status(200).json({ message: "Status diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyimpan status ke KV' });
  }
});

// --- Ekspor Aplikasi ---
// Menggunakan sintaks ES Module
export default app;