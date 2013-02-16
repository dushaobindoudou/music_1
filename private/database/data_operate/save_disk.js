/*
*
* 把对象保存到磁盘
* todo:要可以保存函数
* toto:是否开启一个子进程，加密的时候开启一个子进程吧
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
//保存到磁盘
var saveToDisk = function(options){
	options = options || {};
	options.extName = options.extName || ".db";
	if(!options.name){
		console.log("保存的对象名为空!");
		return;
	}
	options.basePath = options.basePath || "";
	var dataPath = '';
	if(!options.name || !options.actData){
		cnosole.log("数据名没有");
		return;
	}
	dataPath = path.join(options.basePath,options.name+options.extName);//组合路径
	if(!checkFile(options.basePath)){
		console.log("数据路径不存在！");
		return;
	}
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

module.exports.saveToDisk = saveToDisk;

//测试
/*var userInfo = {"ids":["__id__1","__id__2","__id__3","__id__4","__id__5"],"__id__1":{"name":"dustin","age":"24","address":"北京海淀"},"__id__2":{"name":"dustin","age":"24","address":"北京海淀"},"__id__3":{"name":"dustin","age":"24","address":"北京海淀"},"__id__4":{"name":"dustin","age":"24","address":"北京海淀"},"__id__5":{"name":"dustin","age":"24","address":"北京海淀"}};

saveToDisk({
	basePath:"f:/github/music_app/private/database/data/",
	name:"userinfo",
	actData:userInfo
})

console.log(userInfo);
*/
