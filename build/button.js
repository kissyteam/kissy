/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 7 13:42
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 button/render
 button/base
 button
*/

/**
 * @ignore
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/render", function (S, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return Component.Render.extend({
        initializer: function () {
            // set wai-aria role
            var attrs = this.get('elAttrs');
            var renderData = this.get('renderData');
            S.mix(attrs, {
                role: 'button',
                title: renderData.tooltip,
                'aria-describedby': renderData.describedby
            });
            if (renderData.checked) {
                this.get('elCls').push(self.getBaseCssClasses("checked"));
            }
        },
        _onSetChecked: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getBaseCssClasses("checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        },
        '_onSetTooltip': function (title) {
            this.get("el").attr("title", title);
        },
        '_onSetDescribedby': function (describedby) {
            this.get("el").attr("aria-describedby", describedby);
        }
    }, {
        ATTRS: {
            describedby: {
                sync: 0
            },
            tooltip: {
                sync: 0
            },
            checked: {
                sync: 0
            }
        }
    });
}, {
    requires: ['component/base']
});
/**
 * @ignore
 * Button control for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add("button/base", function (S, Node, Component, ButtonRender) {

    var KeyCode = Node.KeyCode;
    /**
     * KISSY Button.
     * @extends KISSY.Component.Controller
     * @class KISSY.Button
     */
    var Button = Component.Controller.extend({

        isButton: 1,

        bindUI: function () {
            this.get("el").on("keyup", this.handleKeyEventInternal, this);
        },

        handleKeyEventInternal: function (e) {
            if (e.keyCode == KeyCode.ENTER &&
                e.type == "keydown" ||
                e.keyCode == KeyCode.SPACE &&
                    e.type == "keyup") {
                return this.performActionInternal(e);
            }
            // Return true for space keypress (even though the event is handled on keyup)
            // as preventDefault needs to be called up keypress to take effect in IE and
            // WebKit.
            return e.keyCode == KeyCode.SPACE;
        },

        performActionInternal: function () {
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
                view: 1
            },

            xrender: {
                value: ButtonRender
            }
        }
    }, {
        xclass: 'button'
    });

    return Button;

}, {
    requires: ['node', 'component/base', './render']
});
/**
 * @ignore
 * simulated button for kissy , inspired by goog button
 * @author yiminghe@gmail.com
 */
KISSY.add("button", function (S, Button, Render) {
    Button.Render = Render;
    return Button;
}, {
    requires:[
        'button/base',
        'button/render'
    ]
});

