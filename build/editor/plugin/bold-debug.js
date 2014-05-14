/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:17
*/
/*
combined modules:
editor/plugin/bold
*/
/**
 * @ignore
 * bold command.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/bold', [
    './font/ui',
    './bold/cmd',
    'node',
    './button'
], function (S, require) {
    var ui = require('./font/ui');
    var cmd = require('./bold/cmd');
    var Node = require('node');
    require('./button');
    function Bold() {
    }
    Bold.prototype = {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            editor.addButton('bold', {
                cmdType: 'bold',
                tooltip: '\u7C97\u4F53'
            }, ui.Button);
            editor.docReady(function () {
                editor.get('document').on('keydown', function (e) {
                    if (e.ctrlKey && e.keyCode === Node.KeyCode.B) {
                        editor.execCommand('bold');
                        e.preventDefault();
                    }
                });
            });
        }
    };
    return Bold;
});



