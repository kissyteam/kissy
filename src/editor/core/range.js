KISSY.Editor.add("core~range", function(E) {

    E.Range = {

        /**
         * 获取选区对象
         */
        getSelection: function(win) {
            var selection, doc = win.document;

            if (win.getSelection) { // W3C
                selection = win.getSelection();

            } else if (doc.selection) { // IE
                selection = doc.selection.createRange();
            }
            return selection;
        },

        /**
         * 获取选中区域的 Range 对象
         */
        getSelectionRange: function(win) {
            var range, selection = this.getSelection(win);

            if (selection.getRangeAt)
                range = selection.getRangeAt(0);

            else { // Safari! TODO: 待测试
                range = document.createRange();
                range.setStart(selection.anchorNode, selection.anchorOffset);
                range.setEnd(selection.focusNode, selection.focusOffset);
            }

            return range;
        }
    };

});
