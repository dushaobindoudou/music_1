/*
*
*
* 添加一个歌曲列表
*
*
*
*
*
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
//是否存在歌单名字 
var isExistFormName = function(formList,formName){
	var isExist = false;
	core.keyInArray(formList,function(i,v){
		if(v.name == formName){
			isExist = true;
			return false;
		}
	})
	return isExist;
}

//处理用户请求
var processReq = function(session,formName){
	var resData = {
		status:0,
		msg:""
	};
	if(!session){
		resData.msg = "用户没有登录，或者登录时间太久了,请重新登录！";
		return resData;
	}
	if(!formName || formName.length > 10){
		resData.msg = "表单名为空,或者大于10个字符!";
		return resData;
	}
	var userInfo = session.data.user;
	if(!userInfo){
		resData.msg = "session 出错了！"
		return resData;
	}
	if(!userInfo.songFormList){
		userInfo.songFormList = [];
		userInfo.songFormList.push({
			name:formName,
			songList:[]
		});
		resData.status = 1;
		resData.msg = "添加成功!";
	}else{
		if(!isExistFormName(userInfo.songFormList,formName)){
			userInfo.songFormList.push({
				name:formName,
				songList:[]
			});
			resData.status = 1;
			resData.msg = "添加成功!";
		}else{
			resData.msg = "歌曲列表已经存在！";
		}
	}
	return resData;
}

module.exports.addSongForm = function(req,res){
	var cookie = req.cookies;
	var resData = {
		status:0,
		msg:""
	};
	var sessionId = cookie.wky_session;
	var loginInfo = isUserLogin(sessionId);
	var formName = req.param("form_name");
	resData = processReq(loginInfo,formName);
	res.contentType('application/json,application/javascript; charset=utf-8');
	res.send(JSON.stringify(resData));
}
