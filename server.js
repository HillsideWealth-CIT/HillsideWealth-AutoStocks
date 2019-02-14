/*** Node Modules ***/
require('dotenv').config()
const express = require('express');
const request = require('request');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const session = require('client-sessions');
const app = express();
const multer = require('multer');
const upload = multer({dest: './uploads/'});


/*** Project Scripts ***/
const auth = require("./actions/auth");
const db = require("./actions/database");


/*** Constants ***/
const port = process.env.PORT || 8080;


/*** Middlewares ***/

app.set('view engine', 'hbs');
app.use(express.static(`${__dirname}/public`));
hbs.registerPartials(`${__dirname}/views/partials`);

/* Bodyparser Middlewares */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* Session Middleware */
app.use(session({
    cookieName: 'session',
    secret: process.env.SESSION_SECRET,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));


/*** Functions ***/

/* Checks session */
const sessionCheck = (req, res, next) => {
    console.log(req.session.user);
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

/*** HTTP Requests ***/

/** GET **/

app.get('/', sessionCheck, (request, response) => {
    response.render('index.hbs');
});

app.get('/register', (request, response) => {
    response.render('register.hbs');
});

app.get('/login', (request, response) => {
    response.render('login.hbs');
});

app.get('/database', sessionCheck, (request, response) => {
    response.render('database.hbs');
});

app.get('/collection', sessionCheck, (request, response) => {
    response.render('collection.hbs')
});

app.get('/documentation', sessionCheck, (request, response) => {
    response.render('documentation.hbs')
});

app.get('/settings', sessionCheck, (request, response) => {
    response.render('settings.hbs')
});


/** POST **/

/* Login */
app.post('/login', (request, response) => {
    auth.login(request.body.username, request.body.password)
        .then(() => {
            request.session.user = request.body.username
            response.redirect('/')
        }).catch((err) => {
            console.log(error)
        })
});

/* Register */
app.post('/register', (request, response) => {
    auth.signup(request.body.username, request.body.password, request.body.confirmPassword)
        .then(() => {
            request.session.user = request.body.username;
            response.redirect('/')
        })
})

/* File Upload */
app.post('/upload', upload.single('myfile'),(request, response) => {
    console.log(request.file.filename);
    // uploaded files are stored inside the uploads folder @alex
    // Module for parsing the csv goes under here @alex
    // redirects to the comparason page @alex
})

/* Logout */
app.post('/logout', (request, response) => {
    request.session.reset()
    response.redirect('/')
})


/*** Start Server ***/
app.listen(port, () => {
    console.log(`Server is up on port: ${port}, with PID: ${process.pid}`);
});
