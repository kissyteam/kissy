/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:47
*/
/*
combined modules:
editor/plugin/list-utils/btn
*/
KISSY.add('editor/plugin/list-utils/btn', [
    'editor',
    '../button',
    '../menubutton'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Common btn for list.
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    require('../button');
    require('../menubutton');
    module.exports = {
        init: function (editor, cfg) {
            var buttonId = cfg.buttonId, cmdType = cfg.cmdType, tooltip = cfg.tooltip;
            var button = editor.addButton(buttonId, {
                    elCls: buttonId + 'Btn',
                    mode: Editor.Mode.WYSIWYG_MODE,
                    tooltip: '\u8BBE\u7F6E' + tooltip
                });
            editor.on('selectionChange', function () {
                var v;
                if (v = editor.queryCommandValue(cmdType)) {
                    button.set('checked', true);
                    arrow.set('value', v);
                } else {
                    button.set('checked', false);
                }
            });
            var arrow = editor.addSelect(buttonId + 'Arrow', {
                    tooltip: '\u9009\u62E9\u5E76\u8BBE\u7F6E' + tooltip,
                    mode: Editor.Mode.WYSIWYG_MODE,
                    menu: cfg.menu,
                    matchElWidth: false,
                    elCls: 'toolbar-' + buttonId + 'ArrowBtn'
                });
            arrow.on('click', function (e) {
                var v = e.target.get('value');
                button.listValue = v;
                editor.execCommand(cmdType, v);
                editor.focus();
            });
            button.on('click', function () {
                var v = button.listValue;    // checked 取 arrow 的 value，用来取消
                // checked 取 arrow 的 value，用来取消
                if (button.get('checked')) {
                    v = arrow.get('value');
                }
                editor.execCommand(cmdType, v);
                editor.focus();
            });
        }
    };
});


