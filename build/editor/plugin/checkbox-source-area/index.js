/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * checkbox source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/checkbox-source-area/index", function (S, Editor) {
    var Node = S.Node;

    var SOURCE_MODE = Editor.SOURCE_MODE ,
        WYSIWYG_MODE = Editor.WYSIWYG_MODE;

    function CheckboxSourceArea(editor) {
        var self = this;
        self.editor = editor;
        self._init();
    }

    S.augment(CheckboxSourceArea, {
        _init:function () {
            var self = this,
                editor = self.editor,
                statusBarEl = editor.get("statusBarEl");
            self.holder = new Node("<span " +
                "style='zoom:1;display:inline-block;height:22px;line-height:22px;'>" +
                "<input style='margin:0 5px;vertical-align:middle;' " +
                "type='checkbox' />" +
                "<span style='vertical-align:middle;'>编辑源代码</span></span>")
                .appendTo(statusBarEl);
            var el = self.el = self.holder.one("input");
            el.on("click", self._check, self);
            editor.on("wysiwygMode", self._wysiwygmode, self);
            editor.on("sourceMode", self._sourcemode, self);
        },
        _sourcemode:function () {
            this.el.attr("checked", true);
        },
        _wysiwygmode:function () {
            this.el.attr("checked", false);
        },
        _check:function () {
            var self = this,
                editor = self.editor,
                el = self.el;
            if (el.attr("checked")) {
                editor.set("mode", SOURCE_MODE);
            } else {
                editor.set("mode", WYSIWYG_MODE);
            }
        },
        destroy:function () {
            this.holder.remove();
        }
    });

    function CheckboxSourceAreaPlugin(){

    }

    S.augment(CheckboxSourceAreaPlugin,{
        pluginRenderUI:function(editor){

            var c = new CheckboxSourceArea(editor);
            editor.on("destroy", function () {
                c.destroy();
            });
        }
    });

    return CheckboxSourceAreaPlugin;
}, {
    requires:["editor"]
});
