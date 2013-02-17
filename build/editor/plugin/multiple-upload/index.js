/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * multipleUpload button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/multiple-upload/index", function (S, Editor, DialogLoader) {

    function multipleUpload(config) {
        this.config = config || {};
    }

    S.augment(multipleUpload, {
        pluginRenderUI:function (editor) {
            var self = this;
            editor.addButton("multipleUpload", {
                tooltip:"批量插图",
                listeners:{
                    click:function () {
                        DialogLoader.useDialog(editor, "multiple-upload", self.config);

                    }
                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    });

    return multipleUpload;

}, {
    requires:['editor', '../dialog-loader/']
});
