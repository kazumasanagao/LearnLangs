var express = require('express');
var router = express.Router();
var passport = require('passport');
var userCheck = require('./userCheck.js');
var Users = require('./dbModel.js').Users;
var conf = require('./conf.js');

// /oauthにアクセスした時
router.get('/', passport.authenticate('twitter'), function (req, res, next) {
    // console.log(req, res, next);
});
 
// /oauth/callbackにアクセスした時（Twitterログイン後）
router.get('/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
    var twid = passport.session.id;
    if (!twid) return res.json({result: "error"});
    Users.find({twid: twid},{},{limit:1},function(err, user) {
        if (err) return res.json({result: "error"});
        if (user[0]) {
            var hashedId = userCheck.makeHmac(user[0].sid, user[0].key);
            res.cookie('id',user[0].sid+":"+hashedId+conf.cookieSecure);
            return res.redirect('/');
        }
        var dupcount = 0;
        checkid();
        function checkid() {
        var id = userCheck.makeRandomString(10);
        var sid = userCheck.makeRandomString(15);
        Users.find({$or:[{id: id},{sid: sid}]},{},{limit:1}, function(err1, dup) {
            if (err1) return res.json({result: "error"});
            if (dup[0]) {
                dupcount++;
                if (dupcount > 100) return res.json({result: "error"});
                return checkid();
            }
            var key = userCheck.makeKey();
            var hashedId = userCheck.makeHmac(sid, key);
            var newUser = new Users();
            newUser.id = id; newUser.sid = sid;
            newUser.key = key; newUser.twid = twid;   
            //if (resJson.email && resJson.email.match(/.+@.+\..+/)) newUser.mail = userCheck.encrypt(resJson.email, conf.mail_key);
            var nickname = userCheck.nameCheck(passport.session.nickname);
            if (nickname) newUser.nickname = passport.session.nickname;
            var url = userCheck.checkPhotoUrl(passport.session.photo);
            if (url) newUser.photourl = userCheck.encrypt(passport.session.photo, conf.photourl_key);
            if (passport.session.lang && conf.languages[passport.session.lang] == 1) newUser.languages = passport.session.lang;
            newUser.save();
            res.cookie('id',sid+":"+hashedId+conf.cookieSecure);
            return res.redirect('/');
        });
        }
    });
});

module.exports = router;
