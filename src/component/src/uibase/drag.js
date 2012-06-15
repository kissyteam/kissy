/**
 * @fileOverview drag extension for position
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/drag", function (S) {

    /**
     * @name Drag
     * @class
     * Drag extension class.
     * Make element draggable.
     * @memberOf Component.UIBase
     */
    function Drag() {
    }

    Drag.ATTRS =

    /**
     * @lends Component.UIBase.Drag
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
            var DD = S.require("dd") || {},
                Draggable = DD.Draggable,
                d,
                self = this,
                dragCfg = self.get("draggable"),
                el = self.get("el");
            if (dragCfg && Draggable) {
                if (dragCfg === true) {
                    dragCfg = {};
                }
                d = self.__drag = new Draggable({
                    node:el,
                    move:dragCfg.proxy
                });

                if (dragCfg.proxy) {
                    dragCfg.proxy.moveOnEnd = false;
                    d.on("dragend", function () {
                        var proxyOffset = p.get("proxyNode").offset();
                        el.css("visibility", "");
                        self.set("x", proxyOffset.left);
                        self.set("y", proxyOffset.top);
                    });
                    var p = self.__proxy = new DD.Proxy(dragCfg.proxy);
                    p.attachDrag(d);
                } else {
                    d.on("drag", dragExtAction, self);
                }

                if (dragCfg.scroll) {
                    var s = self.__scroll = new DD.Scroll(dragCfg.scroll);
                    s.attachDrag(d);
                }

            }
        },

        _uiSetDraggable:function (v) {
            var d = this.__drag;
            d && d.set("disabled", !v);
        },

        __destructor:function () {
            var self = this,
                p = self.__proxy,
                s = self.__scroll,
                d = self.__drag;
            d && d.destroy();
            s && s.destroy();
            p && p.destroy();
        }

    };
    return Drag;

});