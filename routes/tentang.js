const express = require("express");
const db = require("../config/db"); 
const router = express.Router();
const multer = require("multer");
const path = require("path"); 
const fs = require("fs"); // untuk menghapus gambar dari database dan folder

// Konfigurasi multer untuk menyimpan gambar di folder 'images'
router.use("/images", express.static(path.join(__dirname, "images")));
const storage = multer.diskStorage({
  destination: "./images/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.get("/tentang", (req, res) => {
  const queryTentangKami =
    "SELECT * FROM tentang ORDER BY id_tentang DESC LIMIT 1";
  const queryMisi = "SELECT * FROM misi";
  const queryTim = "SELECT * FROM tim";
  db.query(queryTentangKami, (err, tentangResults) => {
    if (err) throw err;

    db.query(queryMisi, (err, misiResults) => {
      const tentangKami = tentangResults[0]; // Ambil entri terbaru

      db.query(queryTim, (err, timResults) => {
        if (err) throw err;
        if (req.session.user) {
          res.render("tentang", {
            user: req.session.user,
            tentangKami: tentangKami, // Kirim ke template
            misi: misiResults,
            tim: timResults
          });
        }
      });
    });
  });
});

// untuk mengatur tentang kami
// proses menambah
router.post("/tentang_kami", (req, res) => {
  const { deskripsi_singkat, sejarah, visi } = req.body;
  const query =
    "INSERT INTO tentang (deskripsi_singkat, sejarah, visi) VALUES (?, ?, ?)";
  db.query(query, [deskripsi_singkat, sejarah, visi], (err, result) => {
    if (err) throw err;
    res.redirect("/admin"); // Sesuaikan dengan halaman film
  });
});

// proses menambah
router.post("/misi", (req, res) => {
  const { misinya } = req.body; // Memastikan req.body terdefinisi
  const query = "INSERT INTO misi (misinya) VALUES (?)";

  db.query(query, [misinya], (err, result) => {
    if (err) {
      console.error(err); // Debugging
      return res.status(500).send("Error inserting mission.");
    }
    res.redirect("/admin");
  });
});

// proses menambah
router.post("/tim_kami", upload.single("gambar_tim"), (req, res) => {
  const { nama_tim, posisi, desk_tim } = req.body;
  const gambar_tim = "/images/" + req.file.filename;

  const query =
    "INSERT INTO tim (nama_tim, posisi, desk_tim, gambar_tim) VALUES (?, ?, ?, ?)";
  db.query(query, [nama_tim, posisi, desk_tim, gambar_tim], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error saat mengunggah cerita");
    }
    res.redirect("/admin");
  });
});

// proses mengedit
router.post("/edit_tim/:id_tim", upload.single("gambar_tim"), (req, res) => {
    const id_tim = req.params.id_tim; // Perbaiki dengan req.params.id_tim
    const { nama_tim, posisi, desk_tim } = req.body;
    
    // Jika gambar baru diunggah
    let gambar_tim = req.file ? "/images/" + req.file.filename : null;

    // Jika gambar baru tidak diunggah, ambil gambar lama dari database
    const selectQuery = "SELECT gambar_tim FROM tim WHERE id_tim = ?";
    db.query(selectQuery, [id_tim], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching existing image.");
        }
        
        // Jika tidak ada gambar baru, gunakan gambar lama
        if (!gambar_tim) {
            gambar_tim = results[0].gambar_tim; // Ambil gambar lama
        }

        // Update data anggota tim
        const updateQuery = "UPDATE tim SET nama_tim = ?, posisi = ?, desk_tim = ?, gambar_tim = ? WHERE id_tim = ?";
        db.query(updateQuery, [nama_tim, posisi, desk_tim, gambar_tim, id_tim], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error updating team member.");
            }
            res.redirect("/admin");
        });
    });
});

// proses mengedit
router.post("/edit/tentang_kami/:id_tentang", (req, res) => {
  const { id_tentang } = req.params;
  const { deskripsi_singkat, sejarah, visi } = req.body;

  // Memastikan query dieksekusi dengan benar
  const query =
    "UPDATE tentang SET deskripsi_singkat = ?, sejarah = ?, visi = ? WHERE id_tentang = ?";
  db.query(
    query,
    [deskripsi_singkat, sejarah, visi, id_tentang],
    (err, result) => {
      if (err) {
        console.error(err); // Debugging
        return res.status(500).send("Error updating user.");
      }
      res.redirect("/admin");
    }
  );
});

module.exports = router;
