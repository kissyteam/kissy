/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 14:52
*/
KISSY.add("editor/plugin/justifyCenter/index", function (S, Editor, justifyCenterCmd) {
    function exec() {
        this.get("editor").execCommand("justifyCenter");
    }

    return {
        init:function (editor) {
            justifyCenterCmd.init(editor);
            editor.addButton({
                contentCls:"ke-toolbar-justifyCenter",
                title:"居中对齐"
            }, {
                onClick:exec,
                offClick:exec,
                selectionChange:function (e) {
                    var queryCmd = Editor.Utils.getQueryCmd("justifyCenter");
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
