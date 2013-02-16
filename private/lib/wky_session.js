/*
*
* 这个是session
*
*
* sessionId = MD5(userId + now + random);
* 
* 
*
*/

var crypto = require("crypto");
var core = require("./core");

//获取session id
var getSessionId = function(userId){
	if(!userId){
		return;
	}
	var now = new Date();
	var md5 = crypto.createHash("md5");
	var res = null;
	var random = Math.random();
	userId += now.getTime();
	userId += random;
	res =  md5.update(userId.toString());
	return res.digest("hex");
}
//获取expire 值
var getExprie = function(expire){
	if(!expire){
		return;
	}
	expire = parseInt(expire);
	if(isNaN(expire)){
		return;
	}
	var now = new Date();
	var time = now.getTime();
	expire = time + expire;
	return expire;
}


//session 数据 
var sessionData = {};
//timer
var timer = null;
var sessionKey = "wky_session";

//创建session
var createSession = function(options){
	if(core.isUndefined(options)){
		return;
	};
	var userId = options.userId;
	var sessionRef = options.sessionRef;
	var expire = options.expire;
	var maxAge = expire;
	var expireCallback =  options.expireCallback || function(){};
 	expire = getExprie(expire);
	if(!expire){
		return;
	}
	if(!userId || !sessionRef || expire < 1){
		console.log("session aguments lost!");
		return;
	}
	var sessionId = getSessionId(userId);
	if(!sessionId){
		return;
	}
	if(sessionId in sessionData){
		return;
	}
	return sessionData[sessionId] = {
		sessionId:sessionId,
		maxAge:maxAge,
		expire:expire,
		expireCallback:expireCallback,
		data:sessionRef
	};
}

//创建cookie值
var setSession = function(options){
	if(!timer){
		throw new Error("请先开启session!");
		return false;
	}
	if(core.isUndefined(options)){
		return;
	};
	var res = options.res;
	if(!res){
		return;
	}
	var session = createSession(options);
	res.cookie(sessionKey,session.sessionId,{
		httpOnly:true,
		path:"/",
		maxAge:session.maxAge
	});
	return session;
}


//设置过期
var setExpireSession = function(sessionId){
	if(!sessionId){
		return;
	}
	console.log(sessionId);
	if(sessionId in sessionData){
		if(core.isFunction(sessionData[sessionId].expireCallback)){
			sessionData[sessionId].expireCallback.call(this,sessionId);
			sessionData[sessionId].expireCallback = null;
		}
		delete sessionData[sessionId];
		return true;
	}
	return false;
}

//过期检查
var checkExpire = function(){
	core.each(sessionData,function(k,v){
		var now = new Date();
		if(v.expire <= now.getTime()){
			if(setExpireSession(k)){
				//todo:写日志
				console.log("session 清除成功！");
			}else{
				//todo:写日志
				console.log("session 清除失败！");
			}
		}
	});
}

//获取sessionId 对应的值
var getSessionVal = function(sessionId){
	if(!sessionId){
		return;
	}
	if(sessionId in sessionData){
		return sessionData[sessionId];
	}
}

//开启session
var startSession = function(){
	if(timer){
		clearInterval(timer);
		timer = null;
	}
	timer = setInterval(checkExpire,5000);
	console.log("session 已开启！");
}

//关闭session
var stopSession = function(){
	if(!timer){
		return;
	}
	clearInterval(timer);
	sessionData = null;
	console.log("session 关闭成功！");
}
//移除session
var removeSession = function(sessionId){
	if(!sessionId){
		return;
	}
	var sion = 	getSessionVal(sessionId);
	var now = new Date();
	if(sion){
		sion.expire = now.getTime() - 100;
		return true;
	}
}

module.exports = {
	startSession:startSession,
	stopSession:stopSession,
	getSessionVal:getSessionVal,
	setSession:setSession,
	removeSession:removeSession
}