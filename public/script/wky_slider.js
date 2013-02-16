/*
*
* 简单的切换
*
*
*
*/

wky_define("wky.plugins",function(slider){
	//添加依赖
	var dom = wky.dom;
	var core = wky.core;
	var tween = wky.tween;
	
	var Slider = function(option){
		this.container = option.container || null;
		this.innerElements = option.innerElements || "";
		this.dir = option.dir || "h";
		this.duration = option.duration || 600;
		this.easing = option.easing || "linear";
		this.complete = option.complete || function(){};
		this.isAnimating = false;
		
		this.totalCount = 0;
		this.currentShow = 0;
		this.containerSize = {
			width:0,
			height:0
		};
		this.totalSize = {
			width:0,
			height:0
		};
		this.eleParent = null;
		this.init();
	}
	
	Slider.prototype = {
		constructor:Slider,
		init:function(){
			this.eleParent = document.createElement("div");
			dom.setStyle(this.eleParent,{
				width:"0px",
				height:"0px",
				position:"absolute"
			});
			dom.append(this.eleParent,this.innerElements);
			dom.append(this.container,this.eleParent);
			this.setBaseInfo();
		},
		setBaseInfo:function(){
			var innerEles = Array.prototype.slice.call(this.eleParent.children);//todo:bug 
			var that = this;
			core.each(innerEles,function(i,v){
				that.totalSize.height += dom.height(v);
				that.totalSize.width += dom.width(v);
			});
			//设置外框宽高
			that.containerSize.width = dom.width(that.container);
			that.containerSize.height = dom.height(that.container);
			//console.log("width:"+that.totalSize.width+"\theight:"+that.totalSize.height);
			if(that.dir == "h"){
				dom.setStyle(that.eleParent,{
					width:that.totalSize.width + "px",
					height:"100%"
				});
				that.containerSize.width = that.containerSize.width || 1;
				that.totalCount = Math.ceil(that.totalSize.width/that.containerSize.width);
			}else{
				dom.setStyle(that.eleParent,{
					width:"100%",
					height:that.totalSize.height + "px"
				});
				that.containerSize.height = that.containerSize.height || 1;
				that.totalCount = Math.ceil(that.totalSize.height/that.containerSize.height);
			}
			return that;
		},
		skipTo:function(step){
			if(step < 0 || step > this.totalCount - 1){
				return;
			}
			this.animate(step,"p");
		},
		animate:function(step,cmd){
			if(this.isAnimating){
				return;
			}
			var that = this;
			var preVal = 0;
			var curVal = 0;
			var dirNum = 1;
			var animateArg = {
				duration: that.duration,
				easing: that.easing,
				complete:function(){
					that.isAnimating = false;
					that.complete.apply(that,arguments);
				}
			};
			
			if(cmd == "p"){
				dirNum = -1;
			}else{
				dirNum = -1;
				if(step > this.totalCount - 1){
					dirNum = 1;
				}
			}
			
			if(that.dir == "h"){
				preVal = this.currentShow * that.containerSize.width;
				curVal = step * that.containerSize.width;
				animateArg.start = -preVal;
				animateArg.end = dirNum*curVal;
				animateArg.step = function(delta, clVal){
					dom.setStyle(that.eleParent, "left", clVal+"px");
				}
			}else{
				preVal = this.currentShow * that.containerSize.height;
				curVal = step * that.containerSize.height;
				animateArg.start = -preVal;
				animateArg.end = dirNum*curVal;
				animateArg.step = function(delta, clVal){
					dom.setStyle(that.eleParent, "top", clVal+"px");
				}
			}
			that.isAnimating = true;
			tween.animate(animateArg);
			that.currentShow = step;
		},
		next:function(){
			var step = this.currentShow;
			if(this.currentShow >= this.totalCount - 1){
				step = -1;
			}
			this.animate(step+1,"n");
		},
		prev:function(){
			var step = this.currentShow;
			if(this.currentShow <= 0){
				step = this.totalCount;
			}
			this.animate(step-1,"p");
		}
	};
	
	
	var slider = function(options){
		return new Slider(options);
	}
	
	return {
		varName:"slider",
		varVal:slider
	}
});


