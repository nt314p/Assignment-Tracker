const mongoose = require("mongoose");

const accountSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    name: String,
    hashedPassword: String/*
    courses: [String]*/
});

module.exports = mongoose.model('Account', accountSchema);
