const express = require('express');
const compression = require('compression')
const path = require('path');

const app = express();

// Serve static files from the React app
app.use(compression())
app.use(express.static(path.join(__dirname, 'dist/')));


const port = process.env.PORT || 80;
app.listen(port);


