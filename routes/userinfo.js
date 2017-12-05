var express = require('express');
var router = express.Router();
var userCheck = require('./userCheck.js');
var conf = require('./conf.js');
var base64 = require('urlsafe-base64');

router.get('/', function(req, res, next) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.render('intro');
    var mail = userCheck.maskMail(user[0].mail, conf.mail_key);
    var fbphoto = (user[0].photourl) ? userCheck.decrypt(user[0].photourl, conf.photourl_key) : null;
    var skypeid = (user[0].skypeid) ? userCheck.decrypt(user[0].skypeid, conf.skypeid_key) : null;
    data = {
        nickname: user[0].nickname, skypeid: skypeid,
        country: user[0].country, languages: user[0].languages,
        gender: user[0].gender, timezone: user[0].timezone,
        summertime: user[0].summertime, mail: mail,
        fbphoto: fbphoto, intro: user[0].intro,
        id: user[0].id, date: new Date() }
    return res.render('userinfo', data); 
});
});

router.post('/', function (req, res) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.json({result: "error"});
    if (!req.body) return res.json({result: "nochanges"});
    var nn = req.body.nickname; var si = req.body.skypeid;
    var co = req.body.country; var lg = req.body.languages;
    var lga = (lg) ? lg.split(',') : null; var gd = req.body.gender;
    var tm = req.body.timezone; var st = req.body.summertime;
    var ir = req.body.intro;
    if (nn && nn != user[0].nickname && nn.match(/^[A-Za-z]{1,12}$/)) user[0].nickname = nn;
    if (si && si != user[0].skypeid && si.match(/^[A-Za-z0-9\-\_\,\.]{6,32}$/)) user[0].skypeid = userCheck.encrypt(si,conf.skypeid_key);
    if (co && co != user[0].country && conf.countries[co]) user[0].country = co;
    if (lga && lga.toString() != user[0].languages.toString()) {
        var newlg = [];
        for (var i = 0; i < lga.length; i++) if (conf.languages[lga[i]] && newlg.indexOf(lga[i]) == -1) newlg.push(lga[i]);
        user[0].languages = newlg;
    }
    if (gd && gd != user[0].gender && (gd == "fe" || gd == "ma")) user[0].gender = gd;
    if (tm && conf.timezones.indexOf(Number(tm)) != -1 && user[0].timezone != Number(tm)) user[0].timezone = Number(tm);
    (st && st == 'true') ? user[0].summertime = true : user[0].summertime = false;
    if (ir && calcByte(ir) <= 400) user[0].intro = escape(ir);
    user[0].save();

    if (!req.body.photo) return res.json({result: "success"});
    var img = base64.decode(req.body.photo);
    if (img.length > 15000) return res.json({result: "hugephoto"});
    conf.s3.putObject({Bucket: conf.bucket, Key: user[0].id+".jpeg", Body: img}, function(err, data) {
        if (err) return res.json({result: "errphoto"});
        user[0].photourl = null;
        user[0].save();
        return res.json({result: "success"});
    });
});
});

function calcByte(text) {
    var bytes = 0;
    for (var i=0;i<text.length;i++) (text[i].charCodeAt(0) <= 127) ? bytes += 1 : bytes += 2;
    return bytes;
}
function escape(text) {
    return (text + "").
    replace(/\n+/g," ");
    //replace(/&/g, "&amp;").
    //replace(/&amp;amp;/g, "&amp;").
    //replace(/</g, "&lt;");
}
    

module.exports = router;
