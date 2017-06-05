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
                        var n_login = rows[0].n_login + 1;
                        sql = 'UPDATE users SET `n_login`="' + n_login + '" WHERE `email`="' + req.body.email + '" AND `auth_type`="email"';
                        connection.query(sql, function (error) {});
                        return Util.responseHandler(res, true, 'sucess', rows[0]);
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
            req.body.password = md5(md5(req.body.email) + req.body.password);
            var sql = 'select * from users where `email`="' + req.body.email + '" AND `auth_type`="email"';
            connection.query(sql, function (err, rows, fields) {
                if (err) {
                    return Util.responseHandler(res, false, 'Error', null);
                }
                if (rows.length != 0) {
                    return Util.responseHandler(res, false, 'User already exists', null);
                } else {
                    var today = new Date().getTime();
                    var post = {
                        auth_type: "email",
                        email: req.body.email,
                        password: req.body.password,
                        username: req.body.username,
                        location: req.body.location,
                        exam_date: req.body.exam_date,
                        time_signup: today,
                    };
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
                    var n_login = rows[0].n_login + 1;
                    sql = 'UPDATE users SET `n_login`="' + n_login + '" WHERE `email`="' + user.email + '" AND `auth_type`="facebook"';
                    connection.query(sql, function (error) {
                        if (error) {
                            console.log("----user account update error-----facebook-----");
                            return Util.responseHandler(res, false, 'Error', null);
                        } else {
                            console.log("----User already exists-----facebook-----");
                            return Util.responseHandler(res, true, 'User already exists', rows[0]);
                        }
                    });
                } else {

                    if (user.location == null) user.location = "Buenos Aires";
                    if (user.exam_date == null) user.exam_date = "CFA Level 1 - December 2017";
                    var today = new Date().getTime();
                    var post = {
                        auth_type: "facebook",
                        email: user.email,
                        password: user.uid,
                        username: user.username,
                        imagelocation: user.image,
                        location: user.location,
                        exam_date: user.exam_date,
                        time_signup: today,
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
                    var n_login = rows[0].n_login + 1;
                    sql = 'UPDATE users SET `n_login`="' + n_login + '" WHERE `email`="' + user.email + '" AND `auth_type`="google"';
                    connection.query(sql, function (error) {
                        if (error) {
                            console.log("----user account update error-----google-----");
                            return Util.responseHandler(res, false, 'Error', null);
                        } else {
                            console.log("----User already exists-----google-----");
                            return Util.responseHandler(res, true, 'User already exists', rows[0]);
                        }
                    });

                } else {
                    if (user.location == null) user.location = "Buenos Aires";
                    if (user.exam_date == null) user.exam_date = "CFA Level 1 - December 2017";
                    var today = new Date();
                    today = today.getTime();
                    console.log (today);
                    var post = {
                        auth_type: "google",
                        email: user.email,
                        password: user.uid,
                        username: user.username,
                        imagelocation: user.image,
                        location: user.location,
                        exam_date: user.exam_date,
                        time_signup: today,
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