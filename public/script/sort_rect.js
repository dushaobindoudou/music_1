/*
 *
 * 排列不规格矩形
 *
 * 每一行的数据结束{mt:"这一行的矩阵",isComplete:"是否已经装满了元素",space:"空白元素，空白元素的宽度"}
 *
 */
wky_define("wky.plugins", function(plugins){

    var core = wky.core;
    
    //简单的复制
    var copy = function(source){
        var des = {};
        core.forIn(source, function(k, v){
            des[k] = v;
        });
        return des;
    }
    
    var SortRect = function(options){
        this.baseLen = options.baseLen || 100;//最小宽高
        this.width = options.width || 0;//显示区域的宽
        this.heigth = options.height || 0;//显示区域的高
        this.sizeQueue = options.sizeQueue || [];//包含元素，元素所占的大小
        this.leaveSpace = [];//剩下的空位
        this.eleQueue = [];
        
        this.matrix = null;
        this.elePosQueue = [];//元素的位置
        this.init();
    }
    SortRect.prototype = {
        constructor: SortRect,
        init: function(){
            var that = this;
            //计算宽高
            var x = parseInt(this.width / this.baseLen);
            var y = parseInt(this.heigth / this.baseLen);
            //初始化矩阵
            this.matrix = this.initMatrix(x, y);
            if (!this.matrix) {
                return;
            }
            //初始化元素队列
            this.eleQueue = this.getQuene(this.sizeQueue, this.baseLen);
            
            this.elePosQueue = this.getSortedEle(this.matrix, this.eleQueue);
        },
        initMatrix: function(x, y){//x,表示轴有多少个元素，y表示有多少行,空白元素用0表示，已经填充元素用1表示
            if (!x || !y) {
                return;
            }
            x = ~ ~ x;
            y = ~ ~ y;
            var mt = [];
            var i = 0;
            var getX = function(xl){
                var i = 0;
                var matrixX = [];
                for (; i < xl; i++) {
                    matrixX[i] = 0;
                }
                return {
                    mt: matrixX,
                    isComplete: false,
                    spaces: [{
                        index: 0,
                        len: matrixX.length
                    }]
                };
            }
            for (; i < y; i++) {
                mt[i] = getX(x);
            }
            return mt;
        },
        getSortedEle: function(pannelMatrix, sortQuene){
            var i = 0, j = 0;
            var pmLen = pannelMatrix.length;
            
            var sqLen = sortQuene.length;
            var completeLine = 0;
            var thePosQuene = [], pos;
            var spaceIdx = 0;
            var that = this;
            while (sortQuene.length > 0) {
                if (!pannelMatrix[i]) {
                    break;
                }
                if (pannelMatrix[i].isComplete) {
                    i++;
                }
                if (sortQuene.length < 1 || i >= pmLen) {
                    break;
                }
                if (!pannelMatrix[i].spaces.length) {
                    continue;
                }
                pos = that.scanLine(pannelMatrix[i], sortQuene, pannelMatrix, i, spaceIdx);
                if (pos) {
                    spaceIdx = 0;
                    thePosQuene.push(pos);
                }
                else {
                    spaceIdx++;
                    if (spaceIdx >= pannelMatrix[i].spaces.length) {
                        spaceIdx = 0;
                        i++;
                    }
                }
            }
            //整理没有填充的区域按照行为单位
            this.fillSpace();
            
            return thePosQuene;
        },
        fillSpace: function(){
            var i = 0;
            var j = 0;
            var spaceLen = 0;
            var len = this.matrix.length;
            var space = null;
            //todo:遍历了一遍矩阵
            for (; i < len; i++) {
                if (!this.matrix[i].isComplete) {
                    space = this.matrix[i].spaces;
                    spaceLen = space.length;
                    if (spaceLen > 0) {
                        for (j = 0; j < spaceLen; j++) {
                            this.leaveSpace.push({
                                top: parseInt(i) * this.baseLen,
                                left: parseInt(space[j].index) * this.baseLen,
                                width: space[j].len * this.baseLen,
                                height: this.baseLen
                            });
                        }
                    }
                }
            }
            
        },
        getQuene: function(sizeQue, base){
            if (!sizeQue.length) {
                return;
            }
            var quene = [];
            var i = 0;
            var len = sizeQue.length;
            var getEleMatrix = function(sz, base){
                var ht = Math.ceil(sz.height / base);
                var wt = Math.ceil(sz.width / base);
                var des = copy(sz);
                des.ht = ht;
                des.wt = wt;
                return des;
            }
            for (; i < len; i++) {
                quene[i] = getEleMatrix(sizeQue[i], base);
            }
            return quene;
        },
        checkSpace: function(line){//重新检测这一行的剩余空间信息
            var i = 0;
            var tmpWt = 0;
            var tmpidx = 0;
            var tmpQuene = [];
            var isSetIdx = false;
            if (!line) {
                return;
            }
            var len = line.mt.length;
            for (; i < len; i++) {
                if (line.mt[i] == 0) {
                    if (!isSetIdx) {
                        tmpidx = i;
                        isSetIdx = true;
                    }
                    tmpWt++;
                }
                if ((line.mt[i] == 1) || (i == len - 1)) {
                    //保存space信息到里面队列
                    if (tmpWt > 0) {
                        tmpQuene.push({
                            index: tmpidx,
                            len: tmpWt
                        });
                        isSetIdx = false;
                    }
                    //清空临时信息
                    tmpidx = 0;
                    tmpWt = 0;
                }
            }
            if (tmpQuene.length <= 0) {
                line.isComplete = true;
            }
            line.spaces = tmpQuene;
            return;
        },
        updateMartix: function(curLine, mt, ele, spidx, lineNum){
            var i = 0, j = 0;
            //获取当前空白信息
            var sp = curLine.spaces[spidx];
            //如果占用多行则更新所有占用行的空间
            if (ele.ht > 0) {
                if (ele.ht + lineNum > mt.length) {
                    //跳过一些不适合的元素
                    return false;//该元素不适合这个容器了,选择跳过
                }
                else {
                    for (; j < ele.ht; j++) {
                        i = 0;
                        for (; i < ele.wt; i++) {
                            if (!mt[lineNum + j]) {
                                break;
                            }
                            mt[lineNum + j].mt[spidx + i] = 1;
                        }
                        //更新空白空间
                        this.checkSpace(mt[lineNum + j]);
                    }
                    return true;
                }
            }
        },
        getRightEle: function(stQu, wd){
            var i = 0;
            var len = stQu.length;
            for (; i < len; i++) {
                if (stQu[i].wt <= wd) {
                    return stQu.splice(i, 1);
                }
            }
            return;
        },
        scanLine: function(oneLine, sortQuene, mt, lineNum, spaceIdx){
            var len = oneLine.spaces.length;
            var baseLen = this.baseLen;
            spaceIdx = spaceIdx || 0;
            //填充                    
            var theWt = oneLine.spaces[spaceIdx].len;
            var mtLeft = 0, mtTop = 0;
            //判断能容纳的宽是多少
            var rtEle = this.getRightEle(sortQuene, theWt);
            if (rtEle) {
                //更新矩阵
                mtLeft = oneLine.spaces[spaceIdx].index * (baseLen || 0);
                mtTop = lineNum * (baseLen || 0);
                if (!this.updateMartix(oneLine, mt, rtEle[0], oneLine.spaces[spaceIdx].index, lineNum)) {
                    //继续下一个元素
                    return {
                        isOutBound: true,
                        rect: rtEle[0]
                    };
                    //return;
                };
                
                //返回位置队列
                return {
                    isOutBound: false,
                    left: mtLeft,
                    top: mtTop,
                    rect: rtEle[0]
                }
            }
            return;
        }
    }
    
    var sortRect = function(options){
        return new SortRect(options);
    }
    
    return {
        varName: "sortRect",
        varVal: sortRect
    }
    
    
});
