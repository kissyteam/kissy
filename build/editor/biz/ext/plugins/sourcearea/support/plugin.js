/**
 * checkbox source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("checkbox-sourcearea/support", function() {
    var S = KISSY,
        KE = S.Editor,
        Node = S.Node;

    var SOURCE_MODE = KE.SOURCE_MODE ,
        WYSIWYG_MODE = KE.WYSIWYG_MODE;

    function CheckboxSourceArea(editor) {
        this.editor = editor;
        this._init();
    }

    S.augment(CheckboxSourceArea, {
        _init:function() {
            var self = this,
                editor = self.editor,
                statusDiv = editor.statusDiv;
            self.holder = new Node("<span " +
                "style='zoom:1;display:inline-block;height:22px;line-height:22px;'>" +
                "<input style='margin:0 5px;vertical-align:middle;' " +
                "type='checkbox' />" +
                "<span style='vertical-align:middle;'>编辑源代码</span></span>")
                .appendTo(statusDiv);
            self.el = self.holder.one("input");
            var el = self.el;
            el.on("click", self._check, self);
            editor.on("sourcemode", function() {
                el[0].checked = true;
            });
            editor.on("wysiwygmode", function() {
                el[0].checked = false;
            });
        },
        _check:function() {
            var self = this,el = self.el;
            if (el[0].checked) self._show();
            else self._hide();
            //ev && ev.stopPropagation();
        },
        _show:function() {
            var self = this,
                editor = self.editor;
            KE.SourceAreaSupport.exec(editor, SOURCE_MODE);
        },


        _hide:function() {
            var self = this,
                editor = self.editor;
            KE.SourceAreaSupport.exec(editor, WYSIWYG_MODE);
        },

        destroy:function() {
            this.el.detach();
            this.holder.remove();
        }
    });
    KE.CheckboxSourceArea = CheckboxSourceArea;
},
{
    attach:false,
    requires : ["sourcearea/support"]
});
