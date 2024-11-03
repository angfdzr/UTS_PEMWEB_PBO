const express = require("express");
const db = require("../config/db");
const router = express.Router();
const nodemailer = require("nodemailer");
require('dotenv').config();

// membaca halaman curhat
router.get("/curhat_user", (req, res) => {
    if (req.session.user) {
      res.render("curhat_user", { user: req.session.user });
    } else {
      res.redirect("/index"); // Jika tidak ada session user, redirect ke halaman index
    }
});

// proses menambah isi curhat
router.post('/curhat', (req, res) => {
    const { pencurhat, subjek, pesan_curhat } = req.body;

    db.query("INSERT INTO curhat ( pencurhat, subjek, pesan_curhat ) VALUES ( ?, ?, ?)", [
        pencurhat,
        subjek,
        pesan_curhat,
    ],
    (err, result) => {
        if (err) throw err;
        res.redirect("/curhat_user");
    }
);

    // Mengatur transporter untuk Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Pengaturan email
    const mailOptions = {
        from: subjek,
        to: 'anggafadzar21@upi.edu', // Ganti dengan email Anda
        subject: `Curhat dari ${pencurhat}`,
        text: pesan_curhat,
    };

    // Mengirim email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
        res.redirect('/curhat_user');
    });
});

module.exports = router;
