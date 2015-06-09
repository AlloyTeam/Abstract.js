;(function(){
    var LinkModel = Model.Class("BaseModel", {
        constructor: function(opt){
            this.callSuper(opt);
        }
    });

    Model.external("LinkModel", LinkModel);
})();
