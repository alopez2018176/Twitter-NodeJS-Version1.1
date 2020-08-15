'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'clave_secreta_2018176';

exports.createToken = function (User){
    var payload = {
        sub: User._id,
        nombre: User.nombre,
        usuario: User.usuario,
        email: User.email,
        ubicacion: User.ubicacion,
        iat: moment().unix(),
        exp: moment().day(30, 'days').unix() 
     }
     return jwt.encode(payload, secret)

}