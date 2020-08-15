'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'clave_secreta_2018176'

exports.ensureAuth = function(req,res){
    if(!req.headers.authorization){
        return res.status(403).send({mesagge: 'La petición no tiene la cabecera de autenticación'})
    }

    var token= req.headers.authorization.replace(/['"]+/g, "")

    try{
        var payload =jwt.decode(token, secret)
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                mesagge: 'El token ha expirado'
            })
        }
    } catch(error){
        return res.status(404).send({
            mesagge: 'El token no es valido'
        })
    }

    req.user = payload
}