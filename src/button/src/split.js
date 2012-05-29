/**
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
});