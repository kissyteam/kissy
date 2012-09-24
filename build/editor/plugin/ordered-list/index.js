/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Sep 24 15:22
*/
/**
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/ordered-list/index", function (S, Editor, ListButton, ListCmd) {

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
    requires:['editor', '../list-utils/btn', './cmd']
});
