/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 15 18:08
*/
KISSY.add("dd/constrain", function (S, Base, Node) {

    var $ = Node.all, WIN = S.Env.host;

    /**
     * @class Provide ability to constrain draggable to specified region
     * @memberOf DD
     */
    function Constrain() {
        Constrain.superclass.constructor.apply(this, arguments);
    }

    function onDragStart(e) {
        var self = this,
            drag = e.drag,
            l, t, lt,
            dragNode = drag.get("dragNode"),
            constrain = self.get("constrain");
        if (constrain) {
            if (constrain === true) {
                var win = $(WIN);
                self.__constrainRegion = {
                    left:l = win.scrollLeft(),
                    top:t = win.scrollTop(),
                    right:l + win.width(),
                    bottom:t + win.height()
                };
            }
            if (constrain.nodeType || S.isString(constrain)) {
                constrain = $(constrain);
            }
            if (constrain.getDOMNode) {
                lt = constrain.offset();
                self.__constrainRegion = {
                    left:lt.left,
                    top:lt.top,
                    right:lt.left + constrain.outerWidth(),
                    bottom:lt.top + constrain.outerHeight()
                };
            } else if (S.isPlainObject(constrain)) {
                self.__constrainRegion = constrain;
            }
            if (self.__constrainRegion) {
                self.__constrainRegion.right -= dragNode.outerWidth();
                self.__constrainRegion.bottom -= dragNode.outerHeight();
            }
        }
    }

    function onDragAlign(e) {
        var self = this,
            info = e.info,
            l = info.left,
            t = info.top,
            constrain = self.__constrainRegion;
        if (constrain) {
            info.left = Math.min(Math.max(constrain.left, l), constrain.right);
            info.top = Math.min(Math.max(constrain.top, t), constrain.bottom);
        }
    }

    function onDragEnd() {
        this.__constrainRegion = null;
    }

    S.extend(Constrain, Base,
        /**
         * @lends DD.Constrain#
         */
        {
            __constrainRegion:null,

            /**
             * start monitoring drag
             * @param {DD.Draggable} drag
             */
            attach:function (drag) {
                var self = this;
                drag.on("dragstart", onDragStart, self)
                    .on("dragend", onDragEnd, self)
                    .on("dragalign", onDragAlign, self);
            },


            /**
             * stop monitoring drag
             * @param {DD.Draggable} drag
             */
            unAttach:function (drag) {
                var self = this;
                drag.detach("dragstart", onDragStart, self)
                    .detach("dragend", onDragEnd, self)
                    .detach("dragalign", onDragAlign, self);
            }
        }, {
            ATTRS:/**
             * @lends DD.Constrain#
             */
            {
                /**
                 * constrained container
                 * @type {boolean|HTMLElement|String}
                 */
                constrain:{
                    value:true
                }
            }
        });

    return Constrain;
}, {
    requires:['base', 'node']
});/**
 * @fileOverview dd support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("dd", function (S, DDM, Draggable, Droppable, Proxy, Constrain, Delegate, DroppableDelegate, Scroll) {
    /**
     * @name DD
     * @namespace Provide the ability to make node draggable and droppable.
     */
    var DD;
    DD = {
        Draggable:Draggable,
        Droppable:Droppable,
        DDM:DDM,
        "Constrain":Constrain,
        Proxy:Proxy,
        DraggableDelegate:Delegate,
        DroppableDelegate:DroppableDelegate,
        Scroll:Scroll
    };
    return DD;
}, {
    requires:["dd/ddm",
        "dd/draggable",
        "dd/droppable",
        "dd/proxy",
        "dd/constrain",
        "dd/draggable-delegate",
        "dd/droppable-delegate",
        "dd/scroll"]
});/**
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
/**
 * @fileOverview delegate all draggable nodes to one draggable object
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/draggable-delegate", function (S, DDM, Draggable, DOM, Node) {

    /**
     * drag multiple nodes under a container element using only one draggable instance as a delegate.
     * @memberOf DD
     * @class
     */
    function DraggableDelegate() {
        DraggableDelegate.superclass.constructor.apply(this, arguments);
    }


    /**
     * 父容器监听 mousedown，找到合适的拖动 handlers 以及拖动节点
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
            node = self._getNode(handler);
        }

        // can not find handler or can not find matched node from handler
        // just return !
        if (!node) {
            return;
        }

        self.__set("activeHandler", handler);

        // 找到 handler 确定 委托的 node ，就算成功了
        self.__set("node", node);
        self.__set("dragNode", node);
        self._prepare(ev);
    }

    S.extend(DraggableDelegate, Draggable, {
            _init:function () {
                var self = this,
                    node = self.get('container');
                node.on('mousedown', _handleMouseDown, self)
                    .on('dragstart', self._fixDragStart);
            },

            /**
             * 得到适合 handler，从这里开始启动拖放，对于 handlers 选择器字符串数组
             * @param target
             */
            _getHandler:function (target) {
                var self = this,
                    ret = undefined,
                    node = self.get("container"),
                    handlers = self.get('handlers');
                while (target && target[0] !== node[0]) {
                    S.each(handlers, function (h) {
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
            _getNode:function (h) {
                return h.closest(this.get("selector"), this.get("container"));
            },

            destroy:function () {
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
            ATTRS:/**
             * @lends DD.DraggableDelegate#
             */
            {
                /**
                 * a selector query to get the container to listen for mousedown events on.
                 * All "draggable selector" should be a child of this container
                 * @type {HTMLElement|String}
                 */
                container:{
                    setter:function (v) {
                        return Node.one(v);
                    }
                },

                /**
                 * a selector query to get the children of container to make draggable elements from.
                 * usually as for tag.cls.
                 * @type {String}
                 */
                selector:{
                },

                /**
                 * handlers to initiate drag operation.
                 * can only be as form of tag.cls.
                 * default:[selector]
                 * @type {String[]}
                 **/
                handlers:{
                    value:[],
                    // 覆盖父类的 getter ，这里 normalize 成节点
                    getter:0
                }

            }
        });

    return DraggableDelegate;
}, {
    requires:['./ddm', './draggable', 'dom', 'node']
});/**
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
            value:false,
            setter:function (d) {
                this.get("dragNode")[d ? 'addClass' :
                    'removeClass'](DDM.get("prefixCls") + '-disabled');
                return d;
            }
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

            _init:function () {
                var self = this,
                    node = self.get('node');
                self.__set("dragNode", node);
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
/**
 * @fileOverview only one droppable instance for multiple droppable nodes
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/droppable-delegate", function (S, DDM, Droppable, DOM, Node) {


    function dragStart() {
        var self = this,
            container = self.get("container"),
            selector = self.get("selector");
        self.__allNodes = container.all(selector);
    }

    /**
     * make multiple nodes droppable under a container using only one droppable instance
     * @memberOf DD
     * @class
     */
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
             * @private
             * @override
             */
            getNodeFromTarget:function (ev, dragNode, proxyNode) {
                var pointer = {
                    left:ev.pageX,
                    top:ev.pageY
                },
                    self = this,
                    allNodes = self.__allNodes,
                    ret = 0,
                    vArea = Number.MAX_VALUE;


                if (allNodes) {
                    allNodes.each(function (n) {
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
                }

                if (ret) {
                    self.__set("lastNode", self.get("node"));
                    self.__set("node", ret);
                }

                return ret;
            },

            _handleOut:function () {
                var self = this;
                DroppableDelegate.superclass._handleOut.apply(self, arguments);
                self.__set("node", 0);
                self.__set("lastNode", 0);
            },

            _handleOver:function (ev) {
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
                    self.__set("node", lastNode);
                    superOut.apply(self, arguments);
                    /**
                     * 再通知这次的进入
                     */
                    self.__set("node", node);
                    superEnter.call(self, ev);
                } else {
                    superOver.call(self, ev);
                }
            },

            _end:function () {
                var self = this;
                DroppableDelegate.superclass._end.apply(self, arguments);
                self.__set("node", 0);
            }
        },
        {
            ATTRS:/**
             * @lends DD.DroppableDelegate#
             */
            {


                // 继承自 Drappable ，当前正在委托的放节点目标


                /**
                 * 上一个成为放目标的委托节点
                 * @private
                 */
                lastNode:{
                },

                /**
                 * a selector query to get the children of container to make droppable elements from.
                 * usually as for tag.cls.
                 * @type String
                 */
                selector:{
                },

                /**
                 * a selector query to get the container to listen for mousedown events on.
                 * All "draggable selector" should be a child of this container
                 * @type {String|HTMLElement}
                 */
                container:{
                    setter:function (v) {
                        return Node.one(v);
                    }
                }
            }
        });

    return DroppableDelegate;
}, {
    requires:['./ddm', './droppable', 'dom', 'node']
});/**
 * @fileOverview droppable for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/droppable", function (S, Node, Base, DDM) {

    /**
     * make a node droppable
     * @memberOf DD
     * @class
     */
    function Droppable() {
        var self = this;
        Droppable.superclass.constructor.apply(self, arguments);
        self.addTarget(DDM);
        S.each([
        /**
         * @name DD.DDM#dropexit
         * @description fired after a draggable leaves a droppable
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * @name DD.Droppable#dropexit
         * @description fired after a draggable leaves a droppable
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            "dropexit",

        /**
         * @name DD.DDM#dropenter
         * @description fired after a draggable object mouseenter a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * @name DD.Droppable#dropenter
         * @description fired after a draggable object mouseenter a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

            "dropenter",

        /**
         * @name DD.DDM#dropover
         * @description fired after a draggable object mouseover a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * @name DD.Droppable#dropover
         * @description fired after a draggable object mouseover a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            "dropover",

        /**
         * @name DD.DDM#drophit
         * @description fired after drop a draggable onto a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */

        /**
         * @name DD.Droppable#drophit
         * @description fired after drop a draggable onto a droppable object
         * @event
         * @param e
         * @param e.drag current draggable object
         * @param e.drop current droppable object
         */
            "drophit"
        ], function (e) {
            self.publish(e, {
                bubbles:1
            });
        });
        self._init();
    }

    Droppable.ATTRS =
    /**
     * @lends DD.Droppable#
     */
    {
        /**
         * droppable element
         * @type String|HTMLElement
         */
        node:{
            setter:function (v) {
                if (v) {
                    return Node.one(v);
                }
            }
        },

        /**
         * groups this droppable object belongs to. Default:true
         * @type Object|boolean true to match any group
         */
        groups:{
            value:true
        }

    };

    function validDrop(dropGroups, dragGroups) {
        if (dropGroups === true) {
            return 1;
        }
        for (var d in dropGroups) {
            if (dragGroups[d]) {
                return 1;
            }
        }
        return 0;
    }

    S.extend(Droppable, Base,
        /**
         * @lends DD.Droppable#
         */
        {
            /**
             * override by droppable-delegate override
             * @private
             */
            getNodeFromTarget:function (ev, dragNode, proxyNode) {
                var node = this.get("node"),
                    domNode = node[0];
                // 排除当前拖放和代理节点
                return domNode == dragNode ||
                    domNode == proxyNode
                    ? null : node;
            },

            _init:function () {
                DDM._regDrop(this);
            },

            _active:function () {
                var self = this,
                    drag = DDM.get("activeDrag"),
                    node = self.get("node"),
                    dropGroups = self.get("groups"),
                    dragGroups = drag.get("groups"),
                    prefixCls = DDM.get("prefixCls");
                if (validDrop(dropGroups, dragGroups)) {
                    DDM._addValidDrop(self);
                    // 委托时取不到节点
                    if (node) {
                        node.addClass(prefixCls + "drop-active-valid");
                    }
                } else if (node) {
                    node.addClass(prefixCls + "drop-active-invalid");
                }
            },

            _deActive:function () {
                var node = this.get("node"),
                    prefixCls = DDM.get("prefixCls");
                if (node) {
                    node.removeClass(prefixCls + "drop-active-valid")
                        .removeClass(prefixCls + "drop-active-invalid");
                }
            },

            __getCustomEvt:function (ev) {
                return S.mix({
                    drag:DDM.get("activeDrag"),
                    drop:this
                }, ev);
            },

            _handleOut:function () {
                var self = this,
                    ret = self.__getCustomEvt();
                self.get("node").removeClass(DDM.get("prefixCls") + "drop-over");
                /**
                 * html5 => dragleave
                 */
                self.fire("dropexit", ret);
            },

            _handleEnter:function (ev) {
                var self = this,
                    e = self.__getCustomEvt(ev);
                e.drag._handleEnter(e);
                self.get("node").addClass(DDM.get("prefixCls") + "drop-over");
                self.fire("dropenter", e);
            },


            _handleOver:function (ev) {
                var self = this,
                    e = self.__getCustomEvt(ev);
                e.drag._handleOver(e);
                self.fire("dropover", e);
            },

            _end:function () {
                var self = this,
                    ret = self.__getCustomEvt();
                self.get("node").removeClass(DDM.get("prefixCls") + "drop-over");
                self.fire('drophit', ret);
            },

            /**
             * make this droppable' element undroppable
             */
            destroy:function () {
                DDM._unRegDrop(this);
            }
        });

    return Droppable;

}, { requires:["node", "base", "./ddm"] });/**
 * @fileOverview generate proxy drag object,
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/proxy", function (S, Node, Base) {
    var DESTRUCTOR_ID = "__proxy_destructors",
        stamp = S.stamp,
        MARKER = S.guid("__dd_proxy"),
        PROXY_ATTR = "__proxy";

    /**
     * provide abilities for draggable tp create a proxy drag node,
     * instead of dragging the original node.
     * @memberOf DD
     * @class
     */
    function Proxy() {
        var self = this;
        Proxy.superclass.constructor.apply(self, arguments);
        self[DESTRUCTOR_ID] = {};
    }

    Proxy.ATTRS =
    /**
     * @lends DD.Proxy#
     */
    {
        /**
         * how to get the proxy node. default:clone the node itself deeply.
         * @type {Function}
         */
        node:{
            value:function (drag) {
                return new Node(drag.get("node").clone(true));
            }
        },
        /**
         * destroy the proxy node at the end of this drag. default:false
         * @type {boolean}
         */
        destroyOnEnd:{
            value:false
        },

        /**
         * move the original node at the end of the drag. default:true
         * @type {boolean}
         */
        moveOnEnd:{
            value:true
        }
    };

    S.extend(Proxy, Base,
        /**
         * @lends DD.Proxy#
         */
        {
            /**
             * make this draggable object can be proxied.
             * @param {DD.Draggable} drag
             */
            attach:function (drag) {

                var self = this,
                    tag = stamp(drag, 1, MARKER);

                if (tag && self[DESTRUCTOR_ID][tag]) {
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
                    drag.__set("dragNode", dragNode);
                    drag.__set("node", node);
                }

                function end() {
                    var node = self[PROXY_ATTR];
                    if (self.get("moveOnEnd")) {
                        drag.get("dragNode").offset(node.offset());
                    }
                    if (self.get("destroyOnEnd")) {
                        node.remove();
                        self[PROXY_ATTR] = 0;
                    } else {
                        node.hide();
                    }
                    drag.__set("node", drag.get("dragNode"));
                }

                drag.on("dragstart", start);
                drag.on("dragend", end);

                tag = stamp(drag, 0, MARKER);

                self[DESTRUCTOR_ID][tag] = {
                    drag:drag,
                    fn:function () {
                        drag.detach("dragstart", start);
                        drag.detach("dragend", end);
                    }
                };
            },
            /**
             * make this draggable object unproxied
             * @param {DD.Draggable} drag
             */
            unAttach:function (drag) {
                var self = this,
                    tag = stamp(drag, 1, MARKER),
                    destructors = self[DESTRUCTOR_ID];
                if (tag && destructors[tag]) {
                    destructors[tag].fn();
                    delete destructors[tag];
                }
            },

            /**
             * make all draggable object associated with this proxy object unproxied
             */
            destroy:function () {
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
    requires:['node', 'base']
});/**
 * @fileOverview auto scroll for drag object's container
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/scroll", function (S, Base, Node, DOM) {

    var TAG_DRAG = "__dd-scroll-id-",
        win=S.Env.host,
        stamp = S.stamp,
        RATE = [10, 10],
        ADJUST_DELAY = 100,
        DIFF = [20, 20],
        DESTRUCTORS = "__dd_scrolls";

    /**
     * make parent node scroll while dragging
     * @memberOf DD
     * @class
     */
    function Scroll() {
        var self = this;
        Scroll.superclass.constructor.apply(self, arguments);
        self[DESTRUCTORS] = {};
    }

    Scroll.ATTRS =
    /**
     * @lends DD.Scroll#
     */
    {
        /**
         * node to be scrolled while dragging
         * @type {window|String|HTMLElement}
         */
        node:{
            // value:window：不行，默认值一定是简单对象
            valueFn:function () {
                return Node.one(win);
            },
            setter:function (v) {
                return Node.one(v);
            }
        },
        /**
         * adjust velocity. default:[10,10]. larger faster
         * @type Number[]
         */
        rate:{
            value:RATE
        },
        /**
         * the margin to make node scroll. default: [20,20].
         * easier to scroll for node if larger.
         * @type number[]
         */
        diff:{
            value:DIFF
        }
    };


    var isWin = S.isWindow;

    S.extend(Scroll, Base,
        /**
         * @lends DD.Scroll#
         */
        {
            /**
             * @private
             * @param node
             */
            getRegion:function (node) {
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

            /**
             * @private
             * @param node
             */
            getOffset:function (node) {
                if (isWin(node[0])) {
                    return {
                        left:DOM.scrollLeft(),
                        top:DOM.scrollTop()
                    };
                } else {
                    return node.offset();
                }
            },

            /**
             * @private
             * @param node
             */
            getScroll:function (node) {
                return {
                    left:node.scrollLeft(),
                    top:node.scrollTop()
                };
            },

            /**
             * @private
             * @param node
             */
            setScroll:function (node, r) {
                node.scrollLeft(r.left);
                node.scrollTop(r.top);
            },

            /**
             * make node not to scroll while this drag object is dragging
             * @param {DD.Draggable} drag
             */
            unAttach:function (drag) {
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

            /**
             * make node not to scroll at all
             */
            destroy:function () {
                var self = this,
                    destructors = self[DESTRUCTORS];
                for (var d in destructors) {
                    self.unAttach(destructors[d].drag);
                }
            },

            /**
             * make node to scroll while this drag object is dragging
             * @param {DD.Draggable} drag
             */
            attach:function (drag) {
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
                    fn:function () {
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
                        if (drag.get("move")) {
                            drag.get("node").offset(event);
                        }
                        drag.fire("drag", event);
                    } else {
                        timer = null;
                    }
                }

            }
        });

    return Scroll;
}, {
    requires:['base', 'node', 'dom']
});
