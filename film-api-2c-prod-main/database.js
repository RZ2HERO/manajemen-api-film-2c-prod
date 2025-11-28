require('dotenv').config();
const sqlite3 = require ('sqlite3').verbose();

const DB_SOURCE = process.env.DB_SOURCE;

const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log(`Terhubung ke basis data SQLite.`);
        db.run(`
            Create Table if not exists directors(
            id Integer Primary key autoincrement,
            nama Text not null,
            BirthYear integer not null
            )`, (err) => {
                if(err){
                    console.log("error")
                };
            },
            
        db.run(`
            Create Table if not exists users(
            id integer primary key AUTOINCREMENT,
            username Text not null unique,
            password Text not null,
            role Text not null default 'user')
            `),
            (err) => {
                if(err) {console.error("gagal membuat tabel users: ", err.message);
                } 
            },
            
            db.run(`Create table if not exists movies(
                id integer primary key autoincrement,
                title Text not null unique,
                director Text not null,
                year integer)`),
                (err) => {
                    if(err){
                        console.error("Gagal membuat tabel movies:", err.message);
                    }
                },
        );
    }

});


module.exports = db;  