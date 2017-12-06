const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const secret = require('../secret/secret');
const localOptions = { usernameField: 'email', passwordField:'password' };

module.exports = (passport) => {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done)  {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local.signup', new LocalStrategy({
        usernameField: 'emailSignUp',
        passwordField: 'passwordSignUp',
        passReqToCallback: true
    }, function(req, email, password, done) {

        User.findOne({ 'email': email }, function(err, user) {
            if (err) {
                return done(err);
            }

            if (user) {
                return done(null, false, req.flash('error', 'User With Email Already Exist.'));
            }

            let newUser = new User();
            newUser.email = req.body.emailSignUp;
            newUser.name = req.body.name;
            newUser.password = newUser.encryptPassword(req.body.passwordSignUp);
            newUser.createdAt = Date.now();

            newUser.save(function(err){
                if (err) {
                    throw err;
                } else {
                    return done(null, newUser);
                }
            });
        })
    }));

    passport.use('local.login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'

    }, function(req, email, password, done) {
        User.findOne({ 'email': email }, function(err, user){
            if (err) {
                return done(err);
            }

            var messages = [];

            if (!user || !user.validPassword(password)) {
                console.log('------------');
                messages.push('Email Does Not Exist Or Password is Invalid')
                return done(null, false, req.flash('error', messages));
            }
            if (user.role==0) return done(null,user ,{error:"You not admin"});
            // return done(null, user);
        });
    }));

    passport.use('localLogin' , new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
        },
        function(email, password, done) {
            User.findOne({ email: email }, function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                if (user.role==0) return done(null,false ,{error:"You not admin"});
                return done(null, user);
            });
        }));

    /**
     *Passport strategy for authenticating with Facebook using the OAuth 2.0 API. 
     */
    passport.use(new FacebookStrategy(
        secret.facebook,
        function(req, token, refreshToken, profile, done) {
            User.findOne({ facebook: profile.id }, function(err, user) {
                if (err) {
                    return done(err);
                }

                if (user) {
                    console.log("Co user trong DB");
                    done(null, user);
                } else {
                    let newUser = new User();
                    newUser.facebook = profile.id;
                    newUser.email = profile._json.email;
                    newUser.tokens.push({ token: token });
                    newUser.createdAt = Date.now();

                    newUser.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                        done(null, newUser);
                    });
                }
            })
        }
    ));

    /**
     * Passport strategies for authenticating with Google using OAuth 1.0a and OAuth 2.0.
     */

    passport.use(new GoogleStrategy(
        secret.google,
        function(accessToken, refreshToken, profile, done) {
            console.log("User login by google!");
            User.findOne({ google: profile.id }, function(err, user) {
                if (err) return done(err);
                if (user) {
                    // User exits from DB.
                    done(null, user);
                } else {
                    // Create new user and save to DB.
                    let newUser = new User();
                    newUser.email = profile.emails[0].value;
                    newUser.google = profile.id;
                    newUser.createdAt = Date.now();
                    newUser.tokens.push({ token: accessToken });
                    // Save new user.
                    newUser.save(function(err)  {
                        if (err) console.log(err);
                        return done(null, user);
                    });
                }
            });
        }
    ));
}