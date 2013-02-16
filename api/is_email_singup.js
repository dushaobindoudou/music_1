/*
* 
* 判断email是否注册
*
*/
var userModel = require('../model/user_md');
var core = require('../private/lib/core');


var isEmailSignup = function(email){
	return userModel.isEmailSingup(email);
}

//get请求判断email 是否注册
module.exports.isEmailSingup = function(req,res){
	var email = req.param("email");
	var jsonRes = {
		status:0,
		msg:""
	};
	var isLegal = core.checkEmail(email);
	if(isLegal){
		if(isEmailSignup(email)){
			jsonRes.msg = "email 已经注册!";
		}else{
			jsonRes.status = 1;
			jsonRes.msg = "email 没有注册!";
		}
	}else{
		jsonRes.msg = "email 格式正确!";
	}
	res.contentType('application/json,application/javascript; charset=utf-8');
	res.send(JSON.stringify(jsonRes));
}
