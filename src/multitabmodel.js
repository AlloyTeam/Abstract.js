;(function(){
    var $ = Model.$;
    var containerCountInfo = Model.containerCountInfo;

    var MultitabModel = Model.Class("MutexModel", {
        type: "MultitabModel",
        get currModel(){
            return this.mutexModel.currChild;
        },
        constructor: function(opt){
             this.callSuper(opt);

            this.mutexModel = new MutexModel();

            this.selectorMap = {};
            this.tabHander = null;

            this.selectorSwitchInMap = {};
                    
            this.mutexModel.addEventListener('beforeactived', function(e){
                var smodel = e.target;

                if(/RenderModel|ScrollModel/.test(smodel.type)){

                    var id = $(smodel.el).attr("id");

                    if (containerCountInfo[id] > 1) {
                        $(smodel.el).html("");
                        smodel.reset();
                    } else {
                        // 如果请求过了
                        if (smodel.isFirstDataRequestRender > 0) {
                            smodel.show();

                            e.preventDefault();
                        } else {
                        }

                    }

                    // 干涉渲染模型的激活态行为
                    var target = e.target;
                }
            });

            var _this = this;
            this.addEventListener("beforeswitched", function(e, data){

                var model = _this.mutexModel.currChild;

                var switchType = e.name;

                var selector = (data && data.selector) || '';
                /*
                for(var i in _this.selectorMap){
                    if(_this.selectorMap[i] === model){
                        selector = i;

                        break;
                    }

                } 
                */

                
                if(selector){
                    _this.beforeTabHandler && _this.beforeTabHandler.call(_this, selector, switchType);
                }
            });

            this.addEventListener("switched", function(e){
                var model = _this.mutexModel.currChild;

                var switchType = e.name;

                var selector;
                for(var i in _this.selectorMap){
                    if(_this.selectorMap[i] === model){
                        selector = i;

                        $(i).addClass('active')
                            .addClass('selected');
                    }else{
                        $(i).removeClass('active')
                            .removeClass('selected');

                    }

                }

                
                if(selector){
                    _this.selectorSwitchInMap[selector] && _this.selectorSwitchInMap[selector].call(_this, selector, switchType);
                    _this.tabHander && _this.tabHander.call(_this, selector, switchType);
                }
            });

        },

        _resetPrivateFlag: function(){
            this.get("rocked").set(0);
        },
        active: function(e){
            var rocked = this.get("rocked");
            if(! rocked.value){
                this.dispatchEvent(Model.createEvent({
                    type: "beforeswitched",
                    target: this,
                    name: "init"
                }));
            }

            this.mutexModel.rock();

            // 如果当前为一个loadModel则加载回来才触发switch事件
            if(this.mutexModel.currChild.type === "LoadModel"){
                var _this = this;
                this.mutexModel.currChild.addEventListener("completed", function(e, realizeModel){
                    if(! rocked.value){
                        _this.dispatchEvent(Model.createEvent({
                            type: "switched",
                            target: _this,
                            name: "init"
                        }));

                        rocked.set(1);
                    }

                });

            }else{
                if(! rocked.value){
                    this.dispatchEvent(Model.createEvent({
                        type: "switched",
                        target: this,
                        name: "init"
                    }));

                    rocked.set(1);
                }
            }
        },

        add: function(selector, model, onswitchin){
            var fuse = "multitab_" + selector;
            var _this = this;

            if(typeof model === "string"){
                model = new LoadModel({
                    name: selector,
                    moduleName: model
                });

                // loadModel加载完成
                // 对于实现的model控制其显示逻辑
                model.addEventListener("completed", function(e, realizeModel, onswitchin){
                    realizeModel.addFuse(fuse);



                    realizeModel.addEventListener('actived', function(e){
                        this.show();
                    });

                    realizeModel.addEventListener('unactived', function(e){
                        this.hide();
                    });

                    _this.selectorMap[selector] = realizeModel;

                    if(onswitchin){
                        _this.selectorSwitchInMap[selector] = onswitchin;
                    }
                    
                });
            }else{
                model.addEventListener('actived', function(e){
                    this.show();
                });

                model.addEventListener('unactived', function(e){
                    this.hide();
                });

            }

            model.addFuse(fuse);

            this.mutexModel.add(model);


            this.selectorMap[selector] = model;

            if(onswitchin){
                this.selectorSwitchInMap[selector] = onswitchin;
            }

            this.selector


            this.bindSwitchEvent(selector);
         
        },

        bindSwitchEvent: function(selector){
            var _this = this;
            var fuse = "multitab_" + selector;

            // 切换事件绑定
            $("body").on(Model._config.multitab_event, selector, function(){
                _this.dispatchEvent(Model.createEvent({
                    type: "beforeswitched",
                    target: _this,
                    name: "switch"
                }), {selector: selector});

                Model.trigger(fuse, 'switch');

                _this.dispatchEvent(Model.createEvent({
                    type: "switched",
                    target: _this,
                    name: "switch"
                }));
            });
        },

        init: function(selector){
            
            if(this.selectorMap[selector]){
                this.mutexModel.initChild(this.selectorMap[selector]);
            }
        },

        ontabswitch: function(func){
            this.tabHander = func;
        },

        refresh: function(){
            this.mutexModel.currChild.refresh();
        },

        reset: function(){
            this.mutexModel.currChild.reset();
        },

        beforetabswitch: function(func){
            this.beforeTabHandler = func;
        }
    });

    Model.external("MultitabModel", MultitabModel);
})();
