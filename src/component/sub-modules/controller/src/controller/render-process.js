/**
 * @ignore
 * render process for component
 * @author yiminghe@gmail.com
 */
KISSY.add('component/controller/render-process', function (S, RichBase) {

    var ATTRS = 'ATTRS',
        noop = S.noop;

    /**
     * @class KISSY.Component.RenderProcess
     * @extends KISSY.RichBase
     */
    var RenderProcess = RichBase.extend({

        bindInternal: noop,

        syncInternal: noop,

        /**
         * Create dom structure of this component.
         * @chainable
         */
        create: function () {
            var self = this;
            if (!self.get("created")) {
                self.callMethodByHierarchy("beforeCreateDom",
                    "__beforeCreateDom",
                    [self.renderData = {},self.childrenElSelectors={}]);
                self.callMethodByHierarchy("createDom", "__createDom");
                self.setInternal("created", true);
            }
            return self;
        },

        decorate: function (srcNode) {
            var self = this;
            if (!self.get("created")) {
                self.callMethodByHierarchy("decorateDom", "__decorateDom",
                    [srcNode]);
                self.setInternal("created", true);
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
                self.callMethodByHierarchy("renderUI", "__renderUI");
                self.callMethodByHierarchy("bindUI", "__bindUI");
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
            self.callMethodByHierarchy("syncUI", "__syncUI");
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