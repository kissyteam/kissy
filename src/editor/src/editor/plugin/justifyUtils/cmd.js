/**
 * Add justify command identifier for Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/justifyUtils/cmd", function (S, KE) {
    var alignRemoveRegex = /(-moz-|-webkit-|start|auto)/gi,
        default_align = "left";

    function exec(editor, textAlign) {
        editor.execCommand("save");
        var selection = editor.getSelection(),
            bookmarks = selection.createBookmarks(),
            ranges = selection.getRanges(),
            iterator,
            block;
        for (var i = ranges.length - 1; i >= 0; i--) {
            iterator = ranges[ i ].createIterator();
            iterator.enlargeBr = true;
            while (( block = iterator.getNextParagraph() )) {
                block.removeAttr('align');
                if (isAlign(block, textAlign)) {
                    block.css('text-align', '');
                } else {
                    block.css('text-align', textAlign);
                }
            }
        }
        selection.selectBookmarks(bookmarks);
        editor.execCommand("save");
        editor.notifySelectionChange();
    }

    function isAlign(block, textAlign) {
        var align = block.css("text-align")
            .replace(alignRemoveRegex, "")
            //默认值，没有设置
            || default_align;
        return align == textAlign;
    }

    return {
        addCommand:function (editor, command, textAlign) {
            if (!editor.hasCommand(command)) {

                editor.addCommand(command, {
                    exec:function (editor) {
                        exec(editor, textAlign);
                    }
                });

                editor.addCommand(KE.Utils.getQueryCmd(command), {
                    exec:function (editor, path) {
                        var block = path.block || path.blockLimit;
                        if (!block || block._4e_name() === "body") {
                            return false;
                        }
                        return isAlign(block, textAlign);
                    }
                });

            }
        }
    };
}, {
    requires:['editor']
});