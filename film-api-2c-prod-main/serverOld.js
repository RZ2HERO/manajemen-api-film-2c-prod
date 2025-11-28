const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.json());
let movies = [
    { id: 1, title: 'Parasite', director: 'Bong Joon-ho', year: 2019 },
    { id: 2, title: 'The Dark Knight', director: 'Christopher Nolan', year: 2008 },
    { id: 3, title: 'Spirited Away', director: 'Hayao Miyazaki', year: 2001 },
    {id: 4, title: `Transformer 1`, director:`Michael Bay`, year:2007},
    {id:5, title:`Your Name`, director:`Makoto Shinkai`, year: 2016}
];

let directors = [
    {id:1, Name: `Bong Joon-Ho`, BirthYear: 1969},
    {id:2, Name:`Christoper Nolan`, BirthYear: 1970},
    {id:3, Name:`Hayao Miyazaki`, BirthYear: 1941},
    {id:4, Name:`Michael Bay`, BirthYear:1965},
    {id:5, Name:`Makoto Shinkai`, BirthYear:1973}
];

app.get('/', (req, res) => {
    res.send('Server API Manajemen Film berjalan!')
});
app.get('/movies', (req, res) => {
    res.json(movies);
});

app.get('/directors', (req, res) => {
    res.json(directors);
});

app.get('/movies/:id', (req, res) => {
    const movieId = parseInt(req.params.id);
    const movie = movies.find(m => m.id === movieId);
    if (!movie) {
        return res.status(404).json({ message: 'Film tidak ditemukan' });
    }
    res.json(movie);
});

app.get(`/directors/:id`, (req, res) => {
    const directorId = parseInt(req.params.id);
    const director = directors.find(d =>d.id === directorId);
    if(!director) {
        return res.status(404).json({message: `director not Found`});
    }
    res.json(director);
});

app.post('/movies', (req, res) => {
    app.use(express.json());
    const { title, director, year } = req.body;
    if (!title || !director || !year) {
        return res.status(400).json({ message: 'Semua field (title, director, year) harus diisi' });
    }
    const newId = movies.length > 0 ? movies[movies.length - 1].id + 1 : 1;
const newMovie = { id: newId, title, director, year };
movies.push(newMovie);
res.status(201).json(newMovie);
});

app.post(`/directors`, (req, res) => {
    app.use(express.json());
    const {Name, BirthYear} = req.body;
    if (!Name || !BirthYear){
        return res.status(400).json({message :`Ada field yang kosong`});
    }

    const newId = directors.length > 0 ? directors[directors.length - 1].id + 1 : 1;
    const newDirectors = {id:newId, Name, BirthYear};

    directors.push(newDirectors);
    res.status(201).json(newDirectors);
});

app.put('/movies/:id', (req, res) => {
    const movieId = parseInt(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === movieId);

    if (movieIndex === -1) {
        return res.status(404).json({message: `Film Not Found`});
    }
    const {title, director, year} = req.body;

    if (!title|| !director || !year) {
        return res.status(400).json ({message: `Semua Field harus diisi`});
    }
    const updatedMovie = { id: movieId, title, director, year};

    movies[movieIndex] = updatedMovie;

    res.status(201).json(updatedMovie);  
});

app.put(`/directors/:id`, (req, res) => {
    const directorId = parseInt(req.params.id);
    const directorIndex = directors.findIndex(d => d.id === directorId);

    if (directorIndex === -1) {
        return res.status(404).json({message:  `Directors not Found`});
    }
    const {Name, BirthYear} = req.body;

    if (!Name || !BirthYear){
        return res.status(400).json ({message: `field tidak terisi`});
    }
    const updatedDirector = {id:directorId, Name, BirthYear};

    directors[directorIndex] = updatedDirector;
    
    res.status(201).json(updatedDirector);
});

app.delete(`/movies/:id`, (req, res) => {

    const movieId = parseInt(req.params.id);

    const movieIndex = movies.findIndex( m => m.id === movieId);

    if (movieIndex === -1) {
        return res.status(404).json({message: `film Not Found`});
    }
    
    movies.splice(movieIndex, 1);

    res.status(204).send();
});

app.delete(`/directors/:id`, (req, res) => {
    const directorId = parseInt(req.params.id);

    const directorIndex = directors.findIndex( d => d.id === directorId);

    if (directorIndex === -1){
        return res.status(404).json({message: `Director not found`});    
    }

    directors.splice(directorIndex, 1);
    res.status(204).send();
});


app.listen(PORT, () => {
    console.log(`Server aktif di http://localhost:${PORT}`);
});