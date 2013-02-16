/*
 *
 * 设置页面，主场景
 *
 *
 *
 */
wky_define("wky.pageMainMusic", function(plugin){
    var dom = wky.dom;
    var evnt = wky.event;
    var ImageLoad = wky.plugins.ImageLoad;
    var ImageSwap = wky.plugins.ImageSwap;
    var sortRect = wky.plugins.sortRect;
	var slider = wky.plugins.slider;
    
    if (!dom) {
        throw new Error("dom 加载失败");
        return;
    }
    if (!evnt) {
        throw new Error("event 加载失败");
        return;
    }
    if (!ImageLoad) {
        throw new Error("ImageLoad 加载失败");
        return;
    }
    if (!ImageSwap) {
        throw new Error("ImageSwap 加载失败");
        return;
    }
    if (!sortRect) {
        throw new Error("sortRect 加载失败");
        return;
    }
    
    var pageConfig = {
        musicListWidth: 30,
        pageNavWidth: 40,
        musicPlayerHeight: 100,
		nav:[{
			name:"搜索",
			api:""
		},{
			name:"购买",
			api:""
		},{
			name:"收藏",
			api:""
		},{
			name:"明星墙",
			api:""
		}]
    };
	
	//用户是否登录
	var isUserLogin = function(){
		return __GLOBAL__.isLogin;
	}
	
	//获取用户信息框
	var getUserInfo = function(){
		var info = "";
		if(isUserLogin()){
			info = '<div class="user-name"><span>'+(__GLOBAL__.userName || "")+'</span></div>';
		}else{
			info = '<div class="signup"><a href="/signup.html" target="_blank">注册</a></div><div class="login"><a href="/login.html" target="_blank">登录</a></div>';
		}
		return info;
	}
	
    
    //创建主页面
    var createPage = function(){
        var ws = dom.screenSize();
        var contentWidth = ws.width - pageConfig.musicListWidth;
        var contentHeight = ws.height - pageConfig.musicPlayerHeight;
		var userInfo = getUserInfo();
        var label = '<div class="music-main" style="margin-left:0;height:' + contentHeight + 'px; width:' + ws.width + 'px;"><div class="music-title"><ul><li></li><li>关于</li><li></li><li class="user-info">'+userInfo+'</li></ul></div>' +
        '<div class="music-content" style="margin-left:' + pageConfig.musicListWidth + 'px;width:' + contentWidth + 'px; height:' + (contentHeight - pageConfig.pageNavWidth) + 'px;"></div></div>';
		
        dom.prepend(document.body, label);
        return {
            contentWidth: contentWidth,
            contentHeight: contentHeight
        }
    }
	//创建主音乐内容
	var createMainMusic = function(contentSize){
		var musicMain = dom.search("div.music-main")[0];
        var corverContainer = dom.search("div.music-content", musicMain)[0];
		
		var navSlider = null;
		var width = dom.width(corverContainer);
        var height = dom.height(corverContainer);
        var parsedWidth = parseInt(width / 100);
        var parsedHeight = parseInt(height / 100);
        
        var leaveWidth = (width / 100 - parsedWidth) * 100;
        var leaveHeight = (height / 100 - parsedHeight) * 100;
        
        //todo:应该copy过来
        contentSize = contentSize || {};
        contentSize.leaveWidth = leaveWidth;
        contentSize.leaveHeight = leaveHeight;
        //设置内容
        if (contentSize.leaveWidth < 80) {
            contentSize.leaveWidth = contentSize.leaveWidth + 100;
            parsedWidth = parsedWidth - 1;
        }
		
		var ht = '<div class="content-container" style= "width:'+(contentSize.contentWidth - contentSize.leaveWidth)+'px; ;height:'+(contentSize.contentHeight - pageConfig.pageNavWidth)+'px; float:left;"></div><div class="right-nav" style="width:' + contentSize.leaveWidth + 'px;height:' + (contentSize.contentHeight - pageConfig.pageNavWidth) + 'px;"><div class="content-scroll-bar"></div><div class="content-nav" style="width:' + (contentSize.leaveWidth - 20) + 'px; height:' + (contentSize.contentHeight - pageConfig.pageNavWidth) + 'px;"></div></div>';
		
		dom.html(corverContainer,ht);
		
		var sliders = 
		
		navSlider
		
		
		return;
	}
	
    
    //图片转换
    var songerSwap = function(options){
        options = options || {};
        options.baseContent = options.baseContent || "hi my neme is dustin ！";
        return new ImageSwap(options);
    }
    //加载图片
    var loadImage = function(container, url, backContent){
        if (!container) {
            return;
        }
        var swap = songerSwap({
            container: container,
            duration: 600,
            baseContent: backContent
        });
        swap.setNewImage(url, "p");
    }
    
    //生成右侧导航
    var genRightNav = function(container, contentSize){
        if (!contentSize) {
            return;
        }
        var ht = '<div class="right-nav" style="width:' + contentSize.leaveWidth + 'px;height:' + (contentSize.contentHeight - pageConfig.pageNavWidth) + 'px;"><div class="content-scroll-bar"></div><div class="content-nav" style="width:' + (contentSize.leaveWidth - 20) + 'px; height:' + (contentSize.contentHeight - pageConfig.pageNavWidth) + 'px;"><ul><li>搜索</li><li>购买</li><li>收藏</li></ul></div></div>';
        //创建滚动条
		
        //创建导航
        var sd = slider({
			
		});
	}
    
    
    
    //设置排列元素
    var setSortEle = function(contentSize){
        var musicMain = dom.search("div.music-main")[0];
        var corverContainer = dom.search("div.music-content", musicMain)[0];
        
        var width = dom.width(corverContainer);
        var height = dom.height(corverContainer);
        var parsedWidth = parseInt(width / 100);
        var parsedHeight = parseInt(height / 100);
        
        var leaveWidth = (width / 100 - parsedWidth) * 100;
        var leaveHeight = (height / 100 - parsedHeight) * 100;
        
        //todo:应该copy过来
        contentSize = contentSize || {};
        contentSize.leaveWidth = leaveWidth;
        contentSize.leaveHeight = leaveHeight;
        
        //设置内容
        if (contentSize.leaveWidth < 80) {
            contentSize.leaveWidth = contentSize.leaveWidth + 100;
            parsedWidth = parsedWidth - 1;
        }
        
        var sortedQueue = sortRect({
            baseLen: 100,
            width: parsedWidth * 100,
            height: parsedHeight * 100,
            sizeQueue: [{
                content: 'images/songer/avril.jpg',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nGEmnAf7pMvLxR3J64248TGCKZAUUrKT8S1T0Qc54NoSHDIzPq19iQYeNWkEbwB6RnaaDx09sbYbQG0Iod2qShF1aM%3D",
                frontContent: '艾薇儿',
                width: 300,
                height: 300
            }, {
                content: 'images/songer/black_pe.jpg',
                frontContent: '黑眼豆豆',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nduSLOK3c8NmeYymHCK78B4qurF7vH6bopghthcDkG6tjQstQFdhHMllGEea3bWFBxJDVTP98oL6n%2FjES49wAA%3D",
                width: 200,
                height: 200
            }, {
                content: 'images/songer/chenyixun.jpg',
                frontContent: '陈奕迅',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7naZjtYvxjE08RC9tGaBGU0zYGcVwgUlfwVtUd1tariqdxR4rHfFA0VrW%2FwMFr%2BRp1BWC0muqCMBFeqob6stQe7f7g%3D%3D",
                width: 300,
                height: 200
            }, {
                content: 'images/songer/eminem.jpg',
                frontContent: '艾米纳姆 大神',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7naRSP4Rt4WVfpdXnsySCMMI%2FwybXzv0Lo0XZj8nE3dAVzxUbTV8o8v1KjkW5568s9%2B5uPEtM3Gi3Eu1ZTt0%2FujiPJE%3D",
                width: 200,
                height: 300
            }, {
                content: 'images/songer/yangchenglin.jpg',
                frontContent: '杨晨林',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nU0xoVzHIjat5e5Gd9M7vPMIwz%2B3WAHvyM6DnbXm7bGYXXCW2dG2zLv%2FO8474LpsHas8uHDBuMzOULA0IfhwcE3jw%3D%3D",
                width: 100,
                height: 100
            }, {
                content: 'images/songer/taylorswift.jpg',
                frontContent: 'taylor swift ',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nU2yHH7YAnwODc2V7MetdDV4oi6A%2BkvzUZGSp6NGKbhg05iyJ2tsTK6IJ%2Bnoe5pgwqHgmfoA3gH2S%2FOwLk%2BfBTxUlkvcPt%2F",
                width: 200,
                height: 200
            }, {
                content: 'images/songer/linagjingru1.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nU3wiZMI7HU9P27jexkmLzDm7%2BdNBxrHcX8rEWdkMmQ3O5RjP2cKqzbkhlfUB1NssWEujwPV4C2McNOV9w6ugH3UEwk%2BA%3D%3D",
                width: 300,
                height: 200
            }, {
                content: 'images/songer/wanglihong.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nUx2xyVp43nf3%2FOvVBmhUCI1j5aa5S51pxsmDKIYz42D%2FBj96CFoeC%2Bn6Zvith3JEMYprxYQsR9YsvDSOk26UIIwJa1dtqMHw%3D%3D",
                width: 200,
                height: 300
            }, {
                content: 'images/songer/linkenpark.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nUygA%2BwAE5eEtCMB5H%2FGJboqvGu7uJjUY4JXOeyXDMJBfE4JKbSHKPunW7wfrnLPwK3s1SB2jXPOKDB87e6x%2FJq",
                width: 500,
                height: 300
            }, {
                content: 'images/songer/she.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nU9dq4%2BgdDakR7%2B8Nu%2BsItr60MvBgfuVvlb5M7xlhHnxUM6H1HhgcOfGxnYBByQggmGw2dDvu1RoHQ3ccMjCLvS%2BsPm",
                width: 100,
                height: 200
            }, {
                content: 'images/songer/liudehua.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nTYCaLGRMzQpShCvptGbV4%2Fxe%2BPqL5gLCjWdItaJiZRPflTgVAxZzxgp%2FYuyZ5TRJwPK0Exs24dPfbPnYZeWLOS0LtHKOZ1",
                width: 400,
                height: 300
            }, {
                content: 'images/songer/zhanghuimei.jpg',
                frontContent: '',
                adUrl: "",
                width: 200,
                height: 200
            }, {
                content: 'images/songer/jolin.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nTauv7A8lklnDboPBl%2B8CWMjf4%2FNO%2FIFW%2BsFjMpWXuiTWJ5JPt2ZMgEchnbJJTakOqIDeYnPsGrgEM7rybg7Dn6LyLo",
                width: 100,
                height: 100
            }, {
                content: 'images/songer/wangfeng.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nTbhXYU3nbEEmpkvci0aPCzChlCGygEci8hbbh0DVOf6JMAFRWt6yXzYcq8AO%2FUGZDaXtIFhG7i6%2Bx7o7cuI9TVuJ1OB6Q9",
                width: 100,
                height: 100
            }, {
                content: 'images/songer/groovecoverage.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nTQuXb%2Fr2YoMuD1sZaDP%2BJm49NATPyk53%2FgqtkRFq6kbVVkaFw%2FduZPm9ZBcHtFn7Mo4B0D5qClNuqOUuen2RSq9V%2Fx6%2FY%3D",
                width: 300,
                height: 300
            }, {
                content: 'images/songer/ladygaga.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nTdh79RSyKxN3D5q%2F647pRe6BDcbq10BdWzU7tUnZaU%2FAf1u5n8IR90HG5i8tGeCxihPe3D1BtnByhVTrkk5v2z",
                width: 300,
                height: 300
            }, {
                content: 'images/songer/justin_bieber.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nTfrTKmjN%2FyUq%2FVmSAIYV2lYdk1J3xmQwGqAayJgmt%2FjG1I4yZc0aRyLJ1XSlUqYIzD8ZChWrlOplTaUYt45QE%2Bp6oQQ%2FQs",
                width: 200,
                height: 200
            }, {
                content: 'images/songer/xiaoyaxuan.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7ntDyLvTIVri3Tc2mfvnnstdO6MvBFAl2EZVf6prUeYFc09JlBjBbQBrSHrwZFAptNQ%2BEAYVvDwbfVFAwvKl5TxqvNwHwgqIZOzW",
                width: 300,
                height: 300
            }, {
                content: 'images/songer/wuyuetian.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7ntCHj0Pf2NNJ3PdPTCywDvcEktFRWrsRjAD%2BXF0n60QLbGz%2BHYC3p2W4juUxjY6TiDsXZ%2FOGllyECk2XUAItP1WNPaKIak%3D",
                width: 100,
                height: 100
            }, {
                content: 'images/songer/zhangxueyou.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7ntBY8aP3F2H%2BDFMdKEFZ77B0InexO16bQ%2Bn5HDrXRJ%2FnRH4J0AlLlIc%2BOQiZPK5M%2B%2BKEIK7bvO%2BrlVzLqLTf0rS0fPVKrc%3D",
                width: 300,
                height: 200
            }, {
                content: 'images/songer/shuimunianhua.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7ntElfWiw4NxKcQVUc%2B9LbaFcyleKT491IzVBAfPLBjGDzWZDbZTfTiT4uM%2BYtDSV5J9m3qTP9SUlBk5UMTmoXs%2BJkDGX8Ai",
                width: 100,
                height: 100
            }, {
                content: 'images/songer/jay.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7ntKlwRItSE%2BbQjozJKIcRzzOZX9%2FW0%2BKlXSlHE4aAgJtVJv1wixsl0ODdJaygQbKRlSKVfRhZCFyeLs6lym6%2BNAXWSPwGyed1s%3D",
                width: 200,
                height: 300
            }, {
                content: 'images/songer/wangxinling.jpg',
                frontContent: '',
                adUrl: "http://s.click.taobao.com/t?e=zGU34CA7K%2BPkqB05%2Bm7rfGKZd2WSU5PGV8RjIjTeYKIA7nqiJQ8Mi7Q%2Brn9LS50HuTD%2FdISG5oUSp2aGXSgfIlRor9ECXx5UIE4uSNGGMp0DZOEWovW4T42E%2Bb6%2BpFuiKdaEs2mOLnc8pv4%3D",
                width: 100,
                height: 100
            }, {
                content: 'images/songer/xin.jpg',
                frontContent: '',
                adUrl: "",
                width: 200,
                height: 200
            }, {
                content: 'images/songer/yangkun.jpg',
                frontContent: '',
                adUrl: "",
                width: 100,
                height: 100
            }, {
                content: 'images/songer/zhangliangying.jpg',
                frontContent: '',
                adUrl: "",
                width: 100,
                height: 100
            }, {
                content: 'images/songer/xietingfeng.jpg',
                frontContent: '',
                width: 200,
                height: 200
            }, {
                content: 'images/songer/a_teens.jpg',
                frontContent: '',
                width: 100,
                height: 100
            }, {
                content: 'images/songer/renxianqi.jpg',
                frontContent: '',
                width: 100,
                height: 100
            }, {
                content: 'images/songer/sweetbox.jpg',
                frontContent: '',
                width: 100,
                height: 100
            }, {
                content: 'images/songer/zhangshaohan.jpg',
                frontContent: '',
                width: 100,
                height: 100
            }, {
                content: 'images/songer/zhouchuanxiong.jpg',
                frontContent: '',
                width: 100,
                height: 100
            }, {
                content: 'images/songer/westlife.gif',
                frontContent: '',
                width: 100,
                height: 100
            }, {
                content: 'images/songer/taozhe.jpg',
                frontContent: '',
                width: 100,
                height: 100
            }, {
                content: 'images/songer/wangfei.jpg',
                frontContent: '',
                width: 100,
                height: 100
            }, {
                content: 'images/songer/chenglong.jpg',
                frontContent: '',
                width: 100,
                height: 100
            }, {
                content: 'images/songer/zhangxinzhe.jpg',
                frontContent: '',
                width: 100,
                height: 100
            }, {
                content: 'images/songer/wukequn.jpg',
                frontContent: 'hihiasdfoafd',
                width: 100,
                height: 100
            }]
        });
        
        var ht = "";
        core.each(sortedQueue.elePosQueue, function(i, k){
            if (!k) {
                return;
            }
            var tmpColor = [i * 1, i * 5, i * 4].join(",");
            if ("top" in k) {
                ht += '<div class="songer-image" data-ad-url="' + (k.rect.adUrl || "") + '" data-front-content="' + k.rect.frontContent + '" data-imgurl="' + k.rect.content + '" style="width:' + k.rect.width + 'px; height:' + k.rect.height + 'px; top:' + k.top + 'px;left:' + k.left + 'px; "><div></div></div>';
            }
        });
        
        dom.html(corverContainer, '<div style="position:relative; float:left; height:' + parsedHeight * 100 + 'px; width:' + parsedWidth * 100 + 'px; ">' + ht + '</div>');
        var songerImages = dom.search("div.songer-image", corverContainer);
        core.each(songerImages, function(i, k){
            var imgUrl = dom.getAttr(k, "data-imgurl");
            var cnt = dom.getAttr(k, "data-front-content");
            if (imgUrl) {
                loadImage(k, imgUrl, '<div style="text-align:center; width:100%; height:100%;">' + cnt + '</div>');
            }
        });
        
        //创建右侧导航
        genRightNav(corverContainer, contentSize);
		
        var MusicPopup = wky.plugins.MusicPopup;
        var wsg = dom.screenSize();
        var popup = new MusicPopup({
            width: wsg.width,
            height: wsg.height,
            duration: 600,
            backContent: '正在跳转 到天猫',
            completeCall: function(){
                dom.html(this.realImgContainer,'<iframe src="/guanggao.html" style="width:100%; height:100%;"></iframe>');
            },
        });
		
        evnt.delegate(corverContainer,"div.songer-image" ,"click", function(evt){
			var ele = evt.delegateElement;
			if(!ele){
				return;
			}
			var url = dom.getAttr(ele,"data-ad-url");
			if(!url){
				return;
			}
            //window.open(url, 'newwindow'); 
			return false; 
        });
    }
    
    
    var initPage = function(){
        var size = createPage();
		var mainMusic = createMainMusic(size);
		
        //setSortEle(size);
    }
    
    wky.domReady(function(){
        initPage();
    });
    
});
