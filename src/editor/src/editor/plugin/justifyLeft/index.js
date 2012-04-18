KISSY.add("editor/plugin/justifyLeft/index", function (S, KE, justifyCenterCmd) {
    function exec() {
        this.get("editor").execCommand("justifyLeft");
    }

    return {
        init:function (editor) {
            justifyCenterCmd.init(editor);
            editor.addButton({
                contentCls:"ke-toolbar-justifyLeft",
                title:"左对齐"
            }, {
                onClick:exec,
                offClick:exec,
                selectionChange:function (e) {
                    var queryCmd = KE.Utils.getQueryCmd("justifyLeft");
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