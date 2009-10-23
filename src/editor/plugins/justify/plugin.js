
KISSY.Editor.add("plugins~justify", function(E) {

    var //Y = YAHOO.util, Dom = Y.Dom,
        TYPE = E.PLUGIN_TYPE,
        NAMES = ["justifyLeft", "justifyCenter", "justifyRight"],
        //UA = YAHOO.env.ua,

        //JUSTIFY_ELEMENTS = E.Dom.BLOCK_ELEMENTS,

        plugin = {
            /**
             * 种类：普通按钮
             */
            type: TYPE.TOOLBAR_BUTTON,

            /**
             * 响应函数
             */
            exec: function() {
                // 执行命令
                this.editor.execCommand(this.name);

                // 更新状态
                this.editor.toolbar.updateState(NAMES);
            }
        };

    // 注：ie 下，默认使用 align 属性来实现对齐
    // 下面采用自主操作 range 的方式来实现，以保持和其它浏览器一致
    // 注：选择区域有多个块时，下面的代码有问题 [Issue 4]
    // 暂时依旧用默认的浏览器命令
//    if (UA.ie) {
//
//        plugin.exec = function() {
//            var range = this.editor.getSelectionRange(),
//                parentEl, justifyAncestor;
//
//            if(range.parentElement) { // TextRange
//                parentEl = range.parentElement();
//            } else if(range.item) { // ControlRange
//                parentEl = range.item(0);
//            } else { // 不做任何处理
//                return;
//            }
//
//            // 获取可对齐的父元素
//            if (isJustifyElement(parentEl)) {
//                justifyAncestor = parentEl;
//            } else {
//                justifyAncestor = getJustifyAncestor(parentEl);
//            }
//
//            // 设置 text-align
//            if (justifyAncestor) {
//                justifyAncestor.style.textAlign = this.name.substring(7).toLowerCase();
//            }
//
//            /**
//             * 获取可设置对齐的父元素
//             */
//            function getJustifyAncestor(el) {
//                return Dom.getAncestorBy(el, function(elem) {
//                    return isJustifyElement(elem);
//                });
//            }
//
//            /**
//             * 判断是否可对齐元素
//             */
//            function isJustifyElement(el) {
//                return JUSTIFY_ELEMENTS[el.nodeName.toLowerCase()];
//            }
//        };
//    }


    // 注册插件
    E.addPlugin(NAMES, plugin);

});
