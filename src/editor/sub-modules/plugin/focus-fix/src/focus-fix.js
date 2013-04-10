/**
 * save and restore focus when overlay shows or hides
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/focus-fix", function (S, Editor) {
    var UA = S.UA,
        focusManager = Editor.focusManager;

    function _show4FocusExt() {
        var self = this;
        // 保存当前焦点editor

        self._focusEditor = focusManager.currentInstance();
        var editor = self._focusEditor;
        /*
         * IE BUG: If the initial focus went into a non-text element (e.g. button,image),
         * then IE would still leave the caret inside the editing area.
         */
        // ie9 图片resize框，仍然会突出
        if (UA['ie'] && editor) {
            // 聚焦到当前窗口
            // 使得编辑器失去焦点，促使ie保存当前选择区域（位置）
            // chrome 需要下面两句
            window['focus']();
            document.body.focus();

            var $selection = editor.get("document")[0].selection,
                $range;
            // 中途更改了 domain，编辑器失去焦点，不能取得 range
            // 拒绝访问错误
            try {
                $range = $selection.createRange();
            } catch (e) {
                $range = 0;
            }
            if ($range) {
                if (
                // 如果单纯选择文字就不用管了
                // $range.parentElement &&
                // $range.parentElement().ownerDocument == editor.document
                // ||
                // 缩放图片那个框在ie下会突出浮动层来
                    $range.item
                        && $range.item(0).ownerDocument == editor.get("document")[0]) {
                    var $myRange = document.body.createTextRange();
                    $myRange.moveToElementText(self.get("el").first()[0]);
                    $myRange.collapse(true);
                    $myRange.select();
                }
            }
        }
    }

    function _hide4FocusExt() {
        var editor = this._focusEditor;
        editor && editor.focus();
    }

    return {
        init:function (self) {
            self.on("beforeVisibleChange", function (e) {
                if (e.newVal) {
                    _show4FocusExt.call(self);
                }
            });
            self.on("hide", function () {
                _hide4FocusExt.call(self);
            });
        }
    };

}, {
    requires:['editor']
});