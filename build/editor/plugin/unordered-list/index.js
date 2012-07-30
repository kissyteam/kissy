/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 30 22:57
*/
/**
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/unordered-list/index", function (S, Editor, ListButton, ListCmd) {

    function unorderedList() {
    }

    S.augment(unorderedList, {
        renderUI:function (editor) {
            ListCmd.init(editor);

            editor.addButton("unorderedList", {
                cmdType:"insertUnorderedList",
                mode:Editor.WYSIWYG_MODE
            }, ListButton);
        }
    });

    return unorderedList;
}, {
    requires:['editor', '../list-utils/btn', './cmd']
});
