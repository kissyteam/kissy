/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:19
*/
/*
combined modules:
editor/plugin/font-size
*/
/**
 * @ignore
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/font-size', [
    'editor',
    './font/ui',
    './font-size/cmd',
    './menubutton',
    'util'
], function (S, require) {
    var Editor = require('editor');
    var ui = require('./font/ui');
    var cmd = require('./font-size/cmd');
    require('./menubutton');
    var util = require('util');
    function FontSizePlugin(config) {
        this.config = config || {};
    }
    util.augment(FontSizePlugin, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            function wrapFont(vs) {
                var v = [];
                util.each(vs, function (n) {
                    v.push({
                        content: n,
                        value: n
                    });
                });
                return v;
            }
            var fontSizeConfig = this.config;
            fontSizeConfig.menu = util.mix({
                children: wrapFont([
                    '8px',
                    '10px',
                    '12px',
                    '14px',
                    '18px',
                    '24px',
                    '36px',
                    '48px',
                    '60px',
                    '72px',
                    '84px',
                    '96px'
                ])
            }, fontSizeConfig.menu);
            editor.addSelect('fontSize', util.mix({
                cmdType: 'fontSize',
                defaultCaption: '\u5927\u5C0F',
                width: '70px',
                mode: Editor.Mode.WYSIWYG_MODE
            }, fontSizeConfig), ui.Select);
        }
    });
    return FontSizePlugin;
});




