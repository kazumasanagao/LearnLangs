var express = require('express');
var router = express.Router();
var url = require('url');
var request = require('request');
var conf = require('./conf.js');
var Users = require('./dbModel.js').Users;
var TmpUsers = require('./dbModel.js').TmpUsers;
var FailLogins = require('./dbModel.js').FailLogins;
var userCheck = require('./userCheck.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    return res.render('login');
});

router.post('/', function (req, res) {
    var ip = req.connection.remoteAddress;
    if (!ip) return res.json({result: "error"});
    var tenminbefore = new Date() - 600000;
    FailLogins.find({ip: ip, date: {$gte: tenminbefore}},{},{}, function(err, fails) {
        if (err) return res.json({result: "error"});
        if (fails.length >= 5) return res.json({result: "overmiss"});
        var mail = req.body.mail; var pass = req.body.pass;
        if (!mail.match(/.+@.+\..+/) || !pass.match(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,100}$/)) return res.json({result: "error"});
        var mail_crypted = userCheck.encrypt(mail, conf.mail_key);
        Users.find({mail: mail_crypted},{},{limit:1}, function(err1, user) {
            if (err1) return res.json({result: "error"});
            if (user[0] && user[0].password && user[0].sid && user[0].password == userCheck.makeHash(pass+user[0].sid)) {
                res.cookie('id', user[0].sid+":"+userCheck.makeHmac(user[0].sid, user[0].key)+conf.cookieSecure);
                return res.json({result: "ok"});
            }
            var faillogins = new FailLogins();
            faillogins.ip = ip; faillogins.date = new Date();
            faillogins.save();
            return res.json({result: "error"});
        });
    });
});

module.exports = router;
