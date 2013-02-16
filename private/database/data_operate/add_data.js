/*
 *
 * 添加新的数据，一列，或者多列
 * 
 * 
 * 
 *
 *
*/
var fs = require("fs");
var path = require("path");
var core = require("../../lib/core");

//检查文件是否存在，不存在就创建一个文件
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
//生成一个随机字符串 默认6位
var getRandomStr = function(len,baseStr){
	len = len || 6;//生成的随机字符串长度
	var baseStr = baseStr || 'abcedefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ0123456789_';
	var rdmNum = -1;
	var baseLen = baseStr.length;
	var rdmAry = [];
	while(len){
		rdmNum = Math.round(Math.random()*baseLen);
		rdmAry.push(baseStr[rdmNum]);
		len--;
	}
	return rdmAry.join("");
}

//生成一个构造函数 id
var genIdFn = function(){
	var id = 0;
	var prefix = getRandomStr() + "__id__";
	return function(){
		id++;
		return prefix + id;
	}
}
//生成一个id
var genId = genIdFn();




//是否是数组
var isArray = function(obj){
	return Object.prototype.toString.call(obj) === '[object Array]';
}

var add = function(options){
	options = options || {};
	options.basePath = options.basePath || "";
	options.prefix = options.prefix || "__id__";
	options.actData = options.actData;
	options.isSaveToDisk = options.isSaveToDisk;//是否要保存到磁盘
	options.extName = options.extName || ".db";//扩展名默认是.db
	options.needKeys = options.needKeys || [];
	//options.name 要插入数据的文件名（数据文件名要与真是的数据的引用名相同）
	//options.basePath 数据文件的基础路径
	var dataPath = '',id = null,insertedIds = [],resId = null,saveDiskRes = 1;
	if(!options.name || !options.item || !options.actData){
		cnosole.log("数据名没有");
		return -1;
	}
	dataPath = path.join(options.basePath,options.name+options.extName);//组合路径
	if(!checkFile(options.basePath)){
		console.log("数据路径不存在！");
		return -2;
	}
	//设置actData
	if(!options.actData.ids){
		options.actData.ids = [];
	}
	
	if(isArray(options.item)){
		options.item.forEach(function(v,i){
			if(!v){
				return;
			}
			id = genId();
			if(options.actData[id]){//防止数据被覆盖，但是还是有可能的
				genId = genIdFn();
				id = genId();
			}
			if(!core.checkDataIntegrality(options.needKeys,v)){
				console.log('数据缺少必要字段');
				return;
			}
			options.actData[id] = v;
			insertedIds.push(id);
			options.actData.ids.push(id);
		});
		resId = insertedIds;
	}else{
		id = genId();
		if(options.actData[id]){
			genId = genIdFn();
			id = genId();
		}
		if(!core.checkDataIntegrality(options.needKeys,options.item)){
			console.log('数据缺少必要字段');
			return;
		}
		options.actData[id] = options.item;
		options.actData.ids.push(id);
		resId = id;
	}
	
	if(options.isSaveToDisk){//保存到磁盘 -3 表示保存到磁盘失败,要手动更新到磁盘
		//操作太复杂了，直接覆盖
		fs.writeFile(dataPath, JSON.stringify(options.actData), function (err) {
			if (err) {
				saveDiskRes = -3;
				console.log("file error");
				return;
			}
			console.log('保存成功！');
		});
		if(saveDiskRes < 0){
			return saveDiskRes;
		};
	}
	return resId;
}

module.exports.add = add;

//测试
/*var userInfo = {};

add({
	basePath:"f:/github/music_app/private/database/data/",
	name:"userinfo",
	actData:userInfo,
	item:[{name:"dustin",age:"24",address:"北京海淀"},{name:"dustin",age:"24",address:"北京海淀"},{name:"dustin",age:"24",address:"北京海淀"},{name:"dustin",age:"24",address:"北京海淀"},{name:"dustin",age:"24",address:"北京海淀"}]
})

console.log(userInfo);
*/

