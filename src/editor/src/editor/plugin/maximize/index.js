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
                checkable:true
            }, {
                onClick:function () {
                    var self = this;
                    editor.execCommand("restoreWindow");
                    self.set("tooltip", MAXIMIZE_TIP);
                    self.set("contentCls", MAXIMIZE_CLASS);
                    editor.focus();
                },
                offClick:function () {
                    var self = this;
                    editor.execCommand("maximizeWindow");
                    self.set("tooltip", RESTORE_TIP);
                    self.set("contentCls", RESTORE_CLASS);
                    editor.focus();
                }
            });
        }
    };
}, {
    requires:['editor', './cmd']
});