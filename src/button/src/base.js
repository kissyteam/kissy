/**
 * @ignore
 *  Button control for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add("button/base", function (S, Event, Component, ButtonRender) {

    var KeyCodes = Event.KeyCodes;
    /**
     * KISSY Button.
     * @extends KISSY.Component.Controller
     * @class KISSY.Button
     */
    var Button = Component.Controller.extend({

        bindUI: function () {
            this.get("el").on("keyup", this.handleKeyEventInternal, this);
        },

        handleKeyEventInternal: function (e) {
            if (e.keyCode == KeyCodes.ENTER &&
                e.type == "keydown" ||
                e.keyCode == KeyCodes.SPACE &&
                    e.type == "keyup") {
                return this.performActionInternal(e);
            }
            // Return true for space keypress (even though the event is handled on keyup)
            // as preventDefault needs to be called up keypress to take effect in IE and
            // WebKit.
            return e.keyCode == KeyCodes.SPACE;
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
        xclass: 'button',
        priority: 10
    });

    return Button;

}, {
    requires: ['event', 'component/base', './buttonRender']
});