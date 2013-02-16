/*
 *
 * 图片切换,图片没有加载完先给以个替代图，等加载完再 显示新图
 *
 * 切换类型 1 是flip
 *
 */
wky_define("wky.plugins", function(plugin){

    var ImageLoad = plugin.ImageLoad;
    var core = wky.core;
	var dom = wky.dom;
    
    if (!ImageLoad) {
        throw new Error("ImageLoad 加载失败！");
        return;
    }
    if (!core) {
        throw new Error("core 加载失败！");
        return;
    }
	if (!dom) {
        throw new Error("dom 加载失败！");
        return;
    }
    
    var loadImage = function(options){
        return new ImageLoad(options);
    }
    
    
    var ImageSwap = function(options){
        options = options || {};
        this.baseContent = options.baseContent || "";
        this.realImgSrc = options.realImgSrc || "";
        
        //真是图片容器
        this.realImgContainer = null;
        this.flipContainer = null;
        this.isAnimating = false;
        this.duration = options.duration || 500;
        this.easing = options.easing || "linear";
        this.flipAxis = options.flipAxis || "Y";
		this.stepCall = options.stepCall || function(){};
		
        
        this.prefix = "";
        this.dir = "r";
        this.swapType = "flip";
        this.container = options.container || "";
        if (!this.container) {
            return;
        }
        this.init();
    }
    
    ImageSwap.prototype = {
        init: function(){
            this.checkSwapType();
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
        updatePannel: function(){
            switch (this.swapType) {
                case "flip":
                    this.setFlipEle()
                    break;
                case "fade":
                    this.setFadeEle();
                    break;
                default:
                    break;
            }
        },
        setNewImage: function(src, witch, success, error){
            if (!src) {
                return;
            }
            success = core.isFunction(success) ? success : function(){
            };
            error = core.isFunction(error) ? error : function(){
            };
            var relCon = this.realImgContainer;
            var that = this;
            if (!relCon) {
                return;
            }
            //重置样式
            that.reset();
            loadImage({
                imgSrc: src,
                createSuccess: function(img){
                    if (!img) {
                        return;
                    }
                    dom.setStyle(img, {
                        display: "none"
                    });
                    dom.html(relCon, "");
                    dom.append(relCon, img);
                },
                success: function(img){
                    dom.addClass(img, "corver-img");
                    dom.setStyle(img, {
                        display: "block"
                    });
					if(success.apply(that,arguments) === false){
						return;
					}
                    that.swap(witch);
                },
                error: function(){
                    //显示默认图片,移除该图片,显示默认图片
                	error.apply(that,arguments);
                }
            });
            return;
        },
        setFlipEle: function(){
            var label = '<div class="flip-container"><div class="flip-card"><div class="front face">' + this.baseContent + '</div>' +
            '<div class="back face"></div></div></div>';
            dom.html(this.container, label);
            
            this.realImgContainer = dom.search("div.back", this.container)[0];
            this.flipContainer = dom.search("div.flip-card", this.container)[0];
        },
        setFadeEle: function(){
            var label = '<div class="fade-container"><div class="front-face">' + this.baseContent + '</div>' +
            '<div class="back-face"></div></div>';
            dom.html(this.container, label);
            
            this.realImgContainer = dom.search("div.back-face", this.container)[0];
            this.flipContainer = dom.search("div.front-face", this.container)[0];
        },
        setDir: function(dir){
            if (!dir) {
                return;
            }
            this.dir = dir;
        },
        swap: function(dir){
            if (!this.flipContainer) {
                return;
            }
            if (dir) {
                this.setDir(dir);
            }
            this.animate();
        },
        reset: function(){
            var that = this;
            switch (this.swapType) {
                case "flip":
                    break;
                case "fade":
                    dom.setStyle(that.flipContainer, {
                        display: "block"
                    })
                    break;
                default:
                    break;
            }
        },
        animate: function(){
            var that = this;
            that.isAnimating = true;
            var animParam = {
                duration: that.duration,
                easing: that.easing,
                step: function(delat, delatVal){
                    var css = {};
					if(that.stepCall.call(that,delat,delatVal) === false){
						return;
					};
                    css[that.prefix + "Transform"] = "rotate" + that.flipAxis + "(" + delatVal + "deg)";
                    dom.setStyle(that.flipContainer, css);
                },
                complete: function(){
                    that.isAnimating = false;
                }
            };
            var fadeName = "";
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
        varName: "ImageSwap",
        varVal: ImageSwap
    }
});
