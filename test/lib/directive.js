angular.module("directives", [])
.controller('textboxCtrl', ['$rootScope', function($rootScope){
    this.setCurrObject = function(boxData){
        $rootScope.currObject = boxData;

        $rootScope.currAniItem = null;

        if($rootScope.currItem){
            var animation = $rootScope.currItem.animation;
            
            var result = [];
            for(var i = 0; i < animation.length; i ++){
                if(animation[i].id == boxData.id){
                    result.push(animation[i]);
                }
            }

            if(result.length === 1){
                $rootScope.currAniItem = result[0];
            }
        }
        console.log($rootScope.currObject);

        $rootScope.$digest();
    };
}])
.filter('filterAniOptionOpt', function() {
  return function(name) {
        if(! name) return "";
        // 动画名称和选项用_连接起来  拿到相应的
        var subname = name.split("_");

        return subname && subname[1];
  };
})
.directive('textbox', function() {
  return {
    //require: '?ngModel',
    restrict: 'EA',
    controller: 'textboxCtrl',
    scope: {
      boxData: '=',
      currFocusItemData: "=",
      isFocus: "="
    },
    link: function(scope, element, attrs, ctrl) {
        scope.maskShow = 1;

        var editArea = element.find(".edit");

        if(scope.boxData.html){
            //iframeContentWindow.document.body.innerHTML = scope.boxData.html;
            //var placeholder = iframe.siblings(".placeholder");
            //placeholder.hide();
            editArea.html(scope.boxData.html);
        }

        scope.isEditing = 0;

        element.parent(".workitem").on("click", function(e){
            if($.contains(element[0], e.target)){

                ctrl.setCurrObject(scope.boxData);
            }else{
                scope.maskShow = 1;
            }

            scope.$digest();
        });

        var isResetContent = 0;

        element.on("mouseup", function(){
            if(scope.isFocus){
                scope.isEditing = 1;
                scope.maskShow = 0;

                isResetContent = 1;


                editArea.html("");
                myeditor.render(editArea[0]);
                myeditor.reset();
                setTimeout(function(){
                    myeditor.setContent(scope.boxData.html);

                    myeditor.addListener("contentChange", contentChangeHandler);
                    isResetContent = 0;

                }, 200);
                //myeditor.reset();
                
            }else{
                scope.isEditing = 0;
                scope.maskShow = 1;

                myeditor.removeListener("contentChange", contentChangeHandler);
            }
        });

        var contentChangeHandler = function(){
            if(scope.isFocus && ! isResetContent){
                var content = myeditor.getContent();

                scope.boxData.html = content;
            }
        };

        scope.myStyle = {
            left: scope.boxData.position[0] + "px",
            top: scope.boxData.position[1] + "px",
            width: scope.boxData.width + "px",
            height: scope.boxData.height + "px",
            'z-index': scope.boxData['z-index']
        };
    },
    template: "<div ng-style='myStyle' ng-class='isFocus ? \"focus\": \"\"' draggable class='inputBoxWrapper editObject draggable textObj' id='{{boxData.id}}'><div class='mask' ng-show='maskShow'></div><div class='edit'></div><div controller class='controller'></div><div class='placeholder' ng-show='! boxData.html'>文本框</div></div>"
  };
})
.directive('imgbox', function() {
  return {
    controller: "textboxCtrl",
    restrict: 'EA',
    scope: {
      boxData: '=',
      isFocus: "="
    },
    link: function(scope, element, attrs, ctrl) {
 

        scope.myStyle = {
            left: scope.boxData.position[0] + "px",
            top: scope.boxData.position[1] + "px",
            width: scope.boxData.width + "px",
            height: scope.boxData.height + "px",
            'z-index': scope.boxData['z-index']
        };

        element.parent(".workitem").on("click", function(e){
            if($.contains(element[0], e.target)){

                ctrl.setCurrObject(scope.boxData);
            }else{
            }
            scope.$digest();
        });


    },
    template: "<div ng-style='myStyle' draggable class='inputBoxWrapper imgObj draggable editObject' ng-class='isFocus ? \"focus\":\"\"' id='{{boxData.id}}'><img class='' src='{{boxData.pic_url}}' /><div controller class='controller'></div></div>"
  };
})
.directive("draggable", function(){
    return {
        restrict: "A",
        scope: {
            onDrag: "=",
            dragdata: "="
        },
        link: function(scope, element){
             var draggableFlag = 0, mouseLeft, mouseTop, originLeft, originTop, draggableMoveFlag = 0;
             var dx, dy;
             element.addClass("draggable");

             element.on("mousedown", function(e){
                draggableFlag = 1;

                mouseLeft = e.clientX;
                mouseTop = e.clientY;

                originLeft = parseInt($(this).css("left")) || 0;
                originTop = parseInt($(this).css("top")) || 0;

             });
             
             element.addClass("draggable");

              $(window).on("mousemove",  function(e){
                if(draggableFlag){
                   e.preventDefault();

                   dx = e.clientX - mouseLeft;
                   dy = e.clientY - mouseTop;

                   var l = originLeft + dx;
                   var t = originTop+ dy;

                   element.css({left: l + "px", top: t + "px"});
                   if(! (draggableMoveFlag || (Math.abs(dx) < 2 && Math.abs(dy) < 2))){
                        draggableMoveFlag = 1;
                    }

                    if(scope.dragdata){
                        scope.dragdata.position[0] = l;
                        scope.dragdata.position[1] = t;
                        scope.dragdata.moved = 1;

                        scope.onDrag && scope.onDrag();
                    }


                }


            });

            $(window)[0].addEventListener("mouseup", function(e){
                if(draggableFlag && draggableMoveFlag){
                    e.stopPropagation();
                }
                draggableFlag = 0;
                draggableMoveFlag = 0;

            }, true);

        }
    };
})
.directive("controller", function(){
    return {
        restrict: "A",
        link: function(scope, element){
             var controllerFlag = 0, mouseLeft, mouseTop, originWidth, originHeight, draggableMoveFlag = 0;
             var dx, dy;
             element.on("mousedown", function(e){
                controllerFlag = 1;

                mouseLeft = e.clientX;
                mouseTop = e.clientY;

                originWidth = parseInt($(this).parent().css("width"));
                originHeight = parseInt($(this).parent().css("height"));

                e.stopPropagation();

             });
             
             element.addClass("controller");

              $(window).on("mousemove",  function(e){
                if(controllerFlag){
                   e.preventDefault();

                   dx = e.clientX - mouseLeft;
                   dy = e.clientY - mouseTop;

                   var w = originWidth + dx;
                   var h = originHeight + dy;

                   element.parent().css({width: w + "px", height: h + "px"});

                   scope.boxData.width = w;
                   scope.boxData.height = h;
                 }

                });

                $(window)[0].addEventListener("mouseup", function(e){
                    if(controllerFlag){
                        e.stopPropagation();
                    }

                    controllerFlag = 0;
                }, true);


        }
    };
})

.controller('numberController', ['$rootScope', function($rootScope){
    this.update = function(){
        $rootScope.$digest();
    };
}])
.directive("inputnumber", function(){
    return {
        restrict: "A",
        controller: 'numberController',
        scope:{
            numberValue: "=",
            max: "=",
            min: "=",
            step: "=",
            label: "="
        },
        template: "<span class='inputvalue' ng-mousedown='mousedownhandler($event);'>{{numberValue}}</span><span class='numberlabel'>{{label}}</span>",
        link: function(scope, element, attrs, ctrl){


            var input_numberFlag = 0, input_numberMax = Number(scope.max), input_numberMin = Number(scope.min), input_numberStep = Number(scope.step), input_currentOrgin = '';
            var mouseTop;

            scope.mousedownhandler = function(e){

                var el = e.target;
                $(el).attr("contenteditable", "true");

                input_numberFlag = 1;
                mouseTop = e.clientY;

                input_currentOrgin = scope.numberValue;

                e.stopPropagation();
            };

            var dy;
            $(window).on("mousemove", function(e){
                if(input_numberFlag){
                    dy = e.clientY - mouseTop;

                    var stepStr = "" + input_numberStep;
                    var r;
                    if(stepStr.indexOf(".") > -1){
                        var dotLocation = stepStr.indexOf(".");
                        dotLocation = stepStr.length - dotLocation;
                        r = Math.pow(10, dotLocation - 1);
                    }else{
                        r = 1;
                    }
                    var value = input_currentOrgin - (dy / 4)  * input_numberStep; 
                    value = parseInt(value * r) / r;

                    if(value < input_numberMin) value = input_numberMin;
                    if(value > input_numberMax) value = input_numberMax;

                    scope.numberValue = Number(value);

                    ctrl.update();


                    e.preventDefault();
                }
            });

            $(window).on("mouseup", function(e){
                input_numberFlag = 0;
            });

        }
    };
});
