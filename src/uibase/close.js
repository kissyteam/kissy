/**
 * close extension for kissy dialog
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/close", function(S) {



    function Close() {
    }

    Close.ATTRS = {
        closable: {             // 是否需要关闭按钮
            value: true
        }
    };

    Close.prototype = {
        _uiSetClosable:function(v) {
           this.get("view").set("closable",true);
        },

        __bindUI:function() {

            var self = this,
                closeBtn = self.get("view").get("closeBtn");
            closeBtn && closeBtn.on("click", function(ev) {
                self.hide();
                ev.halt();
            });
        }
    };
    return Close;

});