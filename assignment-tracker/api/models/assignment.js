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
    details: String,
    type: String,
    course: String,
    dueDate: Date,
    createdby: String
});

module.exports = mongoose.model('Assignment', assignmentSchema);
