/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 10 21:07
*/
/**
 * Maximize plugin
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/maximize/index", function (S, Editor, maximizeCmd) {
    var MAXIMIZE_CLASS = "maximize",
        RESTORE_CLASS = "restore",
        MAXIMIZE_TIP = "全屏",
        RESTORE_TIP = "取消全屏";

    return {
        init:function (editor) {
            maximizeCmd.init(editor);
            editor.addButton("maximize", {
                tooltip:MAXIMIZE_TIP,
                listeners:{
                    click:{
                        fn:function () {
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
                    }
                },
                checkable:true
            });
        }
    };
}, {
    requires:['editor', './cmd']
});
