const express = require('express');
const request = require('request');
const hbs = require('hbs');
var app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;

const login = require("./actions/Login");

var session = require('client-sessions');

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
	cookieName: 'session',
	secret: 'dthrowdashupsmash',
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000,
}));

function session_check(req, res, next){
	console.log(req.session.user);
	if (req.session.user != undefined){
		next();
	} else {
		res.redirect('/');
	}
}

hbs.registerPartials(__dirname + '/views/partials');

app.get('/', (request, response) => {
    response.render('index.hbs');
});

app.get('/home', session_check, (request, response) => {
	response.render('home.hbs');
});

app.get('/database', session_check,(request, response) => {
	response.render('database.hbs');
});

app.get('/register', (request, response) => {
	response.render('register.hbs');
});

//Sign in verification
app.post('/', (request, response) => {
	login.check(request.body)
	.then((resolve)=>{
		request.session.user = resolve;
		response.redirect('/home');
	}).catch ((error) => {
		console.log(error);
	});
});

app.listen(PORT, () => {
    console.log('Server is up on port 8080');
});