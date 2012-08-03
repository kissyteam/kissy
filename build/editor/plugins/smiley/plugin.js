/**
 * smiley icon from wangwang for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("smiley", function(editor) {
    editor.addPlugin("smiley", function() {
        var KE = KISSY.Editor;
        var context = editor.addButton("smiley", {
            contentCls:"ke-toolbar-smiley",
            title:"插入表情",
            mode:KE.WYSIWYG_MODE,
            loading:true
        });
        KE.use("smiley/support", function() {
            context.reload(KE.SmileySupport);
        });
        this.destroy=function(){
          context.destroy();
        };
    });
},{
    attach:false
});
