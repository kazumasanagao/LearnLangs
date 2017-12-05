var express = require('express');
var router = express.Router();
var userCheck = require('./userCheck.js');
var conf = require('./conf.js');

router.get('/', function(req, res, next) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.render('intro');
    if (user[0].twid && !user[0].password) return res.render('nopass',{type: 'Twitter'});
    if (user[0].fbid && !user[0].password) return res.render('nopass',{type: 'Facebook'});
    return res.render('changepass'); 
});
});

router.post('/', function (req, res) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.json({result: "error"});
    var pass = req.body.pass; var pass2 = req.body.pass2;
    var passRe = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,100}$/;
    if (!pass.match(passRe) || !pass2.match(passRe)) return res.json({result: "error"});
    var hashedPass = userCheck.makeHash(pass+user[0].sid);
    if (user[0] && user[0].password && user[0].password == hashedPass) {
        user[0].password = userCheck.makeHash(pass2+user[0].sid);
        user[0].save();
        return res.json({result: "success"});
    }
    return res.json({result: "notcorrect"});
});
});

module.exports = router;
