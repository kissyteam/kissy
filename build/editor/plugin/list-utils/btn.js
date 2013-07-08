﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:53
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/list-utils/btn
*/

/**
 * Common btn for list.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/list-utils/btn", function (S, Editor) {

    return {

        init: function (editor, cfg) {
            var buttonId = cfg.buttonId,
                cmdType = cfg.cmdType,
                tooltip = cfg.tooltip;

            var button = editor.addButton(buttonId, {
                elCls: buttonId + 'Btn',
                mode: Editor.Mode.WYSIWYG_MODE,
                tooltip: "设置" + tooltip
            });

            editor.on("selectionChange", function () {
                var v;
                if (v = editor.queryCommandValue(cmdType)) {
                    button.set("checked", true);
                    arrow.set('value', v);
                } else {
                    button.set("checked", false);
                }
            });

            var arrow = editor.addSelect(buttonId + 'Arrow', {
                tooltip: "选择并设置" + tooltip,
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
                var v = button.listValue;
                // checked 取 arrow 的 value，用来取消
                if (button.get('checked')) {
                    v = arrow.get('value');
                }
                editor.execCommand(cmdType, v);
                editor.focus();
            });
        }

    };


}, {
    requires: ['editor', '../button', '../menubutton']
});

