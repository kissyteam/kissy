/**
 * checkbox source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/checkboxSourcearea/index", function (S, KE) {
    var Node = S.Node;

    var SOURCE_MODE = KE.SOURCE_MODE ,
        WYSIWYG_MODE = KE.WYSIWYG_MODE;

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

    return {
        init:function (editor) {
            var c = new CheckboxSourceArea(editor);
            editor.on("destroy", function () {
                c.destroy();
            });
        }
    }
}, {
    requires:["editor"]
});
