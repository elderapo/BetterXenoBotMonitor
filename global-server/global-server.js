var express = require('express');
var app = express();

var data = {
	logged: true
}

app.set('port', (process.env.PORT || 3000));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('pages/index', {data: data});
});

app.get('/settings', function(req, res) {
	res.render('pages/settings', {data: data});
});

app.get('/register', function(req, res) {
	res.render('pages/register', {data: data});
});

app.get('/login', function(req, res) {
	res.render('pages/login', {data: data});
});

app.get('/logout', function(req, res) {
	//logout somehow xD
	data.logged = false;
	res.redirect("/");
});

app.get('/bots', function(req, res) {
	res.render('pages/bots', {data: data});
});

app.get('/selectedBot', function(req, res) {
	res.render('pages/selectedBot', {data: data});
});

app.get('/map', function(req, res) {
	res.render('pages/map');
});

var server = app.listen(app.get('port'), function() {
	console.log('Server started: http://localhost:' + app.get('port') + '/');
});