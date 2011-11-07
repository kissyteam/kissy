/**
 * dd support for kissy , dd objects central management module
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/ddm', function(S, DOM, Event, Node, Base) {

    var doc = document,
        BUFFER_TIME = 100,
        MOVE_DELAY = 30,
        SHIM_ZINDEX = 999999;

    function DDM() {
        var self = this;
        DDM.superclass.constructor.apply(self, arguments);
        self._showShimMove = S.throttle(move,
            MOVE_DELAY,
            self);
    }

    DDM.ATTRS = {
        prefixCls:{
            value:"ks-dd-"
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
         *当前激活的 drop 对象，在同一时间只有一个值
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
            activeDrag = self.get('activeDrag');
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
        notifyDropsMove(self, ev);
    }


    function notifyDropsMove(self, ev) {

        var activeDrag = self.get("activeDrag"),
            mode = activeDrag.get("mode"),
            drops = self.get("drops"),
            activeDrop,
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
        var oldDrop = self.get("activeDrop");
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


    function bufferStart(self, drag) {
        self.set('activeDrag', drag);

        //真正开始移动了才激活垫片
        if (drag.get("shim")) {
            activeShim(self);
        }

        drag._start();
        self.fire("dragstart", {
            drag:drag
        });
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
            "position:absolute;" +
            "left:0;" +
            "width:100%;" +
            "top:0;" +
            "cursor:move;" +
            "z-index:" +
            //覆盖iframe上面即可
            SHIM_ZINDEX
            + ";" +
            "'><" + "/div>")
            .prependTo(doc.body || doc.documentElement)
            //0.5 for debug
            .css("opacity", 0);
        activeShim = showShim;
        showShim(self);
    }

    function showShim(self) {
        self._shim.css({
            display: "",
            height: DOM['docHeight']()
        });
    }

    /**
     * 开始时注册全局监听事件
     */
    function registerEvent(self) {
        Event.on(doc, 'mouseup', self._end, self);
        Event.on(doc, 'mousemove', self._showShimMove, self);
    }

    /**
     * 结束时需要取消掉，防止平时无谓的监听
     */
    function unregisterEvent(self) {
        Event.remove(doc, 'mousemove', self._showShimMove, self);
        Event.remove(doc, 'mouseup', self._end, self);
    }

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
            var self = this,
                index = S.indexOf(d, self.get("drops"));
            if (index != -1) {
                self.get("drops").splice(index, 1);
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
            registerEvent(self);

            //是否中央管理，强制限制拖放延迟
            if (bufferTime) {
                self._bufferTimer = setTimeout(function() {
                    bufferStart(self, drag);
                }, bufferTime);
            } else {
                bufferStart(self, drag);
            }
        },

        /**
         * 全局通知当前拖动对象：你结束拖动了！
         */
        _end: function() {
            var self = this,
                activeDrag = self.get("activeDrag"),
                activeDrop = self.get("activeDrop"),
                ret = { drag: activeDrag,
                    drop: activeDrop};
            unregisterEvent(self);
            if (self._bufferTimer) {
                clearTimeout(self._bufferTimer);
                self._bufferTimer = null;
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
                drag:self
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
    requires:["dom","event","node","base"]
});
