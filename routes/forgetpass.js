var express = require('express');
var router = express.Router();
var userCheck = require('./userCheck.js');
var conf = require('./conf.js');
var ResetTries = require('./dbModel.js').ResetTries;
var Users = require('./dbModel.js').Users;

router.get('/', function(req, res, next) {
    return res.render('forgetpass');
});

router.get('/passinput', function(req, res, next) {
    return res.render('passinput');
});

router.post('/', function (req, res) {
    var ip = req.connection.remoteAddress;
    if (!ip) return res.json({result: "error"});
    var sixtyminbefore = new Date() - 3600000;
    ResetTries.find({ip: ip, date: {$gte: sixtyminbefore}},{},{}, function(err, tries) {
        if (err) return res.json({result: "error"});
        if (tries.length >= 3) return res.json({result: "overtry"});
        var mail = req.body.mail;
        if (!mail.match(/.+@.+\..+/)) return res.json({result: "error"});
        var resettry = new ResetTries();
        resettry.ip = ip;
        resettry.date = new Date();
        resettry.save();

        var mail_crypted = userCheck.encrypt(mail, conf.mail_key);
        Users.find({mail: mail_crypted},{},{limit:1}, function(err1, user) {
            // 存在しないアドレスにリクエストがきたときにも、resetクッキーはつけて返すことで、アドレスの存在の有無を調べられないようにする。
            if (err1 || !user[0]) {
                var fakeresetcookie = userCheck.makeRandomString(10);
                res.cookie('reset', fakeresetcookie+conf.cookieSecure);
                return res.json({result: "success"});
            }
            // 30分以内に同一アドレスにリクエストがきたときは画面だけ遷移させる。
            if (user[0].resettoken && user[0].resetcookie && user[0].resetdate && (new Date() - new Date(user[0].resetdate))/1000 < 1800) return res.json({result: "success"});
            
            var dupcount = 0;
            checkcookie();
            function checkcookie() {
            var resetcookie = userCheck.makeRandomString(10);
            Users.find({resetcookie: resetcookie},{},{limit:1}, function(err2, dup) {
                if (err2) return res.json({result: "error"});
                if (dup[0]) {
                    dupcount++;
                    // 100回連続被ったら明らかに異常なのでエラーを返す
                    if (dupcount > 100) return res.json({result: "error"});
                    return checkcookie();
                } 
                var resettoken = userCheck.makeRandomString(10);
                user[0].resettoken = resettoken; user[0].resetdate = new Date();
                user[0].resetcookie = resetcookie; user[0].isresetok = false;
                user[0].resetmiss = 0;
                user[0].save();
                conf.sendmail('issue_code@chample.in(Chample)', mail, 'Code for resetting password.',
                    'Code: '+ resettoken + '\n\nEnter this code in Chample. (Do not reply to this mail.)');
                res.cookie('reset', resetcookie+conf.cookieSecure);
                return res.json({result: "success"});
            });
            }
        });
    });
});

router.post('/passinput', function (req, res) {
    var pass  = req.body.pass; var passRe = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,100}$/;
    if (!req.cookies.reset || !pass.match(passRe)) return res.json({result: "error"});
    Users.find({resetcookie: req.cookies.reset},{},{limit:1}, function(err, user) {
        if (err || !user[0] || !user[0].sid || !user[0].key || !user[0].resettoken || !user[0].resetdate || !user[0].resetcookie || user[0].resetmiss == null || !user[0].isresetok) return res.json({result: "error"});
        if ((new Date() - new Date(user[0].resetdate))/1000 > 1800) return res.json({result: "timeup"});
        user[0].password = userCheck.makeHash(pass+user[0].sid);
        user[0].resettoken = null; user[0].resetdate = null; user[0].resetcookie = null; user[0].resetmiss = null; user[0].isresetok = null;
        user[0].save();
        res.cookie('id', user[0].sid+":"+userCheck.makeHmac(user[0].sid, user[0].key)+conf.cookieSecure);
        return res.json({result: "success"});
    });
});

module.exports = router;
