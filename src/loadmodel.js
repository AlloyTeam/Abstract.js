;(function(){
    var $ = Model.$;
    // 生命周期只有一次
    // rock之后即脱离父元素
    // 被真正的model替代
    var LoadModel = Model.Class("BaseModel", {
        type: "LoadModel",
        // url name 
        constructor: function(opt){
            this.callSuper();

            this.moduleName = opt.moduleName;
            this.name = opt.name;
        },

        // 预先加载的逻辑
        load: function(callback){
            var name = this.name;
            // 先寻找是否有外放的tab
            var key = "recieveModel" + name;
            var realizeKey = "realizeModel" + name;
            var _this = this;

            var recieveFunc = function(name, model, onswitch) {
                if (name && model) {

                    // 替换自己
                    _this.parent && _this.parent.replaceChild(_this, model);


                    _this.dispatchEvent(Model.createEvent({
                        type: "completed",
                        target: _this,
                        name: "anonymouse"
                    }), model, onswitch);


                    window[key] = null;
                    delete window[key];

                    callback && callback(model);
                }
            };

            if (window[realizeKey]) {
                window[realizeKey](recieveFunc);
            } else {
                window[key] = recieveFunc;

                // 加载模快
                Model.load(this.moduleName, function(e){
                    
                });
            }            
        },
        active: function(e){
            var parent = this.parent;
            var _this = this;

            this.load(function(model){
                model.rock();

                // 检查父亲元素进行预先加载
                if(parent){
                    for(var i = 0; i < parent.children.length; i ++){
                        var item = parent.children[i];

                        if(item !== _this && item.type === "LoadModel"){
                            item.load();
                        }
                    }
                }

            });

            
        },

        unactive: function(e){
        }
    });

    Model.external("LoadModel", LoadModel);
})();

