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
