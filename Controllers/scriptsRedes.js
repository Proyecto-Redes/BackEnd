const proyectoCtr = {};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const fs = require('fs');
const path = require('path');

// json files
const directoryRoot = path.join(__dirname + '/..' + '/DataBase');
let userDB = '';
let tasksDB = '';
let quotesDB = '';
let ubicationDB = '';

// --------------------------------------- USER ---------------------------
proyectoCtr.createUser = (req, res) => {
    const correo = req.body.Correo;
    const alias = req.body.Alias;
    const verify = userDB.find((user) => user.Correo === correo);
    const verifyAlias = userDB.find((user) => user.Alias === alias);
    if (!verify && !verifyAlias) {
        let dirUserDB = path.join(directoryRoot + '/Users.json');
        const body = req.body;
        const newUser = {
            Alias: { type: String },
            Correo: { type: String },
            Contrasena: { type: String }
        }
        newUser.Alias = body.Alias;
        newUser.Correo = body.Correo;
        newUser.Contrasena = bcrypt.hashSync(req.body.Contrasena);
        userDB.push(newUser);
        saveChanges(userDB, dirUserDB);
        const expiresIn = 24 * 60 * 60;
        const accessToken = jwt.sign({ id: newUser.id }, SECRET_KEY, { expiresIn: expiresIn });
        const dataUser = {
            Alias: newUser.Alias,
            Correo: newUser.Correo,
            accessToken: accessToken,
            expiresIn: expiresIn,
            ok: true
        }
        res.json(dataUser);
    } else {
        let response = '';
        if (verify && verifyAlias) {
            response = 'Alias ya utilizado por otro usuario y correo asociado en otra cuenta';
        }
        if (!verify && verifyAlias) {
            response = 'Alias ya utilizado por otro usuario';
        }
        if (verify && !verifyAlias) {
            response = 'Correo asociado en otra cuenta';
        }
        console.log('response: ', response);
        res.json({
            msg: response,
            ok: false
        });
    }
};

proyectoCtr.authUser = (req, res) => {
    const UserData = {
        Correo: req.body.Correo,
        Contrasena: req.body.Contrasena
    };
    const usuario = userDB.find((user) => user.Correo === UserData.Correo);
    if (!usuario) {
        // Correo does not exist
        res.status(409).send({
            msg: 'Algo anda mal',
            err: 'Usuario no existe',
            ok: false
        });
    } else {
        const resultContrasena = bcrypt.compareSync(UserData.Contrasena, usuario.Contrasena);
        if (resultContrasena) {
            const expiresIn = 24 * 60 * 60;
            const accessToken = jwt.sign({ id: usuario.id }, SECRET_KEY, { expiresIn: expiresIn });
            const dataUser = {
                Alias: usuario.Alias,
                Correo: usuario.Correo,
                accessToken: accessToken,
                expiresIn: expiresIn,
                ok: true
            }
            res.send(dataUser);
        } else {
            // password wrong
            res.status(409).send({
                msg: 'Algo anda mal',
                err: 'Correo o Contraseña incorrecta',
                ok: false
            });
        }
    }
};

proyectoCtr.getUserData = (req, res) => {
    const alias = req.params.Alias;
    const user = userDB.find((user) => user.Alias === alias);
    res.json(user);
};

// ---------------------------------------- Tareas --------------------------------
proyectoCtr.createTarea = (req, res) => {
    const body = req.body;
    let dirTareasDB = path.join(directoryRoot + '/Tareas.json');
    const newTask = {
        Nombre: { type: String },
        Descripcion: { type: String },
        Fecha: { type: String },
        Fecha_Realizada: { type: String },
        Importancia: { type: String },
        Estatus: { type: Number },
        User: { type: String }
    }
    newTask.User = body.User;
    newTask.Descripcion = body.Descripcion;
    newTask.Nombre = body.Nombre;
    newTask.Fecha = body.Fecha;
    newTask.Importancia = body.Importancia;
    newTask.Estatus = 0;
    newTask.Fecha_Realizada = newTask.Fecha;
    tasksDB.push(newTask);
    saveChanges(tasksDB, dirTareasDB);
    res.status(200).send({
        msg: 'Tarea registrada con exito!',
        ok: true
    });
};

proyectoCtr.getTareasPendientes = (req, res) => {
    const user = req.params.User;
    const pendingTasks = tasksDB;
    const tareasPendientes = [];
    for (let task of pendingTasks) {
        if (task.User === user && task.Estatus === 0) {
            tareasPendientes.push(task);
        }
    }
    res.json(tareasPendientes);
};

proyectoCtr.getTareasRealizadas = (req, res) => {
    const user = req.params.User;
    const Tasks = tasksDB;
    const completedTasks = [];
    for (let task of Tasks) {
        if (task.User === user && task.Estatus === 1) {
            completedTasks.push(task);
        }
    }
    if (completedTasks.length > 0) {
        res.json({
            Tareas: completedTasks,
            msg: 'Tareas realizadas',
            ok: true
        });
    } else {
        res.json({
            Tareas: completedTasks,
            msg: 'Aún no se cuenta con tareas terminadas',
            ok: false
        });
    }
};

proyectoCtr.editStatus = (req, res) => {
    const user = req.body.User;
    const desc = req.body.Descripcion;
    const Tasks = tasksDB;
    let dirTareasDB = path.join(directoryRoot + '/Tareas.json');
    let tarea = {
        Nombre: '',
        Descripcion: '',
        Fecha: '',
        Fecha_Realizada: '',
        Importancia: '',
        Estatus: 0,
        User: ''
    };
    let index;
    for (let i = 0; i < Tasks.length; i++) {
        if (Tasks[i].Descripcion === desc && Tasks[i].User === user) {
            tarea = Tasks[i];
            index = i;
            break;
        }
    }
    tarea.Fecha_Realizada = new Date().toLocaleDateString();
    tarea.Estatus = 1;
    tasksDB[index] = tarea;
    saveChanges(tasksDB, dirTareasDB);
    res.status(200).send({
        msg: 'Actualizacion correcta!',
        update: tarea,
        ok: true
    });
};

// --------------------------------------- Frases ---------------------
proyectoCtr.saveQuote = (req, res) => {
    const body = req.body;
    let dirQuotesDB = path.join(directoryRoot + '/Frases.json');
    const newQuote = {
        Frase: { type: String },
        Autor: { type: String },
        Fecha: { type: String },
        User: { type: String },
        Motivo: { type: String }
    }
    newQuote.Autor = body.Autor;
    newQuote.Fecha = body.Fecha;
    newQuote.Frase = body.Frase;
    newQuote.Motivo = body.Motivo;
    newQuote.User = body.User;
    console.log('nueva frase: ', newQuote);
    const quotes = quotesDB;
    let validQuote;
    for (let i = 0; i < quotes.length; i++) {
        if (quotes[i].Fecha === newQuote.Fecha && quotes[i].User === newQuote.User) {
            validQuote = true;
        }
    }
    if (!validQuote) {
        quotesDB.push(newQuote);
        saveChanges(quotesDB, dirQuotesDB);
        res.status(200).send({
            msg: 'Frase guardada con exito!',
            ok: true
        });
    } else {
        res.status(200).send({
            msg: 'Ya has guardado esta frase!',
            ok: false
        });
    }
};

proyectoCtr.getQuotes = (req, res) => {
    const user = req.params.User;
    const quotes = quotesDB;
    const frasesUser = [];
    for (let i = 0; i < quotes.length; i++) {
        if (quotes[i].User === user) {
            frasesUser.push(quotes[i]);
        }
    }
    res.json(frasesUser);
};

proyectoCtr.deleteQuote = (req, res) => {
    const frase = req.body.Frase;
    const user = req.body.User;
    let dirQuotesDB = path.join(directoryRoot + '/Frases.json');
    const quotes = quotesDB;
    let index;
    for (let i = 0; i < quotes.length; i++) {
        if (quotes[i].Frase === frase && quotes[i].User === user) {
            index = i;
            break;
        }
    }
    quotesDB.splice(index, 1);
    saveChanges(quotesDB, dirQuotesDB);
    res.status(200).send({
        msg: 'Frase eliminada!',
        ok: true
    });
};

// -------------------------------------------- Ajustes --------------
proyectoCtr.createUbicacion = (req, res) => {
    let dirUbicationDB = path.join(directoryRoot + '/Ubicacion.json');
    const body = req.body;
    const newUbication = {
        cityName: { type: String },
        countryCode: { type: String },
        User: { type: String }
    };
    newUbication.User = body.User;
    newUbication.cityName = body.cityName;
    newUbication.countryCode = body.countryCode;
    ubicationDB.push(newUbication);
    saveChanges(ubicationDB, dirUbicationDB);
    res.status(200).send({
        msg: 'Ubicacion guardada correctamente!',
        ubicacion: newUbication,
        ok: true
    });
};

proyectoCtr.editUbicacion = async (req, res) => {
    const user = req.body.User;
    let dirUbicationDB = path.join(directoryRoot + '/Ubicacion.json');
    const newUbication = {
        cityName: { type: String },
        countryCode: { type: String },
        User: { type: String }
    };
    let index;
    const ubications = ubicationDB;
    const ubication = ubicationDB.find((usuario) => usuario.User === user);
    for (let i = 0; i < ubications.length; i++) {
        if (ubications[i].User === user) {
            index = i;
            break;
        }
    }

    if (ubication) {
        newUbication.cityName = req.body.cityName;
        newUbication.countryCode = req.body.countryCode;
        newUbication.User = ubication.User;

        ubicationDB[index] = newUbication;
        saveChanges(ubicationDB, dirUbicationDB);

        res.status(200).send({
            msg: 'Actualizacion correcta!',
            update: newUbication,
            ok: true
        });
    } else {
        res.status(200).send({
            msg: 'Usuario no encontrado!',
            ok: false
        });
    }
};

proyectoCtr.getUbicacionData = (req, res) => {
    const alias = req.params.Alias;
    const ub = ubicationDB.find((user) => user.User === alias);
    res.json(ub);
};

proyectoCtr.createDB = (req, res) => {
    let dir = path.join(__dirname + '/..' + '/DataBase');
    if (fs.existsSync(dir)) {
        console.log("exists:", dir);
    } else {
        console.log("DOES NOT exist:", dir);
        fs.mkdirSync(dir);
        console.log('Creado: ', dir);
    }
    let dbFrases = path.join(dir + '/Frases.json');
    let dbAjustes = path.join(dir + '/Ubicacion.json');
    let dbTareas = path.join(dir + '/Tareas.json');
    let dbUser = path.join(dir + '/Users.json');
    createFile(dbFrases);
    createFile(dbAjustes);
    createFile(dbTareas);
    createFile(dbUser);
    userDB = require('../DataBase/Users.json');
    tasksDB = require('../DataBase/Tareas.json');
    quotesDB = require('../DataBase/Frases.json');
    ubicationDB = require('../DataBase/Ubicacion.json');
    res.send({ ok: true });
};

function createFile(ruta) {
    if (!fs.existsSync(ruta)) {
        fs.writeFileSync(ruta, '[]', function (err) {
            if (err) throw err;
        });
    }
}

function saveChanges(DB, ruta) {
    fs.writeFileSync(ruta, JSON.stringify(DB, null, 2), {
        encoding: "utf-8",
    });
}


module.exports = proyectoCtr;