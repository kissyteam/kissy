KISSY.Editor.add("multi-upload", function(editor) {
    var S = KISSY,
        KE = S.Editor;

    if (!KE['Env']['mods']["multi-upload/dialog"]) {
        KE.add({
            "multi-upload/dialog":{
                attach: false,
                charset:"utf-8",
                fullpath:KE.Utils.debugUrl(
                    "../biz/ext/plugins/upload/" +
                        "dialog/plugin.js"
                    )
            }
        });


        KE.add({
            "multi-upload/dialog/support":{
                attach: false,
                charset:"utf-8",
                requires:["progressbar","localstorage","overlay"],
                fullpath:KE.Utils.debugUrl(
                    "../biz/ext/plugins/upload/" +
                        "dialog/support/plugin.js"
                    )
            }
        });
    }

    editor.addPlugin("multi-upload", function() {
        var context = editor.addButton("multi-upload", {
            contentCls:"ke-toolbar-mul-image",
            title:"批量插图",
            mode:KE.WYSIWYG_MODE,
            offClick:function() {
                var editor = this.editor;
                editor.showDialog("multi-upload/dialog");
            },
            destroy:function() {
                this.editor.destroyDialog("multi-upload/dialog");
            }
        });

        this.destroy = function() {
            context.destroy();
        };
    });

}, {
    attach:false
});