const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Account = require("../models/account");
const saltRounds = 10;

// Get all accounts
router.get("/", (req, res, next) => {
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
});

// Create new account
router.post("/", (req, res, next) => {
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
            account.save()
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
    }).catch(err => {
        console.log(err);
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

// Update account by id
router.patch("/:accountId", (req, res, next) => {
    const id = req.params.accountId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
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
});

// Delete account by id
router.delete("/:accountId", (req, res, next) => {
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
});

module.exports = router;