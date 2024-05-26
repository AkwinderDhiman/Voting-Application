const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;


//Import the user router file
const userRoutes = require('./routes/userRoutes');

//use the routers
app.use('/user', userRoutes);

app.listen(PORT, () => {
    console.log('Listening on port 3000,==============================')
})