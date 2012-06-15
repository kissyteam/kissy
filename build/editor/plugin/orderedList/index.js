/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 17:22
*/
/**
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/orderedList/index", function (S, Editor, ListButton, ListCmd) {

    function orderedList() {

    }

    S.augment(orderedList, {
        renderUI:function (editor) {
            ListCmd.init(editor);

            editor.addButton("orderedList", {
                cmdType:"insertOrderedList",
                mode:Editor.WYSIWYG_MODE
            }, ListButton);
        }
    });

    return orderedList;
}, {
    requires:['editor', '../listUtils/btn', './cmd']
});
