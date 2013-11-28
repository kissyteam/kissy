/**
 * @ignore
 * Add justify command identifier for Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Editor = require('editor');
    var alignRemoveRegex = /(-moz-|-webkit-|start|auto)/gi,
        defaultAlign = 'left';

    function exec(editor, textAlign) {
        editor.focus();
        editor.execCommand('save');
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
        editor.execCommand('save');
        editor.notifySelectionChange();
    }

    function isAlign(block, textAlign) {
        var align = block.css('text-align')
            .replace(alignRemoveRegex, '')|| defaultAlign;
        return align === textAlign;
    }

    return {
        addCommand: function (editor, command, textAlign) {
            if (!editor.hasCommand(command)) {

                editor.addCommand(command, {
                    exec: function (editor) {
                        exec(editor, textAlign);
                    }
                });

                editor.addCommand(Editor.Utils.getQueryCmd(command), {
                    exec: function (editor) {
                        var selection = editor.getSelection();
                        if (selection && !selection.isInvalid) {
                            var startElement = selection.getStartElement();
                            var path = new Editor.ElementPath(startElement);
                            var block = path.block || path.blockLimit;
                            if (!block || block.nodeName() === 'body') {
                                return false;
                            }
                            return isAlign(block, textAlign);
                        }
                    }
                });

            }
        }
    };
});