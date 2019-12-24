'use stgrict';

const mongoose = require('mongoose');
const bcrypt = require('mongoose-bcrypt');
const Bcrypt = require('bcryptjs');
const timestamps = require('mongoose-timestamp');

const environment = process.env.NODE_ENV || 'development';
const stage = require('./config')[environment];

// schema maps to a collection
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        bcrypt: true,
        select: false
    }
});

// encrypt password before save
userSchema.pre('save', (next) => {
    const user = this;
    if (!user.isModified || !user.isNew) { // don't rehash if it's an old user
        next();
    } else {
        bcrypt.hash(user.password, stage.saltingRounds, function (err, hash) {
            if (err) {
                console.log('Error hashing password for user', user.name);
                next(err);
            } else {
                user.password = hash;
                next();
            }
        });
    }
});

userSchema.methods.comparePassword = function (plaintext, callback) {
    return callback(null, Bcrypt.compareSync(plaintext, this.password));
};

userSchema.plugin(bcrypt);
userSchema.plugin(timestamps);

module.exports = mongoose.model('User', userSchema);