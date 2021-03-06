var express = require('express');
var router = express.Router();

var sendgrid  = require('sendgrid')(process.env.SENDGRID_KEY);
var fromMailId = "customerdelight@cakebee.in";
var fromName = "CakeBee Remind";
var remindWebsite = process.env.REMIND_WEBSITE || "www.remind.cakebee.in";
var bccMailIds = ["abishek@cakebee.in", "kousik@logbase.io"];

module.exports = {
    notifyMemberBirthday : function(adminMail, memberName, accountId, zip, teamName) {

        var cbeMessage = "";
        if (zip.toString().indexOf("641") == 0) {
            cbeMessage += 'Celebrate with a cake from www.cakebee.in :) \n\n';
        }

        var payload   = {
            to      : adminMail,
            bcc      : bccMailIds,
            from    : fromMailId,
            fromname : fromName,
            subject : 'It’s ' + memberName +'’s birthday today!',
            text    :  'Hello!!!\n\n' +
                'Today is ' + memberName + '’s birthday, don’t forget to wish!\n\n' +
                cbeMessage +
                'Team name: ' + teamName + '\n\n' +
                'Team page: ' + this.getTeamPage(accountId) + '\n\n' +
                'Love,\n\n' +
                'CakeBee Remind.'
        };

        sendgrid.send(payload, function(err, json) {
            if (err) { console.error(err); }
            console.log(json);
        });
    },

    wishBirthday : function (adminMail, memberName, accountId, teamName) {
        var payload   = {
            to      : adminMail,
            bcc      : bccMailIds,
            from    : fromMailId,
            fromname : fromName,
            subject : 'Birthday Wishes from Team CakeBee Remind!',
            text    :  'Hello '+ memberName +'!\n\n' +
                'Wishing you many more happy returns on your birthday, have a good one!\n\n' +
                'Team name: ' + teamName + '\n\n' +
                'Team page: ' + this.getTeamPage(accountId) + '\n\n' +
                'Love,\n\n' +
                'CakeBee Remind.'
        };

        sendgrid.send(payload, function(err, json) {
            if (err) { console.error(err); }
            console.log(json);
        });
    },

    newUserNotification : function(account, email, teamName) {
        var payload   = {
            to      : email,
            bcc      : bccMailIds,
            from    : fromMailId,
            fromname : fromName,
            subject : 'Great! You chose to celebrate with CakeBee Remind!',
            text    : 'Hello!\n\n' +
                'Thanks for signing up with CakeBee Remind, a birthday reminder exclusively for ' +
                'teams at work. Share the team page link with your team to add birthdays. ' +
                'That’s it, now we’ll make sure you don’t miss to celebrate :)\n\n' +
                'Any help, shoot an email to customerdelight@cakebee.in, we’ll be glad to help!\n\n' +
                'Team name: ' + teamName + '\n\n' +
                'Team page: ' + this.getTeamPage(account) + '\n\n' +
                'Love,\n\n' +
                'CakeBee Remind.'
        };

        sendgrid.send(payload, function(err, json) {
            if (err) { console.error(err); }
            console.log(json);
        });
    },

    resendTeamKey : function(account, email, teamName) {
        var payload   = {
            to      : email,
            bcc      : bccMailIds,
            from    : fromMailId,
            fromname : fromName,
            subject : 'Your CakeBee Remind Team Page',
            text    : 'Hello!\n\n'+'' +
                'We got a forgot team page key request from you, here is your page.\n\n' +
                teamName + ': ' + this.getTeamPage(account) + '\n\n' +
                'Love,\n\n' +
                'CakeBee Remind.'
        };

        sendgrid.send(payload, function(err, json) {
            if (err) { console.error(err); }
            console.log(json);
        });
    },

    getTeamPage : function (account) {
        return remindWebsite + "/#/team/" + account;
    },

    teamKeyUnavailable : function(email) {
        var payload   = {
            to      : email,
            bcc      : bccMailIds,
            from    : fromMailId,
            fromname : fromName,
            subject : 'Your CakeBee Remind Team Page',
            text    : 'Hello!\n\n'+'' +
                'We got a forgot team page key request from you. However, ' +
                'we are unable to find any team page mapped to your email, ' + email +
                '. Looks like you might have used a different email.\n\n' +
                'Love,\n\n' +
                'CakeBee Remind.'
        };

        sendgrid.send(payload, function(err, json) {
            if (err) { console.error(err); }
            console.log(json);
        });
    }
};