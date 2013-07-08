﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:53
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/maximize
*/

/**
 * Maximize plugin
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/maximize", function (S, Editor, maximizeCmd) {
    var MAXIMIZE_CLASS = "maximize",
        RESTORE_CLASS = "restore",
        MAXIMIZE_TIP = "全屏",
        RESTORE_TIP = "取消全屏";


    function maximizePlugin() {

    }

    S.augment(maximizePlugin, {
        pluginRenderUI:function (editor) {
            maximizeCmd.init(editor);
            editor.addButton("maximize", {
                tooltip:MAXIMIZE_TIP,
                listeners:{
                    click:function () {
                        var self = this;
                        var checked = self.get("checked");
                        if (checked) {
                            editor.execCommand("maximizeWindow");
                            self.set("tooltip", RESTORE_TIP);
                            self.set("contentCls", RESTORE_CLASS);
                        } else {
                            editor.execCommand("restoreWindow");
                            self.set("tooltip", MAXIMIZE_TIP);
                            self.set("contentCls", MAXIMIZE_CLASS);
                        }

                        editor.focus();
                    }

                },
                checkable:true
            });
        }
    });

    return maximizePlugin;
}, {
    requires:['editor', './maximize/cmd']
});

