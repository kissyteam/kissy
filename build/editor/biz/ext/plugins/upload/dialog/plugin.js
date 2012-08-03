KISSY.Editor.add("multi-upload/dialog", function(editor) {
    var S = KISSY,
        KE = S.Editor;
    KE.use("multi-upload/dialog/support", function() {
        editor.addDialog("multi-upload/dialog",
            new KE['MultiUpload'].Dialog(editor));
    });
}, {
    attach:false
});