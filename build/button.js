/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 14 18:36
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 button/render
 button
*/

/**
 * @ignore
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/render", function (S, Control) {
    // http://www.w3.org/TR/wai-aria-practices/
    return Control.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            var self = this;
            S.mix(renderData.elAttrs, {
                role: 'button',
                title: renderData.tooltip,
                'aria-describedby': renderData.describedby
            });
            if (renderData.checked) {
                renderData.elCls.push(self.getBaseCssClasses("checked"));
            }
        },
        _onSetChecked: function (v) {
            var self = this,
                cls = self.getBaseCssClasses("checked");
            self.$el[v ? 'addClass' : 'removeClass'](cls);
        },
        '_onSetTooltip': function (title) {
            this.el.setAttribute("title", title);
        },
        '_onSetDescribedby': function (describedby) {
            this.el.setAttribute("aria-describedby", describedby);
        }
    }, {
        name: 'ButtonRender'
    });
}, {
    requires: ['component/control']
});
/**
 * @ignore
 * Button control for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add("button", function (S, Node, Control, ButtonRender) {

    var KeyCode = Node.KeyCode;
    /**
     * KISSY Button.
     * @extends KISSY.Component.Control
     * @class KISSY.Button
     */
    return Control.extend({

        isButton: 1,

        bindUI: function () {
            this.$el.on("keyup", this.handleKeyDownInternal, this);
        },

        handleKeyDownInternal: function (e) {
            if (e.keyCode == KeyCode.ENTER &&
                e.type == "keydown" ||
                e.keyCode == KeyCode.SPACE &&
                    e.type == "keyup") {
                return this.handleClickInternal(e);
            }
            // Return true for space keypress (even though the event is handled on keyup)
            // as preventDefault needs to be called up keypress to take effect in IE and
            // WebKit.
            return e.keyCode == KeyCode.SPACE;
        },

        handleClickInternal: function () {
            var self = this;
            if (self.get("checkable")) {
                self.set("checked", !self.get("checked"));
            }
            // button 的默认行为就是触发 click
            self.fire("click");
        }
    }, {
        ATTRS: {
            /**
             * Value associated with button component.
             * @property value
             */
            /**
             * Value associated with button component.
             * @cfg {*} value
             */
            /**
             * @ignore
             */
            value: {},
            /**
             *Aria-describedby attribute.
             * @property describedby
             * @type {String}
             */
            /**
             *Aria-describedby attribute.
             * @cfg {String} describedby
             */
            /**
             * @ignore
             */
            describedby: {
                value: '',
                view: 1
            },
            /**
             * Tooltip for button.
             * @cfg {String} tooltip
             */
            /**
             * Tooltip for button.
             * @property tooltip
             * @type {String}
             */
            /**
             * @ignore
             */
            tooltip: {
                value: '',
                view: 1
            },

            /**
             * Whether button can be checkable(toggle).
             * Defaults to: false.
             * @cfg {Boolean} checkable
             */
            /**
             * @ignore
             */
            checkable: {
            },

            /**
             * Whether button is checked(toggle).
             * Defaults to: false.
             * @type {Boolean}
             * @property checked
             */
            /**
             * Whether button is checked(toggle).
             * @cfg {Boolean} checked
             */
            /**
             * @ignore
             */
            checked: {
                value:false,
                view: 1
            },

            xrender: {
                value: ButtonRender
            }
        },
        xclass: 'button'
    });

}, {
    requires: ['node', 'component/control', 'button/render']
});

