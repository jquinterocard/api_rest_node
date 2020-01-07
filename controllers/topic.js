'use strict';

const validator = require('validator');
const Topic = require('../models/topic');


const controller = {
	
	save:function(req,res){
		//recoger parametros por post
		var {title,content,code,lang} = req.body;

		//validar los datos
		try{
			var validate_title = validator.isEmpty(title);
			var validate_content = validator.isEmpty(content);
			var validate_lang = validator.isEmpty(lang);

		}catch(ex){
			return res.status(400).send({
				'message':'Faltan datos por enviar'
			});
		}	

		if(validate_title || validate_content || validate_lang){
			return res.status(400).send({
				'message':'Los campos son requeridos'
			});
		}

		//crear el objeto a guardar
		var topic = new Topic();

		//asignar valores
		topic.title = title;
		topic.content = content;
		topic.lang = lang;
		topic.code = code;
		topic.user = req.user.sub;

		//guardar el topic
		topic.save((err,topicStored)=>{
			if(err || !topicStored){
				return res.status(404).send({
					'status':'error',
					'message':'El tema no se ha guardado'
				});
			}
			//devolver respuesta
			return res.status(200).send({
				'status':'success',
				'topic':topicStored
			});
		});		
	},

	getTopics:function(req,res){
		//cargar la libreria de paginacion en el modelo tipic.js

		//recoger la pagina actual de la url
		var page = 1;
		if(req.params.page && req.params.page>0){
			page = parseInt(req.params.page);
		}
		
		//indicar las opciones de paginacion
		var options = {
			sort:{date: -1},
			populate:'user',
			limit:5,
			page:page
		};

		//Find paginado
		Topic.paginate({},options,(err,topics)=>{

			if(err){
				return res.status(500).send({
					'status':'error',
					'message':'Error al hacer la consulta'
				});	
			}

			if(!topics){
				return res.status(404).send({
					'status':'error',
					'message':'No hay topics'
				});
			}

			//devolver resultado (tipics,total de topics,total de paginas)
			return res.status(200).send({
				'status':'success',
				'topics':topics.docs,
				'totalDocs':topics.totalDocs,
				'totalPages':topics.totalPages
			});
		});
	},

	getTopicsByUser:function(req,res){
		//conseguir el id del usuario
		var userId = req.params.user;
		//find con una condicion de usuario
		Topic.find({
			user:userId
		})
		.sort([['data','descending']])
		.exec((err,topics)=>{
			if(err){
				return res.status(500).send({
					'status':'error',
					'message':'Error en la peticion'
				});
			}
			if(!topics){
				return res.status(404).send({
					'status':'error',
					'message':'No hay temas para mostrar'
				});
			}
			//devolver resultado
			return res.status(200).send({
				'status':'success',
				'topics':topics
			});
		});
	},
	getTopic:function(req,res){
		//sacar el id del topic de la url
		var topicId = req.params.id;
		//find por id del topic
		Topic.findById(topicId)
		.populate('user')
		.populate('comments.user')
		.exec((err,topic)=>{
			if(err){
				return res.status(500).send({
					'status':'error',
					'message':'Error en la peticion'
				});
			}

			if(!topic){
				return res.status(404).send({
					'status':'error',
					'message':'No existe el tema'
				});
			}
			//devolver resultado
			return res.status(200).send({
				'status':'success',
				'topic':topic
			});

		});
	},

	update:function(req,res){
		//recoger el id del topic de la url
		var topicId = req.params.id;
		//recoger los datos que llegan desde put
		var {title,content,code,lang} = req.body;
		//validar datos
		try{
			var validate_title = validator.isEmpty(title);
			var validate_content = validator.isEmpty(content);
			var validate_lang = validator.isEmpty(lang);

		}catch(ex){
			return res.status(400).send({
				'message':'Faltan datos por enviar'
			});
		}

		if(validate_title || validate_content || validate_lang){
			return res.status(400).send({
				'message':'Los campos son requeridos'
			});
		}

		//montar json con los datos modificables
		var update = {
			title: title,
			content:content,
			code:code,
			lang:lang
		};

		//find and update del topic  por id y por id de usuario
		Topic.findOneAndUpdate({
			_id:topicId,
			user:req.user.sub
		},update,{new:true},(err,topicUpdated)=>{
			if(err){
				return res.status(500).send({
					'status':'error',
					'message':'Error en la peticion'
				});	
			}

			if(!topicUpdated){
				return res.status(404).send({
					'status':'error',
					'message':'No se ha actualizado el tema'
				})
			}

			//devolver respuesta
			return res.status(200).send({
				'status':'success',
				'topic':topicUpdated
			});
		});
		
	},
	delete:function(req,res){
		//sacar el id del topic de la url
		var topicId = req.params.id;
		//find and delete por topicID y por userID es decir el usuario que creo este topic
		Topic.findOneAndDelete({
			_id:topicId,
			user:req.user.sub
		},(err,topicRemoved)=>{
			if(err){
				return res.status(500).send({
					'status':'error',
					'message':'Error en la peticion'
				});	
			}
			if(!topicRemoved){
				return res.status(404).send({
					'status':'error',
					'message':'No se ha borrado el tema'
				})
			}
			//devolver respuesta
			return res.status(200).send({
				'status':'success',
				'topic':topicRemoved
			});
		});
		
	},

	search:function(req,res){
		//sacar el string a buscar de la url
		var search = req.params.search;
		//findOr
		Topic.find({'$or':[
			{'title':{'$regex':search,'$options':'i'}},
			{'content':{'$regex':search,'$options':'i'}},
			{'lang':{'$regex':search,'$options':'i'}},
			{'code':{'$regex':search,'$options':'i'}}
			]})
		.sort([['date','descending']])
		.populate('user')
		.exec((err,topics)=>{
			if(err){
				return res.status(500).send({
					'status':'error',
					'message':'Error en la peticion'
				});	
			}
			if(!topics || topics.length==0){
				return res.status(404).send({
					'status':'error',
					'message':'No hay temas disponibles'
				});
			}

			//devolver el resultado
			return res.status(200).send({
				'status':'success',
				'topics':topics
			});
		});

		
	}

};


module.exports = controller;
