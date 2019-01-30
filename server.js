const express = require('express');
const request = require('request');
const hbs = require('hbs');
var app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

hbs.registerPartials(__dirname + '/views/partials');

app.get('/', (request, response) => {
    response.render('index.hbs');
});

app.get('/home', (request, response) => {
	response.render('home.hbs');
});

app.get('/database', (request, response) => {
	response.render('database.hbs');
});

app.get('/register', (request, response) => {
	response.render('register.hbs');
});

//Home page
app.post('/home', (request, response) => {
	const name = request.body.userName;
	response.render('home.hbs', {
		name: name
	});
});




app.listen(PORT, () => {
    console.log('Server is up on port 8080');
});