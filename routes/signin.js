var express = require('express');
var router = express.Router();
var url = require('url');
var request = require('request');
var conf = require('./conf.js');
var Users = require('./dbModel.js').Users;
var TmpUsers = require('./dbModel.js').TmpUsers;
var userCheck = require('./userCheck.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('signin');
});

router.post('/', function (req, res) {
    var mail = req.body.mail;
    var pass = req.body.pass;
    if (!mail.match(/.+@.+\..+/) || !pass.match(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,100}$/)) return res.json({result: "error"});
    var mail_encrypted = userCheck.encrypt(mail, conf.mail_key);
    TmpUsers.find({mail: mail_encrypted},{},{limit:1}, function(err, tmpuser) {
        if (err) return res.json({result: "error"});
        var pass_hashed = (tmpuser[0] && tmpuser[0].sid) ? userCheck.makeHash(pass+tmpuser[0].sid) : null;
        // 30分以内に同一アドレス、同一パスワードが来たら、メールは送らずに画面遷移だけさせる。
        if (tmpuser[0] && pass_hashed && tmpuser[0].password == pass_hashed && (new Date() - new Date(tmpuser[0].date))/1000 <= 1800) return res.json({result: "success", cookie: tmpuser[0].cookie});  
        // 30分以内に同一アドレス、異パスワードが来たら、「もう一回送りましたよ」というメッセージを出す。
        if (tmpuser[0] && (new Date() - new Date(tmpuser[0].date))/1000 <= 1800) return res.json({result: "exist"});
        // 30分を過ぎていたら、それを削除して、新たにつくる。だからreturnしない。
        if (tmpuser[0]) tmpuser[0].remove();
        // sidは被らないように。
        var dupcount = 0;
        checksid();
        function checksid() {
        var sid = userCheck.makeRandomString(15);
        TmpUsers.find({sid: sid},{},{limit:1}, function(err1, dup) {
            if (err1) return res.json({result: "error"});
            if (dup[0]) {
                dupcount++;
                // 100回連続被ったら明らかに異常なのでエラーを返す
                if (dupcount > 100) return res.json({result: "error"});
                return checkcookie();
            } 
            Users.find({sid: sid},{},{limit:1}, function(err, dup2) {
                if (err) return res.json({result: "error"});
                if (dup2[0]) {
                    dupcount++;
                    if (dupcount > 100) return res.json({result: "error"});
                    return checkcookie();
                }
                var newTmpUser = new TmpUsers();
                var token = userCheck.makeRandomString(10);
                if (!pass_hashed) pass_hashed = userCheck.makeHash(pass+sid);
                newTmpUser.mail = mail_encrypted; newTmpUser.password = pass_hashed;
                newTmpUser.token = token; newTmpUser.sid = sid;
                newTmpUser.date = new Date();
                newTmpUser.save();
                conf.sendmail('issue_code@chample.in(Chample)', mail, 'Code for Signin',
                    'Code: '+ token + '\n Enter this code in Chample. (Do not reply to this mail.)');
                return res.json({result:"success", cookie: sid});  
            });
        });
        } 
    });
});

var fb_params = {
    host: 'graph.facebook.com',
    pathname: '/oauth/access_token',
    protocol: 'https',
    query: {
        'client_id': conf.fb_client_id,
        'client_secret': conf.fb_client_secret,
        'grant_type': 'client_credentials'
    }
};

router.post('/fblogin', function (req, res) {
    var fbtoken = req.body.fbtoken;
    var q = req.query.q;
    var fbAppAccessToken;

    request(url.format(fb_params), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            response.setEncoding('utf8');

            // 急にfacebook仕様が変わりやがった！jsonの文字列で返ってくるので、それをパースしてトークンを取得する。
    　      //fbAppAccessToken = body.split('=')[1];
            var bodyjson = JSON.parse(body);
            fbAppAccessToken = bodyjson.access_token;

            if (q == "connect") {
                fbCheckAccessToken(fbtoken, fbAppAccessToken, fb_connect, res, req);
            } else {
                fbCheckAccessToken(fbtoken, fbAppAccessToken, fb_success, res, req);
            }
            
        } else {
            console.log('error: ' + response.statusCode);
            console.log(body);
            return res.json({stat:"er"});
        }
    });
});

var fbCheckAccessToken = function(inputToken, fbAppAccessToken, callback, res, req) {
    var params = {
        host: 'graph.facebook.com',
        pathname: '/debug_token',
        protocol: 'https',
        query: {
            'input_token': inputToken,
            'access_token': fbAppAccessToken
        }
    };
    console.log(params);
    request(url.format(params), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            response.setEncoding('utf8');
            var resJson = JSON.parse(body);
            if (!resJson.data || !resJson.data.is_valid) {
                console.log('FB Invalid access token');
                return res.json({stat:"er"});
            };
            if (resJson.data.is_valid) {
                callback(resJson.data.user_id, inputToken, fbAppAccessToken, res, req);
            }
        } else {
            console.log('error: ' + response.statusCode);
            console.log(body);
            return res.json({stat:"er"});
        }
    });
}

function fb_success(fbid, inputToken, fbAppAccessToken, res, req) {
    var params = {
        host: 'graph.facebook.com',
        pathname: '/'+fbid,
        protocol: 'https',
        query: {
            'access_token': fbAppAccessToken,
            'fields': "email,first_name,gender,locale,picture.width(120).height(120)",
            'locale': 'en_US'
        }
    };
    request(url.format(params), function (error, response, body) {
        if (error || response.statusCode != 200) return res.json({stat:"error"});
        response.setEncoding('utf8');
        var resJson = JSON.parse(body);
        if (!resJson.id) return res.json({result: "error"});
        Users.find({fbid:resJson.id},{},{limit:1}, function(err, user) {
            if (err) return res.json({result: "error"});
            if (user[0] && user[0].sid && user[0].key) {
                res.cookie('id', user[0].sid+":"+userCheck.makeHmac(user[0].sid, user[0].key)+conf.cookieSecure);
                return res.json({result:"ok"});
            }
            // idは被らないように。
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
                newUser.id = id;
                newUser.sid = sid;
                newUser.key = key;
                newUser.fbid = resJson.id;
                if (resJson.email && resJson.email.match(/.+@.+\..+/)) newUser.mail = userCheck.encrypt(resJson.email, conf.mail_key);
                
                var firstname = userCheck.nameCheck(resJson.first_name);
                if (firstname) newUser.nickname = firstname;
                
                var gender = genderCheck(resJson.gender);
                if (gender) newUser.gender = gender;

                var url = userCheck.checkPhotoUrl(resJson.picture.data.url);
                if (url) newUser.photourl = userCheck.encrypt(url, conf.photourl_key);

                var langCountry = langCountryScrape(resJson.locale);
                if (langCountry[0]) newUser.languages = [langCountry[0]];
                if (langCountry[1]) newUser.country = langCountry[1];
                
                newUser.save();
                res.cookie('id', sid+":"+hashedId+conf.cookieSecure);
                return;
            });
            }
        });
    });
}

function genderCheck(gender) {
    var res;
    if (gender == "female") res = "fe";
    if (gender == "male") res = "ma";
    return res;
}
function langCountryScrape(locale) {
    var language,country;
    if (locale.length == 5) {
        var l = locale.slice(0,2); l = l.toLowerCase();
        var c = locale.slice(-2); c = c.toLowerCase();
        if (conf.languages[l] == 1) language = l;
        if (conf.countries[c] == 1) country = c;
        return [language, country];
    }
    return [null, null];
}




/*
function fb_connect(fbid, inputToken, fbAppAccessToken, res, req) {
    userCheck.getUser(req.cookies.id, function(user) {
        if (user) {
            var params = {
                host: 'graph.facebook.com',
                pathname: '/'+fbid,
                protocol: 'https',
                query: {
                    'access_token': fbAppAccessToken,
                }
            };
            request(url.format(params), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    response.setEncoding('utf8');
                    var resJson = JSON.parse(body);
                    var fbid = resJson.id;
                    if (fbid) {
                        Users.find({fbid: fbid},{id:1},{limit:1}, function(err, duplicate) {
                            if (duplicate[0]) {
                                return res.json({stat:"du"});
                            } else {
                                user[0].fbid = fbid;
                                user[0].save();
                                return res.json({stat:"ok"});
                            }
                        });
                    } else {
                        return res.json({stat:"er"});
                    }
                } else {
                    return res.json({stat:"er"});
                }
            });
        }
    });
}
*/

/*

var oauth_consumer_key = "syp3LDF0ZFLZDgFzqXTEksJZk";
var oauth_consumer_secret = 'xCww2y6YUuPBON0fiRK9SQVRbCUvAcTBYIPda4LKbx7QmyH8u4';
var oauth_token = '748755310525837313-nTzYrJ0h8Zb5ddsChZVvifLlIvcmY6g';

router.post('/twlogin', function (req, res) {
    var d = new Date();
    var n = d.getTime() / 1000;
    var nonce = userCheck.makeRandomString(16);

    var c = encodeForTwitter('http://localhost:3000/');
    var u = encodeForTwitter('https://api.twitter.com/oauth/request_token');
    var q = encodeForTwitter('oauth_consumer_key='+oauth_consumer_key+'&oauth_nonce='+nonce+'&oauth_signature_method=HMAC-SHA1&oauth_timestamp:'+n+'&oauth_version=1.0');
    // oauth_callback='+c+'&
    var e_uri = 'POST&'+u+'&'+q;
    var hash = userCheck.makeHmacSha1(e_uri, oauth_consumer_secret);
    var encode = new Buffer(hash).toString('base64');

    var options = {
        url: 'https://api.twitter.com/oauth/request_token',
        method: 'POST',
        Authorization: 'OAuth oauth_consumer_key="'+oauth_consumer_key+'", oauth_nonce="'+nonce+'", oauth_signature="'+encode+'", oauth_signature_method="HMAC-SHA1", oauth_timestamp="'+n+'", oauth_token="'+oauth_token+'", oauth_version="1.0"',
        // oauth_callback="'+c+'",
        //headers: {
        //    Authorization: 'OAuth oauth_callback="'+c+'", oauth_consumer_key="'+oauth_consumer_key+'", oauth_nonce="'+nonce+'", oauth_signature="'+encode+'", oauth_signature_method="HMAC-SHA1", oauth_timestamp="'+n+'", oauth_version="1.0"'
        //},
        
        json: true,
        form : {
            //oauth_callback: c,
            oauth_consumer_key: oauth_consumer_key,
            oauth_nonce: nonce,
            oauth_signature: encode,
            oauth_signature_method: "HMAC-SHA1",
            oauth_timestamp: n,
            oauth_version: "1.0"
        }
    };

    var params = {
        host: 'api.twitter.com',
        pathname: '/oauth/request_token',
        protocol: 'https',
        auth: 'OAuth oauth_consumer_key="'+oauth_consumer_key+'", oauth_nonce="'+nonce+'", oauth_signature="'+encode+'", oauth_signature_method="HMAC-SHA1", oauth_timestamp="'+n+'", oauth_token="'+oauth_token+'", oauth_version="1.0"',
        query: {
            oauth_consumer_key: oauth_consumer_key,
            oauth_nonce: nonce,
            oauth_signature: encode,
            oauth_signature_method: "HMAC-SHA1",
            oauth_timestamp: n,
            oauth_version: "1.0"
        }
    };

    request(url.format(params), function (error, response, body) {
        if(error || response.statusCode != 200) {
            console.log(error);
            console.log(response);
            console.log(body);
            res.json({result:"error"});
            return;
        }
        response.setEncoding('utf8');
        var resJson = JSON.parse(body);
        console.log(resJson);
        res.json({result:"ok"});
    });
    return;
});
*/
function encodeForTwitter(toEncode) {
    if( toEncode == null || toEncode == "" ) return ""
    else {
        var result= encodeURIComponent(toEncode);
        // Fix the mismatch between OAuth's  RFC3986's and Javascript's beliefs in what is right and wrong ;)
        return result.replace(/\!/g, "%21")
                     .replace(/\'/g, "%27")
                     .replace(/\(/g, "%28")
                     .replace(/\)/g, "%29")
                     .replace(/\*/g, "%2A");
    }
}


module.exports = router;
