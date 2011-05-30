/**
 * dd support for kissy , dd objects central management module
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add('dd/ddm', function(S, DOM, Event, Node, Base) {

    var doc = document,
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
        bufferTime: { value: 200 },

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
                self._showShimMove = throttle(self._move, self, 30);
            },

            /*
             全局鼠标移动事件通知当前拖动对象正在移动
             注意：chrome8: click 时 mousedown-mousemove-mouseup-click 也会触发 mousemove
             */
            _move: function(ev) {
                var activeDrag = this.get('activeDrag');
                //S.log("move");
                if (!activeDrag) return;
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
                if (drag.get("shim"))
                    self._activeShim();

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

                if (!activeDrag) return;
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
                    "'></div>").appendTo(doc.body);
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


    /**
     * Throttles a call to a method based on the time between calls. from YUI
     * @method throttle
     * @for KISSY
     * @param fn {function} The function call to throttle.
     * @param ms {int} The number of milliseconds to throttle the method call. Defaults to 150
     * @return {function} Returns a wrapped function that calls fn throttled.
     * ! Based on work by Simon Willison: http://gist.github.com/292562
     */
    function throttle(fn, scope, ms) {
        ms = ms || 150;

        if (ms === -1) {
            return (function() {
                fn.apply(scope, arguments);
            });
        }

        var last = S.now();
        return (function() {
            var now = S.now();
            if (now - last > ms) {
                last = now;
                fn.apply(scope, arguments);
            }
        });
    }

    function region(node) {
        var offset = node.offset();
        return {
            left:offset.left,
            right:offset.left + node[0].offsetWidth,
            top:offset.top,
            bottom:offset.top + node[0].offsetHeight
        };
    }

    function inRegion(region, pointer) {

        return region.left <= pointer.left
            && region.right >= pointer.left
            && region.top <= pointer.top
            && region.bottom >= pointer.top;
    }

    function area(region) {
        if (region.top >= region.bottom || region.left >= region.right) return 0;
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
