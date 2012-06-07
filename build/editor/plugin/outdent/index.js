/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
/**
 * Add indent button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/outdent/index", function (S, Editor, indexCmd) {

    return {
        init:function (editor) {

            indexCmd.init(editor);

            var queryOutdent = Editor.Utils.getQueryCmd("outdent");

            editor.addButton("outdent",{
                tooltip:"减少缩进量 ",
                mode:Editor.WYSIWYG_MODE
            }, {
                offClick:function () {
                    editor.execCommand("outdent");
                    editor.focus();
                },
                selectionChange:function (e) {
                    var self = this;
                    if (editor.execCommand(queryOutdent, e.path)) {
                        self.set("disabled",false);
                    } else {
                        self.set("disabled",true);
                    }
                }
            });
        }
    };

}, {
    requires:['editor', './cmd']
});
