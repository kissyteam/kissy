/**
 * @ignore
 * mvc based component framework for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('component/base', function (S, createComponent, Controller, Render, Manager) {

    /**
     * @class KISSY.Component
     * @singleton
     * Component infrastructure.
     */
    return {
        create: createComponent,
        Manager: Manager,
        Controller: Controller,
        'Render': Render
    };

}, {
    requires: [
        './base/create',
        './base/controller',
        './base/render',
        './base/manager'
    ]
});