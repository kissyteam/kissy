
KISSY.Editor.add("plugins~justify", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom,
        TYPE = E.PLUGIN_TYPE,
        UA = YAHOO.env.ua,

        // Ref: CKEditor - core/dom/elementpath.js
        JUSTIFY_ELEMENTS = {

            /* 结构元素 */
            blockquote:1,
            div:1,
            h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,
            hr:1,
            p:1,

            /* 文本格式元素 */
            address:1,
            center:1,
            pre:1,

            /* 表单元素 */
            form:1,
            fieldset:1,
            caption:1,

            /* 表格元素 */
            table:1,
            tbody:1,
            tr:1, th:1, td:1,

            /* 列表元素 */
            ul:1, ol:1, dl:1,
            dt:1, dd:1, li:1
        },

        plugin = {
            /**
             * 种类：普通按钮
             */
            type: TYPE.TOOLBAR_BUTTON,

            /**
             * 响应函数
             * @param {KISSY.Editor} editor
             */
            exec: function(editor) {
                editor.execCommand(this.name);
            }
        };

    // 注：ie 下，默认使用 align 属性来实现对齐
    // 下面采用自主操作 range 的方式来实现，以保持和其它浏览器一致
    if (UA.ie) {

        plugin.exec = function(editor) {
            var range = editor.getSelectionRange(),
                parentEl, justifyAncestor;

            if(range.parentElement) { // TextRange
                parentEl = range.parentElement();
            } else if(range.item) { // ControlRange
                parentEl = range.item(0);
            } else { // 不做任何处理
                return;
            }

            // 获取可对齐的父元素
            if (isJustifyElement(parentEl)) {
                justifyAncestor = parentEl;
            } else {
                justifyAncestor = getJustifyAncestor(parentEl);
            }

            // 设置 text-align
            if (justifyAncestor) {
                justifyAncestor.style.textAlign = this.name.substring(7).toLowerCase();
            }

            /**
             * 获取可设置对齐的父元素
             */
            function getJustifyAncestor(el) {
                return Dom.getAncestorBy(el, function(arg) {
                    return isJustifyElement(arg);
                });
            }

            /**
             * 判断是否可对齐元素
             */
            function isJustifyElement(el) {
                return JUSTIFY_ELEMENTS[el.nodeName.toLowerCase()];
            }
        };
    }
    
    // 注册插件
    E.addPlugin(["justifyLeft", "justifyCenter", "justifyRight"], plugin);

});
