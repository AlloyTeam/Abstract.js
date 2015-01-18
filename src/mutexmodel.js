var MutexModel = Model.Class("relationModel", {
    constructor: function(){
        // 激活事件对应map
        this._activeMap = {
        };
    },
    // mutex激活 其子元素根据相应名称激活
    onactive: function(eventName){
        var activeModel = this._activeMap[eventName];

        this.children.map(function(item){
            if(item === activeModel){
                item.rock(eventName);

            // 如果其他元素是处于激活状态 则使其处于非激活态
            // 否则不管
            }else if(item.status === "active"){
                item.stop(eventName);
            }
        });
    },

    onunactive: function(eventName){
        this.children.map(function(item){
            if(item.status === "active"){
                item.stop(eventName);
            }
        });
    },

    add: function(eventName, model){
        this._activeMap[eventName] = model;

        this.children.push(model);
    }
});
