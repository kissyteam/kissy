
KISSY.Editor.add("plugins~indent", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Lang = YAHOO.lang,
        TYPE = E.PLUGIN_TYPE,
        UA = YAHOO.env.ua,

        INDENT_ELEMENTS = Lang.merge(E.Dom.BLOCK_ELEMENTS, {
            li: 0 // 取消 li 元素的单独缩进，让 ol/ul 整体缩进
        }),
        INDENT_STEP = "40",
        INDENT_UNIT = "px",

        plugin = {
            /**
             * 种类：普通按钮
             */
            type: TYPE.TOOLBAR_BUTTON,

            /**
             * 响应函数
             */
            exec: function() {
                this.editor.execCommand(this.name);
            }
        };

    // 注：ie 下，默认使用 blockquote 元素来实现缩进
    // 下面采用自主操作 range 的方式来实现，以保持和其它浏览器一致
    if (UA.ie) {

        plugin.exec = function() {
            var range = this.editor.getSelectionRange(),
                parentEl, indentableAncestor;

            if(range.parentElement) { // TextRange
                parentEl = range.parentElement();
            } else if(range.item) { // ControlRange
                parentEl = range.item(0);
            } else { // 不做任何处理
                return;
            }

            // TODO: 和 CKEditor 一样，完全实现多区域的 iterator
            // 下面用 blockquote 临时解决最常见的选区的多个块的父级元素刚好是body的情景
            // 注意：要求 blockquote 的样式为缩进样式
            if(parentEl === this.editor.contentDoc.body) {
                this.editor.execCommand(this.name);
                return;
            }
            // end of 临时解决方案

            // 获取可缩进的父元素
            if (isIndentableElement(parentEl)) {
                 indentableAncestor = parentEl;
            } else {
                 indentableAncestor = getIndentableAncestor(parentEl);
            }

            // 设置 margin-left
            if (indentableAncestor) {
                var val = parseInt(indentableAncestor.style.marginLeft) >> 0;
                val += (this.name === "indent" ? +1 : -1) * INDENT_STEP;

                indentableAncestor.style.marginLeft = val + INDENT_UNIT;
            }

            /**
             * 获取可缩进的父元素
             */
            function getIndentableAncestor(el) {
                return Dom.getAncestorBy(el, function(elem) {
                    return isIndentableElement(elem);
                });
            }

            /**
             * 判断是否可缩进元素
             */
            function isIndentableElement(el) {
                return INDENT_ELEMENTS[el.nodeName.toLowerCase()];
            }
        };
    }

    // 注册插件
    E.addPlugin(["indent", "outdent"], plugin);
 });

/**
 * NOTES:
 * 
 *  - 要想完全接管 ie 的默认实现，需要考虑的因素很多。比如：
 *     1. range 只含 inline 元素，上面的代码已实现
 *     2. range 含多个完整的块元素，这个需要实现一个 blockIterator
 *     3. range 含块元素和另一个块元素的部分，这个得需要实现一个 html parser 来协助
 *
 */
