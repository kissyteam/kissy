/**
 * multipleUpload button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/multiple-upload", function (S, Editor, DialogLoader) {

    function MultipleUpload(config) {
        this.config = config || {};
    }

    S.augment(MultipleUpload, {
        pluginRenderUI:function (editor) {
            var self = this;
            editor.addButton("multipleUpload", {
                tooltip:"批量插图",
                listeners:{
                    click:function () {
                        DialogLoader.useDialog(editor, "multiple-upload", self.config);

                    }
                },
                mode:Editor.Mode.WYSIWYG_MODE
            });
        }
    });

    return MultipleUpload;

}, {
    requires:['editor', './dialog-loader']
});