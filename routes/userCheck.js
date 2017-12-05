var crypto = require('crypto');
var Users = require('./dbModel.js').Users;

var makeKey = function() {
    return crypto.randomBytes(32).toString('hex');
}

var makeHash = function(id) {
    return crypto.createHash('sha256').update(id).digest('hex');  
}

var makeHmac = function(id, key) {
    return crypto.createHmac('sha256', key).update(id).digest('hex');  
}

var makeHmacSha1 = function(id, key) {
    return crypto.createHmac('sha1', key).update(id).digest('hex');  
}

var makeRandomString = function(len) {
    var c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var cl = c.length;
    var r = "";
    for (var i = 0; i < len; i++) r+=c[Math.floor(Math.random()*cl)];
    return r;
}

var encrypt = function(id, key) {
    var cipher = crypto.createCipher('aes-256-cbc', key);
    var crypted = cipher.update(id, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

var decrypt = function(string, key) {
    decipher = crypto.createDecipher('aes-256-cbc', key);
    dec = decipher.update(string, 'hex', 'utf-8');
    dec += decipher.final('utf-8');
    return dec;
}

// Userがいれば、そのuserを返す。いなければfalse。
var getUser = function(cookie, fn) {
    if (!cookie) return fn(false);
    var vals = cookie.split(":"); // val[0]がid, val[1]がhash
    if (vals.length != 2) return fn(false);
    if (!(vals[0].match(/^[A-Za-z0-9]{15}$/))) return fn(false);
    Users.find({sid:vals[0]}, null, {limit:1},function(err, user) {
        if (err || !user[0] || !user[0].key || vals[1] != makeHmac(vals[0], user[0].key)) return fn(false);
        return fn(user);
    });
}

function nameCheck(name) {
    if (!(name && name.match(/^[a-zA-z¥s]+$/) && name.length <= 12)) name = null;
    if (name) name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    return name;
}
function checkPhotoUrl(url) {
    if (!(url && url.length < 300 && url.slice(0,8) == "https://")) url = null;
    return url;
}

var maskMail = function(mail, key) {
    if (!mail) return null;
    var mail_decrypted = decrypt(mail, key);
    var sp = mail_decrypted.split("@");
    if (sp.length != 2) return null;
    var first = (sp[0].length > 4) ? sp[0].substr(0, 4) : sp[0].substr(0, 1);    
    var second = (sp[1].length > 4) ? sp[1].substr(0, 4) : sp[1].substr(0, 1);
    return first+'……@'+second+'……';
}

module.exports = {
    makeKey: makeKey, makeHash: makeHash, makeHmac: makeHmac,
    makeHmacSha1: makeHmacSha1, makeRandomString: makeRandomString,
    encrypt: encrypt, decrypt: decrypt, getUser: getUser,
    nameCheck: nameCheck, checkPhotoUrl: checkPhotoUrl,
    maskMail: maskMail
}