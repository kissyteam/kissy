/**
 * @ignore
 * ControllerProcess for component
 * @author yiminghe@gmail.com
 */
KISSY.add('component/controller/process', function (S, CommonProcess) {

    /**
     * @class KISSY.Component.ControllerProcess
     * @extends KISSY.Component.CommonProcess
     */
    var ControllerProcess = CommonProcess.extend({

        /**
         * create dom structure of this component (delegate to render).
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
                self.callPluginsMethod("createDom");

                /**
                 * @event afterCreateDom
                 * fired when root node is created
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('afterCreateDom');

                self.setInternal("created", true);
            }
            return self;
        }

    }, {
        name: 'ControllerProcess'
    });

    return ControllerProcess;
}, {
    requires: ['./common-process']
});
/**
 * @ignore
 *
 * 2013.06.18 note:
 *  - RenderProcess/ControllerProcess 流程化渲染过程定义
 *
 * Refer:
 *  - http://martinfowler.com/eaaDev/uiArchs.html
 *
 * render 和 create 区别
 *  - render 包括 create ，以及把生成的节点放在 document 中
 *  - create 仅仅包括创建节点
 **/