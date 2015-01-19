// a implatement for baseModel
;(function(){
    var RenderModel = Model.Class("BaseModel", {
        active: function(){
            //console.log("renderModel rocked");
        },

        constructor: function(opt){
            this.callSuper(opt);
            /*
            // 先把
            var super = this.super;
            this.super = super.super;

            this.super.constructor.apply(this, arguments);

            this.super = super;
            */
        }
    });

    Model.external("RenderModel", RenderModel);
})();
