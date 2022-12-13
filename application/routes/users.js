var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const UserError = require ('../helpers/error/UserError');
const db = require('../conf/database');

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
router.post("/register",function(req, res, next) {
    const {username, email, password} = req.body;

    db.query('select id from users where username=?', [username])

        .then(function([results, fields]) {
            if (results && results.length == 0) {
                return db.query('select id from users where email=?', [email])
            } else {
                req.flash("error",'username already exists');
            }
        })

        .then (function([results, fields]) {
            if (results && results.length == 0) {
                return bcrypt.hash(password, 2);
            } else {
                req.flash("error",'email already exists');
            }
        }).then(function(hashedPassword){return db.execute ('insert into users (username, email, password) value (?, ?, ?)', [username, email, hashedPassword])})

        .then(function([results, fields]) {
            if (results && results.affectedRows == 1) {
                res.redirect('/login');
            } else {
                throw new Error ('user could not be made');
            }
        })

        .catch(function(err) {
            res.redirect('/register');
            next(err);
        });

});

router.post("/login", function(req, res, next) {
    const {username, password} = req.body;

    let loggedUserId;
    let loggedUsername;

    db.query('select id, username, password from users where username=?', [username])
        .then(function([results, fields]){
            if (results && results.length == 1) {
                loggedUserId = results[0].id;
                loggedUsername = results[0].username;
                let dbPassword = results[0].password;
                return bcrypt.compare(password, dbPassword);
            }else {
                req.flash("error",'Failed Login: Invalid User Credentials');
                res.redirect('/404error');
            }
        })
        .then(function(passwordsMatched){
            if(passwordsMatched){
                req.session.userId = loggedUserId;
                req.session.username = loggedUsername;
                req.flash("success",`Hi ${loggedUsername}, you are now logged in.`);
                res.redirect('/');
            } else {
                req.flash("error", `Error: Incorrect Username or Password.`);
                res.redirect('/login');
            }
        })

        .catch(function(err) {
            if (err instanceof UserError) {
                req.flash("error", err.getMessage())
                req.session.save(function(saveErr){
                    res.redirect('/404error');
                })
            }
            next(err);
        })
});

router.post("/logout", function(req, res) {
    req.session.destroy(function(destroyError){
        if (destroyError) {
            next (err);
        } else {
            res.json({
                status: 200,
                message: "You have been logged out"
            });
        }
    })
})

module.exports = router;