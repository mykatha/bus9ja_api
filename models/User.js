const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an email']
    },
    email: {
        type: String,
        required: [true, 'please add an email'],
        match: [
            /\S+@\S+\.\S+/, 'Please adda valide email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'companyPublisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false

    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt Password using bcrypt
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// sign JWT and return
UserSchema.methods.getSignedjwtToken = function() {
    return jwt.sign({id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user enterd password to hashed password in database
UserSchema.methods.matchPassword = async function(enterdPassword) {
    return await bcrypt.compare(enterdPassword, this.password);
};

//Generate the hash password token
UserSchema.methods.getResetPasswordToken = function() {
    //Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
