'use strict'

var bcrypt = require('bcrypt-nodejs')
var Usuario = require('../models/user')
var Tweet = require('../models/tweet')
var jwt = require("../services/jwt")


function login(req,res){
    var params = req.body.command.split(" ")

    Usuario.findOne({ email: params[1] }, (err, usuario)=>{
        if(err) return res.status(500).send({ message: 'Error en la petición de Usuarios'})

        if(usuario){
            bcrypt.compare(params[2], usuario.password, (err, check)=>{
                if(check){
                    if(params[3]){
                        return res.status(200).send({
                            token: jwt.createToken(usuario)
                        })
                    }else{
                        usuario.password = undefined;
                        return res.status(200).send({ Usuario: usuario})
                    }
                }else{
                    return res.status(404).send({ message: 'El usuario no se ha podido identificar'})
                }
            })
        }else{
            return res.status(404).send({ message: 'El usuario no ha podido ingresar al sistema'})
        }
    })
}

function registrarUsuario(req,res){
    var usuario = new Usuario()
    var params = req.body.command.split(" ");

    if(params.length==6){
        usuario.nombre = params[1]
        usuario.usuario = params[2]
        usuario.email= params[3]
        usuario.ubicacion = params[5]

        Usuario.find({ $or: [
            {nombre: usuario.nombre},
            {email: usuario.email}
        ]}).exec((err, usuarios)=>{
            if(err) return res.status(500).send({message: 'Error en la peticion de Usuarios existentes'})
            if(usuarios && usuarios.length >= 1){
                return res.status(404).send({message: 'El usuario ya se encuentra registrado en la red'})  
            }else{
                bcrypt.hash(params[4], null, null, (err, hash)=>{
                    usuario.password= hash;
                    usuario.save((err, usuarioRegistrado)=>{
                        if(err) return res.status(500).send({message: 'Error al guardar los datos del usuario'})
                        if(usuarioRegistrado){
                            return res.status(200).send({Usuario: usuarioRegistrado})
                        }else{
                            return res.status(404).send({message: 'No se ha podido registrar el usuario deseado'})
                        }
                    })
                })
            }
        })
    }
}

function eliminarUsuario(req,res){
    var userId = req.body.command.split(" ")

    
    Usuario.findByIdAndDelete(userId[1], (err, usuarioEliminado) =>{
        if(err) return res.status(500).send({ message: 'Error en la peticion de borrar usuario' })
        if(!usuarioEliminado) return res.status(404).send({ message: 'No se ha podido eliminar el usuario de la red'+err })
        Tweet.deleteMany({usuario: userId[1]},(err, tweetEliminado)=>{
            return res.status(200).send({ message: 'Usuario eliminado', Usuario: usuarioEliminado})
        })
    }) 
}

function profileUser(req,res){
    var params = req.body.command.split(" ")

    if(params.length==2){
        
        Usuario.findOne({usuario: params[1]}, {password: 0},(err, usuarioEncontrado)=>{
           if(err) return res.status(200).send({message: "Error en la petición de perfiles de usuario"}) 
           if(!usuarioEncontrado) return res.status(404).send({message: "No se ha podido encontrar el usuario"})
            
           Usuario.find({'seguidos.username': params[1]}, {usuario:1}, (err, followers)=>{
                if(err) return res.status(200).send({message: "Error en la petición de perfiles de usuario seguidos"}) 
            
                Tweet.find({usuario: usuarioEncontrado._id},(err, tweetEncontrado)=>{
                    if(err) return res.status(200).send({message: "Error en la petición de tweets del usuario"}) 
                    return res.status(200).send({Usuario: usuarioEncontrado, followers, tweetEncontrado});
                })
            

            })
        
        });

    }else{
        return res.status(404).send({message: "Por favor rellene todos los campos"})
    }
}

function follow(req,res){
    var params = req.body.command.split(" ")
    
    Usuario.findOne({usuario: params[1]}, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ message: 'Error en la peticion de borrar usuario' })
        if(!usuarioEncontrado) return res.status(404).send({ message: 'No se ha encontrado el usuario' + params[1]})
        
        if(usuarioEncontrado._id==req.user.sub) return res.status(404).send({message: "Usted no puede seguirse a si mismo"})
        
        Usuario.findOne({_id: req.user.sub, 'seguidos.username': params[1]}, (err, usuarioSeguido)=>{
            if(err) return res.status(500).send({ message: 'Error en la peticion de usuarios' })
            if(usuarioSeguido) return res.status(404).send({ message: 'Usted ya sigue a este usuario' })
            
            Usuario.findByIdAndUpdate({_id: req.user.sub}, {$push: {seguidos: {username: params[1]}}}, {new:true},(err,nuevoSeguido)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de seguir a usuarios' })
                if(!nuevoSeguido) return res.status(404).send({ message: 'Usted ya sigue a este usuario' })
                return res.status(200).send({message: "Nuevo usuario seguido", Usuario: nuevoSeguido});
            })
        })

    })
}

function unfollow(req,res){
    var params = req.body.command.split(" ")
    
    Usuario.findOne({_id: req.user.sub, 'seguidos.username': params[1]}, (err, unfollowUsuario)=>{
        if(err) return res.status(500).send({ message: 'Error en la peticion de usuarios' })
        if(!unfollowUsuario) return res.status(404).send({ message: 'Usted no sigue a este usuario' })
        
        Usuario.findByIdAndUpdate({_id: req.user.sub}, {$pull: {seguidos: {username: params[1]}}}, {new:true}, (err,unfollow)=>{
            if(err) return res.status(500).send({ message: 'Error en la peticion de seguir a usuarios' })
            if(!unfollow) return res.status(404).send({ message: 'No se encuentra al usuario que sigue' })
            return res.status(200).send({message: "Has dejado de seguir una persona", Usuario: unfollow});
        })
    })
}

module.exports = {
    login,
    registrarUsuario,
    eliminarUsuario,
    profileUser,
    follow,
    unfollow
}
