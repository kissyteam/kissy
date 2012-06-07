/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/listUtils/btn", function (S, Editor, Button) {


    function onClick() {
        var editor = this.get("editor");
        var cmd = this.get("cmdType");
        editor.execCommand(cmd);
        editor.focus();
    }

    var ListButton = Button.Toggle.extend({
        offClick:onClick,
        onClick:onClick,
        selectionChange:function (e) {
            var self = this,
                editor = self.get("editor"),
                cmd = Editor.Utils.getQueryCmd(self.get("cmdType"));
            if (editor.execCommand(cmd, e.path)) {
                this.set("checked", true);
            } else {
                this.set("checked", false);
            }
        }
    }, {
        ATTRS:{
            mode:{
                value:Editor.WYSIWYG_MODE
            }
        }
    });

    return ListButton;
}, {
    requires:['editor', '../button/']
});
