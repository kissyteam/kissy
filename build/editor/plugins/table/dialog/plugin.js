KISSY.Editor.add("table/dialog", function(editor) {
    var S = KISSY,
        KE = S.Editor;

    KE.use("table/dialog/support", function() {
        editor.addDialog("table/dialog", new KE.TableUI.Dialog(editor));
    });

},{
    attach:false
});