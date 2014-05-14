/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:22
*/
/*
combined modules:
editor/plugin/separator
*/
/**
 * @ignore
 * separator for button
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/separator', ['node'], function (S, require) {
    var $ = require('node').all;
    function Separator() {
    }
    Separator.prototype = {
        pluginRenderUI: function (editor) {
            $('<span ' + 'class="' + editor.get('prefixCls') + 'editor-toolbar-separator">&nbsp;' + '</span>').appendTo(editor.get('toolBarEl'));
        }
    };
    return Separator;
});
