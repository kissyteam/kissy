/**
 * @fileOverview container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/container", function (S, UIBase, Controller, UIStore, DelegateChildren, DecorateChildren) {
    /**
     * Container class. extend it to acquire the abilities of
     * delegating events and
     * decorate from pre-rendered dom
     * for child components.
     * @name Container
     * @constructor
     * @extends Component.Controller
     * @memberOf Component
     */
    return UIBase.create(Controller, [DelegateChildren, DecorateChildren],
        /**
         * @lends Component.Container
         */
        {

            /**
             * Generate child component from root element.
             * @name decorateInternal
             * @protected
             * @function
             * @param {Node} element Root element of current component.
             */


            /**
             * Get child component which contains current event target node.
             * @name getOwnerControl
             * @protected
             * @function
             * @param {HTMLElement} target Current event target node.
             */
        });

}, {
    requires:['uibase', './controller', './uistore', './delegateChildren', './decorateChildren']
});