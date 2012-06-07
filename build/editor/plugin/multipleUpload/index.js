/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/multipleUpload/index", function (S, Editor, DialogLoader) {

    return {
        init:function (editor) {
            editor.addButton("multipleUpload",{
                tooltip:"批量插图",
                mode:Editor.WYSIWYG_MODE
            }, {
                offClick:function () {
                    DialogLoader.useDialog(editor,"multipleUpload/dialog");
                }
            });
        }
    };

}, {
    requires:['editor', '../dialogLoader/']
});
