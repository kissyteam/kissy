/**
 * @fileOverview mvc based component framework for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component", function (KISSY, UIBase, Controller, Render, Container, UIStore, DelegateChildren, DecorateChildren, DecorateChild) {
    /**
     * @name Component
     * @namespace
     */
    var Component = {
        UIBase:UIBase,
        Controller:Controller,
        "Render":Render,
        "Container":Container,
        "UIStore":UIStore,
        "DelegateChildren":DelegateChildren,
        "DecorateChild":DecorateChild,
        "DecorateChildren":DecorateChildren
    };
    /**
     * Shortcut for {@link Component.UIBase.create}.
     * @function
     */
    Component.define = UIBase.create;
    return Component;
}, {
    requires:[
        'component/uibase',
        'component/controller',
        'component/render',
        'component/container',
        'component/uistore',
        'component/delegateChildren',
        'component/decorateChildren',
        'component/decorateChild']
});