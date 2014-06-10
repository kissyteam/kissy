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
            tooltip: '下划线'
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
