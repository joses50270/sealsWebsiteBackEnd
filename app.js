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
var user = { name: 'Jose Santana' };
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
        commentCollection = db.collection("comments"),
        blogCollection = db.collection("blogs")
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
    content: {
        type: String,
    },
    timeStamp: {
        type: Date,
        default: Date.now()
    },
    discussionId: {
        type: String,
    },
   child: Boolean
});

var CommentForm = mongoose.model('comment', commentSchema);

var blogSchema = new Schema ({
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: "Jose Santana"
    },
    id: {
        type: String,
        required: true
    },
    timeStamp: {
        type: Date,
        default: Date.now()    
    }
})

var BlogForm = mongoose.model('blog', blogSchema);

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



app.post('/admin/login', function (req, res) {
    User.findOne({ 'email': req.body.email }, 'password', function (err, product) {
        if (err) throw err;
        if (product === null) {
            res.status(200).send({
                type: false,
                data: 'Email does not exist'
            })

        } else {
            bcrypt.compare(req.body.password, product.password, function (err, resp) {
                console.log(product.password)
                if (err) throw err;
                console.log(resp)
                if (resp) {
                    const token = jwt.sign({ user }, 'secret_key', { expiresIn: '86400s' });
                    console.log("user's token:", token);

                    res.status(200).send({
                        type: true,
                        data: 'Kodak Wack...oh btw welcome',
                        token: token
                    })
                } else {
                    res.status(200).send({
                        type: false,
                        data: 'Incorrect Password'
                    })

                }
            })
            if (err) throw err;
            console.log(product)

        }
    })
});



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

   app.get('/comments', function(req, res){
       commentCollection.find({ discussionId : req.headers.id }).toArray(function(err, docs){
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

   app.post('/blogPost', xssService.sanitize, function (req, res){
       var newBlog = new BlogForm(req.body);
       newBlog.save(function (err, product){
           if(err) throw err;
           console.log('Blog Added');
            res.status(200).send({
                type: true,
                data: 'Blog has been saved'
            });
       });
   });


    app.get('/blogPost', function (req, res){
        var id = req.headers.headerid
        id = mongoose.Types.ObjectId(id)
        BlogForm.findOne({_id: id}, function(err, data, next){
            if(err) throw err;
            console.log(data);
            res.status(200).send(data);
        })
    })


app.listen(port, function () {
    console.log('listening on port: ', port);
});