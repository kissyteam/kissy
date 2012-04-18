/**
 * monitor user's enter and shift enter keydown,modified from ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/enterKey/index", function (S) {
    var KE = S.Editor,
        UA = S.UA,
        headerTagRegex = /^h[1-6]$/,
        dtd = KE.XHTML_DTD,
        Node = S.Node,
        Event = S.Event,
        Walker = KE.Walker,
        ElementPath = KE.ElementPath;


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
        //debugger;
        // Get the range for the current selection.
        var range = getRange(editor);
        var doc = range.document;
        // Exit the list when we're inside an empty list item block. (#5376)
        if (range.checkStartOfBlock() && range.checkEndOfBlock()) {
            var path = new ElementPath(range.startContainer),
                block = path.block;
            //只有两层？
            if (block &&
                ( block._4e_name() == 'li' || block.parent()._4e_name() == 'li' )

                ) {
                if (editor.hasCommand('outdent')) {
                    editor.execCommand("save");
                    editor.execCommand('outdent');
                    editor.execCommand("save");
                    return true;
                } else {
                    return false;
                }
            }
        }

        // Determine the block element to be used.
        var blockTag = "p";

        // Split the range.
        var splitInfo = range.splitBlock(blockTag);

        if (!splitInfo)
            return true;

        // Get the current blocks.
        var previousBlock = splitInfo.previousBlock,
            nextBlock = splitInfo.nextBlock;

        var isStartOfBlock = splitInfo.wasStartOfBlock,
            isEndOfBlock = splitInfo.wasEndOfBlock;

        var node;

        // If this is a block under a list item, split it as well. (#1647)
        if (nextBlock) {
            node = nextBlock.parent();
            if (node._4e_name() == 'li') {
                nextBlock._4e_breakParent(node);
                nextBlock._4e_move(nextBlock._4e_next(), true);
            }
        }
        else if (previousBlock && ( node = previousBlock.parent() ) && node._4e_name() == 'li') {
            previousBlock._4e_breakParent(node);
            range.moveToElementEditablePosition(previousBlock._4e_next());
            previousBlock._4e_move(previousBlock._4e_previous());
        }

        // If we have both the previous and next blocks, it means that the
        // boundaries were on separated blocks, or none of them where on the
        // block limits (start/end).
        if (!isStartOfBlock && !isEndOfBlock) {
            // If the next block is an <li> with another list tree as the first
            // child, we'll need to append a filler (<br>/NBSP) or the list item
            // wouldn't be editable. (#1420)
            if (nextBlock._4e_name() == 'li'
                &&
                ( node = nextBlock._4e_first(Walker.invisible(true)) )
                && S.inArray(node._4e_name(), ['ul', 'ol']))
                (UA['ie'] ? new Node(doc.createTextNode('\xa0')) : new Node(doc.createElement('br'))).insertBefore(node);

            // Move the selection to the end block.
            if (nextBlock)
                range.moveToElementEditablePosition(nextBlock);
        }
        else {
            var newBlock;

            if (previousBlock) {
                // Do not enter this block if it's a header tag, or we are in
                // a Shift+Enter (#77). Create a new block element instead
                // (later in the code).
                if (previousBlock._4e_name() == 'li' || !headerTagRegex.test(previousBlock._4e_name())) {
                    // Otherwise, duplicate the previous block.
                    newBlock = previousBlock._4e_clone();
                }
            }
            else if (nextBlock)
                newBlock = nextBlock._4e_clone();

            if (!newBlock)
                newBlock = new Node("<" + blockTag + ">", null, doc);

            // Recreate the inline elements tree, which was available
            // before hitting enter, so the same styles will be available in
            // the new block.
            var elementPath = splitInfo.elementPath;
            if (elementPath) {
                for (var i = 0, len = elementPath.elements.length; i < len; i++) {
                    var element = elementPath.elements[ i ];

                    if (element.equals(elementPath.block) || element.equals(elementPath.blockLimit))
                        break;
                    //<li><strong>^</strong></li>
                    if (dtd.$removeEmpty[ element._4e_name() ]) {
                        element = element._4e_clone();
                        newBlock._4e_moveChildren(element);
                        newBlock.append(element);
                    }
                }
            }

            if (!UA['ie'])
                newBlock._4e_appendBogus();

            range.insertNode(newBlock);

            // This is tricky, but to make the new block visible correctly
            // we must select it.
            // The previousBlock check has been included because it may be
            // empty if we have fixed a block-less space (like ENTER into an
            // empty table cell).
            if (UA['ie'] && isStartOfBlock && ( !isEndOfBlock || !previousBlock[0].childNodes.length )) {
                // Move the selection to the new block.
                range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
                range.select();
            }

            // Move the selection to the new block.
            range.moveToElementEditablePosition(isStartOfBlock && !isEndOfBlock ? nextBlock : newBlock);
        }

        if (!UA['ie']) {
            if (nextBlock) {
                // If we have split the block, adds a temporary span at the
                // range position and scroll relatively to it.
                var tmpNode = new Node(doc.createElement('span'));

                // We need some content for Safari.
                tmpNode.html('&nbsp;');

                range.insertNode(tmpNode);
                tmpNode._4e_scrollIntoView();
                range.deleteContents();
            }
            else {
                // We may use the above scroll logic for the new block case
                // too, but it gives some weird result with Opera.
                newBlock._4e_scrollIntoView();
            }
        }
        range.select();
        return true;
    }

    function EnterKey(editor) {
        var doc = editor.get("document")[0];
        Event.on(doc, "keydown", function (ev) {
            var keyCode = ev.keyCode;
            if (keyCode === 13) {
                if (ev.shiftKey || ev.ctrlKey || ev.metaKey) {
                } else {
                    editor.execCommand("save");
                    var re = editor.execCommand("enterBlock");
                    editor.execCommand("save");
                    if (re !== false) {
                        ev.preventDefault();
                    }
                }
            }
        });
    }

    return {
        init:function (editor) {
            editor.addCommand("enterBlock", {
                exec:enterBlock
            });
            editor.docReady(function () {
                EnterKey(editor);
            });
        }
    };
}, {
    requires:['editor']
});
