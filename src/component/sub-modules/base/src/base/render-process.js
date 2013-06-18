/**
 * @ignore
 * render process for component
 * @author yiminghe@gmail.com
 */
KISSY.add('component/base/render-process', function (S, RichBase) {

    var ATTRS = 'ATTRS',
        noop = S.noop;

    /**
     * @class KISSY.Component.RenderProcess
     * @extends KISSY.RichBase
     * UIBase for class-based component.
     */
    var RenderProcess = RichBase.extend({

        // change routine from rich-base for RenderProcess
        bindInternal: noop,

        // change routine from rich-base for RenderProcess
        syncInternal: noop,

        /**
         * Create dom structure of this component.
         * @chainable
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
                RenderProcess.superclass.bindInternal.call(self);
                self.callMethodByHierarchy("bindUI", "__bindUI");

                /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('afterBindUI');
                self.callPluginsMethod("bindUI");

                RenderProcess.superclass.syncInternal.call(self);
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

            /**
             * @event afterSyncUI
             * fired after component 's internal state is synchronized.
             * @param {KISSY.Event.CustomEventObject} e
             */

            self.fire('afterSyncUI');
            self.callPluginsMethod("syncUI");
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

        plug: function () {
            var self = this,
                p,
                plugins = self.get('plugins');
            RenderProcess.superclass.plug.apply(self, arguments);
            p = plugins[plugins.length - 1];
            if (self.get('rendered')) {
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

        name: 'RenderProcess',

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
                value: false
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

    return RenderProcess;
}, {
    requires: ["rich-base"]
});
/**
 * @ignore
 *
 * 2013.06.18 note:
 *  - RenderProcess 流程化渲染过程定义
 *
 * Refer:
 *  - http://martinfowler.com/eaaDev/uiArchs.html
 *
 * render 和 create 区别
 *  - render 包括 create ，以及把生成的节点放在 document 中
 *  - create 仅仅包括创建节点
 **/