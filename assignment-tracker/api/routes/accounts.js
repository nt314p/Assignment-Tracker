const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Account = require("../models/account");
const saltRounds = 10;
const jwt = require('jsonwebtoken');


// Get all accounts
router.get("/", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err || !authData.account.admin) {
            res.sendStatus(403);
        } else { //reg code goes here
            Account.find({}, (err, docs) => {
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

// Create new account
router.post("/", (req, res, next) => { // add check for unique username
    console.log("creating account");
    bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            const account = new Account({
                _id: new mongoose.Types.ObjectId(),
                username: req.body.username,
                name: req.body.name,
                hashedPassword: hash,
                // more attributes to add later
            });
            account
                .save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: "Handling POST requests to /accounts",
                        createdAccount: result
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        });
    });
});

// Get account by id
router.get("/:accountId", (req, res, next) => {
    const id = req.params.accountId;
    Account.findById(id)
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    message: "No valid account found for provided ID"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

//update password

// NOT FUNCTIONAL: HASHED PASSWORD NOT UPDATING
router.patch("/updatePass/:accountId", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err || authData.account._id == req.params.accountId) {
            res.sendStatus(403);
        } else {
            bcrypt.compare(req.body.oldpassword, authData.account.hashedPassword, function (err, passResult) {
                console.log(passResult);
                if (passResult) {
                    bcrypt.genSalt(saltRounds, (err, salt) => {
                        bcrypt.hash(req.body.newpassword, salt, (err, hash) => {
        
                            const id = req.params.accountId;
                            const updateOps = {};
                            updateOps["hashedPassword"] = hash;
        
                            Account.update({ _id: id }, { $set: updateOps })
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
                        });
                    });
                } else {
                    res.status(200).json({
                        message: "Wrong passowrd"
                    });
                }
            });
        }
    });
});

// Update account by id
router.patch("/:accountId", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err || authData.account._id == req.params.accountId) {
            res.sendStatus(403);
        } else {
            const id = req.params.accountId;
            const updateOps = {};

            updateOps["name"] = req.body.name;
            updateOps["username"] = req.body.username;
            updateOps["email"] = req.body.email;

            Account.update({ _id: id }, { $set: updateOps })
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

// Delete account by id
router.delete("/:accountId", (req, res, next) => {
    jwt.verify(req.token, 'tempSecretKey', (err, authData) => {
        if (err || authData.account._id == req.params.accountId) {
            res.sendStatus(403);
        } else {
            const id = req.params.accountId;
            Account.remove({ _id: id })
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

router.post("/login", (req, res, next) => {
    //const username = req.params.username;
    Account.find({ "username": req.body.username })
        .exec()
        .then(doc => {
            const account = doc[0];
            if (account) {
                console.log("From database", account);

                bcrypt.compare(req.body.password, account.hashedPassword, function (err, result) {
                    if (result) {
                        // res.status(200).json({
                        //     message: "Login Successful"
                        // });

                        jwt.sign({ account }, 'tempSecretKey', (err, token) => {
                            res.json({
                                token
                            });
                        });
                    } else {
                        res.status(200).json({
                            message: "Wrong passowrd or username"
                        });
                    }
                });
            } else {
                res.status(404).json({
                    message: "No valid account found for provided ID"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

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

router.post("/checkUniqueUsername", (req, res, next) => {
    Account.find({ "username": req.body.username })
        .exec()
        .then(doc => {
            if (doc.length > 0) {
                res.status(200).json({
                    result: false // username is not unique
                });
            } else {
                res.status(200).json({
                    result: true // username is unique
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});


module.exports = router;