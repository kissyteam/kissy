/**
 * Setup component namespace.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base", function (S, UIBase, Manager) {
    /**
     * @name Component
     * @namespace
     * Component infrastructure.
     */
    var Component = {
        Manager:Manager,
        UIBase:UIBase
    };

    /**
     * Create a component instance using json with xclass.
     * @param {Object} component Component's json notation with xclass attribute.
     * @param {String} component.xclass Component to be newed 's xclass.
     * @param {Controller} self Component From which new component generated will inherit prefixCls
     * if component 's prefixCls is undefined.
     * @memberOf Component
     * @example
     * <code>
     *  create({
     *     xclass:'menu',
     *     children:[{
     *        xclass:'menuitem',
     *        content:"1"
     *     }]
     *  })
     * </code>
     */
    function create(component, self) {
        var childConstructor, xclass;
        if (component && (xclass = component.xclass)) {
            if (self && !component.prefixCls) {
                component.prefixCls = self.get("prefixCls");
            }
            childConstructor = Manager.getConstructorByXClass(xclass);
            component = new childConstructor(component);
        }
        return component;
    }

    Component.create = create;

    return Component;
}, {
    requires:['./uibase', './manager']
});