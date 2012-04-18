/**
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/insertUnorderedList/index", function (S, KE, ListButton, ListCmd) {
    return {
        init:function (editor) {
            ListCmd.init(editor);

            editor.addButton({
                cmdType:"insertUnorderedList",
                mode:KE.WYSIWYG_MODE,
                contentCls:"ke-toolbar-ul"
            }, undefined, ListButton);
        }
    };
}, {
    requires:['editor', '../listUtils/btn', './cmd']
});