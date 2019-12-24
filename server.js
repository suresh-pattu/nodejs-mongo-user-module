'use strict';

const cluster = require('cluster');
const {port, hostName} = require('./config/server.config');

let workers = [];
let numCores = require('os').cpus().length;

if (cluster.isMaster) {
    console.log(`Master cluster setting up ${numCores} workers`);
    for (let i = 0; i < numCores; i++) {
        workers.push(cluster.fork());
        workers[i].on('message', function (message) {
            console.log(message);
        });
    }

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is listening');
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal} \n Starting a new worker`);
        workers.push(cluster.fork());
        workers[workers.length - 1].on('message', function (message) {
            console.log(message);
        });
    });
} else {
    //express
    const express = require('express');
    const server = express();
    const router = express.Router();

    //middleware
    server.use(express.json());
    server.use(express.urlencoded({extended: true}));

    //Connect mongodb
    const dbConfig = require('./config/database.config.js');
    const mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    mongoose.connect(dbConfig.url, {
        useNewUrlParser: true
    }).then(() => {
        console.log("Successfully connected to the database");
    }).catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });

    //Routes
    const routes = require('./src/app/user/routes');
    server.use('/api', routes(router));

    //Server init
    server.listen(port, hostName, () => {
        console.log(`Server is running on http://${hostName}:${port}`);
    });
}