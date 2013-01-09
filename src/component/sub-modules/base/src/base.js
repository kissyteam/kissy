/**
 * @ignore
 * mvc based component framework for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('component/base', function (S, Component, Controller, Render, Container, DelegateChildren, DecorateChildren, DecorateChild) {

    S.mix(Component, {
        Controller: Controller,
        'Render': Render,
        'Container': Container,
        'DelegateChildren': DelegateChildren,
        'DecorateChild': DecorateChild,
        'DecorateChildren': DecorateChildren
    });

    return Component;

}, {
    requires: [
        './base/impl',
        './base/controller',
        './base/render',
        './base/container',
        './base/delegate-children',
        './base/decorate-children',
        './base/decorate-child'
    ]
});