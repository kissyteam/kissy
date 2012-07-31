/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 31 10:47
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
     * @class
     * KISSY Button.
     */
    var Button = Component.Controller.extend(
        /**@lends Button.prototype */
        {
            bindUI:function () {
                this.get("el").on("keyup", this.handleKeyEventInternal, this);
                this.publish("click", {
                    bubbles:1
                });
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
                if (self.get("checkable")) {
                    self.set("checked", !self.get("checked"));
                }
                // button 的默认行为就是触发 click
                self.fire("click");
            },

            /**
             * render button to document.
             */
            render:function () {
                return Button.superclass.render.apply(this, arguments);
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
                    view:1
                },
                /**
                 * Tooltip for button.
                 * @type String
                 */
                tooltip:{
                    view:1
                },

                /**
                 * Whether button can be checkable(toggle).
                 * @default false.
                 * @type Boolean
                 */
                checkable:{
                },

                /**
                 * Whether button is checked(toggle).
                 * @default false.
                 * @type Boolean
                 */
                checked:{
                    view:1
                },

                /**
                 * Add collapse-right/left css class to root element.
                 * enum { "left","right" }
                 * @type String
                 */
                collapseSide:{
                    view:1
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
KISSY.add("button", function (S, Button, Render) {
    Button.Render = Render;
    return Button;
}, {
    requires:[
        'button/base',
        'button/buttonRender'
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
                .attr("role", "button");
        },
        _uiSetChecked:function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getComponentCssClassWithState("-checked");
            el[v ? 'addClass' : 'removeClass'](cls);
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
            checked:{},
            collapseSide:{}
        }
    });
}, {
    requires:['component']
});
