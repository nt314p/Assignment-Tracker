const mongoose = require("mongoose");

/*
    Assignment:
    Name
    Type (HW, project, read)
    Course
    Duedate

*/


const assignmentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    type: String,
    course: String,
    duedate: Date
});

module.exports = mongoose.model('Assignment', assignmentSchema);
