/**
 * justifyCenter button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/justifyCenter/index", function (S, Editor, justifyCenterCmd) {
    function exec() {
        var editor = this.get("editor");
        editor.execCommand("justifyCenter");
        editor.focus();
    }

    return {
        init:function (editor) {
            justifyCenterCmd.init(editor);
            editor.addButton("justifyCenter", {
                tooltip:"居中对齐",
                checkable:true,
                listeners:{
                    click:{
                        fn:exec
                    },
                    afterSyncUI:{
                        fn:function () {
                            var self = this;
                            editor.on("selectionChange", function (e) {
                                if (editor.get("mode") == Editor.SOURCE_MODE) {
                                    return;
                                }
                                var queryCmd = Editor.Utils.getQueryCmd("justifyCenter");
                                if (editor.execCommand(queryCmd, e.path)) {
                                    self.set("checked", true);
                                } else {
                                    self.set("checked", false);
                                }
                            });
                        }}
                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    };
}, {
    requires:['editor', './cmd']
});