/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 19:11
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
