;(function(){
    // 逐步代替scrollHandle
    // scrollHelper复制一份 便于model控制
    var preScrollTop = 0;
    var scrollHandlerMap = {};

    var $ = Model.$;

    var scrollHelper = {
        bindEvent: function(container, id, scrollToHalfCallback) {
            var scrollDom = container;
            if ($.os.ios) {
                if ($(scrollDom)[0] == document.body) {
                    scrollDom = window;
                }
            }

            $(scrollDom).on("scroll", function() {
                var preScrollTop = 0,
                    throatTimer;

                return function(e) {
                    window.clearTimeout(throatTimer);
                    throatTimer = window.setTimeout(onScroll, 200);

                    function onScroll() {
                        var self = this;
                        var container = e.target;
                        var scrollTop,
                            scrollHeight,
                            windowHeight,
                            loadStartValue = 300;

                        //android 和 ios 5以下版本
                        if (container == document) {
                            scrollTop = window.scrollY;
                            windowHeight = window.innerHeight;
                            scrollHeight = document.body.scrollHeight;
                        }
                        //ios 5+版本
                        else {
                            var style = window.getComputedStyle(container);
                            scrollTop = container.scrollTop;
                            windowHeight = parseInt(style.height) + parseInt(style.paddingTop) + parseInt(style.paddingBottom) + parseInt(style.marginTop) + parseInt(style.marginBottom);
                            scrollHeight = container.scrollHeight;
                        }

                        //滚动到距离屏幕底部N像素时进行加载，N取决于loadStartValue
                        if (scrollTop + windowHeight + loadStartValue >= scrollHeight) {
                            scrollToHalfCallback && scrollToHalfCallback(e);
                        }

                        preScrollTop = scrollTop;
                    }
                };
            }());

        },
        removeModel: function(model) {
            var scrollEl = model._scrollEl;
            if (scrollEl) {
                var el = scrollEl;
                if (typeof scrollEl == "string") {
                    el = $(scrollEl);
                }

                var id;
                if (el == window || el[0] == window || el.selector === "window") {
                    id = '__window__';
                } else {
                    id = el.attr("id");
                }


                if (el && el.length && id) {
                    for (var i = 0; i < scrollHandlerMap[id].length; i++) {
                        if (scrollHandlerMap[id] === model) {
                            break;
                        }
                    }

                    scrollHandlerMap[id].splice(i, 1);
                }
            }
        },

        addModel: function(model) {
            var scrollEl = model.scrollEl;
            var el = scrollEl;
            if (typeof scrollEl == "string") {
                el = $(scrollEl);
            }


            var id;
            if (el == window || el[0] == window || el.selector === "window") {
                id = '__window__';
            } else {

                id = el.attr("id");
                if (id) {} else {
                    id = "d_" + ~~(100000 * Math.random());
                    el.attr("id", id);
                }
            }


            if (scrollHandlerMap[id]) {
                scrollHandlerMap[id].push(model);
            } else {
                scrollHandlerMap[id] = [model];

                this.bindEvent(
                    el,
                    id,
                    function() {

                        scrollHandlerMap[id].map(function(item) {
                            if (item.type == "ScrollModel") {
                                if (!item.freezed && item.scrollEnable) {
                                    var event = Model.createEvent({
                                        type: "scrollToBottom",
                                        target: item,
                                        name: 'anonymouse'
                                    });

                                    item.dispatchEvent(event);
                                }
                            } else {

                                if (!item.freezed && item.currModel.type == "scrollModel" && !item.currModel.freezed && item.currModel.scrollEnable) {

                                    item.currModel.rock();
                                }
                            }
                        });
                    }
                );
            }

        }
    };

    var ScrollModel = Model.Class("BaseModel", {
        type: "ScrollModel",

        _resetPrivateFlag: function(){
            this.get("rendered").set(0);
        },

        extend: function(opt){
            var clone = this.callSuperMethod('extend', {scrollEl: this.scrollEl});

            clone.renderModel = this.renderModel.extend(opt);

            return clone;
        },
        constructor: function(opt){
            //this.addAcceptOpt(['scrollEl']);
            this.callSuper();
            this.scrollEl = opt.scrollEl || window;

            var scrollLock = this.get("scrollLock");

            this.renderModel = new RenderModel(opt);
            this.renderModel.active = function(){
                this.render(this.el);
            };

            this.renderModel.addEventListener("completed", function(e){
                scrollLock.set(0);
            });

            this.renderModel.addEventListener("errored", function(e){
                scrollLock.set(0);
            });

            this.addEventListener("scrollToBottom", function(e){
                if(! scrollLock.value){
                    scrollLock.set(1);

                    this.renderModel.rock();

                    e.stopPropagation();

                }
            });

            this.addEventListener("beforeactived", function(e){
                this.scrollEnable = 1;
            });

            // 以下方法调用元素方法
            
            this._registerInnerMethod(['hide', 'show', 'feed', 'isFirstDataRequestRender', 'el', 'renderContainer', 'beforeRequest', 'freeze', 'melt', 'onreset',  'reset', 'url', 'data', 'cgiCount'], this.renderModel);


        },

        refresh: function(){
            this.reset();
            this.renderModel.dataCache = [];
            this.renderModel.reset();

            this.rock();
        },

        active: function(e){
            // 如果第一次还要render
            var rendered = this.get("rendered");

            if(! rendered.value){
                // 加上去
                scrollHelper.addModel(this);


                rendered.set(1);
            }

            //this.renderModel.reset();
            this.renderModel.rock();


        },
        
        unactive: function(e){
            this.scrollEnable = 0;
        }
        
    });

    Model.external("ScrollModel", ScrollModel);
})();
