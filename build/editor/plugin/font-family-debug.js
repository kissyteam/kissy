/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:45
*/
/*
combined modules:
editor/plugin/font-family
*/
KISSY.add('editor/plugin/font-family', [
    'util',
    'editor',
    './font/ui',
    './font-family/cmd',
    './menubutton'
], function (S, require, exports, module) {
    /**
 * @ignore
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Editor = require('editor');
    var ui = require('./font/ui');
    var cmd = require('./font-family/cmd');
    require('./menubutton');
    function FontFamilyPlugin(config) {
        this.config = config || {};
    }
    util.augment(FontFamilyPlugin, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            var fontFamilies = this.config;
            var menu = {};
            util.mix(menu, {
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
            util.each(menu.children, function (item) {
                var attrs = item.elAttrs || {}, value = item.value;
                attrs.style = attrs.style || '';
                attrs.style += ';font-family:' + value;
                item.elAttrs = attrs;
            });
            fontFamilies.menu = util.mix(menu, fontFamilies.menu);
            editor.addSelect('fontFamily', util.mix({
                cmdType: 'fontFamily',
                defaultCaption: '\u5B57\u4F53',
                width: 130,
                mode: Editor.Mode.WYSIWYG_MODE
            }, fontFamilies), ui.Select);
        }
    });
    module.exports = FontFamilyPlugin;
});




