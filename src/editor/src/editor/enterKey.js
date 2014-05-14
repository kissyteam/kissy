/**
 * @ignore
 * monitor user's enter and shift enter keydown
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add(function (S, require) {
    var util = S;
    var Node = require('node');
    var $ = Node.all;
    var UA = require('ua');
    var Walker = require('./walker');
    var Editor = require('./base');
    var ElementPath = require('./elementPath');
    var OLD_IE = UA.ieMode < 11;
    var headerPreTagRegex = /^(?:h[1-6])|(?:pre)$/i,
        dtd = Editor.XHTML_DTD;

    function getRange(editor) {
        // Get the selection ranges.
        var ranges = editor.getSelection().getRanges();
        // Delete the contents of all ranges except the first one.
        for (var i = ranges.length - 1; i > 0; i--) {
            ranges[ i ].deleteContents();
        }
        // Return the first range.
        return ranges[ 0 ];
    }

    function enterBlock(editor) {
        // Get the range for the current selection.
        var range = getRange(editor);
        var doc = range.document;
        var path = new ElementPath(range.startContainer),
            isStartOfBlock = range.checkStartOfBlock(),
            isEndOfBlock = range.checkEndOfBlock(),
            block = path.block;
        // Exit the list when we're inside an empty list item block. (#5376)
        if (isStartOfBlock && isEndOfBlock) {
            // 只有两层？
            if (block && (block.nodeName() === 'li' || block.parent().nodeName() === 'li')) {
                if (editor.hasCommand('outdent')) {
                    editor.execCommand('save');
                    editor.execCommand('outdent');
                    editor.execCommand('save');
                    return true;
                } else {
                    return false;
                }
            }
        } else if (block && block.nodeName() === 'pre') {
            // Don't split <pre> if we're in the middle of it, add \r or br
            if (!isEndOfBlock) {
                // insert '\r'
                var lineBreak = UA.ieMode < 9 ? $(doc.createTextNode('\r')) : $(doc.createElement('br'));
                range.insertNode(lineBreak);
                if (UA.ieMode < 9) {
                    // empty character to force wrap line in ie<9
                    lineBreak = $(doc.createTextNode('\ufeff')).insertAfter(lineBreak);
                    range.setStartAt(lineBreak, Editor.RangeType.POSITION_AFTER_START);
                } else {
                    range.setStartAfter(lineBreak);
                }
                range.collapse(true);
                range.select();
                if (UA.ieMode < 9) {
                    lineBreak[0].nodeValue = '';
                }
                return;
            }
        }

        // Determine the block element to be used.
        var blockTag = 'p';

        // Split the range.
        var splitInfo = range.splitBlock(blockTag);

        if (!splitInfo) {
            return true;
        }

        // Get the current blocks.
        var previousBlock = splitInfo.previousBlock,
            nextBlock = splitInfo.nextBlock;

        isStartOfBlock = splitInfo.wasStartOfBlock;
        isEndOfBlock = splitInfo.wasEndOfBlock;

        var node;

        // If this is a block under a list item, split it as well. (#1647)
        if (nextBlock) {
            node = nextBlock.parent();
            if (node.nodeName() === 'li') {
                nextBlock._4eBreakParent(node);
                nextBlock._4eMove(nextBlock.next(), true);
            }
        } else if (previousBlock && (node = previousBlock.parent()) && node.nodeName() === 'li') {
            previousBlock._4eBreakParent(node);
            range.moveToElementEditablePosition(previousBlock.next());
            previousBlock._4eMove(previousBlock.prev());
        }

        var newBlock;

        // If we have both the previous and next blocks, it means that the
        // boundaries were on separated blocks, or none of them where on the
        // block limits (start/end).
        if (!isStartOfBlock && !isEndOfBlock) {
            // If the next block is an <li> with another list tree as the first
            // child, we'll need to append a filler (<br>/NBSP) or the list item
            // wouldn't be editable. (#1420)
            if (nextBlock.nodeName() === 'li' &&
                (node = nextBlock.first(Walker.invisible(true))) &&
                util.inArray(node.nodeName(), ['ul', 'ol'])) {
                (OLD_IE ? new Node(doc.createTextNode('\xa0')) :
                    new Node(doc.createElement('br'))).insertBefore(node);
            }

            // Move the selection to the end block.
            if (nextBlock) {
                range.moveToElementEditablePosition(nextBlock);
            }
        } else {
            if (previousBlock) {
                // Do not enter this block if it's a header tag, or we are in
                // a Shift+Enter (#77). Create a new block element instead
                // (later in the code).
                // end of pre, start p
                if (previousBlock.nodeName() === 'li' || !(headerPreTagRegex.test(previousBlock.nodeName()))) {
                    // Otherwise, duplicate the previous block.
                    newBlock = previousBlock.clone();
                }
            } else if (nextBlock) {
                newBlock = nextBlock.clone();
            }

            if (!newBlock) {
                newBlock = new Node('<' + blockTag + '>', null, doc);
            }

            // Recreate the inline elements tree, which was available
            // before hitting enter, so the same styles will be available in
            // the new block.
            var elementPath = splitInfo.elementPath;
            if (elementPath) {
                for (var i = 0, len = elementPath.elements.length; i < len; i++) {
                    var element = elementPath.elements[ i ];

                    if (element.equals(elementPath.block) ||
                        element.equals(elementPath.blockLimit)) {
                        break;
                    }
                    //<li><strong>^</strong></li>
                    if (dtd.$removeEmpty[ element.nodeName() ]) {
                        element = element.clone();
                        newBlock._4eMoveChildren(element);
                        newBlock.append(element);
                    }
                }
            }

            if (!OLD_IE) {
                newBlock._4eAppendBogus();
            }

            range.insertNode(newBlock);

            // This is tricky, but to make the new block visible correctly
            // we must select it.
            // The previousBlock check has been included because it may be
            // empty if we have fixed a block-less space (like ENTER into an
            // empty table cell).
            if (OLD_IE && isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)) {
                // Move the selection to the new block.
                range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
                range.select();
            }

            // Move the selection to the new block.
            range.moveToElementEditablePosition(isStartOfBlock && !isEndOfBlock ? nextBlock : newBlock);
        }

        if (!OLD_IE) {
            if (nextBlock) {
                // If we have split the block, adds a temporary span at the
                // range position and scroll relatively to it.
                var tmpNode = new Node(doc.createElement('span'));

                // We need some content for Safari.
                tmpNode.html('&nbsp;');

                range.insertNode(tmpNode);
                tmpNode.scrollIntoView(undefined, {
                    alignWithTop: false,
                    allowHorizontalScroll: true,
                    onlyScrollIfNeeded: true
                });
                range.deleteContents();
            } else {
                // We may use the above scroll logic for the new block case
                // too, but it gives some weird result with Opera.
                newBlock.scrollIntoView(undefined, {
                    alignWithTop: false,
                    allowHorizontalScroll: true,
                    onlyScrollIfNeeded: true
                });
            }
        }
        range.select();
        return true;
    }

    function enterKey(editor) {
        var doc = editor.get('document');
        doc.on('keydown', function (ev) {
            var keyCode = ev.keyCode;
            if (keyCode === 13) {
                if (!(ev.shiftKey || ev.ctrlKey || ev.metaKey)) {
                    editor.execCommand('save');
                    var re = editor.execCommand('enterBlock');
                    editor.execCommand('save');
                    if (re !== false) {
                        ev.preventDefault();
                    }
                }
            }
        });
    }

    return {
        init: function (editor) {
            editor.addCommand('enterBlock', {
                exec: enterBlock
            });
            editor.docReady(function () {
                enterKey(editor);
            });
        }
    };
});