/*
Copyright 2011, KISSY UI Library v1.20
MIT Licensed
build time: Nov 28 12:39
*/
/**
 * dd support for kissy , dd objects central management module
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/ddm', function(S, UA, DOM, Event, Node, Base) {

    var doc = document,
        win = window,

        ie6 = UA['ie'] === 6,

        // prevent collision with click , only start when move
        PIXEL_THRESH = 3,
        // or start when mousedown for 1 second
        BUFFER_TIME = 1000,

        MOVE_DELAY = 30,
        _showShimMove = S.throttle(move,
            MOVE_DELAY),
        SHIM_ZINDEX = 999999;

    function DDM() {
        var self = this;
        DDM.superclass.constructor.apply(self, arguments);
    }

    DDM.ATTRS = {
        prefixCls:{
            value:"ks-dd-"
        },

        /**
         * shim 鼠标 icon (drag icon)
         */
        dragCursor:{
            value:'move'
        },

        /***
         * 移动的像素值（用于启动拖放）
         */
        clickPixelThresh: {
            value: PIXEL_THRESH
        },

        /**
         * mousedown 后 buffer 触发时间  time threshold
         */
        bufferTime: { value: BUFFER_TIME },

        /**
         * 当前激活的拖动对象，在同一时间只有一个值，所以不是数组
         */
        activeDrag: {},

        /**
         * 当前激活的 drop 对象，在同一时间只有一个值
         */
        activeDrop:{},

        /**
         * 所有注册的可放置对象，统一管理
         */
        drops:{
            value:[]
        }
    };

    /*
     全局鼠标移动事件通知当前拖动对象正在移动
     注意：chrome8: click 时 mousedown-mousemove-mouseup-click 也会触发 mousemove
     */
    function move(ev) {
        var self = this,
            __activeToDrag = self.__activeToDrag,
            activeDrag = self.get('activeDrag');

        if (activeDrag || __activeToDrag) {
            //防止 ie 选择到字
            ev.preventDefault();
        }
        // 优先处理激活的
        if (activeDrag) {
            activeDrag._move(ev);
            /**
             * 获得当前的激活drop
             */
            notifyDropsMove(self, ev);
        } else if (__activeToDrag) {
            __activeToDrag._move(ev);
        }
    }


    function notifyDropsMove(self, ev) {

        var activeDrag = self.get("activeDrag"),
            mode = activeDrag.get("mode"),
            drops = self.get("drops"),
            activeDrop,
            oldDrop = 0,
            vArea = 0,
            dragRegion = region(activeDrag.get("node")),
            dragArea = area(dragRegion);

        S.each(drops, function(drop) {
            var a,
                node = drop.getNodeFromTarget(ev,
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

            if (mode == "point") {
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
        oldDrop = self.get("activeDrop");
        if (oldDrop && oldDrop != activeDrop) {
            oldDrop._handleOut(ev);
            activeDrag._handleOut(ev);
        }
        self.set("activeDrop", activeDrop);
        if (activeDrop) {
            if (oldDrop != activeDrop) {
                activeDrop._handleEnter(ev);
            } else {
                // 注意处理代理时内部节点变化导致的 out、enter
                activeDrop._handleOver(ev);
            }
        }
    }


    /**
     * 垫片只需创建一次
     */
    function activeShim(self) {
        var doc = document;
        //创造垫片，防止进入iframe，外面document监听不到 mousedown/up/move
        self._shim = new Node("<div " +
            "style='" +
            //red for debug
            "background-color:red;" +
            "position:" + (ie6 ? 'absolute' : 'fixed') + ";" +
            "left:0;" +
            "width:100%;" +
            "height:100%;" +
            "top:0;" +
            "cursor:" + ddm.get("dragCursor") + ";" +
            "z-index:" +
            //覆盖iframe上面即可
            SHIM_ZINDEX
            + ";" +
            "'><" + "/div>")
            .prependTo(doc.body || doc.documentElement)
            //0.5 for debug
            .css("opacity", 0);

        activeShim = showShim;

        if (ie6) {
            // ie6 不支持 fixed 以及 width/height 100%
            // support dd-scroll
            // prevent empty when scroll outside initial window
            Event.on(win, "resize scroll", adjustShimSize, self);
        }

        showShim(self);
    }

    var adjustShimSize = S.throttle(function() {
        var self = this,
            activeDrag;
        if ((activeDrag = self.get("activeDrag")) &&
            activeDrag.get("shim")) {
            self._shim.css({
                width:DOM.docWidth(),
                height:DOM.docHeight()
            });
        }
    }, MOVE_DELAY);

    function showShim(self) {
        // determin cursor according to activeHandler and dragCursor
        var ah = self.get("activeDrag").get('activeHandler'),
            cur = 'auto';
        if (ah) {
            cur = ah.css('cursor');
        }
        if (cur == 'auto') {
            cur = self.get('dragCursor');
        }
        self._shim.css({
            cursor:cur,
            display: "block"
        });
        if (ie6) {
            adjustShimSize.call(self);
        }
    }

    /**
     * 开始时注册全局监听事件
     */
    function registerEvent(self) {
        Event.on(doc, 'mouseup', self._end, self);
        Event.on(doc, 'mousemove', _showShimMove, self);
    }

    /**
     * 结束时需要取消掉，防止平时无谓的监听
     */
    function unregisterEvent(self) {
        Event.remove(doc, 'mousemove', _showShimMove, self);
        Event.remove(doc, 'mouseup', self._end, self);
    }

    /*
     负责拖动涉及的全局事件：
     1.全局统一的鼠标移动监控
     2.全局统一的鼠标弹起监控，用来通知当前拖动对象停止
     3.为了跨越 iframe 而统一在底下的遮罩层
     */
    S.extend(DDM, Base, {

        /**
         * 可能要进行拖放的对象，需要通过 buffer/pixelThresh 考验
         */
        __activeToDrag:0,

        _regDrop:function(d) {
            this.get("drops").push(d);
        },

        _unregDrop:function(d) {
            var self = this,
                index = S.indexOf(d, self.get("drops"));
            if (index != -1) {
                self.get("drops").splice(index, 1);
            }
        },

        /**
         * 注册可能将要拖放的节点
         * @param drag
         */
        _regToDrag: function(drag) {
            var self = this;
            // 事件先要注册好，防止点击，导致 mouseup 时还没注册事件
            registerEvent(self);
            self.__activeToDrag = drag;
        },

        /**
         * 真正开始 drag
         * 当前拖动对象通知全局：我要开始啦
         * 全局设置当前拖动对象，
         */
        _start:function () {

            var self = this,
                drag = self.__activeToDrag;

            self.set('activeDrag', drag);
            // 预备役清掉
            self.__activeToDrag = 0;
            // 真正开始移动了才激活垫片

            if (drag.get("shim")) {
                activeShim(self);
            }
            self.fire("dragstart", {
                drag:drag
            });
        },

        /**
         * 全局通知当前拖动对象：结束拖动了！
         */
        _end: function() {
            var self = this,
                activeDrag = self.get("activeDrag"),
                activeDrop = self.get("activeDrop"),
                ret = { drag: activeDrag,
                    drop: activeDrop};
            unregisterEvent(self);
            // 预备役清掉 , click 情况下 mousedown->mouseup 极快过渡
            if (self.__activeToDrag) {
                self.__activeToDrag._end();
                self.__activeToDrag = 0;
            }
            self._shim && self._shim.hide();
            if (!activeDrag) {
                return;
            }
            activeDrag._end();
            if (activeDrop) {
                activeDrop._end();
                self.fire("drophit", ret);
                self.fire("dragdrophit", ret);
            } else {
                self.fire("dragdropmiss", {
                    drag:activeDrag
                });
            }
            self.fire("dragend", {
                drag:activeDrag
            });
            self.set("activeDrag", null);
            self.set("activeDrop", null);
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
        var t = Math.max(r1['top'], r2.top),
            r = Math.min(r1.right, r2.right),
            b = Math.min(r1['bottom'], r2.bottom),
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
    ddm.area = area;
    return ddm;
}, {
    requires:["ua","dom","event","node","base"]
});

/**
 * refer
 *  - YUI3 dd
 */
/**
 * dd support for kissy, drag for dd
 * @author  yiminghe@gmail.com
 */
KISSY.add('dd/draggable', function(S, UA, Node, Base, DDM) {

    var each = S.each,
        ie = UA['ie'],
        NULL = null,
        doc = document;

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
            valueFn:function() {
                return DDM.get("clickPixelThresh");
            }
        },

        bufferTime:{
            valueFn:function() {
                return DDM.get("bufferTime");
            }
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

        /**
         * 当前拖对象是否开始运行，用于调用者监听 change 事件
         */
        dragging:{
            value:false,
            setter:function(d) {
                var self = this;
                self.get("dragNode")[d ? 'addClass' : 'removeClass']
                    (DDM.get("prefixCls") + "dragging");
            }
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
        },

        /**
         * 拖无效
         */
        disabled:{
            value:false,
            setter:function(d) {
                this.get("dragNode")[d ? 'addClass' :
                    'removeClass'](DDM.get("prefixCls") + '-disabled');
                return d;
            }
        },

        /**
         * whether the node moves with drag object
         */
        move:{
            value:false
        },

        /**
         * only left button of mouse trigger drag?
         */
        primaryButtonOnly: {
            value: true
        },

        halt:{
            value:true
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

    S.extend(Draggable, Base, {

        /**
         * 开始拖时鼠标所在位置
         */
        startMousePos:NULL,

        /**
         * 开始拖时节点所在位置
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

        _init: function() {
            var self = this,
                node = self.get('node');
            self.set("dragNode", node);
            node.on('mousedown', _handleMouseDown, self)
                .on('dragstart', self._fixDragStart);
        },

        _fixDragStart:fixDragStart,

        destroy:function() {
            var self = this,
                node = self.get('dragNode');
            node.detach('mousedown', _handleMouseDown, self)
                .detach('dragstart', self._fixDragStart);
            self.detach();
        },

        /**
         *
         * @param {HTMLElement} t
         */
        _check: function(t) {
            var self = this,
                handlers = self.get('handlers'),
                ret = 0;
            each(handlers, function(handler) {
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

        _checkMouseDown:function(ev) {
            if (this.get('primaryButtonOnly') && ev.button > 1 ||
                this.get("disabled")) {
                return 0;
            }
            return 1;
        },

        _prepare:function(ev) {

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
                self._bufferTimer = setTimeout(function() {
                    // 事件到了，仍然是 mousedown 触发！
                    //S.log("drag start by timeout");
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


            if (!self.get("dragging")) {
                var clickPixelThresh = self.get("clickPixelThresh"),l1,l2;
                // 鼠标经过了一定距离，立即开始
                if ((l1 = Math.abs(pageX - startMousePos.left)) >= clickPixelThresh ||
                    (l2 = Math.abs(pageY - startMousePos.top)) >= clickPixelThresh
                    ) {
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

        _end: function() {
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

        _handleOut:function() {
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
            self.set("dragging", 1);
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
                    return Node.one(v);
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
            return domNode == dragNode ||
                domNode == proxyNode
                ? null : node;
        },

        _init:function() {
            DDM._regDrop(this);
        },

        __getCustomEvt:function(ev) {
            return S.mix({
                drag:DDM.get("activeDrag"),
                drop:this
            }, ev);
        },

        _handleOut:function() {
            var self = this,
                ret = self.__getCustomEvt();
            self.get("node").removeClass(DDM.get("prefixCls") + "drop-over");
            /**
             * html5 => dragleave
             */
            self.fire("dropexit", ret);
            DDM.fire("dropexit", ret);
            DDM.fire("dragexit", ret);
        },

        _handleEnter:function(ev) {
            var self = this,
                e = self.__getCustomEvt(ev);
            e.drag._handleEnter(e);
            self.get("node").addClass(DDM.get("prefixCls") + "drop-over");
            this.fire("dropenter", e);
            DDM.fire("dragenter", e);
            DDM.fire("dropenter", e);
        },


        _handleOver:function(ev) {
            var self = this,
                e = self.__getCustomEvt(ev);
            e.drag._handleOver(e);
            self.fire("dropover", e);
            DDM.fire("dragover", e);
            DDM.fire("dropover", e);
        },

        _end:function() {
            var self = this,
                ret = self.__getCustomEvt();
            self.get("node").removeClass(DDM.get("prefixCls") + "drop-over");
            self.fire('drophit', ret);
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

                // cache proxy node
                if (!self[PROXY_ATTR]) {
                    if (S.isFunction(node)) {
                        node = node(drag);
                        node.addClass("ks-dd-proxy");
                        node.css("position", "absolute");
                        self[PROXY_ATTR] = node;
                    }
                } else {
                    node = self[PROXY_ATTR];
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


    /**
     * 父容器监听 mousedown，找到合适的拖动 handlers 以及拖动节点
     *
     * @param ev
     */
    function _handleMouseDown(ev) {
        var self = this,
            handler,
            node;

        if (!self._checkMouseDown(ev)) {
            return;
        }

        var handlers = self.get("handlers"),
            target = new Node(ev.target);

        // 不需要像 Draggble 一样，判断 target 是否在 handler 内
        // 委托时，直接从 target 开始往上找 handler
        if (handlers.length) {
            handler = self._getHandler(target);
        } else {
            handler = target;
        }

        if (handler) {
            self.set("activeHandler", handler);
            node = self._getNode(handler);
        } else {
            return;
        }

        // 找到 handler 确定 委托的 node ，就算成功了
        self.set("node", node);
        self.set("dragNode", node);
        self._prepare(ev);
    }

    S.extend(Delegate, Draggable, {
            _init:function() {
                var self = this,
                    node = self.get('container');
                node.on('mousedown', _handleMouseDown, self)
                    .on('dragstart', self._fixDragStart);
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

            destroy:function() {
                var self = this;
                self.get("container")
                    .detach('mousedown',
                    _handleMouseDown,
                    self)
                    .detach('dragstart', self._fixDragStart);
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

    function dragStart() {
        var self = this,
            container = self.get("container"),
            selector = self.get("selector");
        self.__allNodes = container.all(selector);
    }

    function DroppableDelegate() {
        var self = this;
        DroppableDelegate.superclass.constructor.apply(self, arguments);
        // 提高性能，拖放开始时缓存代理节点
        DDM.on("dragstart", dragStart, self);
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
                    allNodes = self.__allNodes,
                    ret = 0,
                    vArea = Number.MAX_VALUE;

                allNodes && allNodes.each(function(n) {
                    var domNode = n[0];
                    // 排除当前拖放的元素以及代理节点
                    if (domNode === proxyNode || domNode === dragNode) {
                        return;
                    }
                    if (DDM.inRegion(DDM.region(n), pointer)) {
                        // 找到面积最小的那个
                        var a = DDM.area(DDM.region(n));
                        if (a < vArea) {
                            vArea = a;
                            ret = n;
                        }
                    }
                });

                if (ret) {
                    self.set("lastNode", self.get("node"));
                    self.set("node", ret);
                }

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
                    node = self.get("node"),
                    superOut = DroppableDelegate.superclass._handleOut,
                    superOver = DroppableDelegate.superclass._handleOver,
                    superEnter = DroppableDelegate.superclass._handleEnter,
                    lastNode = self.get("lastNode");

                if (lastNode[0] !== node[0]) {
                    /**
                     * 同一个 drop 对象内委托的两个可 drop 节点相邻，先通知上次的离开
                     */
                    self.set("node", lastNode);
                    superOut.apply(self, arguments);
                    /**
                     * 再通知这次的进入
                     */
                    self.set("node", node);
                    superEnter.call(self, ev);
                } else {
                    superOver.call(self, ev);
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
