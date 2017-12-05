var express = require('express');
var router = express.Router();
var userCheck = require('./userCheck.js');
var Users = require('./dbModel.js').Users;
var conf = require('./conf.js');

/* GET home page. */
router.get('/', function(req, res, next) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.render('signin');
    if (typeof user[0].timezone == 'number') {
        var requestDayRaw = req.query.day;
        var requestDay = (requestDayRaw) ? Number(requestDayRaw) : null;
        if (typeof requestDay != 'number' || requestDay < 0 || requestDay > 4) requestDay = null;
        
        var timerange = [null,null];
        var from = req.query.from; var to = req.query.to;
        from = (from || typeof from == 'number') ? Number(from) : null; from = (typeof from == 'number' && 0 <= from && from < 48 && from == Math.round(from)) ? from : null;
        to = (to || typeof to == 'number') ? Number(to) : null; to = (typeof to == 'number' && 0 <= to && to < 48 && to == Math.round(to)) ? to : null;
        if (from != null && to != null && from > to) {from = null;to = null;} 

        var times = conf.getTimes(user[0], {from: from, to: to, day: requestDay});
        var lang = (user[0].studylang) ? user[0].studylang : 'en';
        var start = times.start; var end = times.end;
        from = times.from; to = times.to;

        var query = {
            id: {$nin: [user[0].id]},
            languages: {$in: [lang]},
            teachabledates: {$elemMatch: {$gte:start, $lt:end}}
        }
        
        var gender = req.query.gender;
        (gender == 'fe' || gender == 'ma') ? query.gender = gender : gender = null;
        
        var regionsRaw = req.query.regions;
        var regions = (regionsRaw) ? regionsRaw.split(',') : null;
        var checkedRegions = []; var regionsQuery = []; var regionsStr = '';
        if (regions) {
            for (var i=0; i<regions.length; i++) if (conf.regions[regions[i]] && checkedRegions.indexOf(regions[i]) == -1) checkedRegions.push(regions[i]);
            for (var i=0; i<checkedRegions.length; i++) regionsQuery = regionsQuery.concat(conf.regionMap[checkedRegions[i]]);
            if (regionsQuery) { query.country = {$in: regionsQuery}; regionsStr = checkedRegions.join(','); }
        }

        Users.find(query,{},{},function(err, teachers) {
            restIdsArray = [];
            var persons = ['','',''];
            for (var i=0; i<teachers.length; i++) {
                // 最大予約数を超えていたら、リストに追加しない。
                var max_today = []; var max_all = [];
                if (teachers[i].maxinaday || teachers[i].maxinall) {
                    for (var k=0; k<teachers[i].bereserved.length; k++) {
                        var _d = new Date(teachers[i].bereserved[k].date);
                        console.log(_d);
                        var d = new Date (Date.UTC(_d.getUTCFullYear(), _d.getUTCMonth(), _d.getUTCDate(), _d.getUTCHours(), _d.getUTCMinutes()+times.timegapQt, 0));
                        if (_d.getTime() < start.getTime()) continue;
                        if (_d.getTime() < end.getTime()) { max_today.push(1); max_all.push(1); continue; }
                        max_all.push(1);
                    }          
                }
                if (teachers[i].maxinaday && teachers[i].maxinaday <= max_today.length ) continue;
                if (teachers[i].maxinall && teachers[i].maxinall <= max_all.length ) continue;

                // 3人を超える分はidだけ送っておいて、ページが開かれるときにpostしてもらう。
                restIdsArray.push(teachers[i].id);
                if (i >= 3) continue;

                var atoday = [];
                for (var j=0; j<teachers[i].teachabledates.length; j++) {
                    var _dd = new Date(teachers[i].teachabledates[j]);
                    var dd = new Date (Date.UTC(_dd.getUTCFullYear(), _dd.getUTCMonth(), _dd.getUTCDate(), _dd.getUTCHours(), _dd.getUTCMinutes()+times.timegapQt, 0));
                    var val = Math.floor(((dd.getUTCHours()*60) + dd.getUTCMinutes()) / 30);
                    if (_dd.getTime() < start.getTime()) continue;
                    if (_dd.getTime() < end.getTime()) { atoday.push(val); continue; }
                }
                persons[i] = teachers[i].nickname+'|'+teachers[i].country+'|'+teachers[i].id+'|'+atoday.join(",");
            }
            var restIds = (restIdsArray) ? restIdsArray.join(',') : '';
            return res.render('study', {person1: persons[0], person2: persons[1], person3: persons[2],
                restIds: restIds, ctime: times.nowLocStr, lang: lang, requestDay: requestDay,
                isquarter: times.isQuarter, from: from, to: to, gender: gender, regions: regionsStr});          
        });
    }
});
});

router.post('/addition', function (req, res) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.json({result: "error"});
    var idsRaw = req.body.ids;
    var ids =  (idsRaw) ? idsRaw.split(',') : null;
    if (!ids) return res.json({result: "error"});
    var requestDayRaw = req.query.day;
    var requestDay = (requestDayRaw) ? Number(requestDayRaw) : null;
    if (typeof requestDay != 'number' || requestDay < 0 || requestDay > 4) requestDay = null;

    var times = conf.getTimes(user[0], {});
    var persons = ['','',''];
    var start, end;
    if (!requestDay || requestDay == 0) {
        start = times.now;
        end = times.enOfToday;
    } else {
        start = new Date(times.enOfToday.getTime() + (requestDay-1)*24*60*60*1000);
        end = new Date(times.enOfToday.getTime() + requestDay*24*60*60*1000);
    }
    Users.find({id: {$in: ids}},{},{},function(err, teachers) {
        for (var i=0; i < teachers.length; i++) {
            var atoday = [];
            for (var j=0; j<teachers[i].teachabledates.length; j++) {
                var _dd = new Date(teachers[i].teachabledates[j]);
                var dd = new Date (Date.UTC(_dd.getUTCFullYear(), _dd.getUTCMonth(), _dd.getUTCDate(), _dd.getUTCHours(), _dd.getUTCMinutes()+times.timegapQt, 0));
                var val = Math.floor(((dd.getUTCHours()*60) + dd.getUTCMinutes()) / 30);
                if (_dd.getTime() < start.getTime()) continue;
                if (_dd.getTime() < end.getTime()) { atoday.push(val); continue; }
            }
            persons[i] = teachers[i].nickname+'|'+teachers[i].country+'|'+teachers[i].id+'|'+atoday.join(",");
        }
        return res.json({result: "success",person1: persons[0], person2: persons[1], person3: persons[2]});
    });  
});
});

router.post('/changelang', function (req, res) {
userCheck.getUser(req.cookies.id, function(user) {
    var lang = req.body.lang;
    if (!user || !lang || !conf.languages[lang]) return res.json({result: "error"});
    user[0].studylang = lang; user[0].save();
    return res.json({result: "success"});
});
});

router.post('/reserve', function (req, res) {
userCheck.getUser(req.cookies.id, function(user) {
    if (!user) return res.json({result: "error"});
    var rawdata = req.body.data;
    var data = (rawdata) ? rawdata.split(',') : null;
    if (!(data && data.length == 4)) return res.json({result: "error"});
    var day = Number(data[0]);
    if (day < 0 || day > 4 || day != Math.round(day)) return res.json({result: "error"});
    var index = Number(data[1]);
    if (index < 0 || index >= 48 || index != Math.round(index)) return res.json({result: "error"});
    var id = data[2];
    if (!(id.match(/^[A-Za-z0-9]{10}$/))) return res.json({result: "error"});
    var lang = data[3];
    if (!conf.languages[lang]) return res.json({result: "error"});

    var times = conf.getTimes(user[0],{day: day});
    var searchdate = new Date(times.stOfThisday.getTime() + index*30*60*1000);

    Users.find({id: id, languages: {$in: [lang]}, teachabledates: {$in:[searchdate]}},{},{limit:1},function(err, teacher) {
        if (req.body.isfinal == 'false') return (teacher[0]) ? res.json({result:"success"}) : res.json({result: "error"});
        teacher[0].bereserved.push({ id: user[0].id,nickname: user[0].nickname,country: user[0].country,skypeid: user[0].skypeid,date: searchdate,language: lang });
        // dateをindexOfで探索するときは、数値化する必要がある。
        var index1 = teacher[0].teachabledates.map(Number).indexOf(+searchdate);
        if (index1 == -1) return res.json({result: "error"});
        teacher[0].teachabledates.splice(index1,1);
        teacher[0].save();
        user[0].reserved.push({ id: id,nickname: teacher[0].nickname,country: teacher[0].country,skypeid: teacher[0].skypeid, date: searchdate,language: lang });
        user[0].save();
        /*
        conf.sendmail('resavations@chample.in(Chample)', mail, '【Chample】予約完了 ',
                    'Code: '+ token + '\n Enter this code in Chample. (Do not reply to this mail.)');
        */
        return res.json({result:"success"});
    });
});
});

module.exports = router;
