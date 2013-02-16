
/*
 *
 * author:dustin
 * email:dushaobindoudou@gmail.com
 *
 * 基于jquery 一个音乐播放器，支持列表，歌词，常用操作,内置三款皮肤
 *
 * 用jplayer flash
 *
 */
//require difine
//requrie dom;
wky_define("wky.plugins", function(plugin){

    var flashSource = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="$1" width="1" height="1" name="$1" style="position: absolute; left: -1px;"> \
        <param name="movie" value="$2?playerInstance=$4&datetime=$3">' +
    '<param name="allowscriptaccess" value="always">' +
    '<embed name="$1" src="$2?playerInstance=$4&datetime=$3" width="1" height="1" allowscriptaccess="always"> \
      </object>';
    
    //公共方法
    var dom = wky.dom;
    var core = wky.core;
    var tween = wky.tween;
	
    var evnt = wky.event;
	var ajax = wky.ajax;
	
    
    var ImageLoad = wky.plugins.ImageLoad;
    var ImageSwap = wky.plugins.ImageSwap;
	var slider = wky.plugins.slider;
    var popup = wky.plugins.popup;
	
    
    var addEvent = function(ele, evt, handler){
        if (!ele || !evt || !handler) {
            return;
        }
        if (ele.addEventListener) {
            ele.addEventListener(evt, handler, false)
        }
        else {
            ele.attachEvent("on" + evt, handler);
        }
    }
    
    var removeEvent = function(ele, evt, handler){
        if (!ele || !evt || !handler) {
            return;
        }
        if (ele.removeEventListener) {
            ele.removeEventListener(evt, handler, false)
        }
        else {
            ele.detachEvent("on" + evt, handler);
        }
    }
    
    var isString = function(obj){
        return Object.prototype.toString.call(obj) === "[object String]";
    }
    
    var getSwf = function(name){
        var swf = document[name] || window[name];
        
        return swf.length > 1 ? swf[swf.length - 1] : swf;
    }
    
    var getPlayerId = function(){
        var id = 0;
        return function(){
            id++;
            return "_player_" + id;
        }
    }()
    
    var getMusicId = function(){
        var id = 0;
        return function(){
            id++;
            return "_music_" + id;
        }
    }()
    
    
    var createFlashPlayer = function(ele, id, src, instance, preload){
        if (!id) {
            return;
        }
        var fc = flashSource.replace(/\$1/g, id);
        fc = fc.replace(/\$2/g, src);
        fc = fc.replace(/\$3/g, (+new Date + Math.random()));
        fc = fc.replace(/\$4/g, instance);
        // Inject the player markup using a more verbose `innerHTML` insertion technique that works with IE.
        ele.innerHTML = fc;
        var flashPlayer = getSwf(id);
        return flashPlayer;
    }
    
    var createSource = function(src){
        var html = "";
        if (core.isArray(src)) {
            core.forEach(src, function(v, i){
                html += '<source src="' + v + '">';
            })
        }
        else {
            html += '<source src="' + src + '">';
        }
        return html;
    }
    
    function removeSWF(id){
        var obj = getElementById(id);
        if (obj && obj.nodeName == "OBJECT") {
            if (ua.ie && ua.win) {
                obj.style.display = "none";
                (function(){
                    if (obj.readyState == 4) {
                        removeObjectInIE(id);
                    }
                    else {
                        setTimeout(arguments.callee, 10);
                    }
                })();
            }
            else {
                obj.parentNode.removeChild(obj);
            }
        }
    }
    
    function removeObjectInIE(id){
        var obj = getElementById(id);
        if (obj) {
            for (var i in obj) {
                if (typeof obj[i] == "function") {
                    obj[i] = null;
                }
            }
            obj.parentNode.removeChild(obj);
        }
    }
    
    
    
    /*
     *
     * 播放器
     * {}
     */
    var Player = function(option){
        this.option = option || {};
        this.element = option.ele;
        this.preload = this.option.preload || true;
        this.autoPlay = this.option.autoPlay || false;
        this.playEndCallback = this.option.playEnd ||
        function(){
        };
        this.playheadCallback = this.option.uploadPlayhead ||
        function(){
        };
        this.loadProgressCallback = this.option.loadProgress ||
        function(){
        };
        this.player = null;
        this.duration = 0;
        this.playerIsLoaded = false;
        this.isReay = false;
        this.isPlaying = false;
        this.playerId = getPlayerId();
        this.init();
    };
    
    Player.prototype = {
        constructor: Player,
        init: function(){
            //create player
            var self = this;
            var flashObj = createFlashPlayer(this.element, this.playerId, "flash/audio.swf", "wky.plugins.playerCollection.get('" + this.playerId + "')");
            this.player = flashObj;
            window.onbeforeunload = function(){
                var player = document.getElementById(self.playerId);
                if (player && player.nodeName == "OBJECT") {
                    player.parentNode.removeChild(player);
                }
            }
        },
        updatePlayhead: function(played){
            this.playheadCallback.apply(this, arguments);
        },
        loadProgress: function(percent, dur){
            this.duration = dur;
            this.loadProgressCallback.apply(this, arguments);
        },
        loadStarted: function(){
            //表示一切就绪可以播放聊
            this.isReady = true;
            if (this.preload) {
                this.player.init(audio.mp3);
            }
            if (this.autoplay) {
                this.play();
            }
        },
        loadError: function(){
            //todo:  io error send back to server
        },
        trackEnded: function(){
            this.playEndCallback.call(this);
        },
        setAudio: function(src){
            var self = this;
            try {
                if (self.preload) {
                    self.player.load(src);
                    self.isReady = false;
                }
            } 
            catch (err) {
                self.flashError(err);
            }
            return self;
        },
        skipTo: function(percent){
            var self = this;
            try {
                if (percent > 1) {
                    percent = 1
                }
                if (percent < 0) {
                    percent = 0;
                }
                self.player.skipTo(percent);
            } 
            catch (e) {
                self.flashError(err);
            }
            return self;
        },
        load: function(src){
            try {
                this.player.init(src);
            } 
            catch (err) {
                this.flashError(err);
            }
            this.isReay = false;
            return this;
        },
        play: function(){
            try {
                this.player.pplay();
                this.isPlaying = true;
            } 
            catch (err) {
                this.flashError(err);
            }
        },
        getPlayStatus: function(){
            return this.isPlaying;
        },
        pause: function(){
            try {
                this.player.ppause();
                this.isPlaying = false;
            } 
            catch (err) {
                this.flashError(err);
            }
        },
        playPause: function(){
            try {
                this.player.playerPause();
                if (this.isPlaying) {
                    this.isPlaying = false;
                }
                else {
                    this.isPlaying = true;
                }
            } 
            catch (err) {
                this.flashError(err);
            }
            return this;
        },
        volume: function(v){
            try {
                this.player.setVolume(v);
            } 
            catch (err) {
                this.flashError(err);
            }
            return this;
        },
        maxVolume: function(){
            this.volume(1);
            return this;
        },
        mute: function(){
            this.volume(0);
            return this;
        },
        flashError: function(error){
            //把错误send 回日志服务器 
            //console.log(error.msg);
            //return this;
        },
        destory: function(){
            if (this.element) {
                this.element.innerHTML = "";
            }
        }
    }
    
    /*
     *
     * 播放列表
     *
     * playMode:[listCircle,list,random,singelCricle]
     * 			列表循环，列表播放，随机播放，单曲循环
     *
     *
     * [{mp3:"",lrc:"",mdx:""}]
     *
     */
    var playListModes = {
        "listCircle": {
            next: function(curr, total){
                if (curr < total - 1) {
                    return curr + 1;
                }
                if (curr >= total - 1) {
                    return 0
                }
            },
            prev: function(curr, total){
                if (curr > 0) {
                    return curr - 1;
                }
                if (curr <= 0) {
                    return total - 1;
                }
            },
            modeName: "列表循环"
        },
        "list": {
            next: function(curr, total){
                if (curr < total - 1) {
                    return curr + 1;
                }
                if (curr >= total - 1) {
                    return -1;
                }
            },
            prev: function(curr, total){
                if (curr > 0) {
                    return curr - 1;
                }
                if (curr <= 0) {
                    return -1;
                }
            },
            modeName: "列表播放"
        },
        "random": {
            next: function(curr, total){
                var ran = Math.random() * total
                return parseInt(ran);
            },
            prev: function(curr, total){
                var ran = Math.random() * total
                return parseInt(ran);
            },
            modeName: "随机播放"
        },
        "singelCricle": {
            next: function(curr){
                return curr;
            },
            prev: function(curr){
                return curr;
            },
            modeName: "单曲循环"
        }
    };
    
    var PlayerList = function(option){
        option = option || {};
        this.defaultMode = "listCircle";
        this.playMode = option.playMode in playListModes ? option.playMode : this.defaultMode;
        this.playList = [];
        this.currentPlay = "";
        this.currentPlayIdx = 0;
        this.currentMusic = null;
		this.isNewList = false;
		
        this.musicEndedCall = option.musicEndedCall || function(){};
        this.playMusicCall = option.playMusicCall || function(){};
        this.stopMusicCall = option.skipCall || function(){};
        this.loadMusicCall = option.loadMusicCall || function(){};
        this.skipCall = option.skipCall ||function(){};
        this.usePlayer = option.player;
		this.formName = option.formName || "";//当前列表的歌单名
		this.currFormName = "";//正在播放的歌单

        this.init(option.playList);
    }
    PlayerList.prototype = {
        constructor: PlayerList,
        init: function(list){
            var self = this;
            if (!this.usePlayer) {
                throw new Error("你还没有播放器，请先实例化一个player");
            }
            this.usePlayer.playEndCallback = function(){
                self.musicEnded();
            }
            self.resetPlayList(list,this.formName);
        },
		resetPlayList:function(list,formName){
			var self = this;
			self.playList = [];
			if (core.isArray(list)) {
                core.forEach(list, function(k, i){
                    if (!k || !k.mp3 || !k.songId) {
                        return;
                    }
                    self.playList.push(k);
                });
            }
            else {
                if (!list || !list.mp3 || !list.songId) {
                    return;
                }
                self.playList(list);
            }
			self.formName = formName;
			self.isNewList = true;
		},
        musicEnded: function(callback){
            this.musicEndedCall.call(this);
        },
        updatePlaying: function(mdx){
            var idx = this.findMdx(mdx);
            if (idx > -1) {
                this.currentPlayIdx = idx;
                if (this.loadMusic("upldate")) {
                    this.playMusic();
                }
            }
            return this;
        },
        next: function(){
            var curr = this.getNextPlayIdx();
            this.currentPlayIdx = curr;
			if(this.isNewList && this.currFormName != this.formName){
				this.currentPlayIdx = 0;
			}
            if (this.loadMusic("next")) {
                this.playMusic();
            }
            return this;
        },
        prev: function(){
            var curr = this.getPrevPlayIdx();
            this.currentPlayIdx = curr;
			if(this.isNewList && this.currFormName != this.formName){
				this.currentPlayIdx = 0;
			}
            if (this.loadMusic("prev")) {
                this.playMusic();
            }
            return this;
        },
        setPlayMode: function(mode){
            if (!mode) {
                return false;
            }
            if (mode in playListModes) {
                this.playMode = mode;
                return true;
            }
            return false;
        },
        getPlayMode: function(){
            return this.playMode;
        },
        addMusic: function(music){
            //todo:应该clone 一下
            if (!music || !music.mp3) {
                return this;
            }
            music.mdx = getMusicId();
            this.playList.push(music);
            return this;
        },
        findMdx: function(mdx){
            if (!mdx) {
                return -1;
            }
            var pl = this.playList;
            for (var i = 0; i < pl.length; i++) {
                if (pl[i] && pl[i].songId == mdx) {
                    return i;
                }
            }
            return -1;
        },
        removeMusic: function(mdx){
            if (!mdx) {
                return this;
            }
            var idx = findMdx(mdx);
            if (idx > -1) {
                this.playList.splice(idx, 1);
            }
            return this;
        },
        getNextPlayIdx: function(){
            var self = this;
            var mode = this.playMode;
            if (mode in playListModes) {
                return playListModes[mode].next(this.currentPlayIdx, this.playList.length);
            }
            else {
                return playListModes[this.defaultMode].next(this.currentPlayIdx, this.playList.length);
            }
        },
        getPrevPlayIdx: function(){
            var self = this;
            var mode = this.playMode;
            if (mode in playListModes) {
                return playListModes[mode].prev(this.currentPlayIdx, this.playList.length);
            }
            else {
                return playListModes[this.defaultMode].prev(this.currentPlayIdx, this.playList.length);
            }
        },
        loadMusic: function(witch){
            var music = this.playList[this.currentPlayIdx];
            if (music) {
                this.currentMusic = music;
                this.usePlayer.setAudio(music.mp3);
                this.loadMusicCall.call(this, witch);
                return true;
            }
            return false;
        },
        playMusic: function(){
            if (!this.currentMusic) {
                this.loadMusic("play");
            }
			this.isNewList = false;
            this.usePlayer.play();
            this.playMusicCall.call(this)
			this.currFormName = this.formName;//设置当前播放歌曲的表单
			return this;
        },
        pauseMusic: function(){
            this.usePlayer.pause();
            this.stopMusicCall.call(this);
            return this;
        },
        //下面这些应该是 播放器的功能不过，我还是决定加到列表上 
        getPlayStatus: function(){
            return this.usePlayer.getPlayStatus();
        },
        setVolume: function(v){
            v = parseFloat(v);
            if (isNaN(v)) {
                return;
            }
            this.usePlayer.volume(v);
            return this;
        },
        skipToPosition: function(v){
            v = parseFloat(v);
            if (isNaN(v)) {
                return;
            }
            this.usePlayer.skipTo(v);
            this.skipCall.call(this, v);
            return this;
            
        },
        getCurrentPlayMusic: function(){
            return this.currentMusic;
        },
		updatePlayList:function(){
			
		}
    }
    
    /*
     *
     * 音乐歌词，要写个lrc转换的形式
     *
     */
    var MusicLRC = function(options){
        //this
        this.lrc = options.defaultLRC || {};
        this.lrcTimeList = null;
        this.prevLine = null;
        this.lrcListHeight = options.lrcListHeight || 0;
        this.currentLine = 0;
        this.currentTick = 0;
        this.pannel = options.pannel || "";
        this.animEasing = options.easing || "easeOutCubic";
        this.animDuration = options.duration || 250;
        this.lrcSpecialKey = options.lrcSpecialKey ||
        {
            at: "",
            ar: "",
            al: "",
            by: "",
            ti: "",
            offset: ""
        };
        this.lrcOffset = 0;
        this.lrcList = null;
        this.init();
    }
    
    MusicLRC.prototype = {
        constructor: MusicLRC,
        init: function(lrc){
            if (!core.isArray(this.pannel)) {
                this.pannel = [this.pannel];
            }
            this.setLRC(lrc || this.lrc);
            this.updatePannel(this.pannel);
            this.lrcList = dom.search("ul", this.pannel);
            if (!this.lrcListHeight) {
                this.resetLrcContainerHeight();
            }
        },
        resetLrcContainerHeight: function(){
            var that = this;
            this.lrcListHeight = dom.innerHeight(this.pannel[0]);
            this.adjustLineToPannel();
        },
        adjustLineToPannel: function(){
            var currentTick = parseInt(this.lrcTimeList[this.currentLine]);
            var that = this;
            var tick = currentTick;
            if (!this.lrc[tick]) {
                return "";
            }
            var currentLine = dom.search("li[tick=" + tick + "]", this.lrcList);
            var liHeight = dom.height(currentLine[0]);
            var ul = that.lrcList[0];
            var midHeight = this.lrcListHeight / 2;
            var tm = midHeight - liHeight * (this.currentLine - 1.5) - liHeight;
            dom.setStyle(ul, {
                top: (tm) + "px"
            });
            if (this.prevLine) {
                core.forEach(dom.search("li.current",that.lrcList), function(v, i){
                    dom.removeClass(v, "current");
                });
            }
            core.forEach(currentLine, function(v, i){
                dom.addClass(v, "current");
            });
            return this.lrc[tick];
        },
        setLRC: function(lrc){
            var that = this;
            if (!lrc || isString(lrc)) {
                //paseLRC2JSON();
            }
            else {
                this.lrc = lrc;
            }
            if ("timeList" in this.lrc && this.lrc["timeList"].length > 0) {
                //todo:复制一个副本 
                this.lrcTimeList = this.lrc["timeList"];
            }
            else {
                this.genTimeList();
            }
        },
        genTimeList: function(){
            var that = this;
            var list = [];
            core.forIn(this.lrc, function(v, k){
                if (!v || !v.match(/^\d+$/)) {
                    if (v.toLowerCase() == "offset") {
                        that.lrcOffset = parseInt(k);
                    }
                }
                else {
                    list.push(v);
                }
            });
            this.lrcTimeList = list;
        },
        renderLRC: function(){
            var that = this;
            var ht = ['<ul>'];
            core.forIn(this.lrc, function(k, v){
                if (k.toLowerCase() in that.lrcSpecialKey) {
                    that.lrcSpecialKey[k.toLowerCase()] = v;
                    return;
                }
                ht.push('<li tick="' + k + '">' + v + '</li>');
            });
            ht.push('</ul>');
            core.forEach(this.pannel, function(v, i){
                dom.html(v, ht.join(""))
            });
            return ht;
        },
        updatePannel: function(hander){
            if (!hander) {
                return;
            }
            this.destoryPannel();
            this.pannel = hander;
            this.renderLRC();
        },
        destoryPannel: function(){
            this.currentLine = 0;
            this.currentTick = 0;
            core.forEach(this.pannel, function(v, i){
                dom.html(v, "");
            });
        },
        showLine: function(tick){
            var currentTick = parseInt(this.lrcTimeList[this.currentLine]);
            var that = this;
            if (core.isUndefined(tick)) {
                tick = currentTick;
            }
            if (currentTick + that.lrcOffset < tick) {
                tick = currentTick;
                this.currentLine++;
            }
            if (!this.lrc[tick]) {
                return "";
            }
            if (this.prevLine) {
                core.forEach(this.prevLine, function(v, i){
                    dom.removeClass(v, "current");
                });
            }
            var currentLine = dom.search("li[tick=" + tick + "]", this.lrcList);
            core.forEach(currentLine, function(v, i){
                dom.addClass(v, "current");
            });
            that.prevLine = currentLine;
            var liHeight = dom.height(currentLine[0]);
            this.animate(liHeight * (this.currentLine - 1.5), -liHeight);
            return this.lrc[tick];
        },
        localToRecent: function(tick){
            var that = this;
            var len = this.lrcTimeList.length;
            var halfLen = 0;
            var halfVal = 0;
            var center = 0;
            var idx = -1;
            var halfIdx = 0;
            tick = parseInt(tick);
            if (isNaN(tick) || !tick) {
                return;
            }
            halfIdx = parseInt(len / 2);
            halfLen = parseInt(len / 2);
            halfLen = halfLen == len / 2 ? halfLen - 1 : halfLen;
            while (1) {
                if (halfLen >= len - 1) {
                    idx = len - 1;
                    break;
                }
                if (halfLen <= 0) {
                    idx = 0;
                    break;
                }
                if (halfIdx < 1) {
                    idx = 0;
                    break;
                }
                halfVal = this.lrcTimeList[halfLen];
                if (parseInt(halfVal) < tick) {
                    if (parseInt(this.lrcTimeList[halfLen + 1]) > tick) {
                        idx = halfLen;
                        break;
                    }
                    else {
                        halfIdx = Math.ceil(Math.ceil(halfIdx) / 2);
                        halfLen = halfLen + halfIdx;
                        
                    }
                }
                else 
                    if (parseInt(halfVal) > tick) {
                        if (parseInt(this.lrcTimeList[halfLen - 1]) < tick) {
                            idx = halfLen - 1;
                            break;
                        }
                        else {
                            halfIdx = parseInt(parseInt(halfIdx) / 2);
                            halfLen = halfLen - halfIdx;
                        }
                    }
                    else {
                        idx = halfLen;
                        break;
                    }
            }
            this.currentLine = idx;
            this.showLine();
            return idx;
        },
        animate: function(start, change){
            var midHeight = this.lrcListHeight / 2;
            var that = this;
            var ul = that.lrcList[0];
            tween.animate({
                easing: that.animEasing,
                duration: that.animDuration,
                start: midHeight - start,
                change: change,
                step: function(dalte, sv){
                    dom.setStyle(ul, {
                        top: (sv) + "px"
                    });
                }
            });
        }
    }
    
    /*
     *
     * 歌曲列表
     *
     */
    var SongList = function(option){
        option = option || {};
        this.songList = option.songList || [];
        this.container = option.container || "";
        this.playNewMusic = option.playMusic || function(){};
		this.swapFormCall = option.swapFormCall || function(){};
		this.currentSongFormName = null;
		this.currentFormSongList = null;
        this.formListEle = null;
		this.songListEle = null;
		this.songSlider = null;
		this.addFormEle = null;
		this.popAddForm = null;
        this.init();
    };
    
    SongList.prototype = {
        init: function(){
            var that = this;
            if (!that.container) {
                return;
            }			
			this.createListForm();
            this.bindEvent();
        },
		createListForm:function(){
			var self = this;
			this.formListEle = document.createElement("div");
			this.songListEle = document.createElement("div");
			dom.addClass(this.formListEle,"form-list");
			dom.addClass(this.songListEle,"song-list");
			
			dom.append(this.container,this.formListEle);
			dom.append(this.container,this.songListEle);
			
			this.setMusicForm();
			this.popAddForm = popup({
				width:"400",
				height:"160",
				className:"popup",
				isMask:true,
				content:'<div class="add-form"><div class="title"><span> 添加歌曲播放列表</span><span class="close"> 关闭 </span></div><div class="content"><input class="in-form-name" type="text"  /><p class="tip"> * 名称1-10个字!</p><p><input class="submit" type="button" value="添加"></p></div></div>',
				initSuccess:function(ele){
					if(!ele){
						return;
					}
					var that = this;
					var closeEle = dom.search("span.close",ele);
					var submitEle = dom.search("input.submit",ele);
					var tip = dom.search("p.tip",ele)[0];
					var formNameEle = dom.search("input.in-form-name",ele)[0];
					
					evnt.add(closeEle[0],"click",function(){
						that.hide();					
					});
					evnt.add(submitEle[0],"click",function(){
						var formName = formNameEle.value;
						if(formName.length <0 || formName.length >10){
							dom.html(tip,"名字不合规范!")
							return;
						}
						if(!__GLOBAL__.apis.addSongForm){
							dom.html(tip," * 接口错误，您没有权限！")
							return;
						}else{
							ajax.get(__GLOBAL__.apis.addSongForm,{
								form_name:formName
							},function(data){
								if(!data || !data.JSON){
									dom.html(tip," * 数据提交失败！")
									return;
								}else{
									if(data.JSON.status){
										//close
										self.popAddForm.hide();
									}else{
										dom.html(tip,data.JSON.msg)
									}
								}
							})
						}
					});
				},
				hideCallback:function(ele){
					var tip = dom.search("p.tip",ele)[0];
					var formNameEle = dom.search("input.in-form-name",ele)[0];
					dom.html(tip," * 名称1-10个字!");
					formNameEle.value = "";
				}
			});
		},
		setMusicForm:function(){
			var that = this;
			var ul = "<ul>";
			var songForms = "";
			var initFormName = "";
			if(!this.formListEle){
				//console.log 这里可以跑一个异常了
				return;
			}
			core.each(that.songList,function(i,v){
				if(!v || !v.name){
					return;
				}
				ul += '<li form-name="' + v.name + '" song-list-idx="'+i+'" ><div>'+v.name||""+'</div></li>';
				songForms += '<ul form-name='+v.name+' style="width:360px; height:100%;float:left;"></ul>';
			});
			ul += "</ul>";
			dom.html(that.formListEle, ul);
			that.addFormEle = document.createElement("div");
			dom.addClass(that.addFormEle,"plus");
			//添加plus 按钮
			dom.append(that.formListEle,that.addFormEle);
			this.songSlider = slider({
				container:that.songListEle,
				innerElements:songForms,
				duration:450,
				easing: "easeInOutCubic"
			});
			//dom.html(that.songListEle,songForms)
			initFormName = that.songList[0] ? that.songList[0].name : "";
			this.updateFormSongList(initFormName);
		},
		showAddFormBtn:function(){
			dom.setStyle(that.addFormEle,{
				display:"block"
			})
		},
		hideAddFormBtn:function(){
			dom.setStyle(that.addFormEle,{
				display:"none"
			})
		},
		updateFormSongList:function(key){
			var that = this;
			var songForm = this.findForm(key);
			if(!songForm || !key){
				//没有发现歌单名字
				return;
			}
			var formContainers = dom.search("ul[form-name="+key+"]",that.songListEle);
			var formNav = dom.search("li[form-name="+key+"]",that.formListEle);
			if(formContainers.length < 1 || formNav.length < 1){
				return;
			}
			var songs = "";
            core.each(songForm.songList, function(i, v){
                if (!v || !v.songId) {
                    return;
                }
                songs += '<li song-id="' + v.songId + '"><div class="song-info"><div song-id="' + v.songId + '" class="play-btn"></div><div class="song">' + (v.songName || "") + '</div><div class="singer">' + (v.songer || "") + '</div></div></li>';
            });
			dom.html(formContainers[0], songs);
			//设置 导航 选中样式
			that.setNewNavClass(formNav[0]);
			
			that.currentFormSongList = songForm.songList;
			that.currentSongFormName = key;
		},
		setNewNavClass:function(formNav){
			if(!formNav){
				return;
			}
			var that = this;
			//reset class
			var selects = dom.search("li.selected",that.formListEle);
			core.each(selects,function(i,v){
				if(v){
					dom.removeClass(v,"selected");
				}
			});
			dom.addClass(formNav,"selected");
		},
		swapForm:function(formName,idx){
			var that = this;
			that.updateFormSongList(formName)
			that.songSlider.skipTo(parseInt(idx));
			var songList = that.findForm(formName);
			songList = songList ? songList.songList : [];
			that.swapFormCall(songList,formName);
			return;
		},
		findForm:function(key){
			var fms = null;
			if(!key){
				return fms;
			}
			core.each(this.songList,function(i,v){
				if(v && v.name == key){
					fms = v;
					return false;
				}
			});
			return fms;
		},
        addOne: function(){
			
			
        },
        deleteOne: function(){
			
			
        },
        setCurrentPlay: function(songId){
            if (!songId) {
                return;
            }
            var songLi = dom.search('li[song-id=' + songId + ']', this.container);
            if (songLi.length) {
                this.clearPlaying();
                dom.addClass(songLi[0], "playing");
            }
        },
        clearPlaying: function(){
            var songLi = dom.search('li.playing', this.container);
            if (songLi.length) {
                core.each(songLi, function(i, v){
                    dom.removeClass(v, "playing");
                });
            }
        },
        playMusic: function(){
			
			
        },
        bindEvent: function(){
            var that = this;
            //绑定播放一样事件
            evnt.delegate(that.songListEle, "div.play-btn", "click", function(evt){
                var deleEle = evt.delegateElement;
                if (!deleEle) {
                    return;
                }
                var songId = dom.getAttr(deleEle, "song-id");
                that.setCurrentPlay(songId);
                if (core.isFunction(that.playNewMusic)) {
                    that.playNewMusic.call(that, songId, that.currentSongFormName,deleEle, evt);
                }
            })
			//绑定切换列表事件 
			evnt.delegate(that.formListEle,"li[form-name]","click",function(evt){
				var deleEle = evt.delegateElement;
				if(!deleEle){
					return;
				}
				var formName = dom.getAttr(deleEle,"form-name");
				var formIdx = dom.getAttr(deleEle,"song-list-idx");
				that.swapForm(formName,formIdx)
				return false;
			});
			//绑定添加歌单事件
			evnt.add(that.addFormEle,"click",function(evt){
				var ele = evt.target || evt.srcElement;
				if(!ele){
					return;
				}
				that.popAddForm.show();
			});
        }
    };
    
    //创建播放器界面，并绑定相应的事件，这个会与外界的接口
    var PlayListUI = function(option){
        option = option || {};
        this.container = option.container;
        
        //音乐歌词对象
        this.musicLrc = null;
        this.musicDeskLrc = null;
        //播放器列表参数
        this.playerListOption = option.playerListOption || {};
        //播放器参数
        this.playerOption = option.playerOption || {};
        //音乐播放列表 对象
        this.playerList = option.playerList;
        
        //播放模式
        this.playMode = option.playMode || "listCircle";
        
        //歌词父元素
        this.lrcUIEle = null;
        //歌词包含元素
        this.lrcContainer = null;
        this.lrcContainerDesk = null;
        
        //播放器父元素
        this.playerUIEle = null;
        //歌曲列表父元素
        this.listUIEle = null;
        this.listContainer = null;
        //歌曲列表对象 
        this.songList = null;
        
        //图片切换对象
        this.imageSwap = null;
        
        
        this.isPlayerOpen = true;
        
        this.lrcUI = option.lrcUI ||
        {
            top: 0,
            left: 0,
            width: 360,
            height: 480,
            css: function(lrcUI){
                var ws = dom.screenSize();
                var lrcWidth = 360;
                var lrcHeight = 480;
                
                lrcUI.width = lrcWidth;
                lrcUI.height = lrcHeight;
                
                lrcUI.left = ws.width / 2 - lrcWidth / 2;
                lrcUI.top = ws.height / 2 - lrcHeight / 2;
                return {
                    position: "fixed",
                    top: lrcUI.top + "px",
                    left: lrcUI.left + "px",
                    display: "none",
                    height: lrcHeight + "px",
                    width: lrcWidth + "px",
                    opacity: "0.8"
                }
            },
            mode: "d",//w:窗口模式,d:桌面模式
            createHtml: function(){
                var label = '<div class="lrc-controls" style="visibility:hidden;"><ul><li class="close-lrc" title="隐藏歌词" lrc-click="hide_lrc">歌词</li><li title="切换到桌面模式" lrc-click="change_mode">切换</li></ul></div><div class="music-player-lrc"><ul><li>没有歌词</li></ul></div><div class="music-player-lrc-d"><ul><li>没有歌词</li></ul></div>';
                
                return label;
            },
            show_controls: function(lrcEle, ui){
            
                var ctl = dom.search("div.lrc-controls", lrcEle)[0];
                var lrcCon = dom.search("div.music-player-lrc-d", lrcEle)[0];
                dom.setStyle(ctl, {
                    visibility: "visible"
                });
                if (ui.mode == "w") {
                    return;
                }
                dom.addClass(lrcCon, "hover-controls");
                
            },
            hide_controls: function(lrcEle, ui){
            
                var ctl = dom.search("div.lrc-controls", lrcEle)[0];
                var lrcCon = dom.search("div.music-player-lrc-d", lrcEle)[0];
                dom.setStyle(ctl, {
                    visibility: "hidden"
                });
                if (ui.mode == "w") {
                    return;
                }
                dom.removeClass(lrcCon, "hover-controls");
            },
            show_lrc: function(lrcEle, ui){
                var that = this;
                var ctl = null;
                var lrcConWindow = dom.search("div.music-player-lrc", lrcEle)[0];
                var lrcConDesk = dom.search("div.music-player-lrc-d", lrcEle)[0];
                var ws = 0;
                
                if (ui.mode == "d") {
                    ctl = dom.search("div.lrc-controls", lrcEle)[0];
                    ws = dom.screenSize();
                    //添加桌边模式样式
                    dom.addClass(ctl, "lrc-controls-d");
                    //dom.addClass(lrcCon, "music-player-lrc-d");
                    //切换显示
                    dom.setStyle(lrcConWindow, {
                        display: "none"
                    });
                    dom.setStyle(lrcConDesk, {
                        display: "block"
                    });
                    
                    if (that.playerUI.isPlayerOpen) {
                        dom.setStyle(lrcEle, {
                            width: ws.width - 150 - 424 + "px"
                        });
                    }
                    else {
                        dom.setStyle(lrcEle, {
                            width: ws.width - 150 + "px"
                        });
                    }
                    dom.setStyle(lrcEle, {
                        left: 0
                    });
                    dom.setStyle(lrcEle, {
                        top: (ws.height - 100) + "px",
                        width: ws.width - 574 + "px",
                        height: 110 + "px"
                    });
                }
                else {
                    ctl = dom.search("div.lrc-controls-d", lrcEle)[0];
                    //移除桌面模式样式
                    dom.removeClass(ctl, "lrc-controls-d");
                    
                    //切换显示
                    dom.setStyle(lrcConWindow, {
                        display: "block"
                    });
                    dom.setStyle(lrcConDesk, {
                        display: "none"
                    });
                    
                    dom.setStyle(lrcEle, {
                        left: ui.left + "px",
                        top: ui.top + "px",
                        width: ui.width + "px",
                        height: ui.height + "px"
                    });
                    dom.removeClass(lrcConDesk, "hover-controls");
                }
                dom.setStyle(lrcEle, {
                    display: "block"
                });
            },
            change_mode: function(liEle, lrcEle, ui){
                var that = this;
                var ctl = null;
                var ws = 0;
                
                var lrcConWindow = dom.search("div.music-player-lrc", lrcEle)[0];
                var lrcConDesk = dom.search("div.music-player-lrc-d", lrcEle)[0];
                
                if (ui.mode == "w") {
                    ctl = dom.search("div.lrc-controls", lrcEle)[0];
                    ws = dom.screenSize();
                    dom.addClass(ctl, "lrc-controls-d");
                    dom.setStyle(lrcConWindow, {
                        display: "none"
                    });
                    dom.setStyle(lrcConDesk, {
                        display: "block"
                    });
                    
                    if (that.playerUI.isPlayerOpen) {
                        dom.setStyle(lrcEle, {
                            width: ws.width - 150 - 424 + "px"
                        });
                    }
                    else {
                        dom.setStyle(lrcEle, {
                            width: ws.width - 150 + "px"
                        });
                    }
                    
                    
                    
                    that.musicLrcDesk.adjustLineToPannel();
                    
                    dom.setStyle(lrcEle, {
                        left: 0,
                        top: (ws.height - 110) + "px",
                        height: 110 + "px"
                    });
                    ui.mode = "d";
                    
                    
                }
                else {
                    ctl = dom.search("div.lrc-controls-d", lrcEle)[0];
                    
                    dom.removeClass(ctl, "lrc-controls-d");
                    dom.setStyle(lrcConWindow, {
                        display: "block"
                    });
                    dom.setStyle(lrcConDesk, {
                        display: "none"
                    });
                    
                    dom.setStyle(lrcEle, {
                        left: ui.left + "px",
                        top: ui.top + "px",
                        width: ui.width + "px",
                        height: ui.height + "px"
                    });
                    
                    
                    
                    dom.removeClass(lrcConDesk, "hover-controls");
                    that.musicLrc.adjustLineToPannel();
                    ui.mode = "w";
                }
                
                return;
            },
            update_pos: function(lrcEle, ui, mark, delt){
                if (ui.mode == "w") {
                    return;
                }
                var ws = dom.screenSize();
                //574-150
                if (mark == "close") {
                    dom.setStyle(lrcEle, {
                        width: ws.width - 574 + delt * 424 + "px"
                    });
                }
                else {
                    dom.setStyle(lrcEle, {
                        width: (ws.width - 150 + delt * -424) + "px"
                    });
                }
                
            },
            hide_lrc: function(ui){
                var that = this;
                return false;
            }
        };
        this.playerUI = option.playerUI ||
        {
            css: {
                position: "fixed",
                bottom: "0px",
                right: "2px",
                display: "block"
            },
            playMode: this.playMode,
            isPlayerOpen: true,
            createHtml: function(ui){
                var mode = ui.playMode in playListModes ? playListModes[ui.playMode] : playListModes["listCircle"];
                
                var defModeName = mode && mode["modeName"] || "循环播放";
                
                var modeHtml = "";
                
                core.forIn(playListModes, function(i, k){
                    if (k && k.modeName) {
                        if (i == ui.playMode) {
                            modeHtml += '<li class="current-mode" play-mode="' + i + '" ><span>' + k.modeName + '</span></li>';
                        }
                        else {
                            modeHtml += '<li class="" play-mode="' + i + '" ><span>' + k.modeName + '</span></li>';
                        }
                    }
                    
                });
                
                var label = '<div class="flash-player" style="display:block; width:0;height:0;"></div>' +
                '<div class="player-ui">' +
                '<div class="player-on-off" player-click="open_close"><div class="on-icon"></div></div>' +
                '<div class="palyer-waper">' +
                '<div player-mouseover="show_mode_option" player-mouseleave="hide_mode_option" class="player-corver">' +
                '<div class="corver-img-container"><img class="corver-img" src="images/music_corver/nocorver1.png"></div>' +
                '<ul class="play-mode" style="display: none;">' +
                modeHtml +
                '</ul>' +
                '<div class="play-mode selected" style="display: block;">' +
                defModeName +
                '</div>' +
                '</div>' +
                '<div class="player-controls">' +
                '<div>' +
                '<ul>' +
                '<li class="previous" player-click="prev"></li>' +
                '<li class="play" player-click="play"></li>' +
                '<li class="next" player-click="next"></li>' +
                '<li class="bar">' +
                '<div class="played-container" player-click="skip_position">' +
                '<div class="loaded" ></div>' +
                '<div class="played"></div>' +
                '<div class="slider"></div>' +
                '</div>' +
                '<div class="other">' +
                '<div class="time">0:0/0:0</div>' +
                '<div class="volume">' +
                '<div class="volume-icon"></div>' +
                '<div class="volume-val">' +
                '<div class="vol-bar" player-click="change_volume"></div>' +
                '<div class="vol-slide"></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
                
                return label;
            },
            show: function(){
            
            },
            hide: function(){
            
            },
            skip_position: function(ele, uiEle, uiInfo, evt){
                var x = evt.offsetX || evt.layerX;
                var w = dom.width(ele);
                var playUI = this;
                var slider = dom.search("div.slider", uiEle);
                playUI.playerList.skipToPosition(x / w);
                dom.setStyle(slider[0], {
                    left: x + "px"
                });
            },
            play: function(){
                var playUI = this;
                if (playUI.playerList.getPlayStatus()) {
                    playUI.playerList.pauseMusic();
                }
                else {
                    playUI.playerList.playMusic();
                    //playUI.loadLRC();
                }
                playUI.updatePlayStatus();
            },
            next: function(){
                var playUI = this;
                playUI.playerList.next();
                //playUI.loadLRC();
            },
            prev: function(){
                var playUI = this;
                playUI.playerList.prev();
                //playUI.loadLRC();
            },
            change_volume: function(ele, ui, uiInfo, evt){
                var x = evt.offsetX || evt.layerX;
                var w = dom.width(ele);
                var playUI = this;
                
                var slider = dom.search("div.vol-slide", ui);
                
                dom.setStyle(slider[0], {
                    left: x + "px"
                });
                playUI.playerList.setVolume(parseFloat(x / w));
                
            },
            hide_mode_option: function(ele){
                var pm = dom.search("ul.play-mode", ele)[0];
                var sm = dom.search("div.selected", ele)[0];
                dom.setStyle(pm, {
                    display: "none"
                });
                dom.setStyle(sm, {
                    display: "block"
                });
            },
            show_mode_option: function(ele){
                var pm = dom.search("ul.play-mode", ele)[0];
                var sm = dom.search("div.selected", ele)[0];
                dom.setStyle(pm, {
                    display: "block"
                });
                dom.setStyle(sm, {
                    display: "none"
                });
            },
            open_close: function(ele, playerEle, info){
                var playerUI = this;
                if (info.isPlayerOpen) {
                    playerUI.animate(playerEle, "right", 1, -424, 400, "easeInOutSine", function(delt){
                        playerUI.lrcUI.update_pos.call(playerUI, playerUI.lrcUIEle, playerUI.lrcUI, "close", delt);
                    });
                    info.isPlayerOpen = false;
                    
                }
                else {
                    playerUI.animate(playerEle, "right", -425, 424, 400, "easeInOutSine", function(delta){
                        playerUI.lrcUI.update_pos.call(playerUI, playerUI.lrcUIEle, playerUI.lrcUI, "open", delta);
                    });
                    info.isPlayerOpen = true;
                    
                }
            }
        };
        this.listUI = option.listUI ||
        {
            css: function(){
                var ws = dom.screenSize();
                return {
                    position: "fixed",
                    top: "40px",
                    left: "0px",
                    display: "block",
                    height: ws.height - 100 - 40 + "px"
                }
            },
            isHide: false,
            createHtml: function(){
                var ws = dom.screenSize();
                var top = (ws.height - 100) / 2 - 24;
                var label = '<div class="song-detial-list"></div><div class="song-name-list" title="播放列表"><div list-click="hide_show" style="margin-top:' + top + 'px;"></div></div>';
                
                return label;
            },
            show: function(){
            
            },
            hide_show: function(ele, listEle, ui){
                var playerUI = this;
                if (ui.isHide) {
                    playerUI.animate(listEle, "left", -360, 360, 360, "easeInOutSine", function(delt){
                        //playerUI.lrcUI.update_pos.call(playerUI, playerUI.lrcUIEle, playerUI.lrcUI, "close", delt);
                    });
                    
                    //dom.setStyle(listEle,{
                    //	left:"0"
                    //});
                    ui.isHide = false;
                }
                else {
                    playerUI.animate(listEle, "left", 0, -360, 360, "easeInOutSine", function(delt){
                        //playerUI.lrcUI.update_pos.call(playerUI, playerUI.lrcUIEle, playerUI.lrcUI, "close", delt);
                    });
                    ui.isHide = true;
                }
            }
        };
        this.init();
    }
    
    PlayListUI.prototype = {
        constructor: PlayListUI,
        init: function(){
            var fragment = this.createUI();
            this.addSongId();
            dom.append(document.body, fragment);
            //this.playerList = new PlayerList(this.playerListOption);
            //绑定事件
            this.bindEvent();
			//创建歌曲列表
            this.createSongList();
            //创建播放列表
            this.createPlayList();
            //创建 歌词
            this.createLrc();
            //创建图片切换
            this.setImageSwap();
            //初始化 界面信息设置
            this.updateInfo();
            
        },
        addSongId: function(){
            if (core.isArray(this.playerListOption.playList)) {
                core.each(this.playerListOption.playList, function(i, v){
					if(v && v.songList && core.isArray(v.songList)){
						core.each(v.songList,function(j,v1){
							if (v1 && v1.mp3 && !v1.songId) {
								v1.songId = getMusicId();
							}
						});
					}
                });
                return;
            }
        },
        createPlayList: function(){
            var that = this;
			//todo: bugly
			var playListArg = {};
			//初始化参数
            if (!this.playerListOption.player) {
                var py = dom.search("div.flash-player", this.playerUIEle)[0];
                var lb = dom.search("div.loaded", this.playerUIEle)[0];
                var pb = dom.search("div.played", this.playerUIEle)[0];
                var ps = dom.search("div.slider", this.playerUIEle)[0];
                var pt = dom.search("div.time", this.playerUIEle)[0];
                
                this.playerListOption.player = playerCollection.add({
                    ele: py,
                    preload: "auto",
                    loadProgress: function(loaded, dur){
                        dom.setStyle(lb, {
                            width: (loaded * 100) + "%"
                        });
                    },
                    uploadPlayhead: function(played){
                        var duration = this.duration;
                        dom.setStyle(pb, {
                            width: (played * 100) + "%"
                        });
                        dom.setStyle(ps, {
                            left: (played * 100) + "%"
                        });
                        var played = parseInt((played * duration) * 1000);
                        var pdSnd = parseInt(played / 1000);
                        var pdMt = parseInt(pdSnd / 60);
                        var duSnd = parseInt(duration) % 60;
                        var duMt = parseInt(duration) / 60;
                        if (that.lrcUI.mode === "w") {
                            //that.musicLrc.localToRecent(played);
                            that.musicLrc.showLine(played);
                            that.musicLrcDesk.prevLine = that.musicLrc.prevLine;
                            that.musicLrcDesk.currentLine = that.musicLrc.currentLine;
                        }
                        else {
                            //that.musicLrcDesk.localToRecent(played);
                            that.musicLrcDesk.showLine(played);
                            that.musicLrc.prevLine = that.musicLrcDesk.prevLine;
                            that.musicLrc.currentLine = that.musicLrcDesk.currentLine;
                        }
                        pdSnd = pdSnd % 60;
                        dom.html(pt, pdMt + ":" + pdSnd + "/" + parseInt(duMt) + ":" + parseInt(duSnd));
                    }
                });
            }
            this.playerListOption.musicEndedCall = function(){
                that.musicEnded.call(that);
            }
            this.playerListOption.loadMusicCall = function(witch){
                var currentMusic = that.playerList.getCurrentPlayMusic();
                if (!currentMusic || !currentMusic.songId) {
                    return;
                }
                that.songList.setCurrentPlay(currentMusic.songId);
                that.loadLRC();
                var dir = "";
                switch (witch) {
                    case "play":
                        dir = "r";
                        break;
                    case "next":
                        dir = "r";
                        break;
                    case "prev":
                        dir = "p";
                        break;
                    case "update":
                        dir = "r";
                        break;
                    default:
                        dir = "r";
                        break;
                }
                that.imageSwap.setNewImage(currentMusic.songCorver, dir);
            };
            
            this.playerListOption.skipCall = function(tick){
                var dur = that.playerList.usePlayer.duration;
                if (dur) {
                    tick = tick * dur * 1000;
                }
                that.musicLrc.localToRecent(tick);
            }
            
            this.playerListOption.playMusicCall = function(){
                var pyBtn = dom.search("div.player-controls li.play", this.playerUIEle)[0];
                dom.removeClass(pyBtn, "play");
                dom.addClass(pyBtn, "pause");
            }
            this.playerListOption.stopMusicCall = function(){
                var pyBtn = dom.search("div.player-controls li.pause", this.playerUIEle)[0];
                dom.removeClass(pyBtn, "pause");
                dom.addClass(pyBtn, "play");
            }
			playListArg.playList = this.songList.currentFormSongList;//播放列表
			playListArg.formName = this.songList.currentSongFormName;//当前歌单
			playListArg.player = this.playerListOption.player;
			playListArg.musicEndedCall = this.playerListOption.musicEndedCall;
			playListArg.loadMusicCall = this.playerListOption.loadMusicCall;
			playListArg.skipCall = this.playerListOption.skipCall;
			playListArg.playMusicCall = this.playerListOption.playMusicCall;
			playListArg.stopMusicCall = this.playerListOption.stopMusicCall;
			
            this.playerList = new PlayerList(playListArg);
            dom.setStyle(py, {
                display: "block"
            });
			
        },
        setImageSwap: function(){
            var con = null;
            if (!this.imageSwap) {
                con = dom.search("div.corver-img-container", this.playerUIEle)[0];
                this.imageSwap = new ImageSwap({
                    container: con,
                    baseContent: '<div style="background:#FFFFFF;"><img class="corver-img" src="images/music_corver/nocorver1.png"></div>'
                });
            }
            return;
        },
        musicEnded: function(){
            this.playerList.next();
        },
        createLrc: function(){
            var that = this;
            this.lrcContainer = dom.search("div.music-player-lrc", that.lrcUIEle);
            this.lrcContainerDesk = dom.search("div.music-player-lrc-d", that.lrcUIEle);
            
            var muLrc = new MusicLRC({
                pannel: that.lrcContainer,
                lrcListHeight: 460
            });
            
            var muLrcDesk = new MusicLRC({
                pannel: that.lrcContainerDesk
            });
            
            that.musicLrc = muLrc;
            that.musicLrcDesk = muLrcDesk;
        },
        loadLRC: function(musicInfo){
            var currentMusic = null;
            if (!musicInfo) {
                currentMusic = this.playerList.getCurrentPlayMusic();
            }
            else {
                currentMusic = musicInfo;
            }
            if (!currentMusic) {
                return;
            }
            this.musicLrc.init(currentMusic.lrc);
            this.musicLrcDesk.init(currentMusic.lrc);
        },
        getMusicInfo: function(songId,formName){
            var musicInfo = null;
			var that = this;
            if (!songId) {
                return;
            }
			var songForm = this.songList.findForm(formName);
			if(!songForm){
				return musicInfo;
			}
            core.each(songForm.songList, function(i, k){
                if (k && k.songId == songId) {
                    musicInfo = k;
                    return false;
                }
            });
            return musicInfo;
        },
        createSongList: function(){
            var that = this;
            this.listContainer = dom.search("div.song-detial-list", this.listUIEle)[0];
            this.songList = new SongList({
                songList: this.playerListOption.playList,
                container: this.listContainer,
                playMusic: function(songId,formName){
                    if (!songId) {
                        return;
                    }
                    var info = that.getMusicInfo(songId,formName);
                    if (!info) {
                        return;
                    }
                    that.loadLRC(info);
                    that.playerList.updatePlaying(songId);
                },
				swapFormCall:function(list,formName){
					if(that.playerList){
						that.playerList.resetPlayList(list,formName);
					}
				}
            });
            return;
        },
        setCorver: function(){
            var newCorver = document.createElement("img");
            evnt.add(newCorver, "load", function(){
                return false;
            });
            dom.setAttr(newCorver, "src", "");
        },
        loadSongList: function(){
            return;
        },
        getPlayItemElement: function(item){
            var handler = null;
            if (item) {
                handler = document.createElement("div");
                if (core.isFunction(item.css)) {
                    var cssVal = item.css.call(this, item, handler);
                    dom.setStyle(handler, cssVal);
                }
                else 
                    if (item.css) {
                        dom.setStyle(handler, item.css);
                    }
                if (core.isFunction(item.createHtml)) {
                    dom.html(handler, item.createHtml.call(this, item, handler));
                }
            }
            return handler;
        },
        createUI: function(){
            var that = this;
            var fragment = document.createDocumentFragment();
            //创建播放器ui
            this.playerUIEle = that.getPlayItemElement(that.playerUI);
            dom.append(fragment, this.playerUIEle);
            //创建歌词ui
            this.lrcUIEle = that.getPlayItemElement(that.lrcUI);
            dom.append(fragment, this.lrcUIEle);
            //创建列表ui
            this.listUIEle = that.getPlayItemElement(that.listUI)
            dom.append(fragment, this.listUIEle);
            return fragment;
        },
        updateInfo: function(){
            //更新 播放器信息 歌名、歌手、播放模式
            var that = this;
            that.lrcUI.show_lrc.call(that, that.lrcUIEle, that.lrcUI);
            that.listUI.hide_show.call(that, null, that.listUIEle, that.listUI);
            return;
        },
        updatePlayStatus: function(){
            //设置当前状态是 播放还是暂停
            var playBtn = null;
            if (this.playerList.getPlayStatus()) {
                playBtn = dom.search("li.play", this.playerUIEle)[0];
                if (!playBtn) {
                    return;
                }
                dom.removeClass(playBtn, "play");
                dom.addClass(playBtn, "pause");
            }
            else {
                playBtn = dom.search("li.pause", this.playerUIEle)[0];
                if (!playBtn) {
                    return;
                }
                dom.addClass(playBtn, "play");
                dom.removeClass(playBtn, "pause");
            }
        },
        setPlayMode: function(mode, modeText, modeEle, cover, evt){
            var that = this;
            var selecedEle = dom.search("div.selected", cover);
            var currs = null;
            if (this.playerList.setPlayMode(mode)) {
                //更新ui
                dom.html(selecedEle[0], modeText);
                //
                //dom.removeClass(prevEle, "current-mode");
                //todo:效率比较低 
                currs = dom.search("li.current-mode", cover);
                core.each(currs, function(i, k){
                    dom.removeClass(k, "current-mode");
                });
                dom.addClass(modeEle, "current-mode");
            }
            else {
                //没有预定的模式
            }
        },
        initPlayer: function(){
        
        
        },
        animate: function(ele, styleKey, start, change, duration, easing, step, complete){
            var that = this;
            if (!ele || !styleKey) {
                return;
            }
            complete = core.isFunction(complete) ? complete : function(){
            };
            step = core.isFunction(step) ? step : function(){
            };
            tween.animate({
                easing: easing || "linear",
                duration: duration || 1000,
                start: start || 0,
                change: change || 0,
                step: function(dalte, sv){
                    var css = {};
                    css[styleKey] = (sv) + "px";
                    dom.setStyle(ele, css);
                    step.call(that, dalte, sv);
                },
                complete: function(){
                    complete.call(that, ele);
                }
            });
            
        },
        bindEvent: function(){
            var that = this;
            //播放器的点击事件  click event 
            evnt.delegate(that.playerUIEle, "[player-click]", "click", function(evt){
                var deleEle = evt.delegateElement;
                if (!deleEle) {
                    return;
                }
                var option = dom.getAttr(deleEle, "player-click");
                if (core.isFunction(that.playerUI[option])) {
                    that.playerUI[option].call(that, deleEle, that.playerUIEle, that.playerUI, evt);
                }
                return false;
            });
            
            var playerCover = dom.search("div.player-corver", that.playerUIEle)[0];
            
            evnt.delegate(playerCover, "[player-mouseover]", "mouseover", function(evt){
                var deleEle = evt.delegateElement;
                if (!deleEle) {
                    return;
                }
                var option = dom.getAttr(deleEle, "player-mouseover");
                if (core.isFunction(that.playerUI[option])) {
                    that.playerUI[option].call(that, deleEle, that.playerUIEle, that.playerUI, evt);
                }
            });
            
            evnt.delegate(playerCover, "[player-mouseleave]", "mouseout", function(evt){
                var deleEle = evt.delegateElement;
                if (!deleEle) {
                    return;
                }
                var option = dom.getAttr(deleEle, "player-mouseleave");
                if (core.isFunction(that.playerUI[option])) {
                    that.playerUI[option].call(that, deleEle, that.playerUIEle, that.playerUI, evt);
                }
            });
            
            evt.delegate(playerCover, "li[play-mode]", "click", function(evt){
                var deleEle = evt.delegateElement;
                if (!deleEle) {
                    return;
                }
                var mode = dom.getAttr(deleEle, "play-mode");
                var modeText = dom.html(deleEle);
                that.setPlayMode(mode, modeText, deleEle, playerCover, evt);
                return false;
            });
            
            //歌词点击事件
            evnt.delegate(that.lrcUIEle, "[lrc-click]", "click", function(evt){
                var deleEle = evt.delegateElement;
                if (!deleEle) {
                    return;
                }
                var option = dom.getAttr(deleEle, "lrc-click");
                if (core.isFunction(that.lrcUI[option])) {
                    that.lrcUI[option].call(that, deleEle, that.lrcUIEle, that.lrcUI, evt);
                }
                return false;
            });
            
            //鼠标移动到歌词上
            evnt.add(that.lrcUIEle, "mouseover", function(evt){
                var option = "show_controls";
                
                if (core.isFunction(that.lrcUI[option])) {
                    that.lrcUI[option].call(that, that.lrcUIEle, that.lrcUI, evt);
                }
                return false;
            });
            
            //鼠标移动出歌词 
            evnt.add(that.lrcUIEle, "mouseout", function(evt){
                var option = "hide_controls";
                if (core.isFunction(that.lrcUI[option])) {
                    that.lrcUI[option].call(that, that.lrcUIEle, that.lrcUI, evt);
                }
                return false;
            });
            
            //播放列表
            evnt.delegate(that.listUIEle, "[list-click]", "click", function(evt){
                var deleEle = evt.delegateElement;
                if (!deleEle) {
                    return;
                }
                var option = dom.getAttr(deleEle, "list-click");
                if (core.isFunction(that.listUI[option])) {
                    that.listUI[option].call(that, deleEle, that.listUIEle, that.listUI, evt);
                }
                return false;
            });
            
            
            //mousover event
        
            //mouseout event
        
        }
    }
    
    var playerIn = function(colls, id){
        if (!colls || !id) {
            return;
        }
        if (id in colls) {
            return true;
        }
        return false;
    }
    
    var playerCollection = {
        colls: {},
        get: function(id){
            if (!id) {
                return;
            }
            if (playerIn(this.colls, id)) {
                return this.colls[id];
            }
        },
        add: function(opt){
            var player = new Player(opt);
            if (player.playerId) {
                this.colls[player.playerId] = player;
            }
            return player;
        }
    }
    
    
    
    return [{
        varName: "Player",
        varVal: Player
    }, {
        varName: "playerCollection",
        varVal: playerCollection
    }, {
        varName: "MusicLRC",
        varVal: MusicLRC
    }, {
        varName: "PlayListUI",
        varVal: PlayListUI
    }, {
        varName: "PlayerList",
        varVal: PlayerList
    }]
})

