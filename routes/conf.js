// テスト
var mongoUsers = 'mongodb://localhost:27017/users';
var mongoTmpUsers = 'mongodb://localhost:27017/tmpusers';
var mongoFailLogins = 'mongodb://localhost:27017/faillogins';
var mongoResetTries = 'mongodb://localhost:27017/resettries';
var fb_client_id = '※※※※※※※※※※※※※※※';
var fb_client_secret = '※※※※※※※※※※※※※※※';
var bucket = 'test.chample.in';
var cookieSecure = "";
function sendmail(from,to,subject,text) { 
    console.log('from: '+from+'\n'+'to: '+to+'\n'+'subject: '+subject+'\n'+'text: '+text+'\n');
}

// 本番
/*
var mongoUsers = 'mongodb://172.31.24.86/users';
var mongoTmpUsers = 'mongodb://172.31.24.86/tmpusers';
var mongoFailLogins = 'mongodb://172.31.24.86/faillogins';
var mongoResetTries = 'mongodb://172.31.24.86/resettries';
var fb_client_id = '';
var fb_client_secret = '';
var bucket = '';
var cookieSecure = ";secure";
function sendmail(from,to,subject,text) { 
    var message = { from: from, to: to, subject: subject, text: text };
    mail = transport.sendMail(message, function(error, success) {
        message.transport.close();
        if (error) return false;
        if (success) return true; 
    });
}
*/

var mail_key = "※※※※※※※※※※※※※※※";
var photourl_key = "※※※※※※※※※※※※※※※";
var skypeid_key = "※※※※※※※※※※※※※※※";
var countries = {ae:1,af:1,ag:1,al:1,am:1,ao:1,ar:1,at:1,au:1,az:1,ba:1,bb:1,bd:1,be:1,bf:1,bg:1,bi:1,bj:1,bn:1,bo:1,br:1,bs:1,bt:1,bw:1,by:1,bz:1,ca:1,cd:1,cf:1,cg:1,ch:1,ci:1,cl:1,cm:1,cn:1,co:1,cr:1,cu:1,cv:1,cy:1,cz:1,de:1,dj:1,dk:1,dm:1,do:1,dz:1,ec:1,ee:1,eg:1,er:1,es:1,et:1,fi:1,fj:1,fk:1,fr:1,ga:1,gb:1,gd:1,ge:1,gf:1,gh:1,gl:1,gm:1,gn:1,gq:1,gr:1,gt:1,gw:1,gy:1,hn:1,hr:1,ht:1,hu:1,id:1,ie:1,il:1,in:1,iq:1,ir:1,is:1,it:1,jm:1,jo:1,jp:1,ke:1,kg:1,kh:1,km:1,kn:1,kp:1,kr:1,kw:1,kz:1,la:1,lb:1,lc:1,lk:1,lr:1,ls:1,lt:1,lv:1,ly:1,ma:1,md:1,mg:1,mk:1,ml:1,mm:1,mn:1,mr:1,mt:1,mu:1,mv:1,mw:1,mx:1,my:1,mz:1,na:1,nc:1,ne:1,ng:1,ni:1,nl:1,no:1,np:1,nz:1,om:1,pa:1,pe:1,pf:1,pg:1,ph:1,pk:1,pl:1,pt:1,py:1,qa:1,re:1,ro:1,rs:1,ru:1,rw:1,sa:1,sb:1,sc:1,sd:1,se:1,si:1,sk:1,sl:1,sn:1,so:1,sr:1,st:1,sv:1,sy:1,sz:1,td:1,tg:1,th:1,tj:1,tl:1,tm:1,tn:1,tr:1,tt:1,tw:1,tz:1,ua:1,ug:1,us:1,uy:1,uz:1,ve:1,vn:1,vu:1,ye:1,za:1,zm:1,zw:1};
var languages = {en:1,ar:1,zh:1,fr:1,de:1,hi:1,ja:1,pt:1,ru:1,es:1};
var timezones = [840,780,765,720,660,630,600,570,540,525,510,480,420,390,360,345,330,300,270,240,210,180,120,60,0,-60,-120,-180,-210,-240,-300,-360,-420,-480,-540,-570,-600,-660,-720];
var regions = {as:1,af:1,eu:1,lc:1,na:1,oc:1,me:1};
var regionMap = {
    as:['bd', 'bt', 'bn', 'kh', 'cn', 'in', 'id', 'jp', 'la', 'my', 'mv', 'mn', 'mm', 'np', 'kp', 'pk', 'pg', 'ph', 'kr', 'lk', 'tw', 'th', 'tl', 'vn', 'ye'],
    af:['dz', 'ao', 'bj', 'bw', 'bf', 'bi', 'cm', 'cv', 'cf', 'td', 'km', 'ci', 'cd', 'dj', 'eg', 'gq', 'er', 'et', 'ga', 'gm', 'gh', 'gn', 'gw', 'ke', 'ls', 'lr', 'ly', 'mg', 'mw', 'ml', 'mr', 'mu', 'ma', 'mz', 'na', 'ne', 'ng', 'cg', 're', 'rw', 'st', 'sn', 'sc', 'sl', 'so', 'za', 'sd', 'sr', 'tz', 'tg', 'tn', 'ug', 'zm', 'zw'],
    eu:['al', 'am', 'at', 'az', 'by', 'be', 'ba', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'ge', 'de', 'gr', 'gl', 'hu', 'is', 'ie', 'it', 'kz', 'kg', 'lv', 'lt', 'mk', 'mt', 'md', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'rs', 'sk', 'si', 'es', 'sz', 'se', 'ch', 'tj', 'tm', 'ua', 'gb', 'uz'],
    lc:['ag', 'ar', 'bs', 'bb', 'bz', 'bo', 'br', 'cl', 'co', 'cr', 'cu', 'dm', 'do', 'ec', 'sv', 'fk', 'gf', 'gd', 'gt', 'gy', 'ht', 'hn', 'jm', 'mx', 'ni', 'pa', 'py', 'pe', 'kn', 'lc', 'tt', 'uy', 've'],
    na:['ca', 'us'],
    oc:['au', 'fj', 'pf', 'nc', 'nz', 'sb', 'vu'],
    me:['af', 'ir', 'iq', 'il', 'jo', 'kw', 'lb', 'om', 'qa', 'sa', 'sy', 'tr', 'ae']
};

function getTimes(user, info) {
    var summertime = (user.summertime) ? 1 : 0;
    var timegap = user.timezone + (summertime*60);
    var _d = new Date();
    var d = new Date (Date.UTC(_d.getUTCFullYear(), _d.getUTCMonth(), _d.getUTCDate(), _d.getUTCHours(), _d.getUTCMinutes()+timegap, 0));
    var ctime = d.getUTCFullYear() +","+ d.getUTCMonth() +","+ d.getUTCDate() +"," + d.getUTCHours() +","+ d.getUTCMinutes();
    var startoftoday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, -timegap, 0));
    var endoftoday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()+1, 0, -timegap, 0));
    var isquarter = 'false';
    if (Math.abs(timegap % 30) == 15) isquarter = 'true';
    var thisgap = (isquarter == 'true') ? timegap - 15 : timegap;
    var startOfThisday = (typeof info.day == 'number') ? new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + info.day, 0, -thisgap, 0)) : startoftoday;
    var endOfThisday = (typeof info.day == 'number') ? new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + info.day+1, 0, -thisgap, 0)) : endoftoday;
    var start = (typeof info.from == 'number') ? new Date(startOfThisday.getTime() + info.from*30*60*1000) : startOfThisday;
    var end = (typeof info.to == 'number') ? new Date(startOfThisday.getTime() + info.to*30*60*1000 + 1) : endOfThisday;
    var from = info.from; var to = info.to;
    if (start < _d) {
        from = Math.ceil((d.getUTCHours()*60+d.getUTCMinutes())/30);
        start = new Date(_d.getTime() + (30*60*1000 - (_d.getTime() % (30*60*1000))));
    }
    if (start > end) { end = endoftoday; from = null; to = null;}

    return {
        now: _d,
        nowLoc: d,
        nowLocStr: ctime,
        stOfToday: startoftoday,
        enOfToday: endoftoday,
        isQuarter: isquarter,
        timegap: timegap,
        timegapQt: thisgap,
        stOfThisday: startOfThisday,
        start: start,
        end: end,
        from: from,
        to: to,
    };
}

var AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: '※※※※※※※※※※※※※※※',
    secretAccessKey: '※※※※※※※※※※※※※※※',
    region: 'ap-northeast-1',
    s3_endpoint: "s3-ap-northeast-1.amazonaws.com"
});
var s3 = new AWS.S3();



module.exports = {
    mongoUsers: mongoUsers,
    mongoTmpUsers: mongoTmpUsers,
    mongoFailLogins: mongoFailLogins,
    mongoResetTries: mongoResetTries,
    fb_client_id: fb_client_id,
    fb_client_secret: fb_client_secret,
    bucket: bucket,
    cookieSecure: cookieSecure,
    mail_key: mail_key,
    photourl_key: photourl_key,
    skypeid_key: skypeid_key,
    countries: countries,
    languages: languages,
    timezones: timezones,
    regions: regions,
    regionMap: regionMap,
    getTimes: getTimes,
    s3: s3,
    sendmail: sendmail
}