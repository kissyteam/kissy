KISSY.Editor.add("music/dialog", function(editor) {
    var KE = KISSY.Editor;
    KE.use("music/dialog/support", function() {
        editor.addDialog("music/dialog", new KE.MusicInserter.Dialog(editor));
    });
},{
    attach:false
});