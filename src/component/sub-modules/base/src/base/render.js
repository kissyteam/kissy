/**
 * @ignore
 * render base class for kissy
 * @author yiminghe@gmail.com
 * refer: http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/base/render", function (S, BoxRender, Component, UIBase) {

    var trim = S.trim, Render;

    function normalExtras(extras) {
        if (!extras) {
            extras = [''];
        }
        if (typeof extras == "string") {
            extras = extras.split(/\s+/);
        }
        return extras;
    }

    function prefixExtra(prefixCls, componentCls, extras) {
        var cls = '',
            i = 0,
            l = extras.length,
            e,
            prefix = prefixCls + componentCls;
        for (; i < l; i++) {
            e = extras[i];
            e = e ? ('-' + e) : e;
            cls += ' ' + prefix + e;
        }
        return cls;
    }

    /**
     * @ignore
     * Base Render class for KISSY Component.
     */
    return Render = UIBase.extend([BoxRender], {

        initializer: function () {
            var self = this;
            var attrs = self.get('elAttrs');
            var cls = self.get('elCls');
            var disabled;
            if (disabled = self.get('disabled')) {
                cls.push(self.getBaseCssClasses('disabled'));
                attrs['aria-disabled'] = 'true';
            }
            if (self.get('highlighted')) {
                cls.push(self.getBaseCssClasses('hover'));
            }
            if (self.get('focusable')) {
                attrs['hideFocus'] = 'true';
                attrs['tabindex'] = disabled ? '-1' : '0';
            }
        },

        isRender: 1,

        /**
         * Get all css class name to be applied to the root element of this component for given extra class names.
         * the css class names are prefixed with component name.
         * @param extras {String[]|String} class names without prefixCls and current component class name.
         * @protected
         */
        getBaseCssClasses: function (extras) {
            return Render.getBaseCssClasses(this, extras);
        },

        /**
         * Get full class name (with prefix) for current component
         * @param extras {String[]|String} class names without prefixCls and current component class name.
         * @method
         * @return {String} class name with prefixCls and current component class name.
         * @protected
         */
        getBaseCssClass: function (extras) {
            return Render.getBaseCssClass(this, extras);
        },

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
                componentCls = self.getBaseCssClasses("hover"),
                el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](componentCls);
        },

        /**
         * @ignore
         */
        _onSetDisabled: function (v) {
            var self = this,
                componentCls = self.getBaseCssClasses("disabled"),
                el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](componentCls)
                .attr("aria-disabled", v);
            if (self.get("focusable")) {
                //不能被 tab focus 到
                self.getKeyEventTarget().attr("tabindex", v ? -1 : 0);
            }
        },
        /**
         * @ignore
         */
        '_onSetActive': function (v) {
            var self = this,
                componentCls = self.getBaseCssClasses("active");
            self.get("el")[v ? 'addClass' : 'removeClass'](componentCls)
                .attr("aria-pressed", !!v);
        },
        /**
         * @ignore
         */
        _onSetFocused: function (v) {
            var self = this,
                el = self.get("el"),
                componentCls = self.getBaseCssClasses("focused");
            el[v ? 'addClass' : 'removeClass'](componentCls);
        },

        /**
         * Return the dom element into which child component to be rendered.
         * @return {KISSY.NodeList}
         * @ignore
         */
        getChildrenContainerEl: function () {
            return this.get("el");
        }

    }, {

        getBaseCssClasses: function (component, extras) {
            extras = normalExtras(extras);
            var componentCssClasses = component.componentCssClasses,
                i = 0,
                cls = '',
                l = componentCssClasses.length,
                prefixCls = component.prefixCls;
            for (; i < l; i++) {
                cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
            }
            return trim(cls);
        },

        getBaseCssClass: function (component, extras) {
            return trim(
                prefixExtra(
                    component.prefixCls,
                    component.componentCssClasses[0],
                    normalExtras(extras)
                ));
        },

        //  screen state
        ATTRS: {
            prefixCls: {
                setter: function (v) {
                    // shortcut
                    this.prefixCls = v;
                }
            },

            componentCssClasses: {
                setter: function (v) {
                    this.componentCssClasses = v;
                }
            },

            focusable: {},

            focused: {
                sync: 0
            },

            active: {
                sync: 0
            },

            disabled: {
                sync: 0
            },

            highlighted: {
                sync: 0
            }
        },
        HTML_PARSER: {
            disabled: function (el) {
                return el.hasClass(this.getBaseCssClass("disabled"));
            }
        }
    });
}, {
    requires: ['./box-render', './impl', './uibase']
});