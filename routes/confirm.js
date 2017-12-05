var express = require('express');
var router = express.Router();
var Users = require('./dbModel.js').Users;
var TmpUsers = require('./dbModel.js').TmpUsers;
var userCheck = require('./userCheck.js');
var conf = require('./conf.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    return res.render('confirm',{type: 'new'});
});
router.get('/change', function(req, res, next) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.render('intro');
    return res.render('confirm',{type: 'change'});
});
});
router.get('/reset', function(req, res, next) {
    return res.render('confirm',{type: 'reset'});
});

router.post('/', function (req, res) {
    var sid = req.cookies.tmp;
    if (!sid || !req.body.code) res.json({result: "error"});
    TmpUsers.find({sid: sid},{},{limit:1}, function(err, tmpuser) {
        if (err) return res.json({result: "error"});
        if (tmpuser.length < 1) return res.json({result: "error"});
        if ((new Date() - new Date(tmpuser[0].date))/1000 > 1800) return res.json({result: "timeup"});
        if (tmpuser[0].mistakes >= 3) return res.json({result: "overmiss"});
        if (tmpuser[0].token != req.body.code) {
            var mistakes = tmpuser[0].mistakes + 1;
            tmpuser[0].mistakes = mistakes;
            tmpuser[0].save();
            var remain = 3 - mistakes;
            if (remain < 1) return res.json({result: "overmiss"});
            return res.json({result: "incorrect", remain: remain});
        }
        Users.find({mail: tmpuser[0].mail},{},{limit:1}, function(err, dup) {
            if (err) return res.json({result: "error"});
            if (dup[0]) return res.json({result: "duplicated"});
            var dupcount = 0;
            checkid();
            function checkid() {
            var id = userCheck.makeRandomString(10);
            Users.find({id: id},{},{limit:1}, function(err, dup) {
                if (err) return res.json({result: "error"});
                if (dup[0]) {
                    dupcount++;
                    if (dupcount > 100) return res.json({result: "error"});
                    return checkid();
                }
                var key = userCheck.makeKey();
                var hashedId = userCheck.makeHmac(sid, key);
                var newUser = new Users();
                newUser.id = id; newUser.sid = tmpuser[0].sid;
                newUser.key = key; newUser.mail = tmpuser[0].mail;
                newUser.password = tmpuser[0].password;
                newUser.save();
                tmpuser[0].remove();
                res.cookie('id', sid+":"+hashedId+conf.cookieSecure);
                return res.json({result: "success"});        
            });
            }
        });
    });
});

router.post('/change', function (req, res) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.json({result: "error"});
    if (!user[0].tmpmail || !user[0].token || !user[0].tokendate || user[0].cmmiss == null) return res.json({result: "error"});
    if ((new Date() - new Date(user[0].tokendate))/1000 > 1800) return res.json({result: "timeup"});
    if (user[0].cmmiss >= 3) return res.json({result: "overmiss"});
    if (user[0].token != req.body.code) {
        var mistakes = user[0].cmmiss + 1;
        user[0].cmmiss = mistakes;
        user[0].save();
        var remain = 3 - mistakes;
        if (remain < 1) return res.json({result: "overmiss"});
        return res.json({result: "incorrect", remain: remain});
    }
    Users.find({mail: user[0].tmpmail},{},{limit:1}, function(err, dup) {
        if (err) return res.json({result: "error"});
        if (dup[0]) return res.json({result: "duplicated"});
        user[0].mail = user[0].tmpmail; user[0].tmpmail = null;
        user[0].token = null; user[0].tokendate = null;
        user[0].cmmiss = null;
        user[0].save();
        return res.json({result: "success2"});
    });
});
});

router.post('/reset', function (req, res) {
    if (!req.cookies.reset) return res.json({result: "error"});
    Users.find({resetcookie: req.cookies.reset},{},{limit:1}, function(err, user) {
        if (err || !user[0]) return res.json({result: "error"});
        if (!user[0].resettoken || !user[0].resetdate || !user[0].resetcookie || user[0].resetmiss == null) return res.json({result: "error"});
        if ((new Date() - new Date(user[0].resetdate))/1000 > 1800) return res.json({result: "timeup"});
        if (user[0].resetmiss >= 3) return res.json({result: "overmiss"});
        if (user[0].resettoken != req.body.code) {
            var mistakes = user[0].resetmiss + 1;
            user[0].resetmiss = mistakes;
            user[0].save();
            var remain = 3 - mistakes;
            if (remain < 1) return res.json({result: "overmiss"});
            return res.json({result: "incorrect", remain: remain});
        }
        user[0].isresetok = true;
        user[0].save();
        return res.json({result: "success3"});
    });
});

module.exports = router;
