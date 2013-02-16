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
var getSongForm = function(formList,formName){
	var songForm = false;
	core.keyInArray(formList,function(i,v){
		if(v.name == formName){
			songForm = v;
			return false;
		}
	});
	return songForm;
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
		resData.msg = "歌单名为空,或者大于10个字符!";
		return resData;
	}
	var userInfo = session.data.user;
	var songForm = false;
	if(!userInfo){
		resData.msg = "session 出错了！"
		return resData;
	}
	if(!userInfo.songFormList){
		resData.msg = "你还没有添加任何歌单!";
		return resData;
	}else{
		songForm = getSongForm(userInfo.songFormList,formName);
		if(!songForm){
			resData.msg = "没有该歌单，请先添加!";
			return resData;
		}else{
			if(!core.isArray(songForm.songList)){
				songForm.songList = [];
			}
			songForm.songList.push({
							mp3: "music/jingguo.mp3",
							songName: "经过",
							songer: "何洁",
							songCorver: "",
							lrc: {}
				});
				resData.status = 1;
				resData.msg = "添加成功!";
		}
	}
	return resData;
}

module.exports.addSongToForm = function(req,res){
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
