/**
 * @ignore
 * dd support for kissy, drag for dd
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/base/draggable', function (S, Node, RichBase, DDM, Event) {

    var UA = S.UA,
        $ = Node.all,
        Features = S.Features,
        isTouchSupported = Features.isTouchSupported(),
        each = S.each,
    // !! use singleTouchStart in touch to normalize gesture event
        DRAG_START_EVENT = isTouchSupported ? 'singleTouchStart' : Event.Gesture.start,
        ie = UA['ie'],
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

            self._allowMove = self.get('move');
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
                if (handler[0] == t || handler.contains(t)) {
                    ret = 1;
                    self.setInternal('activeHandler', handler);
                    return false;
                }
                return undefined;
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

            var self = this;

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
            // if (!isTouchSupported) {
            ev.preventDefault();
            // }

            var mx = ev.pageX,
                my = ev.pageY;

            self.setInternal('startMousePos', self.mousePos = {
                left: mx,
                top: my
            });

            if (self._allowMove) {

                var node = self.get('node'),
                    nxy = node.offset();
                self.setInternal('startNodePos', nxy);
                self.setInternal('deltaPos', {
                    left: mx - nxy.left,
                    top: my - nxy.top
                });

            }

            DDM._regToDrag(self);

            var bufferTime = self.get('bufferTime');

            // 是否中央管理，强制限制拖放延迟
            if (bufferTime) {
                self._bufferTimer = setTimeout(function () {
                    // 事件到了，仍然是 mousedown 触发！
                    //S.log('drag start by timeout');
                    self._start(ev);
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
                    start = 0,
                    clickPixelThresh = self.get('clickPixelThresh');
                // 鼠标经过了一定距离，立即开始
                if (Math.abs(pageX - startMousePos.left) >= clickPixelThresh ||
                    Math.abs(pageY - startMousePos.top) >= clickPixelThresh) {
                    //S.log('start drag by pixel : ' + l1 + ' : ' + l2);
                    self._start(ev);
                    start = 1;
                }
                // 2013-02-12 更快速响应 touch，本轮就触发 drag 事件
                if (!start) {
                    return;
                }
            }

            self.mousePos = {
                left: pageX,
                top: pageY
            };

            ret = {
                pageX: pageX,
                pageY: pageY,
                drag: self
            };

            var move = self._allowMove;

            if (move) {
                var diff = self.get('deltaPos'),
                    left = pageX - diff.left,
                    top = pageY - diff.top;
                ret.left = left;
                ret.top = top;
                self.setInternal('actualPos', {
                    left: left,
                    top: top
                });
                self.fire('dragalign', ret);
            }

            var def = 1;

            if (self.fire('drag', ret) === false) {
                def = 0;
            }

            if (def && move) {
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

        _end: function (e) {

            e = e || {};

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
                    drag: self,
                    pageX: e.pageX,
                    pageY: e.pageY
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

        _start: function (ev) {
            var self = this;
            self._clearBufferTimer();
            self.setInternal('dragging', 1);
            self.setInternal('dragStartMousePos', {
                left: ev.pageX,
                top: ev.pageY
            });
            DDM._start();
            self.fire('dragstart', {
                drag: self,
                pageX: ev.pageX,
                pageY: ev.pageY
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

        name: 'Draggable',

        DRAG_START_EVENT: DRAG_START_EVENT,

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
                    return undefined;
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
                value: !isTouchSupported
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
             * groups this draggable object belongs to, can interact with droppable.
             * if this draggable does not want to interact with droppable for performance,
             * can set this to false.
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
                value: true
            },

            /**
             * mouse position at mousedown
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
             * mouse position at drag start
             * for example:
             *      @example
             *      {
             *          left: 100,
             *          top: 200
             *      }
             *
             * @property dragStartMousePos
             * @type {Object}
             * @readonly
             */
            /**
             * @ignore
             */
            dragStartMousePos: {

            },

            /**
             * node position ar drag start.
             * only valid when move is set to true.
             *
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
             * The offset of the mouse position to the element's position.
             * only valid when move is set to true.
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
             * The xy that the node will be set to.
             * Changing this will alter the position as it's dragged.
             * only valid when move is set to true.
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
