/**
 * @fileOverview simple split button ,common usecase :button + menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("button/split", function(S) {

    var handles = {
        content:function(e) {
            var first = this,t = e.target;
            first.__set("content", t.get("content"));
            first.__set("value", t.get("value"));
        },
        value:function(e) {
            var first = this,t = e.target;
            first.__set("value", t.get("value"));
        }
    };

    function Split() {
        Split.superclass.constructor.apply(this, arguments);
    }

    Split.ATTRS = {
        // 第一个组件按钮
        first:{},
        // 第二个组件
        second:{},
        // 第二个组件的见ring事件
        eventType:{
            value:"click"
        },
        eventHandler:{
            // 或者 value
            value:"content"
        }
    };

    S.extend(Split, S.Base, {
        render:function() {
            var self = this,
                eventType = self.get("eventType"),
                eventHandler = handles[self.get("eventHandler")],
                first = self.get("first"),
                second = self.get("second");
            first.__set("collapseSide", "right");
            second.__set("collapseSide", "left");
            first.render();
            second.render();
            if (eventType && eventHandler) {
                second.on(eventType, eventHandler, first);
            }
        }
    });

    return Split;

}, {
    requires:['base']
});