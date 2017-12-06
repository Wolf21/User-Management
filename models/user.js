const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        firstName: {type: String},
        lastName: {type: String}
    },
    role: { type: Number, default: 0 },
    block: { type: Number, default: 0 },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: Date,
    facebook: {},
    google: {},
    tokens: Array
});

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

// Method to compare password for login
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) { return cb(err); }

        cb(null, isMatch);
    });
}

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);