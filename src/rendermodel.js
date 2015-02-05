// a implatement for baseModel
;(function(){
    var RenderModel = Model.Class("BaseModel", {
        type: "RenderModel",
        getData: function(callback){
           var _this = this;
            var localData;

            // 如果之前有发过请求，则使用缓存的参数池中对应的参数，否则使用param方法构造参数
            // 这里保留的是cache原型
            var param = _this.paramCache[_this.cgiCount] || (typeof this.param == "object" && this.param) || this.param.call(this);


            if(this._args){
                var paramStr = JSON.stringify(param);

                for(var i = 0; i < this._args.length; i ++){
                    var j = i + 1;
                    paramStr = paramStr.replace(new RegExp("@param" + j, "g"), this._args[i] || "");
                }

                paramStr = paramStr.replace(/@param\d+/g, "");

                paramToReal = JSON.parse(paramStr);
            }


            var opt = {
                method: "POST",
                url: this.cgiName,
                data: paramToReal,
                success: function(res, isLocalRender){
                   
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
                        var key = (_this.cacheKey || getKey)(_this.cgiName, paramToReal);

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


                },

                error: function(res){
                    _this.info("ㄨerror request, with res↙");
                    _this.info("   ", res);

                    _this.paramCache[_this.cgiCount] = param;
                    _this.cgiCount ++;

                    _this.error && _this.error.call(_this, res, _this.cgiCount);
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
            if(!_this.noCache && _this.cgiCount == 0 && _this.isFirstRender){
                
                var key = (_this.cacheKey || getKey)(this.cgiName, paramToReal);

                localData = null;
                try{
                    localData = JSON.parse(window.localStorage.getItem(key) || "{}");
                }catch(e){
                    
                }

                if(localData && localData.result){

                    try{
                        this.info("has localData");
                        this.info("    start localData rendering");
                        opt.succ(localData, 1);
                    }catch(e){
                        Q.monitor(453668);
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
                            opt.succ(_this.dataCache[_this.cgiCount]);
                        }else{
                            opt.err(_this.dataCache[_this.cgiCount]);
                        }
                    };
                }else{
                    opt.succ(this.dataCache[_this.cgiCount]);
                }
            }
            //使用预加载数据模式的话，没有缓存也不发请求了，静待预加载数据返回即可
            else if(!this.usePreLoad){
                var defer = this.beforeRequest && this.beforeRequest();

                if(typeof defer === "boolean" && ! defer){
                    return;
                }

                this.info("start to request cgi, with request params↙");
                this.info("    cgi: " + opt.url);
                this.info("   ", paramToReal);

                DB.cgiHttp(opt);
            }
            else{
                _this.paramCache[_this.cgiCount] = param;
            }
        },

        render: function(el, isReplace){
            var _this = this;
            var Tmpl = Model._config.tmpl;

            var callback = function(data){
                if(_this.dead) return;

                if(_this.cgiCount === 1) {
                    _this.onreset && _this.onreset();
                    el.innerHTML = "";
                }

                _this.info("start to process data");

                _this.processData && _this.processData.call(_this, data, _this.cgiCount);

                var opt = {
                    tmpl: _this.tmpl,
                    helper: _this.helper,
                    el: _this.el
                };

                Tmpl(opt, data, isReplace);

                _this.cgiCount > 0 && (_this.scrollEnable = 1);

                if(_this.eventsBinded){
                }else{
                    _this.events && _this.events();

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
            };

            if(this.url){
                
            }else{
                if(this.data){
                }else{
                    this.data = {};
                }

                this.info("   data given");

                callback(this.data);
            }
        },
        active: function(){
            //console.log("renderModel rocked");
            if(! this.rendered){
                this.rendered = 1;

                var el = this.el;
                if(typeof el === "string"){
                    el = window.$ ? $(el) : document.querySelector(el);
                }

                this.render(el, 1);
            }
        },

        constructor: function(opt){
            this.addAcceptOpt(['complete', 'processData']);
            this.callSuper(opt);

            // 私有标志位
            this.rendered = 0;
            this.feedPool = [];

            // 可被对象继承的属性
            this.paramCache = [];
        }
    });

    Model.external("RenderModel", RenderModel);
})();
