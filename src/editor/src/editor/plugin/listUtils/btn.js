/**
 * Common btn for list.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/listUtils/btn", function (S, Editor, Button) {

    function onClick() {
        var editor = this.get("editor");
        var cmd = this.get("cmdType");
        editor.execCommand(cmd);
        editor.focus();
    }

    return Button.extend({
        initializer:function () {
            var self = this;
            self.on("click", onClick, self);
            var editor = self.get("editor");
            editor.on("selectionChange", function (e) {
                var cmd = Editor.Utils.getQueryCmd(self.get("cmdType"));
                if (editor.execCommand(cmd, e.path)) {
                    self.set("checked", true);
                } else {
                    self.set("checked", false);
                }
            })
        }
    }, {
        ATTRS:{
            checkable:{
                value:true
            },
            mode:{
                value:Editor.WYSIWYG_MODE
            }
        }
    });
}, {
    requires:['editor', '../button/']
});