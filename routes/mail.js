var express = require('express');
var router = express.Router();

var sendgrid  = require('sendgrid')(process.env.SENDGRID_KEY);
var fromMailId = "customerdelight@cakebee.in";
var fromName = "CakeBee Remind";
var website = "www.cakebee.in";
var remindWebsite = "www.yabr.co";

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
    },

    newUserNotification : function(account, email) {
        var payload   = {
            to      : "abishek@logbase.io",
            from    : fromMailId,
            fromname : fromName,
            subject : 'New user registration!!!',
            text    : 'New user registered with account - ' + account + ", email -  " + email + "."
        };

        sendgrid.send(payload, function(err, json) {
            if (err) { console.error(err); }
            console.log(json);
        });
    },

    resendTeamKey : function(account, email) {
        var payload   = {
            to      : email,
            from    : fromMailId,
            fromname : fromName,
            subject : 'Link to your CakeBee-Remind team page',
            text    : 'You can access your teams page here - ' + remindWebsite +'/#/team/' + account
        };

        sendgrid.send(payload, function(err, json) {
            if (err) { console.error(err); }
            console.log(json);
        });
    }
};