var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var home = require('./routes/home');
var signin = require('./routes/signin');
var confirm = require('./routes/confirm');
var login = require('./routes/login');
var oauth = require('./routes/oauth');
var userinfo = require('./routes/userinfo');
var changemail = require('./routes/changemail');
var changepass = require('./routes/changepass');
var forgetpass = require('./routes/forgetpass');
var teach = require('./routes/teach');
var study = require('./routes/study');

var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;
passport.serializeUser(function (user, done) { done(null, user);});
passport.deserializeUser(function (obj, done) { done(null, obj);});
passport.use(new TwitterStrategy({
    consumerKey: "※※※※※※※※※※※※※※※",
    consumerSecret: "※※※※※※※※※※※※※※※",
    callbackURL: "http://localhost:3000/oauth/callback"
}, function(token, tokenSecret, profile, done) {
    console.log(profile);
    passport.session.id = profile._json.id_str;
    passport.session.nickname = profile._json.name;
    passport.session.photo = profile._json.profile_image_url_https;
    passport.session.lang = profile._json.lang;
    console.log(passport.session);
    done(null, profile.id);
} ));

var app = express();

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', home);
app.use('/signin', signin);
app.use('/confirm', confirm);
app.use('/login', login);
app.use('/oauth', oauth);
app.use('/userinfo', userinfo);
app.use('/changemail', changemail);
app.use('/changepass', changepass);
app.use('/forgetpass', forgetpass);
app.use('/teach', teach);
app.use('/study', study);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
