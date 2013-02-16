/*
*
* 弹出框
*
*
*
*/

wky_define("wky.plugins",function(slider){
	//添加依赖
	var dom = wky.dom;
	var core = wky.core;
	var tween = wky.tween;
	
	var baseZIndex = 9000;
	
	var Popup = function(options){
		this.width = options.width || 0;
		this.height = options.height || 0;
		this.ele = null;
		this.eleContainer = null;
		this.maskEle = null;
		this.content = options.content || "";
		this.className = options.className || "";
		this.isMask = options.isMask;
		this.maskBackground = options.maskBackground || "#FFFFFF";
		this.maskOpacity = options.maskOpacity || 0.7;
		//回调函数
		this.initSuccess = options.initSuccess || function(){};
		this.showCallback = options.showCallback || function(){};
		this.hideCallback = options.hideCallback || function(){};
		
		this.left = options.left;
		this.top = options.top;
		this.isShowed = false;
		
		this.init();
	}
	
	
	Popup.prototype = {
		constructor:Popup,
		init:function(){
			this.initBaseEle();
			this.initSuccess.call(this,this.ele);
		},
		initBaseEle:function(){
			var bodyEle = dom.search("body")[0];
			var ss = dom.screenSize();
			this.maskEle = document.createElement("div");
			this.eleContainer = document.createElement("div");
			this.ele = document.createElement("div");
			
			if(this.isMask){
				dom.setStyle(this.maskEle,{
					background:this.maskBackground,
					opacity:this.maskOpacity,
					position:"absolute",
					top:0,
					left:0,
					width:ss.width+"px",
					height:ss.height+"px"
				});
				//设置遮罩
				dom.setStyle(this.eleContainer,{
					position:"fixed",
					top:0,
					left:0,
					width:ss.width+"px",
					height:ss.height+"px",
					display:"none"
				});
			}else{
				dom.setStyle(this.maskEle,{
					position:"absolute",
					top:0,
					left:0,
					width:0,
					height:0
				});
				//设置遮罩
				dom.setStyle(this.eleContainer,{
					position:"fixed",
					top:0,
					left:0,
					width:0,
					height:0,
					display:"none"
				});
			}
			//计算位置
			this.defaultPos();	
			//设置实际内容
			dom.setStyle(this.ele,{
				left:this.left,
				top:this.top,
				width:this.width +"px",
				height:this.height + "px",
				position:"absolute"
			});
					
			if(this.className){
				dom.addClass(this.ele,this.className);
			}
			
			dom.html(this.ele,this.content);//附加内容
			dom.append(this.eleContainer,this.maskEle);//附加遮罩
			dom.append(this.eleContainer,this.ele);//复制生成元素
			
			dom.append(bodyEle,this.eleContainer);
		},
		
		defaultPos:function(){
			if(core.isUndefined(this.left)){
				this.left = dom.screenSize().width/2 - parseInt(this.width)/2 + "px";
			}
			if(core.isUndefined(this.top)){
				this.top = dom.screenSize().height/2 - parseInt(this.height)/2 + "px";
			}
		},
		show:function(){
			baseZIndex++;
			dom.setStyle(this.eleContainer,{
				zIndex:baseZIndex,
				display:"block"
			});
			this.isShowed = true;
			this.showCallback.call(this,this.ele);
		},
		hide:function(){
			dom.setStyle(this.eleContainer,{
				zIndex:baseZIndex,
				display:"none"
			});
			this.isShowed = false;
			this.hideCallback.call(this,this.ele);
		},
		animate:function(){
			//todo:add animate
		},
		destory:function(){
			//todo:彻底销毁
		}
		
	}
	
	var popup = function(options){
		return new Popup(options);
	}
	
	return {
		varName:"popup",
		varVal:popup
	}
});


