var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    nev = require('email-verification')(mongoose);
var global = require('../global/config');
var accountSchema = require('../model/model').accountSchema;
var accountModel = mongoose.model('Account', accountSchema);
var bCrypt = require('bcrypt-nodejs');
var Util = require('../lib/util');
var async = require('async');
var crypto = require('crypto');
var bCrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
var mysql = require('promise-mysql');
var md5 = require('md5');
var fs = require('fs');


router.put('/image/:id', (req, res) => {
    var filepath = 'avatars/' + req.params.id + 'd.jpg';
    var photoData = req.body.image;
    if(!photoData.includes('http')) {
        uploadPhoto(photoData, filepath);
        filepath = Util.SERVER_URL + filepath;
    }
    var connection;
        mysql.createConnection({
            host: global.host,
            user: global.username,
            password: global.password,
            database: global.database
        }).then(function (conn) {
            connection = conn;
            sql = 'UPDATE users SET `imagelocation`="' + filepath + '" WHERE `id`="' + req.params.id + '"';
            connection.query(sql, function (error){
                if (error) res.send ({success:false, message:'Error'});
                else res.send ({success:true, message:'succesfully'});
            });
        });
});


router.put('/password/:id', (req, res) => {
    var connection;
        mysql.createConnection({
            host: global.host,
            user: global.username,
            password: global.password,
            database: global.database
        }).then(function (conn) {
            connection = conn;
            console.log (req.body.password);
            sql = 'UPDATE users SET `password`="' + req.body.password + '" WHERE `id`="' + req.params.id + '"';
            connection.query(sql, function (error){
                if (error) res.send ({success:false, message:'Error'});
                else res.send ({success:true, message:'succesfully'});
            });
        });
});

router.delete('/close/:id', (req, res) => {
    accountModel.remove({
        _id: mongoose.Types.ObjectId(req.params.id)
    }, (err) => {
        if (err) res.send({
            success: false,
            message: 'Error'
        });
        else {
            res.send({
                success: true,
                message: 'Successfully closed the account'
            });
        }
    });
});
function uploadPhoto(data, filepath) {
    data = data.replace(/^data:image\/jpeg;base64,/, "");
    data = data.replace(/^data:image\/png;base64,/, "");
    var imageBuffer = new Buffer(data, 'base64'); //console = <Buffer 75 ab 5a 8a ...
    fs.writeFile('public/' + filepath, imageBuffer, function (err) {
        console.log(err);
        return filepath;
    });
}
module.exports = router;