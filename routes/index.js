
/*
 * GET home page.
 */

var session = require("../private/lib/wky_session");
var core = require("../private/lib/core");
 
//判断是否用户登录了
var isUserLogin = function(sessionId){
	if(!sessionId){
		return;
	}
	return session.getSessionVal(sessionId);
}
//
var getApis = function(){
	return {
		addSongForm:"/api/add_song_form"
	}
}

exports.index = function(req, res){
	var cookie = req.cookies;
	var rd = {
		isLogin:false
	};
	var sessionId = cookie.wky_session;
	var loginInfo = isUserLogin(sessionId);
	
	if(loginInfo){
		rd.isLogin = true;
		rd.userName = loginInfo.data.user.userName;
		rd.userId = loginInfo.data.userId;
		rd.songFormList = loginInfo.data.user.songFormList;
		rd.apis = getApis();
	}
	console.log(rd);
	rd = JSON.stringify(rd);
	res.render('music', { title: '音乐首页!' ,metas:[],renderData:rd});
};