/**
 * @ignore
 * insert program code
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
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
