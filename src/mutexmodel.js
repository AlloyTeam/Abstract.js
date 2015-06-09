;(function(){
    var MutexModel = Model.Class("RelationModel", {
        type: "MutexModel",
        constructor: function(opt){
             this.callSuper(opt);

            // 监听子元素的激活事件
            this.addEventListener("beforeactived", function(e){
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
                if(this._initChild){
                    if(typeof this._initChild === "number"){
                        this.currChild = this.children[this._initChild];
                    }else{
                        for(var i = 0; i < this.children.length; i ++){
                            if(this.children[i] === this._initChild){
                                this.currChild = this.children[i];
                                break;
                            }
                        }
                    }
                }else{
                    this.currChild = this.children[0];
                }

                this.currChild && this.currChild.rock(event);
            }
        },

        initChild: function(indexOrChildModel){
            this._initChild = indexOrChildModel;
        },

        show: function(){
            this.currChild.show();
        },

        hide: function(){
            this.currChild.hide();
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
            if(this.currChild){
                this.currChild.refresh();
                this.callSuperMethod("refresh");
            }
        },

        reset: function(){
            if(this.currChild){
                this.currChild.reset();
                this.callSuperMethod("resest");
            }
        }
    });

    Model.external("MutexModel", MutexModel);
})();
