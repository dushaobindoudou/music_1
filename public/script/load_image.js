/*
 *
 * 加载图片
 * param {option.src:"图片地址",option.success:"成功后回调",option.error:"失败后回调"}
 *
 *
 */
wky_define("wky.plugins", function(plugin){
	
	var evnt = wky.event;
	if(!evnt){
		throw new Error("event 加载失败!");
		return;
	}
	
    var ImageLoad = function(option){
        this.imgSrc = option.imgSrc;
        this.success = option.success ||
        function(){
        };
        this.error = option.error ||
        function(){
        };
        this.createSuccess = option.createSuccess ||
        function(){
        };
        this.init();
    }
    ImageLoad.prototype = {
        constructor: ImageLoad,
        init: function(){
            var img = this.createImg(this.imgSrc);
        },
        createImg: function(src){
            var that = this;
            if (!src) {
                return;
            }
            var img = document.createElement("img");
            evnt.add(img, "load", function(evt){
                var args = [].slice.call(arguments);
                args.unshift(img);
                that.success.apply(that, args)
            });
            evnt.add(img, "error", function(evt){
                var args = [].slice.call(arguments);
                args.unshift(img);
                that.error.apply(that, arguments)
            });
            that.createSuccess.call(this, img);
            dom.setAttr(img, "src", src);
            return img;
        }
    }
    return {
        varName: "ImageLoad",
        varVal: ImageLoad
    }
    
});
