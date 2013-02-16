/*
*
*
*  保存用户数据
*
*
*
*
*
*
*/
var session = require("../private/lib/wky_session");
var userModel = require('../model/user_md');

//保存用户数据
var saveUserData = function(){
	return userModel.saveAllData();
}

//判断是否用户登录了
var isUserLogin = function(sessionId){
	if(!sessionId){
		return;
	}
	return session.getSessionVal(sessionId);
}
//处理用户请求
var processReq = function(loginInfo){
	var resData = {
		status:0,
		msg:""
	};
	if(!loginInfo){
		resData.msg = "没有登录!"
		return resData;
	}
	saveUserData();
	resData.status = 1;
	resData.msg = "保存成功!"
	return resData;
}


module.exports.saveAllData = function(req,res){
	var cookie = req.cookies;
	var resData = {
		status:0,
		msg:""
	};
	var sessionId = cookie.wky_session;
	var loginInfo = isUserLogin(sessionId);
	resData = processReq(loginInfo);
	res.contentType('application/json,application/javascript; charset=utf-8');
	res.send(JSON.stringify(resData));
}