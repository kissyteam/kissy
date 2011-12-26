/**
 * @fileOverview http://www.w3.org/TR/wai-aria-practices/#trap_focus
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/aria", function(S,Event) {
    function Aria() {
    }

    Aria.ATTRS = {
        aria:{
            view:true
        }
    };

    Aria.prototype = {

        __bindUI:function() {
            var self = this,el = self.get("el");
            if (self.get("aria")) {
                el.on("keydown", function(e) {
                    if (e.keyCode === Event.KeyCodes.ESC) {
                        self.hide();
                        e.halt();
                    }
                });
            }
        }
    };
    return Aria;
},{
    requires:['event']
});