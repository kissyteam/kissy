/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 15 20:45
*/
/**
 * @fileOverview resizable support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("resizable", function (S, Node, Base, D, undefined) {

    var $ = Node.all,
        i,
        j,
        Draggable = D.Draggable,
        CLS_PREFIX = "ks-resizable-handler",
        horizontal = ["l", "r"],
        vertical = ["t", "b"],
        hcNormal = {
            "t":function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT) {
                var h = getBoundValue(minH, maxH, oh - diffT),
                    t = ot + oh - h;
                return [0, h, t, 0]
            },
            "b":function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT) {
                var h = getBoundValue(minH, maxH, oh + diffT);
                return [0, h, 0, 0];
            },
            "r":function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL) {
                var w = getBoundValue(minW, maxW, ow + diffL);
                return [w, 0, 0, 0];
            },
            "l":function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL) {
                var w = getBoundValue(minW, maxW, ow - diffL),
                    l = ol + ow - w;
                return [w, 0, 0, l]
            }
        };


    for (i = 0; i < horizontal.length; i++) {
        for (j = 0; j < vertical.length; j++) {
            (function (h, v) {
                hcNormal[ h + v] = hcNormal[ v + h] = function () {
                    return merge(hcNormal[h].apply(this, arguments),
                        hcNormal[v].apply(this, arguments));
                };
            })(horizontal[i], vertical[j]);
        }
    }
    function merge(a1, a2) {
        var a = [];
        for (i = 0; i < a1.length; i++) {
            a[i] = a1[i] || a2[i];
        }
        return a;
    }

    function getBoundValue(min, max, v) {
        return Math.min(Math.max(min, v), max);
    }

    function _uiSetHandlers(e) {
        var self = this,
            v = e.newVal,
            dds = self.dds,
            node = self.get("node");
        self.destroy();
        for (i = 0; i < v.length; i++) {
            var hc = v[i],
                el = $("<div class='" +
                    CLS_PREFIX +
                    " " + CLS_PREFIX +
                    "-" + hc +
                    "'></div>")
                    .prependTo(node, undefined),
                dd = dds[hc] = new Draggable({
                    node:el,
                    cursor:null
                });
            dd.on("drag", _drag, self);
            dd.on("dragstart", _dragStart, self);
        }
    }

    function _dragStart() {
        var self = this,
            node = self.get("node");
        self._width = node.width();
        self._top = parseInt(node.css("top"));
        self._left = parseInt(node.css("left"));
        self._height = node.height();
    }

    function _drag(ev) {
        var self = this,
            node = self.get("node"),
            dd = ev.target,
            hc = _getHandlerC(self, dd),
            ow = self._width,
            oh = self._height,
            minW = self.get("minWidth"),
            maxW = self.get("maxWidth"),
            minH = self.get("minHeight"),
            maxH = self.get("maxHeight"),
            diffT = ev.top - dd.startNodePos.top,
            diffL = ev.left - dd.startNodePos.left,
            ot = self._top,
            ol = self._left,
            pos = hcNormal[hc](minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL),
            attr = ["width", "height", "top", "left"];
        for (i = 0; i < attr.length; i++) {
            if (pos[i]) {
                node.css(attr[i], pos[i]);
            }
        }
    }

    function _getHandlerC(self, dd) {
        var dds = self.dds;
        for (var d in dds) {
            if (dds[d] == dd) {
                return d;
            }
        }
        return 0;
    }

    /**
     * Make a element resizable.
     * @class
     * @extends Base
     * @name Resizable
     */
    function Resizable(cfg) {
        var self = this,
            node;
        Resizable.superclass.constructor.apply(self, arguments);
        self.on("afterHandlersChange", _uiSetHandlers, self);
        node = self.get("node");
        self.dds = {};
        if (node.css("position") == "static") {
            node.css("position", "relative");
        }
        _uiSetHandlers.call(self, {
            newVal:self.get("handlers")
        });
    }

    S.extend(Resizable, Base,
        /**
         * @lends Resizable#
         */
        {
            /**
             * make current resizable 's node not resizable.
             */
            destroy:function () {
                var self = this,
                    dds = self.dds;
                for (var d in dds) {
                    if (dds.hasOwnProperty(d)) {
                        dds[d].destroy();
                        dds[d].get("node").remove();
                        delete dds[d];
                    }
                }
            }
        }, {
            ATTRS:/**
             * @lends Resizable#
             */
            {
                /**
                 * KISSY Node to be resizable.
                 * @type Node
                 */
                node:{
                    setter:function (v) {
                        return $(v);
                    }
                },
                /**
                 * Minimum width can current node resize to.
                 * @type Number
                 */
                minWidth:{
                    value:0
                },
                /**
                 * Minimum height can current node resize to.
                 * @type Number
                 */
                minHeight:{
                    value:0
                },
                /**
                 * Maximum width can current node resize to.
                 * @type Number
                 */
                maxWidth:{
                    value:Number.MAX_VALUE
                },
                /**
                 * Maximum height can current node resize to.
                 * @type Number
                 */
                maxHeight:{
                    value:Number.MAX_VALUE
                },
                /**
                 * Enumeration of directions can current node resize to.
                 * Directions:
                 * "t": top.
                 * "tr": top-right.
                 * "r": right.
                 * "b": bottom.
                 * "l": left.
                 * "tl": top-left.
                 * "bl": bottom-left.
                 * "br": bottom-right.
                 * @type String[]
                 */
                handlers:{
                    // t,tr,r,br,b,bl,l,tl
                    value:[]
                }
            }
        });

    return Resizable;

}, { requires:["node", "base", "dd"] });
