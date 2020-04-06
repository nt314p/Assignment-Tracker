const mongoose = require("mongoose");

/*
    Course:
    Name
    Day

*/


const courseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    day: Number
});

module.exports = mongoose.model('Course', courseSchema);
