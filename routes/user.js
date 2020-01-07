'use strict';

const express = require('express');
const userController = require('../controllers/user');


const router = express.Router();
const md_auth = require('../middlewares/authenticated');

const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir:'./uploads/users'});


//rutas de prueba
router.get('/probando',userController.probando);
router.post('/testeando',userController.testeando);

//rutas de usuarios
router.post('/register',userController.save);
router.post('/login',userController.login);
router.put('/user/update',md_auth.authenticated,userController.update);
router.post('/upload-avatar',[md_auth.authenticated,md_upload],userController.uploadAvatar);
router.get('/avatar/:fileName',userController.avatar);
router.get('/users',userController.getUsers);
router.get('/user/:userId',userController.getUser);

//rutas de topics


module.exports = router;
