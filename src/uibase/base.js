/**
 * @module  UIBase
 * @author  lifesinger@gmail.com, 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase/base', function (S, Base) {

    var UI_SET = '_uiSet',
        SRC_NODE = 'srcNode',
        ATTRS = 'ATTRS',
        HTML_PARSER = 'HTML_PARSER',
        Node = S.require("node/node"),
        Attribute = S.require("base/attribute"),
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
                if ((config[SRC_NODE] = Node.one(config[SRC_NODE])))
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
                else if (S['isString'](v)) {
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
            },
            setter:function(v) {
                if (S['isString'](v))
                    return Node.one(v);
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
     * @param exts 扩展类
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
                        deepMix(C[K], ext[K]);
                    }
                });

                // 合并功能代码到主类，不覆盖
                S.augment(C, ext, false);
            });
        }

        return C;
    };
    function deepMix(r, s) {
        if (!s) return r;
        for (var p in s) {
            // 如果属性是对象，接着递归进行
            if (S['isObject'](s[p]) && S['isObject'](r[p])) {
                deepMix(r[p], s[p]);
            } else if (!(p in r)) {
                r[p] = s[p];
            }
        }
    }

    return UIBase;
}, {
    requires:["base","dom","node"]
});
