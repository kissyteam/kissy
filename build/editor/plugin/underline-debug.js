/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
/*
combined modules:
editor/plugin/underline
*/
KISSY.add('editor/plugin/underline', [
    './font/ui',
    './underline/cmd',
    './button',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * underline button
 * @author yiminghe@gmail.com
 */
    var ui = require('./font/ui');
    var cmd = require('./underline/cmd');
    require('./button');
    var $ = require('node');
    function Underline() {
    }
    Underline.prototype = {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            editor.addButton('underline', {
                cmdType: 'underline',
                tooltip: '\u4E0B\u5212\u7EBF'
            }, ui.Button);
            editor.docReady(function () {
                editor.get('document').on('keydown', function (e) {
                    if (e.ctrlKey && e.keyCode === $.Event.KeyCode.U) {
                        editor.execCommand('underline');
                        e.preventDefault();
                    }
                });
            });
        }
    };
    module.exports = Underline;
});



