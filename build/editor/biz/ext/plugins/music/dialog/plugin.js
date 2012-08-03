KISSY.Editor.add("xiami-music/dialog", function(editor) {
    var KE = KISSY.Editor;
    KE.use("xiami-music/dialog/support", function() {
        editor.addDialog("xiami-music/dialog", new KE.XiamiMusic.Dialog(editor));
    });
},{
    attach:false
});