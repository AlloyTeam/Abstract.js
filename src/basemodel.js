var BaseModel = Model.Class({
    constructor: function(opt){
        this.status = "unactive";
    },

    // 增加model上去
    add: function(model){
        // add parent
        model.parent = this;

        this.children.push(model);
    },
    children: [],

    onactive: function(eventName){
    },

    onunactive: function(eventName){
    },

    // rock就是主动使其处于激活态
    // 如果其已于激活态 根据关系模型使其子模型处理激活态
    rock: function(eventName){
        this.status = "active";

        this.onactive && this.onactive(eventName);
    },

    stop: function(eventName){
        this.status = "unactive";

        this.onunactive && this.onunactive(eventName);
    }
});
