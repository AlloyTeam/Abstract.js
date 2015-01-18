var RelationModel = Model.Class("BaseModel", {
    type: "RelationModel",

    constructor: function(){
    },

    setActive: function(opt){
        this.onactive = opt;
    },

    setUnactive: function(opt){
        this.onactive = opt;
    }
    
});
