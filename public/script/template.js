/*
 *
 *
 * js 模板
 * {{= }}输出内容
 *
 * {{ for }} code
 *
 *
 * tmp = '<h1><%= con %></h1>';
 *
 */
wky_define("wky.plugins", function(){
    var core = wky.core;
    var dom = wky.dom;
    var common = wky.common;
    
    
    var Template = function(){
        this.code = 'var __tmp__ = []; __tmp__.push(';
        
        this.open = '<%';
        this.close = '%>';
        this.renderObj = null;
        this.tmp = '';
        
        
        this.init();
    }
    
    Template.prototype = {
        constructor: Template,
        init: function(){
        	
        },
        parseTmp: function(){
            var str = this.tmp;
            var isOpend = false;
            
            for (var i = 0, len = str.length; i < len; i++) {
                if (str.slice(i, i + this.open.length) === this.open) {
                    if(isOpend){
						
						//throw new Error("");
					}
					isOpend = true;
                    //开始open
                    //找到结束，把代码压入堆栈，如果没有找到结束，直接找到另一个开始字符，语法错误，接着向下执行
					
                }
                if (str.slice(i, i + this.open.length) === this.open) {
                    if(!isOpend){
						
						//throw new Error("");
					}
					isOpend = false;
                }
                
                
                
            }
            
            
        },
        render: function(tmp, obj){
            if (!core.isString(tmp) || core.isUndefined(obj)) {
                console.log("连对象都没有，渲染个毛毛啊！");
                return;
            }
            this.tmp = tmp;
            this.renderObj = common.deepCopy(obj);
            
        }
    }
    
    
    return {
        varName: "Template",
        varVal: Template
    }
});
