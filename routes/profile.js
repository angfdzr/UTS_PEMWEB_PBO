const express = require("express");
const db = require("../config/db"); 
const router = express.Router();

// Rute untuk menampilkan halaman profil pengguna
router.get("/profile_user", (req, res) => {
  if (req.session.user) {
      const queryCurhat = `
          SELECT curhat.id_curhat, curhat.pencurhat, curhat.subjek, curhat.pesan_curhat, jawaban.jawaban_text
        FROM curhat
        LEFT JOIN jawaban ON curhat.id_curhat = jawaban.id_curhat
      `;

      db.query(queryCurhat, [req.session.user.username], (err, curhatResults) => {
          if (err) {
              console.error(err);
              return res.status(500).send("Error retrieving curhat.");
          }

          res.render("profile_user", { user: req.session.user, curhat: curhatResults || [] });
      });
  } else {
      res.redirect("/index"); // Jika tidak ada session user, redirect ke halaman index
  }
});

// Rute untuk mengedit informasi pengguna
router.post("/profile_user/edit/:id_user", (req, res) => {
  console.log("Edit request received for ID:", req.params.id); // Debugging
  const { namaLengkap, email, username, no_telepon, country, city, province } = req.body;
  const { id_user } = req.params;

  db.query(
    "UPDATE users SET namaLengkap = ?, email = ?, username = ?, no_telepon = ?, country = ?, city = ?, province = ? WHERE id_user = ?",
    [namaLengkap, email, username, no_telepon, country, city, province, id_user],
    (err, result) => {
      if (err) {
        console.error(err); // Debugging
        return res.status(500).send("Error updating user.");
      }
      res.redirect("/login_user");
    }
  );
});

// Rute untuk menghapus pengguna
router.post("/delete/:id_user", (req, res) => {
  const { id_user } = req.params;

  db.query("DELETE FROM users WHERE id_user = ?", [id_user], (err, result) => {
    if (err) throw err;
    res.redirect("/login_user"); // Redirect ke halaman login setelah hapus
  });
});

module.exports = router;
