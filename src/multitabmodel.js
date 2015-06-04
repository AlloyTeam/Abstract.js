;(function(){
    var $ = Model.$;
    var MultitabModel = Model.Class("MutexModel", {
        constructor: function(){
            this.mutexModel = new MutexModel();

            this.selectorMap = {};
        },
        active: function(e){
            this.mutexModel.rock();
        },

        add: function(selector, model){
            this.mutexModel.add(model);

            this.selectorMap[selector] = model;

            var fuse = "multitab_" + selector;
            model.addFuse(fuse);

            model.addEventListener('actived', function(e){
                this.show();
            });

            model.addEventListener('unactived', function(e){
                console.log("unactived");
                this.hide();
            });

            $("body").on("click", selector, function(){
                Model.trigger(fuse);
            });
        },

        initChild: function(selector){
            
            if(this.selectorMap[selector]){
                this.mutexModel.initChild(this.selectorMap[selector]);
            }
        }
    });

    Model.external("MultitabModel", MultitabModel);
})();
