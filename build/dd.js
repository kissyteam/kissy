/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Oct 22 19:41
*/
/**
 * @ignore
 * @fileOverview Config constrain region for drag and drop
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/constrain', function (S, Base, Node) {

    var $ = Node.all,
        DESTRUCTOR_ID = '__constrain_destructors',
        stamp = S.stamp,
        MARKER = S.guid('__dd_constrain'),
        WIN = S.Env.host;

    /**
     * @class KISSY.DD.Constrain
     * @extends KISSY.Base
     * Provide ability to constrain draggable to specified region
     */
    function Constrain() {
        Constrain.superclass.constructor.apply(this, arguments);
        this[DESTRUCTOR_ID] = {};
    }

    function onDragStart(e) {
        var self = this,
            drag = e.drag,
            l, t, lt,
            dragNode = drag.get('dragNode'),
            constrain = self.get('constrain');
        if (constrain) {
            if (constrain === true || constrain.setTimeout) {
                var win;
                if (constrain === true) {
                    win = $(WIN);
                } else {
                    win = $(constrain);
                }
                self.__constrainRegion = {
                    left: l = win.scrollLeft(),
                    top: t = win.scrollTop(),
                    right: l + win.width(),
                    bottom: t + win.height()
                };
            }
            if (constrain.nodeType || typeof constrain == 'string') {
                constrain = $(constrain);
            }
            if (constrain.getDOMNode) {
                lt = constrain.offset();
                self.__constrainRegion = {
                    left: lt.left,
                    top: lt.top,
                    right: lt.left + constrain.outerWidth(),
                    bottom: lt.top + constrain.outerHeight()
                };
            } else if (S.isPlainObject(constrain)) {
                self.__constrainRegion = constrain;
            }
            if (self.__constrainRegion) {
                self.__constrainRegion.right -= dragNode.outerWidth();
                self.__constrainRegion.bottom -= dragNode.outerHeight();
            }
        }
    }

    function onDragAlign(e) {
        var self = this,
            info = {},
            l = e.left,
            t = e.top,
            constrain = self.__constrainRegion;
        if (constrain) {
            info.left = Math.min(Math.max(constrain.left, l), constrain.right);
            info.top = Math.min(Math.max(constrain.top, t), constrain.bottom);
            e.drag.setInternal('actualPos', info);
        }
    }

    function onDragEnd() {
        this.__constrainRegion = null;
    }

    S.extend(Constrain, Base, {
        __constrainRegion: null,

        /**
         * start monitoring drag
         * @param {KISSY.DD.Draggable} drag
         * @return {KISSY.DD.Constrain} this
         */
        attachDrag: function (drag) {
            var self = this,
                destructors = self[DESTRUCTOR_ID],
                tag = stamp(drag, 0, MARKER);

            if (destructors[tag]) {
                return self;
            }
            destructors[tag] = drag;
            drag['on']('dragstart', onDragStart, self)
                .on('dragend', onDragEnd, self)
                .on('dragalign', onDragAlign, self);
            return self;
        },


        /**
         * stop monitoring drag
         * @param {KISSY.DD.Draggable} drag
         * @return {KISSY.DD.Constrain} this
         */
        detachDrag: function (drag) {
            var self = this,
                tag = stamp(drag, 1, MARKER),
                destructors = self[DESTRUCTOR_ID];
            if (tag && destructors[tag]) {
                drag['detach']('dragstart', onDragStart, self)
                    .detach('dragend', onDragEnd, self)
                    .detach('dragalign', onDragAlign, self);
                delete destructors[tag];
            }
            return self;
        },

        /**
         * destroy this constrain.
         */
        destroy: function () {
            var self = this,
                destructors = S.merge(self[DESTRUCTOR_ID]);
            S.each(destructors, function (drag) {
                self.detachDrag(drag);
            });
        }
    }, {
        ATTRS: {
            /**
             * constrained container.
             * @type {Boolean|HTMLElement|String}
             * @property constrain
             */

            /**
             * constrained container. true stands for viewport.
             * Defaults: true.
             * @cfg {Boolean|HTMLElement|String} constrain
             */

            /**
             * @ignore
             */
            constrain: {
                value: true
            }
        }
    });

    return Constrain;
}, {
    requires: ['base', 'node']
});/**
 * @ignore
 * @fileOverview dd support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('dd', function (S, DDM, Draggable, Droppable, Proxy, Constrain, Delegate, DroppableDelegate, Scroll) {

    var DD;
    DD = {
        Draggable: Draggable,
        Droppable: Droppable,
        DDM: DDM,
        'Constrain': Constrain,
        Proxy: Proxy,
        DraggableDelegate: Delegate,
        DroppableDelegate: DroppableDelegate,
        Scroll: Scroll
    };

    KISSY.DD = DD;

    return DD;
}, {
    requires: ['dd/ddm',
        'dd/draggable',
        'dd/droppable',
        'dd/proxy',
        'dd/constrain',
        'dd/draggable-delegate',
        'dd/droppable-delegate',
        'dd/scroll']
});/**
 * @ignore
 * @fileOverview dd support for kissy , dd objects central management module
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/ddm', function (S, UA, DOM, Event, Node, Base) {

    var win = S.Env.host,
        doc = win.document,
        ie6 = UA['ie'] === 6,

    // prevent collision with click , only start when move
        PIXEL_THRESH = 3,
    // or start when mousedown for 1 second
        BUFFER_TIME = 1,

        MOVE_DELAY = 30,
        _showShimMove = S.throttle(move,
            MOVE_DELAY),
        SHIM_Z_INDEX = 999999;


    var TARGET = 'target',
        BUTTON = 'button',
        touchSupport = 'ontouchstart' in doc,
    // http://blogs.msdn.com/b/ie/archive/2011/09/20/touch-input-for-ie10-and-metro-style-apps.aspx
        msPointerEnabled = "msPointerEnabled" in win.navigator,
        CURRENT_TARGET = 'currentTarget',
        DRAG_START_EVENT ,
        DRAG_MOVE_EVENT,
        DRAG_END_EVENT;

    if (touchSupport) {
        DRAG_START_EVENT = 'touchstart';
        DRAG_MOVE_EVENT = 'touchmove';
        DRAG_END_EVENT = 'touchend';
    } else if (msPointerEnabled) {
        DRAG_START_EVENT = 'MSPointerDown';
        DRAG_MOVE_EVENT = 'MSPointerMove';
        DRAG_END_EVENT = 'MSPointerUp';
    } else {
        DRAG_START_EVENT = 'mousedown';
        DRAG_MOVE_EVENT = 'mousemove';
        DRAG_END_EVENT = 'mouseup';
    }


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
         */
        activeDrag: {},

        /**
         * currently active droppable object
         * @type {KISSY.DD.Droppable}
         * @readonly
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
        // 先处理预备役，效率!
        if (__activeToDrag = self.__activeToDrag) {
            //防止 ie 选择到字
            ev.preventDefault();
            __activeToDrag._move(ev);

        } else if (activeDrag = self.get('activeDrag')) {
            //防止 ie 选择到字
            ev.preventDefault();
            activeDrag._move(ev);

            // 获得当前的激活drop
            notifyDropsMove(self, ev, activeDrag);
        }
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
                node = drop.getNodeFromTarget(ev,
                    // node
                    activeDrag.get('dragNode')[0],
                    // proxy node
                    activeDrag.get('node')[0]);

            if (!node
            // 当前 drop 区域已经包含  activeDrag.get('node')
            // 不要返回，可能想调整位置
                ) {
                return;
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
        Event.on(doc, DRAG_MOVE_EVENT, _showShimMove, self);
        // ie6 will not response to event when cursor is out of window.
        if (UA.ie === 6) {
            doc.body.setCapture();
        }
    }

    /*
     结束时需要取消掉，防止平时无谓的监听
     */
    function unRegisterEvent(self) {
        Event.remove(doc, DRAG_MOVE_EVENT, _showShimMove, self);
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


    function normalTouch(e, touch) {
        e[TARGET] = e[TARGET] || touch[TARGET];
        e[CURRENT_TARGET] = e[CURRENT_TARGET] || touch[CURRENT_TARGET];
        e[BUTTON] = e[BUTTON] || 0;
    }

    ddm._normalHandlePreDragStart = function (handle) {
        return function (e) {
            var originalEvent = e.originalEvent, touches;
            if (touches = originalEvent['touches']) {
                if (touches.length != 1) {
                    return;
                }
                normalTouch(e, touches[0]);
            }
            handle.call(this, e);
        };
    };

    ddm.DRAG_START_EVENT = DRAG_START_EVENT;
    ddm.DRAG_MOVE_EVENT = DRAG_MOVE_EVENT;
    ddm.DRAG_END_EVENT = DRAG_END_EVENT;

    return ddm;
}, {
    requires: ['ua', 'dom', 'event', 'node', 'base']
});
/**
 * @ignore
 * @fileOverview delegate all draggable nodes to one draggable object
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/draggable-delegate', function (S, DDM, Draggable, DOM, Node) {

    var PREFIX_CLS = DDM.PREFIX_CLS;

    /**
     * @extends KISSY.DD.Draggable
     * @class KISSY.DD.DraggableDelegate
     * drag multiple nodes under a container element
     * using only one draggable instance as a delegate.
     */
    function DraggableDelegate() {
        DraggableDelegate.superclass.constructor.apply(this, arguments);
    }


    /*
     父容器监听 mousedown，找到合适的拖动 handlers 以及拖动节点
     */
    var handlePreDragStart = DDM._normalHandlePreDragStart(function (ev) {
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
    });

    S.extend(DraggableDelegate, Draggable, {

            _uiSetDisabledChange: function (d) {
                this.get('container')[d ? 'addClass' :
                    'removeClass'](PREFIX_CLS + '-disabled');
            },

            _init: function () {
                var self = this,
                    node = self.get('container');
                node.on(DDM.DRAG_START_EVENT, handlePreDragStart, self)
                    .on('dragstart', self._fixDragStart);
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
            },

            destroy: function () {
                var self = this;
                self.get('container')
                    .detach(DDM.DRAG_START_EVENT,
                    handlePreDragStart,
                    self)
                    .detach('dragstart', self._fixDragStart);
                self.detach();
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

    return DraggableDelegate;
}, {
    requires: ['./ddm', './draggable', 'dom', 'node']
});/**
 * @ignore
 * @fileOverview dd support for kissy, drag for dd
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/draggable', function (S, UA, Node, Base, DDM) {

    var each = S.each,
        ie = UA['ie'],
        NULL = null,
        PREFIX_CLS = DDM.PREFIX_CLS,
        doc = S.Env.host.document;


    /**
     * @class KISSY.DD.Draggable
     * @extends KISSY.Base
     * Provide abilities to make specified node draggable
     */
    function Draggable() {
        var self = this;
        Draggable.superclass.constructor.apply(self, arguments);
        self.addTarget(DDM);
        S.each([

        /**
         * fired when need to compute draggable 's position during dragging
         * @event dragalign
         * @member KISSY.DD.DDM
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         */

        /**
         * fired when need to get draggable 's position during dragging
         * @event dragalign
         * @member KISSY.DD.Draggable
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         */
            'dragalign',

        /**
         * fired during dragging
         * @event drag
         * @member KISSY.DD.DDM
         * @param {KISSY.Event.Object} e
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
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         * @param e.left node 's supposed position left
         * @param e.top node 's supposed position top
         * @param e.pageX mouse position left
         * @param e.pageY mouse position top
         */
            'drag',

        /**
         * fired after drop a draggable onto a droppable object
         * @event dragdrophit
         * @member KISSY.DD.DDM
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * fired after drop a draggable onto a droppable object
         * @event dragdrophit
         * @member KISSY.DD.Draggable
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            'dragdrophit',


        /**
         * fired after drag
         * @event dragend
         * @member KISSY.DD.DDM
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         */

        /**
         * fired after drag
         * @event dragend
         * @member KISSY.DD.Draggable
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         */
            'dragend',


        /**
         * fired after drop a draggable onto nothing
         * @event dragdropmiss
         * @member KISSY.DD.DDM
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         */

        /**
         * fired after drop a draggable onto nothing
         * @event dragdropmiss
         * @member KISSY.DD.Draggable
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         */
            'dragdropmiss',


        /**
         * fired after a draggable leaves a droppable
         * @event dragexit
         * @member KISSY.DD.DDM
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * fired after a draggable leaves a droppable
         * @event dragexit
         * @member KISSY.DD.Draggable
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            'dragexit',

        /**
         * fired after a draggable object mouseenter a droppable object
         * @event dragenter
         * @member KISSY.DD.DDM
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * fired after a draggable object mouseenter a droppable object
         * @event dragenter
         * @member KISSY.DD.Draggable
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            'dragenter',


        /**
         * fired after a draggable object mouseover a droppable object
         * @event dragover
         * @member KISSY.DD.DDM
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * fired after a draggable object mouseover a droppable object
         * @event dragover
         * @member KISSY.DD.Draggable
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            'dragover',


        /**
         * fired after a draggable object start to drag
         * @event dragstart
         * @member KISSY.DD.DDM
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         */

        /**
         * fired after a draggable object start to drag
         * @event dragstart
         * @member KISSY.DD.Draggable
         * @param {KISSY.Event.Object} e
         * @param e.drag current draggable object
         */
            'dragstart'
        ], function (e) {
            self.publish(e, {
                bubbles: 1
            });
        });
        // dragNode is equal to node in single mode
        self.setInternal('dragNode', self.get('node'));
        self.on('afterDisabledChange', self._uiSetDisabledChange, self);
        var disabled;
        if (disabled = self.get('disabled')) {
            self._uiSetDisabledChange(disabled);
        }
        self._init();
    }

    Draggable.ATTRS = {

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
                    return Node.one(v);
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
                    if ((typeof v == 'string') || v.nodeType) {
                        v = Node.one(v);
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

    };

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

    S.mix(Draggable, Draggable.DropMode);


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
    var handlePreDragStart = DDM._normalHandlePreDragStart(function (ev) {
        var self = this,
            t = ev.target;

        if (self._checkDragStartValid(ev)) {

            if (!self._checkHandler(t)) {
                return;
            }

            self._prepare(ev);
        }
    });

    S.extend(Draggable, Base, {
        /**
         * mousedown 1秒后自动开始拖的定时器
         * @ignore
         */
        _bufferTimer: NULL,

        _uiSetDisabledChange: function (d) {
            this.get('dragNode')[d ? 'addClass' :
                'removeClass'](PREFIX_CLS + '-disabled');
        },

        _init: function () {
            var self = this,
                node = self.get('node');
            node.on(DDM.DRAG_START_EVENT, handlePreDragStart, self)
                .on('dragstart', self._fixDragStart);
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
            if (self.get('primaryButtonOnly') && ev.button > 1 ||
                self.get('disabled')) {
                return 0;
            }
            return 1;
        },

        _prepare: function (ev) {

            var self = this;

            if (ie) {
                fixIEMouseDown();
            }

            // 防止 firefox/chrome 选中 text
            // 非 ie，阻止了 html dd 的默认行为
            if (self.get('halt')) {
                ev.halt();
            } else {
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
            if (this.get('dragging')) {
                DDM._end();
            }
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
         */
        destroy: function () {
            var self = this,
                node = self.get('dragNode');
            node.detach(DDM.DRAG_START_EVENT, handlePreDragStart, self)
                .detach('dragstart', self._fixDragStart);
            self.detach();
        }
    });

    return Draggable;

}, {
    requires: ['ua', 'node', 'base', './ddm']
});
/**
 * @ignore
 * @fileOverview only one droppable instance for multiple droppable nodes
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/droppable-delegate', function (S, DDM, Droppable, DOM, Node) {


    function dragStart() {
        var self = this,
            container = self.get('container'),
            allNodes = [],
            selector = self.get('selector');
        container.all(selector).each(function (n) {
            // 2012-05-18: 缓存高宽，提高性能
            DDM.cacheWH(n);
            allNodes.push(n);
        });
        self.__allNodes = allNodes;
    }

    /**
     * @class KISSY.DD.DroppableDelegate
     * @extend KISSY.DD.Droppable
     * Make multiple nodes droppable under a container using only one droppable instance.
     */
    function DroppableDelegate() {
        var self = this;
        DroppableDelegate.superclass.constructor.apply(self, arguments);
        // 提高性能，拖放开始时缓存代理节点
        DDM.on('dragstart', dragStart, self);
    }

    S.extend(DroppableDelegate, Droppable, {

            /**
             * Destroy current instance
             */
            destroy: function () {
                DroppableDelegate.superclass.destroy.apply(this, arguments);
            },

            /**
             * get droppable node by delegation
             * @protected
             */
            getNodeFromTarget: function (ev, dragNode, proxyNode) {
                var pointer = {
                        left: ev.pageX,
                        top: ev.pageY
                    },
                    self = this,
                    allNodes = self.__allNodes,
                    ret = 0,
                    vArea = Number.MAX_VALUE;


                if (allNodes) {

                    S.each(allNodes, function (n) {
                        var domNode = n[0];
                        // 排除当前拖放的元素以及代理节点
                        if (domNode === proxyNode || domNode === dragNode) {
                            return;
                        }
                        var r = DDM.region(n);
                        if (DDM.inRegion(r, pointer)) {
                            // 找到面积最小的那个
                            var a = DDM.area(r);
                            if (a < vArea) {
                                vArea = a;
                                ret = n;
                            }
                        }
                    });
                }

                if (ret) {
                    self.setInternal('lastNode', self.get('node'));
                    self.setInternal('node', ret);
                }

                return ret;
            },

            _handleOut: function () {
                var self = this;
                DroppableDelegate.superclass._handleOut.apply(self, arguments);
                self.setInternal('node', 0);
                self.setInternal('lastNode', 0);
            },

            _handleOver: function (ev) {
                var self = this,
                    node = self.get('node'),
                    superOut = DroppableDelegate.superclass._handleOut,
                    superOver = DroppableDelegate.superclass._handleOver,
                    superEnter = DroppableDelegate.superclass._handleEnter,
                    lastNode = self.get('lastNode');

                if (lastNode[0] !== node[0]) {

                    // 同一个 drop 对象内委托的两个可 drop 节点相邻，先通知上次的离开
                    self.setInternal('node', lastNode);
                    superOut.apply(self, arguments);

                    // 再通知这次的进入
                    self.setInternal('node', node);
                    superEnter.call(self, ev);
                } else {
                    superOver.call(self, ev);
                }
            },

            _end: function () {
                var self = this;
                DroppableDelegate.superclass._end.apply(self, arguments);
                self.setInternal('node', 0);
            }
        },
        {
            ATTRS: {

                /**
                 * last droppable target node.
                 * @property lastNode
                 * @private
                 */
                /**
                 * @ignore
                 */
                lastNode: {
                },

                /**
                 * a selector query to get the children of container to make droppable elements from.
                 * usually as for tag.cls.
                 * @cfg {String} selector
                 */
                /**
                 * @ignore
                 */
                selector: {
                },

                /**
                 * a selector query to get the container to listen for mousedown events on.
                 * All 'draggable selector' should be a child of this container
                 * @cfg {String|HTMLElement} container
                 */
                /**
                 * @ignore
                 */
                container: {
                    setter: function (v) {
                        return Node.one(v);
                    }
                }
            }
        });

    return DroppableDelegate;
}, {
    requires: ['./ddm', './droppable', 'dom', 'node']
});/**
 * @ignore
 * @fileOverview droppable for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/droppable', function (S, Node, Base, DDM) {

    var PREFIX_CLS = DDM.PREFIX_CLS;

    /**
     * @class KISSY.DD.Droppable
     * @extends KISSY.Base
     * Make a node droppable.
     */
    function Droppable() {
        var self = this;
        Droppable.superclass.constructor.apply(self, arguments);
        self.addTarget(DDM);
        S.each([
        /**
         * fired after a draggable leaves a droppable
         * @event dropexit
         * @member KISSY.DD.DDM
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         *
         * fired after a draggable leaves a droppable
         * @event dropexit
         * @member KISSY.DD.Droppable
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            'dropexit',

        /**
         * fired after a draggable object mouseenter a droppable object
         * @event dropenter
         * @member KISSY.DD.DDM
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * fired after a draggable object mouseenter a droppable object
         * @event dropenter
         * @member KISSY.DD.Droppable
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

            'dropenter',

        /**
         *
         * fired after a draggable object mouseover a droppable object
         * @event dropover
         * @member KISSY.DD.DDM
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         *
         * fired after a draggable object mouseover a droppable object
         * @event dropover
         * @member KISSY.DD.Droppable
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            'dropover',

        /**
         *
         * fired after drop a draggable onto a droppable object
         * @event drophit
         * @member KISSY.DD.DDM
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         *
         * fired after drop a draggable onto a droppable object
         * @event drophit
         * @member KISSY.DD.Droppable
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            'drophit'
        ], function (e) {
            self.publish(e, {
                bubbles: 1
            });
        });
        self._init();
    }

    Droppable.ATTRS = {
        /**
         * droppable element
         * @cfg {String|HTMLElement|KISSY.NodeList} node
         * @member KISSY.DD.Droppable
         */
        /**
         * droppable element
         * @type {KISSY.NodeList}
         * @property node
         * @member KISSY.DD.Droppable
         */
        /**
         * @ignore
         */
        node: {
            setter: function (v) {
                if (v) {
                    return Node.one(v);
                }
            }
        },

        /**
         * groups this droppable object belongs to. true to match any group.
         * default  true
         * @cfg {Object|Boolean} groups
         * @member KISSY.DD.Droppable
         */
        /**
         * @ignore
         */
        groups: {
            value: true
        }

    };

    function validDrop(dropGroups, dragGroups) {
        if (dropGroups === true) {
            return 1;
        }
        for (var d in dropGroups) {
            if (dragGroups[d]) {
                return 1;
            }
        }
        return 0;
    }

    S.extend(Droppable, Base,
        {
            /**
             * Get drop node from target
             * @protected
             */
            getNodeFromTarget: function (ev, dragNode, proxyNode) {
                var node = this.get('node'),
                    domNode = node[0];
                // 排除当前拖放和代理节点
                return domNode == dragNode ||
                    domNode == proxyNode
                    ? null : node;
            },

            _init: function () {
                DDM._regDrop(this);
            },

            _active: function () {
                var self = this,
                    drag = DDM.get('activeDrag'),
                    node = self.get('node'),
                    dropGroups = self.get('groups'),
                    dragGroups = drag.get('groups');
                if (validDrop(dropGroups, dragGroups)) {
                    DDM._addValidDrop(self);
                    // 委托时取不到节点
                    if (node) {
                        node.addClass(PREFIX_CLS + 'drop-active-valid');
                        DDM.cacheWH(node);
                    }
                } else if (node) {
                    node.addClass(PREFIX_CLS + 'drop-active-invalid');
                }
            },

            _deActive: function () {
                var node = this.get('node');
                if (node) {
                    node.removeClass(PREFIX_CLS + 'drop-active-valid')
                        .removeClass(PREFIX_CLS + 'drop-active-invalid');
                }
            },

            __getCustomEvt: function (ev) {
                return S.mix({
                    drag: DDM.get('activeDrag'),
                    drop: this
                }, ev);
            },

            _handleOut: function () {
                var self = this,
                    ret = self.__getCustomEvt();
                self.get('node').removeClass(PREFIX_CLS + 'drop-over');

                // html5 => dragleave
                self.fire('dropexit', ret);
            },

            _handleEnter: function (ev) {
                var self = this,
                    e = self.__getCustomEvt(ev);
                e.drag._handleEnter(e);
                self.get('node').addClass(PREFIX_CLS + 'drop-over');
                self.fire('dropenter', e);
            },


            _handleOver: function (ev) {
                var self = this,
                    e = self.__getCustomEvt(ev);
                e.drag._handleOver(e);
                self.fire('dropover', e);
            },

            _end: function () {
                var self = this,
                    ret = self.__getCustomEvt();
                self.get('node').removeClass(PREFIX_CLS + 'drop-over');
                self.fire('drophit', ret);
            },

            /**
             * make this droppable' element undroppable
             */
            destroy: function () {
                DDM._unRegDrop(this);
            }
        });

    return Droppable;

}, { requires: ['node', 'base', './ddm'] });/**
 * @ignore
 * @fileOverview generate proxy drag object,
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/proxy', function (S, Node, Base, DDM) {
    var DESTRUCTOR_ID = '__proxy_destructors',
        stamp = S.stamp,
        MARKER = S.guid('__dd_proxy');

    /**
     * @extends KISSY.Base
     * @class KISSY.DD.Proxy
     * provide abilities for draggable tp create a proxy drag node,
     * instead of dragging the original node.
     */
    function Proxy() {
        var self = this;
        Proxy.superclass.constructor.apply(self, arguments);
        self[DESTRUCTOR_ID] = {};
    }

    Proxy.ATTRS = {
        /**
         * how to get the proxy node.
         * default clone the node itself deeply.
         * @cfg {Function} node
         */
        /**
         * @ignore
         */
        node: {
            value: function (drag) {
                return new Node(drag.get('node').clone(true));
            }
        },
        /**
         * destroy the proxy node at the end of this drag.
         * default false
         * @cfg {Boolean} destroyOnEnd
         */
        /**
         * @ignore
         */
        destroyOnEnd: {
            value: false
        },

        /**
         * move the original node at the end of the drag.
         * default true
         * @cfg {Boolean} moveOnEnd
         */
        /**
         * @ignore
         */
        moveOnEnd: {
            value: true
        },

        /**
         * Current proxy node.
         * @type {KISSY.NodeList}
         * @property proxyNode
         */
        /**
         * @ignore
         */
        proxyNode: {

        }
    };

    S.extend(Proxy, Base, {
        /**
         * make this draggable object can be proxied.
         * @param {KISSY.DD.Draggable} drag
         * @return {KISSY.DD.Proxy} this
         */
        attachDrag: function (drag) {

            var self = this,
                destructors = self[DESTRUCTOR_ID],
                tag = stamp(drag, 0, MARKER);

            if (destructors[tag]) {
                return self;
            }

            function start() {
                var node = self.get('node'),
                    dragNode = drag.get('node');
                // cache proxy node
                if (!self.get('proxyNode')) {
                    if (S.isFunction(node)) {
                        node = node(drag);
                        node.addClass('ks-dd-proxy');
                        node.css('position', 'absolute');
                        self.set('proxyNode', node);
                    }
                } else {
                    node = self.get('proxyNode');
                }
                node.show();
                dragNode.parent().append(node);
                DDM.cacheWH(node);
                node.offset(dragNode.offset());
                drag.setInternal('dragNode', dragNode);
                drag.setInternal('node', node);
            }

            function end() {
                var node = self.get('proxyNode');
                if (self.get('moveOnEnd')) {
                    drag.get('dragNode').offset(node.offset());
                }
                if (self.get('destroyOnEnd')) {
                    node.remove();
                    self.set('proxyNode', 0);
                } else {
                    node.hide();
                }
                drag.setInternal('node', drag.get('dragNode'));
            }

            drag.on('dragstart', start);
            drag.on('dragend', end);

            destructors[tag] = {
                drag: drag,
                fn: function () {
                    drag.detach('dragstart', start);
                    drag.detach('dragend', end);
                }
            };
            return self;
        },
        /**
         * make this draggable object unproxied
         * @param {KISSY.DD.Draggable} drag
         * @return {KISSY.DD.Proxy} this
         */
        detachDrag: function (drag) {
            var self = this,
                tag = stamp(drag, 1, MARKER),
                destructors = self[DESTRUCTOR_ID];
            if (tag && destructors[tag]) {
                destructors[tag].fn();
                delete destructors[tag];
            }
            return self;
        },

        /**
         * make all draggable object associated with this proxy object unproxied
         */
        destroy: function () {
            var self = this,
                node = self.get('node'),
                destructors = self[DESTRUCTOR_ID];
            if (node && !S.isFunction(node)) {
                node.remove();
            }
            for (var d in destructors) {
                this.detachDrag(destructors[d].drag);
            }
        }
    });

    // for compatibility
    var ProxyPrototype = Proxy.prototype;
    ProxyPrototype.attach = ProxyPrototype.attachDrag;
    ProxyPrototype.unAttach = ProxyPrototype.detachDrag;

    return Proxy;
}, {
    requires: ['node', 'base', './ddm']
});/**
 * @ignore
 * @fileOverview auto scroll for drag object's container
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/scroll', function (S, DDM, Base, Node, DOM) {

    var TAG_DRAG = '__dd-scroll-id-',
        win = S.Env.host,
        stamp = S.stamp,
        RATE = [10, 10],
        ADJUST_DELAY = 100,
        DIFF = [20, 20],
        DESTRUCTORS = '__dd_scrolls';

    /**
     * @class KISSY.DD.Scroll
     * Make parent node scroll while dragging.
     */
    function Scroll() {
        var self = this;
        Scroll.superclass.constructor.apply(self, arguments);
        self[DESTRUCTORS] = {};
    }

    Scroll.ATTRS = {
        /**
         * node to be scrolled while dragging
         * @cfg {window|String|HTMLElement} node
         */
        /**
         * @ignore
         */
        node: {
            // value:window：不行，默认值一定是简单对象
            valueFn: function () {
                return Node.one(win);
            },
            setter: function (v) {
                return Node.one(v);
            }
        },
        /**
         * adjust velocity, larger faster
         * default [10,10]
         * @cfg {Number[]} rate
         */
        /**
         * @ignore
         */
        rate: {
            value: RATE
        },
        /**
         * the margin to make node scroll, easier to scroll for node if larger.
         * default  [20,20]
         * @cfg {number[]} diff
         */
        /**
         * @ignore
         */
        diff: {
            value: DIFF
        }
    };


    var isWin = S.isWindow;

    S.extend(Scroll, Base, {
        /**
         * Get container node region.
         * @private
         */
        getRegion: function (node) {
            if (isWin(node[0])) {
                return {
                    width: DOM.viewportWidth(),
                    height: DOM.viewportHeight()
                };
            } else {
                return {
                    width: node.outerWidth(),
                    height: node.outerHeight()
                };
            }
        },

        /**
         * Get container node offset.
         * @private
         */
        getOffset: function (node) {
            if (isWin(node[0])) {
                return {
                    left: DOM.scrollLeft(),
                    top: DOM.scrollTop()
                };
            } else {
                return node.offset();
            }
        },

        /**
         * Get container node scroll.
         * @private
         */
        getScroll: function (node) {
            return {
                left: node.scrollLeft(),
                top: node.scrollTop()
            };
        },

        /**
         * scroll container node.
         * @private
         */
        setScroll: function (node, r) {
            node.scrollLeft(r.left);
            node.scrollTop(r.top);
        },

        /**
         * make node not to scroll while this drag object is dragging
         * @param {KISSY.DD.Draggable} drag
         * @return {KISSY.DD.Scroll} this
         */
        detachDrag: function (drag) {
            var tag,
                destructors = this[DESTRUCTORS];
            if (!(tag = stamp(drag, 1, TAG_DRAG)) ||
                !destructors[tag]) {
                return this;
            }
            destructors[tag].fn();
            delete destructors[tag];
            return this;
        },

        /**
         * make node not to scroll at all
         */
        destroy: function () {
            var self = this,
                destructors = self[DESTRUCTORS];
            S.each(destructors, function (v) {
                self.detachDrag(v.drag);
            });
        },

        /**
         * make node to scroll while this drag object is dragging
         * @param {KISSY.DD.Draggable} drag
         * @return {KISSY.DD.Scroll} this
         */
        attachDrag: function (drag) {
            var self = this,
                node = self.get('node'),
                tag = stamp(drag, 0, TAG_DRAG),
                destructors = self[DESTRUCTORS];

            if (destructors[tag]) {
                return this;
            }

            var rate = self.get('rate'),
                diff = self.get('diff'),
                event,
            /*
             目前相对 container 的偏移，container 为 window 时，相对于 viewport
             */
                dxy,
                timer = null;

            // fix https://github.com/kissyteam/kissy/issues/115
            // dragDelegate 时 可能一个 dragDelegate对应多个 scroll
            // check container
            function checkContainer() {
                if (isWin(node[0])) {
                    return 0;
                }
                // 判断 proxyNode，不对 dragNode 做大的改变
                var mousePos = drag.mousePos,
                    r = DDM.region(node);

                if (!DDM.inRegion(r, mousePos)) {
                    clearTimeout(timer);
                    timer = 0;
                    return 1;
                }
                return 0;
            }

            function dragging(ev) {
                // 给调用者的事件，框架不需要处理
                // fake 也表示该事件不是因为 mouseover 产生的
                if (ev.fake) {
                    return;
                }

                if (checkContainer()) {
                    return;
                }

                // 更新当前鼠标相对于拖节点的相对位置
                event = ev;
                dxy = S.clone(drag.mousePos);
                var offset = self.getOffset(node);
                dxy.left -= offset.left;
                dxy.top -= offset.top;
                if (!timer) {
                    checkAndScroll();
                }
            }

            function dragEnd() {
                clearTimeout(timer);
                timer = null;
            }

            drag.on('drag', dragging);

            drag.on('dragstart', function () {
                DDM.cacheWH(node);
            });

            drag.on('dragend', dragEnd);

            destructors[tag] = {
                drag: drag,
                fn: function () {
                    drag.detach('drag', dragging);
                    drag.detach('dragend', dragEnd);
                }
            };

            function checkAndScroll() {
                if (checkContainer()) {
                    return;
                }

                var r = self.getRegion(node),
                    nw = r.width,
                    nh = r.height,
                    scroll = self.getScroll(node),
                    origin = S.clone(scroll),
                    diffY = dxy.top - nh,
                    adjust = false;

                if (diffY >= -diff[1]) {
                    scroll.top += rate[1];
                    adjust = true;
                }

                var diffY2 = dxy.top;

                if (diffY2 <= diff[1]) {
                    scroll.top -= rate[1];
                    adjust = true;
                }

                var diffX = dxy.left - nw;

                if (diffX >= -diff[0]) {
                    scroll.left += rate[0];
                    adjust = true;
                }

                var diffX2 = dxy.left;

                if (diffX2 <= diff[0]) {
                    scroll.left -= rate[0];
                    adjust = true;
                }

                if (adjust) {
                    self.setScroll(node, scroll);
                    timer = setTimeout(checkAndScroll, ADJUST_DELAY);
                    // 不希望更新相对值，特别对于相对 window 时，相对值如果不真正拖放触发的 drag，是不变的，
                    // 不会因为程序 scroll 而改变相对值

                    // 调整事件，不需要 scroll 监控，达到预期结果：元素随容器的持续不断滚动而自动调整位置.
                    event.fake = true;
                    if (isWin(node[0])) {
                        // 当使 window 自动滚动时，也要使得拖放物体相对文档位置随 scroll 改变
                        // 而相对 node 容器时，只需 node 容器滚动，拖动物体相对文档位置不需要改变
                        scroll = self.getScroll(node);
                        event.left += scroll.left - origin.left;
                        event.top += scroll.top - origin.top;
                    }
                    // 容器滚动了，元素也要重新设置 left,top
                    if (drag.get('move')) {
                        drag.get('node').offset(event);
                    }
                    drag.fire('drag', event);
                } else {
                    timer = null;
                }
            }

            return this;
        }
    });

    // for compatibility
    var ScrollPrototype = Scroll.prototype;
    ScrollPrototype.attach = ScrollPrototype.attachDrag;
    ScrollPrototype.unAttach = ScrollPrototype.detachDrag;
    return Scroll;
}, {
    requires: ['./ddm', 'base', 'node', 'dom']
});
