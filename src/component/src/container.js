/**
 * @fileOverview container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/container", function (S, Controller, DelegateChildren, DecorateChildren) {
    /**
     * Container class. Extend it to acquire the abilities of
     * delegating events and
     * decorate from pre-rendered dom
     * for child components.
     * @name Container
     * @constructor
     * @extends Component.Controller
     * @memberOf Component
     */
    return Controller.extend([DelegateChildren, DecorateChildren],
        /**
         * @lends Component.Container
         */
        {

            /**
             * Generate child component from root element.
             * @protected
             * @function
             * @name decorateInternal
             * @memberOf Component.Container#
             * @param {NodeList} element Root element of current component.
             */

            /**
             * Get child component which contains current event target node.             *
             * @protected
             * @name getOwnerControl
             * @function
             * @memberOf Component.Container#
             * @param {HTMLElement} target Current event target node.
             */
        });

}, {
    requires:['./controller', './delegateChildren', './decorateChildren']
});