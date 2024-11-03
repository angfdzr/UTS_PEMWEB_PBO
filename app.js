const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const fs = require('fs');

const app = express();
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/img', express.static(path.join(__dirname, 'img')));
// Konfigurasi multer untuk menyimpan gambar di folder 'uploads'
const storage = multer.diskStorage({
  destination: './images/',
  filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Set up multer for video upload
const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './videos/');
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
  }
});

const upload1 = multer({ storage: storage1 });

// Store uploaded videos in an array (this can be a database in a real app)
let videos = [];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/profile');
const curhatRoutes = require('./routes/curhat');
const adminRoutes = require('./routes/admin');
const cerpenRoutes = require('./routes/cerpen');
const authFilm = require('./routes/film');
const authtentang = require('./routes/tentang');

app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', curhatRoutes);
app.use('/', adminRoutes);
app.use('/', cerpenRoutes);
app.use('/', authFilm);
app.use('/', authtentang);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
