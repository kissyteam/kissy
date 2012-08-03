KISSY.Editor.add("video/dialog", function(editor) {
    var S = KISSY,
        KE = S.Editor;
    KE.use("video/dialog/support", function() {
        editor.addDialog("video/dialog", new KE.Video.Dialog(editor));
    });
},{
    attach:false
});