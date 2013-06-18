/**
 * @ignore
 * Setup component namespace.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base/create", function (S,Manager) {
   

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
    return function (component, parent) {
        var ChildConstructor,
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
                ChildConstructor = Manager.getConstructorByXClass(xclass);
                if (!ChildConstructor) {
                    S.error("can not find class by xclass desc : " + xclass);
                }
                component = new ChildConstructor(component);
            }
            if (component.isController && parent) {
                component.setInternal('parent', parent);
            }
        }
        return component;
    };
},{
    requires:['./manager']
});