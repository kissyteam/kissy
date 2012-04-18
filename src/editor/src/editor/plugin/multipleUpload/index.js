KISSY.add("editor/plugin/multipleUpload/index", function (S, KE, DialogLoader) {

    return {
        init:function (editor) {
            editor.addButton({
                contentCls:"ke-toolbar-mul-image",
                title:"批量插图",
                mode:KE.WYSIWYG_MODE
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