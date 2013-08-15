/*
Copyright 2013, KISSY UI Library v1.31
MIT Licensed
build time: Aug 15 16:16
*/
/**
 * insert program code
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/code/index', function (S, Editor,DialogLoader) {

    function CodePlugin() {

    }

    S.augment(CodePlugin, {
        pluginRenderUI: function (editor) {
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
