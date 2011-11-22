/**
 * dd support for kissy, drag for dd
 * @author  yiminghe@gmail.com
 */
KISSY.add('dd/draggable', function(S, UA, Node, Base, DDM) {

    var each = S.each;

    /*
     拖放纯功能类
     */
    function Draggable() {
        var self = this;
        Draggable.superclass.constructor.apply(self, arguments);
        self._init();
    }

    Draggable['POINT'] = "point";
    Draggable.INTERSECT = "intersect";
    Draggable.STRICT = "strict";

    Draggable.ATTRS = {
        /**
         * 拖放节点，可能指向 proxy node
         */
        node: {
            setter:function(v) {
                return Node.one(v);
            }
        },


        clickPixelThresh:{
            value: DDM.get("clickPixelThresh")
        },

        bufferTime:{
            value:  DDM.get("bufferTime")
        },

        /*
         真实的节点
         */
        dragNode:{},

        /**
         * 是否需要遮罩跨越 iframe 以及其他阻止 mousemove 事件的元素
         */
        shim:{
            value:true
        },

        /**
         * handler 数组，注意暂时必须在 node 里面
         */
        handlers:{
            value:[],
            getter:function(vs) {
                var self = this;
                if (!vs.length) {
                    vs[0] = self.get("node");
                }
                each(vs, function(v, i) {
                    if (S.isFunction(v)) {
                        v = v.call(self);
                    }
                    if (S.isString(v) || v.nodeType) {
                        v = Node.one(v);
                    }
                    //ie 不能在其内开始选择区域
                    v.unselectable();
                    vs[i] = v;
                });
                self.__set("handlers", vs);
                return vs;
            }
        },

        /**
         * 激活 drag 的 handler
         */
        activeHandler:{},

        mode:{
            /**
             * @enum point,intersect,strict
             * @description
             *  In point mode, a Drop is targeted by the cursor being over the Target
             *  In intersect mode, a Drop is targeted by "part" of the drag node being over the Target
             *  In strict mode, a Drop is targeted by the "entire" drag node being over the Target             *
             */
            value:'point'
        }

    };

    S.extend(Draggable, Base, {

        /**
         * 是否已经开始拖放
         */
        __started:0,

        _init: function() {
            var self = this,
                node = self.get('node');
            self.set("dragNode", node);
            node.on('mousedown', self._handleMouseDown, self);
        },

        destroy:function() {
            var self = this,
                node = self.get('dragNode');
            node.detach('mousedown', self._handleMouseDown, self);
            self.detach();
        },

        _check: function(t) {
            var self = this,
                handlers = self.get('handlers'),
                ret = 0;
            each(handlers, function(handler) {
                //子区域内点击也可以启动
                if (handler.contains(t) ||
                    handler[0] == t[0]) {
                    ret = 1;
                    self.set("activeHandler", handler);
                    return false;
                }
            });
            return ret;
        },

        /**
         * 鼠标按下时，查看触发源是否是属于 handler 集合，
         * 保存当前状态
         * 通知全局管理器开始作用
         * @param ev
         */
        _handleMouseDown: function(ev) {
            var self = this,
                t = new Node(ev.target);

            if (!self._check(t)) {
                return;
            }
            //chrome 阻止了 flash 点击？？
            //不组织的话chrome会选择
            //firefox 默认会拖动对象地址
            ev.preventDefault();
            self._prepare(ev);

        },

        _prepare:function(ev) {
            var self = this,
                node = self.get("node"),
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
                self._bufferTimer = setTimeout(function() {
                    // 事件到了，仍然是 mousedown 触发！
                    S.log("drag start by timeout");
                    self._start();
                }, bufferTime);
            }

        },

        _clearBufferTimer:function() {
            var self = this;
            if (self._bufferTimer) {
                clearTimeout(self._bufferTimer);
                self._bufferTimer = 0;
            }
        },

        _move: function(ev) {
            var self = this,
                ret,
                diff = self._diff,
                startMousePos = self.startMousePos,
                pageX = ev.pageX,
                pageY = ev.pageY,
                left = pageX - diff.left,
                top = pageY - diff.top;


            if (!self.__started) {
                var clickPixelThresh = self.get("clickPixelThresh"),l1,l2;
                // 鼠标经过了一定距离，立即开始
                if ((l1 = Math.abs(pageX - startMousePos.left)) >= clickPixelThresh ||
                    (l2 = Math.abs(pageY - startMousePos.top)) >= clickPixelThresh
                    ) {
                    S.log("start drag by pixel : " + l1 + " : " + l2);
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

            self.fire("drag", ret);
            DDM.fire("drag", ret);
        },

        _end: function() {
            var self = this,
                activeDrop;
            self.get("dragNode").removeClass(DDM.get("prefixCls") + "dragging");
            self.get("node").removeClass(DDM.get("prefixCls") + "drag-over");
            self._clearBufferTimer();
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
            self.fire("dragend", {
                drag:self
            });
            self.__started = 0;
        },

        _handleOut:function() {
            var self = this;
            self.get("node").removeClass(DDM.get("prefixCls") + "drag-over");
            self.fire("dragexit", {
                drag:self,
                drop:DDM.get("activeDrop")
            });
        },

        _handleEnter:function(e) {
            var self = this;
            self.get("node").addClass(DDM.get("prefixCls") + "drag-over");
            //第一次先触发 dropenter,dragenter
            self.fire("dragenter", e);
        },


        _handleOver:function(e) {
            this.fire("dragover", e);
        },

        _start: function() {
            var self = this;
            self._clearBufferTimer();
            self.__started = 1;
            self.get("dragNode").addClass(DDM.get("prefixCls") + "dragging");
            DDM._start();
            self.fire("dragstart", {
                drag:self
            });

        }
    });

    return Draggable;

}, {
    requires:["ua","node","base","./ddm"]
});
