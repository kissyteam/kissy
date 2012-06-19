/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 19 16:41
*/
/**
 * Add indent button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/outdent/index", function (S, Editor, indexCmd) {

    function outdent() {

    }

    S.augment(outdent, {
        renderUI:function (editor) {

            indexCmd.init(editor);

            var queryOutdent = Editor.Utils.getQueryCmd("outdent");

            editor.addButton("outdent", {
                tooltip:"减少缩进量 ",
                listeners:{
                    click:function () {
                        editor.execCommand("outdent");
                        editor.focus();

                    },
                    afterSyncUI:function () {
                        var self = this;
                        editor.on("selectionChange", function (e) {
                            if (editor.get("mode") == Editor.SOURCE_MODE) {
                                return;
                            }
                            if (editor.execCommand(queryOutdent, e.path)) {
                                self.set("disabled", false);
                            } else {
                                self.set("disabled", true);
                            }
                        });

                    }
                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    });

    return outdent;

}, {
    requires:['editor', './cmd']
});
