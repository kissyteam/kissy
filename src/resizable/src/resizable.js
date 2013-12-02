/**
 * @ignore
 * resizable support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var Base = require('base');
    var DD = require('dd');

    var $ = Node.all,
        i,
        j,
        Draggable = DD.Draggable,
        CLS_PREFIX = 'resizable-handler',
        horizontal = ['l', 'r'],
        vertical = ['t', 'b'],
        ATTRS_ORDER = ['width', 'height', 'top', 'left'],
        hcNormal = {
            't': function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL, preserveRatio) {
                var h = getBoundValue(minH, maxH, oh - diffT),
                    t = ot + oh - h,
                    w = 0;
                if (preserveRatio) {
                    w = h / oh * ow;
                }
                return [w, h, t, 0];
            },
            'b': function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL, preserveRatio) {
                var h = getBoundValue(minH, maxH, oh + diffT),
                    w = 0;
                if (preserveRatio) {
                    w = h / oh * ow;
                }
                return [w, h, 0, 0];
            },
            'r': function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL, preserveRatio) {
                var w = getBoundValue(minW, maxW, ow + diffL),
                    h = 0;
                if (preserveRatio) {
                    h = w / ow * oh;
                }
                return [w, h, 0, 0];
            },
            'l': function (minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL, preserveRatio) {
                var w = getBoundValue(minW, maxW, ow - diffL),
                    h = 0,
                    l = ol + ow - w;
                if (preserveRatio) {
                    h = w / ow * oh;
                }
                return [w, h, 0, l];
            }
        };

    for (i = 0; i < horizontal.length; i++) {
        for (j = 0; j < vertical.length; j++) {
            /*jshint loopfunc:true*/
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
        var dds = self.dds,
            node = self.get('node'),
            handlers = self.get('handlers'),
            preserveRatio,
            dragConfig = self.get('dragConfig'),
            prefixCls = self.get('prefixCls'),
            prefix = prefixCls + CLS_PREFIX;
        for (i = 0; i < handlers.length; i++) {
            var hc = handlers[i],
                el = $('<div class="' +
                    prefix +
                    ' ' + prefix +
                    '-' + hc +
                    '"></div>')
                    .prependTo(node, undefined),
                dd = dds[hc] = new Draggable(S.mix({
                    node: el,
                    cursor: null,
                    groups: false
                }, dragConfig));
            (function (hc, dd) {
                var startEdgePos;
                dd.on('drag', function (ev) {
                    var dd = ev.target,
                        ow = self._width,
                        oh = self._height,
                        minW = self.get('minWidth'),
                        maxW = self.get('maxWidth'),
                        minH = self.get('minHeight'),
                        maxH = self.get('maxHeight'),
                        diffT = ev.pageY - startEdgePos.top,
                        diffL = ev.pageX - startEdgePos.left,
                        ot = self._top,
                        ol = self._left,
                        region = {},
                        pos = hcNormal[hc](minW, maxW, minH, maxH,
                            ot, ol, ow, oh, diffT, diffL, preserveRatio);
                    for (i = 0; i < ATTRS_ORDER.length; i++) {
                        if (pos[i]) {
                            region[ATTRS_ORDER[i]] = pos[i];
                        }
                    }
                    self.fire('beforeResize', {
                        handler: hc,
                        dd: dd,
                        region: region
                    });
                });
                dd.on('dragstart', function () {
                    startEdgePos = dd.get('startMousePos');
                    preserveRatio = self.get('preserveRatio');
                    self._width = node.width();
                    self._top = parseInt(node.css('top'));
                    self._left = parseInt(node.css('left'));
                    self._height = node.height();
                    self.fire('resizeStart', {
                        handler: hc,
                        dd: dd
                    });
                });
                dd.on('dragend', function () {
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
    var Resizable = Base.extend({
        initializer: function () {
            this.dds = {};
            this.publish('beforeResize', {
                defaultFn: this._onBeforeResize
            });
        },

        _onBeforeResize: function (e) {
            this.get('node').css(e.region);
            this.fire('resize', {
                handler: e.hc,
                dd: e.dd,
                region: e.region
            });
        },

        _onSetNode: function () {
            createDD(this);
        },

        _onSetDisabled: function (v) {
            var dds = this.dds;
            S.each(dds, function (d) {
                d.set('disabled', v);
            });
        },

        destructor: function () {
            var self = this,
                d,
                dds = self.dds;
            for (d in dds) {
                dds[d].destroy();
                dds[d].get('node').remove();
                delete dds[d];
            }
        }
    }, {
        name: 'Resizable',

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
             * config for internal drag object
             * @cfg {Object} dragConfig
             */
            /**
             * @ignore
             */
            dragConfig: {

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
                value: Number.MAX_VALUE
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
                value: Number.MAX_VALUE
            },
            /**
             * Whether preserve width/height ratio when resizing
             * @cfg {Boolean} preserveRatio
             */
            /**
             * @ignore
             */
            preserveRatio: {
                value: false
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
});
