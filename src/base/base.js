/**
 * @module  Base
 * @author  lifesinger@gmail.com, 承玉<yiminghe@gmail.com>
 */
KISSY.add('base' , function (S) {

    var UI_SET = '_uiSet', SRC_NODE = 'srcNode',
        ATTRS = 'ATTRS', HTML_PARSER = 'HTML_PARSER',
        Attribute = S.Attribute,
        capitalFirst = Attribute.__capitalFirst,
        noop = function() {};

    /*
     * Base for class-based component
     */
    function Base(config) {
        initHierarchy(this, config);
        config && config.autoRender && this.renderer();
    }

    /**
     * 模拟多继承
     * init attr using constructors ATTRS meta info
     */
    function initHierarchy(host, config) {
        var c = host.constructor,
            attr,
            attrs,
            extChains = [],
            exts,
            init,
            t,
            i;

        // define
        while (c) {

            // 定义属性
            if ((attrs = c[ATTRS])) {
                for (attr in attrs) {
                    // 子类上的 ATTRS 配置优先
                    if (attrs.hasOwnProperty(attr) && !host.hasAttr(attr)) {
                        host.addAttr(attr, attrs[attr]);
                    }
                }
            }

            // 收集扩展类
            t = [];
            if ((exts = c.__ks_exts)) {
                t = exts.concat();
            }

            // 收集 initializer
            if ((init = c.prototype['initializer'])) {
                t.push(init);
            }

            // 原地 reverse
            if (t.length) {
                extChains.push.apply(extChains, t.reverse());
            }

            // 从 markup 生成相应的属性项
            if (config &&
                config[SRC_NODE] &&
                c.HTML_PARSER) {
                if ((config[SRC_NODE] = S.one(config[SRC_NODE])))
                    applyParser.call(host, config[SRC_NODE], c.HTML_PARSER);
            }

            c = c.superclass && c.superclass.constructor;
        }

        // initialize
        // 注意：用户设置的属性值会覆盖 html_parser 得到的属性值
        // 先设置属性，再运行主类以及扩展类的初始化函数
        if (config) {
            for (attr in config) {
                if (config.hasOwnProperty(attr))
                    host.__set(attr, config[attr]);
            }
        }

        // 初始化扩展类构造器
        // 顺序：父类的所有扩展类构造器 -> 父类 init -> 子类的所有扩展构造器 -> 子类 init
        for (i = extChains.length - 1; i >= 0; i--) {
            extChains[i] && extChains[i].call(host, config);
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

    Base.HTML_PARSER = {};


    S.augment(Base, Attribute, {

        render: function() {
            var self = this;

            self._renderUI();
            self.fire('renderUI');
            self.renderUI();

            self._bindUI();
            self.fire('bindUI');
            self.bindUI();

            self._syncUI();
            self.fire('syncUI');
            self.syncUI();
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
    Base.create = function(base, exts, px, sx) {
        if (S.isArray(base)) {
            sx = px;
            px = exts;
            exts = base;
            base = Base;
        }
        base = base || Base;

        function C() {
            Base.apply(this, arguments);
        }
        S.extend(C, base, px, sx);

        if (exts) {
            C.__ks_exts = exts;

            S.each(exts, function(ext) {
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

    S.Base = Base;
});
/**
 * 2011-11-08 承玉重构，加入 lifecycle 管理
 */
