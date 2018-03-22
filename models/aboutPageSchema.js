var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var aboutSchema = new Schema({
    header: String,
    bodyText: String,
    bodyText2: String,
    header1: String,
    bodyText3: String,
})

module.export = mongoose.model('aboutPageSchema', aboutSchema)