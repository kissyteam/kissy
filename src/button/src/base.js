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
                 * @type {String}
                 */
                describedby:{
                    view:1
                },
                /**
                 * Tooltip for button.
                 * @type {String}
                 */
                tooltip:{
                    view:1
                },

                /**
                 * Whether button can be checkable(toggle).
                 * @default false.
                 * @type {Boolean}
                 */
                checkable:{
                },

                /**
                 * Whether button is checked(toggle).
                 * @default false.
                 * @type {Boolean}
                 */
                checked:{
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
});