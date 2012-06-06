KISSY.add("editor/plugin/justifyRight/index", function (S, Editor, justifyCenterCmd) {
    function exec() {
        var editor = this.get("editor");
        editor.execCommand("justifyRight");
        editor.focus();
    }

    return {
        init:function (editor) {
            justifyCenterCmd.init(editor);
            editor.addButton("justifyRight", {
                tooltip:"右对齐",
                checkable:true,
                mode:Editor.WYSIWYG_MODE
            }, {
                onClick:exec,
                offClick:exec,
                selectionChange:function (e) {
                    var queryCmd = Editor.Utils.getQueryCmd("justifyRight");
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