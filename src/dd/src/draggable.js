/**
 * @fileOverview dd support for kissy, drag for dd
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/draggable', function (S, UA, Node, Base, DDM) {


    var each = S.each,
        ie = UA['ie'],
        NULL = null,
        doc = document;

    /**
     * @extends Base
     * @class make a node draggable
     * @memberOf DD
     */
    function Draggable() {

        var self = this;
        Draggable.superclass.constructor.apply(self, arguments);
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
         * @description 拖放节点，可能指向 proxy node
         * @type {HTMLElement}
         */
        node:{
            setter:function (v) {
                return Node.one(v);
            }
        },

        /**
         * 启动拖放的移动的临界元素数
         * @type {Number}
         */
        clickPixelThresh:{
            valueFn:function () {
                return DDM.get("clickPixelThresh");
            }
        },

        /**
         * 启动拖放的移动的临界延迟
         * @type {Number} 毫秒
         */
        bufferTime:{
            valueFn:function () {
                return DDM.get("bufferTime");
            }
        },

        /**
         * 真实的节点
         * @type {HTMLElement}
         */
        dragNode:{},

        /**
         * 是否需要遮罩跨越 iframe 以及其他阻止 mousemove 事件的元素
         * @type {boolean}
         */
        shim:{
            value:true
        },

        /**
         * handler 数组，注意暂时必须在 node 里面
         * @type {HTMLElement[]|Function[]|String[]}
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
         * 激活 drag 的 handler
         * @type {NodeList}
         */
        activeHandler:{},

        /**
         * 当前拖对象是否开始运行，用于调用者监听 change 事件
         * @type {boolean}
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
         * 拖放模式
         * @type {Number}
         */
        mode:{
            /**
             * @enum point,intersect,strict
             * @description
             *  In point mode, a Drop is targeted by the cursor being over the Target
             *  In intersect mode, a Drop is targeted by "part" of the drag node being over the Target
             *  In strict mode, a Drop is targeted by the "entire" drag node being over the Target             *
             */
            value:'point'
        },

        /**
         * 拖无效
         * @type {boolean}
         */
        disabled:{
            value:false,
            setter:function (d) {
                this.get("dragNode")[d ? 'addClass' :
                    'removeClass'](DDM.get("prefixCls") + '-disabled');
                return d;
            }
        },

        /**
         * whether the node moves with drag object
         * @type {boolean}
         */
        move:{
            value:false
        },

        /**
         * only left button of mouse trigger drag?
         * @type {boolean}
         */
        primaryButtonOnly:{
            value:true
        },

        /**
         * whether halt mousedown
         * @type {boolean}
         * @default true
         */
        halt:{
            value:true
        },

        /**
         * groups this draggable object belongs to
         * @type {Object}
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
             */
            startMousePos:NULL,

            /**
             * 开始拖时节点所在位置，例如
             *  {x:100,y:200}
             * @type Object
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

            _init:function () {
                var self = this,
                    node = self.get('node');
                self.set("dragNode", node);
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
                        self.set("activeHandler", handler);
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

                DDM.fire("dragalign", {
                    info:ret
                });

                var def = 1;

                if (self.fire("drag", ret) === false) {
                    def = 0;
                }
                if (DDM.fire("drag", ret) === false) {
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
                    self.set("dragging", 0);
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
                self.set("dragging", 1);
                DDM._start();
                self.fire("dragstart", {
                    drag:self
                });
            },

            /**
             * 销毁
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
