/**
 * @ignore
 * @fileOverview UIBase
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('component/uibase/base', function (S, Base, Node, Manager, undefined) {

    var UI_SET = '_uiSet',
        SRC_NODE = 'srcNode',
        ATTRS = 'ATTRS',
        HTML_PARSER = 'HTML_PARSER',
        ucfirst = S.ucfirst,
        noop = S.noop;


    /**
     * @class KISSY.Component.UIBase
     * @extends KISSY.Base
     * UIBase for class-based component.
     */
    function UIBase(config) {
        var self = this, id, srcNode;

        // 读取用户设置的属性值并设置到自身
        Base.apply(self, arguments);

        // register instance if config id
        if (id = self.get("id")) {
            Manager.addComponent(id, self);
        }

        // 根据 srcNode 设置属性值
        // 按照类层次执行初始函数，主类执行 initializer 函数，扩展类执行构造器函数
        initHierarchy(self, config);

        // 特殊的 decorate 等属性从 html 收集完再进行
        if (config &&
            (srcNode = config[SRC_NODE]) &&
            self.decorateInternal) {
            self.decorateInternal(srcNode);
        }

        var listener,
            n,
            plugins = self.get("plugins"),
            listeners = self.get("listeners");

        constructPlugins(plugins);

        actionPlugins(self, plugins, "initializer");

        for (n in listeners) {
            listener = listeners[n];
            self.on(n, listener.fn || listener, listener.scope);
        }

        // 是否自动渲染
        config && config.autoRender && self.render();
    }

    // 收集单继承链，子类在前，父类在后
    function collectConstructorChains(self) {
        var constructorChains = [],
            c = self.constructor;
        while (c) {
            constructorChains.push(c);
            c = c.superclass && c.superclass.constructor;
        }
        return constructorChains;
    }

    /**
     * 模拟多继承
     * init attr using constructors ATTRS meta info
     * @ignore
     */
    function initHierarchy(self, config) {
        var c = self.constructor,
            len,
            p,
            constructorChains,
            srcNode;
        if (config && (srcNode = config[SRC_NODE])) {
            constructorChains = collectConstructorChains(self);
            config[SRC_NODE] = Node.one(srcNode);
            // 从父类到子类开始从 html 读取属性
            for (len = constructorChains.length - 1; len >= 0; len--) {
                c = constructorChains[len];
                if (p = c[HTML_PARSER]) {
                    applyParser.call(self, config, p);
                }
            }
        }
        callMethodByHierarchy(self, "initializer", "constructor");
    }

    function callMethodByHierarchy(self, mainMethod, extMethod) {
        var c = self.constructor,
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
    }

    /**
     * 销毁组件顺序： 子类 destructor -> 子类扩展 destructor -> 父类 destructor -> 父类扩展 destructor
     * @ignore
     */
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

    function applyParser(config, parser) {
        var self = this, p, v, srcNode = config[SRC_NODE];

        // 从 parser 中，默默设置属性，不触发事件
        for (p in parser) {
            // 用户设置过那么这里不从 dom 节点取
            // 用户设置 > html parser > default value
            if (config[p] === undefined) {
                v = parser[p];
                // 函数
                if (S.isFunction(v)) {
                    self.setInternal(p, v.call(self, srcNode));
                }
                // 单选选择器
                else if (typeof v == 'string') {
                    self.setInternal(p, srcNode.one(v));
                }
                // 多选选择器
                else if (S.isArray(v) && v[0]) {
                    self.setInternal(p, srcNode.all(v[0]))
                }
            }
        }
    }

    /**
     * 根据属性变化设置 UI
     * @ignore
     */
    function bindUI(self) {
        var attrs = self.getAttrs(),
            attr, m;

        for (attr in attrs) {
            m = UI_SET + ucfirst(attr);
            if (self[m]) {
                // 自动绑定事件到对应函数
                (function (attr, m) {
                    self.on('after' + ucfirst(attr) + 'Change', function (ev) {
                        // fix! 防止冒泡过来的
                        if (ev.target === self) {
                            self[m](ev.newVal, ev);
                        }
                    });
                })(attr, m);
            }
        }
    }

    /**
     * 根据当前（初始化）状态来设置 UI
     * @ignore
     */
    function syncUI(self) {
        var v,
            f,
            i,
            c,
            a,
            m,
            cache = {},
            constructorChains = collectConstructorChains(self),
            attrs;

        // 从父类到子类执行同步属性函数
        for (i = constructorChains.length - 1; i >= 0; i--) {
            c = constructorChains[i];
            if (attrs = c[ATTRS]) {
                for (a in attrs) {
                    // 防止子类覆盖父类属性定义造成重复执行
                    if (!cache[a]) {
                        cache[a] = 1;
                        m = UI_SET + ucfirst(a);
                        // 存在方法，并且用户设置了初始值或者存在默认值，就同步状态
                        if ((f = self[m]) &&
                            // 用户如果设置了显式不同步，就不同步，
                            // 比如一些值从 html 中读取，不需要同步再次设置
                            attrs[a].sync !== false &&
                            (v = self.get(a)) !== undefined) {
                            f.call(self, v);
                        }
                    }
                }
            }
        }
    }

    S.extend(UIBase, Base, {

        /**
         * Create dom structure of this component.
         */
        create: function () {
            var self = this;
            // 是否生成过节点
            if (!self.get("created")) {
                /**
                 * @event beforeCreateDom
                 * fired before root node is created
                 * @param {KISSY.Event.Object} e
                 */
                self.fire('beforeCreateDom');
                callMethodByHierarchy(self, "createDom", "__createDom");
                self.setInternal("created", true);
                /**
                 * @event afterCreateDom
                 * fired when root node is created
                 * @param {KISSY.Event.Object} e
                 */
                self.fire('afterCreateDom');
                actionPlugins(self, self.get("plugins"), "createDom");
            }
            return self;
        },

        /**
         * Put dom structure of this component to document and bind event.
         */
        render: function () {
            var self = this, plugins;
            // 是否已经渲染过
            if (!self.get("rendered")) {
                plugins = self.get("plugins");
                self.create(undefined);

                /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('beforeRenderUI');
                callMethodByHierarchy(self, "renderUI", "__renderUI");

                /**
                 * @event afterRenderUI
                 * fired after root node is rendered into dom
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('afterRenderUI');
                actionPlugins(self, plugins, "renderUI");

                /**
                 * @event beforeBindUI
                 * fired before component 's internal event is bind.
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('beforeBindUI');
                bindUI(self);
                callMethodByHierarchy(self, "bindUI", "__bindUI");

                /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('afterBindUI');
                actionPlugins(self, plugins, "bindUI");

                /**
                 * @event beforeSyncUI
                 * fired before component 's internal state is synchronized.
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('beforeSyncUI');

                syncUI(self);
                callMethodByHierarchy(self, "syncUI", "__syncUI");

                /**
                 * @event afterSyncUI
                 * fired after component 's internal state is synchronized.
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('afterSyncUI');
                actionPlugins(self, plugins, "syncUI");
                self.setInternal("rendered", true);
            }
            return self;
        },

        /**
         * For overridden. DOM creation logic of subclass component.
         * @protected
         * @method
         */
        createDom: noop,

        /**
         * For overridden. Render logic of subclass component.
         * @protected
         * @method
         */
        renderUI: noop,

        /**
         * For overridden. Bind logic for subclass component.
         * @protected
         * @method
         */
        bindUI: noop,

        /**
         * For overridden. Sync attribute with ui.
         * @protected
         * @method
         */
        syncUI: noop,


        /**
         * Destroy this component.
         */
        destroy: function () {
            var self = this,
                id,
                plugins = self.get("plugins");
            actionPlugins(self, plugins, "destructor");
            destroyHierarchy(self);
            self.fire('destroy');
            self.detach();
            // remove instance if set id
            if (id = self.get("id")) {
                Manager.removeComponent(id);
            }
            return self;
        }
    }, {

        ATTRS: {
            /**
             * Whether this component is rendered.
             * @type {Boolean}
             * @property rendered
             */
            /**
             * @ignore
             */
            rendered: {
                value: false
            },
            /**
             * Whether this component 's dom structure is created.
             * @type {Boolean}
             * @property created
             */
            /**
             * @ignore
             */
            created: {
                value: false
            },

            /**
             * Config listener on created.
             * @cfg {Object} listeners
             *
             * for example:
             *      @example
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
             */
            /**
             * @ignore
             */
            listeners: {
                value: {}
            },

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
             * Get xclass of current component instance.
             * @cfg {String} xclass
             */
            /**
             * @ignore
             */
            xclass: {
                valueFn: function () {
                    return Manager.getXClassByConstructor(this.constructor);
                }
            }
        }
    });

    function constructPlugins(plugins) {
        S.each(plugins, function (plugin, i) {
            if (S.isFunction(plugin)) {
                plugins[i] = new plugin();
            }
        });
    }

    function actionPlugins(self, plugins, action) {
        S.each(plugins, function (plugin) {
            if (plugin[action]) {
                plugin[action](self);
            }
        });
    }

    function create(base, extensions, px, sx) {
        var args = S.makeArray(arguments),
            baseName,
            name,
            t;

        if (S.isObject(extensions)) {
            sx = px;
            px = extensions;
            extensions = [];
        }

        baseName = name = "UIBaseDerived";

        if (typeof (t = args[args.length - 1]) == 'string') {
            name = t;
        }

        function C() {
            UIBase.apply(this, arguments);
        }

        // debug mode, give the right name for constructor
        // refer : http://limu.iteye.com/blog/1136712
        if (S.Config.debug) {
            eval("C=function " + name.replace(/[-.]/g, "_") + "(){ UIBase.apply(this, arguments);}");
            S.log("UIBase.extend : " + name);
            if (name == baseName) {
                S.log(px);
            }
        }

        S.extend(C, base, px, sx);

        if (extensions) {
            C.__ks_exts = extensions;

            var attrs = {},
                parsers = {},
                prototype = {},
                constructors = extensions['concat'](C);

            // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
            // 主类最优先
            S.each(constructors, function (ext) {
                if (ext) {
                    // 合并 ATTRS/HTML_PARSER 到主类
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

                    S.each(ext[HTML_PARSER], function (v, name) {
                        parsers[name] = v;
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
            C[HTML_PARSER] = parsers;

            S.augment(C, prototype);
        }

        return C;
    }


    S.mix(UIBase,
        {
            /**
             * Parse attribute from existing dom node.
             * @static
             * @protected
             * @property HTML_PARSER
             * @member KISSY.Component.UIBase
             *
             * for example:
             *     @example
             *     Overlay.HTML_PARSER={
             *          // el: root element of current component.
             *          "isRed":function(el){
             *              return el.hasClass("ks-red");
             *          }
             *      };
             */
            HTML_PARSER: {},

            /**
             * Create a new class which extends UIBase .
             * @param {Function[]} extensions Class constructors for extending.
             * @param {Object} px Object to be mixed into new class 's prototype.
             * @param {Object} sx Object to be mixed into new class.
             * @static
             * @return {KISSY.Component.UIBase} A new class which extends UIBase .
             */
            extend: function extend(extensions, px, sx) {
                var args = S.makeArray(arguments),
                    ret,
                    last = args[args.length - 1];

                args.unshift(this);

                if (last.xclass) {
                    args.pop();
                    args.push(last.xclass);
                }

                ret = create.apply(UIBase, args);

                if (last.xclass) {
                    Manager.setConstructorByXClass(last.xclass, {
                        constructor: ret,
                        priority: last.priority
                    });
                }

                ret.extend = extend;
                return ret;
            }
        });

    return UIBase;
}, {
    requires: ["base", "node", "../manager"]
});
/**
 * @ignore
 *
 * Refer:
 *  - http://martinfowler.com/eaaDev/uiArchs.html
 *
 * render 和 create 区别
 *  - render 包括 create ，以及把生成的节点放在 document 中
 *  - create 仅仅包括创建节点
 **/