require('dotenv').config();
const express = require('express');
const cors = require(`cors`);
const db = require(`./database.js`);
const bcrypt = require(`bcryptjs`);
const jwt = require(`jsonwebtoken`);
const JWT_SECRET = process.env.JWT_SECRET;
const {authenticateToken, authorizeRole} = require(`./middleware/auth.js`); 

const app = express();
const PORT = process.env.PORT || 3200;

app.use(cors());
app.use(express.json());

app.get(`/status`, (req, res) => {
    res.json({oke: true, service:`film-api`});
});


app.post(`/auth/register`, (req, res) => {
    const {username, password} = req.body;
    if (!username || !password || password.length < 6)  {
        return res.status(400).json({error: `Username dan Password harus diisi (min 6 char)`});
    }
bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
        console.error("Error hashing:", err);
        return res.status(500).json({err: `Gagal Memproses Pendaftaran` });
    }

    const sql = `INSERT into users (username, password, role) values (?, ?,?)`;
    const params = [username.toLowerCase(), hashedPassword, `user`];
    db.run(sql, params, function(err){
        if (err){
            if(err.message.includes(`UNIQUE constraint`)){
                return res.status(409).json({error: `Username sudah Digunakan`});
            }
            console.error("Error inserting user:", err);
            return res.status(500).json({error: `Gagal menyimpan Pengguna`});
        }
        res.status(201).json({message: `Registrasi Berhasil`, userId: this.lastID});
    });
});
});

app.post(`/auth/register-admin`, (req, res) => {
    const {username, password} = req.body;
    if(!username || !password){
        return res.status(400).json({err: `Username dan password harus diisi`});
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if(err) {
            consoler.error("Error Hashing:", err);
            return res.status(500).json({err: `Gagal memproses pendaftaran`});
        }

        const sql = `Insert into users(username, password, role) values (?,?,?)`;
        const params =[username.toLowerCase(), hashedPassword, 'admin'];
    
        db.run(sql, params, function(err){
            if(err){
                if(err.message.includes(`UNIQUE`)){
                    return res.status(409).json({error: `username admin sudah ada`});
                }
                return res.status(500).json({error: err.message});
            }
            return res.status(201).json({message: `Admin berhasil dibuat`, userId:this.lastID});
        })
    })


});

app.post(`/auth/login`, (req, res) => {
    const {username, password} = req.body;
    if(!username || !password) {
        return res.status(400).json({error: `Username dan Password harus diisi`});
    }
    const sql ="Select * from users where username = ?";
    db.get(sql, [username.toLowerCase()], (err, user) => {
        if (err ||!user){
            return res.status(401).json({error: `Kredensial tidak valid`});
        };
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch){
                return res.status(401).json({error: `Kredensial tidak valid`});
            }
            const payload = {user: {id:user.id, username:user.username, role:user.role }};
            jwt.sign(payload, JWT_SECRET, {expiresIn: `1h`}, (err, token) => {
                if(err){
                    console.error("error Signing Token:", err);
                    return res.status(500).json({error: `Gagal Membuat Token`});
                }
                res.json({message:`Login Berhasil`, token:token});
            });
        });
    });
});


app.get(`/movies`, (req, res) => {
    const sql = "SELECT * FROM movies ORDER BY id ASC";

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        res.json(rows);
    });
});

app.get(`/directors`, (req, res) => {
    const sql = "SELECT * FROM directors ORDER BY id ASC";
    console.log(`Request POST/ Movie oleh user:`, req.user.username);
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        res.json(rows);
    });
});

app.get(`/movies/:id`, (req, res) => {
    const sql = "SELECT * FROM movies where id= ?";
    console.log(`Request POST/ Movie oleh user:`, req.user.username);
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({error : err.message});
        }
        if(!row) {
            return res.status(404).json({error: `Film tidak ditemukan`});
        }
        res.json(row);
    });
});

app.get(`/directors/:id`, (req, res) => {
    const sql = "SELECT * FROM directors where id= ?";
    console.log(`Request POST/ Movie oleh user:`, req.user.username);
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({error : err.message});
        }
        if(!row) {
            return res.status(404).json({error: `Director tidak ditemukan`});
        }
        res.json(row);
    });
});

app.post(`/movies`, authenticateToken, authorizeRole('admin','user'),(req, res) => {
    const{ title, director, year} = req.body;
    console.log(`Request POST/ Movie oleh user:`, req.user.username);
    if(!title|| !director ||!year){
        return res.status(400).json({err: `title/director/year kosong`});
    }

    const sql = `INSERT INTO movies (title, director, year) values(?, ?, ?)`;
    db.run(sql, [title, director, year], function(err){
        if(err) {
            return res.status(500).json({error:err.message});
        } 
        res.status(201).json({id:this.lastID, title, director, year});
    });
 });

 app.post(`/directors`, authenticateToken, authorizeRole('admin','user'), (req, res) => {
    const{ nama, BirthYear} = req.body;
    console.log(`Request POST/ Movie oleh user:`, req.user.username);
    if(!nama ||!BirthYear){
        return res.status(400).json({error: `nama/BirthYear kosonng`});
    }

    const sql = `insert into directors (nama, BirthYear) values(?, ?)`;
    db.run(sql, [nama, BirthYear], function(err){
        if(err) {
            return res.status(500).json({error:err.message});
        } 
        res.status(201).json({id:this.lastID, nama, BirthYear});
    });
 });


app.put(`/movies/:id`, authenticateToken, authorizeRole('admin'),(req, res) => {
    const{ title, director, year} = req.body;
    const sql = `UPDATE movies SET title = ?, director = ?, year = ? 
    WHERE id = ? `;
    db.run(sql, [title, director, year, req.params.id],
    function(err){
        if(err) {
            return res.status(500).json({error:err.message});
        } if(this.changes === 0) {
            return res.status(404).json({err: `Film tidak ditemukan`});
        }
        res.json({id: Number(req.params.id), title, director, year});
    });
});

app.put(`/directors/:id`, authenticateToken, authorizeRole('admin'),(req, res) => {
    const{ nama, BirthYear} = req.body;
    const sql = `UPDATE directors SET nama = ?, BirthYear = ? WHERE id = ? `;
    db.run(sql, [nama, BirthYear, req.params.id],
    function(err){
        if(err) {
            return res.status(500).json({error:err.message});
        } if(this.changes === 0) {
            return res.status(404).json({err: `Director tidak ditemukan`});
        }
        res.json({id: Number(req.params.id), nama, BirthYear});
    });
});

app.delete(`/movies/:id`, authenticateToken,authorizeRole('admin'),(req, res) => {
    const sql = `DELETE FROM movies WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (this.changes === 0){
            return res.status(404).json({error: `Film tidak ditemukan`});
        }
        res.status(204).send();
    });
});

app.delete(`/directors/:id`,authenticateToken, authorizeRole('admin'),(req, res) => {
    const sql = `DELETE FROM directors WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (this.changes === 0){
            return res.status(404).json({error: `Directors tidak ditemukan`});
        }
        res.status(204).send();
    });
});

app.use((req, res) => {
    res.status(404).json({error: `rute tidak ditemukan`});
});

app.listen(PORT, () => {
    console.log(`Server aktif di http://localhost:${PORT}`);
});