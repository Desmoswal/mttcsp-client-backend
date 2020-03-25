const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv').config()
const {Storage} = require("@google-cloud/storage")
const google = require('./helpers/google-cloud')

//DgvwTcWBrhe7UhRN

//const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user')
const jobsRoutes = require('./routes/job')

const app = express();

//MONGODB
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true}).then(() =>{
    console.log('Connected to database');
})
.catch(() =>{
    console.log('Connection failed to database')
})


//GOOGLE CLOUD
google.listFiles()

app.use(bodyParser.json())
app.use(morgan("dev"))

app.use((req, res, next) => {
    //res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
})

app.use("/api/jobs", jobsRoutes);
app.use("/", userRoutes);

module.exports = app;