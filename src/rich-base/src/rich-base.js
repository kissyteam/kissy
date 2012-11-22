/**
 * @ignore
 * infrastructure for create plugin/extension-enabled class
 * @author yiminghe@gmail.com
 */
KISSY.add('rich-base', function (S, Base) {

    var ATTRS = 'ATTRS',
        noop = S.noop;

    /**
     * infrastructure for create plugin/extension-enabled class
     * @class KISSY.RichBase
     * @extend KISSY.Base
     */
    function RichBase() {
        var self = this, n, listeners;

        // apply attribute
        Base.apply(self, arguments);

        // setup listeners
        listeners = self.get("listeners");
        for (n in listeners) {
            self.on(n, listeners[n]);
        }

        // initialize main class and extension
        self.callMethodByHierarchy("initializer", "constructor");

        // initialize plugins
        self.constructPlugins();
        self.callPluginsMethod("initializer");
    }

    S.extend(RichBase, Base, {
        /**
         * call methods on main class and extension class by order
         * @protected
         * @param mainMethod method name of main class.
         * @param extMethod method name of extension class
         */
        callMethodByHierarchy: function (mainMethod, extMethod) {
            var self = this,
                c = self.constructor,
                extChains = [],
                ext,
                main,
                i,
                exts,
                t;

            // define
            while (c) {
                // 收集扩展类
                t = [];
                if (exts = c.__ks_exts) {
                    for (i = 0; i < exts.length; i++) {
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
                extChains[i] && extChains[i].call(self);
            }
        },

        /**
         * call plugin method
         * @protected
         * @param method method name of plugin
         */
        callPluginsMethod: function (method) {
            var self = this;
            S.each(self.get('plugins'), function (plugin) {
                if (plugin[method]) {
                    plugin[method](self);
                }
            });
        },

        /**
         * construct plugins
         * @protected
         */
        constructPlugins: function () {
            var plugins = this.get('plugins');
            S.each(plugins, function (plugin, i) {
                if (S.isFunction(plugin)) {
                    plugins[i] = new plugin();
                }
            });
        },

        /**
         * initialize for overridden
         * @protected
         */
        initializer: noop,

        /**
         * destroy for overridden
         * @protected
         */
        destructor: noop,

        /**
         * destroy current instance.
         */
        destroy: function () {
            var self = this;
            self.callPluginsMethod("destructor");
            destroyHierarchy(self);
            self.fire('destroy');
            self.detach();
            self.fire('destroy');
        },

        /**
         * plugin a new plugins to current instance
         * @param {Function|Object} plugin
         * @chainable
         */
        'plug': function (plugin) {
            var self = this;
            if (S.isFunction(plugin)) {
                plugin = new plugin();
            }
            // initialize plugin
            if (plugin['initializer']) {
                plugin['initializer'](self);
            }
            self.get('plugins').push(plugin);
            return self;
        },

        /**
         * unplug by pluginId or plugin instance.
         * if called with no parameter, then destroy all plugins.
         * @param {Object|String} [plugin]
         * @chainable
         */
        'unplug': function (plugin) {
            var plugins = [],
                self = this,
                isString = typeof plugin == 'string';

            S.each(self.get('plugins'), function (p) {
                var keep = 0, pluginId;
                if (plugin) {
                    if (isString) {
                        pluginId = p.pluginId || p.get && p.get('pluginId');
                        if (pluginId != plugin) {
                            plugins.push(p);
                            keep = 1;
                        }
                    } else {
                        if (p != plugin) {
                            plugins.push(p);
                            keep = 1;
                        }
                    }
                }

                if (!keep) {
                    p.destructor(self);
                }
            });

            self.setInternal('plugins', plugins);
            return self;
        }

    }, {
        ATTRS: {
            /**
             * Plugins for current component.
             * @cfg {Function[]/Object[]} plugins
             */
            /**
             * @ignore
             */
            plugins: {
                value: []
            },

            /**
             * Config listener on created.
             *
             * for example:
             *
             *      {
             *          click:{
             *              scope:{x:1},
             *              fn:function(){
             *                  alert(this.x);
             *              }
             *          }
             *      }
             *      // or
             *      {
             *          click:function(){
             *              alert(this.x);
             *          }
             *      }
             *
             * @cfg {Object} listeners
             */
            /**
             * @ignore
             */
            listeners: {
                value: []
            }
        }
    });

    S.mix(RichBase, {
        /**
         * create a new class from extensions and static/prototype properties/methods.
         * @param {Function[]} [extensions] extension classes
         * @param {Object} [px] key-value map for prototype properties/methods.
         * @param {Object} [sx] key-value map for static properties/methods.
         * @return {Function} new class which extend called, it also has a static extend method
         *
         * for example:
         *
         *      var parent = RichBase.extend({
         *          isParent: 1
         *      });
         *      var child = parent.extend({
         *          isChild: 1,
         *          isParent: 0
         *      })
         */
        extend: function extend(extensions, px, sx) {
            var baseClass = this,
                name = "RichBaseDerived",
                t,
                C,
                args = S.makeArray(arguments);

            if (extensions == null || S.isObject(extensions)) {
                sx = px;
                px = extensions;
                extensions = [];
            }

            if (typeof (t = args[args.length - 1]) == 'string') {
                name = t;
            }

            px = px || {};
            if (px.hasOwnProperty('constructor')) {
                C = px.constructor;
            } else {
                C = function () {
                    C.superclass.constructor.apply(this, arguments);
                };
                // debug mode, give the right name for constructor
                // refer : http://limu.iteye.com/blog/1136712
                if (S.Config.debug) {
                    eval("C=function " + name.replace(/[-.]/g, "_") +
                        "(){ C.superclass.constructor.apply(this, arguments);}");
                }
            }

            C.name = name;

            S.extend(C, baseClass, px, sx);

            if (extensions) {
                C.__ks_exts = extensions;

                var attrs = {},
                    prototype = {};

                // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
                // 主类最优先
                S.each(extensions['concat'](C), function (ext) {
                    if (ext) {
                        // 合并 ATTRS 到主类
                        // 不覆盖主类上的定义(主类位于 constructors 最后)
                        // 因为继承层次上扩展类比主类层次高
                        // 注意：最好 value 必须是简单对象，自定义 new 出来的对象就会有问题
                        // (用 function return 出来)!
                        // a {y:{value:2}} b {y:{value:3,getter:fn}}
                        // b is a extension of a
                        // =>
                        // a {y:{value:2,getter:fn}}

                        S.each(ext[ATTRS], function (v, name) {
                            var av = attrs[name] = attrs[name] || {};
                            S.mix(av, v);
                        });

                        // 方法合并
                        var exp = ext.prototype, p;
                        for (p in exp) {
                            // do not mess with parent class
                            if (exp.hasOwnProperty(p)) {
                                prototype[p] = exp[p];
                            }
                        }
                    }
                });

                C[ATTRS] = attrs;

                S.augment(C, prototype);
            }

            C.extend = extend;

            return C;
        }
    });

// 销毁顺序： 子类 destructor -> 子类扩展 destructor -> 父类 destructor -> 父类扩展 destructor
    function destroyHierarchy(self) {
        var c = self.constructor,
            extensions,
            d,
            i;

        while (c) {
            // 只触发该类真正的析构器，和父亲没关系，所以不要在子类析构器中调用 superclass
            if (c.prototype.hasOwnProperty("destructor")) {
                c.prototype.destructor.apply(self);
            }

            if ((extensions = c.__ks_exts)) {
                for (i = extensions.length - 1; i >= 0; i--) {
                    d = extensions[i] && extensions[i].prototype.__destructor;
                    d && d.apply(self);
                }
            }

            c = c.superclass && c.superclass.constructor;
        }
    }

    return RichBase;

}, {
    requires: ['base']
});