/**
 * @ignore
 * separator for button
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var $ = require('node').all;

    function Separator() {
    }

    (Separator.prototype = {
        pluginRenderUI: function (editor) {
            $('<span ' +
                'class="' + editor.get('prefixCls') + 'editor-toolbar-separator">&nbsp;' +
                '</span>')
                .appendTo(editor.get('toolBarEl'));
        }
    });

    return Separator;
});