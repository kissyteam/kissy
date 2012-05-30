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
                /**
                 * Please use {@link Component.UIBase.Box#html} attribute instead!
                 * @deprecated 1.3
                 */
                content:{
                    getter:function () {
                        return this.get("html");
                    },
                    setter:function (v) {
                        return this.set("html", v);
                    }
                }
            },

            DefaultRender:ButtonRender
        }, {
            xclass:'button',
            priority:10
        });

    return Button;

}, {
    requires:['event', 'component', './buttonRender']
});