var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var navbarSchema = new Schema({
    title: String,
    home: String,
    about: String,
    contact: String,
}) 

module.export = mongoose.model('navbarSchema', navbarSchema)