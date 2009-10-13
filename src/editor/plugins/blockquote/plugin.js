KISSY.Editor.add("plugins~blockquote", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom,
        TYPE = E.PLUGIN_TYPE,

        BLOCKQUOTE = "blockquote",
        BLOCKQUOTE_ELEMENTS = E.Dom.BLOCK_ELEMENTS;

    E.addPlugin("blockquote", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         */
        exec: function() {
            var editor = this.editor,
                range = editor.getSelectionRange(),
                parentEl = E.Range.getCommonAncestor(range),
                quotableAncestor;

            if(!parentEl) return;

            // 获取可引用的父元素
            if (this.isQuotableElement(parentEl)) {
                quotableAncestor = parentEl;
            } else {
                quotableAncestor = this.getQuotableAncestor(parentEl);
            }

            // exec
            if (quotableAncestor) {
                var isQuoted = quotableAncestor.parentNode.nodeName.toLowerCase() === BLOCKQUOTE;
                editor.execCommand(isQuoted ? "outdent" : "indent", null, false);
            }
        },

        /**
         * 获取可引用的父元素
         */
        getQuotableAncestor: function(el) {
            var self = this;
            return Dom.getAncestorBy(el, function(elem) {
                return self.isQuotableElement(elem);
            });
        },

        /**
         * 判断是否可对齐元素
         */
        isQuotableElement: function(el) {
            return BLOCKQUOTE_ELEMENTS[el.nodeName.toLowerCase()];
        }
    });
});

// NOTES:
//  目前样式仿 Google Docs
