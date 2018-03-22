var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var router = express.Router();
var aboutPageSchema = require('../models/aboutPageSchema');
var contactPageSchema = require('../models/contactPageSchema');
var homePageSchema = require('../models/homePageSchema');
var navbarSchema = require('../models/navbarSchema');
var mongoose = require('mongoose')
// var client = mongodb.MongoClient;
var url = process.env.MONGODB_URI || 'mongod://localhost:27017/aboutMe';
var app = express();
var router = express.Router();

var aboutMe;
var home;
var contact;
var navbar;


// client.connect(url, function(err,db){
//     if(err){
//         console.log("error connecting");
//         process.exit(1);
//         throw err;
//     }else{
//         console.log("connected to our database")
//         aboutMe = db.collection("about");
//         home = db.collection("home");
//         contact = db.collection("contact");
//         navbar = db.collection("navbar");
//     }
// })



router.get("/pullAboutMe", function(req, res){
    aboutMe.find().toArray(function (err, result){
        if(err) throw err;
        res.json(result)
    })
    
})

module.exports = router;