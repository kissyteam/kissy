/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 20 18:33
*/
/**
 * @fileOverview UIBase.Align
 * @author yiminghe@gmail.com , qiaohua@taobao.com
 */
KISSY.add('uibase/align', function (S, UA, DOM, Node) {

    /*
     inspired by closure library by Google
     see http://yiminghe.iteye.com/blog/1124720
     */

    /**
     * 得到影响元素显示的父亲元素
     */
    function getOffsetParent(element) {
        // ie 这个也不是完全可行
        /**
         <div style="width: 50px;height: 100px;overflow: hidden">
         <div style="width: 50px;height: 100px;position: relative;" id="d6">
         元素 6 高 100px 宽 50px<br/>
         </div>
         </div>
         **/
//            if (UA['ie']) {
//                return element.offsetParent;
//            }
        var body = element.ownerDocument.body,
            positionStyle = DOM.css(element, 'position'),
            skipStatic = positionStyle == 'fixed' || positionStyle == 'absolute';

        for (var parent = element.parentNode;
             parent && parent != body;
             parent = parent.parentNode) {

            positionStyle = DOM.css(parent, 'position');

            skipStatic = skipStatic && positionStyle == 'static';

            var parentOverflow = DOM.css(parent, "overflow");

            // 必须有 overflow 属性，可能会隐藏掉子孙元素
            if (parentOverflow != 'visible' && (
                // 元素初始为 fixed absolute ，遇到 父亲不是 定位元素忽略
                // 否则就可以
                !skipStatic ||
                    positionStyle == 'fixed' ||
                    positionStyle == 'absolute' ||
                    positionStyle == 'relative'
                )) {
                return parent;
            }
        }
        return null;
    }

    /**
     * 获得元素的显示部分的区域
     */
    function getVisibleRectForElement(element) {
        var visibleRect = {
            left:0,
            right:Infinity,
            top:0,
            bottom:Infinity
        };

        for (var el = element; el = getOffsetParent(el);) {

            var clientWidth = el.clientWidth;

            if (
            // clientWidth is zero for inline block elements in IE.
                (!UA['ie'] || clientWidth !== 0)
            // on WEBKIT, body element can have clientHeight = 0 and scrollHeight > 0
            // && (!UA['webkit'] || clientHeight != 0 || el != body)
            // overflow 不为 visible 则可以限定其内元素
            // && (scrollWidth != clientWidth || scrollHeight != clientHeight)
            // offsetParent 已经判断过了
            // && DOM.css(el, 'overflow') != 'visible'
                ) {
                var clientLeft = el.clientLeft,
                    clientTop = el.clientTop,
                    pos = DOM.offset(el),
                    client = {
                        left:clientLeft,
                        top:clientTop
                    };
                pos.left += client.left;
                pos.top += client.top;

                visibleRect.top = Math.max(visibleRect['top'], pos.top);
                visibleRect.right = Math.min(visibleRect.right,
                    pos.left + el.clientWidth);
                visibleRect.bottom = Math.min(visibleRect['bottom'],
                    pos.top + el.clientHeight);
                visibleRect.left = Math.max(visibleRect.left, pos.left);
            }
        }

        var scrollX = DOM.scrollLeft(),
            scrollY = DOM.scrollTop();

        visibleRect.left = Math.max(visibleRect.left, scrollX);
        visibleRect.top = Math.max(visibleRect['top'], scrollY);
        visibleRect.right = Math.min(visibleRect.right, scrollX + DOM.viewportWidth());
        visibleRect.bottom = Math.min(visibleRect['bottom'], scrollY + DOM.viewportHeight());

        return visibleRect.top >= 0 && visibleRect.left >= 0 &&
            visibleRect.bottom > visibleRect.top &&
            visibleRect.right > visibleRect.left ?
            visibleRect : null;
    }

    function isFailed(status) {
        for (var s in status) {
            if (s.indexOf("fail") === 0) {
                return true;
            }
        }
        return false;
    }

    function positionAtAnchor(alignCfg) {
        var offset = alignCfg.offset,
            node = alignCfg.node,
            points = alignCfg.points,
            self = this,
            xy,
            diff,
            p1,
            //如果没有view，就是不区分mvc
            el = self.get('el'),
            p2;

        offset = offset || [0, 0];
        xy = el.offset();

        // p1 是 node 上 points[0] 的 offset
        // p2 是 overlay 上 points[1] 的 offset
        p1 = getAlignOffset(node, points[0]);
        p2 = getAlignOffset(el, points[1]);

        diff = [p2.left - p1.left, p2.top - p1.top];
        xy = {
            left:xy.left - diff[0] + (+offset[0]),
            top:xy.top - diff[1] + (+offset[1])
        };

        return positionAtCoordinate.call(self, xy, alignCfg);
    }


    function positionAtCoordinate(absolutePos, alignCfg) {
        var self = this, el = self.get('el');
        var status = {};
        var elSize = {width:el.outerWidth(), height:el.outerHeight()},
            size = S.clone(elSize);
        if (!S.isEmptyObject(alignCfg.overflow)) {
            var viewport = getVisibleRectForElement(el[0]);
            status = adjustForViewport(absolutePos, size, viewport, alignCfg.overflow || {});
            if (isFailed(status)) {
                return status;
            }
        }

        self.set("x", absolutePos.left);
        self.set("y", absolutePos.top);

        if (size.width != elSize.width || size.height != elSize.height) {
            el.width(size.width);
            el.height(size.height);
        }

        return status;

    }


    function adjustForViewport(pos, size, viewport, overflow) {
        var status = {};
        if (pos.left < viewport.left && overflow.adjustX) {
            pos.left = viewport.left;
            status.adjustX = 1;
        }
        // Left edge inside and right edge outside viewport, try to resize it.
        if (pos.left < viewport.left &&
            pos.left + size.width > viewport.right &&
            overflow.resizeWidth) {
            size.width -= (pos.left + size.width) - viewport.right;
            status.resizeWidth = 1;
        }

        // Right edge outside viewport, try to move it.
        if (pos.left + size.width > viewport.right &&
            overflow.adjustX) {
            pos.left = Math.max(viewport.right - size.width, viewport.left);
            status.adjustX = 1;
        }

        // Left or right edge still outside viewport, fail if the FAIL_X option was
        // specified, ignore it otherwise.
        if (overflow.failX) {
            status.failX = pos.left < viewport.left ||
                pos.left + size.width > viewport.right;
        }

        // Top edge outside viewport, try to move it.
        if (pos.top < viewport.top && overflow.adjustY) {
            pos.top = viewport.top;
            status.adjustY = 1;
        }

        // Top edge inside and bottom edge outside viewport, try to resize it.
        if (pos.top >= viewport.top &&
            pos.top + size.height > viewport.bottom &&
            overflow.resizeHeight) {
            size.height -= (pos.top + size.height) - viewport.bottom;
            status.resizeHeight = 1;
        }

        // Bottom edge outside viewport, try to move it.
        if (pos.top + size.height > viewport.bottom &&
            overflow.adjustY) {
            pos.top = Math.max(viewport.bottom - size.height, viewport.top);
            status.adjustY = 1;
        }

        // Top or bottom edge still outside viewport, fail if the FAIL_Y option was
        // specified, ignore it otherwise.
        if (overflow.failY) {
            status.failY = pos.top < viewport.top ||
                pos.top + size.height > viewport.bottom;
        }

        return status;
    }


    function flip(points, reg, map) {
        var ret = [];
        S.each(points, function (p) {
            ret.push(p.replace(reg, function (m) {
                return map[m];
            }));
        });
        return ret;
    }

    function flipOffset(offset, index) {
        offset[index] = -offset[index];
        return offset;
    }


    /**
     * align component with specified element
     * @class
     * @memberOf UIBase
     */
    function Align() {
    }

    Align.ATTRS =
    /**
     * @lends UIBase.Align.prototype
     */
    {

        /**
         * 对齐配置
         * @type Object
         * @field
         * @example
         * <code>
         *     {
         *        node: null,         // 参考元素, falsy 或 window 为可视区域, 'trigger' 为触发元素, 其他为指定元素
         *        points: ['cc','cc'], // ['tr', 'tl'] 表示 overlay 的 tl 与参考节点的 tr 对齐
         *        offset: [0, 0]      // 有效值为 [n, m]
         *     }
         * </code>
         */
        align:{
            setter:function (v) {
                var n;
                if (n = v.node) {
                    v.node = Node.one(n);
                }
            }
        }
    };

    /**
     * 获取 node 上的 align 对齐点 相对于页面的坐标
     * @param node
     * @param align
     */
    function getAlignOffset(node, align) {
        var V = align.charAt(0),
            H = align.charAt(1),
            offset, w, h, x, y;

        if (node && !S.isWindow(node)) {
            offset = node.offset();
            w = node.outerWidth();
            h = node.outerHeight();
        } else {
            offset = { left:DOM.scrollLeft(), top:DOM.scrollTop() };
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

        return { left:x, top:y };
    }

    Align.prototype =
    /**
     * @lends UIBase.Align.prototype
     */
    {
        _uiSetAlign:function (v) {
            if (v) {
                this.align(v.node, v.points, v.offset, v.overflow);
            }
        },

        /*
         对齐 Overlay 到 node 的 points 点, 偏移 offset 处
         @function
         @ignore
         @param {Element} node 参照元素, 可取配置选项中的设置, 也可是一元素
         @param {String[]} points 对齐方式
         @param {Number[]} [offset] 偏移
         */
        align:function (node, points, offset, overflow) {
            var self = this,
                flag = {};
            if (node) {
                node = Node.one(node);
            }
            // 后面会改的，先保存下
            overflow = S.clone(overflow || {});
            offset = offset && [].concat(offset) || [0, 0];
            if (overflow.failX) {
                flag.failX = 1;
            }
            if (overflow.failY) {
                flag.failY = 1;
            }
            var status = positionAtAnchor.call(self, {
                node:node,
                points:points,
                offset:offset,
                overflow:flag
            });
            // 如果错误调整重试
            if (isFailed(status)) {
                if (status.failX) {
                    points = flip(points, /[lr]/ig, {
                        l:"r",
                        r:"l"
                    });
                    offset = flipOffset(offset, 0);
                }

                if (status.failY) {
                    points = flip(points, /[tb]/ig, {
                        t:"b",
                        b:"t"
                    });
                    offset = flipOffset(offset, 1);
                }
            }

            status = positionAtAnchor.call(self, {
                node:node,
                points:points,
                offset:offset,
                overflow:flag
            });

            if (isFailed(status)) {
                delete overflow.failX;
                delete overflow.failY;
                positionAtAnchor.call(self, {
                    node:node,
                    points:points,
                    offset:offset,
                    overflow:overflow
                });
            }
        },

        /**
         * 居中显示到可视区域, 一次性居中
         * @param {undefined|String|HTMLElement|Node} node 对其元素，falsy 表示窗口可视区域
         */
        center:function (node) {
            this.set('align', {
                node:node,
                points:["cc", "cc"],
                offset:[0, 0]
            });
        }
    };

    return Align;
}, {
    requires:["ua", "dom", "node"]
});
/**
 *  2011-07-13 承玉 note:
 *   - 增加智能对齐，以及大小调整选项
 **//**
 * @fileOverview   UIBase
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 * @see http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add('uibase/base', function (S, Base, Node) {

    var UI_SET = '_uiSet',
        SRC_NODE = 'srcNode',
        ATTRS = 'ATTRS',
        HTML_PARSER = 'HTML_PARSER',
        noop = S.noop;

    function capitalFirst(s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    /**
     * UIBase for class-based component
     * @class
     * @namespace
     * @name UIBase
     * @extends Base
     */
    function UIBase(config) {
        // 读取用户设置的属性值并设置到自身
        Base.apply(this, arguments);
        // 根据 srcNode 设置属性值
        // 按照类层次执行初始函数，主类执行 initializer 函数，扩展类执行构造器函数
        initHierarchy(this, config);
        // 是否自动渲染
        config && config.autoRender && this.render();

        /**
         * @name UIBase#afterRenderUI
         * @description fired when root node is ready
         * @event
         * @param e
         */
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
                if ((config[SRC_NODE] = Node.one(config[SRC_NODE]))) {
                    applyParser.call(host, config[SRC_NODE], c.HTML_PARSER);
                }
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
            if (exts = c.__ks_exts) {
                for (var i = 0; i < exts.length; i++) {
                    ext = exts[i];
                    if (ext) {
                        if (extMethod != "constructor") {
                            //只调用真正自己构造器原型的定义，继承原型链上的不要管
                            if (ext.prototype.hasOwnProperty(extMethod)) {
                                ext = ext.prototype[extMethod];
                            } else {
                                ext = null;
                            }
                        }
                        ext && t.push(ext);
                    }
                }
            }

            // 收集主类
            // 只调用真正自己构造器原型的定义，继承原型链上的不要管 !important
            // 所以不用自己在 renderUI 中调用 superclass.renderUI 了，UIBase 构造器自动搜寻
            // 以及 initializer 等同理
            if (c.prototype.hasOwnProperty(mainMethod) && (main = c.prototype[mainMethod])) {
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
     * 顺序： 子类 destructor -> 子类扩展 destructor -> 父类 destructor -> 父类扩展 destructor
     */
    function destroyHierarchy(host) {
        var c = host.constructor,
            exts,
            d,
            i;

        while (c) {
            // 只触发该类真正的析构器，和父亲没关系，所以不要在子类析构器中调用 superclass
            if (c.prototype.hasOwnProperty("destructor")) {
                c.prototype.destructor.apply(host);
            }

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
        // 是否已经渲染完毕
        rendered:{
            value:false
        },
        // dom 节点是否已经创建完毕
        created:{
            value:false
        }
    };

    S.extend(UIBase, Base,
        /**
         * @lends UIBase.prototype
         */
        {

            /**
             * 建立节点，先不放在 dom 树中，为了性能!
             */
            create:function () {
                var self = this;
                // 是否生成过节点
                if (!self.get("created")) {
                    self._createDom();
                    self.fire('createDom');
                    callMethodByHierarchy(self, "createDom", "__createDom");
                    self.fire('afterCreateDom');
                    self.__set("created", true);
                }
            },

            /**
             * 渲染组件到 dom 结构
             */
            render:function () {
                var self = this;
                // 是否已经渲染过
                if (!self.get("rendered")) {
                    self.create();
                    self._renderUI();
                    // 实际上是 beforeRenderUI
                    self.fire('renderUI');
                    callMethodByHierarchy(self, "renderUI", "__renderUI");
                    self.fire('afterRenderUI');
                    self._bindUI();
                    // 实际上是 beforeBindUI
                    self.fire('bindUI');
                    callMethodByHierarchy(self, "bindUI", "__bindUI");
                    self.fire('afterBindUI');
                    self._syncUI();
                    // 实际上是 beforeSyncUI
                    self.fire('syncUI');
                    callMethodByHierarchy(self, "syncUI", "__syncUI");
                    self.fire('afterSyncUI');
                    self.__set("rendered", true);
                }
                return self;
            },

            /**
             * 创建 dom 节点，但不放在 document 中
             */
            _createDom:noop,

            /**
             * 节点已经创建完毕，可以放在 document 中了
             */
            _renderUI:noop,

            /**
             * @protected
             * @function
             */
            renderUI:noop,

            /**
             * 根据属性变化设置 UI
             */
            _bindUI:function () {
                var self = this,
                    attrs = self['__attrs'],
                    attr, m;

                for (attr in attrs) {
                    if (attrs.hasOwnProperty(attr)) {
                        m = UI_SET + capitalFirst(attr);
                        if (self[m]) {
                            // 自动绑定事件到对应函数
                            (function (attr, m) {
                                self.on('after' + capitalFirst(attr) + 'Change', function (ev) {
                                    self[m](ev.newVal, ev);
                                });
                            })(attr, m);
                        }
                    }
                }
            },

            /**
             * @protected
             * @function
             */
            bindUI:noop,

            /**
             * 根据当前（初始化）状态来设置 UI
             */
            _syncUI:function () {
                var self = this,
                    attrs = self['__attrs'];
                for (var a in attrs) {
                    if (attrs.hasOwnProperty(a)) {
                        var m = UI_SET + capitalFirst(a);
                        //存在方法，并且用户设置了初始值或者存在默认值，就同步状态
                        if (self[m]
                            // 用户如果设置了显式不同步，就不同步，比如一些值从 html 中读取，不需要同步再次设置
                            && attrs[a].sync !== false
                            && self.get(a) !== undefined) {
                            self[m](self.get(a));
                        }
                    }
                }
            },

            /**
             * protected
             * @function
             */
            syncUI:noop,


            /**
             * 销毁组件
             */
            destroy:function () {
                var self = this;
                destroyHierarchy(self);
                self.fire('destroy');
                self.detach();
            }
        },
        /**
         * @lends UIBase
         */
        {
            /**
             * 根据基类以及扩展类得到新类
             * @param {Function|Function[]} base 基类
             * @param {Function[]} exts 扩展类
             * @param {Object} px 原型 mix 对象
             * @param {Object} sx 静态 mix 对象
             * @returns {UIBase} 组合 后 的 新类
             */
            create:function (base, exts, px, sx) {
                if (S.isArray(base)) {
                    sx = px;
                    px = exts;
                    exts = /*@type Function[]*/base;
                    base = UIBase;
                }
                base = base || UIBase;
                if (S.isObject(exts)) {
                    sx = px;
                    px = exts;
                    exts = [];
                }

                function C() {
                    UIBase.apply(this, arguments);
                }

                S.extend(C, base, px, sx);

                if (exts) {

                    C.__ks_exts = exts;

                    var desc = {
                        // ATTRS:
                        // HMTL_PARSER:
                    }, constructors = exts.concat(C);

                    // [ex1,ex2],扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
                    // 主类最优先
                    S.each(constructors, function (ext) {
                        if (ext) {
                            // 合并 ATTRS/HTML_PARSER 到主类
                            S.each([ATTRS, HTML_PARSER], function (K) {
                                if (ext[K]) {
                                    desc[K] = desc[K] || {};
                                    // 不覆盖主类上的定义，因为继承层次上扩展类比主类层次高
                                    // 但是值是对象的话会深度合并
                                    // 注意：最好值是简单对象，自定义 new 出来的对象就会有问题!
                                    S.mix(desc[K], ext[K], true, undefined, true);
                                }
                            });
                        }
                    });

                    S.each(desc, function (v, k) {
                        C[k] = v;
                    });

                    var prototype = {};

                    // 主类最优先
                    S.each(constructors, function (ext) {
                        if (ext) {
                            var proto = ext.prototype;
                            // 合并功能代码到主类，不覆盖
                            for (var p in proto) {
                                // 不覆盖主类，但是主类的父类还是覆盖吧
                                if (proto.hasOwnProperty(p)) {
                                    prototype[p] = proto[p];
                                }
                            }
                        }
                    });

                    S.each(prototype, function (v, k) {
                        C.prototype[k] = v;
                    });
                }
                return C;
            }
        });

    return UIBase;
}, {
    requires:["base", "node"]
});
/**
 * render 和 create 区别
 * render 包括 create ，以及把生成的节点放在 document 中
 * create 仅仅包括创建节点
 **//**
 * @fileOverview UIBase.Box
 * @author yiminghe@gmail.com
 */
KISSY.add('uibase/box', function (S) {

    /**
     * Box Implementation
     * @class
     * @memberOf UIBase
     * @namespace
     */
    function Box() {
    }

    Box.ATTRS =
    /**
     * @lends UIBase.Box.prototype
     */
    {
        /**
         * component's html content
         * @type String
         */
        html:{
            view:true
        },
        /**
         * component's width
         * @type Number|String
         */
        width:{
            // 没有 _uiSetWidth，所以不需要设置 sync:false
            view:true
        },
        /**
         * component's height
         * @type Number|String
         */
        height:{
            view:true
        },
        /**
         * css class of component's root element
         * @type String
         */
        elCls:{
            view:true
        },
        /**
         * name-value pair css style of component's root element
         * @type Object
         */
        elStyle:{
            view:true
        },
        /**
         * name-value pair attribute of component's root element
         * @type Object
         */
        elAttrs:{
            view:true
        },
        /**
         * archor element where component insert before
         * @type NodeList
         */
        elBefore:{
            view:true
        },
        /**
         * readonly. root element of current component
         * @type NodeList
         */
        el:{
            view:true
        },

        /**
         * archor element where component append to
         * @type NodeList
         */
        render:{
            view:true
        },

        /**
         * component's visibleMode,use css "display" or "visibility" to show this component
         * @type String
         */
        visibleMode:{
            value:"display",
            view:true
        },

        /**
         * whether this component is visible
         * @type Boolean
         */
        visible:{
            view:true
        },

        /**
         * the node to parse for configuration values,passed to component's HTML_PARSER definition
         * @type NodeList
         */
        srcNode:{
            view:true
        }
    };


    Box.HTML_PARSER =
    /**
     * @private
     */
    {
        el:function (srcNode) {
            /**
             * 如果需要特殊的对现有元素的装饰行为
             */
            var self = this;
            if (self.decorateInternal) {
                self.decorateInternal(S.one(srcNode));
            }
            return srcNode;
        }
    };

    Box.prototype =
    /**
     * @lends UIBase.Box#
     */
    {
        /**
         * @private
         */
        _uiSetVisible:function (isVisible) {
            this.fire(isVisible ? "show" : "hide");
        },

        /**
         * show component
         */
        show:function () {
            var self = this;
            if (!self.get("rendered")) {
                // 防止初始设置 false，导致触发 hide 事件
                // show 里面的初始一定是 true，触发 show 事件
                self.__set("visible", true);
                self.render();
            } else {
                self.set("visible", true);
            }
        },

        /**
         * hide component
         */
        hide:function () {
            this.set("visible", false);
        }
    };

    return Box;
});
/**
 * @fileOverview UIBase.Box
 * @author yiminghe@gmail.com
 */
KISSY.add('uibase/boxrender', function (S, Node) {

    var $ = S.all, doc = S.Env.host.document;


    function BoxRender() {
    }

    BoxRender.ATTRS = {
        el:{
            //容器元素
            setter:function (v) {
                return $(v);
            }
        },
        // 构建时批量生成，不需要执行单个
        elCls:{
            sync:false
        },
        elStyle:{
            sync:false
        },
        width:{
            sync:false
        },
        height:{
            sync:false
        },
        elTagName:{
            sync:false,
            // 生成标签名字
            value:"div"
        },
        elAttrs:{
            sync:false
        },

        html:{
            // !! srcNode 和 html 不能同时设置
            sync:false
        },
        elBefore:{
        },
        render:{},
        visible:{
        },
        visibleMode:{

        }
    };

    BoxRender.construct = constructEl;

    function constructEl(cls, style, width, height, tag, attrs, html) {
        style = style || {};
        html = html || "";
        if (typeof html !== "string") {
            html = "";
        }

        if (width) {
            style.width = typeof width == "number" ? (width + "px") : width;
        }

        if (height) {
            style.height = typeof height == "number" ? (height + "px") : height;
        }

        var styleStr = '';

        for (var s in style) {
            if (style.hasOwnProperty(s)) {
                styleStr += s + ":" + style[s] + ";";
            }
        }

        var attrStr = '';

        for (var a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                attrStr += " " + a + "='" + attrs[a] + "'" + " ";
            }
        }

        return "<" + tag + (styleStr ? (" style='" + styleStr + "' ") : "")
            + attrStr + (cls ? (" class='" + cls + "' ") : "")
            + ">" + html + "<" + "/" + tag + ">";
        //return ret;
    }

    BoxRender.HTML_PARSER =
    /**
     * @ignore
     */
    {
        html:function (el) {
            return el.html();
        }
    };

    BoxRender.prototype =
    /**
     * @lends UIBase.Box.Render#
     */
    {

        __renderUI:function () {
            var self = this;
            // 新建的节点才需要摆放定位
            if (self.__boxRenderNew) {
                var render = self.get("render"),
                    el = self.get("el"),
                    elBefore = self.get("elBefore");
                if (elBefore) {
                    el.insertBefore(elBefore);
                }
                else if (render) {
                    el.appendTo(render);
                }
                else {
                    el.appendTo(doc.body);
                }
            }
        },

        /**
         * 只负责建立节点，如果是 decorate 过来的，甚至内容会丢失
         * 通过 render 来重建原有的内容
         */
        __createDom:function () {
            var self = this,
                elCls = self.get("elCls"),
                elStyle = self.get("elStyle"),
                width = self.get("width"),
                height = self.get("height"),
                html = self.get("html"),
                elAttrs = self.get("elAttrs"),
                el = self.get("el");
            if (!el) {
                self.__boxRenderNew = true;
                el = new Node(constructEl(elCls,
                    elStyle,
                    width,
                    height,
                    self.get("elTagName"),
                    elAttrs,
                    html));
                self.__set("el", el);
            }
            // 通过 srcNode 过来的
            else {
                if (elCls) {
                    el.addClass(elCls);
                }
                if (elStyle) {
                    el.css(elStyle);
                }
                if (width !== undefined) {
                    el.width(width);
                }
                if (height !== undefined) {
                    el.height(height);
                }
                /*
                 srcNode 就是原来的内容，也可以不用设置 html
                 if (html !== undefined &&
                 // 防止冲掉 el 原来的子元素引用 !!
                 html !== el.html()) {
                 el.html(html);
                 }
                 */
                if (elAttrs) {
                    el.attr(elAttrs);
                }
            }
        },

        _uiSetElAttrs:function (attrs) {
            this.get("el").attr(attrs);
        },

        _uiSetElCls:function (cls) {
            this.get("el").addClass(cls);
        },

        _uiSetElStyle:function (style) {
            this.get("el").css(style);
        },

        _uiSetWidth:function (w) {
            this.get("el").width(w);
        },

        _uiSetHeight:function (h) {
            var self = this;
            self.get("el").height(h);
        },

        _uiSetHtml:function (c) {
            this.get("el").html(c);
        },

        _uiSetVisible:function (isVisible) {
            var el = this.get("el"),
                visibleMode = this.get("visibleMode");
            if (visibleMode == "visibility") {
                el.css("visibility", isVisible ? "visible" : "hidden");
            } else {
                el.css("display", isVisible ? "" : "none");
            }
        },

        __destructor:function () {
            //S.log("box __destructor");
            var el = this.get("el");
            if (el) {
                el.remove();
            }
        }
    };

    return BoxRender;
}, {
    requires:['node']
});
/**
 * @fileOverview close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/close", function () {

    /**
     * config detail of close action
     * @class
     * @memberOf UIBase
     */
    function Close() {
    }

    var HIDE = "hide";
    Close.ATTRS =
    /**
     * @lends UIBase.Close.prototype
     */
    {
        /**
         * 是否自带关闭按钮
         * @type boolean
         */
        closable:{
            view:true
        },

        /**
         * 点击关闭按钮的动作，销毁("destroy")或隐藏("hide")
         * @type string
         */
        closeAction:{
            value:HIDE
        }
    };

    var actions = {
        hide:HIDE,
        destroy:"destroy"
    };

    Close.prototype = {

        __bindUI:function () {

            var self = this,
                closeBtn = self.get("view").get("closeBtn");
            closeBtn && closeBtn.on("click", function (ev) {
                self[actions[self.get("closeAction")] || HIDE]();
                ev.preventDefault();
            });
        }
    };
    return Close;

});/**
 * @fileOverview close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/closerender", function (S, Node) {

    var CLS_PREFIX = 'ext-';

    function Close() {
    }

    Close.ATTRS = {
        closable:{             // 是否需要关闭按钮
            value:true,
            sync:false
        },
        closeBtn:{
        }
    };

    Close.HTML_PARSER = {
        closeBtn:function (el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + 'close');
        }
    };

    Close.prototype = {
        _uiSetClosable:function (v) {
            this.get("closeBtn")[v ? "show" : "hide"]();
        },
        __createDom:function () {
            var self = this,
                closeBtn = self.get("closeBtn"),
                closable = self.get("closable"),
                el = self.get("el");

            if (!closeBtn) {
                closeBtn = new Node("<a " +
                    "tabindex='0' " +
                    (closable ? "" : "style='display:none'") +
                    "href='javascript:void(\"关闭\")' " +
                    "role='button' " +
                    "class='" + this.get("prefixCls") + CLS_PREFIX + "close" + "'>" +
                    "<span class='" +
                    self.get("prefixCls") + CLS_PREFIX + "close-x" +
                    "'>关闭<" + "/span>" +
                    "<" + "/a>").appendTo(el);
                self.__set("closeBtn", closeBtn);
            } else {
                closeBtn[closable ? "show" : "hide"]();
            }
        },

        __destructor:function () {
            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn && closeBtn.detach();
        }
    };

    return Close;

}, {
    requires:["node"]
});/**
 * @fileOverview constrain extension for kissy
 * @author yiminghe@gmail.com, 乔花<qiaohua@taobao.com>
 */
KISSY.add("uibase/constrain", function (S, DOM, Node) {

    /**
     * constrain component to specified region
     * @class
     * @memberOf UIBase
     */
    function Constrain() {

    }

    Constrain.ATTRS =
    /**
     * @lends UIBase.Constrain.prototype
     */
    {
        /**
         * <br>true:viewport限制 <br> node:限制在该节点范围
         * @type HTMLElement|boolean
         */
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
        if (!constrain) {
            return ret;
        }
        var el = this.get("el");
        if (constrain !== true) {
            constrain = Node.one(constrain);
            ret = constrain.offset();
            S.mix(ret, {
                maxLeft:ret.left + constrain.outerWidth() - el.outerWidth(),
                maxTop:ret.top + constrain.outerHeight() - el.outerHeight()
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
            var vWidth = S.Env.host.document.documentElement.clientWidth;
            ret = { left:DOM.scrollLeft(), top:DOM.scrollTop() };
            S.mix(ret, {
                maxLeft:ret.left + vWidth - el.outerWidth(),
                maxTop:ret.top + DOM.viewportHeight() - el.outerHeight()
            });
        }

        return ret;
    }

    Constrain.prototype = {

        __renderUI:function () {
            var self = this,
                attrs = self.getAttrs(),
                xAttr = attrs["x"],
                yAttr = attrs["y"],
                oriXSetter = xAttr["setter"],
                oriYSetter = yAttr["setter"];
            xAttr.setter = function (v) {
                var r = oriXSetter && oriXSetter.call(self, v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) {
                    return r;
                }
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.left),
                    _ConstrainExtRegion.maxLeft);
            };
            yAttr.setter = function (v) {
                var r = oriYSetter && oriYSetter.call(self, v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) {
                    return r;
                }
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.top),
                    _ConstrainExtRegion.maxTop);
            };
            self.addAttr("x", xAttr);
            self.addAttr("y", yAttr);
        }
    };


    return Constrain;

}, {
    requires:["dom", "node"]
});/**
 * @fileOverview 里层包裹层定义，适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/contentbox", function () {

    /**
     * ContentBox Implementation
     * @class
     * @memberOf UIBase
     */
    function ContentBox() {
    }

    ContentBox.ATTRS =
    /**
     * @lends UIBase.ContentBox#
     */
    {
        /**
         * content of component's content box
         * @type NodeList|String
         */
        content:{
            view:true,
            sync:false
        },

        /**
         * readonly! content box's element of component
         * @type NodeList
         */
        contentEl:{
            view:true
        },

        /**
         * name-value pair attribute of component's content box element
         * @type Object
         */
        contentElAttrs:{
            view:true
        },

        /**
         * name-value pair css style of component's content box element
         * @type Object
         */
        contentElStyle:{
            view:true
        },

        contentTagName:{
            view:true
        }
    };

    return ContentBox;
});/**
 * @fileOverview 里层包裹层定义，适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/contentboxrender", function (S, Node, BoxRender) {


    function ContentBoxRender() {
    }

    ContentBoxRender.ATTRS = {
        contentEl:{},
        contentElAttrs:{},
        contentElCls:{},
        contentElStyle:{},
        contentTagName:{
            value:"div"
        },
        content:{
            sync:false
        }
    };

    /*
     ! contentEl 只能由组件动态生成
     */
    ContentBoxRender.HTML_PARSER = {
        content:function (el) {
            return el[0].innerHTML;
        }
    };

    var constructEl = BoxRender.construct;

    ContentBoxRender.prototype = {

        // no need ,shift create work to __createDom
        __renderUI:function () {
        },

        __createDom:function () {
            var self = this,
                contentEl,
                c = self.get("content"),
                el = self.get("el"),
                html = "",
                elChildren = S.makeArray(el[0].childNodes);

            if (elChildren.length) {
                html = el[0].innerHTML
            }

            // el html 和 c 相同，直接 append el的子节点
            if (c == html) {
                c = "";
            }

            contentEl = new Node(constructEl(
                self.get("prefixCls") + "contentbox "
                    + (self.get("contentElCls") || ""),
                self.get("contentElStyle"),
                undefined,
                undefined,
                self.get("contentTagName"),
                self.get("contentElAttrs"),
                c));

            contentEl.appendTo(el);

            self.__set("contentEl", contentEl);
            // on content,then read from box el
            if (!c) {
                for (var i = 0, l = elChildren.length; i < l; i++) {
                    contentEl.append(elChildren[i]);
                }
            } else if (typeof c !== 'string') {
                contentEl.append(c);
            }
        },

        _uiSetContentElCls:function (cls) {
            this.get("contentEl").addClass(cls);
        },

        _uiSetContentElAttrs:function (attrs) {
            this.get("contentEl").attr(attrs);
        },

        _uiSetContentElStyle:function (v) {
            this.get("contentEl").css(v);
        },

        _uiSetContent:function (c) {
            if (typeof c == "string") {
                this.get("contentEl").html(c);
            } else {
                this.get("contentEl").empty().append(c);
            }
        }
    };

    return ContentBoxRender;
}, {
    requires:["node", "./boxrender"]
});/**
 * @fileOverview drag extension for position
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/drag", function (S) {


    /**
     * config drag options
     * @class
     * @memberOf UIBase
     */
    function Drag() {
    }

    Drag.ATTRS =

    /**
     * @lends UIBase.Drag
     */
    {
        /**
         * see {@link DD.Draggable#handlers}
         */
        handlers:{
            value:[]
        },
        /**
         * 是否可拖放
         * @type boolean
         */
        draggable:{value:true}
    };

    Drag.prototype = {

        _uiSetHandlers:function (v) {
            if (v && v.length > 0 && this.__drag) {
                this.__drag.set("handlers", v);
            }
        },

        __bindUI:function () {
            var Draggable = S.require("dd/draggable");
            var self = this,
                el = self.get("el");
            if (self.get("draggable") && Draggable) {
                self.__drag = new Draggable({
                    node:el
                });
            }
        },

        _uiSetDraggable:function (v) {

            var self = this,
                d = self.__drag;
            if (!d) {
                return;
            }
            if (v) {
                d.detach("drag");
                d.on("drag", self._dragExtAction, self);
            } else {
                d.detach("drag");
            }
        },

        _dragExtAction:function (offset) {
            this.set("xy", [offset.left, offset.top])
        },
        /**
         *
         */
        __destructor:function () {
            //S.log("DragExt __destructor");
            var d = this.__drag;
            d && d.destroy();
        }

    };
    return Drag;

});/**
 * @fileOverview loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/loading", function () {

    /**
     * make component can mask loading
     * @class
     * @memberOf UIBase
     */
    function Loading() {
    }

    Loading.prototype =
    /**
     * @lends UIBase.Loading.prototype
     */
    {
        /**
         * mask component as loading
         */
        loading:function () {
            this.get("view").loading();
        },

        /**
         * unmask component as loading
         */
        unloading:function () {
            this.get("view").unloading();
        }
    };

    return Loading;

});/**
 * @fileOverview loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/loadingrender", function(S, Node) {

    function Loading() {
    }

    Loading.prototype = {
        loading:function() {
            var self = this;
            if (!self._loadingExtEl) {
                self._loadingExtEl = new Node("<div " +
                    "class='" +
                    this.get("prefixCls") +
                    "ext-loading'" +
                    " style='position: absolute;" +
                    "border: none;" +
                    "width: 100%;" +
                    "top: 0;" +
                    "left: 0;" +
                    "z-index: 99999;" +
                    "height:100%;" +
                    "*height: expression(this.parentNode.offsetHeight);" + "'/>")
                    .appendTo(self.get("el"));
            }
            self._loadingExtEl.show();
        },

        unloading:function() {
            var lel = this._loadingExtEl;
            lel && lel.hide();
        }
    };

    return Loading;

}, {
    requires:['node']
});/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/mask", function () {

    /**
     * make component can show with mask
     * @class
     * @memberOf UIBase
     */
    function Mask() {
    }

    Mask.ATTRS =
    /**
     * @lends UIBase.Mask.prototype
     */
    {
        /**
         * whether show mask layer when component shows
         * @type boolean
         */
        mask:{
            value:false
        }
    };

    Mask.prototype = {
        _uiSetMask:function (v) {
            var self = this;
            if (v) {
                self.on("show", self.get("view")._maskExtShow, self.get("view"));
                self.on("hide", self.get("view")._maskExtHide, self.get("view"));
            } else {
                self.detach("show", self.get("view")._maskExtShow, self.get("view"));
                self.detach("hide", self.get("view")._maskExtHide, self.get("view"));
            }
        }
    };


    return Mask;
}, {requires:["ua"]});/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/maskrender", function (S, UA, Node) {

    /**
     * 多 position 共享一个遮罩
     */
    var mask,
        ie6 = (UA['ie'] === 6),
        px = "px",
        $ = Node.all,
        WINDOW = S.Env.host,
        doc = $(WINDOW.document),
        iframe,
        num = 0;

    function docWidth() {
        return  ie6 ? ("expression(KISSY.DOM.docWidth())") : "100%";
    }

    function docHeight() {
        return ie6 ? ("expression(KISSY.DOM.docHeight())") : "100%";
    }

    function initMask() {
        mask = $("<div " +
            " style='width:" + docWidth() + ";height:" + docHeight() + ";' " +
            "class='" +
            this.get("prefixCls") + "ext-mask'/>")
            .prependTo(WINDOW.document.body);
        mask.css({
            "position":ie6 ? "absolute" : "fixed", // mask 不会撑大 docWidth
            left:0,
            top:0
        });
        if (ie6) {
            //ie6 下最好和 mask 平行
            iframe = $("<" + "iframe " +
                //"tabindex='-1' " +
                "style='position:absolute;" +
                "left:" + "0px" + ";" +
                "top:" + "0px" + ";" +
                "background:red;" +
                "width:" + docWidth() + ";" +
                "height:" + docHeight() + ";" +
                "filter:alpha(opacity=0);" +
                "z-index:-1;'/>").insertBefore(mask)
        }

        /**
         * 点 mask 焦点不转移
         */
        mask.unselectable();
        mask.on("mousedown click", function (e) {
            e.halt();
        });
    }

    function Mask() {
    }


    Mask.prototype = {

        _maskExtShow:function () {
            var self = this;
            if (!mask) {
                initMask.call(self);
            }
            var zIndex = {
                "z-index":self.get("zIndex") - 1
            },
                display = {
                    "display":""
                };
            mask.css(zIndex);
            iframe && iframe.css(zIndex);
            num++;
            if (num == 1) {
                mask.css(display);
                iframe && iframe.css(display);
            }
        },

        _maskExtHide:function () {
            num--;
            if (num <= 0) {
                num = 0;
            }
            if (!num) {
                var display = {
                    "display":"none"
                };
                mask && mask.css(display);
                iframe && iframe.css(display);
            }
        },

        __destructor:function () {
            this._maskExtHide();
        }

    };

    return Mask;
}, {
    requires:["ua", "node"]
});/**
 * @fileOverview position and visible extension，可定位的隐藏层
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/position", function (S) {

    /**
     * make component positionable
     * @class
     * @memberOf UIBase
     */
    function Position() {
    }

    Position.ATTRS =
    /**
     * @lends UIBase.Position.prototype
     */
    {
        /**
         * 横坐标值
         * @type Number
         */
        x:{
            view:true
        },
        /**
         * 纵坐标值
         * @type Number
         */
        y:{
            view:true
        },
        /**
         * 横纵坐标值
         * @type Number[]
         */
        xy:{
            // 相对 page 定位, 有效值为 [n, m], 为 null 时, 选 align 设置
            setter:function (v) {

                var self = this,
                    xy = S.makeArray(v);

                /*
                 属性内分发特别注意：
                 xy -> x,y

                 */
                if (xy.length) {
                    xy[0] && self.set("x", xy[0]);
                    xy[1] && self.set("y", xy[1]);
                }
                return v;
            },
            /**
             * xy 纯中转作用
             */
            getter:function () {
                return [this.get("x"), this.get("y")];
            }
        },
        /**
         * z-index 值
         * @type Number
         */
        zIndex:{
            view:true
        }
    };


    Position.prototype =
    /**
     * @lends UIBase.Position.prototype
     */
    {
        //! #112 和 effect 冲突，不好控制，delay
//        __bindUI:function () {
//            // fix #112
//            var self = this,
//                el = self.get("el");
//            // show hide event is earlier than afterVisibleChange
//            self.on("hide", function () {
//                self.set("hideLeft", el.css("left"));
//                self.set("hideTop", el.css("top"));
//                el.css({
//                    left:HIDE_INDICATOR_PX,
//                    top:HIDE_INDICATOR_PX
//                });
//            });
//            self.on("show", function () {
//                if (el.style("left") == HIDE_INDICATOR_PX) {
//                    el.css("left", self.get("hideLeft"));
//                }
//                if (el.style("top") == HIDE_INDICATOR_PX) {
//                    el.css("top", self.get("hideTop"));
//                }
//            });
//        },
        /**
         * 移动到绝对位置上, move(x, y) or move(x) or move([x, y])
         * @param {Number|Number[]} x
         * @param {Number} [y]
         */
        move:function (x, y) {
            var self = this;
            if (S.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            self.set("xy", [x, y]);
        }
    };

    return Position;
});/**
 * @fileOverview position and visible extension，可定位的隐藏层
 * @author  yiminghe@gmail.com
 */
KISSY.add("uibase/positionrender", function () {

    var ZINDEX = 9999;

    function Position() {
    }

    Position.ATTRS = {
        x:{
            // 水平方向绝对位置
            valueFn:function () {
                var self=this;
                // 读到这里时，el 一定是已经加到 dom 树中了，否则报未知错误
                // el 不在 dom 树中 offset 报错的
                // 最早读就是在 syncUI 中，一点重复设置(读取自身 X 再调用 _uiSetX)无所谓了
                return self.get("el") && self.get("el").offset().left;
            }
        },
        y:{
            // 垂直方向绝对位置
            valueFn:function () {
                var self=this;
                return self.get("el") && self.get("el").offset().top;
            }
        },
        zIndex:{
            value:ZINDEX
        }
    };


    Position.prototype = {

        __createDom:function () {
            this.get("el").addClass(this.get("prefixCls") + "ext-position");
        },

        _uiSetZIndex:function (x) {
            this.get("el").css("z-index", x);
        },

        _uiSetX:function (x) {
            this.get("el").offset({
                left:x
            });
        },

        _uiSetY:function (y) {
            this.get("el").offset({
                top:y
            });
        }
    };

    return Position;
});/**
 * @fileOverview resize extension using resizable
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/resize", function (S) {

    /**
     * make component resizable
     * @class
     * @memberOf UIBase
     */
    function Resize() {
    }

    Resize.ATTRS =
    /**
     * @lends UIBase.Resize.prototype
     */
    {
        /**
         * 调整大小的配置
         * @example
         * <code>
         *  {
         *    minWidth:100, //类型整数, 表示拖动调整大小的最小宽度
         *    maxWidth:1000, //类型整数, 表示拖动调整大小的最大宽度
         *    minHeight:100, //类型整数, 表示拖动调整大小的最小高度
         *    maxHeight:1000, //类型整数, 表示拖动调整大小的最大高度
         *    handlers:["b","t","r","l","tr","tl","br","bl"] //类型字符串数组, 取自上述 8 个值的集合.
         *    // handlers 配置表示的数组元素可取上述八种值之一, t,b,l,r 分别表示 top,bottom,left,right,
         *    // 加上组合共八种取值, 可在上, 下, 左, 右以及左上, 左下, 右上, 右下进行拖动.
         *  }
         * </code>
         * @type Object
         */
        resize:{
            value:{
            }
        }
    };

    Resize.prototype = {
        __destructor:function () {
            var r = this.resizer;
            r && r.destroy();
        },
        _uiSetResize:function (v) {
            var Resizable = S.require("resizable"),
                self = this;
            if (Resizable) {
                self.resizer && self.resizer.destroy();
                v.node = self.get("el");
                if (v.handlers) {
                    self.resizer = new Resizable(v);
                }
            }
        }
    };


    return Resize;
});/**
 * @fileOverview shim for ie6 ,require box-ext
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/shimrender", function(S, Node) {

    function Shim() {
    }

    Shim.ATTRS = {
        shim:{
            value:true
        }
    };

    Shim.prototype = {

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
                    "height: expression(this.parentNode.offsetHeight);" + "'/>");
                el.prepend(self.__shimEl);
            } else if (!v && self.__shimEl) {
                self.__shimEl.remove();
                delete self.__shimEl;
            }
        }
    };

    return Shim;
}, {
    requires:['node']
});/**
 * @fileOverview support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/stdmod", function () {


    /**
     * generate head,body,foot for component
     * @class
     * @memberOf UIBase
     */
    function StdMod() {
    }

    StdMod.ATTRS =

    /**
     * @lends UIBase.StdMod.prototype
     */
    {
        /**
         * Header element of dialog. Readonly
         * @type Node
         */
        header:{
            view:true
        },
        /**
         * Body element of dialog. Readonly
         * @type Node
         */
        body:{
            view:true
        },
        /**
         * Footer element of dialog. Readonly
         * @type Node
         */
        footer:{
            view:true
        },
        /**
         * Key-value map of body element's style.
         * @type Object
         */
        bodyStyle:{
            view:true
        },
        /**
         * Key-value map of footer element's style.
         * @type Object
         */
        footerStyle:{
            view:true
        },
        /**
         * Key-value map of header element's style.
         * @type Object
         */
        headerStyle:{
            view:true
        },
        /**
         * Html content of header element.
         * @type Node|String
         */
        headerContent:{
            view:true
        },
        /**
         * Html content of body element.
         * @type Node|String
         */
        bodyContent:{
            view:true
        },
        /**
         * Html content of footer element.
         * @type Node|String
         */
        footerContent:{
            view:true
        }
    };

    return StdMod;

});/**
 * @fileOverview support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/stdmodrender", function (S, Node) {


    var CLS_PREFIX = "stdmod-";

    function StdMod() {
    }

    StdMod.ATTRS = {
        header:{
        },
        body:{
        },
        footer:{
        },
        bodyStyle:{
            sync:false
        },
        footerStyle:{
            sync:false
        },
        headerStyle:{
            sync:false
        },
        headerContent:{
            sync:false
        },
        bodyContent:{
            sync:false
        },
        footerContent:{
            sync:false
        }
    };

    function serialize(css) {
        var str = "";
        if (css) {
            for (var i in css) {
                if (css.hasOwnProperty(i)) {
                    str += i + ":" + css[i] + ";"
                }
            }
        }
        return str;
    }

    StdMod.HTML_PARSER = {
        header:function (el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + "header");
        },
        body:function (el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + "body");
        },
        footer:function (el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + "footer");
        }
    };

    function renderUI(self, part) {
        var el = self.get("contentEl"),
            style = self.get(part + "Style"),
            content = self.get(part + "Content"),
            isString = S.isString(content),
            partEl = self.get(part);
        if (!partEl) {
            style = serialize(style);
            partEl = new Node("<div class='" + self.get("prefixCls") +
                CLS_PREFIX + part + "'" +
                " " +
                (style ? ("style='" + style + "'") : "") +
                " >" +
                (isString ? content : "") +
                "</div>");
            if (!isString) {
                partEl.append(content);
            }
            partEl.appendTo(el);
            self.__set(part, partEl);
        } else if (style) {
            partEl.css(style);
        }
    }


    function _setStdModContent(self, part, v) {
        part = self.get(part);
        if (S.isString(v)) {
            part.html(v);
        } else {
            part.html("")
                .append(v);
        }
    }

    StdMod.prototype = {

        __createDom:function () {
            renderUI(this, "header");
            renderUI(this, "body");
            renderUI(this, "footer");
        },

        _uiSetBodyStyle:function (v) {
            this.get("body").css(v);
        },

        _uiSetHeaderStyle:function (v) {
            this.get("header").css(v);
        },
        _uiSetFooterStyle:function (v) {
            this.get("footer").css(v);
        },

        _uiSetBodyContent:function (v) {
            _setStdModContent(this, "body", v);
        },

        _uiSetHeaderContent:function (v) {
            _setStdModContent(this, "header", v);
        },

        _uiSetFooterContent:function (v) {
            _setStdModContent(this, "footer", v);
        }
    };

    return StdMod;

}, {
    requires:['node']
});/**
 * @fileOverview uibase
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase", function(S, UIBase, Align, Box, BoxRender, Close, CloseRender, Constrain, ContentBox, ContentBoxRender, Drag, Loading, LoadingRender, Mask, MaskRender, Position, PositionRender, ShimRender, Resize, StdMod, StdModRender) {
    Close.Render = CloseRender;
    Loading.Render = LoadingRender;
    Mask.Render = MaskRender;
    Position.Render = PositionRender;
    StdMod.Render = StdModRender;
    Box.Render = BoxRender;
    ContentBox.Render = ContentBoxRender;
    S.mix(UIBase, {
        Align:Align,
        Box:Box,
        Close:Close,
        Constrain:Constrain,
        ContentBox:ContentBox,
        Drag:Drag,
        Loading:Loading,
        Mask:Mask,
        Position:Position,
        Shim:{
            Render:ShimRender
        },
        Resize:Resize,
        StdMod:StdMod
    });
    return UIBase;
}, {
    requires:["uibase/base",
        "uibase/align",
        "uibase/box",
        "uibase/boxrender",
        "uibase/close",
        "uibase/closerender",
        "uibase/constrain",
        "uibase/contentbox",
        "uibase/contentboxrender",
        "uibase/drag",
        "uibase/loading",
        "uibase/loadingrender",
        "uibase/mask",
        "uibase/maskrender",
        "uibase/position",
        "uibase/positionrender",
        "uibase/shimrender",
        "uibase/resize",
        "uibase/stdmod",
        "uibase/stdmodrender"]
});
