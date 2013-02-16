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

//是否是数组
var isArray = function(obj){
	return Object.prototype.toString.call(obj) === '[object Array]';
}
//是否未定义
var isUndefined = function(obj){
	return Object.prototype.toString.call(obj) === '[object Undefined]';
}

//从数组中移除
var rmFromAry = function(ary,val){
	if(!isArray(ary) || isUndefined(val)){
		return;
	}
	var idx = ary.indexOf(val);
	while(idx !== -1){
		ary.splice(idx,1);
		idx = ary.indexOf(val);
	}
	return ary;
}

var remove = function(options){
	options = options || {};
	options.basePath = options.basePath || "";
	options.prefix = options.prefix || "__id__";
	options.id = options.actData;
	options.isSaveToDisk = options.isSaveToDisk || false;
	options.extName = options.extName || ".db";//扩展名 默认是db
	//options.name 要插入数据的文件名（数据文件名要与真是的数据的引用名相同）
	//options.basePath 数据文件的基础路径
	var dataPath = '';
	if(!options.name || !options.item || !options.actData){
		cnosole.log("数据名没有");
		return;
	}
	dataPath = path.join(options.basePath,options.name + options.extName);//组合路径
	if(!checkFile(options.basePath)){
		console.log("数据路径不存在！");
		return;
	}
	//设置actData
	if(!options.actData.ids){
		options.actData.ids = [];
	}
	var id = null;
	if(isArray(options.item)){
		options.item.forEach(function(v,i){
			if(!v){
				return;
			}
			if(v in options.actData){
				delete options.actData[v];
				rmFromAry(options.actData.ids,v);
			}
		});
	}else{
		console.log(options.item);
		if(options.item in options.actData){
			delete options.actData[options.item];
			rmFromAry(options.actData.ids,options.item);
		}
	}
	
	if(options.isSaveToDisk){//保存到磁盘
		//操作太复杂了，直接覆盖
		fs.writeFile(dataPath, JSON.stringify(options.actData), function (err) {
			if (err) {
				console.log("file error");
				return;
			}
			console.log("数据保存到："+dataPath);
			console.log('保存成功！');
		});
	}
}

module.exports.remove = remove;

//测试
/*var userInfo = {"ids":["__id__1","__id__2","__id__3","__id__4","__id__5"],"__id__1":{"name":"dustin","age":"24","address":"北京海淀"},"__id__2":{"name":"dustin","age":"24","address":"北京海淀"},"__id__3":{"name":"dustin","age":"24","address":"北京海淀"},"__id__4":{"name":"dustin","age":"24","address":"北京海淀"},"__id__5":{"name":"dustin","age":"24","address":"北京海淀"}};

remove({
	basePath:"f:/github/music_app/private/database/data/",
	name:"userinfo",
	actData:userInfo,
	isSaveToDisk:true,
	item:["__id__1","__id__3","__id__2"]
})

console.log(userInfo);
*/

