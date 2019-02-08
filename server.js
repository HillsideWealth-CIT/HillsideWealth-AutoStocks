/*** Node Modules ***/
require('dotenv').config()
const express = require('express');
const request = require('request');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const session = require('client-sessions');


/*** Project Scripts ***/
const login = require("./actions/login");



/*** Constants ***/

const PORT = process.env.PORT || 8080;
const app = express();



app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/*** Middlewares ***/
app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials');

/* Session Middleware */
app.use(session({
    cookieName: 'session',
    secret: process.env.SESSION_SECRET,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));


/*** Functions ***/

/* Checks session */
const session_check = (req, res, next) => {
    console.log(req.session.user);
    if (!req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}



app.get('/', (request, response) => {
    response.render('index.hbs');
});

app.get('/home', session_check, (request, response) => {
    response.render('home.hbs');
});

app.get('/database', session_check, (request, response) => {
    response.render('database.hbs');
});

app.get('/register', (request, response) => {
    response.render('register.hbs');
});

//Sign in verification
app.post('/', (request, response) => {
    login.check(request.body)
        .then((resolve) => {
            request.session.user = resolve;
            response.redirect('/home');
        }).catch((error) => {
            console.log(error);
        });
});

app.listen(PORT, () => {
    console.log('Server is up on port 8080');
});
