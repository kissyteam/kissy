/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  UIBase
 * @author  lifesinger@gmail.com, 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase', function (S) {

    var UI_SET = '_uiSet', SRC_NODE = 'srcNode',
        ATTRS = 'ATTRS', HTML_PARSER = 'HTML_PARSER',
        Attribute = S.Attribute, Base = S.Base,
        capitalFirst = Attribute.__capitalFirst,
        noop = function() {
        };

    /*
     * UIBase for class-based component
     */
    function UIBase(config) {
        Base.apply(this, arguments);
        initHierarchy(this, config);
        config && config.autoRender && this.render();
    }

    /**
     * 模拟多继承
     * init attr using constructors ATTRS meta info
     */
    function initHierarchy(host, config) {

        var c = host.constructor;

        while (c) {

            // 从 markup 生成相应的属性项
            if (config &&
                config[SRC_NODE] &&
                c.HTML_PARSER) {
                if ((config[SRC_NODE] = S.one(config[SRC_NODE])))
                    applyParser.call(host, config[SRC_NODE], c.HTML_PARSER);
            }

            c = c.superclass && c.superclass.constructor;
        }

        callMethodByHierarchy(host, "initializer", "constructor");

    }

    function callMethodByHierarchy(host, mainMethod, extMethod) {
        var c = host.constructor,
            extChains = [],
            ext,
            main,
            exts,
            t;

        // define
        while (c) {

            // 收集扩展类
            t = [];
            if ((exts = c.__ks_exts)) {
                for (var i = 0; i < exts.length; i++) {
                    ext = exts[i];
                    if (ext) {
                        if (extMethod != "constructor") {
                            ext = exts[i].prototype[extMethod];
                        }
                        ext && t.push(ext);
                    }
                }
            }

            // 收集主类
            if ((main = c.prototype[mainMethod])) {
                t.push(main);
            }

            // 原地 reverse
            if (t.length) {
                extChains.push.apply(extChains, t.reverse());
            }

            c = c.superclass && c.superclass.constructor;
        }

        // 初始化函数
        // 顺序：父类的所有扩展类函数 -> 父类对应函数 -> 子类的所有扩展函数 -> 子类对应函数
        for (i = extChains.length - 1; i >= 0; i--) {
            extChains[i] && extChains[i].call(host);
        }
    }

    /**
     * 销毁组件
     * 顺序：子类扩展 destructor -> 子类 destructor -> 父类扩展 destructor -> 父类 destructor
     */
    function destroyHierarchy(host) {
        var c = host.constructor,
            exts,
            d,
            i;

        while (c) {
            (d = c.prototype.destructor) && d.apply(host);

            if ((exts = c.__ks_exts)) {
                for (i = exts.length - 1; i >= 0; i--) {
                    d = exts[i] && exts[i].prototype.__destructor;
                    d && d.apply(host);
                }
            }

            c = c.superclass && c.superclass.constructor;
        }
    }

    function applyParser(srcNode, parser) {
        var host = this, p, v;

        // 从 parser 中，默默设置属性，不触发事件
        for (p in parser) {
            if (parser.hasOwnProperty(p)) {
                v = parser[p];

                // 函数
                if (S.isFunction(v)) {
                    host.__set(p, v.call(host, srcNode));
                }
                // 单选选择器
                else if (S.isString(v)) {
                    host.__set(p, srcNode.one(v));
                }
                // 多选选择器
                else if (S.isArray(v) && v[0]) {
                    host.__set(p, srcNode.all(v[0]))
                }
            }
        }
    }

    UIBase.HTML_PARSER = {};
    UIBase.ATTRS = {
        //渲染容器
        render:{
            valueFn:function() {
                return document.body;
            }
        },
        //是否已经渲染过
        rendered:{value:false}
    };

    S.extend(UIBase, Base, {

        render: function() {
            var self = this;
            if (!self.get("rendered")) {
                self._renderUI();
                self.fire('renderUI');
                callMethodByHierarchy(self, "renderUI", "__renderUI");

                self._bindUI();
                self.fire('bindUI');
                callMethodByHierarchy(self, "bindUI", "__bindUI");

                self._syncUI();
                self.fire('syncUI');
                callMethodByHierarchy(self, "syncUI", "__syncUI");
                self.set("rendered", true);
            }
        },

        /**
         * 根据属性添加 DOM 节点
         */
        _renderUI: noop,
        renderUI: noop,

        /**
         * 根据属性变化设置 UI
         */
        _bindUI: function() {
            var self = this,
                attrs = self.__getDefAttrs(),
                attr, m;

            for (attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    m = UI_SET + capitalFirst(attr);
                    if (self[m]) {
                        // 自动绑定事件到对应函数
                        (function(attr, m) {
                            self.on('after' + capitalFirst(attr) + 'Change', function(ev) {
                                self[m](ev.newVal, ev);
                            });
                        })(attr, m);
                    }
                }
            }
        },
        bindUI: noop,

        /**
         * 根据当前（初始化）状态来设置 UI
         */
        _syncUI: function() {
            var self = this,
                attrs = self.__getDefAttrs();
            for (var a in attrs) {
                if (attrs.hasOwnProperty(a)) {
                    var m = UI_SET + capitalFirst(a);
                    if (self[m]) {
                        self[m](self.get(a));
                    }
                }
            }
        },
        syncUI: noop,

        destroy: function() {
            destroyHierarchy(this);
            this.fire('destroy');
            this.detach();
        }
    });

    /**
     * 根据基类以及扩展类得到新类
     * @param {function} base 基类
     * @param {Array.<function>} exts 扩展类
     * @param {Object} px 原型 mix 对象
     * @param {Object} sx 静态 mix 对象
     */
    UIBase.create = function(base, exts, px, sx) {
        if (S.isArray(base)) {
            sx = px;
            px = exts;
            exts = base;
            base = UIBase;
        }
        base = base || UIBase;

        function C() {
            UIBase.apply(this, arguments);
        }

        S.extend(C, base, px, sx);

        if (exts) {
            C.__ks_exts = exts;

            S.each(exts, function(ext) {
                if (!ext)return;
                // 合并 ATTRS/HTML_PARSER 到主类
                S.each([ATTRS, HTML_PARSER], function(K) {
                    if (ext[K]) {
                        C[K] = C[K] || {};
                        // 不覆盖主类上的定义
                        S.mix(C[K], ext[K], false);
                    }
                });

                // 合并功能代码到主类，不覆盖
                S.augment(C, ext, false);
            });
        }

        return C;
    };

    S.UIBase = UIBase;
}, {
    requires:["core"]
});
/**
 * UIBase.Align
 * @author: 承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('uibase-align', function(S) {

    var DOM = S.DOM;

    function Align() {
    }

    S.mix(Align, {
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

    Align.ATTRS = {
        align: {
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
    function getAlignOffset(node, align) {
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

    Align.prototype = {

        _uiSetAlign: function(v) {

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
                el = self.get('el'),
                p2;

            offset = offset || [0,0];
            xy = el.offset();

            // p1 是 node 上 points[0] 的 offset
            // p2 是 overlay 上 points[1] 的 offset
            p1 = getAlignOffset(node, points[0]);
            p2 = getAlignOffset(el, points[1]);

            diff = [p2.left - p1.left, p2.top - p1.top];
            xy = [
                xy.left - diff[0] + (+offset[0]),
                xy.top - diff[1] + (+offset[1])
            ];
            self.set('xy', xy);
        },

        /**
         * 居中显示到可视区域, 一次性居中
         */
        center: function(node) {
            this.set('align', {
                node: node,
                points: [Align.CC, Align.CC],
                offset: [0, 0]
            });
        }
    };

    S.UIBase.Align = Align;
},{
    host:"uibase"
});
/**
 * UIBase.Box
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase-box', function(S) {
    S.namespace("UIBase");
    var doc = document,
        Node = S.Node;

    function Box() {
        //S.log("box init");
    }

    S.mix(Box, {
        APPEND:1,
        INSERT:0
    });

    Box.ATTRS = {
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
        elTagName:{
            //生成标签名字
            value:"div"
        },
        elAttrs:{
            //其他属性
        },
        elOrder:{
            //插入容器位置
            //0 : prepend
            //1 : append
            value:1
        },
        html: {
            // 内容, 默认为 undefined, 不设置
            value: false
        }
    };

    Box.HTML_PARSER = {
        el:function(srcNode) {
            return srcNode;
        }
    };

    Box.prototype = {
        __syncUI:function() {
            //S.log("_syncUIBoxExt");
        },
        __bindUI:function() {
            //S.log("_bindUIBoxExt");
        },
        __renderUI:function() {
            //S.log("_renderUIBoxExt");
            var self = this,
                render = self.get("render"),
                el = self.get("el");
            render = new Node(render);
            if (!el) {
                el = new Node("<" + self.get("elTagName") + ">");
                if (self.get("elOrder")) {
                    render.append(el);
                } else {
                    render.prepend(el);
                }
                self.set("el", el);
            }
        },
        _uiSetElAttrs:function(attrs) {
            //S.log("_uiSetElAttrs");
            if (attrs) {
                this.get("el").attr(attrs);
            }
        },
        _uiSetElCls:function(cls) {
            if (cls) {
                this.get("el").addClass(cls);
            }
        },

        _uiSetElStyle:function(style) {
            //S.log("_uiSetElStyle");
            if (style) {
                this.get("el").css(style);
            }
        },

        _uiSetWidth:function(w) {
            //S.log("_uiSetWidth");
            var self = this;
            if (w) {
                self.get("el").width(w);
            }
        },

        _uiSetHeight:function(h) {
            //S.log("_uiSetHeight");
            var self = this;
            if (h) {
                self.get("el").height(h);
            }
        },

        _uiSetHtml:function(c) {
            //S.log("_uiSetHtml");
            if (c !== false) {
                this.get("el").html(c);
            }

        },

        __destructor:function() {
            //S.log("box __destructor");
            var el = this.get("el");
            if (el) {
                el.detach();
                el.remove();
            }
        }
    };

    S.UIBase.Box = Box;
},{
    host:"uibase"
});
/**
 * close extension for kissy dialog
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase-close", function(S) {
    S.namespace("UIBase");
    var CLS_PREFIX = 'ks-ext-',Node = S.Node;

    function Close() {
        //S.log("close init");
    }

    Close.ATTRS = {
        closable: {             // 是否需要关闭按钮
            value: true
        },
        closeBtn:{}
    };

    Close.HTML_PARSER = {
        closeBtn:"." + CLS_PREFIX + 'close'
    };

    Close.prototype = {
        __syncUI:function() {
            //S.log("_syncUICloseExt");
        },
        _uiSetClosable:function(v) {
            //S.log("_uiSetClosable");
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
        __renderUI:function() {
            //S.log("_renderUICloseExt");
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
        __bindUI:function() {
            //S.log("_bindUICloseExt");
            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn && closeBtn.on("click", function(ev) {
                self.hide();
                ev.halt();
            });
        },

        __destructor:function() {
            //S.log("close-ext __destructor");
            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn && closeBtn.detach();
        }
    };
    S.UIBase.Close = Close;

},{
    host:"uibase"
});/**
 * constrain extension for kissy
 * @author: 承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add("uibase-constrain", function(S) {
    S.namespace("UIBase");

    var DOM = S.DOM;

    function Constrain() {
        //S.log("constrain init");
    }

    Constrain.ATTRS = {
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
        var ret;
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
            //不要使用 viewportWidth()
            //The innerWidth attribute, on getting,
            //must return the viewport width including the size of a rendered scroll bar (if any).
            //On getting, the clientWidth attribute returns the viewport width
            //excluding the size of a rendered scroll bar (if any)
            //  if the element is the root element 
            var vWidth = document.documentElement.clientWidth;
            ret = { left: DOM.scrollLeft(), top: DOM.scrollTop() };
            S.mix(ret, {
                maxLeft: ret.left + vWidth - el[0].offsetWidth,
                maxTop: ret.top + DOM.viewportHeight() - el[0].offsetHeight
            });
        }

        return ret;
    }

    Constrain.prototype = {
        __bindUI:function() {
            //S.log("_bindUIConstrain");

        },
        __renderUI:function() {
            //S.log("_renderUIConstrain");
            var self = this,
                attrs = self.__getDefAttrs(),
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

        __syncUI:function() {
            //S.log("_syncUIConstrain");
        },
        __destructor:function() {
            //S.log("constrain-ext __destructor");
        }

    };


    S.UIBase.Constrain = Constrain;

},{
    host:"uibase"
});/**
 * 里层包裹层定义，适合mask以及shim
 * @author:yiminghe@gmail.com
 */
KISSY.add("uibase-contentbox", function(S) {

    S.namespace("UIBase");
    var Node = S.Node;

    function ContentBox() {
        //S.log("contentbox init");
    }

    ContentBox.ATTRS = {
        //内容容器节点
        contentEl:{},
        contentElAttrs:{},
        contentTagName:{value:"div"},
        //层内容
        content:{}
    };


    ContentBox.HTML_PARSER = {
        contentEl:".ks-contentbox"
    };

    ContentBox.prototype = {
        __syncUI:function() {
            //S.log("_syncUIContentBox");
        },
        __bindUI:function() {
            //S.log("_bindUIContentBox");
        },
        __renderUI:function() {
            //S.log("_renderUIContentBox");
            var self = this,
                contentEl = self.get("contentEl"),
                el = self.get("el");
            if (!contentEl) {
                var elChildren = S.makeArray(el[0].childNodes);
                contentEl = new Node("<" +
                    self.get("contentTagName") +
                    " class='ks-contentbox'>").appendTo(el);
                for (var i = 0; i < elChildren.length; i++) {
                    contentEl.append(elChildren[i]);
                }
                self.set("contentEl", contentEl);
            }
        },
        _uiSetContentElAttrs:function(attrs) {
            //S.log("_uiSetContentElAttrs");
            if (attrs) {
                this.get("contentEl").attr(attrs);
            }
        },
        _uiSetContent:function(c) {
            //S.log("_uiSetContent");
            if (c !== undefined) {
                if (S.isString(c)) {
                    this.get("contentEl").html(c);
                } else {
                    this.get("contentEl").html("");
                    this.get("contentEl").append(c);
                }
            }
        },

        __destructor:function() {
            //S.log("contentbox __destructor");
        }
    };

    S.UIBase.ContentBox = ContentBox;
}, {
    host:"uibase"
});/**
 * drag extension for position
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase-drag", function(S) {
    S.namespace('UIBase');
    function Drag() {
        //S.log("drag init");
    }

    Drag.ATTRS = {
        handlers:{value:[]},
        draggable:{value:true}
    };

    Drag.prototype = {

        _uiSetHandlers:function(v) {
            //S.log("_uiSetHanlders");
            if (v && v.length > 0 && this.__drag)
                this.__drag.set("handlers", v);
        },

        __syncUI:function() {
            //S.log("_syncUIDragExt");
        },

        __renderUI:function() {
            //S.log("_renderUIDragExt");
        },

        __bindUI:function() {
            //S.log("_bindUIDragExt");
            var self = this,
                el = self.get("el");
            if (self.get("draggable")&&S.Draggable    )
                self.__drag = new S.Draggable({
                    node:el,
                    handlers:self.get("handlers")
                });
        },

        _uiSetDraggable:function(v) {
            //S.log("_uiSetDraggable");
            var self = this,
                d = self.__drag;
            if (!d) return;
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
            //S.log("DragExt __destructor");
            var d = this.__drag;
            d && d.destroy();
        }

    };

    S.UIBase.Drag = Drag;

},{
    host:"uibase"
});/**
 * loading mask support for overlay
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase-loading", function(S) {
    S.namespace("UIBase");
    function Loading() {
        //S.log("LoadingExt init");
    }

    Loading.prototype = {
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
                    "*height: expression(this.parentNode.offsetHeight);" + "'>")
                    .appendTo(self.get("el"));
            }
            self._loadingExtEl.show();
        },

        unloading:function() {
            var lel = this._loadingExtEl;
            lel && lel.hide();
        }
    };

    S.UIBase.Loading = Loading;

},{
    host:"uibase"
});/**
 * mask extension for kissy
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase-mask", function(S) {
    S.namespace("UIBase");
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
            width:UA.ie==6 ? S.DOM.docWidth() : "100%",
            "height": S.DOM.docHeight()
        });
        if (UA.ie == 6) {
            mask.append("<" + "iframe style='width:100%;" +
                "height:expression(this.parentNode.offsetHeight);" +
                "filter:alpha(opacity=0);" +
                "z-index:-1;'>");
        }
    }

    function Mask() {
        //S.log("mask init");
    }

    Mask.ATTRS = {
        mask:{
            value:false
        }
    };

    Mask.prototype = {
        __bindUI:function() {
            //S.log("_bindUIMask");
        },

        __renderUI:function() {
            //S.log("_renderUIMask");
        },

        __syncUI:function() {
            //S.log("_syncUIMask");
        },
        _uiSetMask:function(v) {
            //S.log("_uiSetMask");
            var self = this;
            if (v) {
                self.on("show", self._maskExtShow);
                self.on("hide", self._maskExtHide);
            } else {
                self.detach("show", self._maskExtShow);
                self.detach("hide", self._maskExtHide);
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
            //S.log("mask __destructor");
        }

    };

    S.UIBase.Mask = Mask;
},{
    host:"uibase"
});/**
 * position and visible extension，可定位的隐藏层
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase-position", function(S) {
    S.namespace("UIBase");

    var doc = document ,
        Event = S.Event,
        KEYDOWN = "keydown";

    function Position() {
        //S.log("position init");
    }

    Position.ATTRS = {
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


    Position.prototype = {
        __syncUI:function() {
            //S.log("_syncUIPosition");
        },
        __renderUI:function() {
            //S.log("_renderUIPosition");
            var el=this.get("el");
            el.addClass("ks-ext-position");
            el.css("display", "");
        },
        __bindUI:function() {
            //S.log("_bindUIPosition");
        },
        _uiSetZIndex:function(x) {
            //S.log("_uiSetZIndex");
            if (x !== undefined)
                this.get("el").css("z-index", x);
        },
        _uiSetX:function(x) {
            //S.log("_uiSetX");
            if (x !== undefined)
                this.get("el").offset({
                    left:x
                });
        },
        _uiSetY:function(y) {
            //S.log("_uiSetY");
            if (y !== undefined)
                this.get("el").offset({
                    top:y
                });
        },
        _uiSetVisible:function(isVisible) {
            if (isVisible === undefined) return;
            //S.log("_uiSetVisible");
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
            self.render();
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
            //S.log("position __destructor");
        }

    };

    S.UIBase.Position = Position;
},{
    host:"uibase"
});/**
 * shim for ie6 ,require box-ext
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase-shim", function(S) {
    S.namespace("UIBase");
    function Shim() {
        //S.log("shim init");
    }

    var Node = S.Node;
    Shim.ATTRS = {
        shim:{
            value:true
        }
    };
    Shim.prototype = {
        __syncUI:function() {
            //S.log("_syncUIShimExt");
        },
        __bindUI:function() {
            //S.log("_bindUIShimExt");
        },
        _uiSetShim:function(v) {
            var self = this,el = self.get("el");
            if (v && !self.__shimEl) {
                self.__shimEl = new Node("<" + "iframe style='position: absolute;" +
                    "border: none;" +
                    "width: expression(this.parentNode.offsetWidth);" +
                    "top: 0;" +
                    "opacity: 0;" +
                    "filter: alpha(opacity=0);" +
                    "left: 0;" +
                    "z-index: -1;" +
                    "height: expression(this.parentNode.offsetHeight);" + "'>");
                el.prepend(self.__shimEl);
            } else if (!v && self.__shimEl) {
                self.__shimEl.remove();
                delete self.__shimEl;
            }
        },
        __renderUI:function() {
            //S.log("_renderUIShimExt");

        },

        __destructor:function() {
            //S.log("shim __destructor");
        }
    };
    S.UIBase.Shim = Shim;
},{
    host:"uibase"
});/**
 * support standard mod for component
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase-stdmod", function(S) {

    S.namespace("UIBase");
    var CLS_PREFIX = "ks-stdmod-",
        Node = S.Node;

    function StdMod() {
        //S.log("stdmod init");
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

    function renderUI(self, part) {
        var el = self.get("contentEl"),
            partEl = self.get(part);

        if (!partEl) {
            partEl = new Node("<div class='" + CLS_PREFIX + part + "'>")
                .appendTo(el);
            self.set(part, partEl);
        }
    }

    StdMod.prototype = {
        __bindUI:function() {
            //S.log("_bindUIStdMod");
        },
        __syncUI:function() {
            //S.log("_syncUIStdMod");
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
            //S.log("_uiSetBodyContent");
            this._setStdModContent("body", v);
        },
        _uiSetHeaderContent:function(v) {
            //S.log("_uiSetHeaderContent");
            this._setStdModContent("header", v);
        },
        _uiSetFooterContent:function(v) {
            //S.log("_uiSetFooterContent");
            this._setStdModContent("footer", v);
        },
        __renderUI:function() {
            //S.log("_renderUIStdMod");
            renderUI(this, "header");
            renderUI(this, "body");
            renderUI(this, "footer");
        },

        __destructor:function() {
            //S.log("stdmod __destructor");
        }
    };


    S.UIBase.StdMod = StdMod;

},{
    host:"uibase"
});