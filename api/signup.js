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


//保存到数据存储中
var saveData = function(user){
	if(!user){
		return false;
	}
	var res = "";
	res =  userModel.add(user);
	//userModel.saveAllData();
	return res;
}


//处理表单提交数据
var processUserData = function(deCrypedUD,res){
	var resData = {
		status:1,
		msg:""
	}
	var userId = "";
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
	if(!core.checkEmail(deCrypedUD.email)){
		resData.status = 0;
		resData.msg = "email 不符合要求！";
		return resData;
	}
	userId = saveData(deCrypedUD);
	if(!userId){
		resData.status = 0;
		resData.msg = "数据保存失败！";
		return resData;
	}
	//设置登录，表示已经登录,要判断是否登录如果已经登录了,(账号可能已经有问题了。提示修改密码，跟踪当前登录，并查找bug)
	deCrypedUD.isLogin = true;
	//设置cookie
	sessionVal = session.setSession({
		userId:userId,
		expire:expire,
		expireCallback:function(sId){
			//todo:内存不会释放掉,这个俗所谓啦，反正也不指望他能释放掉
			deCrypedUD.isLogin = false;
			deCrypedUD.sessionId = null;
			//console.log("why not call?");
			console.log(sId+"成功退出！");
		},
		sessionRef:{
			user:deCrypedUD,
			ipAddress:"",
			userId:userId
		},
		res:res
	});
	deCrypedUD.sessionId = sessionVal.sessionId;
	resData.status = 1;
	resData.msg = "存储成功!";
	return resData;
}

var expire = 36000000;//session过期时长十个小时



module.exports.singupApi = function(req,res){
	var resData = {};
	var userData = req.body["user_data"];
	var deCrypedUD = cryptoRsa.rsaDecrypt(userData);
	resData = processUserData(deCrypedUD,res);
	
	if(resData.status == 1){
		//登录成功
	}
	
	res.contentType('application/json,application/javascript; charset=utf-8');
	res.send(JSON.stringify(resData));
}





