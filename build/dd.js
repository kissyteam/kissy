/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Nov 4 17:09
*/
/**
 * dd support for kissy , dd objects central management module
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/ddm', function(S, DOM, Event, Node, Base) {

    var doc = document,
        BUFFER_TIME = 200,
        MOVE_DELAY = 30,
        SHIM_ZINDEX = 999999;

    function DDM() {
        DDM.superclass.constructor.apply(this, arguments);
        this._init();
    }

    DDM.ATTRS = {
        prefixCls:{
            value:"ks-dd-"
        },
        /**
         * mousedown 后 buffer 触发时间  timeThred
         */
        bufferTime: { value: BUFFER_TIME },

        /**
         * 当前激活的拖动对象，在同一时间只有一个值，所以不是数组
         */
        activeDrag: {},

        /**
         *当前激活的drop对象，在同一时间只有一个值
         */
        activeDrop:{},
        /**
         * 所有注册的可被防止对象，统一管理
         */
        drops:{
            value:[]
        }
    };

    /*
     负责拖动涉及的全局事件：
     1.全局统一的鼠标移动监控
     2.全局统一的鼠标弹起监控，用来通知当前拖动对象停止
     3.为了跨越 iframe 而统一在底下的遮罩层
     */
    S.extend(DDM, Base, {

        _regDrop:function(d) {
            this.get("drops").push(d);
        },

        _unregDrop:function(d) {
            var index = S.indexOf(d, this.get("drops"));
            if (index != -1) {
                this.get("drops").splice(index, 1);
            }
        },

        _init: function() {
            var self = this;
            self._showShimMove = S.throttle(self._move, MOVE_DELAY, self);
        },

        /*
         全局鼠标移动事件通知当前拖动对象正在移动
         注意：chrome8: click 时 mousedown-mousemove-mouseup-click 也会触发 mousemove
         */
        _move: function(ev) {
            var activeDrag = this.get('activeDrag');
            //S.log("move");
            if (!activeDrag) {
                return;
            }
            //防止 ie 选择到字
            ev.preventDefault();
            activeDrag._move(ev);
            /**
             * 获得当前的激活drop
             */
            this._notifyDropsMove(ev);
        },

        _notifyDropsMove:function(ev) {

            var activeDrag = this.get("activeDrag"),mode = activeDrag.get("mode");
            var drops = this.get("drops");
            var activeDrop,
                vArea = 0,
                dragRegion = region(activeDrag.get("node")),
                dragArea = area(dragRegion);

            S.each(drops, function(drop) {

                var node = drop.getNodeFromTarget(ev,
                    // node
                    activeDrag.get("dragNode")[0],
                    // proxy node
                    activeDrag.get("node")[0]);

                if (!node
                // 当前 drop 区域已经包含  activeDrag.get("node")
                // 不要返回，可能想调整位置
                    ) {
                    return;
                }

                var a;
                if (mode == "point") {
                    //取鼠标所在的 drop 区域
                    if (inNodeByPointer(node, activeDrag.mousePos)) {
                        if (!activeDrop ||
                            // 当前得到的可放置元素范围更小，取范围小的那个
                            activeDrop.get("node").contains(node)
                            ) {
                            activeDrop = drop;
                        }
                    }
                } else if (mode == "intersect") {
                    //取一个和activeDrag交集最大的drop区域
                    a = area(intersect(dragRegion, region(node)));
                    if (a > vArea) {
                        vArea = a;
                        activeDrop = drop;
                    }

                } else if (mode == "strict") {
                    //drag 全部在 drop 里面
                    a = area(intersect(dragRegion, region(node)));
                    if (a == dragArea) {
                        activeDrop = drop;
                        return false;
                    }
                }
            });
            var oldDrop = this.get("activeDrop");
            if (oldDrop && oldDrop != activeDrop) {
                oldDrop._handleOut(ev);
            }
            if (activeDrop) {
                activeDrop._handleOver(ev);
            } else {
                activeDrag.get("node").removeClass(this.get("prefixCls") + "drag-over");
                this.set("activeDrop", null);
            }
        },

        _deactivateDrops:function() {
            var activeDrag = this.get("activeDrag"),
                activeDrop = this.get("activeDrop");
            activeDrag.get("node").removeClass(this.get("prefixCls") + "drag-over");
            if (activeDrop) {
                var ret = { drag: activeDrag, drop: activeDrop};
                activeDrop.get("node").removeClass(this.get("prefixCls") + "drop-over");
                activeDrop.fire('drophit', ret);
                activeDrag.fire('dragdrophit', ret);
                this.fire("drophit", ret);
                this.fire("dragdrophit", ret);
            } else {
                activeDrag.fire('dragdropmiss', {
                    drag:activeDrag
                });
                this.fire("dragdropmiss", {
                    drag:activeDrag
                });
            }
        },

        /**
         * 当前拖动对象通知全局：我要开始啦
         * 全局设置当前拖动对象，
         * 还要根据配置进行 buffer 处理
         * @param drag
         */
        _start: function(drag) {
            var self = this,
                bufferTime = self.get("bufferTime") || 0;

            //事件先要注册好，防止点击，导致 mouseup 时还没注册事件
            self._registerEvent();

            //是否中央管理，强制限制拖放延迟
            if (bufferTime) {
                self._bufferTimer = setTimeout(function() {
                    self._bufferStart(drag);
                }, bufferTime);
            } else {
                self._bufferStart(drag);
            }
        },

        _bufferStart: function(drag) {
            var self = this;
            self.set('activeDrag', drag);

            //真正开始移动了才激活垫片
            if (drag.get("shim")) {
                self._activeShim();
            }

            drag._start();
            drag.get("dragNode").addClass(this.get("prefixCls") + "dragging");
        },

        /**
         * 全局通知当前拖动对象：你结束拖动了！
         * @param ev
         */
        _end: function(ev) {
            var self = this,
                activeDrag = self.get("activeDrag");
            self._unregisterEvent();
            if (self._bufferTimer) {
                clearTimeout(self._bufferTimer);
                self._bufferTimer = null;
            }
            self._shim && self._shim.css({
                display:"none"
            });

            if (!activeDrag) {
                return;
            }
            activeDrag._end(ev);
            activeDrag.get("dragNode").removeClass(this.get("prefixCls") + "dragging");
            //处理 drop，看看到底是否有 drop 命中
            this._deactivateDrops(ev);
            self.set("activeDrag", null);
            self.set("activeDrop", null);
        },

        /**
         * 垫片只需创建一次
         */
        _activeShim: function() {
            var self = this,doc = document;
            //创造垫片，防止进入iframe，外面document监听不到 mousedown/up/move
            self._shim = new Node("<div " +
                "style='" +
                //red for debug
                "background-color:red;" +
                "position:absolute;" +
                "left:0;" +
                "width:100%;" +
                "top:0;" +
                "cursor:move;" +
                "z-index:" +
                //覆盖iframe上面即可
                SHIM_ZINDEX
                + ";" +
                "'><" + "/div>").prependTo(doc.body || doc.documentElement);
            //0.5 for debug
            self._shim.css("opacity", 0);
            self._activeShim = self._showShim;
            self._showShim();
        },

        _showShim: function() {
            var self = this;
            self._shim.css({
                display: "",
                height: DOM['docHeight']()
            });
        },

        /**
         * 开始时注册全局监听事件
         */
        _registerEvent: function() {
            var self = this;
            Event.on(doc, 'mouseup', self._end, self);
            Event.on(doc, 'mousemove', self._showShimMove, self);
        },

        /**
         * 结束时需要取消掉，防止平时无谓的监听
         */
        _unregisterEvent: function() {
            var self = this;
            Event.remove(doc, 'mousemove', self._showShimMove, self);
            Event.remove(doc, 'mouseup', self._end, self);
        }
    });

    function region(node) {
        var offset = node.offset();
        return {
            left:offset.left,
            right:offset.left + node.outerWidth(),
            top:offset.top,
            bottom:offset.top + node.outerHeight()
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
        var t = Math.max(r1.top, r2.top),
            r = Math.min(r1.right, r2.right),
            b = Math.min(r1.bottom, r2.bottom),
            l = Math.max(r1.left, r2.left);
        return {
            left:l,
            right:r,
            top:t,
            bottom:b
        };
    }

    function inNodeByPointer(node, point) {
        return inRegion(region(node), point);
    }

    var ddm = new DDM();
    ddm.inRegion = inRegion;
    ddm.region = region;
    return ddm;
}, {
    requires:["dom","event","node","base"]
});
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
        /*
         真实的节点
         */
        dragNode:{},

        /**
         * 是否需要遮罩跨越iframe
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
                var self = this,
                    cursor = self.get("cursor");
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
                    if (cursor) {
                        v.css('cursor', cursor);
                    }
                    vs[i] = v;
                });
                self.__set("handlers", vs);
                return vs;
            }
        },
        cursor:{
            value:"move"
        },

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

        _init: function() {
            var self = this,
                node = self.get('node');
            self.set("dragNode", node);
            node.on('mousedown', self._handleMouseDown, self);
        },

        destroy:function() {
            var self = this,
                node = self.get('dragNode'),
                handlers = self.get('handlers');
            each(handlers, function(handler) {
                handler.css("cursor", "auto");
            });
            node.detach('mousedown', self._handleMouseDown, self);
            self.detach();
        },

        _check: function(t) {
            var handlers = this.get('handlers'),ret = 0;
            each(handlers, function(handler) {
                //子区域内点击也可以启动
                if (handler.contains(t) ||
                    handler[0] == t[0]) {
                    ret = 1;
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
            var self = this;

            DDM._start(self);

            var node = self.get("node"),
                mx = ev.pageX,
                my = ev.pageY,
                nxy = node.offset();
            self['startMousePos'] = self.mousePos = {
                left:mx,
                top:my
            };
            self.startNodePos = nxy;
            self._diff = {
                left:mx - nxy.left,
                top:my - nxy.top
            };
        },

        _move: function(ev) {
            var self = this,
                ret,
                diff = self._diff,
                left = ev.pageX - diff.left,
                top = ev.pageY - diff.top;
            self.mousePos = {
                left:ev.pageX,
                top:ev.pageY
            };
            ret = {
                left:left,
                top:top,
                pageX:ev.pageX,
                pageY:ev.pageY,
                drag:this
            };
            self.fire("drag", ret);
            DDM.fire("drag", ret);
        },

        _end: function() {
            var self = this;
            self.fire("dragend", {
                drag:self
            });
            DDM.fire("dragend", {
                drag:self
            });
        },

        _start: function() {
            var self = this;
            self.fire("dragstart", {
                drag:self
            });
            DDM.fire("dragstart", {
                drag:self
            });
        }
    });

    return Draggable;

}, {
    requires:["ua","node","base","./ddm"]
});
/**
 * droppable for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/droppable", function(S, Node, Base, DDM) {

    function Droppable() {
        var self = this;
        Droppable.superclass.constructor.apply(self, arguments);
        self._init();
    }

    Droppable.ATTRS = {
        /**
         * 放节点
         */
        node: {
            setter:function(v) {
                if (v) {
                    return Node.one(v).addClass(DDM.get("prefixCls") + "drop");
                }
            }
        }

    };

    S.extend(Droppable, Base, {
        /**
         * 用于被 droppable-delegate override
         */
        getNodeFromTarget:function(ev, dragNode, proxyNode) {
            var node = this.get("node"),
                domNode = node[0];
            // 排除当前拖放和代理节点
            return domNode == dragNode || domNode == proxyNode
                ? null : node;
        },
        _init:function() {
            DDM._regDrop(this);
        },
        _handleOut:function() {
            var self = this,
                activeDrag = DDM.get("activeDrag"),
                ret = {
                    drop:self,
                    drag:activeDrag
                };
            self.get("node").removeClass(DDM.get("prefixCls") + "drop-over");
            self.fire("dropexit", ret);
            DDM.fire("dropexit", ret);
            activeDrag.get("node").removeClass(DDM.get("prefixCls") + "drag-over");
            activeDrag.fire("dragexit", ret);
            DDM.fire("dragexit", ret);
        },
        _handleOver:function(ev) {
            var self = this,
                oldDrop = DDM.get("activeDrop");
            DDM.set("activeDrop", this);
            var activeDrag = DDM.get("activeDrag");
            self.get("node").addClass(DDM.get("prefixCls") + "drop-over");
            var evt = S.mix({
                drag:activeDrag,
                drop:this
            }, ev);
            if (self != oldDrop) {
                activeDrag.get("node").addClass(DDM.get("prefixCls") + "drag-over");
                //第一次先触发 dropenter,dragenter
                activeDrag.fire("dragenter", evt);
                this.fire("dropenter", evt);
                DDM.fire("dragenter", evt);
                DDM.fire("dropenter", evt);
            } else {
                activeDrag.fire("dragover", evt);
                self.fire("dropover", evt);
                DDM.fire("dragover", evt);
                DDM.fire("dropover", evt);
            }
        },
        destroy:function() {
            DDM._unregDrop(this);
        }
    });

    return Droppable;

}, { requires:["node","base","./ddm"] });/**
 * generate proxy drag object,
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/proxy", function(S, Node) {
    var DESTRUCTOR_ID = "__proxy_destructors",
        stamp = S.stamp,
        MARKER = S.guid("__dd_proxy"),
        PROXY_ATTR = "__proxy";

    function Proxy() {
        var self = this;
        Proxy.superclass.constructor.apply(self, arguments);
        self[DESTRUCTOR_ID] = {};
    }

    Proxy.ATTRS = {
        node:{
            /*
             如何生成替代节点
             @return {KISSY.Node} 替代节点
             */
            value:function(drag) {
                return new Node(drag.get("node").clone(true));
            }
        },
        destroyOnEnd:{
            /**
             * 是否每次都生成新节点/拖放完毕是否销毁当前代理节点
             */
            value:false
        }
    };

    S.extend(Proxy, S.Base, {
        attach:function(drag) {

            var self = this,
                tag;

            if (tag = stamp(drag, 1, MARKER) &&
                self[DESTRUCTOR_ID][tag]
                ) {
                return;
            }

            function start() {
                var node = self.get("node"),
                    dragNode = drag.get("node");

                if (!self[PROXY_ATTR] && S.isFunction(node)) {
                    node = node(drag);
                    node.addClass("ks-dd-proxy");
                    node.css("position", "absolute");
                    self[PROXY_ATTR] = node;
                }
                dragNode.parent()
                    .append(node);
                node.show();
                node.offset(dragNode.offset());
                drag.set("dragNode", dragNode);
                drag.set("node", node);
            }

            function end() {
                var node = self[PROXY_ATTR];
                drag.get("dragNode").offset(node.offset());
                node.hide();
                if (self.get("destroyOnEnd")) {
                    node.remove();
                    self[PROXY_ATTR] = 0;
                }
                drag.set("node", drag.get("dragNode"));
            }

            drag.on("dragstart", start);
            drag.on("dragend", end);

            tag = stamp(drag, 0, MARKER);

            self[DESTRUCTOR_ID][tag] = {
                drag:drag,
                fn:function() {
                    drag.detach("dragstart", start);
                    drag.detach("dragend", end);
                }
            };
        },
        unAttach:function(drag) {
            var self = this,
                tag = stamp(drag, 1, MARKER),
                destructors = self[DESTRUCTOR_ID];
            if (tag && destructors[tag]) {
                destructors[tag].fn();
                delete destructors[tag];
            }
        },

        destroy:function() {
            var self = this,
                node = self.get("node"),
                destructors = self[DESTRUCTOR_ID];
            if (node && !S.isFunction(node)) {
                node.remove();
            }
            for (var d in destructors) {
                this.unAttach(destructors[d].drag);
            }
        }
    });

    return Proxy;
}, {
    requires:['node']
});/**
 * delegate all draggable nodes to one draggable object
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/draggable-delegate", function(S, DDM, Draggable, DOM, Node) {
    function Delegate() {
        Delegate.superclass.constructor.apply(this, arguments);
    }

    S.extend(Delegate, Draggable, {
            _init:function() {
                var self = this,
                    node = self.get('container');
                node.on('mousedown', self._handleMouseDown, self);
            },

            /**
             * 得到适合 handler，从这里开始启动拖放，对于 handlers 选择器字符串数组
             * @param target
             */
            _getHandler:function(target) {
                var self = this,
                    ret,
                    node = self.get("container"),
                    handlers = self.get('handlers');
                while (target && target[0] !== node[0]) {
                    S.each(handlers, function(h) {
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

            /**
             * 找到真正应该移动的节点，对应 selector 属性选择器字符串
             * @param h
             */
            _getNode:function(h) {
                return h.closest(this.get("selector"), this.get("container"));
            },

            /**
             * 父容器监听 mousedown，找到合适的拖动 handlers 以及拖动节点
             *
             * @param ev
             */
            _handleMouseDown:function(ev) {
                var self = this,
                    handler,
                    handlers = self.get("handlers"),
                    target = new Node(ev.target);
                // 不需要像 Draggble 一样，判断 target 是否在 handler 内
                // 委托时，直接从 target 开始往上找 handler
                if (handlers.length) {
                    handler = self._getHandler(target);
                } else {
                    handler = target;
                }
                var node = handler && self._getNode(handler);
                if (!node) {
                    return;
                }

                ev.preventDefault();

                // 找到 handler 确定 委托的 node ，就算成功了
                self.set("node", node);
                self.set("dragNode", node);
                self._prepare(ev);
            },

            destroy:function() {
                var self = this;
                self.get("container")
                    .detach('mousedown',
                    self._handleMouseDown,
                    self);
                self.detach();
            }
        },
        {
            ATTRS:{
                /**
                 * 用于委托的父容器
                 */
                container:{
                    setter:function(v) {
                        return Node.one(v);
                    }
                },

                /**
                 * 实际拖放的节点选择器，一般用 tag.cls
                 */
                selector:{
                },

                /**
                 * 继承来的 handlers : 拖放句柄选择器数组，一般用 [ tag.cls ]
                 * 不设则为 [ selector ]
                 **/
                handlers:{
                    value:[],
                    // 覆盖父类的 getter ，这里 normalize 成节点
                    getter:0
                }

            }
        });

    return Delegate;
}, {
    requires:['./ddm','./draggable','dom','node']
});/**
 * only one droppable instance for multiple droppable nodes
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/droppable-delegate", function(S, DDM, Droppable, DOM, Node) {
    function DroppableDelegate() {
        DroppableDelegate.superclass.constructor.apply(this, arguments);
    }

    S.extend(DroppableDelegate, Droppable, {

            /**
             * 根据鼠标位置得到真正的可放目标，暂时不考虑 mode，只考虑鼠标
             * @param ev
             */
            getNodeFromTarget:function(ev, dragNode, proxyNode) {
                var pointer = {
                    left:ev.pageX,
                    top:ev.pageY
                },
                    self = this,
                    container = self.get("container"),
                    selector = self.get("selector"),
                    allNodes = container.all(selector),
                    ret = 0;

                allNodes.each(function(n) {
                    var domNode = n[0];
                    // 排除当前拖放的元素以及代理节点
                    if (domNode == proxyNode || domNode == dragNode) {
                        return;
                    }
                    if (DDM.inRegion(DDM.region(n), pointer)) {
                        self.set("lastNode", self.get("node"));
                        self.set("node", ret = n);
                        return false;
                    }
                });
                return ret;
            },

            _handleOut:function() {
                var self = this;
                DroppableDelegate.superclass._handleOut.apply(self, arguments);
                self.set("node", 0);
                self.set("lastNode", 0);
            },

            _handleOver:function(ev) {
                var self = this,
                    activeDrag = DDM.get("activeDrag"),
                    oldDrop = DDM.get("activeDrop"),
                    evt = S.mix({
                        drag:activeDrag,
                        drop:self
                    }, ev),
                    node = self.get("node"),
                    lastNode = self.get("lastNode");

                DDM.set("activeDrop", self);
                node.addClass(DDM.get("prefixCls") + "drop-over");

                if (self != oldDrop
                    || !lastNode
                    || (lastNode && lastNode[0] !== node[0])
                    ) {
                    /**
                     * 两个可 drop 节点相邻，先通知上次的离开
                     */
                    if (lastNode) {
                        self.set("node", lastNode);
                        DroppableDelegate.superclass._handleOut.apply(self, arguments);
                    }
                    /**
                     * 再通知这次的进入
                     */
                    self.set("node", node);
                    activeDrag.get("node").addClass(DDM.get("prefixCls") + "drag-over");
                    //第一次先触发 dropenter,dragenter
                    activeDrag.fire("dragenter", evt);
                    self.fire("dropenter", evt);
                    DDM.fire("dragenter", evt);
                    DDM.fire("dropenter", evt);
                } else {
                    activeDrag.fire("dragover", evt);
                    this.fire("dropover", evt);
                    DDM.fire("dragover", evt);
                    DDM.fire("dropover", evt);
                }
            }
        },
        {
            ATTRS:{

                /**
                 * 继承自 Drappable ，当前正在委托的放节点目标
                 * note:{}
                 */

                /**
                 * 上一个成为放目标的委托节点
                 */
                lastNode:{
                },

                /**
                 * 放目标节点选择器
                 */
                selector:{
                },

                /**
                 * 放目标所在区域
                 */
                container:{
                    setter:function(v) {
                        return Node.one(v);
                    }
                }
            }
        });

    return DroppableDelegate;
}, {
    requires:['./ddm','./droppable','dom','node']
});/**
 * auto scroll for drag object's container
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/scroll", function(S, Base, Node, DOM) {

    var TAG_DRAG = "__dd-scroll-id-",
        stamp = S.stamp,
        RATE = [10,10],
        ADJUST_DELAY = 100,
        DIFF = [20,20],
        DESTRUCTORS = "__dd_scrolls";

    function Scroll() {
        var self = this;
        Scroll.superclass.constructor.apply(self, arguments);
        self[DESTRUCTORS] = {};
    }

    Scroll.ATTRS = {
        node:{
            // value:window：不行，默认值一定是简单对象
            valueFn : function() {
                return Node.one(window);
            },
            setter : function(v) {
                return Node.one(v);
            }
        },
        rate:{
            value:RATE
        },
        diff:{
            value:DIFF
        }
    };


    var isWin = S.isWindow;

    S.extend(Scroll, Base, {

        getRegion:function(node) {
            if (isWin(node[0])) {
                return {
                    width:DOM.viewportWidth(),
                    height:DOM.viewportHeight()
                };
            } else {
                return {
                    width:node.outerWidth(),
                    height:node.outerHeight()
                };
            }
        },

        getOffset:function(node) {
            if (isWin(node[0])) {
                return {
                    left:DOM.scrollLeft(),
                    top:DOM.scrollTop()
                };
            } else {
                return node.offset();
            }
        },

        getScroll:function(node) {
            return {
                left:node.scrollLeft(),
                top:node.scrollTop()
            };
        },

        setScroll:function(node, r) {
            node.scrollLeft(r.left);
            node.scrollTop(r.top);
        },

        unAttach:function(drag) {
            var tag,
                destructors = this[DESTRUCTORS];
            if (!(tag = stamp(drag, 1, TAG_DRAG)) ||
                !destructors[tag]
                ) {
                return;
            }
            destructors[tag].fn();
            delete destructors[tag];
        },

        destroy:function() {
            var self = this,
                destructors = self[DESTRUCTORS];
            for (var d in destructors) {
                self.unAttach(destructors[d].drag);
            }
        },

        attach:function(drag) {
            var self = this,
                tag = stamp(drag, 0, TAG_DRAG),
                destructors = self[DESTRUCTORS];
            if (destructors[tag]) {
                return;
            }

            var rate = self.get("rate"),
                diff = self.get('diff'),
                event,
                /*
                 目前相对 container 的偏移，container 为 window 时，相对于 viewport
                 */
                dxy,
                timer = null;

            function dragging(ev) {
                // 给调用者的事件，框架不需要处理
                // fake 也表示该事件不是因为 mouseover 产生的
                if (ev.fake) {
                    return;
                }
                // S.log("dragging");
                // 更新当前鼠标相对于拖节点的相对位置
                var node = self.get("node");
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

            drag.on("drag", dragging);

            drag.on("dragend", dragEnd);

            destructors[tag] = {
                drag:drag,
                fn:function() {
                    drag.detach("drag", dragging);
                    drag.detach("dragend", dragEnd);
                }
            };


            function checkAndScroll() {
                //S.log("******* scroll");
                var node = self.get("node"),
                    r = self.getRegion(node),
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
                //S.log(diffY2);
                if (diffY2 <= diff[1]) {
                    scroll.top -= rate[1];
                    adjust = true;
                }


                var diffX = dxy.left - nw;
                //S.log(diffX);
                if (diffX >= -diff[0]) {
                    scroll.left += rate[0];
                    adjust = true;
                }

                var diffX2 = dxy.left;
                //S.log(diffX2);
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
                    drag.fire("drag", event);
                } else {
                    timer = null;
                }
            }

        }
    });

    return Scroll;
}, {
    requires:['base','node','dom']
});/**
 * dd support for kissy
 * @author  承玉<yiminghe@gmail.com>
 */
KISSY.add("dd", function(S, DDM, Draggable, Droppable, Proxy, Delegate, DroppableDelegate, Scroll) {
    var dd = {
        Draggable:Draggable,
        Droppable:Droppable,
        DDM:DDM,
        Proxy:Proxy,
        DraggableDelegate:Delegate,
        DroppableDelegate:DroppableDelegate,
        Scroll:Scroll
    };

    S.mix(S, dd);

    return dd;
}, {
    requires:["dd/ddm",
        "dd/draggable",
        "dd/droppable",
        "dd/proxy",
        "dd/draggable-delegate",
        "dd/droppable-delegate",
        "dd/scroll"]
});
