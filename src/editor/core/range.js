KISSY.Editor.add("core~range", function(E) {

    E.Range = {

        /**
         * 获取选中区域对象
         */
        getSelectionRange: function(win) {
            var doc = win.document,
                selection, range;

            if (win.getSelection) { // W3C
                selection = win.getSelection();

                if (selection.getRangeAt)
                    range = selection.getRangeAt(0);

                else { // Safari! TODO: 待测试
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
        }
    };

});
