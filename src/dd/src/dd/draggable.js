/**
 * @ignore
 * dd support for kissy, drag for dd
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node'),
        BaseGesture = require('event/gesture/base'),
        DDM = require('./ddm'),
        Base = require('base'),
        DragGesture = require('event/gesture/drag');

    var UA = require('ua'),
        $ = Node.all,
        $doc = $(document),
        each = S.each,
        ie = UA.ie,
        PREFIX_CLS = DDM.PREFIX_CLS,
        doc = S.Env.host.document;

    function checkValid(fn) {
        return function () {
            if (this._isValidDrag) {
                fn.apply(this, arguments);
            }
        };
    }

    var onDragStart = checkValid(function (e) {
        this._start(e);
    });

    var onDrag = checkValid(function (e) {
        this._move(e);
    });

    var onDragEnd = checkValid(function (e) {
        this._end(e);
    });

    /**
     * @class KISSY.DD.Draggable
     * @extends KISSY.Base
     * Provide abilities to make specified node draggable
     */
    var Draggable = Base.extend({
        initializer: function () {
            var self = this;
            self.addTarget(DDM);
            self._allowMove = self.get('move');

            /**
             * fired when need to compute draggable 's position during dragging
             * @event dragalign
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             */

            /**
             * fired when need to get draggable 's position during dragging
             * @event dragalign
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             */

            /**
             * fired during dragging
             * @event drag
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEvent.Object} e
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
             * @param {KISSY.Event.CustomEvent.Object} e
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
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after drop a draggable onto a droppable object
             * @event dragdrophit
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after drag
             * @event dragend
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             */

            /**
             * fired after drag
             * @event dragend
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             */

            /**
             * fired after drop a draggable onto nothing
             * @event dragdropmiss
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             */

            /**
             * fired after drop a draggable onto nothing
             * @event dragdropmiss
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             */

            /**
             * fired after a draggable leaves a droppable
             * @event dragexit
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after a draggable leaves a droppable
             * @event dragexit
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after a draggable object mouseenter a droppable object
             * @event dragenter
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after a draggable object mouseenter a droppable object
             * @event dragenter
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after a draggable object mouseover a droppable object
             * @event dragover
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after a draggable object mouseover a droppable object
             * @event dragover
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after a draggable object start to drag
             * @event dragstart
             * @member KISSY.DD.DDM
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             */

            /**
             * fired after a draggable object start to drag
             * @event dragstart
             * @member KISSY.DD.Draggable
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param e.drag current draggable object
             */
        },

        _onSetNode: function (n) {
            var self = this;
            // dragNode is equal to node in single mode
            self.setInternal('dragNode', n);
        },

        onGestureStart: function (e) {
            var self = this,
                t = e.target;

            if (self._checkDragStartValid(e)) {
                if (!self._checkHandler(t)) {
                    return;
                }
                self._prepare(e);
            }
        },

        getEventTargetEl: function () {
            return this.get('node');
        },

        start: function () {
            var self = this,
                node = self.getEventTargetEl();
            if (node) {
                node.on(DragGesture.DRAG_START, onDragStart, self)
                    .on(DragGesture.DRAG, onDrag, self)
                    .on(DragGesture.DRAG_END, onDragEnd, self)
                    .on(BaseGesture.START, onGestureStart, self)
                    .on(['dragstart',DragGesture.DRAGGING], preventDefault);
            }
        },

        stop: function () {
            var self = this,
                node = self.getEventTargetEl();
            if (node) {
                node.detach(DragGesture.DRAG_START, onDragStart, self)
                    .detach(DragGesture.DRAG, onDrag, self)
                    .detach(DragGesture.DRAG_END, onDragEnd, self)
                    .detach(BaseGesture.START, onGestureStart, self)
                    .detach(['dragstart',DragGesture.DRAGGING], preventDefault);
            }
        },

        _onSetDisabled: function (d) {
            var self = this,
                node = self.get('dragNode');
            if (node) {
                node[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
            }
            self[d ? 'stop' : 'start']();
        },

        _checkHandler: function (t) {
            var self = this,
                handlers = self.get('handlers'),
                ret = 0;
            each(handlers, function (handler) {
                //子区域内点击也可以启动
                if (handler[0] === t || handler.contains(t)) {
                    ret = 1;
                    self.setInternal('activeHandler', handler);
                    return false;
                }
                return undefined;
            });
            return ret;
        },

        _checkDragStartValid: function (e) {
            var self = this;
            if (self.get('primaryButtonOnly') && e.which !== 1) {
                return 0;
            }
            return 1;
        },

        _prepare: function (e) {
            var self = this;

            self._isValidDrag = 1;

            if (ie) {
                fixIEMouseDown();
                $doc.on(BaseGesture.END, {
                    fn: fixIEMouseUp,
                    once: true
                });
            }

            // http://blogs.msdn.com/b/ie/archive/2011/10/19/handling-multi-touch-and-mouse-input-in-all-browsers.aspx
            // stop panning and zooming so we can draw for win8?
//            if (e.originalEvent['preventManipulation']) {
//                e.originalEvent.preventManipulation();
//            }

            // 防止 firefox/chrome 选中 text
            // 非 ie，阻止了 html dd 的默认行为
            if (self.get('halt')) {
                e.stopPropagation();
            }

            // in touch device
            // prevent touchdown will prevent native scroll
            // need to prevent on move conditionally
            // will prevent text selection and link click
            if (e.gestureType === 'mouse') {
                e.preventDefault();
            }

            if (self._allowMove) {
                self.setInternal('startNodePos', self.get('node').offset());
            }
        },

        _start: function (e) {
            var self = this;
            self.mousePos = {
                left: e.pageX,
                top: e.pageY
            };
            DDM.start(e, self);
            self.fire('dragstart', {
                drag: self,
                gestureType: e.gestureType,
                startPos: e.startPos,
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                pageX: e.pageX,
                pageY: e.pageY
            });
            self.get('dragNode').addClass(PREFIX_CLS + 'dragging');
        },

        _move: function (e) {
            var self = this,
                pageX = e.pageX,
                pageY = e.pageY;

            // prevent touch scroll
            if (e.gestureType === 'touch') {
                e.preventDefault();
            }

            self.mousePos = {
                left: pageX,
                top: pageY
            };

            var customEvent = {
                drag: self,
                gestureType: e.gestureType,
                startPos: e.startPos,
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                pageX: e.pageX,
                pageY: e.pageY
            };

            var move = self._allowMove;

            if (move) {
                var startNodePos = self.get('startNodePos');
                var left = startNodePos.left + e.deltaX,
                    top = startNodePos.top + e.deltaY;
                customEvent.left = left;
                customEvent.top = top;
                self.setInternal('actualPos', {
                    left: left,
                    top: top
                });
                self.fire('dragalign', customEvent);
            }

            var def = 1;

            // allow call preventDefault on handlers
            if (self.fire('drag', customEvent) === false) {
                def = 0;
            }

            DDM.move(e, self);

            // 防止 ie 选择到字
            // touch need direction
            if (self.get('preventDefaultOnMove')) {
                e.preventDefault();
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
            if (this._isValidDrag) {
                this._end();
            }
        },

        _end: function (e) {
            e = e || {};

            var self = this,
                activeDrop;

            self._isValidDrag = 0;

            // 如果已经开始，收尾工作
            self.get('node').removeClass(PREFIX_CLS + 'drag-over');

            self.get('dragNode').removeClass(PREFIX_CLS + 'dragging');

            if ((activeDrop = DDM.get('activeDrop'))) {
                self.fire('dragdrophit', {
                    drag: self,
                    drop: activeDrop
                });
            } else {
                self.fire('dragdropmiss', {
                    drag: self
                });
            }

            DDM.end(e, self);

            self.fire('dragend', {
                drag: self,
                gestureType: e.gestureType,
                startPos: e.startPos,
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                pageX: e.pageX,
                pageY: e.pageY
            });
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

        /**
         * make the drag node undraggable
         * @member KISSY.DD.Draggable
         * @private
         */
        destructor: function () {
            this.stop();
        }
    }, {
        name: 'Draggable',

        ATTRS: {
            /**
             * the dragged node. maybe a proxy node.
             * @property node
             * @type {HTMLElement|KISSY.Node}
             * @readonly
             */

            /**
             * the dragged node.
             * @cfg {HTMLElement|KISSY.Node} node
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
             * Defaults to: false
             *
             * @cfg {Boolean} shim
             *
             */
            /**
             * @ignore
             */
            shim: {
                value: false
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
                        if (typeof v === 'function') {
                            v = v.call(self);
                        }
                        // search inside node
                        if (typeof v === 'string') {
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
             * @type {KISSY.Node}
             * @property activeHandler
             * @readonly
             */
            /**
             * @ignore
             */
            activeHandler: {},

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
            startNodePos: {},

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
            actualPos: {},

            preventDefaultOnMove: {
                value: true
            }
        },

        inheritedStatics: {
            /**
             * drag drop mode enum.
             * @enum {String} KISSY.DD.Draggable.DropMode
             */
            DropMode: {
                /**
                 * In point mode, a Drop is targeted by the cursor being over the Target
                 */
                POINT: 'point',
                /**
                 * In intersect mode, a Drop is targeted by 'part' of the drag node being over the Target
                 */
                INTERSECT: 'intersect',
                /**
                 * In strict mode, a Drop is targeted by the 'entire' drag node being over the Target
                 */
                STRICT: 'strict'
            }
        }
    });

    var _ieSelectBack;

    function fixIEMouseUp() {
        doc.body.onselectstart = _ieSelectBack;
        // http://stackoverflow.com/questions/1685326/responding-to-the-onmousemove-event-outside-of-the-browser-window-in-ie
        // ie6 will not response to event when cursor is out of window.
        if (doc.body.releaseCapture) {
            doc.body.releaseCapture();
        }
    }

    // prevent select text in ie
    function fixIEMouseDown() {
        _ieSelectBack = doc.body.onselectstart;
        doc.body.onselectstart = fixIESelect;
        // http://stackoverflow.com/questions/1685326/responding-to-the-onmousemove-event-outside-of-the-browser-window-in-ie
        // ie6 will not response to event when cursor is out of window.
        if (doc.body.setCapture) {
            doc.body.setCapture();
        }
    }

    /*
     1. keeps IE from blowing up on images as drag handlers.
     IE 在 img 上拖动时默认不能拖动（不触发 mousemove，mouseup 事件，mouseup 后接着触发 mousemove ...）
     2. 防止 html5 draggable 元素的拖放默认行为 (选中文字拖放)
     3. 防止默认的选择文本行为(??场景？)
     */
    function preventDefault(e) {
        e.preventDefault();
    }

    /*
     keeps IE from selecting text
     */
    function fixIESelect() {
        return false;
    }

    function onGestureStart(e) {
        this._isValidDrag = 0;
        this.onGestureStart(e);
    }

    return Draggable;
});