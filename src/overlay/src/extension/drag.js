/**
 * @ignore
 * @fileOverview drag extension for position
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/drag", function (S) {

    /**
     * @class KISSY.Overlay.Extension.Drag
     * Drag extension class. Make element draggable.
     */
    function Drag() {
    }

    Drag.ATTRS = {
        /**
         * Whether current element is draggable and draggable config.
         * @cfg {Boolean|Object} draggable
         *
         * for example:
         *      @example
         *      {
         *          proxy:{
         *              // see {@link KISSY.DD.Proxy} config
         *          },
         *          scroll:{
         *              // see {@link KISSY.DD.Scroll} config
         *          },
         *          constrain:{
         *              // see {@link KISSY.DD.Constrain} config
         *          },
         *      }
         */
        /**
         * @ignore
         */
        draggable: {
            setter: function (v) {
                if (v === true) {
                    return {};
                }
            },
            value: {}
        }
    };

    Drag.prototype = {

        _onSetDraggable: function (dragCfg) {
            var self = this,
                handlers,
                DD = S.require("dd/base"),
                Proxy,
                Scroll,
                Constrain,
                Draggable,
                scrollCfg,
                constrainCfg,
                p,
                d = self.__drag,
                c = self.__constrain,
                el = self.get("el");

            if (dragCfg && !d && DD) {

                Draggable = DD.Draggable;

                d = self.__drag = new Draggable({
                    node: el,
                    move: 1
                });

                if (dragCfg.proxy && (Proxy = S.require('dd/proxy'))) {
                    dragCfg.proxy.moveOnEnd = true;

                    p = self.__proxy = new Proxy(dragCfg.proxy).attachDrag(d);
                }

                d.on("dragend", function () {
                    var proxyOffset;
                    proxyOffset = el.offset();
                    self.set("x", proxyOffset.left);
                    self.set("y", proxyOffset.top);
                    // 存在代理时
                    if (p) {
                        el.css("visibility", "visible");
                    }
                });

                if ((scrollCfg = dragCfg.scroll) && (Scroll = S.require('dd/scroll'))) {
                    self.__scroll = new Scroll(scrollCfg).attachDrag(d);
                }

            }

            if (d) {
                d.set("disabled", !dragCfg);
            }

            if (dragCfg && d) {
                handlers = dragCfg.handlers;
                if (Constrain = S.require('dd/constrain')) {
                    if (constrainCfg = dragCfg.constrain) {
                        if (!c) {
                            c = self.__constrain = new Constrain().attachDrag(d);
                        }
                        c.set("constrain", constrainCfg);
                    } else {
                        if (c) {
                            c.set("constrain", false);
                        }
                    }
                }
                if (handlers && handlers.length > 0) {
                    d.set("handlers", handlers);
                }
            }
        },

        __destructor: function () {
            var self = this,
                p = self.__proxy,
                s = self.__scroll,
                c = self.__constrain,
                d = self.__drag;
            s && s.destroy();
            p && p.destroy();
            c && c.destroy();
            d && d.destroy();
        }

    };

    return Drag;

});