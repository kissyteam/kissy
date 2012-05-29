/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 18:24
*/
/**
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/insertOrderedList/index", function (S, Editor, ListButton, ListCmd) {
    return {
        init:function (editor) {
            ListCmd.init(editor);

            editor.addButton({
                cmdType:"insertOrderedList",
                mode:Editor.WYSIWYG_MODE,
                contentCls:"ke-toolbar-ol"
            }, undefined, ListButton);
        }
    };
}, {
    requires:['editor', '../listUtils/btn', './cmd']
});
