const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// ROUTES
const ProyectoRedes = require('../Routes/proyectoRedes'); // <--------------------------

class MainServer {
    // End Points
    EndPointProyecto = '/proyecto-redes'; // <-----------------------

    constructor (port){
        this.port = port;
        this.app = express();
        this.middleWares();
        this.asingRoutes();
        this.app.listen(port,()=>{
            console.log('Server listening port'+port);
        });
    }

    middleWares() {
        this.app.use(express.json());
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use((req,res,next) => {
            res.header('Access-Control-Allow-Origin','*');
            res.header('ACcess-Control-Allow-Headers','Authorization, X-API-Kew, Origin, X-Requested-With, Content-Type, Access-Control-Request-Method');
            res.header('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, DELETE');
            res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');
            next();
        });
    }

    asingRoutes() {
        this.app.use(this.EndPointProyecto, ProyectoRedes); // <----------------------
    }
}

module.exports = MainServer;