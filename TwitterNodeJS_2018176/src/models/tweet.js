'use strict'

var mongoose= require('mongoose')
var Schema = mongoose.Schema;

var TweetSchema = Schema({
    publicacion: String,
    usuario: { type: Schema.ObjectId, ref: 'usuario' },
    noLikes: Number,
    noComments: Number,
    noRetweets: Number,
    likes:[{
        username: String
    }],
    comments:[{
        comment: String,
        usercomment: String
    }],
    retweets:[{
        userRetweet:String,
        meditate: String,
        reference: { type: Schema.ObjectId, ref: 'tweet'},
    }]

})

module.exports = mongoose.model('tweet', TweetSchema);
