// an implatement for baseModel
;(function(){

    /**
     * 根据cgi和参数生成对应的localStorge
     * 要去除类似随机数的参数
     */
    var elementDisplay = {};
    var defaultDisplay = function(nodeName) {
        var element, display;

        if (!elementDisplay[nodeName]) {
          element = document.createElement(nodeName);
          document.body.appendChild(element);

          display = getComputedStyle(element, '').getPropertyValue("display");
          element.parentNode.removeChild(element);
          display == "none" && (display = "block");
          elementDisplay[nodeName] = display;
        }

        return elementDisplay[nodeName]
    };

    var $ = Model.$;

    var getKey = function(cgiName, param){
        var o = {};

        for(var i in param){
            var localKeyExclude = Model._config.localKeyExclude || [];
            if(localKeyExclude.length){
                if(localKeyExclude.indexOf){
                    if(localKeyExclude.indexOf(i)){
                        continue;
                    }
                }
            }else{
                var flag = 0;
                for(var j = 0; j < localKeyExclude.length; j ++){
                    if(i == localKeyExclude[j]){
                        flag = 1;
                    }
                }

                if(flag){
                    continue;
                }
            }

            o[i] = param[i];
        }

        var key = cgiName + "_" + JSON.stringify(o);

        return key;
    };

    var normaliseEl = function(el){
        if(typeof el === "string"){
            el = window.$ ? $(el) : document.querySelectorAll(el);
        }

    };

    var RenderModel = Model.Class("BaseModel", {
        type: "RenderModel",
        getData: function(callback){
           var _this = this;
            var localData;

            // 如果之前有发过请求，则使用缓存的参数池中对应的参数，否则使用param方法构造参数
            // 这里保留的是cache原型
            var param = _this.paramCache[_this.cgiCount] || (typeof this.param == "object" && this.param) || (typeof this.param === "function" && this.param.call(this)) || {};
            var paramToReal = param;

            if(this._args){
                var paramStr = JSON.stringify(param);

                for(var i = 0; i < this._args.length; i ++){
                    var j = i + 1;
                    paramStr = paramStr.replace(new RegExp("@param" + j, "g"), this._args[i] || "");
                }

                paramStr = paramStr.replace(/@param\d+/g, "");

                paramToReal = JSON.parse(paramStr);
            }


            var success = function(res, isLocalRender){
                   
                    // isLocalRender标记是从localStroage中取到的数据 直接执行回调
                    if(isLocalRender){
                        callback(res);
                        return;
                    }
                    
                    // 更新此次的缓存cgi数据和请求参数数据
                    _this.dataCache[_this.cgiCount] = res;
                    _this.paramCache[_this.cgiCount] = param;

                    // cgi请求参数自增
                    _this.cgiCount ++;

                    // 如果是第一次从cgi请求的数据 则缓存数据到localStrage里面
                    if(_this.cgiCount == 1){
                        var key = (_this.cacheKey || getKey)(_this.url, paramToReal);

                        if(key){
                            try{
                                window.localStorage.setItem(key, JSON.stringify(res));
                            }catch(e){
                                window.localStorage.clear();
                                window.localStorage.setItem(key, JSON.stringify(res));
                            }
                        }
                    }

                    if(localData){
                        // 匹配这次数据
                        
                        /*
                        var checkDif = function(l, r){
                            for(var i in r){
                                if($.isArray(r[i])){
                                    if($.isArray(l[i]){
                                        for(var j = 0; j < r[i].length; j ++){
                                        }
                                    }
                                }
                            }
                        };
                        */

                        /*
                        for(var i = 0; i < res.length; i ++){
                        }
                        */
                    }

                    _this.info("complete request, with res↙");
                    _this.info("   ", res);


                    //执行回调
                    callback(res);
                };

                var opt = {
                    type: this.method || "POST",
                    url: this.url,
                    data: paramToReal,
                    success: function(res){
                        success(res);
                    },

                    error: function(res){
                        _this.info("ㄨerror request, with res↙");
                        _this.info("   ", res);

                        _this.paramCache[_this.cgiCount] = param;
                        _this.cgiCount ++;

                        _this.error && _this.error.call(_this, res, _this.cgiCount);

                         
                        var event = Model.createEvent({
                            type: "errored",
                            target: _this,
                            name: 'anonymouse'
                        });

                        _this.dispatchEvent(event);
                    }
                };


            //使用预加载数据相关逻辑
            if(this.usePreLoad && this.preLoadData){
                this.info("with preload Data");

                //取消预加载模式，方面model后面可以继续使用常规的加载模式
                this.usePreLoad = false;       

                //非正常预加载数据，走原有逻辑发cgi重试
                if(this.preLoadData.type != 'error' && this.preLoadData.retcode == 0){
                    //预加载数据模式的数据保存与渲染
                    opt.succ(this.preLoadData);
                    return;
                } 
                // else{
                    // 出错的话重新先走缓存，再走cgi拉的原有逻辑
                    // this.cgiCount = 0;
                    // this.isFirstRender = 1;
                // }
            }

            if(this.dead){
                return;
            }


            //如果是第一次渲染，且cgi也还没有发送请求 那么 使用缓存中数据
            if(!_this.noCache && _this.cgiCount == 0){
                
                var key = (_this.cacheKey || getKey)(this.url, paramToReal);

                localData = null;
                try{
                    if((window.localStorage.getItem(key) || '').trim()){
                        localData = JSON.parse(window.localStorage.getItem(key) || "null");
                    }
                }catch(e){
                    
                }

                if(localData){

                    try{
                        this.info("has localData");
                        this.info("    start localData rendering");
                        success(localData, 1);
                    }catch(e){
                    }
                }

                _this.isFirstRender = 0;

                this.localData = localData;

            }

            /*
            if(this.cgiCount === 0 && ! _this.isFirstRender){
                if(this.prefetch && !this._prefetchError){
                    if(this.dataCache[0]){
                        opt.succ(this.dataCache[_this.cgiCount]);
                    }
                }
            }
            */

            // 如果缓存中有数据 使用缓存数据 否则发送请求
            if(this.dataCache[_this.cgiCount]){
                if(this.dataCache[_this.cgiCount] === "@prefeching"){
                    this.dataCache[_this.cgiCount] = function(isError){

                        if(! isError){
                            opt.success(_this.dataCache[_this.cgiCount]);
                        }else{
                            opt.error(_this.dataCache[_this.cgiCount]);
                        }
                    };
                }else{
                    success(this.dataCache[_this.cgiCount]);
                }
            }
            //使用预加载数据模式的话，没有缓存也不发请求了，静待预加载数据返回即可
            else{
                var defer = this.beforeRequest && this.beforeRequest();

                if(typeof defer === "boolean" && ! defer){
                    return;
                }

                this.info("start to request cgi, with request params↙");
                this.info("    cgi: " + opt.url);
                this.info("   ", paramToReal);

                Model._config.ajax(opt);
            }
        },

        render: function(el, isReplace){
            // 模型被冻结了 就不再进行渲染
            if(this.freezed){
                return;
            }

            var _this = this;
            var Tmpl = Model._config.tmpl;

            el = $(el);

            var callback = function(data){
                if(_this.dead) return;

                if(_this.cgiCount === 1) {
                    _this.onreset && _this.onreset();
                    el.html("");
                }

                _this.info("start to process data");

                var returnVal;
                _this.processData && (returnVal = _this.processData.call(_this, data, _this.cgiCount));

                if(typeof returnVal === "undefined"){
                }else{
                    if(typeof returnVal === 'boolean' && ! returnVal){
                    }else{
                        data = returnVal;
                    }
                }

                var opt = {
                    tmpl: _this.tmpl,
                    helper: _this.helper,
                    el: _this.el
                };

                Tmpl(opt, data, isReplace);

                _this.cgiCount > 0 && (_this.scrollEnable = 1);

                if(_this.eventsBinded){
                }else{
                    _this.events && (typeof _this.events === "function" && _this.events());

                    if(_this.hasOwnProperty("eventsBinded")){
                        _this.eventsBinded = 1;
                    }else{
                        _this.__proto__.eventsBinded = 1;
                    }
                }

                _this.feedPool.map(function(item){
                    if (!item.noFeed) {
                        item.setFeedData(data, _this.cgiCount);
                        item.rock();
                    }
                });

                _this.info("start to complete data");

                _this.complete && _this.complete(data, _this.cgiCount);

                _this.isFirstDataRequestRender ++;

                _this.info("complete render");

 
                var event = Model.createEvent({
                    type: "completed",
                    target: _this,
                    name: 'anonymouse'
                });

                _this.dispatchEvent(event);
            };

            if(this.url){
                this.getData(callback);
            }else{
                if(this.data){
                }else{
                    this.data = {};
                }

                this.info("   data given↙");
                this.info("   ", this.data);

                callback(this.data);
            }
        },
        active: function(e){
            if(! this.freezed){
                this.render(this.el);
            }
        },

       _resetPrivateFlag: function(){
            // 私有标志位
            this.rendered = 0;
            this.feedPool = [];

            this.cgiCount = 0;
            this.dataCache = [];

            this.isFirstDataRequestRender = 0;

            this.melt();
       },


       constructor: function(opt){
            this.addAcceptOpt(['complete', 'processData', 'error', 'url', 'param', 'noCache', 'events', 'noRefresh', 'method', 'beforeRequest']);
            this.callSuper(opt);

            this._resetPrivateFlag();

            this.eventsBinded = 0;

            // 可被对象继承的属性
            this.paramCache = [];

            var _this = this;

        },

        reset: function(){
            this.cgiCount = 0;

            this.callSuperMethod("reset");
        },

        refresh: function(){
            if(this.noRefresh){
            }else{
                this.dataCache = [];
                this.reset();
                this.rock();
            }

            this.callSuperMethod("refresh");
        },

        extend: function(opt){
            var clone = this.callSuperMethod('extend', opt);

            var events = opt && opt.events;
            
            //如果定义了事件 就不使用原来的事件
            if (events) {
                clone.events = function() {
                    events && events.call(this);
                };

                clone.eventsBinded = 0;
            }

            if(opt && opt.param){
                clone.paramCache = [];
            }

            /*
            if (clone.el) {

                if (_containerCountInfo[clone.el]) {
                    _containerCountInfo[clone.el]++;
                } else {
                    _containerCountInfo[clone.el] = 1;
                }
            }
            */


            return clone;
        },

        feed: function(model){
            model.feeded = 1;
            this.feedPool.push(model);
        },

        unfeed: function(){
        },

        setFeedData: function(data, cgiCount) {
            this.data = data;
            this.cgiCount = cgiCount;
        },

        resetData: function(){
            this.dataCache = [];
            this.cgiCount = 0;

            this.onreset && this.onreset();
        },

        update: function(data){
            this.setData(data);

            this.rock();
        }


    });

    Model.external("RenderModel", RenderModel);
})();
