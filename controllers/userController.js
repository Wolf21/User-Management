/**
 * Controller index.
 */
exports.index = (req, res, next) => {
    console.log("URL " + req.url + ": " + req.user);
    if (req.session.cookie.originalMaxAge !== null) {
        res.redirect('/home');
    } else {
        res.render('index', { title: 'Index Page' });
    }
}

/**
 * Controller login
 * Method: GET
 */

exports.getLogin = (req, res) => {
    var errors = req.flash('error');
    res.render('user/login', { title: 'Login', messages: errors, hasErrors: errors.length > 0 });
}

/**
 * Controller Login
 * Method: POST
 */

exports.login = (req, res) => {
    // res.locals.user = req.user;
    req.session.cookie.user = req.user;
    console.log(req.session.cookie);
    if (req.body.rememberme) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
        req.session.cookie.expires = null;
    }
    res.redirect('/home');
}

/**
 * Controller home
 * Method: GET
 */

exports.home = (req, res) => {
    console.log(`Cookie : ${req.session.cookie}     passport: ${req.user}`);
    res.render('home', { title: 'Home', user: req.user });
}


/**
 * Controller handle forgot password.
 * Method: GET
 */

exports.forgot = (req, res) => {
    var errors = req.flash('error');

    var info = req.flash('info');

    res.render('user/forgot', { title: 'Request Password Reset', messages: errors, hasErrors: errors.length > 0, info: info, noErrors: info.length > 0 });
}

/**
 * Controller handle forgot password.
 * Method: POST
 */

exports.fotgotPassword = (req, res, next) => {
    async.waterfall([
        function(callback) {
            // Create random token.
            crypto.randomBytes(20, (err, buf) => {
                var rand = buf.toString('hex');
                callback(err, rand);
            });
        },

        function(rand, callback) {
            User.findOne({ 'email': req.body.email }, (err, user) => {
                if (!user) {
                    req.flash('error', 'No Account With That Email Exist Or Email is Invalid');
                    return res.redirect('/forgot');
                }

                user.passwordResetToken = rand;
                user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

                user.save((err) => {
                    callback(err, rand, user);
                });
            })
        },

        function(rand, user, callback) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: secret.auth.user,
                    pass: secret.auth.pass
                }
            });

            var mailOptions = {
                to: user.email,
                from: '<' + secret.auth.user + '>',
                subject: 'Application Password Reset Token',
                text: 'You have requested for password reset token. \n\n' +
                    'Please click on the link to complete the process: \n\n' +
                    'http://localhost:3000/reset/' + rand + '\n\n'
            };

            // Send mail to user.
            smtpTransport.sendMail(mailOptions, (err, response) => {
                req.flash('info', 'A password reset token has been sent to ' + user.email);
                return callback(err, user);
            });
        }
    ], (err) => {
        if (err) {
            return next(err);
        }

        res.redirect('/forgot');
    })
}


/**
 * Controller reset password.
 * Method: GET
 */

exports.reset = (req, res) => {

    User.findOne({ passwordResetToken: req.params.token, passwordResetExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
            req.flash('error', 'Password reset token has expired or is invalid. Enter your email to get a new token.');
            return res.redirect('/forgot');
        }
        var errors = req.flash('error');
        var success = req.flash('success');

        res.render('user/reset', { title: 'Reset Your Password', messages: errors, hasErrors: errors.length > 0, success: success, noErrors: success.length > 0 });
    });
}


/**
 * Controller reset password.
 * Method: POST
 */

exports.resetPassword = (req, res) => {
    async.waterfall([
        function(callback) {
            User.findOne({ passwordResetToken: req.params.token, passwordResetExpires: { $gt: Date.now() } }, (err, user) => {
                if (!user) {
                    req.flash('error', 'Password reset token has expired or is invalid. Enter your email to get a new token.');
                    return res.redirect('/forgot');
                }

                req.checkBody('password', 'Password is Required').notEmpty();
                req.checkBody('password', 'Password Must Not Be Less Than 5').isLength({ min: 5 });
                req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

                var errors = req.validationErrors();

                if (req.body.password == req.body.repassword) {
                    if (errors) {
                        var messages = [];
                        errors.forEach((error) => {
                            messages.push(error.msg)
                        })

                        var errors = req.flash('error');
                        res.redirect('/reset/' + req.params.token);
                    } else {
                        user.password = user.encryptPassword(req.body.password);
                        user.passwordResetToken = undefined;
                        user.passwordResetExpires = undefined;

                        user.save((err) => {
                            req.flash('success', 'Your password has been successfully updated.');
                            callback(err, user);
                        })
                    }
                } else {
                    req.flash('error', 'Password and confirm password are not equal.');
                    res.redirect('/reset/' + req.params.token);
                }
            });
        },

        function(user, callback) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: secret.auth.user,
                    pass: secret.auth.pass
                }
            });

            var mailOptions = {
                to: user.email,
                from: '<' + secret.auth.user + '>',
                subject: 'Your password Has Been Updated.',
                text: 'This is a confirmation that you updated the password for ' + user.email
            };

            smtpTransport.sendMail(mailOptions, (err, response) => {
                callback(err, user);

                var error = req.flash('error');
                var success = req.flash('success');

                res.render('user/reset', { title: 'Reset Your Password', messages: error, hasErrors: error.length > 0, success: success, noErrors: success.length > 0 });
            });
        }
    ]);
}

/**
 * Controller logout user
 * Method: GET
 */

exports.logout = (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        res.redirect('/');
    });
}