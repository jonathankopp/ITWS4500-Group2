// server init + mods
const express = require('express');
const app = express();
const port = 3000;


//Point to HTML file
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

//Allow static files
app.use(express.static('public'));


app.listen(port, () => console.log('Example app listening on port ' + port));