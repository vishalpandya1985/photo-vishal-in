const express = require('express');
const session = require('express-session');
const multer = require('multer');
const archiver = require('archiver');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const TRASH_DIR = path.join(__dirname, 'trash');
const USERS_FILE = path.join(__dirname, 'users.json');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(TRASH_DIR)) fs.mkdirSync(TRASH_DIR, { recursive: true });

// ====================================================================
// USERS — stored in users.json (created automatically on first run)
// Default admin login the first time: username "admin", password "admin123"
// Change the password right away from the Manage Users page once logged in.
// ====================================================================
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    const defaultAdmin = {
      username: 'admin',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin'
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify([defaultAdmin], null, 2));
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'change-this-to-any-random-string',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // stay logged in for 24 hours
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

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    req.session.username = user.username;
    req.session.role = user.role;
    return res.redirect('/');
  }
  res.redirect('/login.html?error=1');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

// Tell the frontend who's logged in (used to show/hide "Manage Users")
app.get('/me', requireLogin, (req, res) => {
  res.json({ username: req.session.username, role: req.session.role });
});

// Everything past this point requires login
app.use(requireLogin);
app.use(express.static(path.join(__dirname, 'public')));

// ====================================================================
// ADMIN: manage users
// ====================================================================
app.get('/admin/users', requireAdmin, (req, res) => {
  const users = loadUsers().map(u => ({ username: u.username, role: u.role }));
  res.json({ users });
});

app.post('/admin/users', requireAdmin, (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });
  const users = loadUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'That username already exists.' });
  }
  users.push({
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    role: role === 'admin' ? 'admin' : 'user'
  });
  saveUsers(users);
  res.json({ added: username });
});

app.delete('/admin/users/:username', requireAdmin, (req, res) => {
  const { username } = req.params;
  if (username === req.session.username) {
    return res.status(400).json({ error: "You can't delete your own account while logged in." });
  }
  let users = loadUsers();
  if (!users.find(u => u.username === username)) {
    return res.status(404).json({ error: 'User not found.' });
  }
  users = users.filter(u => u.username !== username);
  saveUsers(users);
  res.json({ deleted: username });
});

// ====================================================================
// FILES — shared by every logged-in user
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

app.listen(PORT, () => {
  loadUsers(); // make sure users.json + default admin exist
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`First-time login: username "admin", password "admin123" (change this from Manage Users)`);
});
