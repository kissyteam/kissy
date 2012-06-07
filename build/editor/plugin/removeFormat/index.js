/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
/**
 * removeFormat for selection.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/removeFormat/index", function (S, Editor, formatCmd) {
    return {
        init:function (editor) {
            formatCmd.init(editor);
            editor.addButton("removeFormat",{
                tooltip:"清除格式",
                mode:Editor.WYSIWYG_MODE
            }, {
                offClick:function () {
                    editor.execCommand("removeFormat");
                }
            });
        }
    };
}, {
    requires:['editor', './cmd', '../button/']
});
