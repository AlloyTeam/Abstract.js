/**
 * Model core file
 * @author dorsywang
 */
;(function(){
    var Model = {
        Class: function(parentClass, prototype){
            var parent = parentClass;
            var proto = prototype;

            if(typeof parentClass === "string"){
                parent = window[parentClass];

                if(! parent){
                    console.warn("Model:", parentClass, "not included, Please check your Model files!");

                    return {};
                }
            }

            if(! prototype){
                proto = parent;
            }

            if(parent && typeof parent.type === "undefined"){
                console.warn("Model:", parentClass, "is not illegal");
            }

            var constructor = proto.constructor || function(){};

            constructor.prototype = proto;

            if(parent){
                proto.__proto__ = parent;
            }

            return constructor;

        },

        trigger: function(eventName){
        }
    };
})();
