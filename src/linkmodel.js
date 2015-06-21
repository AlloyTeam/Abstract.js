;(function(){
    var LinkModel = Model.Class("BaseModel", {
        type: "LinkModel",
        constructor: function(opt){
            this.addAcceptOpt(['popBack', 'checkBack', 'newWindow']);
            this.callSuper(opt);
        },

        _popBack: function(){
            window.history.back();
        },

        _openUrl: function(url, isNewWindow){
            if(isNewWindow){
                window.open(url, "_blank");
            }else{
                window.location = url;
            }
        },

        active: function(e){
            var query = "";
            var param = this.param;

            if (typeof this.param === "function") {
                param = this.param.call(this);
            }

            if (this.popBack) {
                this._popBack();
            }

            if (param) {
                var tmp = [];

                for (var i in param) {
                    tmp.push(i + '=' + (param[i] || ""));
                }

                query = tmp.join("&");
            }

            var url;

            if (query) {
                url = this.url + "?" + query;
            } else {
                url = this.url;
            }

            if (url) {
                if (this.checkBack) {
                    var referer = document.referrer;

                    if (referer.indexOf(this.url) > -1) {
                        history.back();
                        return;
                    } else {}
                }

                if (this.newWindow) {
                    this._openUrl(url, true);
                } else {
                    this._openUrl(url);
                }
            }
        }
    });

    Model.external("LinkModel", LinkModel);
})();
