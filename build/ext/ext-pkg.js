/*
Copyright 2010, KISSY UI Library v1.1.6
MIT Licensed
build time: Nov 24 11:33
*/
/**
 * align extension
 * @author:承玉<yiminghe@gmail.com>,乔花<qiaohua@taobao.com>
 */
KISSY.add("ext-align", function(S) {
    S.namespace("Ext");
    var DOM = S.DOM,Node = S.Node;

    function AlignExt() {
        S.log("align init");
        var self = this;
        self.on("bindUI", self._bindUIAlign, self);
        self.on("renderUI", self._renderUIAlign, self);
        self.on("syncUI", self._syncUIAlign, self);
    }

    S.mix(AlignExt, {
        TL: 'tl',
        TC: 'tc',
        TR: 'tr',
        CL: 'cl',
        CC: 'cc',
        CR: 'cr',
        BL: 'bl',
        BC: 'bc',
        BR: 'br'
    });


    AlignExt.ATTRS = {
        align:{
            /*
             value:{
             node: null,         // 参考元素, falsy 值为可视区域, 'trigger' 为触发元素, 其他为指定元素
             points: [AlignExt.CC, AlignExt.CC], // ['tr', 'tl'] 表示 overlay 的 tl 与参考节点的 tr 对齐
             offset: [0, 0]      // 有效值为 [n, m]
             }*/
        }
    };


    /**
     * 获取 node 上的 align 对齐点 相对于页面的坐标
     * @param {?Element} node
     * @param align
     */
    function _getAlignOffset(node, align) {
        var V = align.charAt(0),
            H = align.charAt(1),
            offset, w, h, x, y;

        if (node) {
            node = S.one(node);
            offset = node.offset();
            w = node[0].offsetWidth;
            h = node[0].offsetHeight;
        } else {
            offset = { left: DOM.scrollLeft(), top: DOM.scrollTop() };
            w = DOM.viewportWidth();
            h = DOM.viewportHeight();
        }

        x = offset.left;
        y = offset.top;

        if (V === 'c') {
            y += h / 2;
        } else if (V === 'b') {
            y += h;
        }

        if (H === 'c') {
            x += w / 2;
        } else if (H === 'r') {
            x += w;
        }

        return { left: x, top: y };
    }

    AlignExt.prototype = {
        _bindUIAlign:function() {
            S.log("_bindUIAlign");
        },
        _renderUIAlign:function() {
            S.log("_renderUIAlign");
        },
        _syncUIAlign:function() {
            S.log("_syncUIAlign");
        },
        _uiSetAlign:function(v) {
            S.log("_uiSetAlign");
            if (S.isPlainObject(v)) {
                this.align(v.node, v.points, v.offset);
            }
        },
        /**
         * 对齐 Overlay 到 node 的 points 点, 偏移 offset 处
         * @param {Element=} node 参照元素, 可取配置选项中的设置, 也可是一元素
         * @param {Array.<string>} points 对齐方式
         * @param {Array.<number>} offset 偏移
         */
        align: function(node, points, offset) {

            var self = this,
                xy,
                diff,
                p1,
                el = self.get("el"),
                p2;
            offset = offset || [0,0];
            xy = DOM.offset(el);
            // p1 是 node 上 points[0] 的 offset
            // p2 是 overlay 上 points[1] 的 offset
            p1 = _getAlignOffset(node, points[0]);
            p2 = _getAlignOffset(el, points[1]);
            diff = [p2.left - p1.left, p2.top - p1.top];
            var v = [xy.left - diff[0] + (+offset[0]),
                xy.top - diff[1] + (+offset[1])];
            self.set("xy", v);
        },



        /**
         * 居中显示到可视区域, 一次性居中
         */
        center: function(node) {
            this.set("align", {
                node:node,
                points:[AlignExt.CC, AlignExt.CC],
                offset:[0,0]
            });
        },

        __destructor:function() {
            S.log("align __destructor");
        }
    };

    S.Ext.Align = AlignExt;

});/**
 * basic box support for component
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-box", function(S) {
    S.namespace("Ext");

    var doc = document,Node = S.Node;

    function BoxExt() {
        S.log("box init");
        var self = this;
        self.on("renderUI", self._renderUIBoxExt, self);
        self.on("syncUI", self._syncUIBoxExt, self);
        self.on("bindUI", self._bindUIBoxExt, self);

    }

    BoxExt.ATTRS = {
        el: {
            //容器元素
            setter:function(v) {
                if (S.isString(v))
                    return S.one(v);
            }
        },
        elCls: {
            // 容器的 class           
        },
        elStyle:{
            //容器的行内样式
        },
        width: {
            // 宽度           
        },
        height: {
            // 高度
        },

        html: {
            // 内容, 默认为 undefined, 不设置
            value: false
        }
    };

    BoxExt.HTML_PARSER = {
        el:function(srcNode) {
            return srcNode;
        }
    };

    BoxExt.prototype = {
        _syncUIBoxExt:function() {
            S.log("_syncUIBoxExt");
        },
        _bindUIBoxExt:function() {
            S.log("_bindUIBoxExt");
        },
        _renderUIBoxExt:function() {
            S.log("_renderUIBoxExt");
            var self = this,
                render = self.get("render") || S.one(doc.body),
                el = self.get("el");
            render = new Node(render);
            if (!el) {
                el = new Node("<div>");
                render.prepend(el);
                self.set("el", el);
            }
        },

        _uiSetElCls:function(cls) {
            S.log("_uiSetElCls");
            if (cls) {
                this.get("el").addClass(cls);
            }
        },

        _uiSetElStyle:function(style) {
            S.log("_uiSetElStyle");
            if (style) {
                this.get("el").css(style);
            }
        },

        _uiSetWidth:function(w) {
            S.log("_uiSetWidth");
            var self = this;
            if (w) {
                self.get("el").width(w);
            }
        },

        _uiSetHeight:function(h) {
            S.log("_uiSetHeight");
            var self = this;
            if (h) {
                self.get("el").height(h);
            }
        },

        _uiSetHtml:function(c) {
            S.log("_uiSetHtml");
            if (c !== false){
                this.get("el").html(c);
            }

        },

        __destructor:function() {
            S.log("box __destructor");
            var el = this.get("el");
            if (el) {
                el.detach();
                el.remove();
            }
        }
    };

    S.Ext.Box = BoxExt;
});/**
 * close extension for kissy dialog
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-overlay-close", function(S) {
    S.namespace("Ext");
    var CLS_PREFIX = 'ks-ext-',Node = S.Node;

    function CloseExt() {
        S.log("close init");
        var self = this;
        self.on("renderUI", self._rendUICloseExt, self);
        self.on("bindUI", self._bindUICloseExt, self);
        self.on("syncUI", self._syncUICloseExt, self);
    }

    CloseExt.ATTRS = {
        closable: {             // 是否需要关闭按钮
            value: true
        },
        closeBtn:{}
    };

    CloseExt.HTML_PARSER = {
        closeBtn:"." + CLS_PREFIX + 'close'
    };

    CloseExt.prototype = {
        _syncUICloseExt:function() {
            S.log("_syncUICloseExt");
        },
        _uiSetClosable:function(v) {
            S.log("_uiSetClosable");
            var self = this,
                closeBtn = self.get("closeBtn");
            if (closeBtn) {
                if (v) {
                    closeBtn.show();
                } else {
                    closeBtn.hide();
                }
            }
        },
        _rendUICloseExt:function() {
            S.log("_rendUICloseExt");
            var self = this,
                closeBtn = self.get("closeBtn"),
                el = self.get("contentEl");

            if (!closeBtn &&
                el) {
                closeBtn = new Node("<a " +
                    "href='#' " +
                    "class='" + CLS_PREFIX + "close" + "'>" +
                    "<span class='" +
                    CLS_PREFIX + "close-x" +
                    "'>X</span>" +
                    "</a>")
                    .appendTo(el);
                self.set("closeBtn", closeBtn);
            }
        },
        _bindUICloseExt:function() {
            S.log("_bindUICloseExt");
            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn && closeBtn.on("click", function(ev) {
                self.hide();
                ev.halt();
            });
        },

        __destructor:function() {
            S.log("close-ext __destructor");
            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn && closeBtn.detach();
        }
    };
    S.Ext.Close = CloseExt;

});KISSY.add("ext-constrain", function(S) {
    S.namespace("Ext");

    var DOM = S.DOM,
        Node = S.Node;

    function ConstrainExt() {
        S.log("constrain init");
        var self = this;
        self.on("bindUI", self._bindUIConstrain, self);
        self.on("renderUI", self._renderUIConstrain, self);
        self.on("syncUI", self._syncUIConstrain, self);
    }

    ConstrainExt.ATTRS = {
        constrain:{
            //不限制
            //true:viewport限制
            //node:限制在节点范围
            value:false
        }
    };

    /**
     * 获取受限区域的宽高, 位置
     * @return {Object | undefined} {left: 0, top: 0, maxLeft: 100, maxTop: 100}
     */
    function _getConstrainRegion(constrain) {
        var ret = undefined;
        if (!constrain) return ret;
        var el = this.get("el");
        if (constrain !== true) {
            constrain = S.one(constrain);
            ret = constrain.offset();
            S.mix(ret, {
                maxLeft: ret.left + constrain[0].offsetWidth - el[0].offsetWidth,
                maxTop: ret.top + constrain[0].offsetHeight - el[0].offsetHeight
            });
        }
        // 没有指定 constrain, 表示受限于可视区域
        else {
            var vWidth = document.documentElement.clientWidth;
            ret = { left: DOM.scrollLeft(), top: DOM.scrollTop() };

            S.mix(ret, {
                maxLeft: ret.left + vWidth - el[0].offsetWidth,
                maxTop: ret.top + DOM.viewportHeight() - el[0].offsetHeight
            });
        }
        return ret;
    }

    ConstrainExt.prototype = {
        _bindUIConstrain:function() {
            S.log("_bindUIConstrain");

        },
        _renderUIConstrain:function() {
            S.log("_renderUIConstrain");
            var self = this,
                attrs = self.getDefAttrs(),
                xAttr = attrs["x"],
                yAttr = attrs["y"],
                oriXSetter = xAttr["setter"],
                oriYSetter = yAttr["setter"];
            xAttr.setter = function(v) {                
                var r = oriXSetter && oriXSetter(v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) return r;
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.left),
                    _ConstrainExtRegion.maxLeft);
            };
            yAttr.setter = function(v) {
                var r = oriYSetter && oriYSetter(v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) return r;
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.top),
                    _ConstrainExtRegion.maxTop);
            };
            self.addAttr("x", xAttr);
            self.addAttr("y", yAttr);
        },

        _syncUIConstrain:function() {
            S.log("_syncUIConstrain");
        },
        __destructor:function() {
            S.log("constrain-ext __destructor");
        }

    };


    S.Ext.Constrain = ConstrainExt;

});/**
 * 里层包裹层定义，适合mask以及shim
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-contentbox", function(S) {

    S.namespace("Ext");
    var Node = S.Node;

    function ContentBox() {
         S.log("contentbox init");
        var self = this;
        self.on("renderUI", self._renderUIContentBox, self);
        self.on("syncUI", self._syncUIContentBox, self);
        self.on("bindUI", self._bindUIContentBox, self);
    }

    ContentBox.ATTRS = {
        //内容容器节点
        contentEl:{},
        //层内容
        content:{}
    };


    ContentBox.HTML_PARSER = {
        contentEl:".ks-contentbox"
    };

    ContentBox.prototype = {
        _syncUIContentBox:function() {
            S.log("_syncUIContentBox");
        },
        _bindUIContentBox:function() {
            S.log("_bindUIContentBox");
        },
        _renderUIContentBox:function() {
            S.log("_renderUIContentBox");
            var self = this,
                contentEl = self.get("contentEl"),
                el = self.get("el");
            if (!contentEl) {
                contentEl = new Node("<div class='ks-contentbox'>").appendTo(el);
                self.set("contentEl", contentEl);
            }
        },

        _uiSetContent:function(c) {
            S.log("_uiSetContent");
            if (c !== undefined) {
                this.get("contentEl").html(c);
            }
        },

        __destructor:function(){
            S.log("contentbox __destructor");
        }
    };

    S.Ext.ContentBox = ContentBox;
});/**
 * drag extension for position
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-drag", function(S) {
    S.namespace('Ext');
    function DragExt() {
         S.log("drag init");
        var self = this;
        self.on("bindUI", self._bindUIDragExt, self);
        self.on("renderUI", self._renderUIDragExt, self);
        self.on("syncUIUI", self._syncUIDragExt, self);
    }

    DragExt.ATTRS = {
        handlers:{value:[]},
        draggable:{value:true}
    };

    DragExt.prototype = {

        _uiSetHandlers:function(v) {
            S.log("_uiSetHanlders");
            if (v && v.length > 0)
                this.__drag.set("handlers", v);
        },

        _syncUIDragExt:function() {
            S.log("_syncUIDragExt");
        },

        _renderUIDragExt:function() {
            S.log("_renderUIDragExt");
        },

        _bindUIDragExt:function() {
            S.log("_bindUIDragExt");
            var self = this,el = self.get("el");
            self.__drag = new S.Draggable({
                node:el,
                handlers:self.get("handlers")
            });
        },

        _uiSetDraggable:function(v) {
            S.log("_uiSetDraggable");
            var self = this,d = self.__drag;
            if (v) {
                d.detach("drag");
                d.on("drag", self._dragExtAction, self);
            } else {
                d.detach("drag");
            }
        },

        _dragExtAction:function(offset) {
            this.set("xy", [offset.left,offset.top])
        },
        /**
         *
         */
        __destructor:function() {
            S.log("DragExt __destructor");
            var d = this.__drag;
            d&&d.destroy();
        }

    };

    S.Ext.Drag = DragExt;

});/**
 * loading mask support for overlay
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-loading", function(S) {
    S.namespace("Ext");
    function LoadingExt() {
        S.log("LoadingExt init");
    }

    LoadingExt.prototype = {
        loading:function() {
            var self = this;
            if (!self._loadingExtEl) {
                self._loadingExtEl = new S.Node("<div " +
                    "class='ks-ext-loading'" +
                    " style='position: absolute;" +
                    "border: none;" +
                    "width: 100%;" +
                    "top: 0;" +
                    "left: 0;" +
                    "z-index: 99999;" +
                    "height:100%;" +
                    "*height: expression(this.parentNode.offsetHeight);" + "'>").appendTo(self.get("el"));
            }
            self._loadingExtEl.show();
        },

        unloading:function() {
            var lel = this._loadingExtEl;
            lel && lel.hide();
        }
    };

    S.Ext.Loading = LoadingExt;

});KISSY.add("ext-mask", function(S) {
    S.namespace("Ext");
    /**
     * 多 position 共享一个遮罩
     */
    var mask,
        UA = S.UA,
        num = 0;


    function initMask() {
        mask = new S.Node("<div class='ks-ext-mask'>").prependTo(document.body);
        mask.css({
            "position":"absolute",
            left:0,
            top:0,
            width:"100%",
            "height": S.DOM.docHeight()
        });
        if (UA.ie == 6) {
            mask.append("<iframe style='width:100%;" +
                "height:expression(this.parentNode.offsetHeight);" +
                "filter:alpha(opacity=0);" +
                "z-index:-1;'>");
        }
    }

    function MaskExt() {
        S.log("mask init");
        var self = this;
        self.on("bindUI", self._bindUIMask, self);
        self.on("renderUI", self._renderUIMask, self);
        self.on("syncUI", self._syncUIMask, self);
    }

    MaskExt.ATTRS = {
        mask:{
            value:false
        }
    };

    MaskExt.prototype = {
        _bindUIMask:function() {
            S.log("_bindUIMask");
        },

        _renderUIMask:function() {
            S.log("_renderUIMask");
        },

        _syncUIMask:function() {
            S.log("_syncUIMask");
        },
        _uiSetMask:function(v) {
            S.log("_uiSetMask");
            var self = this;
            if (v) {
                self.on("show", self._maskExtShow, self);
                self.on("hide", self._maskExtHide, self);
            } else {
                self.detach("show", self._maskExtShow, self);
                self.detach("hide", self._maskExtHide, self);
            }
        },

        _maskExtShow:function() {
            if (!mask) {
                initMask();
            }
            mask.css({
                "z-index":this.get("zIndex") - 1
            });
            num++;
            mask.show();
        },

        _maskExtHide:function() {
            num--;
            if (num <= 0) num = 0;
            if (!num)
                mask && mask.hide();
        },

        __destructor:function() {
            S.log("mask __destructor");
        }

    };

    S.Ext.Mask = MaskExt;
});/**
 * position and visible extension，可定位的隐藏层
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-position", function(S) {
    S.namespace("Ext");

    var doc = document ,
        Event = S.Event,
        KEYDOWN = "keydown";

    function PositionExt() {
        S.log("position init");
        var self = this;
        self.on("bindUI", self._bindUIPosition, self);
        self.on("renderUI", self._renderUIPosition, self);
        self.on("syncUI", self._syncUIPosition, self);
    }

    PositionExt.ATTRS = {
        x: {
            // 水平方向绝对位置
        },
        y: {
            // 垂直方向绝对位置
        },
        xy: {
            // 相对 page 定位, 有效值为 [n, m], 为 null 时, 选 align 设置
            setter: function(v) {
                
                var self = this,
                    xy = S.makeArray(v);

                if (xy.length) {
                    xy[0] && self.set("x", xy[0]);
                    xy[1] && self.set("y", xy[1]);
                }
                return v;
            }
        },
        zIndex: {
            value: 9999
        },
        visible:{
            value:undefined
        }
    };


    PositionExt.prototype = {
        _syncUIPosition:function() {
            S.log("_syncUIPosition");
        },
        _renderUIPosition:function() {
            S.log("_renderUIPosition");
            this.get("el").addClass("ks-ext-position");
            this.get("el").css("display", "");
        },
        _bindUIPosition:function() {
            S.log("_bindUIPosition");
        },
        _uiSetZIndex:function(x) {
            S.log("_uiSetZIndex");
            if (x !== undefined)
                this.get("el").css("z-index", x);
        },
        _uiSetX:function(x) {
            S.log("_uiSetX");
            if (x !== undefined)
                this.get("el").offset({
                    left:x
                });
        },
        _uiSetY:function(y) {
            S.log("_uiSetY");
            if (y !== undefined)
                this.get("el").offset({
                    top:y
                });
        },
        _uiSetVisible:function(isVisible) {
            if (isVisible === undefined) return;
            S.log("_uiSetVisible");
            var self = this,
                el = self.get("el");
            el.css("visibility", isVisible ? "visible" : "hidden");
            self[isVisible ? "_bindKey" : "_unbindKey" ]();
            self.fire(isVisible ? "show" : "hide");
        },
        /**
         * 显示/隐藏时绑定的事件
         */
        _bindKey: function() {
            Event.on(doc, KEYDOWN, this._esc, this);
        },

        _unbindKey: function() {
            Event.remove(doc, KEYDOWN, this._esc, this);
        },

        _esc: function(e) {
            if (e.keyCode === 27) this.hide();
        },
        /**
         * 移动到绝对位置上, move(x, y) or move(x) or move([x, y])
         * @param {number|Array.<number>} x
         * @param {number=} y
         */
        move: function(x, y) {
            var self = this;
            if (S.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            self.set("xy", [x,y]);
        },

        /**
         * 显示 Overlay
         */
        show: function() {
            this._firstShow();
        },

        /**
         * 第一次显示时, 需要构建 DOM, 设置位置
         */
        _firstShow: function() {
            var self = this;
            self.renderer();
            self._realShow();
            self._firstShow = self._realShow;
        },


        _realShow: function() {
            this.set("visible", true);
        },

        /**
         * 隐藏
         */
        hide: function() {
            this.set("visible", false);
        },

        __destructor:function() {
            S.log("position __destructor");
        }

    };

    S.Ext.Position = PositionExt;
});/**
 * shim for ie6 ,require box-ext
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-shim", function(S) {
    S.namespace("Ext");
    function ShimExt() {
        S.log("shim init");
        var self = this;
        self.on("renderUI", self._renderUIShimExt, self);
        self.on("bindUI", self._bindUIShimExt, self);
        self.on("syncUI", self._syncUIShimExt, self);
    }

    var Node = S.Node;
    ShimExt.prototype = {
        _syncUIShimExt:function() {
            S.log("_syncUIShimExt");
        },
        _bindUIShimExt:function() {
            S.log("_bindUIShimExt");
        },
        _renderUIShimExt:function() {
            S.log("_renderUIShimExt");
            var self = this,el = self.get("el");
            var shim = new Node("<iframe style='position: absolute;" +
                "border: none;" +
                "width: expression(this.parentNode.offsetWidth);" +
                "top: 0;" +
                "opacity: 0;" +
                "filter: alpha(opacity=0);" +
                "left: 0;" +
                "z-index: -1;" +
                "height: expression(this.parentNode.offsetHeight);" + "'>");
            el.prepend(shim);
        },

        __destructor:function() {
            S.log("shim __destructor");
        }
    };
    S.Ext.Shim = ShimExt;
});/**
 * support standard mod for component
 * @author: yiminghe@gmail.com
 */
KISSY.add("ext-stdmod", function(S) {

    S.namespace("Ext");
    var CLS_PREFIX = "ks-stdmod-",
        Node = S.Node;

    function StdMod() {
        S.log("stdmod init");
        var self = this;
        self.on("renderUI", self._renderUIStdMod, self);
        self.on("syncUI", self._syncUIStdMod, self);
        self.on("bindUI", self._bindUIStdMod, self);
    }

    StdMod.ATTRS = {
        header:{
        },
        body:{
        },
        footer:{
        },
        bodyStyle:{
        },
        headerContent:{
            value:false
        },
        bodyContent:{
            value:false
        },
        footerContent:{
            value:false
        }
    };

    StdMod.HTML_PARSER = {
        header:"." + CLS_PREFIX + "header",
        body:"." + CLS_PREFIX + "body",
        footer:"." + CLS_PREFIX + "footer"
    };


    StdMod.prototype = {
        _bindUIStdMod:function() {
            S.log("_bindUIStdMod");
        },
        _syncUIStdMod:function() {
            S.log("_syncUIStdMod");
        },
        _setStdModContent:function(part, v) {
            if (v !== false) {
                if (S.isString(v)) {
                    this.get(part).html(v);
                } else {
                    this.get(part).html("");
                    this.get(part).append(v);
                }
            }
        },
        _uiSetBodyStyle:function(v) {
            if (v !== undefined) {
                this.get("body").css(v);
            }
        },
        _uiSetBodyContent:function(v) {
            S.log("_uiSetBodyContent");
            this._setStdModContent("body", v);
        },
        _uiSetHeaderContent:function(v) {
            S.log("_uiSetHeaderContent");
            this._setStdModContent("header", v);
        },
        _uiSetFooterContent:function(v) {
            S.log("_uiSetFooterContent");
            this._setStdModContent("footer", v);
        },
        _renderUIStdMod:function() {
            S.log("_renderUIStdMod");
            var self = this,
                el = self.get("contentEl"),
                header = self.get("header"),
                body = self.get("body"),
                footer = self.get("footer"),
                headerContent = self.get("headerContent"),
                bodyContent = self.get("bodyContent"),
                footerContent = self.get("footerContent");
            if (!header) {
                header = new Node("<div class='" + CLS_PREFIX + "header'>").appendTo(el);
                self.set("header", header);
            }
            if (!body) {
                body = new Node("<div class='" + CLS_PREFIX + "body'>").appendTo(el);
                self.set("body", body);
            }
            if (!footer) {
                footer = new Node("<div class='" + CLS_PREFIX + "footer'>").appendTo(el);
                self.set("footer", footer);
            }
        },

        __destructor:function() {
            S.log("stdmod __destructor");
        }
    };


    S.Ext.StdMod = StdMod;

});