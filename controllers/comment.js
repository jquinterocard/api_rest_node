'use strict';

const validator = require('validator');
const Topic = require('../models/topic');


const controller = {

	add:function(req,res){
		//recoger el id del topic de la url
		var topicId = req.params.topicId;
		var content = req.body.content;
		//find por id del topic
		Topic.findById(topicId).exec((err,topic)=>{
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
			
			//validar datos
			try{
				var validate_content = validator.isEmpty(content);
			}catch(ex){
				return res.status(200).send({
					'status':'error',
					'message':'No has comentado nada!!'
				});
			}
			if(validate_content){
				return res.status(400).send({
					'status':'error',
					'message':'Ingresa un comentario'
				});
			}
			
			var comment = {
				user:req.user.sub,
				content:content
			};

			//en la propiedad comment del objeto resultante hacer un push
			topic.comments.push(comment);

			//guardar el topic completo
			topic.save((err)=>{
				if(err){
					return res.status(500).send({
						'status':'error',
						'message':'Error al guardar el comentario'
					});
				}

				Topic.findById(topic._id)
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
			});
		});		
	},

	update:function(req,res){
		//conseguir el id del comentario de la url
		var commentId = req.params.commentId;

		//recoger datos por el body y validar
		var content = req.body.content;
		try{
			var validate_content = validator.isEmpty(content);
		}catch(ex){
			return res.status(500).send({
				'status':'error',
				'message':'No has comentado nada'
			});
		}

		if(validate_content){
			return res.status(404).send({
				'status':'error',
				'message':'Ingresa un comentario valido'
			});
		}

		//Find and update de subdocumento de un comentario
		Topic.findOneAndUpdate(
			{'comments._id':commentId},
			{
				'$set':{
					'comments.$.content':content
				}
			},
			{new:true},
			(err,topicUpdated)=>{
				if(err){
					return res.status(500).send({
						'status':'error',
						'message':'Error en la peticion'
					});
				}

				if(!topicUpdated){
					return res.status(404).send({
						'status':'error',
						'message':'No existe el tema'
					});
				}

				//devolver respuesta
				return res.status(200).send({
					'status':'success',
					'topic':topicUpdated
				});
			});

		
	},

	delete:function(req,res){
		//sacar el id del topic y del comentario a borrar de la url
		var {topicId,commentId} = req.params;
		//buscar el topic
		Topic.findById(topicId,(err,topic)=>{
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
			//seleccionar el subdocumento (comentario) 
			var comment = topic.comments.id(commentId);

			//borrar el comentario
			if(!comment){
				return res.status(404).send({
					'status':'error',
					'message':'No existe el comentario'
				});
			}
			comment.remove();

			//guardar el topic
			topic.save((err)=>{
				if(err){
					return res.status(500).send({
						'status':'error',
						'message':'Error en la peticion'
					});
				}
				Topic.findById(topic._id)
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
			});			
		});
	},
};

module.exports = controller;
