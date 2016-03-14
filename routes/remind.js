var express = require('express');
var router = express.Router();
require('datejs');
var mail = require('./mail.js');

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

var loggly = require('loggly');
var loggly_token = process.env.LOGGLY_TOKEN;
var loggly_sub_domain = process.env.LOGGLY_SUB_DOMAIN;

var client = loggly.createClient({
    token: loggly_token,
    subdomain: loggly_sub_domain,
    tags: ["CakeBee", "Reminder"],
    json:true
});

/* GET users listing. */
router.get('/update', function(req, res) {
    console.log("Got update request");
    firebase_ref.child('/teams/')
        .once("value", function(snapshot) {
            if (snapshot.val() == null || snapshot.val() == undefined) {
                res.status(200).send("All ok 1");
                return;
            }
            //console.log(snapshot.val());
            var teams = snapshot.val();
            for (var teamKey in teams) {
                var team = teams[teamKey];
                var adminEmail = team['email'];
                var adminMailFound = false;
                var remindEmailIds = [];
                for (var memberKey in team['members']) {
                    var member = team['members'][memberKey];
                    var remindMemberStruct = {};
                    remindMemberStruct['sendemail'] = member['sendemail'];
                    if (member['sendemail'] == true) {
                        remindEmailIds.push(member['email']);
                        remindMemberStruct['email'] = member['email'];
                    }

                    if (adminEmail == member['email']) {
                        adminMailFound = true;
                    }

                    var month = member['birthdate'].split(" ")[0];
                    var date = member['birthdate'].split(" ")[1];
                    var member_ref = firebase_ref.child("/remind/" + month + "/" +
                        date + "/" + teamKey + "/members/" + member['name']);
                    member_ref.update(remindMemberStruct);
                }

                if (!adminMailFound) {
                    remindEmailIds.push(adminEmail);
                }

                for (var memberKey in team['members']) {
                    var member = team['members'][memberKey];
                    var month = member['birthdate'].split(" ")[0];
                    var date = member['birthdate'].split(" ")[1];

                    var remindEmailIdsStruct = {};
                    for (var idx in remindEmailIds) {
                        remindEmailIdsStruct[idx.toString()] = remindEmailIds[idx];
                    }

                    var remindEmailIdsRef = firebase_ref.child("/remind/" + month + "/" +
                        date + "/" + teamKey + "/emails");
                    remindEmailIdsRef.update(remindEmailIdsStruct);
                }
            }

        });
    res.status(200).send("All ok 2");
});

router.get("/", function(req, res) {
    var date = getIST(Date.today());
    var month = date.toString("MMM");
    var day = date.getDate();
    processBirthday(month, day);
    res.status(200).send("Reminded");
});

router.get("/test/:month/:day", function(req, res) {
    var month = req.params.month;
    var day = req.params.day;
    processBirthday(month, day);
    res.status(200).send("Reminded");
});

module.exports = router;

//Functions

function getIST(date) {
    var currentOffset = date.getTimezoneOffset();
    var ISTOffset = 330;   // IST offset UTC +5:30
    var ISTTime = new Date(date.getTime() + (ISTOffset + currentOffset)*60000);
    return ISTTime;
}

function sendReminder(name, emailIds, adminId) {
    var mailSent = {};
    for (var key in emailIds) {
        if (mailSent[emailIds[key]] == true) {
            continue;
        }

        client.log({"emailID" : emailIds[key], "name" : name}, ['notification']);
        if (emailIds[key] == adminId) {
            console.log("Happy Birthday " + name + ".");
            mail.wishBirthday(emailIds[key], name);
        } else {
            console.log("Your team member " + name + "'s has birthday today.");
            mail.notifyMemberBirthday(emailIds[key], name);
        }
        mailSent[emailIds[key]] = true;
    }
}

function processBirthday(month, day) {
    var reminderRef = firebase_ref.child("/remind/" + month + "/" + day);
    reminderRef.child("/").once("value", function(snapshot){
        var data = snapshot.val();
        if (data == null || data == undefined) {
            res.status(200).send("No reminder needed for today " + date.toString("MMMM, dd") );
            return;
        }

        for (var teamKeys in data) {
            var team = data[teamKeys];
            //console.log(teamKeys, team, team['members'], team['emails']);
            var members = team['members'];
            for(var memberKey in members) {
                var memberName = memberKey;
                var memberEmail = null;
                var date = getIST(Date.today()).toString("yyyyMMdd");

                if (team['members'][memberKey]['sentat'] == date) {
                    continue;
                }

                if (team['members'][memberKey]['sendemail'] == true) {
                    memberEmail = team['members'][memberKey]['email'];
                }

                sendReminder(memberName, team['emails'], memberEmail);

                var remindEmailIdsRef = firebase_ref.child("/remind/" + month + "/" +
                    day + "/" + teamKeys + "/members/" + memberKey + "/");
                remindEmailIdsRef.update({ "sentat" : date });
            }
        }
    });
}