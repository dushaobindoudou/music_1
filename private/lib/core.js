/*
*
* 编写通用方法
*
*
*
*
*/
var fs = require("fs");

//是否 是undefined类型
var isUndefined = function(obj){
	return Object.prototype.toString.call(obj) === '[object Undefined]';
}
//是否 是Array类型
var isArray = function(obj){
	return Object.prototype.toString.call(obj) === '[object Array]';
}
//是否 是String 类型
var isString = function(obj){
	return Object.prototype.toString.call(obj) === '[object String]';
}
//是否是一个函数
var isFunction = function(obj){
	return Object.prototype.toString.call(obj) === '[object Function]'; 
}

//生成一个随机字符串 默认6位
var getRandomStr = function(len,baseStr){
	len = len || 6;//生成的随机字符串长度
	var baseStr = baseStr || 'abcedefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ0123456789_';
	var rdmNum = -1;
	var baseLen = baseStr.length;
	var rdmAry = [];
	while(len){
		rdmNum = Math.ceil(Math.random()*baseLen);
		rdmAry.push(baseStr[rdmNum]);
		len--;
	}
	return rdmAry.join("");
}

//遍历对象
var each = function(obj,callback){
	if(!obj || !callback){
		return;
	}
	for(var k in obj){
		if(obj.hasOwnProperty(k)){
			callback(k,obj[k],obj);
		}
	}
}
//合并两个对象
var extendUserData = function(to,from){
	if(!to || !from){
		return;
	}
	if(!isArray(to["ids"])){
		to["ids"] = [];
	}
	each(from,function(k,v){
		if(k == "ids"){
			if(isArray(v)){
				to["ids"] = to["ids"].concat(v);
			}
		}else{
			to[k] = v;
		}
	});
	return to;
}

//检测数据完整性
var checkDataIntegrality = function(needKeys,data){
	if(!data){
		return;
	}
	if(isArray(needKeys)){
		for(var i=0,len = needKeys.length; i<len;i++){
			if(!(needKeys[i] in data) || !data[needKeys[i]]){
				return false;
			}
		}
		return true;
	}
	if(isString(needKeys)){
		if(needKeys in data){
			return true;
		}
		return false;
	}
}

//检测email 是否合法
var checkEmail = function(email){
	if(!email){
		return false;
	}
	var reg = /^(\w+\.)*(\w+)@(\w+\.)+(\w+)$/i;
	if(reg.test(email)){
		return true;
	};
	return false;
}

//检测名字是否合法
var checkName = function(name){
	if(!name){
		return false;
	}
	var reg = /^(\d|\w|-|_|[\u4E00-\u9FA5]){6,20}$/i;
	if(reg.test(name)){
		return true;
	};
	return false;
}
//检测密码是否符合要求
var checkPassword = function(pwd){
	var reg = /^(\d|\w|-|_){6,22}$/;
	if(reg.test(pwd)){
		return true;
	};
	return false;
}

//检测密码安全性
var checkPasswordClass = function(password){
	//纯数字，纯字符（大写），纯字符（小写），下划线，短横线（只包含一项是安全等级1（低），包含两项是2（中等），其他是安全等级高）
	var res = {};
	var hardVal = 0;
	res.secureClass = hardVal;
	if(!checkPassword(password)){
		return res;
	}
	//console.log(res);
	var regs = {
		num:/\d/,
		big:/[A-Z]/,
		small:/[a-z]/,
		bl:/_/,
		ml:/-/
	};
	each(regs,function(k,v){
		if(v.test(password)){
			hardVal++;
			if(k in res){
				res[k] = parseInt(res[k]) + 1;
			}else{
				res[k] = 0;
			}
		}
	});
	res.secureClass = hardVal;
	return res;
}

//检查路径是否存在
var checkFile = function(path){
	if(!path){
		return false;
	}
	if(!fs.existsSync){
		console.log("fs 没有引入进来");
		return;
	}
	if(fs.existsSync(path)){
		return true;
	}else{
		return false;
	}
}
//检测手机是否符合要求
var checkPhone = function(phone){
	if(!phone){
		return false;
	}
	var reg = /^1(\d){10,10}$/i;
	if(reg.test(phone)){
		return true;
	};
	return false;
}
//检测用户是否登录
var keyInArray = function(ary,callback){
	if(!isArray(ary) || !isFunction(callback)){
		return;
	}
	var len = ary.length;
	while(len--){
		if(callback(len,ary[len]) === false){
			return;
		}
	};
}


module.exports = {
	isUndefined:isUndefined,
	isArray:isArray,
	isString:isString,
	getRandomStr:getRandomStr,
	each:each,
	checkEmail:checkEmail,
	checkName:checkName,
	checkPasswordClass:checkPasswordClass,
	checkDataIntegrality:checkDataIntegrality,
	checkFile:checkFile,
	extendUserData:extendUserData,
	checkPhone:checkPhone,
	isFunction:isFunction,
	keyInArray:keyInArray
}