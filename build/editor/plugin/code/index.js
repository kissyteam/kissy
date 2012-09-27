/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Sep 27 16:17
*/
/**
 * insert program code
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/code/index', function (S, Editor,DialogLoader) {

    function CodePlugin() {

    }

    S.augment(CodePlugin, {
        renderUI: function (editor) {
            editor.addButton('code', {
                tooltip: "插入代码",
                listeners: {
                    click: function () {
                        DialogLoader.useDialog(editor, "code");
                    }
                },
                mode: Editor.WYSIWYG_MODE
            });
        }
    });

    return CodePlugin;
}, {
    requires: ['editor','../dialog-loader/']
});
