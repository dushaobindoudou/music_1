/*
* 
* 测试接口 oookie 没问题
*
*/
var crypto = require("crypto");
var session = require("../private/lib/wky_session");

//get请求判断用户名 是否注册
module.exports.test = function(req,res){
	var setCookie = req.param("set");
	
	var md5 = crypto.createHash("md5");
	
	md5.update(setCookie);
	
	var val =  md5.digest("hex");
	
	if(setCookie){
		res.cookie("wky_sign","sakdjfalskdjf",{
			httpOnly:false,
			maxAge:60000,
			path:"/api/"
		});
	}
	session.setSession({
		res:res,
		userId:"dustin",
		expire:10000,
		sessionRef:{
			name:"dustin"
		}
	});
	
	res.contentType('applaction/json,text/javascript; charset=utf-8');
	res.send(val);
}