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


// sync version of hash ing function 
var myHasher = function (password, tempUserData, insertTempUser, callback) {
    var hash = bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    return insertTempUser(hash, tempUserData, callback);
};
var errorHandler = function (res, err, msg) {
    console.log('Error', err, msg);
    Util.responseHandler(res, false, msg, null);
}

// //Define MySQL parameter in Config.js file.
// var connection = mysql.createConnection({
//   host     : global.host,
//   user     : global.username,
//   password : global.password,
//   database : global.database
// });

// //Connect to Database only if Config.js parameter is set.

// connection.connect();

//Passport session setup.


module.exports = function (passport) {
    //log in
    router.post('/login', (req, res, next) => {
        var connection;
        mysql.createConnection({
            host: global.host,
            user: global.username,
            password: global.password,
            database: global.database
        }).then(function (conn) {
            connection = conn;
            req.body.password = md5(md5(req.body.email) + req.body.password);
            var sql = 'select * from users where `email`="' + req.body.email + '" AND `auth_type`="email"';
            connection.query(sql, function (err, rows, fields) {
                if (err) {
                    return Util.responseHandler(res, false, 'Error', null);
                }
                if (rows.length != 0) {
                    if (rows[0].password === req.body.password) {
                        return Util.responseHandler(res, true, 'sucess', null);
                    }
                    return Util.responseHandler(res, false, 'Invalid email or password', null);
                } else {
                    return Util.responseHandler(res, false, 'Invalid email or password', null);
                }
            });
        });
    });

    //sign up
    router.post('/signup', (req, res, next) => {
        var connection;
        mysql.createConnection({
            host: global.host,
            user: global.username,
            password: global.password,
            database: global.database
        }).then(function (conn) {
            connection = conn;
            //console.log("password :" +  req.body.password);
            req.body.password = md5(md5(req.body.email) + req.body.password);
            //console.log("md5 :" +  req.body.password);
            var sql = 'select * from users where `email`="' + req.body.email + '" AND `auth_type`="email"';
            connection.query(sql, function (err, rows, fields) {
                if (err) {
                    return Util.responseHandler(res, false, 'Error', null);
                }
                if (rows.length != 0) {
                    return Util.responseHandler(res, false, 'User already exists', null);
                } else {
                    var post = {
                        auth_type: "email",
                        email: req.body.email,
                        password: req.body.password,
                        username: req.body.username,
                        location: req.body.location,
                        exam_date: req.body.exam_date
                    };
                    //var values = [req.body.email, req.body.password, req.body.username, req.body.location, req.body.exam_date];
                    //sql = 'INSERT INTO users (email, password, username, location, exam_date) VALUES ?'
                    sql = 'INSERT INTO users SET ?'
                    connection.query(sql, post, function (error) {

                        if (error) {
                            console.log("----user account insert error-----email-----");
                            return Util.responseHandler(res, false, 'Error', null);
                        } else {
                            console.log("-----user account insert success-----email-----");
                            return Util.responseHandler(res, true, 'Success', null);
                        }
                    });

                }
            });
        });
    });

    router.post('/facebook', (req, res) => {
        var user = req.body.user;

        var connection;
        mysql.createConnection({
            host: global.host,
            user: global.username,
            password: global.password,
            database: global.database
        }).then(function (conn) {
            connection = conn;
            var sql = 'select * from users where `email`="' + user.email + '" AND `auth_type`="facebook"';
            connection.query(sql, function (err, rows, fields) {
                if (err) {
                    return Util.responseHandler(res, false, 'Error', null);
                }
                if (rows.length != 0) {
                    console.log("----User already exists-----facebook-----");
                    return Util.responseHandler(res, true, 'User already exists', user);
                } else {
                   
                    if (user.location == null) user.location = "Buenos Aires";
                    if (user.exam_date == null) user.exam_date = "CFA Level 1 - December 2017";
                    var post = {
                        auth_type: "facebook",
                        email: user.email,
                        password: user.uid,
                        username: user.username,
                        imagelocation: user.image,
                        location: user.location,
                        exam_date: user.exam_date
                    };
                    sql = 'INSERT INTO users SET ?'
                    connection.query(sql, post, function (error) {
                        if (error) {
                            console.log("----user account insert error-----facebook-----");
                            return Util.responseHandler(res, false, 'Error', null);
                        } else {
                            console.log("-----user account insert success-----facebook-----");
                            return Util.responseHandler(res, true, 'Success', user);
                        }
                    });

                }
            });
        });
    });
    router.post('/google', (req, res) => {
        var user = req.body.user;
        // console.log(req.body.user);
        // check if user exists on database, login if true, signup if false

        var connection;
        mysql.createConnection({
            host: global.host,
            user: global.username,
            password: global.password,
            database: global.database
        }).then(function (conn) {
            connection = conn;
            var sql = 'select * from users where `email`="' + user.email + '" AND `auth_type`="google"';
            connection.query(sql, function (err, rows, fields) {
                if (err) {
                    console.log("----Error-----google-----");
                    return Util.responseHandler(res, false, 'Error', null);
                }
                if (rows.length != 0) {
                    console.log("----User already exists-----google-----");
                    return Util.responseHandler(res, true, 'User already exists', user);
                } else {
                     console.log(user);
                    if (user.location == null) user.location = "Buenos Aires";
                    if (user.exam_date == null) user.exam_date = "CFA Level 1 - December 2017";
                    var post = {
                        auth_type: "google",
                        email: user.email,
                        password: user.uid,
                        username: user.username,
                        imagelocation: user.image,
                        location: user.location,
                        exam_date: user.exam_date
                    };
                    sql = 'INSERT INTO users SET ?'
                    connection.query(sql, post, function (error) {
                        if (error) {
                            console.log("----user account insert error-----google-----");
                            return Util.responseHandler(res, false, 'Error', null);
                        } else {
                            console.log("-----user account insert success-----google-----");
                            return Util.responseHandler(res, true, 'Success', user);
                        }
                    });

                }
            });
        });
    });

    var createHash = function (password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
    return router;
}