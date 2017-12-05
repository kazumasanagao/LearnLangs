var express = require('express');
var router = express.Router();
var userCheck = require('./userCheck.js');

/* GET home page. */
router.get('/', function(req, res, next) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.render('signin');
    var ctime = '';
    var isquarter = 'false';
    if (typeof user[0].timezone == 'number') {
        var summertime = (user[0].summertime) ? 1 : 0;
        var timegap = user[0].timezone + (summertime*60);
        var _d = new Date();
        var d = new Date (Date.UTC(_d.getUTCFullYear(), _d.getUTCMonth(), _d.getUTCDate(), _d.getUTCHours(), _d.getUTCMinutes()+timegap, 0));
        ctime = d.getUTCFullYear() +","+ d.getUTCMonth() +","+ d.getUTCDate() +"," + d.getUTCHours() +","+ d.getUTCMinutes();
        if (Math.abs(user[0].timezone % 30) == 15) isquarter = 'true';
        var today = '';var todayp1 = '';var todayp2 = '';var todayp3 = '';var todayp4 = '';
        if (user[0].teachabledates) {
            var atoday = [];var atodayp1 = [];var atodayp2 = [];var atodayp3 = [];var atodayp4 = [];
            var thisgap = (isquarter == 'true') ? timegap - 15 : timegap;
            for (var i=0; i<user[0].teachabledates.length; i++) {
                var thisd = new Date(user[0].teachabledates[i].getTime() + thisgap*60*1000);
                var val = Math.floor(((thisd.getUTCHours()*60) + thisd.getUTCMinutes()) / 30);
                var startoftoday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0)).getTime();
                if (thisd.getTime() < d.getTime()) continue;
                if (thisd.getTime() < startoftoday + (1*24*60*60*1000)) { atoday.push(val); continue; }
                if (thisd.getTime() < startoftoday + (2*24*60*60*1000)) { atodayp1.push(val); continue; }
                if (thisd.getTime() < startoftoday + (3*24*60*60*1000)) { atodayp2.push(val); continue; }
                if (thisd.getTime() < startoftoday + (4*24*60*60*1000)) { atodayp3.push(val); continue; }
                if (thisd.getTime() < startoftoday + (5*24*60*60*1000)) { atodayp4.push(val); continue; }
            }
            today = atoday.join(",");todayp1 = atodayp1.join(",");todayp2 = atodayp2.join(",");todayp3 = atodayp3.join(",");todayp4 = atodayp4.join(",");
        }
        var maxinaday = (user[0].maxinaday) ? user[0].maxinaday : '';
        var maxinall = (user[0].maxinall) ? user[0].maxinall : '';
    }
    res.render('teach', {langs: user[0].languages, ctime: ctime, isquarter: isquarter, today: today, todayp1: todayp1, todayp2: todayp2, todayp3: todayp3, todayp4: todayp4, maxinaday: maxinaday, maxinall: maxinall});
});
});

router.post('/', function (req, res) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user || typeof user[0].timezone != 'number') return res.json({result: "error"});
    if (!req.body) return res.json({result: "nochanges"});
    var summertime = (user[0].summertime) ? 1 : 0;
    var timegap = user[0].timezone + summertime*60;
    var _d = new Date();
    var d = new Date (Date.UTC(_d.getUTCFullYear(), _d.getUTCMonth(), _d.getUTCDate(), _d.getUTCHours(), _d.getUTCMinutes()+timegap, 0));
    var savedata = [];
    var rt = req.body.t; var t = (rt) ? rt.split(',') : null; if (t) t = checkArray(t); if (t) convertToDate(0,t);
    var rtp1 = req.body.tp1; var tp1 = (rtp1) ? rtp1.split(',') : null; if (tp1) tp1 = checkArray(tp1); if (tp1) convertToDate(1,tp1);
    var rtp2 = req.body.tp2; var tp2 = (rtp2) ? rtp2.split(',') : null; if (tp2) tp2 = checkArray(tp2); if (tp2) convertToDate(2,tp2);
    var rtp3 = req.body.tp3; var tp3 = (rtp3) ? rtp3.split(',') : null; if (tp3) tp3 = checkArray(tp3); if (tp3) convertToDate(3,tp3);
    var rtp4 = req.body.tp4; var tp4 = (rtp4) ? rtp4.split(',') : null; if (tp4) tp4 = checkArray(tp4); if (tp4) convertToDate(4,tp4);
    user[0].teachabledates = savedata;

    var maxinaday = Number(req.body.maxinaday);
    if (maxinaday && typeof maxinaday == 'number' && 0 < maxinaday && maxinaday <= 10 && maxinaday != user[0].maxinaday) user[0].maxinaday = maxinaday;
    var maxinall = Number(req.body.maxinall);
    if (maxinall && typeof maxinall == 'number' && 0 < maxinall && maxinall <= 20 &&  maxinall != user[0].maxinall) {
        (user[0].maxinaday && user[0].maxinaday > maxinall) ? user[0].maxinall = user[0].maxinaday : user[0].maxinall = maxinall;
    }
    if (req.body.maxinaday == '') user[0].maxinaday = null;
    if (req.body.maxinall == '') user[0].maxinall = null;

    user[0].save();
    return res.json({result: "success"});

    function convertToDate(dates, array) {
        for (var i=0;i<array.length;i++) {
            var minutes = array[i] * 30 - timegap;
            if (Math.abs(minutes % 30) == 15) minutes = minutes + 15;
            var thisd = new Date (Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()+dates, 0, minutes, 0));
            savedata.push(thisd);
        }
    }
    function checkArray(array) {
        var res = [];
        for (var i=0;i<array.length;i++) {
            var num = (array[i]) ? Number(array[i]) : null;
            if (Math.round(num) === num && num >= 0 && num < 48) res.push(num);
        } 
        return res;
    }
});
});
module.exports = router;
