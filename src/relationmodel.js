;(function(){
    var RelationModel = Model.Class("BaseModel", {
        type: "RelationModel",

        constructor: function(opt){
            this.callSuper(opt);
        },

        setActive: function(opt){
            this.onactive = opt;
        },

        setUnactive: function(opt){
            this.onactive = opt;
        },

        get models(){
            return this.children;
        }
        
    });

    Model.external("RelationModel", RelationModel);
})();
