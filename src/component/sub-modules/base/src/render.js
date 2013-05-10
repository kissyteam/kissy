/**
 * @ignore
 * render base class for kissy
 * @author yiminghe@gmail.com
 * refer: http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/base/render", function (S, BoxRender, Component, UIBase, Manager,TplRender) {

    /**
     * @ignore
     * Base Render class for KISSY Component.
     */
    return UIBase.extend([BoxRender,TplRender], {

        isRender: 1,

        /**
         * Get all css class name to be applied to the root element of this component for given state.
         * the css class names are prefixed with component name.
         * @param {String} [state] This component's state info.
         * @ignore
         */
        getCssClassWithState: function (state) {
            var self = this,
                componentCls = self.get("ksComponentCss");
            if (!componentCls) {
                return '';
            }
            state = state || "";
            if (state) {
                state = "-" + state;
            }
            return self.getCssClassWithPrefix(componentCls.join(state + " ") + state);
        },

        /**
         * Get full class name (with prefix) for current component
         * @param classes {String} class names without prefixCls. Separated by space.
         * @method
         * @return {String} class name with prefixCls
         * @ignore
         */
        getCssClassWithPrefix: Manager.getCssClassWithPrefix,

        /**
         * Returns the dom element which is responsible for listening keyboard events.
         * @return {KISSY.NodeList}
         * @ignore
         */
        getKeyEventTarget: function () {
            return this.get("el");
        },

        /**
         * @ignore
         */
        _onSetHighlighted: function (v) {
            var self = this,
                componentCls = self.getCssClassWithState("hover"),
                el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](componentCls);
        },

        /**
         * @ignore
         */
        _onSetDisabled: function (v) {
            var self = this,
                componentCls = self.getCssClassWithState("disabled"),
                el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](componentCls)
                .attr("aria-disabled", v);
            if (self.get("focusable")) {
                //不能被 tab focus 到
                self.getKeyEventTarget().attr("tabIndex", v ? -1 : 0);
            }
        },
        /**
         * @ignore
         */
        '_onSetActive': function (v) {
            var self = this,
                componentCls = self.getCssClassWithState("active");
            self.get("el")[v ? 'addClass' : 'removeClass'](componentCls)
                .attr("aria-pressed", !!v);
        },
        /**
         * @ignore
         */
        _onSetFocused: function (v) {
            var self = this,
                el = self.get("el"),
                componentCls = self.getCssClassWithState("focused");
            el[v ? 'addClass' : 'removeClass'](componentCls);
        },

        /**
         * Return the dom element into which child component to be rendered.
         * @return {KISSY.NodeList}
         * @ignore
         */
        getContentElement: function () {
            return this.get("contentEl") || this.get("el");
        }

    }, {//  screen state
        ATTRS: {

            prefixCls: {},

            focusable: {},

            focused: {},

            active: {},

            disabled: {},

            highlighted: {}
        },
        HTML_PARSER: {
            disabled: function (el) {
                var self = this,
                    componentCls = self.getCssClassWithState("disabled");
                return self.get("el").hasClass(componentCls);
            }
        }
    });
}, {
    requires: ['./box-render', './impl', './uibase', './manager','./tpl-render']
});