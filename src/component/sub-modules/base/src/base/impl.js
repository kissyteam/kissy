/**
 * @ignore
 * Setup component namespace.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base/impl", function (S, UIBase, Manager) {
    /**
     * @class KISSY.Component
     * @singleton
     * Component infrastructure.
     */
    var Component = {
        Manager: Manager,
        UIBase: UIBase
    };

    /**
     * Create a component instance using json with xclass.
     * @param {Object} component Component's json notation with xclass attribute.
     * @param {String} component.xclass Component to be newed 's xclass.
     * @param {KISSY.Component.Controller} self Component From which new component generated will inherit prefixCls
     * if component 's prefixCls is undefined.
     * @member KISSY.Component
     *
     *  for example:
     *
     *      create({
     *          xclass:'menu',
     *          children:[{
     *              xclass:'menuitem',
     *              content:"1"
     *          }]
     *      })
     */
    Component.create = function (component, parent) {
        var childConstructor,
            xclass;
        if (component) {
            if (!component.isController && parent) {
                S.mix(component, parent.get('defaultChildCfg'), false);
                if (!component.xclass && component.prefixXClass) {
                    component.xclass = component.prefixXClass;
                    if (component.xtype) {
                        component.xclass += '-' + component.xtype;
                    }
                }
            }
            if (!component.isController && (xclass = component.xclass)) {
                childConstructor = Manager.getConstructorByXClass(xclass);
                if (!childConstructor) {
                    S.error("can not find class by xclass desc : " + xclass);
                }
                component = new childConstructor(component);
            }
            if (component.isController && parent) {
                component.setInternal('parent', parent);
            }
        }
        return component;
    };

    return Component;
}, {
    requires: ['./uibase', './manager']
});