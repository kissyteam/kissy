/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:28
*/
/**
 * @ignore
 * @fileOverview resizable support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("resizable", function (S, Node, RichBase, DD, undefined) {

    var $ = Node.all,
        i,
        j,
        Draggable = DD.Draggable,
        CLS_PREFIX = "resizable-handler",
        horizontal = ["l", "r"],
        vertical = ["t", "b"],
        ATTRS_ORDER = ["width", "height", "top", "left"],
        hcNormal = {
            "t": function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT) {
                var h = getBoundValue(minH, maxH, oh - diffT),
                    t = ot + oh - h;
                return [0, h, t, 0]
            },
            "b": function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT) {
                var h = getBoundValue(minH, maxH, oh + diffT);
                return [0, h, 0, 0];
            },
            "r": function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL) {
                var w = getBoundValue(minW, maxW, ow + diffL);
                return [w, 0, 0, 0];
            },
            "l": function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL) {
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

    function createDD(self) {
        var dds = self['dds'],
            node = self.get('node'),
            handlers = self.get('handlers'),
            prefixCls = self.get('prefixCls'),
            prefix = prefixCls + CLS_PREFIX;
        for (i = 0; i < handlers.length; i++) {
            var hc = handlers[i],
                el = $("<div class='" +
                    prefix +
                    " " + prefix +
                    "-" + hc +
                    "'></div>")
                    .prependTo(node, undefined),
                dd = dds[hc] = new Draggable({
                    node: el,
                    cursor: null
                });
            (function (hc, dd) {
                dd.on("drag", function (ev) {
                    var node = self.get('node'),
                        dd = ev.target,
                        ow = self._width,
                        oh = self._height,
                        minW = self.get("minWidth"),
                        maxW = self.get("maxWidth"),
                        minH = self.get("minHeight"),
                        maxH = self.get("maxHeight"),
                        diffT = ev.top - dd.get('startNodePos').top,
                        diffL = ev.left - dd.get('startNodePos').left,
                        ot = self._top,
                        ol = self._left,
                        pos = hcNormal[hc](minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL);
                    for (i = 0; i < ATTRS_ORDER.length; i++) {
                        if (pos[i]) {
                            node.css(ATTRS_ORDER[i], pos[i]);
                        }
                    }
                    self.fire('resize', {
                        handler: hc,
                        dd: dd
                    });
                });
                dd.on("dragstart", function () {
                    self._width = node.width();
                    self._top = parseInt(node.css("top"));
                    self._left = parseInt(node.css("left"));
                    self._height = node.height();
                    self.fire('resizeStart', {
                        handler: hc,
                        dd: dd
                    });
                });
                dd.on("dragend", function () {
                    self.fire('resizeEnd', {
                        handler: hc,
                        dd: dd
                    });
                });
            })(hc, dd);
        }
    }

    /**
     * Make a element resizable.
     * @class KISSY.Resizable
     * @extends KISSY.Base
     */
    var Resizable = RichBase.extend({

        initializer: function () {
            this['dds'] = {};
        },

        _onSetNode: function () {
            createDD(this);
        },

        _onSetDisabled: function (v) {
            var dds = this['dds'];
            S.each(dds, function (d) {
                d.set('disabled', v);
            });
        },

        destructor: function () {
            var self = this,
                d,
                dds = self['dds'];
            for (d in dds) {
                dds[d].destroy();
                dds[d].get("node").remove();
                delete dds[d];
            }
        }

    }, {
        ATTRS: {
            /**
             * KISSY Node to be resizable.
             * Need to be positioned 'relative' or 'absolute'.
             * @cfg {KISSY.NodeList} node
             */
            /**
             * @ignore
             */
            node: {
                setter: function (v) {
                    return $(v);
                }
            },

            /**
             * css prefix for handler elements.
             * @cfg {String} prefixCls
             */
            /**
             * @ignore
             */
            prefixCls: {
                value: 'ks-'
            },

            /**
             * Whether disable current resizable.
             * @cfg {Boolean} disabled
             */
            /**
             * disable or enable current resizable.
             * @property disabled
             * @type {Boolean}
             */
            /**
             * @ignore
             */
            disabled: {},

            /**
             * Minimum width can current node resize to.
             * @cfg {Number} minWidth
             */
            /**
             * Minimum width can current node resize to.
             * @property minWidth
             * @type {Number}
             */
            /**
             * @ignore
             */
            minWidth: {
                value: 0
            },
            /**
             * Minimum height can current node resize to.
             * @cfg {Number} minHeight
             */
            /**
             * Minimum height can current node resize to.
             * @property minHeight
             * @type {Number}
             */
            /**
             * @ignore
             */
            minHeight: {
                value: 0
            },
            /**
             * Maximum width can current node resize to.
             * @cfg {Number} maxWidth
             */
            /**
             * Maximum width can current node resize to,
             * it can be changed after initialization,
             * for example: responsive design.
             * @property maxWidth
             * @type {Number}
             */
            /**
             * @ignore
             */
            maxWidth: {
                value: Number['MAX_VALUE']
            },
            /**
             * Maximum height can current node resize to.
             * @cfg {Number} maxHeight
             */
            /**
             * Maximum height can current node resize to.
             * @property maxHeight
             * @type {Number}
             */
            /**
             * @ignore
             */
            maxHeight: {
                value: Number['MAX_VALUE']
            },
            /**
             * directions can current node resize to.
             * @cfg {KISSY.Resizable.Handler} handlers
             */
            /**
             * @ignore
             */
            handlers: {
                // t,tr,r,br,b,bl,l,tl
                value: []
            }
        }
    });

    /**
     * Resizable handlers type.
     * @enum {String} KISSY.Resizable.Handler
     */
    Resizable.Handler = {
        /**
         * bottom
         */
        B: 'b',
        /**
         * top
         */
        T: 't',
        /**
         * left
         */
        L: 'l',
        /**
         * right
         */
        R: 'r',
        /**
         * bottom-left
         */
        BL: 'bl',
        /**
         * top-left
         */
        TL: 'tl',
        /**
         * bottom-right
         */
        BR: 'br',
        /**
         * top-right
         */
        TR: 'tr'
    };

    return Resizable;

}, { requires: ["node", "rich-base", "dd/base"] });
