/**
 * @ignore
 * mvc based component framework for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('component/base', function (S, Component, Controller, Render) {

    S.mix(Component, {
        Controller: Controller,
        'Render': Render
    });

    return Component;

}, {
    requires: [
        './base/impl',
        './base/controller',
        './base/render'
    ]
});