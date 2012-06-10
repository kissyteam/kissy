/**
 * multipleUpload button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/multipleUpload/index", function (S, Editor, DialogLoader) {

    return {
        init:function (editor) {
            editor.addButton("multipleUpload", {
                tooltip:"批量插图",
                listeners:{
                    click:{
                        fn:function () {
                            DialogLoader.useDialog(editor, "multipleUpload");
                        }
                    }
                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    };

}, {
    requires:['editor', '../dialogLoader/']
});