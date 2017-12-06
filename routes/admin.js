
// const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const async = require('async');
const passport =require('passport');
const passportService = require('../config/passport');
const { respond , respondOrRedirect } = require('../utils');
const authorization = require('../middlewares/authorization');

const User = require('../models/user');
const requireLogin = passport.authenticate('local.login', { session: false });
const requireAdmin = authorization.admin;
module.exports = (app) => {

    app.get('/admin', function(req, res) {
        // var success = req.flash('success');
        respond(res, 'admin/index', {
        title: 'Admin Index',
        success: req.flash('success', 'Login successfully!')
    });
});

    app.get('/admin/login', function(req,res)  {
        respond(res, 'admin/login', {
        title: 'Admin Login'
    });
    });

    app.post('/admin/login', passport.authenticate('localLogin', {
        successRedirect: '/admin',
        failureRedirect: '/admin/login',
        failureFlash: true
        }));
        // respond(res, 'admin/index', {
        //     title: 'Admin Index',
        //     success: req.flash('success', 'Login successfully!')
        // });
    // });

    /**
     * Function get all users.
     */

    app.get('/admin/users', function(req, res) {
        User.find({
            block: 0
        }, function(err, users) {
            respond(res, 'admin/user/users', {
                title: 'Users',
                users: users
            });
        });
    });


    /**
     * Show information admin user.
     */
    app.get('/admin/user/profile', function(req, res) {
        let userId = req.user._id;
        console.log('ID User: ', userId);
        if (userId) {
            // Service find user by id.
            User.findOne({
                _id: userId
            }, function(err, user) {
                console.log(user);
                if (!err && user) {
                    // Response and render a webpage.
                    respond(res, 'admin/user/profile', {
                        title: 'Admin Info',
                        user: user
                    });
                } else {
                    // Redirect page.
                    respondOrRedirect({ req, res }, '/admin/users', {}, {
                        type: 'success',
                        text: 'Edit user successfully'
                    });
                }
            });
        } else {
            // res.redirect('admin/users');
            respondOrRedirect({ req , res }, '/admin/users', {}, {
                type: 'warning',
                text: 'Cannot find id user'
            });
        }
        // respond(res, 'admin/user/profile', {
        //     title: 'Admin Profile',
        //     success: req.flash('success', 'Login successfully!')
        // });
    });


    /**
     * Function get information user by id.
     */

    app.get('/admin/user/edit/:userId', function(req, res) {
        let userId = req.params.userId;
        if (userId) {
            // Service find user by id.
            User.findOne({
                _id: userId
            }, function(err, user) {
                console.log(user);
                if (!err && user) {
                    // Response and render a webpage.
                    respond(res, 'admin/user/edit-user', {
                        title: 'Edit User',
                        user: user
                    });
                } else {
                    // Redirect page.
                    respondOrRedirect({ req, res }, '/admin/users', {}, {
                        type: 'success',
                        text: 'Edit user successfully'
                    });
                }
            });
        } else {
            // res.redirect('admin/users');
            respondOrRedirect({ req, res }, '/admin/users', {}, {
                type: 'warning',
                text: 'Cannot find id user'
            });
        }
    });

    /**
     * Function update information user by admin.
     */

    app.post('/admin/user/edit/:userId', function(req, res) {
        let userId = req.params.userId;
    if (userId) {
        User.findOne({
            _id: userId
        }, function(err, user){
            console.log(user);
        if (!err && user) {
            console.log(req.body);
            user.profile.firstName = req.body.firstName;
            user.profile.lastName = req.body.lastName;
            user.role = req.body.role == 0 ? 0 : 1;
            user.save(function(err) {
                if (err) {
                    console.log(err);
                        } else {
                            // res.redirect('/admin/users');
                            console.log('Update thanh cong!');
                            respondOrRedirect({ req, res }, '/admin/users', {}, {
                                type: 'success',
                                text: 'Update user successfully'
                            });
                        }
                    });
                } else {
                    // res.redirect('/admin/users');
                    console.log('Khong tim thay user.');
                    respondOrRedirect({ req, res }, '/admin/users', {}, {
                        type: 'errors',
                        text: 'Cannot found user from database!'
                    });
                }
            });
        } else {
            respondOrRedirect({ req, res }, '/admin/users', {}, {
                type: 'warning',
                text: 'Cannot find id user'
            });
        }
    });

    /**
     * Function delete user by id.
     */

    app.delete('/admin/user/delete', function(req, res) {
        let idUser = req.body.userId;
        User.update({
            _id: idUser
        }, {
            $set: {
                block: 1
            }
        }, {
            multi: true
        }, function(err) {
            if (err) {
                throw err;
            } else {
                res.json(400);
                console.log('Xoa thanh cong!');
            }
        });
    })
    app.get('/admin/logout',function(req, res){
        req.logout();
        req.session.destroy(function(err){
            res.redirect('/admin/login');
    });
    })
}