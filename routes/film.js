const express = require("express");
const db = require("../config/db"); // Sesuaikan dengan path ke file db Anda
const router = express.Router();

// membaca halaman film
router.get('/film', (req, res) => {
    if (req.session.user) {
        const videoQuery = 'SELECT * FROM film';
        const komentarQuery = 'SELECT * FROM komentar';

        db.query(videoQuery, (err, filmResults) => {
            if (err) throw err;

            db.query(komentarQuery, (err, komentarResults) => {
                if (err) throw err;

                // Mengirim data film dan komentar ke halaman
                res.render("film", { user: req.session.user, videos: filmResults, komentar: komentarResults });
            });
        });
    } else {
        res.redirect("/login_user");
    }
});

// proses menambah komentar
router.post('/tambah_komentar', (req, res) => {
    const { nama_komentar, isi_komentar, id_film } = req.body;
    const query = 'INSERT INTO komentar (nama_komentar, isi_komentar, id_film) VALUES (?, ?, ?)';
    db.query(query, [nama_komentar, isi_komentar, id_film], (err, result) => {
        if (err) throw err;
        res.redirect('/film'); 
    });
});

module.exports = router;
