/*
*
* 提供数据的 增。删、改、查
*
*/
var path = require("path");
var add = require("../private/database/data_operate/add_data.js").add;
var remove = require("../private/database/data_operate/remove_data.js").remove;
var readDisk = require("../private/database/data_operate/read_disk.js").read_disk;
var saveDisk = require("../private/database/data_operate/save_disk.js").saveToDisk;
var core = require('../private/lib/core');

//用户数据
var dataLoadedList = {
	userLoaded:false,
	emailLoaded:false,
	nameLoaded:false
};

//todo:合并到配置文件中
var extName = ".db";
var dtFileName = "md_user";
var dtFilePath = '/private/database/data';
/*      凡是用到的对象都要保存到磁盘     */
//用户名对象
var md_nameList = {};
//邮箱对象
var md_email = {};
//主用户表
var md_user = {};
var userNeedKeys = ["userName","password","email"];
//设置路径
dtFilePath = path.join(process.env.PWD,dtFilePath);

//用户数据是否可用
var isUserDataUseable = function(){
	var pp = true;
	core.each(dataLoadedList,function(k,v){
		if(v){
			pp = pp && v;
		}
	});
	return pp;
}

//增加一个新用户
var addUser = function(user,saveToDisk){
	console.log("开始保存数据！！");
	var isSave = false;
	if(core.isUndefined(saveToDisk)){
		if(isUserDataUseable()){
			isSave = true;
		}
	}else{
		isSave = true;
	}
	if(core.isUndefined(user)){
		console.log('缺少 user 参数');
		return false;
	}
	var id = "";
	try{
		id = add({
			extName:extName,
			needKeys:userNeedKeys,
			name:dtFileName,
			actData:md_user,
			basePath:dtFilePath,
			item:user,
			isSaveToDisk:isSave
		});
		if(id == -2 || id == -1){//没有保存成功
			return false;
		}
		md_nameList[user.userName] = id;
		md_email[user.email] = id;
		user = null;
		return true;
	}catch(e){
		user = null;
		return false;
	}
}

//删除一个用户
var removeUser = function(userId){
	if(core.isUndefined(userId)){
		console.log('缺少 userId 参数');
		return false;
	}
	var userInfo = null;
	try{
		userInfo = getUserInfo(userId);
		if(!userInfo){
			console.log('数据库中不包含,这个字段')
			return false;
		}
		remove({
			extName:extName,
			name:dtFileName,
			actData:md_user,
			basePath:dtFilePath,
			item:userId
		});
		delete md_email[userInfo.email];
		delete md_nameList[userInfo.userName];
		
		return true;
	}catch(e){
		return false;
	}
}
//禁用一个用户
var disableUser = function(userInfo){
	if(!userInfo){
		return;
	}
	var userInfo = null,userId = null;
	if(userInfo.userName){
		userId = isEmailSingup(userInfo.userName);
		if(userId){
			userInfo = getUserInfo(userId);
			if(userInfo){
				userInfo.isDisabled = "1";
				return true;
			}
		}
		return false;
	}
	if(userInfo.email){
		userId = isUserNameSingup(userInfo.userName);
		if(userId){
			userInfo = getUserInfo(userId);
			if(userInfo){
				userInfo.isDisabled = "1";
				return true;
			}
		}
		return false;
	}
	if(userInfo.userId){
		userInfo = getUserInfo(userInfo.userId);
		if(userInfo){
			userInfo.isDisabled = "1";
			return true;
		}
	}
	return false;
}

//获取用户信息
var getUserInfo = function(userId){
	if(core.isUndefined(userId)){
		console.log('缺少 userId 参数 ');
		return false;
	}
	if(userId in md_user){
		return md_user[userId];
	}
	return false;
}
//email是否注册
var isEmailSingup = function(email){
	if(core.isUndefined(email)){
		return false;
	}
	console.log(md_email);
	if(email in md_email){
		return md_email[email];
	}
	return false;
}

//用户名是否注册
var isUserNameSingup = function(userName){
	if(core.isUndefined(userName)){
		return false;
	}
	if(userName in md_nameList){
		return md_nameList[userName];
	}
	return false;
}

//保存用户数据
var saveAllData = function(){
	//保存名字列表
	saveDisk({
		actData:md_nameList,
		extName:".db",
		name:"md_nameList",
		basePath:dtFilePath
	});
	//保存email列表
	saveDisk({
		actData:md_email,
		extName:".db",
		name:"md_email",
		basePath:dtFilePath
	});
	//保存用户数据
	saveDisk({
		actData:md_user,
		extName:".db",
		name:"md_user",
		basePath:dtFilePath
	});
	return true;
}

//加载已经注册的用户
var loadSavedUser = function(success){
	//加载用户信息
	var dataPath = path.join(dtFilePath,dtFileName+extName);
	success = success || function(){};
	readDisk(dataPath,function(data){
		success.apply(this,arguments)
	});	
}
//加载名字列表
var loadSavedName= function(success){
	//加载用户信息
	var name = "md_nameList";
	var dataPath = path.join(dtFilePath,name+extName);
	success = success || function(){};
	readDisk(dataPath,function(data){
		success.apply(this,arguments)
	});	
}

//加载email list
var loadSavedEmail = function(success){
	//加载用户信息
	var name = "md_email";
	var dataPath = path.join(dtFilePath,name+extName);
	success = success || function(){};
	readDisk(dataPath,function(data){
		success.apply(this,arguments)
	});
}
//addUser({userName:"dustin",password:"pasdfasdf",email:"dus@sdf.cc"});

//准备数据
loadSavedUser(function(data){
	md_user = core.extendUserData(md_user,data);
	dataLoadedList.userLoaded = true;
	console.log('用户数据已经准备好了！');
});

loadSavedEmail(function(data){
	md_email = core.extendUserData(md_email,data);
	dataLoadedList.emailLoaded = true;
	console.log('email 准备就绪');
});

loadSavedName(function(data){
	md_nameList = core.extendUserData(md_nameList,data);
	dataLoadedList.nameLoaded = true;
	console.log('name 列表准备就绪!');
});


module.exports = {
	add:addUser,
	remove:removeUser,
	get:getUserInfo,
	isEmailSingup:isEmailSingup,
	isUserNameSingup:isUserNameSingup,
	isUserDataUseable:isUserDataUseable,
	saveAllData:saveAllData
}

//测试


//console.log(md_user);

//var userId = md_user.ids[0];

//removeUser(userId);

//console.log(md_user);



