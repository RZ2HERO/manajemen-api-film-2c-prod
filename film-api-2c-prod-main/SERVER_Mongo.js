require(`dotenv`).config();
const express = require('express');
const cors = require(`cors`);
const movie = require('./models/Movies');
const director = require(`./models/Directors`);
const connectDB =require('./config/database');

connectDB();

const app = express();
const PORT = process.env.PORT || 3300;

app.use(cors());
app.use(express.json());

app.get(`/status`, (req, res) => {
    res.json({ok: true, service:`film-api`});
});

app.get(`/movies`, async (req, res, next) => {

    try{
        const movies = await movie.find({});
        res.json(movies);
    } catch(err){
        next(err);
    }
});

app.get(`/directors`, async (req, res, next) => {

    try{
        const directors = await director.find({});
        res.json(directors);
    } catch(err){
        next(err);
    }
});

app.get(`/movies/:id`, async (req, res, next) => {
    try{
        const Movie = movie.findById(req.params.id);
        if(!movie){
            return res.status(404).json({error: `Film Not Found`});
        }
        res.json(Movie);
    } catch (err) {
        if (err.kind === `ObjectId`) {
            return res.status(400).json({err: `Format ID tidak Valid`});
        }
        next(err);
    }
});

app.get(`/directors/:id`, async (req, res, next) => {
    try{
        const directors = director.findById(req.params.id);
        if(!director){
            return res.status(404).json({error: `director Not Found`});
        }
        res.json(directors);
    } catch (err) {
        if (err.kind === `ObjectId`) {
            return res.status(400).json({err: `Format ID tidak Valid`});
        }
        next(err);
    }
});

app.post(`/movies`, async (req, res, next) => {
    try{
        const NewMovie = new movie({
            title: req.body.title,
            director: req.body.director,
            year: req.body.year
        });
        const savedMovie = await NewMovie.save();
        res.status(201).json({savedMovie});
    }catch (err){
        if (err.name === `ValidationError`){
            return res.status(400).json({err: err.message});
        }
        next(err);
    }
});

app.post(`/directors`, async (req, res, next) => {
    try{
        const NewDirector = new director({
            nama: req.body.nama,
            BirthYear: req.body.BirthYear
        });
        const savedDirector = await NewDirector.save();
        res.status(201).json({savedDirector});
    }catch (err){
        if (err.name === `ValidationError`){
            return res.status(400).json({err: err.message});
        }
        next(err);
    }
});

app.put(`/movies/:id`, async (req, res, next) => {
    try{
        const{title, director, year} = req.body;
        if(!title, !director, !year) {
            return res.status(400).json({err: `title, director, year wajib diisi`});
        }
        const updateMovie = await movie.findByIdAndUpdate(
            req.params.id, 
            { title, director, year},
            {new:true, runValidators: true}
        );
        if (!updateMovie) {
            return res.status(404).json({err: `Film Not Found`});
        }
        res.json(updateMovie);
    }catch (err){
        if (err.name === `ValidationError`){
            return res.status(400).json({err: err.message});
        }
        if(err.kind === `ObjectId`) {
            return res.status(400).json({err: `Format ID tidak Valid`});
        }next(err);
    }
});

app.put(`/directors/:id`, async (req, res, next) => {
    try{
        const{nama, BirthYear} = req.body;
        if(!nama, !BirthYear) {
            return res.status(400).json({err: `nama, BirthYear wajib diisi`});
        }
        const updateDirector = await director.findByIdAndUpdate(
            req.params.id, 
            { nama, BirthYear},
            {new:true, runValidators: true}
        );
        if (!updateDirector) {
            return res.status(404).json({err: `Director Not Found`});
        }
        res.json(updateDirector);
    }catch (err){
        if (err.name === `ValidationError`){
            return res.status(400).json({err: err.message});
        }
        if(err.kind === `ObjectId`) {
            return res.status(400).json({err: `Format ID tidak Valid`});
        }next(err);
    }
});

app.delete(`/movies/:id`, async (req, res, next) => {
    try{
        const deleteMovie = await
        movie.findByIdAndDelete(req.params.id);
        if(!deleteMovie){
            return res.status(404).json({err: `Film Not Found`});
        }
        res.status(204).send();
    }catch (err){
        if (err.kind === `ObjectId`){
            return res.status(400).json({err: `Format ID tidak Ditemukan`});
        } next(err);
    }
});

app.delete(`/directors/:id`, async (req, res, next) => {
    try{
        const deleteDirector = await
        director.findByIdAndDelete(req.params.id);
        if(!deleteDirector){
            return res.status(404).json({err: `Director Not Found`});
        }
        res.status(204).send();
    }catch (err){
        if (err.kind === `ObjectId`){
            return res.status(400).json({err: `Format ID tidak Ditemukan`});
        } next(err);
    }
});


app.use((req, res)=> {
    res.status(404).json({error: `Rute tidak ditemukan`});
});

app.use((err, req,res, next)=> {
    console.error(err.stack);
    res.status(500).json({error: `Terjadi kesalahan pada server`});
});

app.listen(PORT, ()=>{
    console.log(`Server aktif di http://localhost:${PORT}`);
}); 
