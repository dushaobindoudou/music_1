/*
*
* 注册接口，返回json数据
*
*
*/

var core = require('../private/lib/core');
var cryptoRsa = require('../private/crypto/crypto_rsa');
var session = require('../private/lib/wky_session');
var userModel = require('../model/user_md');

//获取用户id
var getUserId = function(userName){
	//todo: 过滤某些用户名 可以做保留
	return userModel.isUserNameSingup(userName);
}

//保存到数据存储中
var getLoginInfo = function(user){
	if(!user){
		return false;
	}
	var res = "";
	var loginInfo = {
		status:0,
		msg:"",
		userId:"",
		userInfo:null
	};
	var userId = getUserId(user.userName);
	if(!userId){
		loginInfo.msg = "用户没有注册!";
		return loginInfo;
	}
	res = userModel.get(userId);
	if(!res){
		loginInfo.msg = "用户没有注册!";
		return loginInfo;
	}
	if(res.isLogin){
		session.removeSession(res.sessionId);
	}
	if(res.password == user.password){
		loginInfo.status = 1;
		loginInfo.msg = "登录成功!";
		loginInfo.userId = userId;
		loginInfo.userInfo = res;
	}else{
		loginInfo.msg = "登录失败!";
	}
	return loginInfo;
}


//处理表单提交数据
var processUserData = function(deCrypedUD,res){
	var resData = {
		status:1,
		msg:""
	}
	var loginRes = "";
	var sessionVal = null;
	var pwdSecClass = null;
	//todo:加密开一个进程
	if(!deCrypedUD){
		resData.status = 0;
		resData.msg = "解密失败！超过三次将会限制IP！";
		return resData;
	}
	deCrypedUD = JSON.parse(deCrypedUD);
	if(!deCrypedUD){
		resData.status = 0;
		resData.msg = "解密失败！超过三次将会限制IP！";
		return resData;
	}
	if(!core.checkName(deCrypedUD.userName)){
		resData.status = 0;
		resData.msg = "用户名不符合要求！";
		return resData;
	}
	pwdSecClass = core.checkPasswordClass(deCrypedUD.password);
	if(!pwdSecClass.secureClass){
		resData.status = 0;
		resData.msg = "密码不符合要求！";
		return resData;
	}
	/*if(!core.checkEmail(deCrypedUD.email)){
		resData.status = 0;
		resData.msg = "email 不符合要求！";
		return resData;
	}*/
	loginRes = getLoginInfo(deCrypedUD);
	if(loginRes.status){
		loginRes.userInfo.isLogin = true;
		//设置cookie
		sessionVal = session.setSession({
			userId:loginRes.userId,
			expire:expire,
			expireCallback:function(sId){
				//todo:内存不会释放掉,这个俗所谓啦，反正也不指望他能释放掉
				loginRes.userInfo.isLogin = false;
				loginRes.userInfo.sessionId = null;
				//console.log("why not call?");
				console.log(sId+"成功退出！");
			},
			sessionRef:{
				user:loginRes.userInfo,
				ipAddress:"",
				userId:loginRes.userId
			},
			res:res
		});
		loginRes.userInfo.sessionId = sessionVal.sessionId;
		resData.status = 1;
		resData.msg = loginRes.msg;
	}else{
		resData.msg = loginRes.msg;
	}
	return resData;
}

var expire = 36000000;//session过期时长十个小时

module.exports.loginApi = function(req,res){
	var resData = {};
	var userData = req.body["user_data"];
	var deCrypedUD = cryptoRsa.rsaDecrypt(userData);
	resData = processUserData(deCrypedUD,res);
	res.contentType('application/json,application/javascript; charset=utf-8');
	res.send(JSON.stringify(resData));
}





