/**
 * mvc based component framework for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component",
    /**
     *
     * @param KISSY
     * @param ModelControl
     * @param Render
     * @param Container
     * @param UIStore
     * @param DelegateChildren  @link Component.DelegateChildren
     * @param DecorateChildren
     * @param DecorateChild
     */
    function(KISSY, ModelControl, Render, Container, UIStore, DelegateChildren, DecorateChildren, DecorateChild) {

    /**
     * @name Component
     * @namespace
     */
    return {
        ModelControl:ModelControl,
        Render:Render,
        Container:Container,
        UIStore:UIStore,
        DelegateChildren:DelegateChildren,
        DecorateChild:DecorateChild,
        DecorateChildren:DecorateChildren
    };
}, {
    requires:['component/modelcontrol',
        'component/render',
        'component/container',
        'component/uistore',
        'component/delegatechildren',
        'component/decoratechildren',
        'component/decoratechild']
});