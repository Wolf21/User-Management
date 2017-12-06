const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const async = require('async');

const userController = require('../controllers/userController');

const crypto = require('crypto');
const User = require('../models/user');
const secret = require('../secret/secret');

module.exports = (app, passport) => {

    app.get('/', userController.index);

    app.post('/signup', validate, passport.authenticate('local.signup', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/login', userController.getLogin);

    app.post('/login', loginValidation, passport.authenticate('local.login', {
        //successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }), userController.login);

    // Authentication by facebook.
    app.get('/auth/facebook',
        passport.authenticate('facebook', {
            scope: 'email'
        }));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/home',
            failureRedirect: '/login',
            failureFlash: true
        }));

    // Authentication by Google
    app.get('/auth/google',
        passport.authenticate('google', {
            failureRedirect: '/login',
            scope: ['profile', 'email']
        }));

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        }));

    app.get('/home', userController.home);

    app.get('/forgot', userController.forgot);

    app.post('/forgot', userController.fotgotPassword);

    app.get('/reset/:token', userController.reset);

    app.post('/reset/:token', userController.resetPassword);

    app.get('/logout', userController.logout);
}


function validate(req, res, next) {
    req.checkBody('emailSignUp', 'Email is Required').notEmpty();
    req.checkBody('emailSignUp', 'Email is Invalid').isEmail();
    req.checkBody('passwordSignUp', 'Password is Required').notEmpty();
    req.checkBody('passwordSignUp', 'Password Must Not Be Less Than 5').isLength({ min: 5 });
    req.check("passwordSignUp", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

    var errors = req.validationErrors();

    if (errors) {
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });

        req.flash('error', messages);
        res.redirect('/signup');
    } else {
        return next();
    }
}

function loginValidation(req, res, next) {
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('email', 'Email is Invalid').isEmail();
    req.checkBody('password', 'Password is Required').notEmpty();
    req.checkBody('password', 'Password Must Not Be Less Than 5 Characters').isLength({ min: 5 });
    req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

    var loginErrors = req.validationErrors();

    if (loginErrors) {
        var messages = [];
        loginErrors.forEach((error) => {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        res.redirect('/login');
    } else {
        return next();
    }
}