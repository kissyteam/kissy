/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 5 21:37
*/
/**
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/insertUnorderedList/index", function (S, Editor, ListButton, ListCmd) {
    return {
        init:function (editor) {
            ListCmd.init(editor);

            editor.addButton({
                cmdType:"insertUnorderedList",
                mode:Editor.WYSIWYG_MODE,
                contentCls:"ks-editor-toolbar-ul"
            }, undefined, ListButton);
        }
    };
}, {
    requires:['editor', '../listUtils/btn', './cmd']
});
