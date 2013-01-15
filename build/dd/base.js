/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 15 13:39
*/
/**
 * @ignore
 * dd support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/base', function (S, DDM, Draggable, DraggableDelegate) {

    var DD = {
        Draggable: Draggable,
        DDM: DDM,
        DraggableDelegate: DraggableDelegate
    };

    KISSY.DD = DD;

    return DD;
}, {
    requires: [
        './base/ddm',
        './base/draggable',
        './base/draggable-delegate'
    ]
});/**
 * @ignore
 * dd support for kissy , dd objects central management module
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/base/ddm', function (S, DOM, Event, Node, Base) {

    var UA = S.UA,
        win = S.Env.host,
        doc = win.document,
        ie6 = UA['ie'] === 6,

    // prevent collision with click , only start when move
        PIXEL_THRESH = 3,
    // or start when mousedown for 1 second
        BUFFER_TIME = 1,
        MOVE_DELAY = 30,
        SHIM_Z_INDEX = 999999;


    var TARGET = 'target',
        Gesture = Event.Gesture,
        CURRENT_TARGET = 'currentTarget',
        DRAG_MOVE_EVENT = Gesture.move,
        DRAG_END_EVENT = Gesture.end;


    /**
     * @class KISSY.DD.DDM
     * @singleton
     * @extends KISSY.Base
     * Manager for Drag and Drop.
     */
    function DDM() {
        var self = this;
        DDM.superclass.constructor.apply(self, arguments);
    }

    DDM.ATTRS = {
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

        /***
         * the number of pixels to move to start a drag operation,default is 3.
         * Defaults to: 3.
         * @property clickPixelThresh
         * @type {Number}
         */

        /**
         * @ignore
         */
        clickPixelThresh: {
            value: PIXEL_THRESH
        },

        /**
         * the number of milliseconds to start a drag operation after mousedown,unit second.
         * Defaults to: 1.
         * @property bufferTime
         * @type {Number}
         */

        /**
         * @ignore
         */
        bufferTime: { value: BUFFER_TIME },

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
            value: []
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
            value: []
        }
    };

    /*
     全局鼠标移动事件通知当前拖动对象正在移动
     注意：chrome8: click 时 mousedown-mousemove-mouseup-click 也会触发 mousemove
     */
    function move(ev) {
        var self = this,
            __activeToDrag ,
            activeDrag;

        ev = ddm._normalEvent(ev);

        if (!ev) {
            return;
        }

        //防止 ie 选择到字
        ev.preventDefault();

        // 先处理预备役，效率!
        if (__activeToDrag = self.__activeToDrag) {

            __activeToDrag._move(ev);

        } else if (activeDrag = self.get('activeDrag')) {

            activeDrag._move(ev);
            // 获得当前的激活drop
            notifyDropsMove(self, ev, activeDrag);

        }
    }

    // 同一时刻只可能有个 drag 元素，只能有一次 move 被注册，不需要每个实例一个 throttle
    // 一个应用一个 document 只需要注册一个 move
    var throttleMove = S.throttle(move, MOVE_DELAY);

    function throttleMoveHandle(e) {
        // android can not throttle
        // need preventDefault on every event!
        e.preventDefault();
        throttleMove.call(this, e);
    }

    function notifyDropsMove(self, ev, activeDrag) {
        var mode = activeDrag.get('mode'),
            drops = self.get('validDrops'),
            activeDrop = 0,
            oldDrop,
            vArea = 0,
            dragRegion = region(activeDrag.get('node')),
            dragArea = area(dragRegion);

        S.each(drops, function (drop) {
            var a,
                node = drop['getNodeFromTarget'](ev,
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

            if (mode == 'point') {
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
            } else if (mode == 'intersect') {
                //取一个和activeDrag交集最大的drop区域
                a = area(intersect(dragRegion, region(node)));
                if (a > vArea) {
                    vArea = a;
                    activeDrop = drop;
                }

            } else if (mode == 'strict') {
                //drag 全部在 drop 里面
                a = area(intersect(dragRegion, region(node)));
                if (a == dragArea) {
                    activeDrop = drop;
                    return false;
                }
            }
            return undefined;
        });
        oldDrop = self.get('activeDrop');
        if (oldDrop && oldDrop != activeDrop) {
            oldDrop._handleOut(ev);
            activeDrag._handleOut(ev);
        }
        self.setInternal('activeDrop', activeDrop);
        if (activeDrop) {
            if (oldDrop != activeDrop) {
                activeDrop._handleEnter(ev);
            } else {
                // 注意处理代理时内部节点变化导致的 out、enter
                activeDrop._handleOver(ev);
            }
        }
    }


    /*
     垫片只需创建一次
     */
    function activeShim(self) {
        //创造垫片，防止进入iframe，外面document监听不到 mousedown/up/move
        self._shim = new Node('<div ' +
            'style="' +
            //red for debug
            'background-color:red;' +
            'position:' + (ie6 ? 'absolute' : 'fixed') + ';' +
            'left:0;' +
            'width:100%;' +
            'height:100%;' +
            'top:0;' +
            'cursor:' + ddm.get('dragCursor') + ';' +
            'z-index:' +
            //覆盖iframe上面即可
            SHIM_Z_INDEX
            + ';' +
            '"><' + '/div>')
            .prependTo(doc.body || doc.documentElement)
            //0.5 for debug
            .css('opacity', 0);

        activeShim = showShim;

        if (ie6) {
            // ie6 不支持 fixed 以及 width/height 100%
            // support dd-scroll
            // prevent empty when scroll outside initial window
            Event.on(win, 'resize scroll', adjustShimSize, self);
        }

        showShim(self);
    }

    var adjustShimSize = S.throttle(function () {
        var self = this,
            activeDrag;
        if ((activeDrag = self.get('activeDrag')) &&
            activeDrag.get('shim')) {
            self._shim.css({
                width: DOM.docWidth(),
                height: DOM.docHeight()
            });
        }
    }, MOVE_DELAY);

    function showShim(self) {
        // determine cursor according to activeHandler and dragCursor
        var ah = self.get('activeDrag').get('activeHandler'),
            cur = 'auto';
        if (ah) {
            cur = ah.css('cursor');
        }
        if (cur == 'auto') {
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

    /*
     开始时注册全局监听事件
     */
    function registerEvent(self) {
        Event.on(doc, DRAG_END_EVENT, self._end, self);
        Event.on(doc, DRAG_MOVE_EVENT, throttleMoveHandle, self);
        // ie6 will not response to event when cursor is out of window.
        if (UA.ie === 6) {
            doc.body.setCapture();
        }
    }

    /*
     结束时需要取消掉，防止平时无谓的监听
     */
    function unRegisterEvent(self) {
        Event.remove(doc, DRAG_MOVE_EVENT, throttleMoveHandle, self);
        Event.remove(doc, DRAG_END_EVENT, self._end, self);
        if (UA.ie === 6) {
            doc.body.releaseCapture();
        }
    }


    function _activeDrops(self) {
        var drops = self.get('drops');
        self.setInternal('validDrops', []);
        S.each(drops, function (d) {
            d._active();
        });
    }

    function _deActiveDrops(self) {
        var drops = self.get('drops');
        self.setInternal('validDrops', []);
        S.each(drops, function (d) {
            d._deActive();
        });
    }

    /*
     负责拖动涉及的全局事件：
     1.全局统一的鼠标移动监控
     2.全局统一的鼠标弹起监控，用来通知当前拖动对象停止
     3.为了跨越 iframe 而统一在底下的遮罩层
     */
    S.extend(DDM, Base, {

        /*
         可能要进行拖放的对象，需要通过 buffer/pixelThresh 考验
         */
        __activeToDrag: 0,

        /**
         * @ignore
         */
        _regDrop: function (d) {
            this.get('drops').push(d);
        },

        /**
         * @ignore
         */
        _unRegDrop: function (d) {
            var self = this,
                index = S.indexOf(d, self.get('drops'));
            if (index != -1) {
                self.get('drops').splice(index, 1);
            }
        },

        /**
         * 注册可能将要拖放的节点
         * @param drag
         * @ignore
         */
        _regToDrag: function (drag) {
            var self = this;
            // 事件先要注册好，防止点击，导致 mouseup 时还没注册事件
            self.__activeToDrag = drag;
            registerEvent(self);

        },

        /**
         * 真正开始 drag
         * 当前拖动对象通知全局：我要开始啦
         * 全局设置当前拖动对象
         * @ignore
         */
        _start: function () {
            var self = this,
                drops = self.get('drops'),
                drag = self.__activeToDrag;
            self.setInternal('activeDrag', drag);
            // 预备役清掉
            self.__activeToDrag = 0;
            // 真正开始移动了才激活垫片
            if (drag.get('shim')) {
                activeShim(self);
            }
            cacheWH(drag.get('node'));
            _activeDrops(self);
        },

        /**
         * @ignore
         */
        _addValidDrop: function (drop) {
            this.get('validDrops').push(drop);
        },

        /**
         * 全局通知当前拖动对象：结束拖动了！
         * @ignore
         */
        _end: function () {
            var self = this,
                activeDrag = self.get('activeDrag'),
                activeDrop = self.get('activeDrop');
            unRegisterEvent(self);
            // 预备役清掉 , click 情况下 mousedown->mouseup 极快过渡
            if (self.__activeToDrag) {
                self.__activeToDrag._end();
                self.__activeToDrag = 0;
            }
            if (self._shim) {
                self._shim.hide();
            }
            if (!activeDrag) {
                return;
            }
            activeDrag._end();
            _deActiveDrops(self);
            if (activeDrop) {
                activeDrop._end();
            }
            self.setInternal('activeDrag', null);
            self.setInternal('activeDrop', null);
        }
    });

    function region(node) {
        var offset = node.offset();
        if (!node.__dd_cached_width) {
            S.log('no cache in dd!');
            S.log(node[0]);
        }
        return {
            left: offset.left,
            right: offset.left + (node.__dd_cached_width || node.outerWidth()),
            top: offset.top,
            bottom: offset.top + (node.__dd_cached_height || node.outerHeight())
        };
    }

    function inRegion(region, pointer) {
        return region.left <= pointer.left
            && region.right >= pointer.left
            && region.top <= pointer.top
            && region.bottom >= pointer.top;
    }

    function area(region) {
        if (region.top >= region.bottom || region.left >= region.right) {
            return 0;
        }
        return (region.right - region.left) * (region.bottom - region.top);
    }

    function intersect(r1, r2) {
        var t = Math.max(r1['top'], r2.top),
            r = Math.min(r1.right, r2.right),
            b = Math.min(r1['bottom'], r2.bottom),
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
            node.__dd_cached_width = node.outerWidth();
            node.__dd_cached_height = node.outerHeight();
        }
    }

    var ddm = new DDM();
    ddm.inRegion = inRegion;
    ddm.region = region;
    ddm.area = area;
    ddm.cacheWH = cacheWH;
    ddm.PREFIX_CLS = 'ks-dd-';

    /*
     normal event between devices
     */
    ddm._normalEvent = function (e) {
        var touches = e.touches,
            touch;
        if (touches) {
            if (touches.length != 1) {
                return undefined;
            }
            touch = touches[0];
            e[TARGET] = e[TARGET] || touch[TARGET];
            e[CURRENT_TARGET] = e[CURRENT_TARGET] || touch[CURRENT_TARGET];
            e.which = 1;
            e.pageX = touch.pageX;
            e.pageY = touch.pageY;
        }
        return e;
    };

    return ddm;
}, {
    requires: ['dom', 'event', 'node', 'base']
});
/**
 * @ignore
 * delegate all draggable nodes to one draggable object
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/base/draggable-delegate', function (S, DDM, Draggable, DOM, Node, Event) {

    var PREFIX_CLS = DDM.PREFIX_CLS,
        DRAG_START_EVENT = Event.Gesture.start;

    /*
     父容器监听 mousedown，找到合适的拖动 handlers 以及拖动节点
     */
    var handlePreDragStart = function (ev) {

        ev = DDM._normalEvent(ev);

        if (!ev) {
            return;
        }

        var self = this,
            handler,
            node;

        if (!self._checkDragStartValid(ev)) {
            return;
        }

        var handlers = self.get('handlers'),
            target = new Node(ev.target);

        // 不需要像 Draggable 一样，判断 target 是否在 handler 内
        // 委托时，直接从 target 开始往上找 handler
        if (handlers.length) {
            handler = self._getHandler(target);
        } else {
            handler = target;
        }

        if (handler) {
            node = self._getNode(handler);
        }

        // can not find handler or can not find matched node from handler
        // just return !
        if (!node) {
            return;
        }

        self.setInternal('activeHandler', handler);

        // 找到 handler 确定 委托的 node ，就算成功了
        self.setInternal('node', node);
        self.setInternal('dragNode', node);
        self._prepare(ev);
    };

    /**
     * @extends KISSY.DD.Draggable
     * @class KISSY.DD.DraggableDelegate
     * drag multiple nodes under a container element
     * using only one draggable instance as a delegate.
     */
    return Draggable.extend({

            // override Draggable
            _onSetNode: function () {

            },

            _onSetContainer: function () {
                this.bindDragEvent();
            },

            _onSetDisabledChange: function (d) {
                this.get('container')[d ? 'addClass' :
                    'removeClass'](PREFIX_CLS + '-disabled');
            },

            bindDragEvent: function () {
                var self = this,
                    node = self.get('container');
                node.on(DRAG_START_EVENT, handlePreDragStart, self)
                    .on('dragstart', self._fixDragStart);
            },

            detachDragEvent: function () {
                var self = this;
                self.get('container')
                    .detach(DRAG_START_EVENT, handlePreDragStart, self)
                    .detach('dragstart', self._fixDragStart);
            },

            /*
             得到适合 handler，从这里开始启动拖放，对于 handlers 选择器字符串数组
             */
            _getHandler: function (target) {
                var self = this,
                    ret = undefined,
                    node = self.get('container'),
                    handlers = self.get('handlers');
                while (target && target[0] !== node[0]) {
                    S.each(handlers, function (h) {
                        if (DOM.test(target[0], h)) {
                            ret = target;
                            return false;
                        }
                    });
                    if (ret) {
                        break;
                    }
                    target = target.parent();
                }
                return ret;
            },

            /*
             找到真正应该移动的节点，对应 selector 属性选择器字符串
             */
            _getNode: function (h) {
                return h.closest(this.get('selector'), this.get('container'));
            }
        },
        {
            ATTRS: {
                /**
                 * a selector query to get the container to listen for mousedown events on.
                 * All 'draggable selector' should be a child of this container
                 * @cfg {HTMLElement|String} container
                 */
                /**
                 * @ignore
                 */
                container: {
                    setter: function (v) {
                        return Node.one(v);
                    }
                },

                /**
                 * a selector query to get the children of container to make draggable elements from.
                 * usually as for tag.cls.
                 * @cfg {String} selector
                 */
                /**
                 * @ignore
                 */
                selector: {
                },

                /**
                 * handlers to initiate drag operation.
                 * can only be as form of tag.cls.
                 * default {@link #selector}
                 * @cfg {String[]} handlers
                 **/
                /**
                 * @ignore
                 */
                handlers: {
                    value: [],
                    // 覆盖父类的 getter ，这里 normalize 成节点
                    getter: 0
                }
            }
        });
}, {
    requires: ['./ddm', './draggable', 'dom', 'node', 'event']
});/**
 * @ignore
 * dd support for kissy, drag for dd
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/base/draggable', function (S, Node, RichBase, DDM, Event) {

    var UA = S.UA,
        $ = Node.all,
        each = S.each,
        DRAG_START_EVENT = Event.Gesture.start,
        ie = UA['ie'],
        Features = S.Features,
        NULL = null,
        PREFIX_CLS = DDM.PREFIX_CLS,
        doc = S.Env.host.document;


    /**
     * @class KISSY.DD.Draggable
     * @extends KISSY.RichBase
     * Provide abilities to make specified node draggable
     */


    var Draggable = RichBase.extend({

        initializer: function () {
            var self = this;
            self.addTarget(DDM);
            /**
             * fired when need to compute draggable 's position during dragging
             * @event dragalign
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             */

            /**
             * fired when need to get draggable 's position during dragging
             * @event dragalign
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             */


            /**
             * fired during dragging
             * @event drag
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             * @param e.left node 's supposed position left
             * @param e.top node 's supposed position top
             * @param e.pageX mouse position left
             * @param e.pageY mouse position top
             */

            /**
             * fired during dragging
             * @event drag
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             * @param e.left node 's supposed position left
             * @param e.top node 's supposed position top
             * @param e.pageX mouse position left
             * @param e.pageY mouse position top
             */


            /**
             * fired after drop a draggable onto a droppable object
             * @event dragdrophit
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after drop a draggable onto a droppable object
             * @event dragdrophit
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */


            /**
             * fired after drag
             * @event dragend
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             */

            /**
             * fired after drag
             * @event dragend
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             */


            /**
             * fired after drop a draggable onto nothing
             * @event dragdropmiss
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             */

            /**
             * fired after drop a draggable onto nothing
             * @event dragdropmiss
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             */


            /**
             * fired after a draggable leaves a droppable
             * @event dragexit
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after a draggable leaves a droppable
             * @event dragexit
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */


            /**
             * fired after a draggable object mouseenter a droppable object
             * @event dragenter
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after a draggable object mouseenter a droppable object
             * @event dragenter
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */


            /**
             * fired after a draggable object mouseover a droppable object
             * @event dragover
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after a draggable object mouseover a droppable object
             * @event dragover
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */


            /**
             * fired after a draggable object start to drag
             * @event dragstart
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             */

            /**
             * fired after a draggable object start to drag
             * @event dragstart
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEventObject} e
             * @param e.drag current draggable object
             */
        },

        '_onSetNode': function (n) {
            var self = this;
            // dragNode is equal to node in single mode
            self.setInternal('dragNode', n);
            self.bindDragEvent();
        },

        bindDragEvent: function () {
            var self = this, node = self.get('node');
            node.on(DRAG_START_EVENT, handlePreDragStart, self)
                .on('dragstart', self._fixDragStart);
        },

        detachDragEvent: function () {
            var self = this, node = self.get('node');
            node.detach(DRAG_START_EVENT, handlePreDragStart, self)
                .detach('dragstart', self._fixDragStart);
        },

        /**
         * mousedown 1秒后自动开始拖的定时器
         * @ignore
         */
        _bufferTimer: NULL,

        _onSetDisabledChange: function (d) {
            this.get('dragNode')[d ? 'addClass' :
                'removeClass'](PREFIX_CLS + '-disabled');
        },

        _fixDragStart: fixDragStart,

        _checkHandler: function (t) {
            var self = this,
                handlers = self.get('handlers'),
                ret = 0;
            each(handlers, function (handler) {
                //子区域内点击也可以启动
                if (handler.contains(t) ||
                    handler[0] == t) {
                    ret = 1;
                    self.setInternal('activeHandler', handler);
                    return false;
                }
            });
            return ret;
        },

        _checkDragStartValid: function (ev) {
            var self = this;
            if (self.get('primaryButtonOnly') && ev.which != 1 ||
                self.get('disabled')) {
                return 0;
            }
            return 1;
        },

        _prepare: function (ev) {

            if (!ev) {
                return;
            }

            var self = this,
                target = $(ev.target);

            if (ie) {
                fixIEMouseDown();
            }

            // http://blogs.msdn.com/b/ie/archive/2011/10/19/handling-multi-touch-and-mouse-input-in-all-browsers.aspx
            // stop panning and zooming so we can draw for win8?
//            if (ev.originalEvent['preventManipulation']) {
//                ev.originalEvent.preventManipulation();
//            }

            // 防止 firefox/chrome 选中 text
            // 非 ie，阻止了 html dd 的默认行为
            if (self.get('halt')) {
                ev.stopPropagation();
            }

            // in touch device
            // prevent touchdown
            // will prevent text selection and link click
            if (!Features.isTouchSupported()) {
                ev.preventDefault();
            }

            var node = self.get('node'),
                mx = ev.pageX,
                my = ev.pageY,
                nxy = node.offset();

            self.setInternal('startMousePos', self.mousePos = {
                left: mx,
                top: my
            });

            self.setInternal('startNodePos', nxy);

            self.setInternal('deltaPos', {
                left: mx - nxy.left,
                top: my - nxy.top
            });

            DDM._regToDrag(self);

            var bufferTime = self.get('bufferTime');

            // 是否中央管理，强制限制拖放延迟
            if (bufferTime) {
                self._bufferTimer = setTimeout(function () {
                    // 事件到了，仍然是 mousedown 触发！
                    //S.log('drag start by timeout');
                    self._start();
                }, bufferTime * 1000);
            }

        },

        _clearBufferTimer: function () {
            var self = this;
            if (self._bufferTimer) {
                clearTimeout(self._bufferTimer);
                self._bufferTimer = 0;
            }
        },

        _move: function (ev) {

            var self = this,
                ret,
                pageX = ev.pageX,
                pageY = ev.pageY;

            if (!self.get('dragging')) {
                var startMousePos = self.get('startMousePos'),
                    clickPixelThresh = self.get('clickPixelThresh');
                // 鼠标经过了一定距离，立即开始
                if (Math.abs(pageX - startMousePos.left) >= clickPixelThresh ||
                    Math.abs(pageY - startMousePos.top) >= clickPixelThresh) {
                    //S.log('start drag by pixel : ' + l1 + ' : ' + l2);
                    self._start();
                }
                // 开始后，下轮 move 开始触发 drag 事件
                return;
            }

            var diff = self.get('deltaPos'),
                left = pageX - diff.left,
                top = pageY - diff.top;

            self.mousePos = {
                left: pageX,
                top: pageY
            };

            ret = {
                left: left,
                top: top,
                pageX: pageX,
                pageY: pageY,
                drag: self
            };

            self.setInternal('actualPos', {
                left: left,
                top: top
            });

            self.fire('dragalign', ret);

            var def = 1;

            if (self.fire('drag', ret) === false) {
                def = 0;
            }

            if (def && self.get('move')) {
                // 取 'node' , 改 node 可能是代理哦
                self.get('node').offset(self.get('actualPos'));
            }
        },

        /**
         * force to stop this drag operation
         * @member KISSY.DD.Draggable
         */
        stopDrag: function () {
            DDM._end();
        },

        _end: function () {
            var self = this,
                activeDrop;

            // 否则清除定时器即可
            self._clearBufferTimer();
            if (ie) {
                fixIEMouseUp();
            }
            // 如果已经开始，收尾工作
            if (self.get('dragging')) {
                self.get('node')
                    .removeClass(PREFIX_CLS + 'drag-over');
                if (activeDrop = DDM.get('activeDrop')) {
                    self.fire('dragdrophit', {
                        drag: self,
                        drop: activeDrop
                    });
                } else {
                    self.fire('dragdropmiss', {
                        drag: self
                    });
                }
                self.setInternal('dragging', 0);
                self.fire('dragend', {
                    drag: self
                });
            }
        },

        _handleOut: function () {
            var self = this;
            self.get('node').removeClass(PREFIX_CLS + 'drag-over');

            // html5 => dragleave
            self.fire('dragexit', {
                drag: self,
                drop: DDM.get('activeDrop')
            });
        },

        _handleEnter: function (e) {
            var self = this;
            self.get('node').addClass(PREFIX_CLS + 'drag-over');
            //第一次先触发 dropenter, dragenter
            self.fire('dragenter', e);
        },

        _handleOver: function (e) {
            this.fire('dragover', e);
        },

        _start: function () {
            var self = this;
            self._clearBufferTimer();
            self.setInternal('dragging', 1);
            DDM._start();
            self.fire('dragstart', {
                drag: self
            });
        },

        /**
         * make the drag node undraggable
         * @member KISSY.DD.Draggable
         * @private
         */
        destructor: function () {
            var self = this;
            self.detachDragEvent();
            self.detach();
        }


    }, {
        ATTRS: {



            /**
             * the dragged node. maybe a proxy node.
             * @property node
             * @type {HTMLElement|KISSY.NodeList}
             * @readonly
             */

            /**
             * the dragged node.
             * @cfg {HTMLElement|KISSY.NodeList} node
             */

            /**
             * @ignore
             */
            node: {
                setter: function (v) {
                    if (!(v instanceof Node)) {
                        return $(v);
                    }
                }
            },

            /**
             * the number of pixels to move to start a drag operation
             *
             * Defaults to: {@link KISSY.DD.DDM#clickPixelThresh}.
             *
             * @cfg {Number} clickPixelThresh
             */
            /**
             * @ignore
             */
            clickPixelThresh: {
                valueFn: function () {
                    return DDM.get('clickPixelThresh');
                }
            },

            /**
             * the number of milliseconds to start a drag operation after mousedown.
             *
             * Defaults to: {@link KISSY.DD.DDM#bufferTime}.
             *
             * @cfg {Number} bufferTime
             */
            /**
             * @ignore
             */
            bufferTime: {
                valueFn: function () {
                    return DDM.get('bufferTime');
                }
            },

            /**
             * the draggable element.
             * @property dragNode
             * @type {HTMLElement}
             * @readonly
             */
            /**
             * @ignore
             */
            dragNode: {},

            /**
             * use protective shim to cross iframe.
             *
             * Defaults to: true
             *
             * @cfg {Boolean} shim
             *
             */
            /**
             * @ignore
             */
            shim: {
                value: true
            },

            /**
             * valid handlers to initiate a drag operation.
             *
             * Default same with {@link KISSY.DD.Draggable#cfg-node} config.
             *
             * @cfg {HTMLElement[]|Function[]|String[]} handlers
             */
            /**
             * @ignore
             */
            handlers: {
                value: [],
                getter: function (vs) {
                    var self = this;
                    if (!vs.length) {
                        vs[0] = self.get('node');
                    }
                    each(vs, function (v, i) {
                        if (S.isFunction(v)) {
                            v = v.call(self);
                        }
                        // search inside node
                        if (typeof v == 'string') {
                            v = self.get('node').one(v);
                        }
                        if (v.nodeType) {
                            v = $(v);
                        }
                        vs[i] = v;
                    });
                    self.setInternal('handlers', vs);
                    return vs;
                }
            },

            /**
             * the handler which fired the drag event.
             * @type {KISSY.NodeList}
             * @property activeHandler
             * @readonly
             */
            /**
             * @ignore
             */
            activeHandler: {},

            /**
             * indicate whether this draggable object is being dragged
             * @type {Boolean}
             * @property dragging
             * @readonly
             */
            /**
             * @ignore
             */
            dragging: {
                value: false,
                setter: function (d) {
                    var self = this;
                    self.get('dragNode')[d ? 'addClass' : 'removeClass']
                        (PREFIX_CLS + 'dragging');
                }
            },

            /**
             * drop mode.
             * @cfg {KISSY.DD.Draggable.DropMode} mode
             */
            /**
             * @ignore
             */
            mode: {
                value: 'point'
            },

            /**
             * set to disable this draggable so that it can not be dragged.
             *
             * Defaults to: false
             *
             * @type {Boolean}
             * @property disabled
             */
            /**
             * @ignore
             */
            disabled: {
                value: false
            },

            /**
             * whether the drag node moves with cursor, can be used to resize element.
             *
             * Defaults to: false
             *
             * @cfg {Boolean} move
             */
            /**
             * @ignore
             */
            move: {
                value: false
            },

            /**
             * whether a drag operation can only be trigged by primary(left) mouse button.
             * Setting false will allow for all mousedown events to trigger drag.
             * @cfg {Boolean} primaryButtonOnly
             */
            /**
             * @ignore
             */
            primaryButtonOnly: {
                value: true
            },

            /**
             * whether halt mousedown event.
             *
             * Defaults to: true
             *
             * @cfg {Boolean} halt
             */
            /**
             * @ignore
             */
            halt: {
                value: true
            },

            /**
             * groups this draggable object belongs to
             * for example:
             *      @example
             *      {
             *          'group1':1,
             *          'group2':1
             *      }
             *
             * @cfg {Object} groups
             */
            /**
             * @ignore
             */
            groups: {
                value: {}
            },

            /**
             * mouse position at drag start
             * for example:
             *      @example
             *      {
             *          left: 100,
             *          top: 200
             *      }
             *
             * @property startMousePos
             * @type {Object}
             * @readonly
             */
            /**
             * @ignore
             */
            startMousePos: {

            },

            /**
             * node position ar drag start
             * for example:
             *      @example
             *      {
             *          left: 100,
             *          top: 200
             *      }
             *
             * @property startNodePos
             * @type {Object}
             * @readonly
             */
            /**
             * @ignore
             */
            startNodePos: {

            },

            /**
             * The offset of the mouse position to the element's position
             * @property deltaPos
             * @type {Object}
             * @readonly
             */
            /**
             * @ignore
             */
            deltaPos: {

            },

            /**
             * The xy that the node will be set to. Changing this will alter the position as it's dragged.
             * @property actualPos
             * @type {Object}
             * @readonly
             */
            /**
             * @ignore
             */
            actualPos: {

            }
        }
    });

    /**
     * drag drop mode enum.
     * @enum {String} KISSY.DD.Draggable.DropMode
     */
    Draggable.DropMode = {
        /**
         * In point mode, a Drop is targeted by the cursor being over the Target
         */
        'POINT': 'point',
        /**
         * In intersect mode, a Drop is targeted by 'part' of the drag node being over the Target
         */
        INTERSECT: 'intersect',
        /**
         * In strict mode, a Drop is targeted by the 'entire' drag node being over the Target
         */
        STRICT: 'strict'
    };

    var _ieSelectBack;

    function fixIEMouseUp() {
        doc.body.onselectstart = _ieSelectBack;
    }


    // prevent select text in ie
    function fixIEMouseDown() {
        _ieSelectBack = doc.body.onselectstart;
        doc.body.onselectstart = fixIESelect;
    }

    /*
     1. keeps IE from blowing up on images as drag handlers.
     IE 在 img 上拖动时默认不能拖动（不触发 mousemove，mouseup 事件，mouseup 后接着触发 mousemove ...）
     2. 防止 html5 draggable 元素的拖放默认行为 (选中文字拖放)
     3. 防止默认的选择文本行为(??场景？)
     */
    function fixDragStart(e) {
        e.preventDefault();
    }

    /*
     keeps IE from selecting text
     */
    function fixIESelect() {
        return false;
    }

    /*
     鼠标按下时，查看触发源是否是属于 handler 集合，
     保存当前状态
     通知全局管理器开始作用
     */
    var handlePreDragStart = function (ev) {

        ev = DDM._normalEvent(ev);

        if (!ev) {
            return;
        }

        var self = this,
            t = ev.target;

        if (self._checkDragStartValid(ev)) {

            if (!self._checkHandler(t)) {
                return;
            }

            self._prepare(ev);
        }
    };

    return Draggable;

}, {
    requires: ['node', 'rich-base', './ddm', 'event']
});
