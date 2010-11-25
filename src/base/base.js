/**
 * @module  Base
 * @author  lifesinger@gmail.com  , 承玉<yiminghe@gmail.com>
 */
KISSY.add('base', function (S) {
    var UI_SET = "_uiSet",
        SRC_NODE = "srcNode",
        capitalFirst = S.Attribute.capitalFirst;
    /*
     * Base for class-based component
     */
    function Base(config) {
        var self = this;
        initHierarchy(self, config);
        config && config.autoRender && self.renderer();
    }

    /**
     * init attr using constructors ATTRS meta info
     * 模拟多继承
     */
    function initHierarchy(host, config) {
        var c = host.constructor,
            attr,
            attrs,
            extChains = [],
            ATTRS = 'ATTRS';

        // define
        while (c) {

            //定义属性
            if ((attrs = c[ATTRS])) {
                for (attr in attrs) {
                    // 子类上的 ATTRS 配置优先
                    if (attrs.hasOwnProperty(attr) && !host.hasAttr(attr)) {
                        host.addAttr(attr, attrs[attr]);
                    }
                }
            }


            //收集扩展类
            var exts = c._kissycreate;
            exts = exts && exts._exts;
            var t_ext = [];
            if (exts) {
                t_ext = exts.concat();
            }


            //先收集扩展类
            var t_init = c.prototype.init;
            if (t_init) {
                t_ext.push(t_init);
            }

            //原地 reverse
            if (t_ext.length) {
                extChains.push.apply(extChains, t_ext.reverse());
            }


            //从 markup 生成相应的属性项
            if (config &&
                config[SRC_NODE] &&
                c.HTML_PARSER) {
                if (config[SRC_NODE] = S.one(config[SRC_NODE]))
                    applyParser.call(host, config[SRC_NODE], c.HTML_PARSER);
            }

            c = c.superclass ? c.superclass.constructor : null;
        }


        // initialize
        //注意：用户设置的属性值会覆盖 html_parser 得到的属性值
        //先设置属性，再运行主类以及扩展类的初始化函数
        if (config) {
            for (attr in config) {
                if (config.hasOwnProperty(attr))
                    host.__set(attr, config[attr]);
            }
        }


        //初始化扩展类构造器，
        //注意：执行顺序
        //父类的所有扩展类构造器，父类 init，子类的所有扩展构造器，子类 init
        for (var i = extChains.length - 1; i >= 0; i--) {
            extChains[i] && extChains[i].call(host, config);
        }


    }

    /**
     * 摧毁组件机制
     * 子类扩展 destructor，子类 destructor，父类扩展 destructor，父类 destructor，
     */
    function destroyHierarchy(host) {
        var c = host.constructor;
        while (c) {
            //收集扩展类
            var exts = c._kissycreate;
            exts = exts && exts._exts;
            var d = c.prototype.destructor;
            d && d.apply(host);
            if (exts) {
                for (var l = exts.length - 1; l >= 0; l--) {
                    d = exts[l] && exts[l].prototype.__destructor;
                    d && d.apply(host);
                }
            }
            c = c.superclass ? c.superclass.constructor : null;
        }
    }

    function applyParser(srcNode, parser) {
        var self = this;
        //从parser中，默默设置属性，不触发事件！__set
        for (var p in parser) {
            if (parser.hasOwnProperty(p)) {
                var v = parser[p];
                //函数
                if (S.isFunction(v)) {
                    self.__set(p, v.call(self, srcNode));
                }
                //单选选择器
                else if (S.isString(v)) {
                    self.__set(p, srcNode.one(v));
                }
                //多选选择器
                else if (S.isArray(v) && v[0]) {
                    self.__set(p, srcNode.all(v[0]))
                }
            }
        }
    }


    Base.HTML_PARSER = {};
    Base.ATTRS = {
        //保证只会 renderer 一次
        rendered:{
            value:false
        },
        render:{
            setter:function(v) {
                if (S.isString(v))
                    return S.one(v);
            }
        }
    };
    S.augment(Base, S.EventTarget, S.Attribute, {
        renderer:function(render) {
            var self = this,rendered = self.get("rendered");
            render = render || self.get("render");

            if (!rendered) {
                self.renderUI(render);
                self.bindUI();
                self.syncUI();
                self.set("rendered", true);
            }
        },
        /**
         * 根据属性添加 DOM 节点
         */
        renderUI:function() {
            this.fire("renderUI");
        },
        /**
         * 根据属性变化设置 UI
         */
        bindUI:function() {
            var self = this,
                attrs = self.getDefAttrs();
            for (var a in attrs) {
                if (attrs.hasOwnProperty(a)) {
                    var m = UI_SET + capitalFirst(a);
                    if (self[m]) {
                        //自动绑定事件到对应函数
                        (function(a, m) {
                            self.on("after" + capitalFirst(a) + "Change", function(ev) {
                                self[m](ev.newVal,ev);
                            });
                        })(a, m);
                    }
                }
            }

            self.fire("bindUI");
        },
        /**
         * 根据当前（初始化）状态来设置 UI
         */
        syncUI:function() {
            var self = this,
                attrs = self.getDefAttrs();
            for (var a in attrs) {
                if (attrs.hasOwnProperty(a)) {
                    var m = UI_SET + capitalFirst(a);
                    if (self[m]) {
                        self[m](self.get(a));
                    }
                }
            }
            self.fire("syncUI");
        },

        destroy:function() {
            destroyHierarchy(this);
            this.fire("destroy");
            this.detach();
        }
    });


    /**
     * 根据基类以及扩展类得到新类
     * @param {function} baseCls 基类
     * @param {Array.<function>} exts 扩展类
     * @param {Object} px 原型 mix 对象
     * @param {Object} sx 静态mix对象
     */
    Base.create = function(baseCls, exts, px, sx) {
        if (S.isArray(baseCls)) {
            sx = px;
            px = exts;
            exts = arguments[0];
            baseCls = Base;
        }
        baseCls = baseCls || Base;
        function re() {
            Base.apply(this, arguments);
        }

        S.extend(re, baseCls, px, sx);
        if (exts) {
            re._kissycreate = re._kissycreate || {};
            re._kissycreate._exts = exts;
            for (var i = 0; i < exts.length; i++) {
                var ext = exts[i],
                    attrs = ext && ext.ATTRS,
                    parsers = ext && ext.HTML_PARSER;
                if (attrs) {
                    re.ATTRS = re.ATTRS || {};
                    //合并功能类属性定义到主类，不要覆盖主类属性重定义
                    S.mix(re.ATTRS, attrs, false);
                }

                if (parsers) {
                    re.HTML_PARSER = re.HTML_PARSER || {};
                    //合并功能类 htmlparser 定义到主类，不要覆盖主类属性重定义
                    S.mix(re.HTML_PARSER, parsers, false);
                }
                //合并功能类代码到主类
                if (ext)
                    S.augment(re, ext);
            }
        }
        return re;
    };
    S.Base = Base;
});

/**
 * 2011-11-08 承玉重构，Base && yui3 Widget 压缩一下，增加扩展类支持，组件初始化生命周期以及 htmlparser
 * 测试 crlf
 * 
 */