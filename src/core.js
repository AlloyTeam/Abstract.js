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

                        if(/json/.test(contentType)){
                            data = JSON.parse(data);
                        }

                        opt.success(data);
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
                    var _super = this.super;

                    if(_super){
                        this.super = _super.super;

                        _super.constructor.apply(this, arguments);

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
