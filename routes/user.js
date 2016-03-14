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
    tags: ["CakeBee", "Reminder", "Users"],
    json:true
});


var Firebase = require("firebase");
var firebase_ref = new Firebase(process.env.FIREBASE_URL);
var firebase_secret = process.env.FIREBASE_SECRET;

firebase_ref.authWithCustomToken(firebase_secret, function(error, authData) {
    if (error) {
        console.log("Login Failed!", error);
    } else {
        console.log("Firebase authenticated successfully with payload.");
    }
});

router.get('/forgotkey/:email', function(req, res) {
    if (req.headers['secret'] != secret) {
        res.status(400).send("Bad credentials");
        return;
    }

    var email = req.params.email;
    var mailSent = false;
    firebase_ref.child('/teams/')
        .once("value", function(snapshot) {
            if (snapshot.val() == null || snapshot.val() == undefined) {
                res.status(200).send();
                mail.teamKeyUnavailable(email);
                return;
            }
            //console.log(snapshot.val());
            var teams = snapshot.val();
            for (var teamKey in teams) {
                var team = teams[teamKey];
                var adminEmail = team['email'];
                var teamName = team['team'];
                if (email == adminEmail) {
                    mail.resendTeamKey(teamKey, email, teamName);
                    client.log({"teamKey" : teamKey, "email" : email}, ["forgotkey"])
                    mailSent = true;
                }
            }
            if (!mailSent) {
                mail.teamKeyUnavailable(email);
            }
        });
    res.status(200).send("Resent team key");

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