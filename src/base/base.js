/**
 * @module  Base
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('base', function (S) {

    /*
     * Base for class-based component
     */
    function Base(config) {
        var self = this;
        initHierarchy(self, config);
        self.init && self.init();
    }

    /**
     * init attr using constructors ATTRS meta info
     */
    function initHierarchy(host, config) {
        var c = host.constructor, attr, attrs, ATTRS = 'ATTRS';

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

            //初始化扩展类构造器
            var exts = c._kissycreate;
            exts = exts && exts._exts;
            if (exts) {
                for (var i = 0; i < exts.length; i++) {
                    exts[i].call(host, config);
                }
            }

            c = c.superclass ? c.superclass.constructor : null;
        }

        // initial
        if (config) {
            for (attr in config) {
                if (config.hasOwnProperty(attr))
                    host.__set(attr, config[attr]);
            }
        }
    }

    S.augment(Base, S.EventTarget, S.Attribute);


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
            exts = baseCls;
            baseCls = Base;
        }
        function re() {
            re.superclass.constructor.call(this, arguments);
            this.init();
        }

        S.extend(re, baseCls, px, sx);
        if (exts) {
            re._kissycreate = re._kissycreate || {};
            re._kissycreate._exts = exts;
            for (var i = 0; i < exts.length; i++) {
                var attrs = exts[i].ATTRS;
                if (attrs) {
                    re.ATTRS = re.ATTRS || {};
                    S.mix(re.ATTRS, attrs);
                }
            }
        }
        return re;
    }
    S.Base = Base;
});

/**
 * 2011-11-08 Base && yui3 Widget 压缩一下
 */
