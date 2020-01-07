'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// definicio del esquema
//en mongodb el id es con _id
const UserSchema = Schema({
	name:String,
	surname:String,
	email:String,
	password:String,
	image:String,
	role:String
});

//eliminar propiedad password de las respuestas json 
UserSchema.methods.toJSON = function(){
	var obj = this.toObject();
	delete obj.password;
	return obj;
}

module.exports = mongoose.model('User',UserSchema);
								//lowercase y pluralizar el nombre
								//la coleccion de datos se llamara users->documentos(schema)
