const express = require("express");
const db = require("../config/db"); // Sesuaikan dengan path yang benar ke file db Anda
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Tambahkan ini

// Konfigurasi multer untuk menyimpan gambar di folder 'images'
router.use('/images', express.static(path.join(__dirname, 'images')));
const storage = multer.diskStorage({
    destination: './images/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// membaca halaman cerpen
router.get('/cerpen_user', (req, res) => {
    if (req.session.user) {
        const query = "SELECT * FROM cerpen";
        db.query(query, (err, results) => {
            if (err) throw err;
            res.render('cerpen_user', { user: req.session.user, berita: results });
        });
    }
});

// proses menambah cerpen
router.post('/tambah-cerpen', upload.single('gambar_cerpen'), (req, res) => {
    const { judul_cerpen, sinopsis, isi_cerpen } = req.body;
    const gambar_cerpen = '/images/' + req.file.filename; // Perbaiki ini

    const query = 'INSERT INTO cerpen (judul_cerpen, sinopsis, isi_cerpen, gambar_cerpen) VALUES (?, ?, ?, ?)';
    db.query(query, [judul_cerpen, sinopsis, isi_cerpen, gambar_cerpen], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saat mengunggah cerita');
        }
        res.redirect('/cerpen_user');
    });
});

// membaca detail salah satu cerpen
router.get('/cerpen_lengkap/:id_cerpen', (req, res) => {
    if (req.session.user) {
        const query = "SELECT * FROM cerpen WHERE id_cerpen = ?";
        db.query(query, [req.params.id_cerpen], (err, results) => {
            if (err) throw err;
            res.render('cerpen_lengkap', { user: req.session.user, berita: results[0] });
        });
    }
});


module.exports = router;
