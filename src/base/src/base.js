/**
 * @ignore
 * KISSY Class System
 * @author yiminghe@gmail.com
 */
KISSY.add('base', function (S, Attribute) {
    var ATTRS = 'ATTRS',
        ucfirst = S.ucfirst,
        ON_SET = '_onSet',
        noop = S.noop,
        RE_DASH = /(?:^|-)([a-z])/ig;

    function replaceToUpper(_, letter) {
        return letter.toUpperCase();
    }

    function CamelCase(name) {
        return name.replace(RE_DASH, replaceToUpper);
    }

    function __getHook__(method, reverse) {
        return function (origFn) {
            return function wrap() {
                var self = this;
                if (reverse) {
                    origFn.apply(self, arguments);
                } else {
                    self.super.apply(self, arguments);
                }

                var extensions = wrap.__owner__.__extensions__ || [];
                if (reverse) {
                    extensions.reverse();
                }
                callExtensionsMethod(self, extensions, method, arguments);
                if (reverse) {
                    self.super.apply(self, arguments);
                } else {
                    origFn.apply(self, arguments);
                }
            };
        }
    }

    /**
     * @class KISSY.Base
     * @mixins KISSY.Event.Target
     * @mixins KISSY.Base.Attribute
     *
     * A base class which objects requiring attributes, extension, plugin, custom event support can
     * extend.
     * attributes configured
     * through the static {@link KISSY.Base#static-ATTRS} property for each class
     * in the hierarchy will be initialized by Base.
     */
    function Base(config) {
        var self = this,
            c = self.constructor;
        // save user config
        self.userConfig = config;
        // define
        while (c) {
            addAttrs(self, c[ATTRS]);
            c = c.superclass ? c.superclass.constructor : null;
        }
        // initial attr
        initAttrs(self, config);
        // setup listeners
        var listeners = self.get("listeners");
        for (var n in listeners) {
            self.on(n, listeners[n]);
        }
        // initializer
        self.initializer();
        // call plugins
        constructPlugins(self);
        callPluginsMethod(self, 'pluginInitializer');
        // bind attr change
        self.bindInternal();
        // sync attr
        self.syncInternal();
    }

    S.augment(Base, Attribute, {
        initializer: noop,

        __collectConstructorChains: function () {
            return collectConstructorChains(this);
        },

        '__getHook__': __getHook__,

        'super': function () {
            var method, obj,
                self = this,
                args = arguments;

            if (typeof self == 'function' && self.__name__) {
                method = self;
                obj = args[0];
                args = Array.prototype.slice.call(args, 1);
            } else {
                method = self.super.caller;
                obj = self;
            }

            var name = method.__name__;
            if (!name) {
                return undefined;
            }
            var member = method.__owner__.superclass[name];
            if (!member) {
                return undefined;
            }

            return member.apply(obj, args || []);
        },

        /**
         * bind attribute change event
         * @protected
         */
        bindInternal: function () {
            var self = this,
                attrs = self['getAttrs'](),
                attr, m;

            for (attr in attrs) {
                m = ON_SET + ucfirst(attr);
                if (self[m]) {
                    // 自动绑定事件到对应函数
                    self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
                }
            }
        },

        /**
         * sync attribute change event
         * @protected
         */
        syncInternal: function () {
            var self = this,
                attributeValue, onSetMethod, i,
                constructor, attributeName, onSetMethodName,
                cache = {},
                constructorChains = collectConstructorChains(self),
                attrs;

            // 从父类到子类执行同步属性函数
            for (i = constructorChains.length - 1; i >= 0; i--) {
                constructor = constructorChains[i];
                if (attrs = constructor[ATTRS]) {
                    for (attributeName in attrs) {
                        // 防止子类覆盖父类属性定义造成重复执行
                        if (!cache[attributeName]) {
                            cache[attributeName] = 1;
                            onSetMethodName = ON_SET + ucfirst(attributeName);
                            // 存在方法，并且用户设置了初始值或者存在默认值，就同步状态
                            if ((onSetMethod = self[onSetMethodName]) &&
                                // 用户如果设置了显式不同步，就不同步，
                                // 比如一些值从 html 中读取，不需要同步再次设置
                                attrs[attributeName].sync !== 0 &&
                                (attributeValue = self.get(attributeName)) !== undefined) {
                                onSetMethod.call(self, attributeValue);
                            }
                        }
                    }
                }
            }
        },

        /**
         * plugin a new plugins to current instance
         * @param {Function|Object} plugin
         * @chainable
         */
        'plug': function (plugin) {
            var self = this;
            if (typeof plugin === 'function') {
                plugin = new plugin();
            }
            // initialize plugin
            if (plugin['pluginInitializer']) {
                plugin['pluginInitializer'](self);
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
                        // user defined takes priority
                        pluginId = p.get && p.get('pluginId') || p.pluginId;
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
                    p.pluginDestructor(self);
                }
            });

            self.setInternal('plugins', plugins);
            return self;
        },

        /**
         * get specified plugin instance by id
         * @param {String} id pluginId of plugin instance
         * @return {Object}
         */
        'getPlugin': function (id) {
            var plugin = null;
            S.each(this.get('plugins'), function (p) {
                // user defined takes priority
                var pluginId = p.get && p.get('pluginId') || p.pluginId;
                if (pluginId == id) {
                    plugin = p;
                    return false;
                }
                return undefined;
            });
            return plugin;
        },

        destructor: S.noop,

        destroy: function () {
            var self = this;
            if (!self.get('destroyed')) {
                callPluginsMethod(self, 'pluginDestructor');
                self.destructor();
                self.detach();
                self.set('destroyed', true);
                self.fire('destroy');
            }
        }
    });

    S.mix(Base, {
        __hooks__: {
            initializer: __getHook__(),
            destructor: __getHook__('__destructor', true)
        },

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

            destroyed: {
                value: false
            },

            /**
             * Config listener on created.
             *
             * for example:
             *
             *      {
             *          click:{
             *              context:{x:1},
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
        },

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
            var ParentClass = this,
                name,
                SubClass;
            if (!S.isArray(extensions)) {
                sx = px;
                px = /**@type {Object}
                 @ignore*/extensions;
                extensions = [];
            }
            sx = sx || {};
            name = sx.name || 'BaseDerived';
            px = px || {};
            if (px.hasOwnProperty('constructor')) {
                SubClass = px.constructor;
            } else {
                // debug mode, give the right name for constructor
                // refer : http://limu.iteye.com/blog/1136712
                if ('@debug@') {
                    eval("SubClass = function " + CamelCase(name) + "(){ " +
                        "this.super.apply(this, arguments);}");
                } else {
                    SubClass = function () {
                        this.super.apply(this, arguments);
                    };
                }
            }
            px.constructor = SubClass;
            // wrap method to get owner and name
            var hooks = ParentClass.__hooks__;
            sx.__hooks__ = S.mix(hooks, sx.__hooks__);
            if (extensions.length) {
                for (p in hooks) {
                    px[p] = px[p] || noop;
                }
            }
            for (var p in px) {
                if (p in hooks) {
                    px[p] = hooks[p](px[p]);
                }
            }
            wrapProtoForSuper(px, SubClass);
            var sp = ParentClass.prototype;
            // process inheritedStatics
            var inheritedStatics = sp['__inheritedStatics__'] = sp['__inheritedStatics__'] || sx['inheritedStatics'];
            if (inheritedStatics !== sx['inheritedStatics']) {
                S.mix(inheritedStatics, sx['inheritedStatics']);

            }
            if (inheritedStatics) {
                S.mix(SubClass, inheritedStatics);
            }
            delete sx['inheritedStatics'];
            // extend
            S.extend(SubClass, ParentClass, px, sx);
            // merge extensions
            if (extensions) {
                var attrs = {},
                    prototype = SubClass.prototype;
                SubClass.__extensions__ = extensions;
                // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
                // 主类最优先
                S.each(extensions['concat'](SubClass), function (ext) {
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
                        var exp = ext.prototype,
                            p;
                        var member;
                        for (p in exp) {
                            // do not mess with parent class
                            if (exp.hasOwnProperty(p)) {
                                member = prototype[p] = exp[p];
                            }
                        }
                    }
                });
                SubClass[ATTRS] = attrs;
                prototype.constructor = SubClass;
            }
            SubClass.extend = SubClass.extend || extend;
            return SubClass;
        }
    });

    /**
     * The default set of attributes which will be available for instances of this class, and
     * their configuration
     *
     * By default if the value is an object literal or an array it will be 'shallow' cloned, to
     * protect the default value.
     *
     *      for example:
     *      @example
     *      {
     *          x:{
     *              value: // default value
     *              valueFn: // default function to get value
     *              getter: // getter function
     *              setter: // setter function
     *          }
     *      }
     *
     * @property ATTRS
     * @member KISSY.Base
     * @static
     * @type {Object}
     */

    function collectConstructorChains(self) {
        var constructorChains = [],
            c = self.constructor;
        while (c) {
            constructorChains.push(c);
            c = c.superclass && c.superclass.constructor;
        }
        return constructorChains;
    }

    function onSetAttrChange(e) {
        var self = this,
            method;
        // ignore bubbling
        if (e.target == self) {
            method = self[ON_SET + e.type.slice(5).slice(0, -6)];
            method.call(self, e.newVal, e);
        }
    }

    function addAttrs(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 子类上的 ATTRS 配置优先
                // 父类后加，父类不覆盖子类的相同设置
                // 属性对象会 merge
                // a: {y: {getter: fn}}, b: {y: {value: 3}}
                // b extends a
                // =>
                // b {y: {value: 3, getter: fn}}
                host.addAttr(attr, attrs[attr], false);
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                // 用户设置会调用 setter/validator 的，但不会触发属性变化事件
                host.setInternal(attr, config[attr]);
            }
        }
    }

    function constructPlugins(self) {
        var plugins = self.get('plugins');
        S.each(plugins, function (plugin, i) {
            if (typeof plugin === 'function') {
                plugins[i] = new plugin();
            }
        });
    }

    function wrapper(fn) {
        return function () {
            return fn.apply(this, arguments);
        }
    }

    function wrapProtoForSuper(px, SubClass) {
        for (var p in px) {
            var v = px[p];
            if (typeof v == 'function') {
                if (v.__owner__) {
                    px[p] = v = wrapper(v);
                }
                v.__owner__ = SubClass;
                v.__name__ = p;
            }
        }
    }

    function callPluginsMethod(self, method) {
        S.each(self.get('plugins'), function (plugin) {
            if (plugin[method]) {
                plugin[method].call(plugin, self);
            }
        });
    }

    function callExtensionsMethod(self, extensions, method, args) {
        var len;
        if (len = extensions && extensions.length) {
            for (var i = 0; i < len; i++) {
                var fn = extensions[i] && (
                    !method ?
                        extensions[i] :
                        extensions[i].prototype[method]
                    );
                if (fn) {
                    fn.apply(self, args || []);
                }
            }
        }
    }


    S.Base = Base;

    return Base;
}, {
    requires: ['base/attribute', 'event/custom']
});
/**
 * 2013-08-12 yiminghe@gmail.com
 * - merge rich-base and base
 * - super inspired by goto100
 */
