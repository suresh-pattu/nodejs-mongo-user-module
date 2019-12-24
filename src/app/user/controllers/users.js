'use strict';

const User = require('../models/users');
const Common = require('./common/api-utils');

let checkUserLogin = async (email, password) => {
    try {
        let user = await User.findOne({email: email}).select("+password").exec();
        if (!user) {
            return ({status: false, message: "The username does not exist", user: null});
        }
        return new Promise(function (resolve, reject) {
            user.comparePassword(password, (error, match) => {
                if (match) {
                    let {_id, name, email} = user;
                    resolve({status: true, message: "Login details correct!", user: {_id, name, email}});
                } else {
                    resolve({status: false, message: "The password is invalid", user: null});
                }
            });
        });
    } catch (error) {
        return ({status: false, message: error.message, user: null});
    }
};

module.exports = {
    register: (req, res) => {
        let {name, email, password} = req.body;
        try {
            let user = new User({name, email, password});
            user.save()
                .then(data => {
                    let {_id, name, email} = data;
                    Common.sendResponse(res, 200, {_id, name, email}, 'Success');
                })
                .catch(err => {
                    Common.sendResponse(res, 500, null, err.message || 'Error while creating document');
                });
        } catch (err) {
            Common.sendResponse(res, 500, null, err.message);
        }
    },
    login: async (req, res) => {
        const response = await checkUserLogin(req.body.email, req.body.password);
        Common.sendResponse(res, 200, response, 'Success');
    },
    fetchOne: (req, res) => {
        User.findOne({_id: req.params.id}).exec()
            .then(users => {
                Common.sendResponse(res, 200, users, 'Success');
            })
            .catch(err => {
                Common.sendResponse(res, 500, null, err.message || '');
            });
    },
    fetchAll: (req, res) => {
        User.find({}).exec()
            .then(users => {
                Common.sendResponse(res, 200, users, 'Success');
            })
            .catch(err => {
                Common.sendResponse(res, 500, null, err.message || '');
            });
    },
    updateOne: (req, res) => {
        let {name} = req.body;
        User.findOneAndUpdate({_id: req.params.id}, {$set: {name}}).exec()
            .then(users => {
                Common.sendResponse(res, 200, users, 'Success');
            })
            .catch(err => {
                Common.sendResponse(res, 500, null, err.message || '');
            });
    },
    deleteOne: (req, res) => {
        User.findOneAndDelete({_id: req.params.id}).exec()
            .then(users => {
                Common.sendResponse(res, 200, users, 'Success');
            })
            .catch(err => {
                Common.sendResponse(res, 500, null, err.message || '');
            });
    },
    updatePassword: async (req, res) => {
        //compare password
        if (req.body.password !== req.body.confirm_password) {
            return Common.sendResponse(res, 403, null, 'Password mismatch');
        }
        //Check user
        const user = await User.findOne({_id: req.params.id}).exec();
        if (!user) {
            return Common.sendResponse(res, 404, null, 'User not found');
        }
        //check old password
        const response = await checkUserLogin(user.email, req.body.old_password);
        if (!response.status) {
            return Common.sendResponse(res, 403, null, 'Login details are not matching');
        }
        let {password} = req.body;
        //update
        User.findOneAndUpdate({_id: req.params.id}, {password}).exec()
            .then(users => {
                Common.sendResponse(res, 200, users, 'Password update successfully!');
            })
            .catch(err => {
                Common.sendResponse(res, 500, null, err.message || '');
            });
    }
};