/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:44
*/
/*
combined modules:
editor/plugin/bold
*/
KISSY.add('editor/plugin/bold', [
    './font/ui',
    './bold/cmd',
    'node',
    './button'
], function (S, require, exports, module) {
    /**
 * @ignore
 * bold command.
 * @author yiminghe@gmail.com
 */
    var ui = require('./font/ui');
    var cmd = require('./bold/cmd');
    var $ = require('node');
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
                    if (e.ctrlKey && e.keyCode === $.Event.KeyCode.B) {
                        editor.execCommand('bold');
                        e.preventDefault();
                    }
                });
            });
        }
    };
    module.exports = Bold;
});



