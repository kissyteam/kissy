/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/justifyLeft/index", function (S, Editor, justifyCenterCmd) {
    function exec() {
        var editor=this.get("editor");
        editor.execCommand("justifyLeft");
        editor.focus();
    }

    return {
        init:function (editor) {
            justifyCenterCmd.init(editor);
            editor.addButton("justifyLeft",{
                tooltip:"左对齐",
                checkable:true,
                mode:Editor.WYSIWYG_MODE
            }, {
                onClick:exec,
                offClick:exec,
                selectionChange:function (e) {
                    var queryCmd = Editor.Utils.getQueryCmd("justifyLeft");
                    if (editor.execCommand(queryCmd, e.path)) {
                        this.set("checked",true);
                    } else {
                        this.set("checked",false);
                    }
                }
            });
        }
    };
}, {
    requires:['editor', './cmd']
});
