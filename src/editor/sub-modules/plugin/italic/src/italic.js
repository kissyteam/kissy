/**
 * @ignore
 * italic button.
 * @author yiminghe@gmail.com
 */

var ui = require('./font/ui');
var cmd = require('./italic/cmd');
require('./button');
var $ = require('node');

function Italic() {

}

(Italic.prototype = {
    pluginRenderUI: function (editor) {
        cmd.init(editor);

        editor.addButton('italic', {
            cmdType: 'italic',
            tooltip: '斜体'
        }, ui.Button);

        editor.docReady(function () {
            editor.get('document').on('keydown', function (e) {
                if (e.ctrlKey && e.keyCode === $.Event.KeyCode.I) {
                    editor.execCommand('italic');
                    e.preventDefault();
                }
            });
        });
    }
});

module.exports = Italic;
