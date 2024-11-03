const express = require("express");
const db = require("../config/db"); // Sesuaikan dengan path yang benar ke file db Anda
const router = express.Router();
const multer = require("multer");
const path = require("path"); // Tambahkan ini
const fs = require("fs");

// Set up multer for video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./videos/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
  },
});

const upload = multer({ storage: storage });

// Store uploaded videos in an array (this can be a database in a real app)
let videos = [];

// membaca halaman admin
router.get("/admin", (req, res) => {
  const queryCurhat = `
        SELECT curhat.id_curhat, curhat.pencurhat, curhat.subjek, curhat.pesan_curhat, jawaban.jawaban_text
        FROM curhat
        LEFT JOIN jawaban ON curhat.id_curhat = jawaban.id_curhat
    `;
  const queryCerpen = "SELECT * FROM cerpen";
  const queryFilm = "SELECT * FROM film";
  const queryTentangKami =
    "SELECT * FROM tentang ORDER BY id_tentang DESC LIMIT 1";
  const queryMisi = "SELECT * FROM misi";
  const queryTim = "SELECT * FROM tim";

  db.query(queryCurhat, (err, curhatResults) => {
    if (err) throw err;

    db.query(queryCerpen, (err, cerpenResults) => {
      if (err) throw err;

      db.query(queryFilm, (err, filmResults) => {
        if (err) throw err;

        db.query(queryTentangKami, (err, tentangResults) => {
          if (err) throw err;

          const tentangKami = tentangResults[0]; // Ambil entri terbaru

          db.query(queryMisi, (err, misiResults) => {
            if (err) throw err;

            db.query(queryTim, (err, timResults) => {
                if(err) throw err;

            res.render("admin", {
              user: req.session.user,
              curhat: curhatResults,
              berita: cerpenResults,
              film: filmResults,
              tentangKami: tentangKami, // Kirim ke template
              misi: misiResults,
              tim: timResults
            });
          });
        });
        });
      });
    });
  });
});

// membuat jawaban untuk pesan curhat
router.post("/jawaban", (req, res) => {
  const { id_curhat, jawaban_text } = req.body;

  if (!id_curhat || !jawaban_text) {
    return res.status(400).send("ID curhat dan jawaban harus diisi.");
  }

  // Cek apakah id_curhat ada di tabel curhat
  const checkQuery = "SELECT * FROM curhat WHERE id_curhat = ?";
  db.query(checkQuery, [id_curhat], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Terjadi kesalahan pada server.");
    }

    if (results.length === 0) {
      return res.status(400).send("ID curhat tidak ditemukan.");
    }

    // Jika ditemukan, masukkan jawaban ke tabel jawaban
    const insertQuery =
      "INSERT INTO jawaban (id_curhat, jawaban_text) VALUES (?, ?)";
    db.query(insertQuery, [id_curhat, jawaban_text], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Terjadi kesalahan pada server.");
      }
      res.redirect("/admin");
    });
  });
});

// Route untuk update jawaban
router.post("/edit/:id_curhat", (req, res) => {
  const { id_curhat } = req.params;
  const { jawaban_text } = req.body;

  const updateQuery = "UPDATE jawaban SET jawaban_text = ? WHERE id_curhat = ?";
  db.query(updateQuery, [jawaban_text, id_curhat], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Terjadi kesalahan pada server.");
    }
    res.redirect("/admin");
  });
});

// menghapus curhat berdasarkan id
router.post("/hapus/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM curhat WHERE id_curhat = ?", [id], (err, result) => {
    if (err) throw err;
    res.redirect("/admin");
  });
});

// menghapus cerpen berdasarkan id
router.post("/hapus-cerpen/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM cerpen WHERE id_cerpen = ?", [id], (err, result) => {
    if (err) throw err;
    res.redirect("/admin");
  });
});

// edit halaman film untuk user
router.post("/admin/update/:id_film", upload.single("video"), (req, res) => {
  const { id_film } = req.params;
  const { judul_film, sinopsis } = req.body;

  // query edit judul dan sinposis
  let updateQuery = "UPDATE film SET judul_film = ?, sinopsis = ?";
  let queryParams = [judul_film, sinopsis];

  // memeriksa jika ada video baru 
  if (req.file) {
    updateQuery += ", video_film = ?";
    queryParams.push(req.file.filename); // input filename ke parameter
  }

  // edit rincian terkait film yang diinginkan
  updateQuery += " WHERE id_film = ?";
  queryParams.push(id_film); // input ke parameter

  db.query(updateQuery, queryParams, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Terjadi kesalahan pada server.");
    }
    res.redirect("/admin");
  });
});

// menambah film ke user
router.post("/admin/upload", upload.single("video"), (req, res) => {
  const { judul_film, sinopsis } = req.body; // Ambil title dan synopsis dari body
  if (req.file) {
    // Simpan informasi video ke database
    const film = {
      judul_film: judul_film,
      sinopsis: sinopsis,
      video_film: req.file.filename,
    };
    db.query("INSERT INTO film SET ?", film, (err, result) => {
      if (err) throw err;
      res.redirect("/admin"); // Redirect to admin page
    });
  } else {
    res.status(400).send("No file uploaded.");
  }
});

// untuk menghapus film dari halaman user
router.post("/admin/hapus/:id_film", (req, res) => {
  const { id_film } = req.params;

  // Query untuk mendapatkan nama file video dari database berdasarkan id_film
  const getFilmQuery = "SELECT video_film FROM film WHERE id_film = ?";
  db.query(getFilmQuery, [id_film], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Terjadi kesalahan pada server.");
    }

    if (results.length > 0) {
      const videoFile = results[0].video_film;
      const videoPath = path.join(__dirname, "../videos", videoFile);

      // Hapus data film dari database
      const deleteQuery = "DELETE FROM film WHERE id_film = ?";
      db.query(deleteQuery, [id_film], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Terjadi kesalahan pada server.");
        }

        // Cek apakah file video ada dan hapus dari server
        fs.unlink(videoPath, (fsErr) => {
          if (fsErr && fsErr.code !== "ENOENT") {
            // ENOENT berarti file tidak ditemukan
            console.error("Gagal menghapus video:", fsErr);
          }
          res.redirect("/admin"); // Redirect ke halaman admin setelah penghapusan
        });
      });
    } else {
      res.status(404).send("Film tidak ditemukan.");
    }
  });
});

// hapus misi
router.get("/hapus_misi/:id_misi", (req, res) => {
  const { id_misi } = req.params;

  db.query("DELETE FROM misi WHERE id_misi = ?", [id_misi], (err, result) => {
    if (err) throw err;
    res.redirect("/admin"); // Redirect ke halaman login setelah hapus
  });
});

// hapus tim
router.get("/hapus_tim/:id_tim", (req, res) => {
    const { id_tim } = req.params;
  
    db.query("DELETE FROM tim WHERE id_tim = ?", [id_tim], (err, result) => {
      if (err) throw err;
      res.redirect("/admin"); // Redirect ke halaman login setelah hapus
    });
  });

module.exports = router;
