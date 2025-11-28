require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require ('./db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const{authenticateToken, authorizeRole} =
require('./middleware/auth.js');

const app = express();
const PORT = process.env.PORT || 3300;
const JWT_SECRET = process.env.JWT_SECRET;

//===MIDDLEWARE===
app.use(cors());
app.use(express.json());

//===Routes===
app.get(`/status`, (req, res) => {
    res.json({ ok:true, service: `film-api`});
});

//=====AUTH ROLES=====
app.post(`/auth/register`, async (req, res, next) => {
    const {username, password} = req.body;
    if(!username || !password || password.length > 6) {
        return res.status(400).json({error: `Username dan Password harus berisi lebih dari 6 huruf`});
    } try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const sql = ` Insert into users (username, password, role) values ($1, $2, $3) Returning id, username`;
        const result = await db.query(sql, [username.toLowerCase(), hashedPassword, `user`]);
        res.status(201).json(result.rows[0]);
    } catch (err){
        if (err.code === `23505`) {
            return res.status(409).json({error: `Username sudah digunakan`});
        }
        next(err);
    }
});


app.use((req, res) => {
    res.status(500).json({error: `Rute tidak ditemukan`});
});

app.use((err, req, res, next) => {
    console.error(`[SERVER ERROR]`, err.stack);
    res.status(500).json({error: `Terjadi kesalahan pada Server`});
});

app.listen(PORT, `0.0.0.0`,() => {
    console.log(`Server Aktif di http://localhost:${PORT}`);
});