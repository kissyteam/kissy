/**
 * @ignore
 * render process for component
 * @author yiminghe@gmail.com
 */
KISSY.add('component/control/render-process', function (S, CommonProcess) {

    /**
     * @class KISSY.Component.RenderProcess
     * @extends KISSY.Component.CommonProcess
     */
    var RenderProcess = CommonProcess.extend({

        /**
         * Create dom structure of this component.
         * @chainable
         */
        create: function () {
            var self = this;
            if (!self.get("created")) {
                self.callMethodByHierarchy("beforeCreateDom",
                    "__beforeCreateDom",
                    [self.renderData = {}, self.childrenElSelectors = {}]);
                self.callMethodByHierarchy("createDom", "__createDom");
                self.callPluginsMethod("createDom");
                self.setInternal("created", true);
            }
            return self;
        },

        /**
         * decorate from existing dom structure
         * @param srcNode
         * @returns {*}
         */
        decorate: function (srcNode) {
            var self = this;
            if (!self.get("created")) {
                self.callMethodByHierarchy("decorateDom", "__decorateDom",
                    [srcNode]);
                self.callPluginsMethod("createDom");
                self.setInternal("created", true);
            }
            return self;
        }
    }, {
        name: 'RenderProcess'
    });

    return RenderProcess;
}, {
    requires: ['./common-process']
});