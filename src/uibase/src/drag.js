/**
 * @fileOverview drag extension for position
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/drag", function (S) {


    /**
     * config drag options
     * @class
     * @memberOf UIBase
     */
    function Drag() {
    }

    Drag.ATTRS =

    /**
     * @lends UIBase.Drag
     */
    {
        /**
         * see {@link DD.Draggable#handlers}
         */
        handlers:{
            value:[]
        },
        /**
         * 是否可拖放
         * @type boolean
         */
        draggable:{value:true}
    };

    Drag.prototype = {

        _uiSetHandlers:function (v) {
            if (v && v.length > 0 && this.__drag) {
                this.__drag.set("handlers", v);
            }
        },

        __bindUI:function () {
            var Draggable = S.require("dd/draggable");
            var self = this,
                el = self.get("el");
            if (self.get("draggable") && Draggable) {
                self.__drag = new Draggable({
                    node:el
                });
            }
        },

        _uiSetDraggable:function (v) {

            var self = this,
                d = self.__drag;
            if (!d) {
                return;
            }
            if (v) {
                d.detach("drag");
                d.on("drag", self._dragExtAction, self);
            } else {
                d.detach("drag");
            }
        },

        _dragExtAction:function (offset) {
            this.set("xy", [offset.left, offset.top])
        },
        /**
         *
         */
        __destructor:function () {
            //S.log("DragExt __destructor");
            var d = this.__drag;
            d && d.destroy();
        }

    };
    return Drag;

});