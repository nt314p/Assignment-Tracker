const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
//const bcrypt = require('bcrypt');
const Course = require("../models/course");
//const saltRounds = 10;
const jwt = require('jsonwebtoken');

//for 2020/19
const xdHardcodeCalendar =
    [-1, -1, -1, -1, -1, -1, -1, 1, 0, 1, 0, 1, -1, -1, 0, 1, 0, 1, 0, -1, -1,
        1, 0, 1, 0, 1, -1, -1, 0, 1, 0, 1, 0, -1, -1, 1, 0, 1, 0, 1, -1, -1, 0,
        1, 0, 1, 0, -1, -1, 1, 0, 1, 0, 1, -1, -1, 0, 1, 0, 1, 0, -1, -1, 1, 0,
        1, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, 1, 0, 1, 0, -1, -1, 1, 0, 1, 0, 1, -1, -1, 0, 1, 0, -1, -1, -1,
        -1, 1, 0, 1, 0, 1, -1, -1, 0, 1, 0, 1, 0, -1, -1, 1, 0, 1, 0, 1, -1, -1,
        0, 1, 0, 1, 0, -1, -1, 1, 0, 1, -1, -1, -1, -1, 0, 1, 0, 1, 0, -1, -1, 1,
        0, 1, 0, 1, -1, -1, 0, 1, 0, 1, 0, -1, -1, 1, 0, 1, 0, 1, -1, -1, 0, 1,
        0, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 0, 1, -1, -1, 0, 1, 0, 1, 0, -1, -1, 1, 0, 1, 0, 1, -1, -1, 0, 1, 0,
        1, 0, -1, -1, 1, 0, 1, 0, 1, -1, -1, 0, 1, 0, 1, -1, -1, -1, -1, 0, 1, 0, 1,
        -1, -1, 0, 1, 0, 1, 0, -1, -1, 1, 0, 1, 0, 1, -1, -1, 0, 1, 0, 1, -1, -1,
        -1, -1, 0, 1, 0, 1, -1, -1, 0, 1, 0, 1, 0, -1, -1, 1, 0, 1, 0, 1, -1, -1,
        0, 1, 0, 1, 0, -1, -1, 1, 0, 1, 0, 1, -1, -1, 0, 1, 0, 1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, ];

/*
    Methods to create:
    Get all courses
    Add course
    Delete Course
    Get Next Date
*/

// Get all courses
router.get("/", verifyToken, (req, res, next) => { 
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else { //reg code goes here
            Course.find({}, (err, docs) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                } else {
                    console.log(docs);
                    res.status(200).json(docs);
                }

            });
        }
    });
});

// Create new course
router.post("/add", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err || !isAdmin(authData)) {
            res.sendStatus(403);
        } else {
            console.log("creating course");
            const course = new Course({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                day: req.body.day
                // more attributes to add later
            });
            course
                .save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: "Handling POST requests to /courses",
                        createdAssignment: result
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err,
                        message: "There was an error in adding an assignment"
                    });
                });
        }
    });
});

// Get course by id
router.get("/:courseId", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const id = req.params.courseId;
            Course.findById(id)
                .exec()
                .then(doc => {
                    console.log("From database", doc);
                    if (doc) {
                        res.status(200).json(doc);
                    } else {
                        res.status(404).json({
                            message: "No valid course found for provided ID"
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                });
        }
    });
});


// Update course by id
router.patch("/:courseId", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err || !isAdmin(authData)) {
            res.sendStatus(403);
        } else {
            const id = req.params.courseId;
            const updateOps = {};

            updateOps["name"] = req.body.name;
            updateOps["day"] = req.body.day;

            Course.update({ _id: id }, { $set: updateOps })
                .exec()
                .then(result => {
                    console.log(result);
                    res.status(200).json(result);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        }
    });
});

// Delete course by id
router.delete("/:courseId", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err || !isAdmin(authData)) {
            res.sendStatus(403);
        } else {
            const id = req.params.courseId;
            Course.remove({ _id: id })
                .exec()
                .then(result => {
                    res.status(200).json(result);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        }
    });
});

router.post("/nextDate", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {

            //get day of year
            var now = new Date();
            var start = new Date(now.getFullYear(), 0, 0);
            var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
            var oneDay = 1000 * 60 * 60 * 24;
            var dayOfYear = Math.floor(diff / oneDay);

            var day = req.body.day;


            var i = 2;
            while (xdHardcodeCalendar[dayOfYear+i] != day) {
                i++;
            }
            res.status(200).json({
                date: dayOfYear + i
            });
        }
    });
});


function isAdmin(req) {
    return req.account.admin;
}

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

function verifyToken(req, res, next) {
    //get auth header value
    const bearerHeader = req.headers['authorization'];
    console.log(req);
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        //get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware 
        next();
    } else {
        //forbidden
        res.sendStatus(403);
    }
}

module.exports = router;