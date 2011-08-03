/**
 * mvc based component framework for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component", function(S, ModelControl, Render, Container, UIStore, DelegateChildren, DecorateChildren, DecorateChild) {
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