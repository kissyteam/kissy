/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
/**
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/orderedList/index", function (S, Editor, ListButton, ListCmd) {
    return {
        init:function (editor) {
            ListCmd.init(editor);

            editor.addButton("orderedList",{
                cmdType:"insertOrderedList",
                mode:Editor.WYSIWYG_MODE
            }, undefined, ListButton);
        }
    };
}, {
    requires:['editor', '../listUtils/btn', './cmd']
});
