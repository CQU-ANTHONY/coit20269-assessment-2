'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [80, 'Name is too long'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email is not valid'],
        },
        passwordHash: {
            type: String,
            required: true,
        },
        campus: {
            type: String,
            enum: ['BNE', 'SYD', 'MEL', 'DST', 'other'],
            default: 'other',
        },
    },
    { timestamps: true }
);

// Reuse the compiled model if the module is imported twice (test workers reload modules).
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
