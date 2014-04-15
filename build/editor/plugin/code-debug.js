/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:45
*/
/*
combined files : 

editor/plugin/code

*/
/**
 * @ignore
 * insert program code
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/code',['editor', './button', './dialog-loader'], function (S, require) {
    var Editor = require('editor');
    require('./button');
    var DialogLoader = require('./dialog-loader');

    function CodePlugin() {

    }

    S.augment(CodePlugin, {
        pluginRenderUI: function (editor) {
            editor.addButton('code', {
                tooltip: '插入代码',
                listeners: {
                    click: function () {
                        DialogLoader.useDialog(editor, 'code');
                    }
                },
                mode: Editor.Mode.WYSIWYG_MODE
            });
        }
    });

    return CodePlugin;
});

