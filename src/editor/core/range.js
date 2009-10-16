KISSY.Editor.add("core~range", function(E) {

    var isIE = YAHOO.env.ua.ie;

    E.Range = {

        /**
         * 获取选中区域对象
         */
        getSelectionRange: function(win) {
            var doc = win.document,
                selection, range;

            if (win.getSelection) { // W3C
                selection = win.getSelection();

                if (selection.getRangeAt) {
                    range = selection.getRangeAt(0);

                } else { // for Old Webkit! 高版本的已经支持 getRangeAt
                    range = doc.createRange();
                    range.setStart(selection.anchorNode, selection.anchorOffset);
                    range.setEnd(selection.focusNode, selection.focusOffset);
                }

            } else if (doc.selection) { // IE
                range = doc.selection.createRange();
            }

            return range;
        },

        /**
         * 获取容器
         */
        getCommonAncestor: function(range) {
            return range.startContainer || // w3c
                   (range.parentElement && range.parentElement()) || // ms TextRange
                   (range.commonParentElement && range.commonParentElement()); // ms IHTMLControlRange
        },

        /**
         * 获取选中文本
         */
        getSelectedText: function(range) {
            if("text" in range) return range.text;
            return range.toString ? range.toString() : ""; // ms IHTMLControlRange 无 toString 方法
        },

        /**
         * 保存选区 for ie
         */
        saveRange: function(editor) {
            // 1. 保存 range, 以便还原
            isIE && editor.contentWin.focus(); // 确保下面这行 range 是编辑区域的，否则 [Issue 39]

            // 2. 聚集到按钮上，隐藏光标，否则 ie 下光标会显示在层上面
            // 通过 blur / focus 等方式在 ie7- 下无效
            // 注意：2 和 1 冲突。权衡考虑，还是取消2
            //isIE && editor.contentDoc.selection.empty();

            return editor.getSelectionRange();
        }
    };

});
