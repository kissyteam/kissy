/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:03
*/
/*
combined modules:
editor/plugin/italic
*/
/**
 * @ignore
 * italic button.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/italic', [
    './font/ui',
    './italic/cmd',
    './button'
], function (S, require) {
    var ui = require('./font/ui');
    var cmd = require('./italic/cmd');
    require('./button');
    function italic() {
    }
    S.augment(italic, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            editor.addButton('italic', {
                cmdType: 'italic',
                tooltip: '\u659C\u4F53'
            }, ui.Button);
            editor.docReady(function () {
                editor.get('document').on('keydown', function (e) {
                    if (e.ctrlKey && e.keyCode === S.Node.KeyCode.I) {
                        editor.execCommand('italic');
                        e.preventDefault();
                    }
                });
            });
        }
    });
    return italic;
});


