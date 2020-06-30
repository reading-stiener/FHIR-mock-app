const express = require('express');
const bodyParser = require('body-parser');
const sqlite = require('sqlite3');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(bodyParser.json({ type: '*' }));
const { getHomePage } = require('./routes/index');
const { addAthletePage, addAthlete, deleteAthlete, editAthlete, editAthletePage, reconAthlete, addLabResults, addLabResultsPage } = require('./routes/athlete');
const { viewAthleteHealthPage } = require('./routes/athleteHealth');
const port = 5000;

console.log('Imports are good!!')

let db = new sqlite.Database('./data/MySportTeam.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the MySportTeam database.');
});

global.db = db;

// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine


// routes for the app

app.get('/', getHomePage);
app.get('/add', addAthletePage);
app.get('/edit/:id', editAthletePage);
app.get('/delete/:id', deleteAthlete);
app.get('/health/:id', viewAthleteHealthPage);
app.post('/add', addAthlete);
app.post('/edit/:id', editAthlete);
app.get('/reconciliation/:id', reconAthlete);
app.get('/lab', addLabResultsPage);
app.post('/lab', addLabResults);

// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});