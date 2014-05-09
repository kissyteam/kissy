/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:56
*/
/*
combined modules:
editor/plugin/code
*/
/**
 * @ignore
 * insert program code
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/code', [
    'editor',
    './button',
    './dialog-loader'
], function (S, require) {
    var Editor = require('editor');
    require('./button');
    var DialogLoader = require('./dialog-loader');
    function CodePlugin() {
    }
    S.augment(CodePlugin, {
        pluginRenderUI: function (editor) {
            editor.addButton('code', {
                tooltip: '\u63D2\u5165\u4EE3\u7801',
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


