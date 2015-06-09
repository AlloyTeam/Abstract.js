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
                if(! item.feeded){
                    item.rock(eventName);
                }
            });
        },

        show: function(){
            this.children.map(function(item){
                item.show();
            });
        },

        hide: function(){
            this.children.map(function(item){
                item.hide();
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
        },

        refresh: function(){
            this.children.map(function(item){
                item.refresh();
            });

            this.callSuperMethod("refresh");
        },

        reset: function(){
            this.children.map(function(item){
                item.reset();
            });

            this.callSuperMethod("reset");
        }
    });

    Model.external("PageModel", PageModel);
})();
