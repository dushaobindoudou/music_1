/*
* 
* 判断用户名是否注册
*
*/
var userModel = require('../model/user_md');
var core = require('../private/lib/core');


var isUserNameSingup = function(userName){
	//todo: 过滤某些用户名 可以做保留
	return userModel.isUserNameSingup(userName);
}

//get请求判断用户名 是否注册
module.exports.isUserNameSingup = function(req,res){
	var userName = req.param("user_name");
	var jsonRes = {
		status:0,
		msg:""
	};
	var isLegal = core.checkName(userName);
	if(isLegal){
		if(isUserNameSingup(userName)){
			jsonRes.msg = "用户名已经被用过了!";
		}else{
			jsonRes.status = 1;
			jsonRes.msg = "用户名 可以使用!";
		}
	}else{
		jsonRes.msg = "用户名格式不正确!";
	}
	res.contentType('applaction/json,text/javascript; charset=utf-8');
	res.send(JSON.stringify(jsonRes));
}