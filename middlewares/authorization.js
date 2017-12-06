'use strict';

const { wrap: async } = require('co');

/**
 *  Generic require login routing middleware.
 */

exports.requiresLogin = function(req, res, next) {
    if (req.isAuthenticated()) return next();
    if (req.method == 'GET') req.session.returnTo = req.originalUrl;
    res.redirect('/login');
};

/**
 *  User authorization routing middleware.
 */

exports.user = {
    hasAuthorization: function(req, res, next) {
        console.log(req.profile.user);
        if (req.profile.id != req.user.id) {
            req.flash('info', 'You are not authorized');
            return res.redirect('/users/' + req.profile.id);
        }
        next();
    }
};


/**
 *  Admin authorization routing middleware.
 */

exports.admin = {
    hasAuthorization: function(req, res, next) {
        // console.log('Req user: ', req.user);
        if (req.user && req.user.role == 1) {
            req.session.returnTo = '/admin';
            next();
        } else {
            req.flash('info', 'You are not authorized');
            return res.redirect('back');
        }
    }
};