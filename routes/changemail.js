var express = require('express');
var router = express.Router();
var Users = require('./dbModel.js').Users;
var userCheck = require('./userCheck.js');
var conf = require('./conf.js');

/* GET home page. */
router.get('/', function(req, res, next) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.render('intro');
    var mail = userCheck.maskMail(user[0].mail, conf.mail_key);
    return res.render('changemail', {mail: mail});
});
});

router.post('/', function (req, res) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.json({result: "error"});
    var mail = req.body.mail;
    if (!mail.match(/.+@.+\..+/)) return res.json({result: "error"});
    var mail_encrypted = userCheck.encrypt(mail, conf.mail_key);
    // 30分以内に同一アドレスが来たら、メールは送らずに画面遷移だけさせる。
    if (user[0].tmpmail && user[0].tmpmail == mail_encrypted && user[0].tokendate && (new Date() - new Date(user[0].tokendate))/1000 <= 1800) return res.json({result: "success"}); 
    // 5分以内に別アドレスが来たら、「さっき送ったよ」というメッセージを表示させる。
    if (user[0].tmpmail && user[0].tmpmail != mail_encrypted && user[0].tokendate && (new Date() - new Date(user[0].tokendate))/1000 <= 300) return res.json({result: "exist"}); 
    user[0].tmpmail = mail_encrypted;
    var token = userCheck.makeRandomString(10);
    user[0].token = token;
    user[0].tokendate = new Date();
    user[0].cmmiss = 0;
    user[0].save();
    var currentMail = (user[0].mail) ? userCheck.decrypt(user[0].mail, conf.mail_key) : null;
    conf.sendmail('issue_code@chample.in(Chample)', mail, 'Code for changing mail address.',
                    'Code: '+ token + '\n\n Enter this code in Chample. (Do not reply to this mail.)');
    if (currentMail) conf.sendmail('issue_code@chample.in(Chample)', currentMail, 'There was a Code Request',
                    'We sent an email to the new address that you requested.'/*+
                    "If you didn't request it, there is a posibility that somebody is attacking your account.\n\n"+
                    'Please protect your account from here.'*/);
    return res.json({result: "success"});
});
});

module.exports = router;
