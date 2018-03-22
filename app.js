var express = require('express');
var mongoose = require('mongoose')
var port = process.env.PORT || 3000;
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var api = require('./routes/serverRoutes');
var xss = require('xss');
var bcrypt = require('bcrypt');
var salt = 10;
var jwt = require('jsonwebtoken');
var config = require('./config')
// var token = jwt.sign(<user>, <secret>);
// Twilio Credentials
const accountSid = 'ACb5afde43ef6ef78a730ef57c3ee13eed';
const authToken = 'b42d747c34f59370e9b69cca526961cb';

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));

mongoose.connect('mongodb://joses50270:santana1522@ds257808.mlab.com:57808/sealportfolio', function(err, db){
    if (err) {
        console.log('error connecting to mlab');
        process.exit(1);
        throw err
    } else {
        console.log('connected to mlab')
        commentCollection = db.collection("comments")
    }
});
mongoose.connection.on('error', function (error) {
    if (error) throw error
})

var express = require('express');
var mongoose = require('mongoose')

var Schema = mongoose.Schema
var twilioSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        default: '+18556495866 '
    },
    msg: {
        type: String,
        required: true
    },
    timeStamp: {
        type: Date,
        default: Date.now()
    }
});

var Twilio = mongoose.model('twilio', twilioSchema)


var Schema = mongoose.Schema
var userSchema = new Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    pic: {
        type: String,
        default: "./assets/images/jose.png",
    },
    created: {
        type: Date,
        default: Date.now()
    },
    modified: {
        type: Date,
        default: Date.now()
    }
});
var User = mongoose.model('user', userSchema);

var commentSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    timeStamp: {
        type: Date,
        default: Date.now()
    }
});

var CommentForm = mongoose.model('comment', commentSchema);

var xssService = {
    sanitize: function (req, res, next) {
        var data = req.body
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                data[key] = xss(data[key]);
                console.log(data[key]);
            }

        }
        next();
    }

}


var bcryptService = {
    hash: function (req, res, next) {
        bcrypt.hash(req.body.password, salt, function (err, res) {
            if (err) throw err;
            req.body.password = res;
            console.log(res)
            next();
        })
    }

}

//app.use('/api', api);

app.post('/admin/register', xssService.sanitize, bcryptService.hash, function (req, res, next) {

    // res.status(200).send(req.body)
    var newUser = new User(req.body);
    newUser.save(function (err, product) {
        if (err) throw err;
        var token = jwt.sign({ id: newUser._id }, config.secret, {
            expiresIn: 86400
        })
        res.status(200).send({
            auth: true, token: token
        })
        console.log("User Saved!");
        // res.status(200).send({
        //     type: true,
        //     data: 'User Saved!'
        // });

    });

});



app.post('/login', function (req, res) {
    // User.findOne({ 'email': req.body.email }, 'password', function (err, product) {   
    //     if (err) throw err;
    //     if (product === null) {
    //         res.status(200).send({
    //             type: false,
    //             data: 'User does not exist'
    //         })
    //     } else {
    //         var passwordIsValid = bcrypt.compare(req.body.password, product.password, function (err, resp) {
    //             console.log(product.password)
    //             if (err) throw err;
    //             console.log(resp)

    //         if (!passwordIsValid) return res.status(401).send({ auth: false, token: null});
    //         var token = jwt.sign({ id: User._id}, config.secret,{
    //             expiresIn: 86400
    //         });
    //         res.status(200).send({ auth: true, token: token });
    //             if (resp) {
    //                 res.status(200).send({
    //                     type: true,
    //                     data: 'User Logged In!'
    //                 })
    //             } else {
    //                 res.status(200).send({
    //                     type: false,
    //                     data: 'Password is incorrect'
    //                 })
    //             } 
    //         })
    //         if (err) throw err;
    //         console.log(product)
    //     }

    // })
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
        var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({ auth: true, token: token });
    });
})



app.post('/twilioForm', xssService.sanitize, function (req, res) {
    var twilioSchema = new Twilio(req.body);
    twilioSchema.save(function (err, product) {
        if (err) throw err;
        console.log("Form Submitted!");
        console.log(req.body);
    

            res.status(200).send({
                type: true,
                data: 'Form Information Submitted to Database'
            })
    })

    client.messages
    .create({
        to: '+13232026452',
        from: '+18556495866 ',
        body: twilioSchema.msg + ',\nFirst Name: ' + twilioSchema.firstname + ', \nLast Name: ' + twilioSchema.lastname + ', \nEmail: ' + twilioSchema.email,
       
    })
    .then(message => console.log(message.sid));
})

   app.post('/comments', xssService.sanitize, function (req, res){
       var newComment = new CommentForm(req.body);
       newComment.save(function (err, product){
           if (err) throw err;
           console.log('Added Comment');
           res.status(200).send({
               type: true,
               data: 'Succesfully Added Comment b'
           });
       });
   });

   app.get('/pullComments', function(req, res){
       commentCollection.find().toArray(function(err, docs){
           if (err){
               throw err;
               res.sendStatus(500);
           } else {
               var result = docs.map(function(data){
                   return data;
               })
               res.json(result);
           }
       })
   })

// client.messages
//     .create({
//         to: '+13232026452',
//         from: '+18556495866 ',
//         body: 'Test Message',
//     })
//     .then(message => console.log(message.sid));



app.listen(port, function () {
    console.log('listening on port: ', port);
});





 // var newUser = new User({
    //     firstname: 'jose',
    //     lastname: 'santana',
    //     dob: '05/07/01',
    //     email: 'jose.santana.simontech@gmail.com',
    //     password: 'ilovebio',
    // })
    // newUser.save();