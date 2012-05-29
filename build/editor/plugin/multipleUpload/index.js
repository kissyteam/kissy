/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 14:44
*/
KISSY.add("editor/plugin/multipleUpload/index", function (S, Editor, DialogLoader) {

    return {
        init:function (editor) {
            editor.addButton({
                contentCls:"ke-toolbar-mul-image",
                title:"批量插图",
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
