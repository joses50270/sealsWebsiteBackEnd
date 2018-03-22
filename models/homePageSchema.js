var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var homeSchema = new Schema({
   header: String,
   bodyText: String,
})

module.export = mongoose.model('homePageSchema', homeSchema)