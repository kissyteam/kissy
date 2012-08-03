/**
 * list formatting
 * @modifier yiminghe@gmail.com
 */
KISSY.Editor.add("list", function(editor) {
    editor.addPlugin("list", function() {
        var KE = KISSY.Editor;

        var context = editor.addButton("ul", {
            title:"项目列表",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-ul",
            loading:true,
            type:"ul"
        });
        var contextOl = editor.addButton("ol", {
            title:"编号列表",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-ol",
            loading:true,
            type:"ol"
        });
        KE.use("list/support", function() {
            context.reload(KE.ListSupport);
            contextOl.reload(KE.ListSupport);
        });

        this.destroy = function() {
            context.destroy();
            contextOl.destroy();
        };
    });

}, {
    attach:false
});
