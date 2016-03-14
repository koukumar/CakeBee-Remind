var express = require('express');
var router = express.Router();

var sendgrid  = require('sendgrid')(process.env.SENDGRID_KEY);
var fromMailId = "remind@cakebee.in";
var fromName = "CakeBee Remind";
var website = "www.cakebee.in"

module.exports = {
    notifyMemberBirthday : function(adminMail, memberName) {
        var payload   = {
            to      : adminMail,
            from    : fromMailId,
            fromname : fromName,
            subject : 'Birthday Reminder!!!',
            text    : 'Your team member ' + memberName + " has birthday today. Wish them good luck. Celebrate the birthday " +
                "with a cake from " + website + "."
        };

        sendgrid.send(payload, function(err, json) {
            if (err) { console.error(err); }
            console.log(json);
        });
    },

    wishBirthday : function (adminMail, memberName) {
        var payload   = {
            to      : adminMail,
            from    : fromMailId,
            fromname : fromName,
            subject : 'Happy Birthday!!!',
            text    : 'Happy Birthday ' + memberName + ". Have a blast. Celebrate your birthday " +
                "with a cake from " + website + "."
        };

        sendgrid.send(payload, function(err, json) {
            if (err) { console.error(err); }
            console.log(json);
        });
    }
}