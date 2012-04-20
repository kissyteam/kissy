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
     * @extends UIBase.Box.Render
     */
    var Render = UIBase.create([UIBase.Box.Render], {

        /**
         * Get all css class name to be applied to the root element of this component for given state.
         * the css class names are prefixed with component name.
         * @param {String} [state] This component's state info.
         */
        getComponentCssClass:function (state) {
            var self = this, componentCls = this.__componentClasses;
            if (state) {
                return self.getCls(componentCls.split(/\s+/).join(state + " ") + state);
            } else {
                return componentCls;
            }
        },

        /**
         * Get full class name for current component
         * @param classes {String} class names without prefixCls. Separated by space.
         * @function
         * @return {String} class name with prefixCls
         */
        getCls:UIStore.getCls,

        createDom:function () {
            var self = this;
            self.get("el").addClass(self.getComponentCssClass());
        },

        /**
         * Returns the dom element which is responsible for listening keyboard events.
         */
        getKeyEventTarget:function () {
            return this.get("el");
        },

        /**
         * Return the dom element into which child component to be rendered.
         */
        getContentElement:function () {
            return this.get("contentEl") || this.get("el");
        },

        /**
         * @protected
         */
        _uiSetFocusable:function (v) {
            var el = this.getKeyEventTarget(),
                tabindex = el.attr("tabindex");
            if (tabindex >= 0 && !v) {
                el.attr("tabindex", -1);
            } else if (!(tabindex >= 0) && v) {
                el.attr("tabindex", 0);
            }
        },

        /**
         * @protected
         */
        _uiSetHighlighted:function (v) {
            var self = this,
                componentCls = self.getComponentCssClass("-hover"),
                el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](componentCls);
        },

        /**
         * @protected
         */
        _uiSetDisabled:function (v) {
            var self = this,
                componentCls = self.getComponentCssClass("-disabled"),
                el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](componentCls)
                //不能被 tab focus 到
                //support aria
                .attr({
                    "tabindex":v ? -1 : 0,
                    "aria-disabled":v
                });

        },
        /**
         * @protected
         */
        _uiSetActive:function (v) {
            var self = this,
                componentCls = self.getComponentCssClass("-active");
            self.get("el")[v ? 'addClass' : 'removeClass'](componentCls)
                .attr("aria-pressed", !!v);
        },
        /**
         * @protected
         */
        _uiSetFocused:function (v) {
            var self = this,
                el = self.get("el"),
                componentCls = self.getComponentCssClass("-focused");
            el[v ? 'addClass' : 'removeClass'](componentCls);
        }

    }, {
        ATTRS:/**
         *  screen state
         */
        {
            prefixCls:{},
            focusable:{},
            focused:{},
            active:{},
            disabled:{},
            highlighted:{}
        }
    }, "Component_Render");

    return Render;
}, {
    requires:['uibase', './uistore']
});