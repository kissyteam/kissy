/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 11 20:22
*/
/**
 * justifyRight button.
 * @author yiminghe@gmail.com
 */
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
                listeners:{
                    click:exec,
                    afterSyncUI:function () {
                            var self = this;
                            editor.on("selectionChange", function (e) {
                                if (editor.get("mode") == Editor.SOURCE_MODE) {
                                    return;
                                }
                                var queryCmd = Editor.Utils.getQueryCmd("justifyRight");
                                if (editor.execCommand(queryCmd, e.path)) {
                                    self.set("checked", true);
                                } else {
                                    self.set("checked", false);
                                }
                            });
                        }

                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    };
}, {
    requires:['editor', './cmd']
});
