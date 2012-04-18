/**
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/insertOrderedList/index", function (S, KE, ListButton, ListCmd) {
    return {
        init:function (editor) {
            ListCmd.init(editor);

            editor.addButton({
                cmdType:"insertOrderedList",
                mode:KE.WYSIWYG_MODE,
                contentCls:"ke-toolbar-ol"
            }, undefined, ListButton);
        }
    };
}, {
    requires:['editor', '../listUtils/btn', './cmd']
});