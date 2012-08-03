/**
 * draft support for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("draft", function(editor) {
    var S = KISSY,KE = S.Editor;
    editor.addPlugin("draft", function() {
        var self = this;
        KE.use("draft/support", function() {
            KE.storeReady(function() {
                var d = new KE.Draft(editor);
                self.destroy = function() {
                    d.destroy();
                };
            });
        });
    });
}, {
    attach:false
});