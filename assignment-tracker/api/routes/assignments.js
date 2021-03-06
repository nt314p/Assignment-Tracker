const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
//const bcrypt = require('bcrypt');
const Assignment = require("../models/assignment");
//const saltRounds = 10;
const jwt = require('jsonwebtoken');

/*
    Methods to create:
    Get all assignments
    Add assignment
    
    Search methods
        get by date
        etc.

    Delete Assignment
*/

// Get all assignments
router.get("/", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else { //reg code goes here
            Assignment.find({}, (err, docs) => {
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

// Create new assignment
router.post("/add", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            console.log("creating assignment");
            const assignment = new Assignment({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                details: req.body.details,
                type: req.body.type,
                course: req.body.course,
                dueDate: req.body.dueDate,
                createdby: authData.account._id
                // more attributes to add later
            });
            assignment
                .save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: "Handling POST requests to /assignments",
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

// Get assignment by id
router.get("/:assignmentId", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const id = req.params.assignmentId;
            Assignment.findById(id)
                .exec()
                .then(doc => {
                    console.log("From database", doc);
                    if (doc) {
                        res.status(200).json(doc);
                    } else {
                        res.status(404).json({
                            message: "No valid assignment found for provided ID"
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

//get by course

router.post("/course", verifyToken, (req, res, next) => {
    //const course = req.body.course;
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            Assignment.find({ "course": req.body.course })
                .exec()
                .then(doc => {
                    console.log("From database", doc);
                    if (doc) {
                        res.status(200).json(doc);
                    } else {
                        res.status(404).json({
                            message: "No valid assignment found for provided course"
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

//get by date

router.post("/date", verifyToken, (req, res, next) => {
    //const course = req.body.course;
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            Assignment.find({ "dueDate": req.body.dueDate })
                .exec()
                .then(doc => {
                    console.log("From database", doc);
                    if (doc) {
                        res.status(200).json(doc);
                    } else {
                        res.status(404).json({
                            message: "No valid assignment found for provided date"
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

//month: 1-12
router.post("/month", (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            var year = req.body.year;
            var month = req.body.month - 1;
            var startDate = new Date(year, month, 1);
            var endDate = new Date(year, month, new Date(year, month, 0).getDate());

            Assignment.find({ "dueDate": { "$gte": startDate, "$lt": endDate } })
                .exec()
                .then(doc => {
                    console.log("From database", doc);
                    if (doc) {
                        res.status(200).json(doc);
                    } else {
                        res.status(404).json({
                            message: "No valid assignment found for provided month"
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

// Update assignment by id
router.patch("/:assignmentId", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err /*|| authData.account._id == req.body.createdby || !authData.account.admin*/) {
            res.sendStatus(403);
        } else {
            const id = req.params.assignmentId;
            const updateOps = {};

            updateOps["name"] = req.body.name;
            updateOps["details"] = req.body.details;
            updateOps["course"] = req.body.course;
            updateOps["type"] = req.body.type;
            updateOps["dueDate"] = req.body.dueDate;

            Assignment.update({ _id: id }, { $set: updateOps })
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

// Delete assignment by id
router.delete("/:assignmentId", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        Assignment.findById(req.params.assignmentId).exec()
            .then(doc => {
                if (doc) {
                    console.log(authData.account._id + ", " + doc.createdby);
                    /*if (err || authData.account._id != doc.createdby || !authData.account.admin) {
                        if (authData != undefined) {
                            console.log("not owner")
                            res.sendStatus(200).json({
                                message: "You aren't the owner of this assignment"
                            });
                        } else {
                            console.log("log in")
                            res.sendStatus(200).json({
                                message: "You are not logged in"
                            });
                        }
                    } else {*/
                    const id = req.params.assignmentId;
                    Assignment.remove({ _id: id })
                        .exec()
                        .then(result => {
                            console.log("success");
                            res.status(200).json(result);
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                    //}
                } else {
                    res.status(404).json({
                        message: "No valid assignment found for provided ID"
                    });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
            });
    });
});

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

function verifyToken(req, res, next) {
    //get auth header value
    const bearerHeader = req.headers['authorization'];
    //console.log(req);
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