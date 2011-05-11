/**
 * http://www.w3.org/TR/wai-aria-practices/#trap_focus
 * @author:yiminghe@gmail.com
 */
KISSY.add("overlay/aria", function() {
    function Aria() {
    }

    Aria.ATTRS = {
        aria:{
            view:true
        }
    };

    Aria.prototype = {

        __bindUI:function() {
            var self = this,el = self.get("view").get("el");
            if (self.get("aria")) {
                el.on("keydown", function(e) {
                    if (e.keyCode === 27) {
                        self.hide();
                        e.halt();
                    }
                });
            }
        }
    };
    return Aria;
});