var express = require('express');
var router = express.Router();
var userCheck = require('./userCheck.js');
var conf = require('./conf.js');

/* GET home page. */
router.get('/', function(req, res, next) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user[0]) return res.render('intro');
    var summertime = (user[0].summertime) ? 1 : 0;
    var timegap = user[0].timezone + (summertime*60);
    var now = new Date();
    var nowminus25 = new Date(now.getTime() - 25*60*1000);
    var reserved = processResevedArray(user[0].reserved, true, timegap, nowminus25);   
    var bereserved = processResevedArray(user[0].bereserved, false, timegap, nowminus25);
    var combined = reserved.concat(bereserved);
    combined.sort(function(a,b){if(a.date < b.date)return -1;if(a.date > b.date)return 1;return 0;});
    var combinedStrArray = []; var combinedStr = '';
    for (var i=0; i<combined.length; i++) combinedStrArray.push(dicToStr(combined[i],'=','~'));
    combinedStr = combinedStrArray.join('|');
    return res.render('home', {nickname: user[0].nickname, data: combinedStr}); 
});
});
function processResevedArray(array, isreserved, timegap, nowminus25) {
    var result = [];
    for (var i=0; i<array.length; i++) {
        var obj = {};
        obj.id = array[i].id;
        obj.nickname = array[i].nickname;
        obj.country = array[i].country;
        obj.skypeid = userCheck.decrypt(array[i].skypeid, conf.skypeid_key);
        var _d = new Date(array[i].date);
        if (_d < nowminus25) continue; // 過去の分はパス
        var d = new Date (Date.UTC(_d.getUTCFullYear(), _d.getUTCMonth(), _d.getUTCDate(), _d.getUTCHours(), _d.getUTCMinutes()+timegap, 0));
        obj.date = d.getUTCFullYear() +","+ d.getUTCMonth() +","+ d.getUTCDate() +"," + d.getUTCHours() +","+ d.getUTCMinutes();
        obj.language = array[i].language;
        obj.isreserved = isreserved;
        result.push(obj);
    }
    return result;
}
function dicToStr(obj, fDelimiter, sDelimiter) {
    var tmpArr = [];
    if (typeof obj === 'undefined') return '';
    if (typeof fDelimiter === 'undefined') fDelimiter = '';
    if (typeof sDelimiter === 'undefined') sDelimiter = '';
    for (var key in obj) tmpArr.push(key + fDelimiter + obj[key]);
    return tmpArr.join(sDelimiter);
}

module.exports = router;
