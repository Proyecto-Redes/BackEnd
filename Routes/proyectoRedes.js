const express = require('express');
const proyectoRedes = require('../Controllers/scriptsRedes');
const router = express.Router();

// user
router.post('/create-user', proyectoRedes.createUser);
router.get('/get-user/:Alias', proyectoRedes.getUserData);
router.post('/valid-user', proyectoRedes.authUser);
// tareas
router.post('/create-task', proyectoRedes.createTarea);
router.get('/get-pendingTasks/:User', proyectoRedes.getTareasPendientes);
router.get('/get-completedTasks/:User', proyectoRedes.getTareasRealizadas);
router.post('/edit-task', proyectoRedes.editStatus);
// frases
router.post('/save-quote', proyectoRedes.saveQuote);
router.get('/get-quotes/:User', proyectoRedes.getQuotes);
router.post('/delete-quote', proyectoRedes.deleteQuote);
// ubicacion
router.post('/create-ubicacion', proyectoRedes.createUbicacion);
router.get('/get-ubicacion/:Alias', proyectoRedes.getUbicacionData);
router.post('/edit-ubicacion', proyectoRedes.editUbicacion);
// Prueba
router.get('/create-db', proyectoRedes.createDB);

module.exports = router;