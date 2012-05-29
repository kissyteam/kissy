/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 18:24
*/
KISSY.add("editor/plugin/listUtils/btn", function (S, Editor, TripleButton) {
    function ListButton() {
        ListButton.superclass.constructor.apply(this, arguments);
    }

    function onClick() {
        var editor = this.get("editor");
        var cmd = this.get("cmdType");
        editor.execCommand(cmd);
    }

    S.extend(ListButton, TripleButton, {
        offClick:onClick,
        onClick:onClick,
        selectionChange:function (e) {
            var self = this,
                editor = self.get("editor"),
                cmd = Editor.Utils.getQueryCmd(self.get("cmdType"));
            if (editor.execCommand(cmd, e.path)) {
                self.bon();
            } else {
                self.boff();
            }
        }
    });

    return ListButton;
}, {
    requires:['editor', '../button/']
});
