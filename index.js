'use strict';

const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3999;

mongoose.set('useFindAndModify',false);
mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost:27017/api-rest-node',{useUnifiedTopology:true,useNewUrlParser:true})
		.then(()=>{
			console.log('La conexion a la base de datos de mongo se ha realizado correctamente');
			
			//Crear el servidor
			app.listen(port,()=>{
				console.log('El servidor http://localhost:3999 esta funcionando');
			});
		})
		.catch(error=>console.log(error));





