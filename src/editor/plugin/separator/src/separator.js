/**
 * @ignore
 * separator for button
 * @author yiminghe@gmail.com
 */

var $ = require('node');

function Separator() {
}

Separator.prototype = {
    pluginRenderUI: function (editor) {
        $('<span ' +
            'class="' + editor.get('prefixCls') + 'editor-toolbar-separator">&nbsp;' +
            '</span>')
            .appendTo(editor.get('toolBarEl'));
    }
};

module.exports = Separator;
