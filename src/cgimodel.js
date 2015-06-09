;(function(){
    var CgiModel = Model.Class("RenderModel", {
        type: "CgiModel",
        constructor: function(opt){
            this.callSuper(opt);
        },

        noCache: 1,

        getData: RenderModel.prototype.getData,

        active: function(){
            var _this = this;

            this._args = arguments;

            this.getData(function(data) {
                _this.processData && _this.processData.call(_this, data, _this.cgiCount);
                _this.complete && _this.complete.call(_this, data, _this.cgiCount);
            });
        }
    });

    Model.external("CgiModel", CgiModel);

})();
