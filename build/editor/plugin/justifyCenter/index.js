/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 28 20:23
*/
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


    function justifyCenter() {
    }

    S.augment(justifyCenter, {
        renderUI:function (editor) {
            justifyCenterCmd.init(editor);
            editor.addButton("justifyCenter", {
                tooltip:"居中对齐",
                checkable:true,
                listeners:{
                    click:exec,
                    afterSyncUI:function () {
                        var self = this;
                        editor.on("selectionChange", function () {
                            if (editor.get("mode") == Editor.SOURCE_MODE) {
                                return;
                            }
                            if (editor.queryCommandValue("justifyCenter")) {
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
    });

    return justifyCenter;
}, {
    requires:['editor', './cmd']
});
