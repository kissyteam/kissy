KISSY.Editor.add("flash/dialog", function(editor) {
    var KE = KISSY.Editor;
    KE.use("flash/dialog/support", function() {
        editor.addDialog("flash/dialog", new KE.Flash.FlashDialog(editor));
    });
},{
    attach:false
});