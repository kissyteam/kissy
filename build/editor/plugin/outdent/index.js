/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 31 22:01
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

            editor.addButton({
                title:"减少缩进量 ",
                mode:Editor.WYSIWYG_MODE,
                contentCls:"ks-editor-toolbar-outdent"
            }, {
                offClick:function () {
                    editor.execCommand("outdent");
                },
                selectionChange:function (e) {
                    var self = this;
                    if (editor.execCommand(queryOutdent, e.path)) {
                        self.enable();
                    } else {
                        self.disable();
                    }
                }
            });
        }
    };

}, {
    requires:['editor', './cmd']
});
