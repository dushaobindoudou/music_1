/*
 *
 * 弹出一个新的对话层
 *
 * todo:这个应该继承 image swap
 *
 *
 *
 *
 */
wky_define("wky.plugins", function(plugins){
    var core = wky.core;
    var dom = wky.dom;
    var evnt = wky.event;
    var tween = wky.tween;
    
    if (!core) {
        throw new Error("core 没有加载成功！");
        return;
    }
    if (!dom) {
        throw new Error("dom 没有加载成功！");
        return;
    }
    if (!evnt) {
        throw new Error("event 没有加载成功！");
        return;
    }
    if (!tween) {
        throw new Error("tween 没有加载成功！");
        return;
    }
    
    var MusicPopup = function(options){
        this.prefix = "";
        this.swapType = "";
        this.frontColor = options.frontColor || "#2565C7";
        this.maskColor = options.maskColor || "none";
        
        this.frontContent = options.frontContent || "hi every one";
        this.backContent = options.backContent || "";
		this.completeCall = options.completeCall || function(){};
        
        this.duration = options.duration || 900;
        this.easing = options.easing || "linear";
        this.flipAxis = options.flipAxis || "Y";
        this.perspective = options.perspective || 1600;
		
        
        this.stepCall = options.stepCall ||
        function(){
        };
        
        this.width = options.width || 0;
        this.height = options.height || 0;
        this.dir = "p";//旋转方向
        this.container = null;//最外层容器
        this.verticalCenterContainer = null;//用于竖直居中的容器
        this.hContainer = null;//装内容的实际容器
        this.contentContainer = null;
        
        this.realImgContainer = null;
        this.flipContainer = null;
        this.isShowed = false;
		
        this.init();
    }
    MusicPopup.prototype = {
        constructor: MusicPopup,
        init: function(){
            //检测当前浏览器支持的翻转类型
            this.checkSwapType();
            //创建容器
            this.createLayer();
            
            //更新容器内容
            this.updatePannel();
        },
        checkSwapType: function(){
            var bodySty = document.body.style;
            var brw = "";
            var isFlip = false;
            core.each(["webkit", "Moz", "ms", "o"], function(i, v){
                if (v + "Perspective" in bodySty) {
                    isFlip = true;
                    brw = v;
                    return false;
                }
            });
            if ("perspective" in bodySty) {
                isFlip = true;
            }
            if (isFlip) {
                this.swapType = "flip";
            }
            else {
                this.swapType = "fade";
            }
            this.prefix = brw;
        },
        createLayer: function(){
            var ws = dom.screenSize();
            this.container = document.createElement("div");
            this.verticalCenterContainer = document.createElement("div");
            this.hContainer = document.createElement("div");
            
            dom.setStyle(this.container, {
                display: "none",
                position: "fixed",
                "zIndex": 1000
            });
            
            //附加到数值居中容器中
            dom.append(this.verticalCenterContainer, this.hContainer);
            
            //附加到容器中
            dom.append(this.container, this.verticalCenterContainer);
            
            //附加到body中
            dom.append(document.body, this.container);
        },
        initLayer: function(){
			var ws = dom.screenSize()
			if (this.swapType == "flip") {
				dom.setStyle(this.container, {
					width: ws.width + "px",
					height: ws.height + "px",
					position: "fixed",
					top: 0,
					left: 0,
					display: "block",
					"zIndex": 1000
				});
				
				dom.setStyle(this.hContainer, {
					width: this.width + "px",
					height: this.height + "px",
					margin: "0 auto"
				});
			}else{
				dom.setStyle(this.container, {
					width: ws.width + "px",
					height: ws.height + "px",
					position: "fixed",
					top: 0,
					left: 0,
					display: "block",
					"zIndex": 1000
				});
				
				dom.setStyle(this.hContainer, {
					width: this.width + "px",
					height: this.height + "px",
					margin: "0 auto"
				});
			}
        },
        setFlipEle: function(){
            var label = '<div class="flip-container"><div class="flip-card"><div class="front face">' + this.frontContent + '</div>' +
            '<div class="back face">'+this.backContent+'</div></div></div>';
            dom.html(this.hContainer, label);
            this.realImgContainer = dom.search("div.back", this.container)[0];
            this.flipContainer = dom.search("div.flip-card", this.container)[0];
            this.contentContainer = dom.search("div.flip-container", this.container)[0];
            var css = {};
            css[this.prefix + "Perspective"] = this.perspective + "px";
            //设置响应的深度值
            dom.setStyle(this.contentContainer, css);
        },
        setFadeEle: function(){
            var label = '<div class="fade-container"><div class="front-face">' + this.frontContent + '</div>' +
            '<div class="back-face">'+this.backContent+'</div></div>';
            dom.html(this.hContainer, label);
            
            this.realImgContainer = dom.search("div.back-face", this.container)[0];
            this.flipContainer = dom.search("div.front-face", this.container)[0];
            this.contentContainer = dom.search("div.fade-container", this.container)[0];
        },
        updatePannel: function(){
            switch (this.swapType) {
                case "flip":
                    this.setFlipEle();
                    break;
                case "fade":
                    this.setFadeEle();
                    break;
                default:
                    break;
            }
        },
        setDir: function(dir){
            if (!dir) {
                return;
            }
            this.dir = dir;
        },
        show: function(dir){
            if (!this.container) {
                return;
            }
            if (dir) {
                this.setDir(dir);
            }
            this.animate();
			this.isShowed = true;
        },
        hide: function(){
            if (!this.container) {
                return;
            }
            
			dom.setStyle(this.container,{
				display:"none"
			});
			this.isShowed = false;
        },
        updateContentContainer: function(delat){
            var css = {};
            css.width = delat * this.width + "px";
            css.height = delat * this.height + "px";
            dom.setStyle(this.contentContainer, css);
        },
        updateVerticalPos: function(delat){
            var ws = dom.screenSize();
            var theHeight = delat * this.height;
            var top = (ws.height - theHeight) / 2;
            console.log("height:" + theHeight + "top:" + top);
            
            dom.setStyle(this.verticalCenterContainer, {
                position: "relative",
                marginTop: top + "px",
                width: "100%",
                height: theHeight + "px"
            });
        },
        updateHorizontalSize: function(delat){
            var theWidth = this.width * delat;
            var theHeight = this.height * delat;
            dom.setStyle(this.hContainer, {
                width: theWidth + "px",
                height: theHeight + "px"
            });
        },
        animate: function(){
            var that = this;
            that.isAnimating = true;
            var animParam = {
                duration: that.duration,
                easing: that.easing,
                step: function(delat, delatVal){
                    var css = {};
                    if (that.stepCall.call(that, delat, delatVal) === false) {
                        return;
                    };
                    css[that.prefix + "Transform"] = "rotate" + that.flipAxis + "(" + delatVal + "deg)";
                    
                    //设置外框尺寸
                    that.updateContentContainer(delat);
                    //设置竖直居中
                    that.updateVerticalPos(delat);
                    //设置横向居中的尺寸
                    that.updateHorizontalSize(delat);
                    
                    dom.setStyle(that.flipContainer, css);
                },
                complete: function(){
                    that.isAnimating = false;
					that.completeCall.call(that);
                }
            };
            var fadeName = "";
            that.initLayer();
            switch (that.dir) {
                case "p":
                    animParam.start = 0;
                    animParam.change = 180;
                    break;
                case "r":
                    animParam.start = 0;
                    animParam.change = -180;
                    break;
                default:
                    return;            }
            
            switch (this.swapType) {
                case "flip":
                    tween.animate(animParam);
                    break;
                case "fade":
                    dom["fadeIn"]({
                        ele: that.realImgContainer,
                        complete: function(){
                            dom.setStyle(that.flipContainer, {
                                display: "none"
                            });
                        }
                    })
                    break;
                default:
                    break;
            }
        }
        
        
    }
    
    
    
    return {
        varName: "MusicPopup",
        varVal: MusicPopup
    }
})
