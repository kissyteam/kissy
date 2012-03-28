/**
 * @fileOverview dd support for kissy, drag for dd
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/draggable', function (S, UA, Node, Base, DDM) {

    var each = S.each,
        ie = UA['ie'],
        NULL = null,
        doc = S.Env.host.document;

    /**
     * @extends Base
     * @class Provide abilities to make specified node draggable
     * @memberOf DD
     */
    function Draggable() {
        var self = this;
        Draggable.superclass.constructor.apply(self, arguments);
        self.addTarget(DDM);
        S.each([

        /**
         * @name DD.DDM#dragalign
         * @description fired when need to compute draggable's posititon during dragging
         * @event
         * @param e
         * @param e.drag current draggable object
         */

        /**
         * @name DD.Draggable#dragalign
         * @description fired when need to compute draggable's posititon during dragging
         * @event
         * @param e
         * @param e.drag current draggable object
         */
            "dragalign",

        /**
         * @name DD.DDM#drag
         * @description fired during dragging
         * @event
         * @param e
         * @param e.drag current draggable object
         */

        /**
         * @name DD.Draggable#drag
         * @description fired during dragging
         * @event
         * @param e
         * @param e.drag current draggable object
         */
            "drag",

        /**
         * @name DD.DDM#dragdrophit
         * @description fired after drop a draggable onto a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * @name DD.Draggable#dragdrophit
         * @description fired after drop a draggable onto a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            "dragdrophit",


        /**
         * @name DD.DDM#dragend
         * @description fired after drag
         * @event
         * @param e
         * @param e.drag current draggable object
         */

        /**
         * @name DD.Draggable#dragend
         * @description fired after drag
         * @event
         * @param e
         * @param e.drag current draggable object
         */
            "dragend",


        /**
         * @name DD.DDM#dragdropmiss
         * @description fired after drop a draggable onto nothing
         * @event
         * @param e
         * @param e.drag current draggable object
         */

        /**
         * @name DD.Draggable#dragdropmiss
         * @description fired after drop a draggable onto nothing
         * @event
         * @param e
         * @param e.drag current draggable object
         */
            "dragdropmiss",


        /**
         * @name DD.DDM#dragexit
         * @description fired after a draggable leaves a droppable
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * @name DD.Draggable#dragexit
         * @description fired after a draggable leaves a droppable
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            "dragexit",


        /**
         * @name DD.DDM#dragenter
         * @description fired after a draggable object mouseenter a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * @name DD.Draggable#dragenter
         * @description fired after a draggable object mouseenter a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            "dragenter",


        /**
         * @name DD.DDM#dragover
         * @description fired after a draggable object mouseover a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * @name DD.Draggable#dragover
         * @description fired after a draggable object mouseover a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            "dragover",


        /**
         * @name DD.DDM#dragstart
         * @description fired after a draggable object start to drag
         * @event
         * @param e
         * @param e.drag current draggable object
         */

        /**
         * @name DD.Draggable#dragstart
         * @description fired after a draggable object start to drag
         * @event
         * @param e
         * @param e.drag current draggable object
         */
            "dragstart"
        ], function (e) {
            self.publish(e, {
                bubbles:1
            });
        });
        // dragNode is equal to node in single mode
        self.__set("dragNode", self.get("node"));
        self.on("afterDisabledChange", self._uiSetDisabledChange, self);
        var disabled;
        if (disabled = self.get("disabled")) {
            self._uiSetDisabledChange(disabled);
        }
        self._init();
    }

    Draggable['POINT'] = "point";
    Draggable.INTERSECT = "intersect";
    Draggable.STRICT = "strict";
    /**
     * @ignore
     */
    Draggable.ATTRS =
    /**
     * @lends DD.Draggable#
     */
    {

        /**
         * the dragged node. maybe a proxy node.
         * @type HTMLElement
         */
        node:{
            setter:function (v) {
                return Node.one(v);
            }
        },

        /**
         * the number of pixels to move to start a drag operation,default is 3.
         * @type Number
         */
        clickPixelThresh:{
            valueFn:function () {
                return DDM.get("clickPixelThresh");
            }
        },

        /**
         * the number of milliseconds to start a drag operation after mousedown,default is 1000
         * @type Number
         */
        bufferTime:{
            valueFn:function () {
                return DDM.get("bufferTime");
            }
        },

        /**
         * the draggable element
         * @type HTMLElement
         */
        dragNode:{},

        /**
         * use protective shim to cross iframe.default:true
         * @type boolean
         */
        shim:{
            value:true
        },

        /**
         * valid handlers to initiate a drag operation
         * @type HTMLElement[]|Function[]|String[]
         */
        handlers:{
            value:[],
            getter:function (vs) {
                var self = this;
                if (!vs.length) {
                    vs[0] = self.get("node");
                }
                each(vs, function (v, i) {
                    if (S.isFunction(v)) {
                        v = v.call(self);
                    }
                    if (S.isString(v) || v.nodeType) {
                        v = Node.one(v);
                    }
                    vs[i] = v;
                });
                self.__set("handlers", vs);
                return vs;
            }
        },

        /**
         * the handler which fired the drag event.
         * @type NodeList
         */
        activeHandler:{},

        /**
         * indicate whether this draggable object is being dragged
         * @type boolean
         */
        dragging:{
            value:false,
            setter:function (d) {
                var self = this;
                self.get("dragNode")[d ? 'addClass' : 'removeClass']
                    (DDM.get("prefixCls") + "dragging");
            }
        },

        /**
         * <pre>
         * can be set 'point' or 'intersect' or 'strict'
         * In point mode, a Drop is targeted by the cursor being over the Target
         * In intersect mode, a Drop is targeted by "part" of the drag node being over the Target
         * In strict mode, a Drop is targeted by the "entire" drag node being over the Target
         * </pre>
         * @type String
         */
        mode:{
            value:'point'
        },

        /**
         * set to disable this draggable so that it can not be dragged. default:false
         * @type boolean
         */
        disabled:{
            value:false
        },

        /**
         * whether the drag node moves with cursor.default:false,can be used to resize element.
         * @type boolean
         */
        move:{
            value:false
        },

        /**
         * whether a drag operation can only be trigged by primary(left) mouse button.
         * Setting false will allow for all mousedown events to trigger drag.
         * @type boolean
         */
        primaryButtonOnly:{
            value:true
        },

        /**
         * whether halt mousedown event. default:true
         * @type boolean
         */
        halt:{
            value:true
        },

        /**
         * groups this draggable object belongs to
         * @type Object
         * @example
         * <code>
         * {
         *     "group1":1,
         *     "group2":1
         * }
         * </code>
         */
        groups:{
            value:{}
        }

    };


    var _ieSelectBack;

    function fixIEMouseUp() {
        doc.body.onselectstart = _ieSelectBack;
    }

    /**
     * prevent select text in ie
     */
    function fixIEMouseDown() {
        _ieSelectBack = doc.body.onselectstart;
        doc.body.onselectstart = fixIESelect;
    }

    /**
     * keeps IE from blowing up on images as drag handlers.
     * 防止 html5 draggable 元素的拖放默认行为
     * @param e
     */
    function fixDragStart(e) {
        e.preventDefault();
    }

    /**
     * keeps IE from selecting text
     */
    function fixIESelect() {
        return false;
    }


    /**
     * 鼠标按下时，查看触发源是否是属于 handler 集合，
     * 保存当前状态
     * 通知全局管理器开始作用
     * @param ev
     */
    function _handleMouseDown(ev) {
        var self = this,
            t = ev.target;

        if (self._checkMouseDown(ev)) {

            if (!self._check(t)) {
                return;
            }

            self._prepare(ev);
        }
    }

    S.extend(Draggable, Base,
        /**
         * @lends DD.Draggable#
         */
        {

            /**
             * 开始拖时鼠标所在位置，例如
             *  {x:100,y:200}
             * @type Object
             * @private
             */
            startMousePos:NULL,

            /**
             * 开始拖时节点所在位置，例如
             *  {x:100,y:200}
             * @type Object
             * @private
             */
            startNodePos:NULL,

            /**
             * 开始拖时鼠标和节点所在位置的差值
             */
            _diff:NULL,

            /**
             * mousedown 1秒后自动开始拖的定时器
             */
            _bufferTimer:NULL,

            _uiSetDisabledChange:function (d) {
                this.get("dragNode")[d ? 'addClass' :
                    'removeClass'](DDM.get("prefixCls") + '-disabled');
            },

            _init:function () {
                var self = this,
                    node = self.get('node');
                node.on('mousedown', _handleMouseDown, self)
                    .on('dragstart', self._fixDragStart);
            },

            _fixDragStart:fixDragStart,

            /**
             *
             * @param {HTMLElement} t
             */
            _check:function (t) {
                var self = this,
                    handlers = self.get('handlers'),
                    ret = 0;
                each(handlers, function (handler) {
                    //子区域内点击也可以启动
                    if (handler.contains(t) ||
                        handler[0] == t) {
                        ret = 1;
                        self.__set("activeHandler", handler);
                        return false;
                    }
                });
                return ret;
            },

            _checkMouseDown:function (ev) {
                if (this.get('primaryButtonOnly') && ev.button > 1 ||
                    this.get("disabled")) {
                    return 0;
                }
                return 1;
            },

            _prepare:function (ev) {

                var self = this;

                if (ie) {
                    fixIEMouseDown();
                }

                // 防止 firefox/chrome 选中 text
                if (self.get("halt")) {
                    ev.halt();
                } else {
                    ev.preventDefault();
                }

                var node = self.get("node"),
                    mx = ev.pageX,
                    my = ev.pageY,
                    nxy = node.offset();
                self.startMousePos = self.mousePos = {
                    left:mx,
                    top:my
                };
                self.startNodePos = nxy;
                self._diff = {
                    left:mx - nxy.left,
                    top:my - nxy.top
                };
                DDM._regToDrag(self);

                var bufferTime = self.get("bufferTime");

                // 是否中央管理，强制限制拖放延迟
                if (bufferTime) {
                    self._bufferTimer = setTimeout(function () {
                        // 事件到了，仍然是 mousedown 触发！
                        //S.log("drag start by timeout");
                        self._start();
                    }, bufferTime);
                }

            },

            _clearBufferTimer:function () {
                var self = this;
                if (self._bufferTimer) {
                    clearTimeout(self._bufferTimer);
                    self._bufferTimer = 0;
                }
            },

            _move:function (ev) {
                var self = this,
                    ret,
                    diff = self._diff,
                    startMousePos = self.startMousePos,
                    pageX = ev.pageX,
                    pageY = ev.pageY,
                    left = pageX - diff.left,
                    top = pageY - diff.top;


                if (!self.get("dragging")) {
                    var clickPixelThresh = self.get("clickPixelThresh");
                    // 鼠标经过了一定距离，立即开始
                    if (Math.abs(pageX - startMousePos.left) >= clickPixelThresh ||
                        Math.abs(pageY - startMousePos.top) >= clickPixelThresh) {
                        //S.log("start drag by pixel : " + l1 + " : " + l2);
                        self._start();
                    }
                    // 开始后，下轮 move 开始触发 drag 事件
                    return;
                }

                self.mousePos = {
                    left:pageX,
                    top:pageY
                };

                ret = {
                    left:left,
                    top:top,
                    pageX:pageX,
                    pageY:pageY,
                    drag:self
                };

                self.fire("dragalign", {
                    info:ret
                });

                var def = 1;

                if (self.fire("drag", ret) === false) {
                    def = 0;
                }

                if (def && self.get("move")) {
                    // 取 'node' , 改 node 可能是代理哦
                    self.get('node').offset(ret);
                }
            },

            _end:function () {
                var self = this,
                    activeDrop;

                // 否则清除定时器即可
                self._clearBufferTimer();
                if (ie) {
                    fixIEMouseUp();
                }
                // 如果已经开始，收尾工作
                if (self.get("dragging")) {
                    self.get("node").removeClass(DDM.get("prefixCls") + "drag-over");
                    if (activeDrop = DDM.get("activeDrop")) {
                        self.fire('dragdrophit', {
                            drag:self,
                            drop:activeDrop
                        });
                    } else {
                        self.fire('dragdropmiss', {
                            drag:self
                        });
                    }
                    self.__set("dragging", 0);
                    self.fire("dragend", {
                        drag:self
                    });
                }
            },

            _handleOut:function () {
                var self = this;
                self.get("node").removeClass(DDM.get("prefixCls") + "drag-over");
                /**
                 *  html5 => dragleave
                 */
                self.fire("dragexit", {
                    drag:self,
                    drop:DDM.get("activeDrop")
                });
            },

            /**
             *
             * @param e
             */
            _handleEnter:function (e) {
                var self = this;
                self.get("node").addClass(DDM.get("prefixCls") + "drag-over");
                //第一次先触发 dropenter,dragenter
                self.fire("dragenter", e);
            },


            _handleOver:function (e) {
                this.fire("dragover", e);
            },

            _start:function () {
                var self = this;
                self._clearBufferTimer();
                self.__set("dragging", 1);
                DDM._start();
                self.fire("dragstart", {
                    drag:self
                });
            },

            /**
             * make the drag node undraggable
             */
            destroy:function () {
                var self = this,
                    node = self.get('dragNode');
                node.detach('mousedown', _handleMouseDown, self)
                    .detach('dragstart', self._fixDragStart);
                self.detach();
            }
        });

    return Draggable;

}, {
    requires:["ua", "node", "base", "./ddm"]
});
