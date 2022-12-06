const dotenv = require('dotenv').config();
const MainServer = require('./MainServer/mainServer');

const mainServer = new MainServer(process.env.PORT);