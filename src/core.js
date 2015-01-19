/**
 * Model core file
 * @author dorsywang
 */
;(function(){
    var Event = function(opt){
        this.bubble = true;

        this.type = opt.type || opt.name || "";
        this.name = this.type;

        this.target = opt.target;
    };

    Event.prototype = {
        constructor: Event,
        
        stopPropagation: function(){
            this.bubble = false;
        }
    };

    var Model = {
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
        },

        external: function(name, obj){
            window[name] = obj;
        },

        createEvent: function(opt){
            return new Event(opt);
        }
    };

    Model.external("Model", Model);

})();
