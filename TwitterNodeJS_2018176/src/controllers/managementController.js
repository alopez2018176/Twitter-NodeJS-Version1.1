'use strict'

const userController = require('../controllers/userController')
const tweetController = require('../controllers/tweetController')
const md_auth = require('../middlewares/authenticated')

function goFunctionController(req,res){
    var comando = req.body.command.toLowerCase();
    var params = comando.split(' ')[0];
    console.log(params);

    switch(params){
        case 'register':
            userController.registrarUsuario(req,res);
        break;
        case 'delete_user':
            userController.eliminarUsuario(req,res);
        break;
        case 'login':
            userController.login(req,res);
        break;
        case 'follow':
            md_auth.ensureAuth(req,res)
            userController.follow(req,res)
        break;
        case 'unfollow':
            md_auth.ensureAuth(req,res)
            userController.unfollow(req,res)
        break;
        case 'profile':
            md_auth.ensureAuth(req,res)
            userController.profileUser(req,res)
        break;
        case 'add_tweet':
            md_auth.ensureAuth(req,res)
            tweetController.postearTweet(req,res)
        break;
        case 'delete_tweet':
            md_auth.ensureAuth(req,res)
            tweetController.eliminarTweet(req,res)
        break;
        case 'edit_tweet':
            md_auth.ensureAuth(req,res)
            tweetController.editarTweetPosteado(req,res)
        break;
        case 'view_tweets':
            md_auth.ensureAuth(req,res)
            tweetController.viewtweets(req,res)
        break;
        case 'like_tweet':
            md_auth.ensureAuth(req,res)
            tweetController.likeTweet(req,res)
        break;
        case 'reply_tweet':
            md_auth.ensureAuth(req,res)
            tweetController.commentTweet(req,res)
        break;
        case 'retweet':
            md_auth.ensureAuth(req,res)
            tweetController.retweetTweet(req,res)
        break;
        default:
            return res.status(404).send({message: "Debe ingresar un metodo correcto"})  
    }
}

module.exports = goFunctionController;