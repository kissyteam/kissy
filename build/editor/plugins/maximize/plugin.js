/**
 * maximize editor
 * @author yiminghe@gmail.com
 * @note:firefox 焦点完全完蛋了，这里全是针对firefox
 */
KISSY.Editor.add("maximize", function (editor) {
    editor.addPlugin("maximize", function () {
        var S = KISSY,
            KE = S.Editor,
            UA = S.UA,
            MAXIMIZE_CLASS = "ke-toolbar-maximize";
        //firefox 3.5 不支持，有bug
        if (UA.gecko < 1.92)
            return;


        var context = editor.addButton("maximize", {
            title:"全屏",
            contentCls:MAXIMIZE_CLASS,
            loading:true
        });

        KE.use("maximize/support", function () {
            context.reload(KE.Maximize);
            editor.addCommand("maximizeWindow", {
                exec:function () {
                    context.call("offClick");
                }
            });
            editor.addCommand("restoreWindow", {
                exec:function () {
                    context.call("onClick");
                }
            });
        });
        this.destroy = function () {
            context.destroy();
        };
    });
}, {
    attach:false
});