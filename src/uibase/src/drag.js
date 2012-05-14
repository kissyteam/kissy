/**
 * @fileOverview drag extension for position
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/drag", function (S) {

    /**
     * Drag extension class.
     * Make element draggable.
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
         * Current draggable element's handlers.
         * See {@link DD.Draggable#handlers}
         */
        handlers:{
            value:[]
        },
        /**
         * Whether current element is draggable.
         * @type Boolean
         */
        draggable:{value:true}
    };

    function dragExtAction(ev) {
        this.set("xy", [ev.left, ev.top]);
    }

    Drag.prototype = {

        _uiSetHandlers:function (v) {
            var d;
            if (v && v.length > 0 && (d = this.__drag)) {
                d.set("handlers", v);
            }
        },

        __bindUI:function () {
            var Draggable = S.require("dd/draggable"),
                d,
                self = this,
                el = self.get("el");
            if (self.get("draggable") && Draggable) {
                d = self.__drag = new Draggable({
                    node:el
                });
                d.on("drag", dragExtAction, self);
            }
        },

        _uiSetDraggable:function (v) {
            var self = this,
                d = self.__drag;
            if (!d) {
                return;
            }
            d.set("disabled", !v);
        },

        __destructor:function () {
            var d = this.__drag;
            d && d.destroy();
        }

    };
    return Drag;

});