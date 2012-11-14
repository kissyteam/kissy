/**
 * @ignore
 * @fileOverview UIBase
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('component/uibase/base', function (S, RichBase, Node, Manager, undefined) {

    var UI_SET = '_uiSet',
        SRC_NODE = 'srcNode',
        ATTRS = 'ATTRS',
        HTML_PARSER = 'HTML_PARSER',
        ucfirst = S.ucfirst,
        noop = S.noop;

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
     * init srcNode
     * @ignore
     */
    function initSrcNode(self, srcNode) {
        var c = self.constructor,
            len,
            p,
            constructorChains;

        constructorChains = collectConstructorChains(self);

        // 从父类到子类开始从 html 读取属性
        for (len = constructorChains.length - 1; len >= 0; len--) {
            c = constructorChains[len];
            if (p = c[HTML_PARSER]) {
                applyParser.call(self, srcNode, p);
            }
        }
    }

    function applyParser(srcNode, parser) {
        var self = this,
            p, v,
            userConfig = self.userConfig || {};

        // 从 parser 中，默默设置属性，不触发事件
        for (p in parser) {
            // 用户设置过那么这里不从 dom 节点取
            // 用户设置 > html parser > default value
            if (!(p in userConfig)) {
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

    /**
     * @class KISSY.Component.UIBase
     * @extends KISSY.Base
     * UIBase for class-based component.
     */
    var UIBase = RichBase.extend({

        constructor: function UIBaseConstructor() {
            var self = this, srcNode;
            UIBase.superclass.constructor.apply(self, arguments);
            // decorate may perform complex create
            if (self.decorateInternal &&
                (srcNode = self.get('srcNode'))) {
                self.decorateInternal(srcNode);
            }
            if (self.get('autoRender')) {
                self.render();
            }
        },

        initializer: function () {
            var self = this,
                id, srcNode = S.one(self.get(SRC_NODE));

            // register instance if config id
            if (id = self.get("id")) {
                Manager.addComponent(id, self);
            }

            if (srcNode) {
                // 根据 srcNode 设置属性值
                // so initializer can not read attribute in case srcNode is set
                initSrcNode(self, srcNode);

                self.setInternal(SRC_NODE, srcNode);
            }
        },

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
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('beforeCreateDom');
                self.callMethodByHierarchy("createDom", "__createDom");
                self.setInternal("created", true);

                /**
                 * @event afterCreateDom
                 * fired when root node is created
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('afterCreateDom');
                self.callPluginsMethod("createDom");
            }
            return self;
        },

        /**
         * Put dom structure of this component to document and bind event.
         */
        render: function () {
            var self = this;
            // 是否已经渲染过
            if (!self.get("rendered")) {

                self.create(undefined);

                /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeRenderUI');
                self.callMethodByHierarchy("renderUI", "__renderUI");

                /**
                 * @event afterRenderUI
                 * fired after root node is rendered into dom
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('afterRenderUI');
                self.callPluginsMethod("renderUI");

                /**
                 * @event beforeBindUI
                 * fired before component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeBindUI');
                bindUI(self);
                self.callMethodByHierarchy("bindUI", "__bindUI");

                /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('afterBindUI');
                self.callPluginsMethod("bindUI");

                /**
                 * @event beforeSyncUI
                 * fired before component 's internal state is synchronized.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeSyncUI');

                syncUI(self);
                self.callMethodByHierarchy("syncUI", "__syncUI");

                /**
                 * @event afterSyncUI
                 * fired after component 's internal state is synchronized.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('afterSyncUI');
                self.callPluginsMethod("syncUI");
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
        destructor: function () {
            var self = this,
                id;
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
             * get xclass of current component instance.
             * @property xclass
             * @type {String}
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

    // RichBase.extend
    var originalExtend = UIBase.extend;

    S.mix(UIBase, {
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
                baseClass = this,
                parsers = {},
                newClass,
                last = args[args.length - 1];

            if (last.xclass) {
                args.pop();
                args.push(last.xclass);
            }

            newClass = originalExtend.apply(baseClass, args);

            if (S.isArray(extensions)) {
                // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
                // 主类最优先
                S.each(extensions['concat'](newClass), function (ext) {
                    if (ext) {
                        // 合并 HTML_PARSER 到主类
                        S.each(ext[HTML_PARSER], function (v, name) {
                            parsers[name] = v;
                        });
                    }
                });
                newClass[HTML_PARSER] = parsers;
            }

            if (last.xclass) {
                Manager.setConstructorByXClass(last.xclass, {
                    constructor: newClass,
                    priority: last.priority
                });
            }

            newClass.extend = extend;
            return newClass;
        }
    });

    return UIBase;
}, {
    requires: ["rich-base", "node", "../manager"]
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