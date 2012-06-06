/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
/**
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/unorderedList/index", function (S, Editor, ListButton, ListCmd) {
    return {
        init:function (editor) {
            ListCmd.init(editor);

            editor.addButton("unorderedList",{
                cmdType:"insertUnorderedList",
                mode:Editor.WYSIWYG_MODE
            }, undefined, ListButton);
        }
    };
}, {
    requires:['editor', '../listUtils/btn', './cmd']
});
