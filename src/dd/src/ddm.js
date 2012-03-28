/**
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
        BUFFER_TIME = 1000,

        MOVE_DELAY = 30,
        _showShimMove = S.throttle(move,
            MOVE_DELAY),
        SHIM_ZINDEX = 999999;

    /**
     * @memberOf DD
     * @field
     * @namespace Manager for Drag and Drop.
     */
    function DDM() {
        var self = this;
        DDM.superclass.constructor.apply(self, arguments);
    }

    DDM.ATTRS =
    /**
     * @lends DD.DDM
     */
    {
        /**
         * default prefix class name for dd related state (such as dragging,drag-over).
         * @type String
         */
        prefixCls:{
            value:"ks-dd-"
        },

        /**
         * cursor style when dragging,if shimmed the shim will get the cursor.
         * @type String
         */
        dragCursor:{
            value:'move'
        },

        /***
         * the number of pixels to move to start a drag operation,default is 3.
         * @type Number
         */
        clickPixelThresh:{
            value:PIXEL_THRESH
        },

        /**
         * the number of milliseconds to start a drag operation after mousedown,default is 1000
         * @type Number
         */
        bufferTime:{ value:BUFFER_TIME },

        /**
         * currently active draggable object
         * @type DD.Draggable
         */
        activeDrag:{},

        /**
         * currently active droppable object
         * @type DD.Droppable
         */
        activeDrop:{},

        /**
         * a array of drop targets
         * @type DD.Droppable[]
         */
        drops:{
            value:[]
        },

        /**
         * a array of the valid drop targets for this interaction
         * @type DD.Droppable[]
         */
        validDrops:{
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
            drops = self.get("validDrops"),
            activeDrop = 0,
            oldDrop,
            vArea = 0,
            dragRegion = region(activeDrag.get("node")),
            dragArea = area(dragRegion);

        S.each(drops, function (drop) {
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
        self.__set("activeDrop", activeDrop);
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

    var adjustShimSize = S.throttle(function () {
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
        // determine cursor according to activeHandler and dragCursor
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
            display:"block"
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
    function unRegisterEvent(self) {
        Event.remove(doc, 'mousemove', _showShimMove, self);
        Event.remove(doc, 'mouseup', self._end, self);
    }


    function _activeDrops(self) {
        var drops = self.get("drops");
        self.__set("validDrops", []);
        S.each(drops, function (d) {
            d._active();
        });
    }

    function _deActiveDrops(self) {
        var drops = self.get("drops");
        self.__set("validDrops", []);
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

        /**
         * 可能要进行拖放的对象，需要通过 buffer/pixelThresh 考验
         */
        __activeToDrag:0,

        _regDrop:function (d) {
            this.get("drops").push(d);
        },

        _unRegDrop:function (d) {
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
        _regToDrag:function (drag) {
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
                drops = self.get("drops"),
                drag = self.__activeToDrag;

            self.__set('activeDrag', drag);
            // 预备役清掉
            self.__activeToDrag = 0;
            // 真正开始移动了才激活垫片
            if (drag.get("shim")) {
                activeShim(self);
            }
            _activeDrops(self);
        },

        _addValidDrop:function (drop) {
            this.get("validDrops").push(drop);
        },

        /**
         * 全局通知当前拖动对象：结束拖动了！
         */
        _end:function () {
            var self = this,
                activeDrag = self.get("activeDrag"),
                activeDrop = self.get("activeDrop");
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
            self.__set("activeDrag", null);
            self.__set("activeDrop", null);
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
    requires:["ua", "dom", "event", "node", "base"]
});

/**
 * refer
 *  - YUI3 dd
 */
