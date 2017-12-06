module.exports = {
    auth: {
        user: 'thanhtv.itedu@gmail.com',
        pass: 'Tranthanh1995'
    },

    facebook: {
        clientID: '1870357596564738', //Facebook login app id
        clientSecret: 'e93b60e934a42fb9f888d1da8c6d9545', //Facebook login secret key
        profileFields: ['id', 'email', 'gender', 'displayName', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        passReqToCallback: true
    },
    google: {
        clientID: '277856921957-lj02m2smc8ojebp45f6akdm5ccho4p00.apps.googleusercontent.com',
        clientSecret: 'NqAOfDNLufkV4mFyRko0a8AK',
        callbackURL: 'http://localhost:3000/auth/google/callback'
    }
}