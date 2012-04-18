KISSY.add("editor/plugin/justifyCenter/index", function (S, KE, justifyCenterCmd) {
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
                    var queryCmd = KE.Utils.getQueryCmd("justifyCenter");
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