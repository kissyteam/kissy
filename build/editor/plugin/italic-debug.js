/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:20
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
    './button',
    'node'
], function (S, require) {
    var ui = require('./font/ui');
    var cmd = require('./italic/cmd');
    require('./button');
    var Node = require('node');
    function Italic() {
    }
    Italic.prototype = {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            editor.addButton('italic', {
                cmdType: 'italic',
                tooltip: '\u659C\u4F53'
            }, ui.Button);
            editor.docReady(function () {
                editor.get('document').on('keydown', function (e) {
                    if (e.ctrlKey && e.keyCode === Node.KeyCode.I) {
                        editor.execCommand('italic');
                        e.preventDefault();
                    }
                });
            });
        }
    };
    return Italic;
});



