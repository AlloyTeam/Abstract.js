window.requestAnimFrame = (function(){ 
    return window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.oRequestAnimationFrame || 
    window.msRequestAnimationFrame || 
    function(/* function */ callback, /* DOMElement */ element){ 
    window.setTimeout(callback, 1000 / 60); 
}; 
})(); 

var bo = {
    drawFont: function(){
        var ctx = this.ctx;
        var fontSize = 47;
        ctx.font = fontSize + "px Microsoft Yahei Light, Microsoft Yahei";
        ctx.fillStyle = "#fff";
        ctx.shadowBlur = 9;
        ctx.shadowColor = "rgba(86, 86, 86, 0.99)";

        // 居中绘制
        var cWidth = this.canvas.width;
        var cHeight = this.canvas.height;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(this.word, cWidth / 2, cHeight / 2);

        var introWordLeft = cWidth / 2;
        var introWordTop = cHeight / 2 + 47;

        // 在下面绘制introWord
        fontSize = 16;
        ctx.font = fontSize + "px Microsoft Yahei Light, Microsoft Yahei";
        ctx.fillText(this.introWord, introWordLeft, introWordTop);
    },

    bang: function(){
        this.imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // 把有像素信息的点存下来
       var hasInfoDot = [];
       var infoDotCurrDotMap = {};

    var data = this.imgData.data;
    var width = this.imgData.width;
    var height = this.imgData.height;

    var maxOriginY = 0;

       // 计算有点的位置
       for(var y = 0; y < height; y ++){
            for(var x = 0; x < width; x ++){

                var i = (y * width + x) * 4;
                
                if(data[i] + data[i + 1] + data[i + 2] + data[i + 3] > 0){
                    hasInfoDot.push([x, y, data[i], data[i + 1], data[i + 2], data[i + 3]]);

                    if(maxOriginY < y){
                        maxOriginY = y;
                    }
                }
            }
        }

        this.hasInfoDot = hasInfoDot;
        this.infoDotCurrDotMap = infoDotCurrDotMap;
        this.maxOriginY = maxOriginY;


        var _this = this;
        var timeCount = 0;
        var render = function(){
            if(! _this.stopped){

            timeCount ++;
            _this.step(timeCount);

            _this.imgData = _this.ctx.getImageData(0, 0, _this.canvas.width, _this.canvas.height);

                requestAnimFrame(function(){
                    render();
                });
            }
        };

        render();
    },

    stop: function(){
        if(! this.stopped){
            this.callback && this.callback();
        }
        this.stopped = 1;
        
    },

    step: function(timeCount){
        var newImgData = this.ctx.createImageData(this.canvas.width, this.canvas.height);

        var data = this.imgData.data;
        var width = this.imgData.width;
        var height = this.imgData.height;

        var newData = newImgData.data;

        var calDot = function(x, y, ox, oy){
            /*
            var theat = Math.random() * Math.PI * 2;
            var t = 10;
            var newX = x + t * Math.cos(theat);
            //var newX = x;
            var newY = y + t * Math.sin(theat);
            return [Math.round(newX), Math.round(newY)];
            */

            var newX = x + Math.random() * 2 - 1;
            var newY = y + Math.random() * (maxY - oy) / 4;

            return [Math.round(newX), Math.round(newY)];
        };

        var copy = function(oldDot, newDot){
            var newX = newDot[0];
            var newY = newDot[1];

            if(newX >= width){
                return;
            }

            var newI = (newY * width + newX) * 4;

            newData[newI] = dot[2];
            newData[newI + 1] =  dot[3];
            newData[newI + 2] = dot[4];
            newData[newI + 3] =  dot[5];
            
        };


        /*
        for(var y = 0; y < height; y ++){
            for(var x = 0; x < width; x ++){

                var i = (y * width + x) * 4;
                
                if(data[i] + data[i + 1] + data[i + 2] + data[i + 3] > 0){
                    var xy = calDot(x, y);
                    copy([x, y], xy);
                }
            }
        }
        */

        var maxY = 130 + (timeCount / 2);
        // 从下往上扫
        for(var d = this.hasInfoDot.length - 1; d > - 1; d --){
            var dot = this.hasInfoDot[d];
            var x = dot[0];
            var y = dot[1];
            var originY = y;
            var originX = x;


            // 找出现在点对应的x,y
            var mapId = [x, y].join("_");

            // 如果存在
            if(this.infoDotCurrDotMap[mapId]){
                var currDot = this.infoDotCurrDotMap[mapId];

                x = currDot[0];
                y = currDot[1];

            // 如果不存在使用现在的x,y
            }else{
            }

            if(y > height){
                continue;
            }

            // 计算新的x,y，并加入进去
            var xy;
            if(originY > maxY){
                xy = [originX, originY];
            }else{
                xy = calDot(x, y, originX, originY);
            }

            this.infoDotCurrDotMap[mapId] = xy;

            var newX = xy[0];
            var newY = xy[1];

            //复制操作
            copy(dot, xy);
            //copy(dot, [newX, newY + 1]);
            //copy(dot, [newX, newY - 1]);
            
            if(originY >= this.maxOriginY){
                if(newY > height){
                    this.stop();
                }
            }
        }

        this.ctx.putImageData(newImgData, 0, 0);
    },

    init: function(word, introWord, callback){
        this.word = word;
        this.introWord = introWord;
        this.callback = callback;

        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = 400;
        this.canvas.height = 300;

        this.drawFont();

    }
};
