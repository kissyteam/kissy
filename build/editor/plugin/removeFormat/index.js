/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 14:52
*/
/**
 * removeFormat for selection.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/removeFormat/index", function (S, Editor, formatCmd) {
    return {
        init:function (editor) {
            formatCmd.init(editor);
            editor.addButton({
                title:"清除格式",
                mode:Editor.WYSIWYG_MODE,
                contentCls:"ke-toolbar-removeformat"
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
