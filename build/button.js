/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 00:25
*/
/**
 * @fileOverview Button control for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add("button/base", function (S, Event, Component, ButtonRender) {

    var KeyCodes = Event.KeyCodes;
    /**
     * @name Button
     * @constructor
     * @extends Component.Controller
     */
    var Button = Component.Controller.extend(
        /**@lends Button.prototype */
        {
            bindUI:function () {
                this.get("el").on("keyup", this.handleKeyEventInternal, this);
            },

            handleKeyEventInternal:function (e) {
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

            performActionInternal:function () {
                var self = this;
                // button 的默认行为就是触发 click
                self.fire("click");
            }
        }, {
            ATTRS:/**@lends Button.prototype */
            {
                /**
                 * Value associated with button component.
                 */
                value:{},
                /**
                 *Aria-describedby attribute.
                 * @type String
                 */
                describedby:{
                    view:true
                },
                /**
                 * Tooltip for button.
                 * @type String
                 */
                tooltip:{
                    view:true
                },
                /**
                 * Add collapse-right/left css class to root element.
                 * enum { "left","right" }
                 * @type String
                 */
                collapseSide:{
                    view:true
                },

                xrender:{
                    value:ButtonRender
                }
            }
        }, {
            xclass:'button',
            priority:10
        });

    return Button;

}, {
    requires:['event', 'component', './buttonRender']
});/**
 * @fileOverview simulated button for kissy , inspired by goog button
 * @author yiminghe@gmail.com
 */
KISSY.add("button", function (S, Button, Render, Split, Toggle) {
    Button.Render = Render;
    Button.Split = Split;
    Button.Toggle = Toggle;
    return Button;
}, {
    requires:[
        'button/base',
        'button/buttonRender',
        'button/split',
        'button/toggle'
    ]
});/**
 * @fileOverview abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/buttonRender", function (S, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return Component.Render.extend({
        createDom:function () {
            // set wai-aria role
            this.get("el")
                .attr("role", "button")
                .addClass("ks-inline-block");
        },
        _uiSetTooltip:function (title) {
            this.get("el").attr("title", title);
        },
        _uiSetDescribedby:function (describedby) {
            this.get("el").attr("aria-describedby", describedby);
        },

        _uiSetCollapseSide:function (side) {
            var self = this,
                cls = self.getCssClassWithPrefix("button-collapse-"),
                el = self.get("el");
            el.removeClass(cls + "left " + cls + "right");
            if (side) {
                el.addClass(cls + side);
            }
        }
    }, {
        ATTRS:{
            describedby:{},
            tooltip:{},
            collapseSide:{}
        }
    });
}, {
    requires:['component']
});/**
 * @fileOverview simple split button ,common usecase :button + menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("button/split", function (S) {

    var handles = {
        content:function (e) {
            var self = this,
                first = self.get("first"),
                t = e.target;
            first.set("content", t.get("content"));
            first.set("value", t.get("value"));
            if (self.get("hideAfterMenuClick")) {
                self.get("second").set("collapsed", true);
            }
        },
        value:function (e) {
            var self = this,
                first = self.get("first"),
                t = e.target;
            first.set("value", t.get("value"));
            if (self.get("hideAfterMenuClick")) {
                self.get("second").set("collapsed", true);
            }
        }
    };

    /**
     * Combining button and menubutton to form SplitButton.
     * @class
     * @memberOf Button
     * @extends Base
     */
    function Split() {
        Split.superclass.constructor.apply(this, arguments);
    }

    Split.ATTRS =
    /**
     * @lends Button.Split#
     */
    {
        /**
         * Button instance.
         * @type {Button}
         */
        first:{},
        /**
         * MenuButton instance.
         * @type {MenuButton}
         */
        second:{},
        /**
         * Event type to listen on the menubutton.
         * Default : click.
         * @type String
         */
        eventType:{
            value:"click"
        },
        /**
         * Event handler type.
         * Enum : "content", "value".
         * "content" : sync first button with second menubutton 's content and value.
         * "value" : sync first button with second menubutton 's  value only.
         * @type String
         */
        eventHandler:{
            // 或者 value
            value:"content"
        },
        /**
         * Whether hide menubutton 's drop menu after click on it.
         * Default : true
         * @type Boolean
         */
        hideAfterMenuClick:{
            value:true
        }
    };

    S.extend(Split, S.Base,
        /**
         * @lends Button.Split#
         */
        {
            /**
             * Render button and menubutton together.
             */
            render:function () {
                var self = this,
                    eventType = self.get("eventType"),
                    eventHandler = handles[self.get("eventHandler")],
                    first = self.get("first"),
                    second = self.get("second");
                first.set("collapseSide", "right");
                second.set("collapseSide", "left");
                first.render();
                second.render();
                if (eventType && eventHandler) {
                    second.on(eventType, eventHandler, self);
                }
            }
        });

    return Split;

}, {
    requires:['base']
});/**
 * @fileOverview ToggleButton for KISSY
 * @author yiminghe@gmail.com
 */
KISSY.add('button/toggle', function (S, Button, ToggleRender) {

    var ToggleButton = Button.extend({
        performActionInternal:function () {
            var self = this;
            self.set("checked", !self.get("checked"));
            ToggleButton.superclass.performActionInternal.apply(self, arguments);
        }
    }, {
        ATTRS:{
            checked:{
                value:false,
                view:true
            },
            xrender:{
                value:ToggleRender
            }
        }
    }, {
        xclass:'toggle-button',
        priority:30
    });

    return ToggleButton;

}, {
    requires:['./base', './toggleRender']
});/**
 * @fileOverview Render for ToggleButton
 * @author yiminghe@gmail.com
 */
KISSY.add("button/toggleRender", function (S, ButtonRender) {

    return ButtonRender.extend({
        _uiSetChecked:function (v) {
            var self = this,
                cls = self.getComponentCssClassWithState("-checked");
            self.get("el")[v ? 'addClass' : 'removeClass'](cls);
        }
    }, {
        ATTRS:{
            checked:{}
        }
    });

}, {
    requires:[ './buttonRender']
});
