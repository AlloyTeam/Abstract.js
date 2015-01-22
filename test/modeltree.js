angular.module("model", ["directives"])
.controller("main", function($scope, $timeout){
    $scope.models = [];
    $scope.lines = [];

    // 根据modelData给出每个元素的具体坐标
    var formatModelData = function(){
        //首先给出每model的坐标
        var models = [];
        var lines = [];

        var DHEIGHT = 100;
        var DWIDTH = 160;

        var calTopDot = function(node){
        };

        var calChildPos = function(node){
            var pos = node.position;

            // 上面的x点的坐标
            var px = pos[0];
            var py = pos[1];

            if(node.children.length){
                var length = node.children.length;

                var middlex = px;
                var middley = py + DHEIGHT;

                node.children.map(function(item, index){
                    if(! item.position || ! item.moved){
                        // 计算child点的坐标
                        var x = middlex + (index + 1 - (length + 1) / 2) * DWIDTH;
                        var y = middley;

                        item.position = [x, y];

                    }

                    if(! item.id){
                        item.id = "model_" + ~~ (Math.random() * 1E6);
                    }

                    models.push(item);

                    var style = {
                        'stroke-linejoin': 'round',
                        'stroke-width': '2'
                    };

                    if(item.status === "active"){
                        style.stroke = "Green";
                    }else if(item.status === "unactive"){
                        style.stroke = "Gray";
                    }else{
                        style['stroke-dasharray'] = "3";
                        style.stroke = "Gray";
                    }

                    // 计算线
                    lines.push({
                        start: pos,
                        end: item.position,
                        id: item.id,
                        style: style
                        
                    });

                    calChildPos(item);

                });
            }
        };

        if(! modelData.id){
            modelData.id = "model_" + ~~ (Math.random() * 1E6);
        }

        if(! modelData.position){
            modelData.position = [300, 100];
        }

        models.push(modelData);

        calChildPos(modelData);

        $scope.models = models;
        $scope.lines = lines;
    };

    var modelData = new PageModel();
    $scope.modelData = modelData;


    formatModelData();

    $scope.modelOnDrag = function(item){
        formatModelData();

        $scope.$digest();
    };

    $scope.focusItem = function(item){
        $scope.currItem = item;
    };

    $scope.add = function(model){
        if(window[model] && $scope.currItem){
            if($scope.currItem.type === "RenderModel"){
                showConfirm("无法对RenderModel增加节点模型");
                return;
            }

            if($scope.currItem.type === "BaseModel"){
                showConfirm("无法对BaseModel增加节点模型");
                return;
            }

            var newModel = new window[model];

            if($scope.currItem){
                $scope.currItem.add(newModel);

                formatModelData();
            }
        }
    };

    $scope.delModel = function(){
        $scope.currItem && $scope.currItem.remove();

        formatModelData();
    };

    $scope.rock = function(){
        if($scope.currItem){
            $scope.currItem.rock()

            formatModelData();
        }
    };

    var showConfirm = function(text){
        $scope.confirmStyle.opacity = 1;
        $scope.confirmTips = text;

        $timeout(function(){
            $scope.confirmStyle.opacity = 0;
        }, 2000);

    };

    $scope.confirmStyle = {
        opacity: 0
    };
});
