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
        }
    };

});
