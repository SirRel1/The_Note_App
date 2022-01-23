//Importing the requirements
const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const notesjs = require('./db/db.json');

// create a PORT
const app = express();
var PORT = process.env.PORT || 3001;

// Sets up the Express app 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Middleware being called.
app.use(express.static('public'));

// Promise version 
const readFromFile = util.promisify(fs.readFile);


const writeToFile = (destination, content) =>
	fs.writeFile(destination, JSON.stringify(content, null, 2), (err) =>
		err ? console.error(err) : console.info(`\nData written to ${destination}`)
	);

// Read from file and append note.
const readAndAppend = (content, file) => {
	fs.readFile(file, 'utf8', (err, data) => {
		if (err) {
			console.error(err);
		} else {
			const parsedData = JSON.parse(data);
			parsedData.push(content);
			writeToFile(file, parsedData);
		}
	});
};

// GET Route for retrieving all the notes
app.get('/api/notes', (req, res) => {
	console.info(`${req.method} request received for notes`);
	readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
	console.info('Reading db.json');
});

// Create new notes
app.post('/api/notes', (req, res) => {
	console.info(`${req.method} request received to add a note`);
	const { title, text, id } = req.body;
	if (req.body) {
		let newNum = Math.floor(Math.random() * 1000).toString();
		const newNote = {
			title,
			text,
			id: `${newNum}`,
		};

		readAndAppend(newNote, './db/db.json');
		res.json(`Note added successfully`);
	} else {
		res.json('error in adding Notes');
	}
});

//Delete the notes
app.delete('/api/notes/:id', (req, res) => {
	console.info('Deleting...');
	const noteId = req.params.id;
	readFromFile('./db/db.json')
		.then((data) => JSON.parse(data))
		.then((json) => {
			// Make a new array of all tips except the one with the ID provided in the URL
			const result = json.filter((notesjs) => notesjs.id !== noteId);
			// Save that array to the filesystem
			writeToFile('./db/db.json', result);
			// Respond to the DELETE request
			res.json(`Item ${noteId} has been deleted 🗑️`);
		});
});

// Get route for notes page
app.get('/notes', (req, res) =>
	res.sendFile(path.join(__dirname, '/public/notes.html'))
);
// Get routes for Wildcard route
app.get('*', (req, res) =>
	res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () =>
	console.log(`App listening at http://localhost:${PORT} 🚀`)
);
