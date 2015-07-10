;(function(){

    /**
     * 如果父类有使用父类的属性 即是继承属性
     * 
     */
    var $ = Model.$;

    var _containerCountInfo = Model.containerCountInfo;

    var acceptOpt = ['tmpl', 'el', 'data', 'fuse', 'myData', 'onreset', 'comment', 'helper', 'name', 'active', 'unactive'];
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

        setData: function(data){
            this.data = data;
        },

        addFuse: function(fuse){
            this.fuse = fuse;
        },
        constructor: function(opt){
            // private method
            // 这些都会被子类重新初始化一遍
            this._fuse = "";

            var getId = function(){
                return "abstract_" + ~~(100000 * Math.random()); 
            };

            if(opt){
                for(var i = 0; i < this.acceptOpt.length; i ++){
                    var item = this.acceptOpt[i];
                    if(opt[item]){
                        this[item] = opt[item];
                    }
                }
            }

            if(opt && opt.el){
                var id = $(opt.el).attr("id");

                if(id){
                }else{
                    id = getId();
                    $(opt.el).attr("id", id);
                }

                if(_containerCountInfo[id]){
                    _containerCountInfo[id] ++;
                }else{
                    _containerCountInfo[id] = 1;
                }
            }


            // 设置初始化参数 private method
            this.eventHandler = {
            };

            this._ = {};

            if(! this.hasOwnProperty('myData')){
                this.myData = {};
            }


            this.children = [];
            this.parent = null;

            var _this = this;
            this.addEventListener("reset", function(e){
                _this.onreset && _this.onreset();
            });
        },

        // 增加model上去
        add: function(model){
            if(typeof model === "string"){
                if(model.indexOf(".")){
                    var pos = model.lastIndexOf(".");

                    var moduleName = model.substr(0, pos);
                    var name = model.substr(pos + 1);

                    var loadModel = new LoadModel({
                        moduleName: moduleName,
                        name: name
                    });

                    // 将这种延时加载的模型增加进去
                    this.children.push(model);
                }else{
                    console.warn("add load model error");
                }
            }else{
                // add parent
                model.parent = this;

                this.children.push(model);
            }
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

        replaceChild: function(model, newModel){
             for(var i = 0; i < this.children.length; i ++){
                if(this.children[i] === model){
                    this.children[i] = newModel;

                    break;
                }
            }

            newModel.parent = this;

            if(this.currChild === model){
                this.currChild = newModel;
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
        rock: function(eventName, data){
            var event = Model.createEvent({
                type: "beforeactived",
                target: this,
                name: eventName || 'anonymouse', 
                data: data
            });

            this.dispatchEvent(event);

            if(event.preventDefaulted){
                return;
            }


            var defer = Model.defer();

            this.status = "active";

 

            // active时的动作
            this.active(event);

            var event = Model.createEvent({
                type: "actived",
                target: this,
                name: eventName || 'anonymouse', 
                data: data
            });

            this.dispatchEvent(event);

        },

        stop: function(eventName){
            this.status = "unactive";

            // active时的动作
            this.unactive && this.unactive(event);


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
        dispatchEvent: function(event, data){
            var type = event.type;

            var _this = this;
            this.eventHandler[type] && this.eventHandler[type].map(function(item){
                item.call(_this, event, data);
            });

            // 如果可以穿播 继续传播
            if(event.bubble){
                this.parent && this.parent.dispatchEvent(event, data);
            }
        },

        addEventListener: function(type, handler, isCapture){
            if(! this.eventHandler[type]){
                this.eventHandler[type] = [];
            }

            this.eventHandler[type].push(handler);
        },

        info: function(msg){
            if(Model.debug){
                var args = [];
                var args = ["Model:", (this.comment || (typeof this.el === "string" ? this.el : this.el && this.el.selector)) + ":"];

                for(var i = 0; i < arguments.length; i ++){
                    args.push(arguments[i]);
                }

                console.info.apply(console, args);
            }
        },

        reset: function(){
            this.melt();

            this.onreset && this.onreset();

            var event = Model.createEvent({
                type: "reset",
                target: this,
                name: 'anonymouse'
            });

            this.dispatchEvent(event);
        },
        refresh: function(){
            var event = Model.createEvent({
                type: "refresh",
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
        },

        show: function(){
            if(this.el){
                $(this.el).show();
            }
        },

        hide: function(){
            if(this.el){
                $(this.el).hide();
            }
        },

        _resetPrivateFlag: function(){
        },

        _registerInnerMethod: function(arr, el){
            for(var i = 0; i < arr.length; i ++){
                var item = arr[i];


                if(! this[item] || (this[item] && ! this.hasOwnProperty(item))){
                    Object.defineProperty(this, item, function(item){
                        return {
                            set: function(value){
                                el[item] = value;
                            },

                            get: function(value){
                                if(typeof el[item] === "function"){
                                    return function(){
                                        return el[item].apply(el, arguments);
                                    };
                                }else{
                                    return el[item];
                                }
                            }
                        };
                    }(item));
                    /*
                    this[item] = function(item){
                        if(typeof el[item] === "function"){
                            return function(){
                                return el[item].apply(el, arguments);
                            };
                        }else{
                            return el[item];
                        }
                    }(item);
                    */
                }
            }
        },


        extend: function(opt){
            var func = function(){};

            func.prototype = this;

            var clone = new func();


            this._resetPrivateFlag.call(clone);

            for(var i in opt){
                if(typeof opt[i] !== undefined){
                    clone[i] = opt[i];
                }
            }

            clone.parent = null;

            clone.children = [];

            // 拷贝子元素
            for(var i = 0; i < this.children.length; i ++){
                clone.add(this.children[i].extend());
            }

            // 把el记下
            var getId = function(){
                return "abstract_" + ~~(100000 * Math.random()); 
            };

            if(clone.el){
                var id = $(clone.el).attr("id");

                if(id){
                }else{
                    id = getId();
                    $(clone.el).attr("id", id);
                }

                if(_containerCountInfo[id]){
                    _containerCountInfo[id] ++;
                }else{
                    _containerCountInfo[id] = 1;
                }
            }


            // @todo
            // 子元素间的feed关系还是要保留的

            return clone;
            
        },

        getPrivate: function(name){
            var _this = this;

            var priKey = "_" + name;

            pri = this._[priKey];
        },

        get: function(name){
            var _this = this;
            var priKey = "_" + name;

            if(! _this._[priKey]){
                _this._[priKey] = Model.createPrivate();
            }

            return _this._[priKey];
        },

        // 外放tab
        exportTab: function(name, onswitch){
             var key = "recieveModel" + name;

            var realizeKey = "realizeModel" + name;
            var _this = this;

            if (window[key] && typeof window[key] === "function") {
                //alert(selector); 
                window[key](name, this, onswitch);
            } else {
                window[realizeKey] = function(cb) {
                    cb(name, _this, onswitch);
                    delete window[realizeKey];
                };
            }
        },

        tell: function(somebody, something, dowhat) {
            var key = ["__", something, "__"].join("");

            // 如相定义了某个属性
            if (typeof this[something] !== "undefined") {
                this[key] = this[something];
            } else {}

            Object.defineProperty(this, something, {
                get: function() {
                    return this[key];
                },

                set: function(val) {
                    this[key] = val;

                    if (dowhat) {
                        dowhat.call(somebody, val);
                    } else {
                        somebody[something] = val;
                    }
                }
            });

        },

        watch: function(somebody, something, dowhat) {
            var key = ["__", something, "__"].join("");

            // 如相定义了某个属性
            if (typeof somebody[something] !== "undefined") {
                somebody[key] = somebody[something];
            } else {}

            var _this = this;

            Object.defineProperty(somebody, something, {
                get: function() {
                    return this[key];
                },

                set: function(val) {
                    this[key] = val;

                    if (dowhat) {
                        dowhat.call(_this, val);
                    } else {
                        _this[something] = val;
                    }
                }
            });

        },

        die: function(){
            this.dead = 1;
        }


    });

    Model.external("BaseModel", BaseModel);
})();
