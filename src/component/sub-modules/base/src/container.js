/**
 * @ignore
 * container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base/container", function (S, Controller, DelegateChildren, DecorateChildren) {
    /**
     * @extends KISSY.Component.Controller
     * @class KISSY.Component.Container
     * Container class. Extend it to acquire the abilities of
     * delegating events and decorate from pre-rendered dom
     * for child components.
     */
    return Controller.extend([DelegateChildren, DecorateChildren]);

}, {
    requires: ['./controller', './delegate-children', './decorate-children']
});

/**
 * @ignore
 * TODO
 *  - handleMouseEvents false for container ?
 */