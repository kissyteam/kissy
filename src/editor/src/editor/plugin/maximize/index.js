/**
 * Maximize plugin
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/maximize/index", function (S, KE, maximizeCmd) {
    var MAXIMIZE_CLASS = "ke-toolbar-maximize",
        RESTORE_CLASS = "ke-toolbar-restore",
        MAXIMIZE_TIP = "全屏",
        RESTORE_TIP = "取消全屏";

    return {
        init:function (editor) {
            maximizeCmd.init(editor);
            editor.addButton({
                title:MAXIMIZE_TIP,
                contentCls:MAXIMIZE_CLASS
            }, {
                onClick:function () {
                    var self = this;
                    editor.execCommand("restoreWindow");
                    self.boff();
                    self.set("title", MAXIMIZE_TIP);
                    self.set("contentCls", MAXIMIZE_CLASS);
                },
                offClick:function () {
                    var self = this;
                    editor.execCommand("maximizeWindow");
                    self.bon();
                    self.set("title", RESTORE_TIP);
                    self.set("contentCls", RESTORE_CLASS);
                }
            });
        }
    };
}, {
    requires:['editor', './cmd']
});