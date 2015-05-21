/**
 * SodaRender
 * light Tml render engine
 * copyright @ Tencent AlloyTeam
 * License under MIT License
 * @author dorsywang
 * @email 314416946@qq.com
 * @blog http://www.dorsywang.com
 * @TeamBlog http://www.alloyteam.com
 */
(function(){var e=/\{\{([^\}]*)\}\}/g,t=function(e){return new RegExp("(^|\\s+)"+e+"(\\s+|$)","g")},n=function(e,n){if(!e.className){e.className=n;return}e.className.match(t(n))||(e.className+=" "+n)},r=function(e,n){e.className=e.className.replace(t(n),"")},i=function(e,t){var n=t.indexOf(".");if(n>-1){var r=t.substr(0,n);return t=t.substr(n+1),e[r]?i(e[r],t):""}return e[t]||""},s=function(e){},o=/[a-zA-Z_\$]+[\w\$]*/g,u=/"([^"]*)"|'([^']*)'/g,a=/\d+|\d*\.\d+/g,f=/[a-zA-Z_\$]+[\w\$]*(?:\s*\.\s*(?:[a-zA-Z_\$]+[\w\$]*|\d+))*/g,l=/\[([^\[\]]*)\]/g,c=/\.([a-zA-Z_\$]+[\w\$]*)/g,h=/[^\.|]([a-zA-Z_\$]+[\w\$]*)/g,p=function(){return"$$"+~~(Math.random()*1e6)},d=function(e,t){var e=e.split("|"),n=e[0]||"",r=e.slice(1);n=n.replace(u,function(e,n,r){var i=p();return t[i]=n||r,i});while(l.test(n))l.lastIndex=0,n=n.replace(l,function(e,n){return"."+d(n,t)});n=n.replace(f,function(e){return"getValue(scope,'"+e.trim()+"')"});var s=function(){var e=r.shift();if(!e)return;var e=e.split(":"),t=e.slice(1)||[],i=e[0]||"";g[i]&&(t.unshift(n),t=t.join(","),n="sodaFilterMap['"+i+"']("+t+")"),s()};s();var o=(new Function("getValue","sodaFilterMap","return function sodaExp(scope){ return "+n+"}"))(i,g);return o(t)},v=function(t,n){[].map.call([].slice.call(t.childNodes,[]),function(t){t.nodeType===3&&(t.nodeValue=t.nodeValue.replace(e,function(e,t){return d(t,n)})),t.attributes&&(/in/.test(t.getAttribute("soda-repeat")||"")?m["soda-repeat"].link(n,t,t.attributes):([].map.call(t.attributes,function(r){if(/^soda-/.test(r.name)){if(m[r.name]){var i=m[r.name];i.link(n,t,t.attributes)}}else r.value=r.value.replace(e,function(e,t){return d(t,n)})}),v(t,n)))})},m={},g={},y=function(e,t){m["soda-"+e]=t()},b=function(e,t){g[e]=t};b("date",function(e,t){return t}),y("repeat",function(){return{compile:function(e,t,n){},link:function(t,n,r){var s=n.getAttribute("soda-repeat"),o,u;if(!/in/.test(s))return;s=s.split("in"),o=s[0].trim(),u=s[1].trim();var a=i(t,u),f=n;for(var l=0;l<a.length;l++){var c=n.cloneNode(),h={$index:l};h[o]=a[l],h.__proto__=t,c.innerHTML=n.innerHTML,[].map.call(c.attributes,function(t){if(c.getAttribute("removed")==="removed")return;if(t.name.trim()!=="soda-repeat")if(/^soda-/.test(t.name)){if(m[t.name]){var n=m[t.name];n.link(h,c,c.attributes)}}else t.value=t.value.replace(e,function(e,t){return d(t,h)})}),c.getAttribute("removed")!=="removed"&&(v(c,h),n.parentNode.insertBefore(c,f.nextSibling),f=c)}n.parentNode.removeChild(n)}}}),y("if",function(){return{link:function(e,t,n){var r=t.getAttribute("soda-if"),i=d(r,e);i||(t.setAttribute("removed","removed"),t.parentNode&&t.parentNode.removeChild(t))}}}),y("class",function(){return{link:function(e,t,r){var i=t.getAttribute("soda-class"),s=d(i,e);s&&n(t,s)}}});var w=function(e,t){var n=document.createElement("div");n.innerHTML=e,v(n,t);var r=document.createDocumentFragment();r.innerHTML=n.innerHTML;var i;while(i=n.childNodes[0])r.appendChild(i);return r},E=function(e,t){};window.sodaRender=w,window.sodaFilter=b})()
/**
 * Model core file
 * @author dorsywang
 */
;(function(){
    var originInfo = console.info;
    var originLog = console.log;

    var _lastMsg = [];
    console.log = function(){
        _lastMsg = arguments;

        originLog.apply(console, arguments);
    };

    console.info = function(){
        var container = arguments[1];

        var currMsg;
        var args = Array.prototype.slice.call(arguments, 0);
        var currArgs = arguments;

        if(_lastMsg[0] && _lastMsg[0] === "Model:"){
            //currArgs[0] = currArgs[0].replace(/./g, " ");
            currArgs[0] = "♫";

            if(_lastMsg[1] && _lastMsg[1] === container){
                //currArgs[1] =  currArgs[1].replace(/./g, " ");
                currArgs[1] = " ↗";
            }else{
                //currArgs = Array.prototype.slice.call(arguments, 1);
            }
        }

        originInfo.apply(console, currArgs);
        _lastMsg = args;
    };

    var Event = function(opt){
        this.bubble = true;

        this.type = opt.type || "";
        this.name = opt.name;

        this.target = opt.target;
    };

    Event.prototype = {
        constructor: Event,
        
        stopPropagation: function(){
            this.bubble = false;
        }
    };

    var Model = {
        _config: {
            ajax: function(opt){
                if(window.$ && $.ajax){
                    $.ajax(opt);
                }else{
                    var xhr = new XMLHttpRequest();

                    var data = [];
                    if(opt.data){
                        for(var i in opt.data){
                            data.push(i + "=" + opt.data[i]);
                        }
                    }

                    data = data.join("&");

                    xhr.onload = function(){
                        var data = this.response;

                        var contentType = (this.getResponseHeader("Content-type") || '').toLowerCase();
                        var status = this.status;

                        if(status === 200 || status === 304){

                            if(/json/.test(contentType)){
                                data = JSON.parse(data);
                            }

                            opt.success(data);
                        }else{
                            opt.error(data);
                        }
                    };

                    xhr.open(opt.method, opt.url, true);
                    xhr.send(data);
                }
            },

            tmpl: function(opt, data, isReplace){
                var result = sodaRender(opt.tmpl || "", data);
                var el = opt.el;

                if(window.$){
                    el = $(el);
                }else{
                    if(typeof el === "string"){
                        el = document.querySelector(el);
                    }
                }

                if(el[0]){
                    el = el[0];
                }

                if(el instanceof HTMLElement){
                    if(isReplace){
                        el.innerHTML = "";
                    }

                    el && el.appendChild(result);
                }else{
                    console.info("Model: option el is not an HTMLElement");
                }
            },

            localKeyExclude: []
        },
        config: function(opt){
            if(opt.ajax){
                this._config.ajax = opt.ajax;
            }

            this._config.tmpl = opt.tmpl;
        },
        fuseMap: {
        },
        Class: function(parentClass, prototype){
            var parent = parentClass;
            var proto = prototype;

            if(typeof parentClass === "string"){
                parent = window[parentClass];

                if(! parent){
                    console.warn("Model:", parentClass, "not included, Please check your Model files!");

                    return {};
                }
            }


            if(proto && typeof parent !== "function"){
                console.warn("Model:", parentClass, "is not illegal");
            }


            if(! prototype){
                proto = parent;

                parent = null;
            }


            if(parent){
                // 这里会执行父的constructor
                parent = new parent();
                proto.__proto__ = parent;
                proto.super = parent;

                // 调父元素的构造方法
                proto.callSuper = function(){
                    var args = ['constructor'].concat([].slice.call(arguments, 0));
                    this.callSuperMethod.apply(this, args);
                };

                // 调用父类的方法
                proto.callSuperMethod = function(){
                    var method = [].slice.call(arguments, 0, 1);
                    var args = [].slice.call(arguments, 1) || [];

                    var _super = this.super;

                    if(_super){
                        this.super = _super.super;

                        (_super[method] || function(){}).apply(this, args);

                        this.super = _super;
                    }
                };
            }

            var constructor = function Model(){};

            // 如果自己定义了constructor 使用自己的constructor
            if(proto.hasOwnProperty("constructor")){
                constructor = proto.constructor;

            // 否则使用原型链继承的constructor
            }else{
                constructor = function Model(){
                    proto.constructor.apply(this, arguments);
                };

            }

            // 设置对象原型链上的constructor
            constructor.prototype = proto;

            return constructor;

        },

        trigger: function(eventName){
            if(this.fuseMap[eventName]){
                var event = this.createEvent({
                    target: this.fuseMap[eventName],
                    name: eventName,
                    type: "actived"
                });

                this.fuseMap[eventName].rock(event);
            }
        },

        external: function(name, obj){
            window[name] = obj;
        },

        createEvent: function(opt){
            return new Event(opt);
        },

        addFuse: function(fuse, model){
            this.fuseMap[fuse] = model;
        }
    };

    Model.external("Model", Model);

})();
;(function(){

    /**
     * 如果父类有使用父类的属性 即是继承属性
     * 
     */
    var acceptOpt = ['tmpl', 'el', 'data', 'fuse', 'myData', 'onreset'];
    var BaseModel = Model.Class({
        type: "BaseModel",

        get acceptOpt(){
            return acceptOpt;
        },

        addAcceptOpt: function(arr){
            acceptOpt = acceptOpt.concat(arr);
        },

        set fuse(value){
            Model.addFuse(value, this);

            this._fuse = value;
        },

        get fuse(){
            return this._fuse;
        },
        constructor: function(opt){
            // private method
            // 这些都会被子类重新初始化一遍
            this._fuse = "";

            if(opt){
                for(var i = 0; i < this.acceptOpt.length; i ++){
                    var item = this.acceptOpt[i];
                    if(opt[item]){
                        this[item] = opt[item];
                    }
                }
            }


            // 设置初始化参数 private method
            this.eventHandler = {
            };

            this.children = [];
            this.parent = null;

            var _this = this;
            this.addEventListener("reset", function(e){
                _this.onreset && _this.onreset();
            });
        },

        // 增加model上去
        add: function(model){
            // add parent
            model.parent = this;

            this.children.push(model);
        },

        del: function(model){
            for(var i = 0; i < this.children.length; i ++){
                if(this.children[i] === model){
                    break;
                }
            }

            this.children.splice(i, 1);
        },

        remove: function(){
            if(this.parent){
                this.parent.del(this);
            }
        },

        // 这里写处于激活态的时候动作
        // 用户可自定义 
        // 事件传播不在这里处理保证不受用户处理事件传播
        // 监听用户激活的事件
        active: function(event){
        },

        // onunactive时的动作
        unactive: function(event){
        },

        // rock就是主动使其处于激活态
        // 这里的src始终是自己
        // 并抛出激活事件
        // 这里triggerName
        rock: function(eventName){
            console.log(this.el, "rocked");
            this.status = "active";

 
            var event = Model.createEvent({
                type: "actived",
                target: this,
                name: eventName || 'anonymouse'
            });

            // active时的动作
            this.active(event);

            this.dispatchEvent(event);
        },

        stop: function(eventName){
            console.log(this.el, "unrocked");
            this.status = "unactive";

            var event = Model.createEvent({
                type: "unactived",
                target: this,
                name: eventName || 'anonymouse'
            });

            this.unactive(event);

            this.dispatchEvent(event);

        },

        // 事件传播
        // 事件由这里开始传播
        // 这里先只处理向上冒泡的情形
        dispatchEvent: function(event){
            var type = event.type;

            var _this = this;
            this.eventHandler[type] && this.eventHandler[type].map(function(item){
                item.call(_this, event);
            });

            // 如果可以穿播 继续传播
            if(event.bubble){
                this.parent && this.parent.dispatchEvent(event);
            }
        },

        addEventListener: function(type, handler, isCapture){
            if(! this.eventHandler[type]){
                this.eventHandler[type] = [];
            }

            this.eventHandler[type].push(handler);
        },

        info: function(msg){
            var args = [];
            var args = ["Model:", (this.comment || (typeof this.el === "string" ? this.el : this.el && this.el.selector)) + ":"];

            for(var i = 0; i < arguments.length; i ++){
                args.push(arguments[i]);
            }

            console.info.apply(console, args);
        },

        reset: function(){
            var event = Model.createEvent({
                type: "reset",
                target: this,
                name: 'anonymouse'
            });

            this.dispatchEvent(event);
        },

        freeze: function() {
            this.freezed = 1;
        },

        melt: function() {
            this.freezed = 0;
        }

    });

    Model.external("BaseModel", BaseModel);
})();
;(function(){
    var RelationModel = Model.Class("BaseModel", {
        type: "RelationModel",

        constructor: function(opt){
            this.callSuper(opt);
        },

        setActive: function(opt){
            this.onactive = opt;
        },

        setUnactive: function(opt){
            this.onactive = opt;
        }
        
    });

    Model.external("RelationModel", RelationModel);
})();
;(function(){
    var PageModel = Model.Class("RelationModel", {
        type: "PageModel",
        constructor: function(opt){
             this.callSuper(opt);
        },
        // mutex激活 
        // 激活对应的activeChild即可
        active: function(eventName){
            this.children.map(function(item){
                if(item.status !== "active"){
                    item.rock(eventName);
                }
            });
        },

        // 如果不激活了 不激活相应当前child即可
        unactive: function(eventName){
            this.children.map(function(item){
                if(item.status === "active" || ! item.status){
                    item.stop(eventName);
                }
            });

            /*
            for(var i = 0; i < this.children.length; i ++){
                var item = this.children[i];
            }

            if(this.currChild){
                this.currChild.stop(eventName);
            }
            */
        }
    });

    Model.external("PageModel", PageModel);
})();
;(function(){
    var MutexModel = Model.Class("RelationModel", {
        type: "MutexModel",
        constructor: function(opt){
             this.callSuper(opt);

            // 监听子元素的激活事件
            this.addEventListener("actived", function(e){
                // 如果子元素是直属子元素 则处理其他子元素关系
                var target = e.target;

                if(! target){
                    return;
                }

                if(target.parent === this){
                    if(this.currChild === this){
                    }else{
                        for(var i = 0; i < this.children.length; i ++){
                            var child = this.children[i];

                            if(child !== target){
                                child.stop();
                            }
                        }

                        this.currChild = target;
                    }
                }
            });
        },
        // mutex激活 
        // 激活对应的activeChild即可
        active: function(event){
            if(this.currChild){
                this.currChild.rock(event);

            // 如果不存currChild
            }else{
                this.currChild = this.children[0];

                this.currChild && this.currChild.rock(event);
            }
        },

        // 如果不激活了 不激活相应当前child即可
        unactive: function(eventName){
            this.children.map(function(item){
                if(item.status === "active" || ! item.status){
                    item.stop(eventName);
                }
            });

            /*
            for(var i = 0; i < this.children.length; i ++){
                var item = this.children[i];
            }

            if(this.currChild){
                this.currChild.stop(eventName);
            }
            */
        }
    });

    Model.external("MutexModel", MutexModel);
})();
// an implatement for baseModel
;(function(){

    /**
     * 根据cgi和参数生成对应的localStorge
     * 要去除类似随机数的参数
     */
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


            var opt = {
                method: "POST",
                url: this.url,
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
            if(!_this.noCache && _this.cgiCount == 0){
                
                var key = (_this.cacheKey || getKey)(this.url, paramToReal);

                localData = null;
                try{
                    localData = JSON.parse(window.localStorage.getItem(key) || "{}");
                }catch(e){
                    
                }

                if(localData){

                    try{
                        this.info("has localData");
                        this.info("    start localData rendering");
                        opt.success(localData, 1);
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

       _resetPrivateFlag: function(){
            // 私有标志位
            this.rendered = 0;
            this.feedPool = [];

            this.cgiCount = 0;
       },


       constructor: function(opt){
            this.addAcceptOpt(['complete', 'processData', 'error', 'url', 'param', 'noCache', 'events']);
            this.callSuper(opt);

            this._resetPrivateFlag();

            this.eventsBinded = 0;

            // 可被对象继承的属性
            this.paramCache = [];
            this.dataCache = [];

            var _this = this;

            this.addEventListener("reset", function(e){
                if(e.target === this){
                    this.cgiCount = 0;
                    this.melt(); 
                }
            });

        },

        extend: function(opt){
            if (!opt) {
                opt = {};
            }

            var func = function() {};

            var events = opt.events;

            func.prototype = this; //object;

            var clone = new func();

            this._resetPrivateFlag.call(clone);

            /*
            clone.feedPool = [];
            clone.cgiCount = 0;
            clone.dataCache = [];
            clone.isFirstDataRequestRender = 0;
            clone.isFirstRender = 1;
            clone._addedToModel = 0;
            clone.canScrollInMTB = 1;
            clone.dead = 0;
            */

            //如果重新定义了param 不使用缓存
            if (opt.param) {
                clone.paramCache = [];
            }

            for (var i in opt) {
                clone[i] = opt[i];
            }

            //如果定义了事件 就不使用原来的事件
            if (events) {
                clone.events = function() {
                    events && events.call(this);
                };

                clone.eventsBinded = 0;
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
        }
    });

    Model.external("RenderModel", RenderModel);
})();
var ScrollModel = Model.Class("RenderModel", {
});
