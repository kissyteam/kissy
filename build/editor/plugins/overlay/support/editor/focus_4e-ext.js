/**
 * save and restore focus when overlay shows or hides
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("overlay/focus", function() {
    var S = KISSY,
        UA = S.UA,
        KE = S.Editor,
        focusManager = KE.focusManager;
    KE.namespace("UIBase");
    if (KE['UIBase'].Focus) {
        S.log("ke uibase focus attach more", "warn");
        return;
    }

    function FocusExt() {
        //S.log("FocusExt init");
    }

    FocusExt.ATTRS = {
        focus4e:{
            value:true
        }
    };

    FocusExt.prototype = {
        _uiSetFocus4e:function(v) {
            var self = this;
            if (v) {
                self.on("show", self._show4FocusExt, self);
                self.on("hide", self._hide4FocusExt, self);
            } else {
                self.detach("show", self._show4FocusExt, self);
                self.detach("hide", self._hide4FocusExt, self);
            }
        },
        __syncUI:function() {
            //S.log("_syncUIFocusExt");
        },
        __renderUI:function() {
            //S.log("_renderUIFocusExt");
        },
        __bindUI:function() {
            var self = this;
            self._focus4e = new S.Node("<a " +
                "href='#' " +
                "class='ke-focus' " +
                "style='" +
                "width:0;" +
                "height:0;" +
                "margin:0;" +
                "padding:0;" +
                "overflow:hidden;" +
                "outline:none;" +
                "font-size:0;'" +
                "></a>").appendTo(self.get("el"));
        },
        _show4FocusExt:function() {
            var self = this;
            //保存当前焦点editor
            self._focusEditor = focusManager.currentInstance();
            var editor = self._focusEditor;
            /*
             * IE BUG: If the initial focus went into a non-text element (e.g. button,image),
             * then IE would still leave the caret inside the editing area.
             */
            //ie9 图片resize框，仍然会突出
            if (UA['ie'] && editor) {

                //聚焦到当前窗口
                //使得编辑器失去焦点，促使ie保存当前选择区域（位置）
                //chrome 需要下面两句
                window['focus']();
                document.body.focus();

                //firefox 需要下面一句
                self._focus4e[0].focus();

                var $selection = editor.document.selection,
                    $range = $selection.createRange();
                if ($range) {
                    if (
                    //修改ckeditor，如果单纯选择文字就不用管了
                    //$range.parentElement &&
                    //$range.parentElement().ownerDocument == editor.document
                    //||
                    //缩放图片那个框在ie下会突出浮动层来
                        $range.item
                            && $range.item(0).ownerDocument == editor.document) {
                        var $myRange = document.body.createTextRange();
                        $myRange.moveToElementText(self.get("el")._4e_first()[0]);
                        $myRange.collapse(true);
                        $myRange.select();
                    }
                }
            }


        },
        _hide4FocusExt:function() {
            var editor = this._focusEditor;
            editor && editor.focus();
        }
    };
    KE['UIBase'].Focus = FocusExt;

}, {
    attach:false
});