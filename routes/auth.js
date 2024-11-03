const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const router = express.Router();
const nodemailer = require("nodemailer"); // Tambahkan ini

// membaca halaman index jika belum login tidak bisa
router.get("/index", (req, res) => {
  if (req.session.user) {
    res.render("index", { user: req.session.user });
  } else {
    res.redirect("/login_user");
  }
});

// membaca halaman login
router.get("/login_user", (req, res) => {
  res.render("login_user");
});

// proses login
router.post("/login_user", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) throw err;

    if (result.length && bcrypt.compareSync(password, result[0].password)) {
      req.session.user = result[0];
      res.redirect("/index");
    } else {
      res.render("login_user", { error: "Invalid email or password" });
    }
  });
});

// membaca halaman registrasi
router.get("/registrasi_user", (req, res) => {
  res.render("registrasi_user");
});

// proses halaman registrasi
router.post("/registrasi_user", (req, res) => {
  const {
    namaLengkap,
    email,
    username,
    password,
    no_telepon,
    country,
    city,
    province,
  } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (namaLengkap, email, username, password, no_telepon, country, city, province) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      namaLengkap,
      email,
      username,
      hashedPassword,
      no_telepon,
      country,
      city,
      province,
    ],
    (err, result) => {
      if (err) throw err;
      res.redirect("/login_user");
    }
  );
});

// proses logout
  router.get('/logout', (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login_user');
      });
    });
  
  module.exports = router;  