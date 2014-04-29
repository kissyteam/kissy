/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:00
*/
/*
combined modules:
editor/plugin/back-color
*/
/**
 * @ignore
 * backColor button.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/back-color', [
    './color/btn',
    './back-color/cmd'
], function (S, require) {
    var Button = require('./color/btn');
    var cmd = require('./back-color/cmd');
    function backColor(config) {
        this.config = config || {};
    }
    S.augment(backColor, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            Button.init(editor, {
                defaultColor: 'rgb(255, 217, 102)',
                cmdType: 'backColor',
                tooltip: '\u80CC\u666F\u989C\u8272'
            });
        }
    });
    return backColor;
});

