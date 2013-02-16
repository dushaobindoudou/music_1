
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  ,session = require("./private/lib/wky_session");

var app = express();

//设置配置文件
app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

session.startSession();

//页面输出
app.get(/^\/?$/, require("./routes/index").index);//默认页面
app.get(/^\/index.html/, require("./routes/index").index);//首页
app.get(/^\/music.html/,require("./routes/music").music);//音乐页面
app.get(/^\/guanggao.html/, require("./routes/guanggao").guanggao);//广告页面
app.get(/^\/signup.html/,require("./routes/signup").signup);//注册页面
app.get(/^\/login.html/,require("./routes/login").login);//登录页面

//接口输出
app.post(/^\/api\/singup_api/,require("./api/signup").singupApi);
app.post(/^\/api\/login_api/,require("./api/login").loginApi);
app.get(/^\/api\/is_user_name_signup/,require("./api/is_user_name_singup").isUserNameSingup);
app.get(/^\/api\/is_email_signup/,require("./api/is_email_singup").isEmailSingup);
app.get(/^\/api\/add_song_form/,require("./api/add_song_form").addSongForm);
app.get(/^\/api\/add_song_to_form/,require("./api/add_song_to_form").addSongToForm);
app.get(/^\/api\/save_all_data/,require("./api/save_all_data").saveAllData);
app.get(/^\/api\/test/,require("./api/test").test);

app.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
