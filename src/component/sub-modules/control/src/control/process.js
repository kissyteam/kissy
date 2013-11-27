/**
 * @ignore
 * render process for control and render
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Base = require('base');
    var Promise = require('promise');
    var Defer = Promise.Defer,
        __getHook = Base.prototype.__getHook,
        noop = S.noop;

    /**
     * @class KISSY.Component.Process
     * @extends KISSY.Base
     */
    var ComponentProcess = Base.extend({
        bindInternal: noop,

        syncInternal: noop,

        initializer: function () {
            this._renderedDefer = new Defer();
        },

        renderUI: noop,

        syncUI: noop,

        bindUI: noop,

        onRendered: function (fn) {
            return this._renderedDefer.promise.then(fn);
        },

        /**
         * create dom structure of this component
         * (control will delegate to render).
         * @chainable
         */
        create: function () {
            var self = this;
            if (!self.get('created')) {
                /**
                 * @event beforeCreateDom
                 * fired before root node is created
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                self.fire('beforeCreateDom');
                self.createInternal();
                self.__callPluginsMethod('pluginCreateDom');
                /**
                 * @event afterCreateDom
                 * fired when root node is created
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                self.fire('afterCreateDom');

                self.setInternal('created', true);
            }
            return self;
        },

        createInternal: function () {
            this.createDom();
        },

        /**
         * Put dom structure of this component to document, bind event and sync attribute.
         * @chainable
         */
        render: function () {
            var self = this;
            // 是否已经渲染过
            if (!self.get('rendered')) {
                self.create();

                /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */

                self.fire('beforeRenderUI');
                self.renderUI();
                self.__callPluginsMethod('pluginRenderUI');

                /**
                 * @event afterRenderUI
                 * fired after root node is rendered into dom
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                self.fire('afterRenderUI');

                /**
                 * @event beforeBindUI
                 * fired before component 's internal event is bind.
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */

                self.fire('beforeBindUI');
                ComponentProcess.superclass.bindInternal.call(self);
                self.bindUI();
                self.__callPluginsMethod('pluginBindUI');
                /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                self.fire('afterBindUI');

                ComponentProcess.superclass.syncInternal.call(self);
                syncUIs(self);

                self.setInternal('rendered', true);
            }
            return self;
        },

        /**
         * sync attribute value
         */
        sync: function () {
            syncUIs(this);
        },

        plug: function (plugin) {
            var self = this,
                p,
                plugins = self.get('plugins');
            self.callSuper(plugin);
            p = plugins[plugins.length - 1];
            if (self.get('rendered')) {
                // plugin does not support decorate
                if (p.pluginCreateDom) {
                    p.pluginCreateDom(self);
                }
                if (p.pluginRenderUI) {
                    p.pluginCreateDom(self);
                }
                if (p.pluginBindUI) {
                    p.pluginBindUI(self);
                }
                if (p.pluginSyncUI) {
                    p.pluginSyncUI(self);
                }
            } else if (self.get('created')) {
                if (p.pluginCreateDom) {
                    p.pluginCreateDom(self);
                }
            }
            return self;
        }

    }, {
        __hooks__: {
            createDom: __getHook('__createDom'),
            renderUI: __getHook('__renderUI'),
            bindUI: __getHook('__bindUI'),
            syncUI: __getHook('__syncUI')
        },

        name: 'ComponentProcess',

        ATTRS: {
            /**
             * Whether this component is rendered.
             * @type {Boolean}
             * @property rendered
             * @readonly
             */
            /**
             * @ignore
             */
            rendered: {
                value: false,
                setter: function (v) {
                    if (v) {
                        this._renderedDefer.resolve(this);
                    }
                }
            },
            /**
             * Whether this component 's dom structure is created.
             * @type {Boolean}
             * @property created
             * @readonly
             */
            /**
             * @ignore
             */
            created: {
                value: false
            }
        }
    });

    function syncUIs(self) {
        /**
         * @event beforeSyncUI
         * fired before component 's internal state is synchronized.
         * @param {KISSY.Event.CustomEvent.Object} e
         */
        self.fire('beforeSyncUI');
        self.syncUI();
        self.__callPluginsMethod('pluginSyncUI');
        /**
         * @event afterSyncUI
         * fired after component 's internal state is synchronized.
         * @param {KISSY.Event.CustomEvent.Object} e
         */
        self.fire('afterSyncUI');
    }

    return ComponentProcess;
});
/**
 * @ignore
 *
 * 2013.06.18 note:
 *  - ComponentProcess 流程化渲染过程定义
 *
 * Refer:
 *  - http://martinfowler.com/eaaDev/uiArchs.html
 *
 * render 和 create 区别
 *  - render 包括 create ，以及把生成的节点放在 document 中
 *  - create 仅仅包括创建节点
 **/