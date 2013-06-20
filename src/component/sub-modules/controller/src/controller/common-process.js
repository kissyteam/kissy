/**
 * @ignore
 * common process for controller and render
 * @author yiminghe@gmail.com
 */
KISSY.add('component/controller/common-process', function (S, RichBase, Promise) {

    var Defer = Promise.Defer,
        noop = S.noop;

    /**
     * @class KISSY.Component.CommonProcess
     * @extends KISSY.RichBase
     */
    var CommonProcess = RichBase.extend({

        bindInternal: noop,

        syncInternal: noop,

        initializer: function () {
            this._createdDefer = new Defer();
            this._renderedDefer = new Defer();
        },

        'onCreated': function (fn) {
            this._createdDefer.promise.then(fn);
        },

        onRendered: function (fn) {
            this._renderedDefer.promise.then(fn);
        },

        /**
         * Put dom structure of this component to document, bind event and sync attribute.
         * @chainable
         */
        render: function () {
            var self = this;
            // 是否已经渲染过
            if (!self.get("rendered")) {

                self.create();

                /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeRenderUI');
                self.callMethodByHierarchy("renderUI", "__renderUI");
                self.callPluginsMethod("renderUI");

                /**
                 * @event afterRenderUI
                 * fired after root node is rendered into dom
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('afterRenderUI');

                /**
                 * @event beforeBindUI
                 * fired before component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeBindUI');
                CommonProcess.superclass.bindInternal.call(self);
                self.callMethodByHierarchy("bindUI", "__bindUI");
                self.callPluginsMethod("bindUI");

                /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('afterBindUI');

                CommonProcess.superclass.syncInternal.call(self);
                self.sync();

                self.setInternal("rendered", true);
            }
            return self;
        },

        /**
         * sync attribute value
         */
        sync: function () {
            var self = this;
            /**
             * @event beforeSyncUI
             * fired before component 's internal state is synchronized.
             * @param {KISSY.Event.CustomEventObject} e
             */

            self.fire('beforeSyncUI');
            self.callMethodByHierarchy("syncUI", "__syncUI");
            self.callPluginsMethod("syncUI");

            /**
             * @event afterSyncUI
             * fired after component 's internal state is synchronized.
             * @param {KISSY.Event.CustomEventObject} e
             */
            self.fire('afterSyncUI');
        },

        plug: function () {
            var self = this,
                p,
                plugins = self.get('plugins');
            CommonProcess.superclass.plug.apply(self, arguments);
            p = plugins[plugins.length - 1];
            if (self.get('rendered')) {
                // plugin does not support decorate
                p.pluginCreateDom && p.pluginCreateDom(self);
                p.pluginRenderUI && p.pluginRenderUI(self);
                p.pluginBindUI && p.pluginBindUI(self);
                p.pluginSyncUI && p.pluginSyncUI(self);
            } else if (self.get('created')) {
                p.pluginCreateDom && p.pluginCreateDom(self);
            }
            return self;
        }

    }, {

        name: 'CommonProcess',

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
                value: false,
                setter: function (v) {
                    if (v) {
                        this._createdDefer.resolve(this);
                    }
                }
            }
        }
    });

    return CommonProcess;
}, {
    requires: ['rich-base', 'promise']
});