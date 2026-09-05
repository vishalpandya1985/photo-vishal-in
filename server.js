const express = require('express');
const session = require('express-session');
const multer = require('multer');
const archiver = require('archiver');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ====================================================================
// STORAGE PATHS
// On Railway, set UPLOAD_ROOT to your mounted volume path (e.g. /data)
// so files survive restarts/redeploys. Defaults to local folders for
// running on your own PC.
// ====================================================================
const ROOT = process.env.UPLOAD_ROOT || __dirname;
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const TRASH_DIR = path.join(ROOT, 'trash');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(TRASH_DIR)) fs.mkdirSync(TRASH_DIR, { recursive: true });

// ====================================================================
// MYSQL CONNECTION
// Set these as environment variables on your hosting platform
// (Railway auto-provides MYSQLHOST, MYSQLUSER, etc. when you add
// their MySQL plugin — this reads either naming style).
// ====================================================================
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'photo_vishal',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 5
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user'
    )
  `);
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
  if (rows[0].count === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      ['admin', hash, 'admin']
    );
    console.log('Created default admin user: admin / admin123');
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-to-any-random-string',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// --- Auth middleware ---
function requireLogin(req, res, next) {
  if (req.session && req.session.username) return next();
  if (req.path === '/login' || req.path === '/login.html') return next();
  if (req.method === 'GET') return res.redirect('/login.html');
  return res.status(401).json({ error: 'Not logged in.' });
}
function requireAdmin(req, res, next) {
  if (req.session && req.session.role === 'admin') return next();
  return res.status(403).json({ error: 'Admins only.' });
}

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  const user = rows[0];
  if (user && bcrypt.compareSync(password, user.password_hash)) {
    req.session.username = user.username;
    req.session.role = user.role;
    return res.redirect('/');
  }
  res.redirect('/login.html?error=1');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

app.get('/me', requireLogin, (req, res) => {
  res.json({ username: req.session.username, role: req.session.role });
});

// Any logged-in user can change their own password
app.post('/me/password', requireLogin, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'New password is too short.' });
  }
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [req.session.username]);
  const user = rows[0];
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }
  const newHash = bcrypt.hashSync(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = ? WHERE username = ?', [newHash, req.session.username]);
  res.json({ updated: true });
});

app.use(requireLogin);
app.use(express.static(path.join(__dirname, 'public')));

// ====================================================================
// ADMIN: manage users (now backed by MySQL)
// ====================================================================
app.get('/admin/users', requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT username, role FROM users');
  res.json({ users: rows });
});

app.post('/admin/users', requireAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });
  const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
  if (existing.length > 0) return res.status(400).json({ error: 'That username already exists.' });
  const hash = bcrypt.hashSync(password, 10);
  await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    [username, hash, role === 'admin' ? 'admin' : 'user']
  );
  res.json({ added: username });
});

// Admin can reset any user's password without knowing the old one
app.post('/admin/users/:username/reset-password', requireAdmin, async (req, res) => {
  const { username } = req.params;
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'New password is too short.' });
  }
  const newHash = bcrypt.hashSync(newPassword, 10);
  const [result] = await pool.query('UPDATE users SET password_hash = ? WHERE username = ?', [newHash, username]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found.' });
  res.json({ reset: username });
});

app.delete('/admin/users/:username', requireAdmin, async (req, res) => {
  const { username } = req.params;
  if (username === req.session.username) {
    return res.status(400).json({ error: "You can't delete your own account while logged in." });
  }
  const [result] = await pool.query('DELETE FROM users WHERE username = ?', [username]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found.' });
  res.json({ deleted: username });
});

// ====================================================================
// FILES — stored on disk/volume, shared by every logged-in user
// ====================================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeName}`);
  }
});
function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Only image and video files are allowed.'));
}
const upload = multer({ storage, fileFilter, limits: { fileSize: 500 * 1024 * 1024 } });

function fileTypeFor(name) {
  const ext = path.extname(name).toLowerCase();
  return ['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext) ? 'video' : 'image';
}

app.post('/upload', (req, res) => {
  upload.array('files', 50)(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded.' });
    res.json({ uploaded: req.files.map(f => ({ name: f.filename, originalName: f.originalname, size: f.size })) });
  });
});

app.get('/files', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, filenames) => {
    if (err) return res.status(500).json({ error: 'Could not list files.' });
    const files = filenames.map(name => {
      const stats = fs.statSync(path.join(UPLOAD_DIR, name));
      return { name, size: stats.size, uploadedAt: stats.mtime, type: fileTypeFor(name) };
    }).sort((a, b) => b.uploadedAt - a.uploadedAt);
    res.json({ files });
  });
});

app.get('/trash', (req, res) => {
  fs.readdir(TRASH_DIR, (err, filenames) => {
    if (err) return res.status(500).json({ error: 'Could not list trash.' });
    const files = filenames.map(name => {
      const stats = fs.statSync(path.join(TRASH_DIR, name));
      return { name, size: stats.size, deletedAt: stats.mtime, type: fileTypeFor(name) };
    }).sort((a, b) => b.deletedAt - a.deletedAt);
    res.json({ files });
  });
});

app.get('/files/:name', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, path.basename(req.params.name));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found.' });
  res.download(filePath);
});

app.post('/download-zip', (req, res) => {
  const names = req.body.names;
  if (!Array.isArray(names) || names.length === 0) return res.status(400).json({ error: 'No files specified.' });
  res.attachment('files.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', err => res.status(500).end(String(err)));
  archive.pipe(res);
  names.forEach(name => {
    const filePath = path.join(UPLOAD_DIR, path.basename(name));
    if (fs.existsSync(filePath)) archive.file(filePath, { name: path.basename(name) });
  });
  archive.finalize();
});

app.delete('/files/:name', (req, res) => {
  const safeName = path.basename(req.params.name);
  const src = path.join(UPLOAD_DIR, safeName);
  const dest = path.join(TRASH_DIR, safeName);
  if (!fs.existsSync(src)) return res.status(404).json({ error: 'File not found.' });
  fs.rename(src, dest, err => {
    if (err) return res.status(500).json({ error: 'Could not move file to trash.' });
    res.json({ trashed: safeName });
  });
});

app.post('/trash/:name/restore', (req, res) => {
  const safeName = path.basename(req.params.name);
  const src = path.join(TRASH_DIR, safeName);
  const dest = path.join(UPLOAD_DIR, safeName);
  if (!fs.existsSync(src)) return res.status(404).json({ error: 'File not found in trash.' });
  fs.rename(src, dest, err => {
    if (err) return res.status(500).json({ error: 'Could not restore file.' });
    res.json({ restored: safeName });
  });
});

app.delete('/trash/:name', (req, res) => {
  const filePath = path.join(TRASH_DIR, path.basename(req.params.name));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found in trash.' });
  fs.unlink(filePath, err => {
    if (err) return res.status(500).json({ error: 'Could not delete file.' });
    res.json({ deleted: req.params.name });
  });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MySQL / initialize database:', err.message);
    process.exit(1);
  });
