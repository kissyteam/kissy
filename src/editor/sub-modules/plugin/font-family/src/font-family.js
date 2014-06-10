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
                    content: '宋体',
                    value: 'SimSun'
                },
                {
                    content: '黑体',
                    value: 'SimHei'
                },
                {
                    content: '隶书',
                    value: 'LiSu'
                },
                {
                    content: '楷体',
                    value: 'KaiTi_GB2312'
                },
                {
                    content: '微软雅黑',
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
            var attrs = item.elAttrs || {},
                value = item.value;
            attrs.style = attrs.style || '';
            attrs.style += ';font-family:' + value;
            item.elAttrs = attrs;
        });

        fontFamilies.menu = util.mix(menu, fontFamilies.menu);

        editor.addSelect('fontFamily', util.mix({
            cmdType: 'fontFamily',
            defaultCaption: '字体',
            width: 130,
            mode: Editor.Mode.WYSIWYG_MODE
        }, fontFamilies), ui.Select);
    }
});

module.exports = FontFamilyPlugin;

