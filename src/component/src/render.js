/**
 * @fileOverview render base class for kissy
 * @author yiminghe@gmail.com
 * @see http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/render", function (S, UIBase, UIStore) {

    /**
     * Base Render class for KISSY Component.
     * @class
     * @memberOf Component
     * @name Render
     * @extends UIBase
     */
    return UIBase.create([UIBase.Box.Render],
        /**
         * @lends Component.Render#
         */
        {

            /**
             * Get all css class name to be applied to the root element of this component for given state.
             * the css class names are prefixed with component name.
             * @param {String} [state] This component's state info.
             */
            getComponentCssClassWithState:function (state) {
                var self = this,
                    componentCls = this.__componentClasses;
                state = state || "";
                return self.getCssClassWithPrefix(componentCls.split(/\s+/).join(state + " ") + state);
            },

            /**
             * Get full class name (with prefix) for current component
             * @param classes {String} class names without prefixCls. Separated by space.
             * @function
             * @return {String} class name with prefixCls
             * @private
             */
            getCssClassWithPrefix:UIStore.getCssClassWithPrefix,

            createDom:function () {
                var self = this;
                self.get("el").addClass(self.getComponentCssClassWithState());
            },

            /**
             * Returns the dom element which is responsible for listening keyboard events.
             * @return {Node}
             */
            getKeyEventTarget:function () {
                return this.get("el");
            },

            /**
             * Return the dom element into which child component to be rendered.
             * @return {Node}
             */
            getContentElement:function () {
                var self = this;
                return self.get("contentEl") || self.get("el");
            },

            /**
             * @protected
             */
            _uiSetHighlighted:function (v) {
                var self = this,
                    componentCls = self.getComponentCssClassWithState("-hover"),
                    el = self.get("el");
                el[v ? 'addClass' : 'removeClass'](componentCls);
            },

            /**
             * @protected
             */
            _uiSetDisabled:function (v) {
                var self = this,
                    componentCls = self.getComponentCssClassWithState("-disabled"),
                    el = self.get("el");
                el[v ? 'addClass' : 'removeClass'](componentCls)
                    .attr("aria-disabled", v);
                if (self.get("focusable")) {
                    //不能被 tab focus 到
                    self.getKeyEventTarget().attr("tabIndex", v ? -1 : 0);
                }
            },
            /**
             * @protected
             */
            _uiSetActive:function (v) {
                var self = this,
                    componentCls = self.getComponentCssClassWithState("-active");
                self.get("el")[v ? 'addClass' : 'removeClass'](componentCls)
                    .attr("aria-pressed", !!v);
            },
            /**
             * @protected
             */
            _uiSetFocused:function (v) {
                var self = this,
                    el = self.get("el"),
                    componentCls = self.getComponentCssClassWithState("-focused");
                el[v ? 'addClass' : 'removeClass'](componentCls);
            }

        }, {//  screen state
            ATTRS:/**
             * @lends Component.Render#
             */
            {
                /**
                 * see {@link Component.Controller#prefixCls}
                 */
                prefixCls:{},
                /**
                 * see {@link Component.Controller#focusable}
                 */
                focusable:{},
                /**
                 * see {@link Component.Controller#focused}
                 */
                focused:{},
                /**
                 * see {@link Component.Controller#active}
                 */
                active:{},
                /**
                 * see {@link Component.Controller#disabled}
                 */
                disabled:{},
                /**
                 * see {@link Component.Controller#highlighted}
                 */
                highlighted:{}
            }
        }, "Component_Render");
}, {
    requires:['uibase', './uistore']
});