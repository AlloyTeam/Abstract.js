/**
 * Model core file
 * @author dorsywang
 */
;(function(){
    var originInfo = console.info;
    var originLog = console.log;
    var rnotwhite = /\S+/g;
    var classNameRegExp = function(className) {
        return new RegExp('(^|\\s+)' + className + '(\\s+|$)', 'g');
    };

    var hasClass =  function(el, className) {
        return el.className.search(classNameRegExp(className)) !== -1;
    };


    var _lastMsg = [];
    console.log = function(){
        _lastMsg = arguments;

        originLog.apply(console, arguments);
    };

    console.info = function(){
        if(Model.debug){
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
        }else{
            originInfo.apply(console, arguments);
        }
    };

    var PrivateVar = function(value){
        this._value = value;
    };

    PrivateVar.prototype = {
        constructor: PrivateVar,
        set: function(value){
            this._value = value;;

            return this;
        },

        get: function(){
            return this.value;
        },
        set value(v){
            console.warn("请使用set方法进行设置值的操作");
        },

        get value(){
            return this._value;
        },
    };

    var Event = function(opt){
        this.bubble = true;
        this.preventDefaulted = 0;

        this.type = opt.type || "";
        this.name = opt.name;

        this.target = opt.target;
    };

    Event.prototype = {
        constructor: Event,
        
        stopPropagation: function(){
            this.bubble = false;
        },

        preventDefault: function(){
            this.preventDefaulted = 1;
        }
    };


    var loadJSContent = function(path, callback){
        var xhr = new XMLHttpRequest();

        xhr.onload = function(){
            var data = this.response;

            callback && callback(data);
        };

        xhr.open("GET", path, true);

        xhr.send();
    };

    var Model = {
        containerCountInfo: {},
        _config: {
            debug: 0,
            multitab_event: "click",
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

                    xhr.open(opt.type || 'POST', opt.url, true);
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

                if(el instanceof Node){
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
            for(var i in opt){
                if(opt.hasOwnProperty(i) && opt[i]){
                    this._config[i] = opt[i];
                }
            }

            /*
            if(opt.ajax){
                this._config.ajax = opt.ajax;
            }

            this._config.tmpl = opt.tmpl;
            */
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

                        var returnVal = (_super[method] || function(){}).apply(this, args);

                        this.super = _super;

                        return returnVal;
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

        trigger: function(eventName, data){
            if(this.fuseMap[eventName]){
                this.fuseMap[eventName].rock(eventName, data);
            }
        },

        external: function(name, obj){
            window[name] = obj;
        },

        createEvent: function(opt){
            return new Event(opt);
        },

        createFuse: function(event, selector){
            var fuseName = "fuse" +  ~~ (Math.random() * 1E6);
            Model.$("body").on(event, selector, function(){
                Model.trigger(fuseName);
            });

            return fuseName;
        },

        addFuse: function(fuse, model){
            this.fuseMap[fuse] = model;
        },

        createPrivate: function(value){
            return new PrivateVar(value);
        },

        // @todo
        defer: function(){
            var d = {
                reject: function(data){
                },

                resolve: function(data){
                }
            };

            d.promise = {
                then: function(succFunc, ErrFunc){
                }
            };

            return d;
        },

        // 异步加载文件配置
        // {
        //      tab1: ['../sdf../sdf.js','../sdf/sd.js']
    //      }
        loadModule: function(config){
            this.loadModuleMap = config;
        },

        load: function(module, callback){
            if(Model._config.loadModule){
                Model._config.loadModule(module, callback);

                return;
            }
            
            if(this.loadModuleMap[module]){
                var fileContentPool = [];;
                var fileList = this.loadModuleMap[module];

                var checkAndRunFile = function(){
                    if(fileContentPool[0]){
                        firstContent = fileContentPool.shift();

                        var script = document.createElement("script");
                        script.innerHTML = firstContent;

                        document.body.appendChild(script);

                        checkAndRunFile();
                    }
                };


                for(var i = 0; i < fileList.length; i ++){
                    var file = fileList[i];

                    loadJSContent(file, function(i){
                        return function(data){
                            fileContentPool[i] = data;

                            checkAndRunFile();
                        };
                    }(i));
                }
                
            }else{
            }
        }
    };

    var $ = window.$ || function(selector){
            if(window.$){
                return window.$(selector);
            }

            if(typeof selector === "object" && selector.show && selector.attr){
                return selector;
            }


            var each = function(arr, func){
                for(var i = 0; i < arr.length; i ++){
                    var item = arr[i];

                    func && func(item, i);
                }
            }

            return function(){
                var el;
                if(typeof selector === "string"){
                    if(selector === "window"){
                        el = [window];
                    }else{
                        el = document.querySelectorAll(selector);
                    }
                }else{
                    if(!('length' in el)){
                        el = [el];
                    }
                }

                var pro = {
                    selector: selector,
                    html: function(str){
                        for(var i = 0; i < el.length; i ++){
                            el[i].innerHTML = str;
                        }
                    },

                    show: function(){
                        for(var i = 0; i < el.length; i ++){
                            var item = el[i];
                            item.style.display == "none" && (item.style.display = '');

                            if(getComputedStyle(item, '').getPropertyValue("display") == "none"){
                                item.style.display = defaultDisplay(item.nodeName)
                             }
                        }
                    },

                    hide: function(){
                        for(var i = 0; i < el.length; i ++){
                            el[i].style.display = "none";
                        }
                    },

                    on: function(name, selector, func){
                        if(typeof func === "undefined"){
                            each(el, function(item){
                                item.addEventListener(name, selector);
                            });
                        }else{
                            each(el, function(item){
                                item.addEventListener(name, function(e){
                                    var target = e.target;
                                    var matchedEl = $(selector);

                                    for(var i = 0; i < matchedEl.length; i ++){
                                        var matchedElitem = matchedEl[i];

                                        if(matchedElitem.contains(target)){
                                            func && func.call(matchedElitem, e);
                                        }
                                    }
                                });
                            });
                        }
                    },

                    attr: function(name, value){
                        if(typeof value === "undefined"){
                            return el && el[0] && el[0].getAttribute(name);
                        }else{
                            each(el, function(item){
                                item.setAttribute(name, value);
                            });
                        }
                    },

        
                   addClass: function(classNames) {
                        each(el, function (ele) {
                            classNames.match(rnotwhite).forEach(function (cn) {
                                if (!hasClass(ele, cn)) {
                                    ele.className += ' ' + cn;
                                }
                            });
                        });

                        return this;
                    },
                    removeClass: function(classNames) {
                        each(el, function (ele) {
                            classNames.match(rnotwhite).forEach(function (cn) {
                                ele.className = ele.className.replace(classNameRegExp(cn), ' ');
                            });
                        });

                        return this;
                    }
                    
                };

                for(var i in pro){
                    if(pro.hasOwnProperty(i)){
                        el[i] = pro[i];
                    }
                }

                return el;
            }();
    };

    $.os = $.os || (function(){
                        var ua = window.navigator.userAgent.toLowerCase();
                        var androidFlag = 0;
                        var iosFlag = 0;

                        if(/android/.test(ua)){
                            androidFlag = 1;
                        }else if(/ios|iphone|ipad|ipod|itouch/.test(ua)){
                            iosFlag = 1;
                        }else{
                        }

                        return {
                            ios: iosFlag,
                            android: androidFlag
                        };
                    })();
    Model.$ = $;

    Model.external("Model", Model);

})();
