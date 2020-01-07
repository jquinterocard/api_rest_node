// este middleware se encargar de verificar si
//llegan las cabeceras de Autenticacion
'use strict';

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'clave-secreta-para-generar-el-token-9999';

exports.authenticated = function(req,res,next){

	// comprobar si llega autorizacion
	if(!req.headers.authorization){
		return res.status(403).send({
			'message':'La peticion no tiene la cabecera de autorizacion'
		});
	}

	//limpiar el token y quitar comillas
	const token = req.headers.authorization.replace(/['"]+/g,'');

	
	try{
		//decodificar el token
		var payload = jwt.decode(token,secret);
		//comprobar si el token ha expirado
		if(payload.exp <= moment().unix()){
			return res.status(404).send({
				'message':'El token ha expirado'
			});
		}

	}catch(ex){
		return res.status(404).send({
			'message':'El token no es valido'
		});
	}

	//adjuntar usuario identificado a la request
	req.user = payload;

	//pasar a la accion del controlador en este caso update
	next();

};
