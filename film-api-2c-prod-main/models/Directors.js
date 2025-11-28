const mongoose = require(`mongoose`);

const directorSchema = new mongoose.Schema({
    nama: {type:String, required:true, trim:true},
    BirthYear: {type:Number, required:true},
}, {timestamp:true});

const director = mongoose.model(`director`, directorSchema);
module.exports=director;