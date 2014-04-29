/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:02
*/
/*
combined modules:
editor/plugin/font-family
*/
/**
 * @ignore
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/font-family', [
    'editor',
    './font/ui',
    './font-family/cmd',
    './menubutton'
], function (S, require) {
    var Editor = require('editor');
    var ui = require('./font/ui');
    var cmd = require('./font-family/cmd');
    require('./menubutton');
    function FontFamilyPlugin(config) {
        this.config = config || {};
    }
    S.augment(FontFamilyPlugin, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            var fontFamilies = this.config;
            var menu = {};
            S.mix(menu, {
                children: [
                    //ie 不认识中文？？？
                    {
                        content: '\u5B8B\u4F53',
                        value: 'SimSun'
                    },
                    {
                        content: '\u9ED1\u4F53',
                        value: 'SimHei'
                    },
                    {
                        content: '\u96B6\u4E66',
                        value: 'LiSu'
                    },
                    {
                        content: '\u6977\u4F53',
                        value: 'KaiTi_GB2312'
                    },
                    {
                        content: '\u5FAE\u8F6F\u96C5\u9ED1',
                        value: '"Microsoft YaHei"'
                    },
                    {
                        content: 'Georgia',
                        value: 'Georgia'
                    },
                    {
                        content: 'Times New Roman',
                        value: '"Times New Roman"'
                    },
                    {
                        content: 'Impact',
                        value: 'Impact'
                    },
                    {
                        content: 'Courier New',
                        value: '"Courier New"'
                    },
                    {
                        content: 'Arial',
                        value: 'Arial'
                    },
                    {
                        content: 'Verdana',
                        value: 'Verdana'
                    },
                    {
                        content: 'Tahoma',
                        value: 'Tahoma'
                    }
                ],
                width: '130px'
            });
            S.each(menu.children, function (item) {
                var attrs = item.elAttrs || {}, value = item.value;
                attrs.style = attrs.style || '';
                attrs.style += ';font-family:' + value;
                item.elAttrs = attrs;
            });
            fontFamilies.menu = S.mix(menu, fontFamilies.menu);
            editor.addSelect('fontFamily', S.mix({
                cmdType: 'fontFamily',
                defaultCaption: '\u5B57\u4F53',
                width: 130,
                mode: Editor.Mode.WYSIWYG_MODE
            }, fontFamilies), ui.Select);
        }
    });
    return FontFamilyPlugin;
});



