var express = require('express');
var router = express.Router();
var mail = require("./mail.js");

var loggly = require('loggly');
var loggly_token = process.env.LOGGLY_TOKEN;
var loggly_sub_domain = process.env.LOGGLY_SUB_DOMAIN;

var secret = process.env.SECRET_KEY;

var client = loggly.createClient({
    token: loggly_token,
    subdomain: loggly_sub_domain,
    tags: ["CakeBee", "Reminder"],
    json:true
});

router.get('/:account/:email', function(req, res) {
    if (req.headers['secret'] != secret) {
        res.status(400).send("Bad credentials");
        return;
    }

    var account = req.params.account;
    var email = req.params.email;
    mail.newUserNotification(account, email);
    client.log({ "account" : account, "email" : email}, ["new user"]);
    res.status(200).send("New user registered.");
    return;
});

module.exports = router;