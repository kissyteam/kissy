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

    function __getHook(method, reverse) {
        return function (origFn) {
            return function wrap() {
                var self = this;
                if (reverse) {
                    origFn.apply(self, arguments);
                } else {
                    self.callSuper.apply(self, arguments);
                }
                // can not use wrap in old ie
                var extensions = arguments.callee.__owner__.__extensions__ || [];
                if (reverse) {
                    extensions.reverse();
                }
                callExtensionsMethod(self, extensions, method, arguments);
                if (reverse) {
                    self.callSuper.apply(self, arguments);
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
        callPluginsMethod.call(self, 'pluginInitializer');
        // bind attr change
        self.bindInternal();
        // sync attr
        self.syncInternal();
    }

    S.augment(Base, Attribute, {
        initializer: noop,

        '__getHook': __getHook,

        __callPluginsMethod: callPluginsMethod,

        'callSuper': function () {
            var method, obj,
                self = this,
                args = arguments;

            if (typeof self == 'function' && self.__name__) {
                method = self;
                obj = args[0];
                args = Array.prototype.slice.call(args, 1);
            } else {
                method = arguments.callee.caller;
                if (method.__wrapped__) {
                    method = method.caller;
                }
                obj = self;
            }

            var name = method.__name__;
            if (!name) {
                //S.log('can not find method name for callSuper [' + self.constructor.name + ']: ' + method.toString());
                return undefined;
            }
            var member = method.__owner__.superclass[name];
            if (!member) {
                //S.log('can not find method [' + name + '] for callSuper: ' + method.__owner__.name);
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
                cs = [],
                i,
                c = self.constructor,
                attrs = self.getAttrs();

            while (c) {
                cs.push(c);
                c = c.superclass && c.superclass.constructor;
            }

            cs.reverse();

            // from super class to sub class
            for (i = 0; i < cs.length; i++) {
                var ATTRS = cs[i].ATTRS || {};
                for (var attributeName in ATTRS) {
                    if (attributeName in attrs) {
                        var attributeValue,
                            onSetMethod;
                        var onSetMethodName = ON_SET + ucfirst(attributeName);
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
                callPluginsMethod.call(self, 'pluginDestructor');
                self.destructor();
                self.detach();
                self.set('destroyed', true);
                self.fire('destroy');
            }
        }
    });

    S.mix(Base, {
        name: 'Base',

        __hooks__: {
            initializer: __getHook(),
            destructor: __getHook('__destructor', true)
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
            var SuperClass = this,
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
            px = S.merge(px);
            if (px.hasOwnProperty('constructor')) {
                SubClass = px.constructor;
            } else {
                // debug mode, give the right name for constructor
                // refer : http://limu.iteye.com/blog/1136712
                if ('@debug@') {
                    eval("SubClass = function " + CamelCase(name) + "(){ " +
                        "this.callSuper.apply(this, arguments);}");
                } else {
                    SubClass = function () {
                        this.callSuper.apply(this, arguments);
                    };
                }
            }
            px.constructor = SubClass;
            // wrap method to get owner and name
            var hooks = SuperClass.__hooks__;
            if (hooks) {
                sx.__hooks__ = S.merge(hooks, sx.__hooks__);
            }
            SubClass.__extensions__ = extensions;
            wrapProtoForSuper(px, SubClass, sx.__hooks__ || {});
            var sp = SuperClass.prototype;
            // process inheritedStatics
            var inheritedStatics = sp['__inheritedStatics__'] = sp['__inheritedStatics__'] || sx['inheritedStatics'];
            if (sx['inheritedStatics'] && inheritedStatics !== sx['inheritedStatics']) {
                S.mix(inheritedStatics, sx['inheritedStatics']);
            }
            if (inheritedStatics) {
                S.mix(SubClass, inheritedStatics);
            }
            delete sx['inheritedStatics'];
            // extend
            S.extend(SubClass, SuperClass, px, sx);
            // merge extensions
            if (extensions.length) {
                var attrs = {},
                    prototype = {};
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
                        for (p in exp) {
                            // do not mess with parent class
                            if (exp.hasOwnProperty(p)) {
                                prototype[p] = exp[p];
                            }
                        }
                    }
                });
                SubClass[ATTRS] = attrs;
                prototype.constructor = SubClass;
                S.augment(SubClass, prototype);
            }
            SubClass.extend = SubClass.extend || extend;
            SubClass.addMembers = addMembers;
            return SubClass;
        }
    });

    function addMembers(px) {
        var SubClass = this;
        wrapProtoForSuper(px, SubClass, SubClass.__hooks__ || {});
        S.mix(SubClass.prototype, px);
    }

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

    function wrapProtoForSuper(px, SubClass, hooks) {
        if (!hooks) {
            debugger
        }
        var extensions = SubClass.__extensions__;
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
        S.each(px, function (v, p) {
            if (typeof v == 'function') {
                var wrapped = 0;
                if (v.__owner__) {
                    var originalOwner = v.__owner__;
                    delete v.__owner__;
                    delete v.__name__;
                    wrapped = v.__wrapped__ = 1;
                    var newV = wrapper(v);
                    newV.__owner__ = originalOwner;
                    newV.__name__ = p;
                    originalOwner.prototype[p] = newV;
                } else if (v.__wrapped__) {
                    wrapped = 1;
                }
                if (wrapped) {
                    px[p] = v = wrapper(v);
                }
                v.__owner__ = SubClass;
                v.__name__ = p;
            }
        });
    }

    function callPluginsMethod(method) {
        var len,
            self = this,
            plugins = self.get('plugins');
        if (len = plugins.length) {
            for (var i = 0; i < len; i++) {
                plugins[i][method] && plugins[i][method](self);
            }
        }
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
 * - callSuper inspired by goto100
 */
