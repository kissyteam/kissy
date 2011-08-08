/**
 * close extension for kissy dialog
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/close", function() {
    function Close() {
    }

    var HIDE = "hide";
    Close.ATTRS = {
        closable: {
            view:true
        },
        closeAction:{
            value:HIDE
        }
    };

    var actions = {
        hide:HIDE,
        destroy:"destroy"
    };

    Close.prototype = {

        __bindUI:function() {

            var self = this,
                closeBtn = self.get("view").get("closeBtn");
            closeBtn && closeBtn.on("click", function(ev) {
                self[actions[self.get("closeAction")] || HIDE]();
                ev.halt();
            });
        }
    };
    return Close;

});