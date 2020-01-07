'use strict';
const validator = require('validator');
const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const jwt = require('../services/jwt');


const controller = {

	probando: function(req,res){
		return res.status(200).send({
			message:'Soy el metodo probando'
		});
	},

	testeando:function(req,res){
		return res.status(200).send({
			message:'Soy el metodo testeando'
		});
	},

	save:function(req,res){
		//recoger los parametros de la peticion
		const params = req.body;
		
		
		//validar los datos
		try{
			let validate_name = validator.isEmpty(params.name);
			let validate_surname = validator.isEmpty(params.surname);
			let validate_email = validator.isEmpty(params.email) && validator.isEmail(params.email);
			let validate_password = validator.isEmpty(params.password);

			if(validate_name || validate_surname ||validate_email || validate_password){
				return res.status(400).send({
					'message':'La validacion de los datos del usuario incorrecta, intentalo de nuevo'
				});
			}
		}catch(err){
			return res.status(404).send({
				'message':'Faltan datos por enviar'
			});
		}
			//crear objeto de usuario
			const user = new User();

			//asignar valores al objeto
			user.name = params.name;
			user.surname = params.surname;
			user.email = params.email.toLowerCase();
			user.role = 'ROLE_USER';
			user.image = null;

			//comprobar si el usuario existe en la bd
			User.findOne({email:user.email},(err,issetUser)=>{
				if(err){
					return res.status(500).send({
						'message':'error al comprobar duplicidad de usuario'
					});
				}

				if(!issetUser){
					//si no existe el usuario cifrar la clave
					bcrypt.hash(params.password,null,null,(error,hash)=>{
						user.password = hash;

						//guardar el objeto
						user.save((error,userSaved)=>{
							if(err){
								return res.status(500).send({
									'message':'Error al guardar el usuario'
								});
							}
							if(!userSaved){
								return res.status(400).send({
									'message':'El usuario no se ha guardado'
								});
							}

							//devolver respuesta
							return res.status(200).send({
								'status':'success',
								'user':userSaved
							}); 
						})
					});

				}else{
					return res.status(500).send({
						'message':'El usuario ya se encuentra registrado'
					});
				}
			});
		},

		login:function(req,res){
		//recoger los parametros de la peticion
		const params = req.body;

		//validar los datos
		let validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
		let validate_password = !validator.isEmpty(params.password);

		if(!validate_email || !validate_password){
			return res.status(400).send({
				'message':'El E-mail y contraseña son requeridos'
			});	
		}

		//buscar usuarios que coincidan con el email
		User.findOne({email:params.email.toLowerCase()},(err,user)=>{

			if(err){
				return res.status(500).send({
					'message':'Error al identificarse'
				});
			}

			if(!user){
				return res.status(404).send({
					'message':'El usuario no se encuentra registrado'
				});
			}

			// si existe el usuario comprobar su contraseña
			bcrypt.compare(params.password,user.password,(err,check)=>{
				if(check){
					//generar token de jwt y devolverlo
					if(params.gettoken){
						//devolver el token
						return res.status(200).send({
							token:jwt.createToken(user)
						});
					}else{
						//limpiar el objeto
						user.password = undefined;

						//devolver el usuario autenticado
						return res.status(200).send({
							'status':'success',
							'user':user
						});
					}

				}else{
					return res.status(404).send({
						'message':'Las credenciales no son correctas'
					});
				}
				
			});
		});
	},

	update:function(req,res){
		// crear middleware para comprobar el jwt token y ponerselo a la ruta
		// el middleware es un metodo que se ejecuta antes de la accion de un controlador

		//recoger los datos del usuario
		const params = req.body;

		//validar datos
		try{
			const validate_name = !validator.isEmpty(params.name);
			const validate_surname = !validator.isEmpty(params.surname);
			const validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			if(!validate_name || !validate_surname || !validate_email){
				return res.status(404).send({
					'message':'Validacion de los datos incorrecta, intentalo de nuevo'
				});
			}
			
		}catch(err){
			return res.status(404).send({
				'message':'Faltan datos por enviar'
			});
		}

		//eliminar propiedades innecesarias
		delete params.password;

		const user_id = req.user.sub;

		//comprobar si el email es unico
		if(req.user.email != params.email){
			User.findOne({email:params.email.toLowerCase()},(err,user)=>{
				if(err){
					return res.status(500).send({
						'message':'Error al identificarse'
					});
				}
				if(user && user.email==params.email){
					return res.status(200).send({
						'message':'El email no puede ser modificado'
					});
				}else{
					//buscar y actualizar documento 
					User.findOneAndUpdate({_id:user_id},params,{new:true},(err,user)=>{
						if(err){
							return res.status(500).send({
								'status':'error',
								'message':'Error al actualizar usuario'
							});
						}

						if(!user){
							return res.status(200).send({
								'status':'error',
								'message':'No se ha actualizado el usuario'
							});
						}
						//devolver una respuesta
						return res.status(200).send({
							'status':'success',
							'user':user
						});
					});
				}
			});
		}else{
			//buscar y actualizar documento 
			User.findOneAndUpdate({_id:user_id},params,{new:true},(err,user)=>{
				if(err){
					return res.status(500).send({
						'status':'error',
						'message':'Error al actualizar usuario'
					});
				}

				if(!user){
					return res.status(200).send({
						'status':'error',
						'message':'No se ha actualizado el usuario'
					});
				}

			//devolver una respuesta
			return res.status(200).send({
				'status':'success',
				'user':user
			});
		});
		}
	},

	uploadAvatar:function(req,res){
		//configurar modulo multiparty para habilitar subida de ficheros 
		//routes/user.js

		//recoger el fichero de la peticion
		let file_name = 'Avatar no subido...';

		
		if(!req.files){	
			return res.status(404).send({
				'status':'error',
				'message':file_name
			});
		}

		//conseguir el nombre y la extension del archivo subido
		const file_path = req.files.file0.path;
		const file_split = file_path.split('\\');

		//advertencia= en linux o mac file_path.split('/');
		//nombre del archivo
		file_name = file_split[2];

		//extension del archivo
		let ext_split = file_name.split('\.');
		let file_ext = ext_split[1];

		//comprobar la extension(imagen) si no es valida borrar fichero subido
		if(file_ext!='png' && file_ext!='jpg' && file_ext!='jpeg' && file_ext!='gif'){
			fs.unlink(file_path,(err)=>{
				
				return res.status(400).send({
					'status':'error',
					'message':'La extension del archivo no es valida'
				});
			});
		}else{

			//sacar el id del usuario identificado
			let user_id = req.user.sub;

			//Buscar y actualizar documento db
			User.findOneAndUpdate({_id:user_id},{image:file_name},{new:true},(err,user)=>{

				if(err || !user){
					return res.status(500).send({
						'status':'error',
						'message':'Error al guardar el usuario'
					});
				}

				//devolver respuesta
				return res.status(200).send({
					'status':'success',
					'message':'Upload Avatar',
					'user':user
				});
			});

		}
	},

	avatar:function(req,res){
		let fileName = req.params.fileName;
		let pathFile = './uploads/users/'+fileName;

		fs.exists(pathFile,(file)=>{
			if(file){
				return res.sendFile(path.resolve(pathFile));
			}else{
				return res.status(404).send({
					'message':'La imagen no existe'
				});
			}
		});
	},

	getUsers:function(req,res){
		User.find().exec((err,users)=>{
			if(err || !users){
				return res.status(404).send({
					'status':'error',
					'message':'No hay usuarios que mostrar'
				});
			}
			return res.status(200).send({
				'status':'success',
				'users':users
			});

		});
	},

	getUser:function(req,res){
		let userId = req.params.userId;
		User.findById(userId).exec((err,user)=>{
			if(err || !user){
				return res.status(404).send({
					'status':'error',
					'message':'No existe el usuario'
				});
			}
			return res.status(200).send({
				'status':'success',
				'user':user
			});
		});
	}


};


module.exports = controller;


