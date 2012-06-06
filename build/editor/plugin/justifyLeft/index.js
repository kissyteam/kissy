/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 5 21:37
*/
KISSY.add("editor/plugin/justifyLeft/index", function (S, Editor, justifyCenterCmd) {
    function exec() {
        this.get("editor").execCommand("justifyLeft");
    }

    return {
        init:function (editor) {
            justifyCenterCmd.init(editor);
            editor.addButton({
                contentCls:"ks-editor-toolbar-justifyLeft",
                title:"左对齐",
                mode:Editor.WYSIWYG_MODE
            }, {
                onClick:exec,
                offClick:exec,
                selectionChange:function (e) {
                    var queryCmd = Editor.Utils.getQueryCmd("justifyLeft");
                    if (editor.execCommand(queryCmd, e.path)) {
                        this.bon();
                    } else {
                        this.boff();
                    }
                }
            });
        }
    };
}, {
    requires:['editor', './cmd']
});
