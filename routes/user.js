var express = require('express');
var router = express.Router();
var mail = require("./mail.js");

var loggly = require('loggly');
var loggly_token = process.env.LOGGLY_TOKEN;
var loggly_sub_domain = process.env.LOGGLY_SUB_DOMAIN;

var client = loggly.createClient({
    token: loggly_token,
    subdomain: loggly_sub_domain,
    tags: ["CakeBee", "Reminder"],
    json:true
});

router.get('/:account/:email', function(req, res) {
    var account = req.params.account;
    var email = req.params.email;
    mail.newUserNotification(account, email);
    client.log({ "account" : account, "email" : email}, ["new user"]);
    res.status(200).send("New user registered.");
    return;
});

module.exports = router;