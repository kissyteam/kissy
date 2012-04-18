KISSY.add("editor/plugin/justifyRight/index", function (S, KE, justifyCenterCmd) {
    function exec() {
        this.get("editor").execCommand("justifyRight");
    }

    return {
        init:function (editor) {
            justifyCenterCmd.init(editor);
            editor.addButton({
                contentCls:"ke-toolbar-justifyRight",
                title:"右对齐"
            }, {
                onClick:exec,
                offClick:exec,
                selectionChange:function (e) {
                    var queryCmd = KE.Utils.getQueryCmd("justifyRight");
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