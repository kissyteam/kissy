/**
 * removeFormat for selection.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/removeFormat/index", function (S, KE, formatCmd) {
    return {
        init:function (editor) {
            formatCmd.init(editor);
            editor.addButton({
                title:"清除格式",
                mode:KE.WYSIWYG_MODE,
                contentCls:"ke-toolbar-removeformat"
            }, {
                offClick:function () {
                    editor.execCommand("removeFormat");
                }
            });
        }
    };
}, {
    requires:['editor', './cmd', '../button/']
});