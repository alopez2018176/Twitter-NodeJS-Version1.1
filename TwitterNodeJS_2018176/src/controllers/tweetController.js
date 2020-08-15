'use strict'

var Usuario = require("../models/user")
var Tweet = require("../models/tweet");
const tweet = require("../models/tweet");

function postearTweet(req, res) {
    var tweet = new Tweet()
    var params = req.body.command.substring(10);

    if (params.length >= 1 && req.user.sub) {
        tweet.publicacion = params
        tweet.usuario = req.user.sub

        tweet.save((err, tweetPosteado) => {
            if (err) return res.status(500).send({ message: 'Error al publicar el tweet' })
            if (tweetPosteado) {
                res.status(200).send({ Tweet: tweetPosteado })
            } else {
                res.status(404).send({ message: 'No se ha podido publicar el tweet' })
            }
        })
    }
}

function eliminarTweet(req, res) {
    var tweetId = req.body.command.split(" ")

    Tweet.findByIdAndDelete(tweetId[1], (err, tweetEliminado) => {
        if (err) return res.status(500).send({ message: 'Error en la actualizacion de tweets' })
        if (!tweetEliminado) return res.status(404).send({ message: 'No se ha podido eliminar el tweet posteado' })
        return res.status(200).send({ message: 'Tweet eliminado', Tweet: tweetEliminado })
    })
}

function editarTweetPosteado(req, res) {
    var tweetId = req.body.command.split(" ")
    var params = req.body.command.substring(35);

    Tweet.findByIdAndUpdate(tweetId[1], { publicacion: params }, { new: true }, (err, tweetActualizado) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion de actualizar tweets posteados' } + err)
        if (!tweetActualizado) return res.status(404).send({ message: 'No se ha podido actualizar el tweet posteado' })
        return res.status(200).send({ Tweet: tweetActualizado })
    })
}

function viewtweets(req, res) {
    var params = req.body.command.split(" ")

    Usuario.findOne({ usuario: params[1] }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion de encontrar perfil de usuario' })
        if (!usuarioEncontrado) return res.status(404).send({ message: 'No se ha podido encontrar el usuario' })
        if (req.user.sub != usuarioEncontrado._id){
            
            Usuario.findOne({ _id: req.user.sub, 'seguidos.username': params[1] }, (err, usuarioSeguido) => {
                if (err) return res.status(500).send({ message: "Error en la peticion de visualizar tweets" })
                if (!usuarioSeguido) return res.status(404).send({ message: "Usted no puede ver los tweets de este usuario porque aun no lo sigue" })
            })
        }
            Tweet.find({ usuario: usuarioEncontrado._id }, (err, tweetPosteados) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion de visualizar tweets' })
                if (!tweetPosteados) return res.status(404).send({ message: 'No se ha podido encontrar los tweets posteados por los usuarios' })
                return res.status(200).send({ Tweets: tweetPosteados })
            })
        
    })
}

function likeTweet(req,res){
    var params = req.body.command.split(" ")
    
    Tweet.findOne({_id: params[1]}, (err, tweetPosteado)=>{
        if(err) return res.status(500).send({ message: 'Error en la peticion de encontrar tweets' })
        if(!tweetPosteado) return res.status(404).send({ message: 'No se ha encontrado el tweet' + params[1]})
                
        Tweet.findOne({_id: params[1], 'likes.username': req.user.sub}, (err, likeTweet)=>{
            if(err) return res.status(500).send({ message: 'Error en la peticion de tweets' })
            if(!likeTweet){
                Tweet.findByIdAndUpdate({_id: params[1]}, {$push: {likes: {username: req.user.sub}}, $inc: {noLikes:1}},{new:true},(err,nuevoLike)=>{
                    if(err) return res.status(500).send({ message: 'Error en la peticion de darle like a tweets' })
                    if(!nuevoLike) return res.status(404).send({ message: 'No fue posible darle like a este tweet' })
                    return res.status(200).send({message: "Like", Tweet: nuevoLike})
                    
                })
            }else{
                Tweet.findByIdAndUpdate({_id: params[1]}, {$pull: {likes: {username: req.user.sub}},$inc: {noLikes:-1}},{new:true},(err,quitarLike)=>{
                    if(err) return res.status(500).send({ message: 'Error en la peticion de darle like a tweets' })
                    if(!quitarLike) return res.status(404).send({ message: 'No fue posible quitar este like al tweet' })
                    return res.status(200).send({message: "DisLike", Tweet: quitarLike});
                })
            }
        })

    })
}

function commentTweet(req,res){
    
    var tweetId = req.body.command.split(" ")
    var params = req.body.command.substring(37)

    Tweet.findById(tweetId[1],(err, tweetEncontrado)=>{
        if(err) return res.status(500).send({message: 'Error en la petición de busquedad de tweet'+err})
        if(!tweetEncontrado) return res.status(404).send({message: 'No se ha podido encontrar el tweet ingresado'})

        Tweet.findByIdAndUpdate(tweetId[1], {$push: {comments: {comment: params, usercomment: req.user.sub}}, $inc: {noComments: 1}} ,{new: true},(err, comentarioTweet)=>{
            if(err) return res.status(500).send({message: 'Error en la peticion de comentarios del tweet'})
            if(!comentarioTweet) return res.status(404).send({message: 'No se ha podido agregar el comentario'})
            comentarioTweet.comments = comentarioTweet.comments.length
            comentarioTweet.likes = comentarioTweet.likes.length
            return res.status(200).send({message: 'New reply', reply: comentarioTweet})
        })
    })

}

function retweetTweet(req,res){
    var tweetId = req.body.command.split(" ")
    var params = req.body.command.substring(33)

    Tweet.findOne({_id: tweetId[1]},(err, tweetShare)=>{
        if(err) return res.status(500).send({message: 'Error en la peticion de retweets' })
        if(!tweetShare) return res.status(404).send({message: 'No se ha podido encontrar el tweet ingresado'})
        
        Tweet.findOne({_id: tweetId[1], 'retweets.userRetweet': req.user.sub}, (err, tweetShared)=>{
            if(err) return res.status(500).send({message: 'Error en la petición de busqueda de tweets'})
            if(!tweetShared){
                Tweet.findByIdAndUpdate(tweetId[1], {$push: {retweets: {userRetweet: req.user.sub, meditate: params}}, $inc: {noRetweets:1}}, {new:true},(err,nuevoRetweet)=>{
                    if(err) return res.status(500).send({ message: 'Error en la peticion de compartir retweets' })
                    if(!nuevoRetweet) return res.status(404).send({ message: 'No fue posible darle retweet a este tweet' })
                    return res.status(200).send({message: "Retweet", ReTweet: nuevoRetweet});
                })
            }else{
                Tweet.findByIdAndUpdate(tweetId[1], {$pull: {retweets: {userRetweet: req.user.sub, meditate: params}}, $inc: {noRetweets:-1}}, {new:true},(err,quitarRetweet)=>{
                    if(err) return res.status(500).send({ message: 'Error en la peticion de deshacer retweets' })
                    if(!quitarRetweet) return res.status(404).send({ message: 'No fue posible quitar este retweet al tweet'})
                    return res.status(200).send({message: "DisRetweet", ReTweet: quitarRetweet});
                })
            }

        })
            
    })
}

module.exports = {
    postearTweet,
    eliminarTweet,
    editarTweetPosteado,
    viewtweets,
    likeTweet,
    commentTweet,
    retweetTweet
}