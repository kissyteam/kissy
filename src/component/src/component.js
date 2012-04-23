/**
 * @fileOverview mvc based component framework for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component", function (KISSY, Controller, Render, Container, UIStore, DelegateChildren, DecorateChildren, DecorateChild) {
    /**
     * @name Component
     * @namespace
     */
    var Component = {
        "Controller":Controller,
        "Render":Render,
        "Container":Container,
        "UIStore":UIStore,
        "DelegateChildren":DelegateChildren,
        "DecorateChild":DecorateChild,
        "DecorateChildren":DecorateChildren
    };
    return Component;
}, {
    requires:['component/controller',
        'component/render',
        'component/container',
        'component/uistore',
        'component/delegateChildren',
        'component/decorateChildren',
        'component/decorateChild']
});