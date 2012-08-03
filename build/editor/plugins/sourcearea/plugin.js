/**
 * source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("sourcearea", function(editor) {
    editor.addPlugin("sourcearea", function() {
        var S = KISSY,
            KE = S.Editor,
            UA = S.UA;
        //firefox 3.5 不支持，有bug
        if (UA.gecko < 1.92) return;


        var SOURCE_MODE = KE.SOURCE_MODE ,
            WYSIWYG_MODE = KE.WYSIWYG_MODE,
            context = editor.addButton("sourcearea", {
            title:"源码",
            contentCls:"ke-toolbar-source",
            loading:true
        });

        KE.use("sourcearea/support", function() {
            context.reload({
                init:function() {
                    var self = this,
                        btn = self.btn,
                        editor = self.editor;
                    editor.on("wysiwygmode", btn.boff, btn);
                    editor.on("sourcemode", btn.bon, btn);
                },
                offClick:function() {
                    var self = this,
                        editor = self.editor;
                    editor.execCommand("sourceAreaSupport", SOURCE_MODE);
                },
                onClick:function() {
                    var self = this,
                        editor = self.editor;
                    editor.execCommand("sourceAreaSupport", WYSIWYG_MODE);
                }
            });
            editor.addCommand("sourceAreaSupport", KE.SourceAreaSupport);
        });

        this.destroy = function() {
            context.destroy();
        };


        //support wrap : http://www.w3.org/TR/2011/WD-html-markup-20110113/textarea.html

        function initWrap() {
            var textarea = editor.textarea;
            //textarea.attr("cols", 100);
            textarea.on("keydown", function(ev) {
                //ctrl+w
                if (ev.ctrlKey &&
                    ev.keyCode == 87) {
                    ev.halt();
                    var next = textarea.attr("wrap") == "off" ? "soft" : "off";
                    if (!UA['ie']) {
                        textarea.detach();
                        var newTextarea = textarea._4e_clone();
                        editor.textarea = newTextarea;
                        newTextarea.attr("wrap", next);
                        newTextarea.val(textarea.val());
                        textarea[0].parentNode.replaceChild(newTextarea[0], textarea[0]);
                        initWrap();
                        textarea = null;
                    } else {
                        textarea.attr("wrap", next);
                    }
                }
            });
        }

        initWrap();

    });
}, {
    attach:false
});
