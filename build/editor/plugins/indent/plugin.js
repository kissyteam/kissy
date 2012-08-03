/**
 * indent formatting
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("indent", function(editor) {
    editor.addPlugin("indent", function() {
        var KE = KISSY.Editor;

        var outdent = editor.addButton("outdent", {
            title:"减少缩进量 ",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-outdent",
            type:"outdent",
            loading:true
        });

        var indent = editor.addButton("indent", {
            title:"增加缩进量 ",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-indent",
            type:"indent",
            loading:true
        });

        KE.use("indent/support", function() {
            outdent.reload(KE.IndentSupport);
            indent.reload(KE.IndentSupport);
        });

        editor.addCommand("indent", {
            exec:function() {
                indent.call("offClick");
            }
        });

        editor.addCommand("outdent", {
            exec:function() {
                outdent.call("offClick");
            }
        });

        this.destroy = function() {
            outdent.destroy();
            indent.destroy();
        };
    });
}, {
    attach:false
});
