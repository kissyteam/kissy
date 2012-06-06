KISSY.add("editor/plugin/justifyCenter/index", function (S, Editor, justifyCenterCmd) {
    function exec() {
        var editor=this.get("editor");
        editor.execCommand("justifyCenter");
        editor.focus();
    }

    return {
        init:function (editor) {
            justifyCenterCmd.init(editor);
            editor.addButton("justifyCenter", {
                tooltip:"居中对齐",
                checkable:true,
                mode:Editor.WYSIWYG_MODE
            }, {
                onClick:exec,
                offClick:exec,
                selectionChange:function (e) {
                    var queryCmd = Editor.Utils.getQueryCmd("justifyCenter");
                    if (editor.execCommand(queryCmd, e.path)) {
                        this.set("checked", true);
                    } else {
                        this.set("checked", false);
                    }
                }
            });
        }
    };
}, {
    requires:['editor', './cmd']
});