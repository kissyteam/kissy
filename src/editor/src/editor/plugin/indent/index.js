/**
 * Add indent button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/indent/index", function (S, Editor, indexCmd) {

    return {
        init:function (editor) {
            indexCmd.init(editor);
            editor.addButton("indent",{
                tooltip:"增加缩进量 ",
                listeners:{
                    click:{
                        fn:function () {
                            editor.execCommand("indent");
                            editor.focus();
                        }
                    }
                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    };

}, {
    requires:['editor', './cmd']
});