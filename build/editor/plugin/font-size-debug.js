/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:46
*/
/*
combined files : 

editor/plugin/font-size

*/
/**
 * @ignore
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/font-size',['editor', './font/ui', './font-size/cmd', './menubutton'], function (S, require) {
    var Editor = require('editor');
    var ui = require('./font/ui');
    var cmd = require('./font-size/cmd');
    require('./menubutton');

    function FontSizePlugin(config) {
        this.config = config || {};
    }

    S.augment(FontSizePlugin, {
        pluginRenderUI: function (editor) {

            cmd.init(editor);

            function wrapFont(vs) {
                var v = [];
                S.each(vs, function (n) {
                    v.push({
                        content: n,
                        value: n
                    });
                });
                return v;
            }

            var fontSizeConfig = this.config;

            fontSizeConfig.menu = S.mix({
                children: wrapFont([
                    '8px', '10px', '12px',
                    '14px', '18px', '24px',
                    '36px', '48px', '60px',
                    '72px', '84px', '96px'
                ])
            }, fontSizeConfig.menu);

            editor.addSelect('fontSize', S.mix({
                cmdType: 'fontSize',
                defaultCaption: '大小',
                width: '70px',
                mode: Editor.Mode.WYSIWYG_MODE
            }, fontSizeConfig), ui.Select);
        }
    });

    return FontSizePlugin;
});

