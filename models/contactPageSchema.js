var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactSchema = new Schema({
    header: String,
    email: String,
    phoneNumber: String,
    bodyText: String,
})

module.export = mongoose.model('contactPageSchema', contactSchema)