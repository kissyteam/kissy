/**
 * @ignore
 * dd support for kissy, dd objects central management module
 * @author yiminghe@gmail.com
 */
var util = require('util');
var Logger = require('logger');
var logger = Logger.getLogger('dd/ddm');
var Base = require('base');
var UA = require('ua'),
    $ = require('node').all,
    win = window,
    doc = win.document,
    $doc = $(doc),
    $win = $(win),
    ie6 = UA.ie === 6,
    MOVE_DELAY = 30,
    SHIM_Z_INDEX = 999999;

var adjustShimSize = util.throttle(function () {
    var self = this,
        activeDrag;
    if ((activeDrag = self.get('activeDrag')) && activeDrag.get('shim')) {
        self._shim.css({
            width: $doc.width(),
            height: $doc.height()
        });
    }
}, MOVE_DELAY);

/*
 垫片只需创建一次
 */
var activeShim = function (self) {
    //创造垫片，防止进入iframe，外面document监听不到 mousedown/up/move
    self._shim = $('<div ' +
        'style="' +
        //red for debug
        'background-color:red;' +
        'position:' + (ie6 ? 'absolute' : 'fixed') + ';' +
        'left:0;' +
        'width:100%;' +
        'height:100%;' +
        'top:0;' +
        'cursor:' + self.get('dragCursor') + ';' +
        'z-index:' +
        //覆盖iframe上面即可
        SHIM_Z_INDEX + ';' +
        '"><' + '/div>')
        .prependTo(doc.body || doc.documentElement)
        //0.5 for debug
        .css('opacity', 0);

    activeShim = showShim;

    if (ie6) {
        // ie6 不支持 fixed 以及 width/height 100%
        // support dd-scroll
        // prevent empty when scroll outside initial window
        $win.on('resize scroll', adjustShimSize, self);
    }

    showShim(self);
};


/*
 负责拖动涉及的全局事件：
 1.全局统一的鼠标移动监控
 2.全局统一的鼠标弹起监控，用来通知当前拖动对象停止
 3.为了跨越 iframe 而统一在底下的遮罩层
 */

/**
 * @class KISSY.DD.DDM
 * @singleton
 * @private
 * @extends KISSY.Base
 * Manager for Drag and Drop.
 */
var DDManger = Base.extend({
    /**
     * @ignore
     */
    addDrop: function (d) {
        this.get('drops').push(d);
    },

    /**
     * @ignore
     */
    removeDrop: function (d) {
        var self = this,
            drops = self.get('drops'),
            index = util.indexOf(d, drops);
        if (index !== -1) {
            drops.splice(index, 1);
        }
    },

    /**
     * 真正开始 drag
     * 当前拖动对象通知全局：我要开始啦
     * 全局设置当前拖动对象
     * @ignore
     */
    start: function (e, drag) {
        var self = this;
        self.setInternal('activeDrag', drag);
        // 真正开始移动了才激活垫片
        if (drag.get('shim')) {
            activeShim(self);
        }
        // avoid unnecessary drop check
        self.__needDropCheck = 0;
        if (drag.get('groups')) {
            _activeDrops(self);
            if (self.get('validDrops').length) {
                cacheWH(drag.get('node'));
                self.__needDropCheck = 1;
            }
        }
    },

    /**
     * @ignore
     */
    addValidDrop: function (drop) {
        this.get('validDrops').push(drop);
    },

    _notifyDropsMove: function (ev, activeDrag) {
        var self = this;
        var drops = self.get('validDrops'),
            mode = activeDrag.get('mode'),
            activeDrop = 0,
            oldDrop,
            vArea = 0,
            dragRegion = region(activeDrag.get('node')),
            dragArea = area(dragRegion);

        util.each(drops, function (drop) {
            if (drop.get('disabled')) {
                return undefined;
            }

            var a,
                node = drop.getNodeFromTarget(ev,
                    // node
                    activeDrag.get('dragNode')[0],
                    // proxy node
                    activeDrag.get('node')[0]);

            if (!node
            // 当前 drop 区域已经包含  activeDrag.get('node')
            // 不要返回，可能想调整位置
                ) {
                return undefined;
            }

            if (mode === 'point') {
                //取鼠标所在的 drop 区域
                if (inNodeByPointer(node, activeDrag.mousePos)) {
                    a = area(region(node));
                    if (!activeDrop) {
                        activeDrop = drop;
                        vArea = a;
                    } else {
                        // 当前得到的可放置元素范围更小，取范围小的那个
                        if (a < vArea) {
                            activeDrop = drop;
                            vArea = a;
                        }
                    }
                }
            } else if (mode === 'intersect') {
                //取一个和activeDrag交集最大的drop区域
                a = area(intersect(dragRegion, region(node)));
                if (a > vArea) {
                    vArea = a;
                    activeDrop = drop;
                }

            } else if (mode === 'strict') {
                //drag 全部在 drop 里面
                a = area(intersect(dragRegion, region(node)));
                if (a === dragArea) {
                    activeDrop = drop;
                    return false;
                }
            }
            return undefined;
        });

        oldDrop = self.get('activeDrop');
        if (oldDrop && oldDrop !== activeDrop) {
            oldDrop._handleOut(ev);
            activeDrag._handleOut(ev);
        }
        self.setInternal('activeDrop', activeDrop);
        if (activeDrop) {
            if (oldDrop !== activeDrop) {
                activeDrop._handleEnter(ev);
            } else {
                // 注意处理代理时内部节点变化导致的 out、enter
                activeDrop._handleOver(ev);
            }
        }
    },

    move: function (ev, activeDrag) {
        // chrome8: click 时 mousedown-mousemove-mouseup-click 也会触发 mousemove
        var self = this;

        // for drop-free draggable performance
        if (self.__needDropCheck) {
            self._notifyDropsMove(ev, activeDrag);
        }
    },

    /**
     * 全局通知当前拖动对象：结束拖动了！
     * @ignore
     */
    end: function (e) {
        var self = this,
            activeDrop = self.get('activeDrop');
        if (self._shim) {
            self._shim.hide();
        }
        _deActiveDrops(self);
        if (activeDrop) {
            activeDrop._end(e);
        }
        self.setInternal('activeDrop', null);
        self.setInternal('activeDrag', null);
    }
}, {
    ATTRS: {

        /**
         * cursor style when dragging,if shimmed the shim will get the cursor.
         * Defaults to: 'move'.
         * @property dragCursor
         * @type {String}
         */

        /**
         * @ignore
         */
        dragCursor: {
            value: 'move'
        },

        /**
         * currently active draggable object
         * @type {KISSY.DD.Draggable}
         * @readonly
         * @property activeDrag
         */
        /**
         * @ignore
         */
        activeDrag: {},

        /**
         * currently active droppable object
         * @type {KISSY.DD.Droppable}
         * @readonly
         * @property activeDrop
         */
        /**
         * @ignore
         */
        activeDrop: {},

        /**
         * an array of drop targets.
         * @property drops
         * @type {KISSY.DD.Droppable[]}
         * @private
         */
        /**
         * @ignore
         */
        drops: {
            valueFn: function () {
                return [];
            }
        },

        /**
         * a array of the valid drop targets for this interaction
         * @property validDrops
         * @type {KISSY.DD.Droppable[]}
         * @private
         */
        /**
         * @ignore
         */
        validDrops: {
            valueFn: function () {
                return [];
            }
        }
    }
});


function showShim(self) {
    // determine cursor according to activeHandler and dragCursor
    var ah = self.get('activeDrag').get('activeHandler'),
        cur = 'auto';
    if (ah) {
        cur = ah.css('cursor');
    }
    if (cur === 'auto') {
        cur = self.get('dragCursor');
    }
    self._shim.css({
        cursor: cur,
        display: 'block'
    });
    if (ie6) {
        adjustShimSize.call(self);
    }
}

function _activeDrops(self) {
    var drops = self.get('drops');
    self.setInternal('validDrops', []);
    if (drops.length) {
        util.each(drops, function (d) {
            d._active();
        });
    }
}

function _deActiveDrops(self) {
    var drops = self.get('drops');
    self.setInternal('validDrops', []);
    if (drops.length) {
        util.each(drops, function (d) {
            d._deActive();
        });
    }
}

function region(node) {
    var offset = node.offset();
    if (!node.__ddCachedWidth) {
        logger.debug('no cache in dd!');
        logger.debug(node[0]);
    }
    return {
        left: offset.left,
        right: offset.left + (node.__ddCachedWidth || node.outerWidth()),
        top: offset.top,
        bottom: offset.top + (node.__ddCachedHeight || node.outerHeight())
    };
}

function inRegion(region, pointer) {
    return region.left <= pointer.left &&
        region.right >= pointer.left &&
        region.top <= pointer.top &&
        region.bottom >= pointer.top;
}

function area(region) {
    if (region.top >= region.bottom || region.left >= region.right) {
        return 0;
    }
    return (region.right - region.left) * (region.bottom - region.top);
}

function intersect(r1, r2) {
    var t = Math.max(r1.top, r2.top),
        r = Math.min(r1.right, r2.right),
        b = Math.min(r1.bottom, r2.bottom),
        l = Math.max(r1.left, r2.left);
    return {
        left: l,
        right: r,
        top: t,
        bottom: b
    };
}

function inNodeByPointer(node, point) {
    return inRegion(region(node), point);
}

function cacheWH(node) {
    if (node) {
        node.__ddCachedWidth = node.outerWidth();
        node.__ddCachedHeight = node.outerHeight();
    }
}

var DDM = new DDManger();
DDM.inRegion = inRegion;
DDM.region = region;
DDM.area = area;
DDM.cacheWH = cacheWH;
DDM.PREFIX_CLS = 'ks-dd-';

module.exports = DDM;

