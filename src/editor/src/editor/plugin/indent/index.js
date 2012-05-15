/**
 * Add indent button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/indent/index", function (S, Editor, indexCmd) {

    return {
        init:function (editor) {
            indexCmd.init(editor);
            editor.addButton({
                title:"增加缩进量 ",
                mode:Editor.WYSIWYG_MODE,
                contentCls:"ke-toolbar-indent"
            }, {
                offClick:function () {
                    editor.execCommand("indent");
                }
            });
        }
    };

}, {
    requires:['editor', './cmd']
});