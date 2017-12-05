var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var conf = require('./conf.js');

var lessonSchema = new Schema({
    id: String,
    nickname: String,
    country: String,
    skypeid: String,
    date: Date,
    language: String
}, { noId: true });

var userSchema = new Schema({
    // 基本情報
    id: String, // ユーザーの識別用
    sid: String, // secretId ログインのクッキー用
    key: String,
    fbid: String,
    twid: String,
    mail: String,
    password: String,
    // プロフィール
    nickname: String,
    skypeid: String,
    country: String,
    languages: [String],
    gender: String,
    timezone: Number,
    summertime: Boolean,
    intro: String,
    photourl: String,
    // メールの変更
    tmpmail: String,
    token: String,
    tokendate: Date,
    cmmiss: Number,
    // パスワードリセット
    resettoken: String,
    resetdate: Date,
    resetcookie: String,
    resetmiss: Number,
    isresetok: Boolean,
    // 教えられる時間
    teachabledates: [Date],
    maxinaday: Number,
    maxinall: Number,
    // 教わりたい言語
    studylang: {type: String, default: 'en'},
    // 予約・被予約
    reserved: [lessonSchema],
    bereserved: [lessonSchema],
});
mongoose.model('users', userSchema);

var tmpuserSchema = new Schema({
    mail: String,
    password: String,
    date: Date,
    sid: String,
    token: String,
    mistakes: {type: Number, default: 0}
});
mongoose.model('tmpusers', tmpuserSchema);

var failloginSchema = new Schema({
    ip: String,
    date: Date
});
mongoose.model('faillogins', failloginSchema);

var resettrySchema = new Schema({
    ip: String,
    date: Date
});
mongoose.model('resettries', resettrySchema);

mongoose.Promise = global.Promise;
var dbUsers = mongoose.createConnection(conf.mongoUsers);
var Users = dbUsers.model('users');

var dbTmpUsers = mongoose.createConnection(conf.mongoTmpUsers);
var TmpUsers = dbTmpUsers.model('tmpusers');

var dbFailLogins = mongoose.createConnection(conf.mongoFailLogins);
var FailLogins = dbFailLogins.model('faillogins');

var dbResetTries = mongoose.createConnection(conf.mongoResetTries);
var ResetTries = dbResetTries.model('resettries');

module.exports = {
    Users: Users,
    TmpUsers: TmpUsers,
    FailLogins: FailLogins,
    ResetTries: ResetTries
}