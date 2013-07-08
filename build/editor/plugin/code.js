﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:50
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/code
*/

/**
 * insert program code
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/code', function (S, Editor,DialogLoader) {

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
                mode: Editor.Mode.WYSIWYG_MODE
            });
        }
    });

    return CodePlugin;
}, {
    requires: ['editor','./dialog-loader']
});

