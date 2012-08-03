/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("indent/support", function() {
    var KE = KISSY.Editor,
        listNodeNames = {ol:1,ul:1},
        S = KISSY,
        Walker = KE.Walker,
        DOM = S.DOM,
        Node = S.Node,
        UA = S.UA,
        KEN = KE.NODE;
    var isNotWhitespaces = Walker.whitespaces(true),
        isNotBookmark = Walker.bookmark(false, true);

    function IndentCommand(type) {
        this.type = type;
        this.indentCssProperty = "margin-left";
        this.indentOffset = 40;
        this.indentUnit = "px";
    }

    function isListItem(node) {
        return node[0].nodeType == KEN.NODE_ELEMENT && node._4e_name() == 'li';
    }

    function indentList(range, listNode) {
        // Our starting and ending points of the range might be inside some blocks under a list item...
        // So before playing with the iterator, we need to expand the block to include the list items.

        var startContainer = range.startContainer,
            endContainer = range.endContainer;
        while (startContainer &&
            !startContainer.parent()._4e_equals(listNode))
            startContainer = startContainer.parent();
        while (endContainer &&
            !endContainer.parent()._4e_equals(listNode))
            endContainer = endContainer.parent();

        if (!startContainer || !endContainer)
            return;

        // Now we can iterate over the individual items on the same tree depth.
        var block = startContainer,
            itemsToMove = [],
            stopFlag = false;
        while (!stopFlag) {
            if (block._4e_equals(endContainer))
                stopFlag = true;
            itemsToMove.push(block);
            block = block.next();
        }
        if (itemsToMove.length < 1)
            return;

        // Do indent or outdent operations on the array model of the list, not the
        // list's DOM tree itself. The array model demands that it knows as much as
        // possible about the surrounding lists, we need to feed it the further
        // ancestor node that is still a list.
        var listParents = listNode._4e_parents(true);
        for (var i = 0; i < listParents.length; i++) {
            if (listNodeNames[ listParents[i]._4e_name() ]) {
                listNode = listParents[i];
                break;
            }
        }
        var indentOffset = this.type == 'indent' ? 1 : -1,
            startItem = itemsToMove[0],
            lastItem = itemsToMove[ itemsToMove.length - 1 ],
            database = {};

        // Convert the list DOM tree into a one dimensional array.
        var listArray = KE.ListUtils.listToArray(listNode, database);

        // Apply indenting or outdenting on the array.
        // listarray_index 为 item 在数组中的下标，方便计算
        var baseIndent = listArray[ lastItem.data('listarray_index') ].indent;
        for (i = startItem.data('listarray_index');
             i <= lastItem.data('listarray_index'); i++) {
            listArray[ i ].indent += indentOffset;
            // Make sure the newly created sublist get a brand-new element of the same type. (#5372)
            var listRoot = listArray[ i ].parent;
            listArray[ i ].parent =
                new Node(listRoot[0].ownerDocument.createElement(listRoot._4e_name()));
        }
        /*
         嵌到下层的li
         <li>鼠标所在开始</li>
         <li>ss鼠标所在结束ss
         <ul>
         <li></li>
         <li></li>
         </ul>
         </li>
         baseIndent 为鼠标所在结束的嵌套层次，
         如果下面的比结束li的indent大，那么证明是嵌在结束li里面的，也要缩进
         一直处理到大于或等于，跳出了当前嵌套
         */
        for (i = lastItem.data('listarray_index') + 1;
             i < listArray.length && listArray[i].indent > baseIndent; i++)
            listArray[i].indent += indentOffset;

        // Convert the array back to a DOM forest (yes we might have a few subtrees now).
        // And replace the old list with the new forest.
        var newList = KE.ListUtils.arrayToList(listArray,
            database, null,
            "p",
            0);

        // Avoid nested <li> after outdent even they're visually same,
        // recording them for later refactoring.(#3982)
        var pendingList = [];
        if (this.type == 'outdent') {
            var parentLiElement;
            if (( parentLiElement = listNode.parent() ) &&
                parentLiElement._4e_name() == 'li') {
                var children = newList.listNode.childNodes
                    ,count = children.length,
                    child;

                for (i = count - 1; i >= 0; i--) {
                    if (( child = new Node(children[i]) ) &&
                        child._4e_name() == 'li')
                        pendingList.push(child);
                }
            }
        }

        if (newList) {
            DOM.insertBefore(newList.listNode[0]||newList.listNode,
                listNode[0]||listNode);
            listNode._4e_remove();
        }
        // Move the nested <li> to be appeared after the parent.
        if (pendingList && pendingList.length) {
            for (i = 0; i < pendingList.length; i++) {
                var li = pendingList[ i ],
                    followingList = li;

                // Nest preceding <ul>/<ol> inside current <li> if any.
                while (( followingList = followingList.next() ) &&

                    followingList._4e_name() in listNodeNames) {
                    // IE requires a filler NBSP for nested list inside empty list item,
                    // otherwise the list item will be inaccessiable. (#4476)
                    if (UA['ie'] && !li._4e_first(function(node) {
                        return isNotWhitespaces(node) && isNotBookmark(node);
                    }))
                        li[0].appendChild(range.document.createTextNode('\u00a0'));

                    li[0].appendChild(followingList[0]);
                }
                DOM.insertAfter(li[0], parentLiElement[0]);
            }
        }

        // Clean up the markers.
        KE.Utils.clearAllMarkers(database);
    }

    function indentBlock(range) {
        var iterator = range.createIterator();
        //  enterMode = "p";
        iterator.enforceRealBlocks = true;
        iterator.enlargeBr = true;
        var block;
        while (( block = iterator.getNextParagraph() ))
            indentElement.call(this, block);
    }

    function indentElement(element) {

        var currentOffset = parseInt(element._4e_style(this.indentCssProperty), 10);
        if (isNaN(currentOffset))
            currentOffset = 0;
        currentOffset += ( this.type == 'indent' ? 1 : -1 ) * this.indentOffset;

        if (currentOffset < 0)
            return false;

        currentOffset = Math.max(currentOffset, 0);
        currentOffset = Math.ceil(currentOffset / this.indentOffset,undefined) * this.indentOffset;
        element.css(this.indentCssProperty, currentOffset ? currentOffset + this.indentUnit : '');
        if (element[0].style.cssText === '')
            element.removeAttr('style');

        return true;
    }

    S.augment(IndentCommand, {
        exec:function(editor) {

            var selection = editor.getSelection(),
                range = selection && selection.getRanges()[0];
            var startContainer = range.startContainer,
                endContainer = range.endContainer,
                rangeRoot = range.getCommonAncestor(),
                nearestListBlock = rangeRoot;

            while (nearestListBlock && !( nearestListBlock[0].nodeType == KEN.NODE_ELEMENT &&
                listNodeNames[ nearestListBlock._4e_name() ] ))
                nearestListBlock = nearestListBlock.parent();

            // Avoid selection anchors under list root.
            // <ul>[<li>...</li>]</ul> =>	<ul><li>[...]</li></ul>
            //注：firefox 永远不会出现
            //注2：哪种情况会出现？
            if (nearestListBlock
                && startContainer[0].nodeType == KEN.NODE_ELEMENT
                && startContainer._4e_name() in listNodeNames) {
                //S.log("indent from ul/ol");
                var walker = new Walker(range);
                walker.evaluator = isListItem;
                range.startContainer = walker.next();
            }

            if (nearestListBlock
                && endContainer[0].nodeType == KEN.NODE_ELEMENT
                && endContainer._4e_name() in listNodeNames) {
                walker = new Walker(range);
                walker.evaluator = isListItem;
                range.endContainer = walker.previous();
            }

            var bookmarks = selection.createBookmarks(true);

            if (nearestListBlock) {
                var firstListItem = nearestListBlock._4e_first();
                while (firstListItem
                    &&
                    firstListItem._4e_name() != "li") {
                    firstListItem = firstListItem.next();
                }
                var rangeStart = range.startContainer,
                    indentWholeList = firstListItem[0] == rangeStart[0]
                        || firstListItem.contains(rangeStart);

                // Indent the entire list if  cursor is inside the first list item. (#3893)
                if (!( indentWholeList
                    &&
                    indentElement.call(this, nearestListBlock) ))
                    indentList.call(this, range, nearestListBlock);
            }
            else
                indentBlock.call(this, range);
            selection.selectBookmarks(bookmarks);
        }
    });

    KE.IndentSupport = {
        init:function() {
            var self = this,
                cfg = self.cfg;
            self.indentCommand = new IndentCommand(cfg.type);
        },
        offClick:function() {
            var self = this,
                editor = self.editor;
            //ie要等会才能获得焦点窗口的选择区域
            editor.fire("save");
            setTimeout(function() {
                self.indentCommand.exec(editor);
                editor.fire("save");
                editor.notifySelectionChange();
            }, 10);
        },
        selectionChange:function(ev) {
            var self = this,
                cfg = self.cfg;
            if (cfg.type != "outdent") return;

            var elementPath = ev.path,
                blockLimit = elementPath.blockLimit,
                el = self.btn;

            if (elementPath.contains(listNodeNames)) {
                el.boff();
            } else {
                var block = elementPath.block || blockLimit;
                if (block && block._4e_style(self.indentCommand.indentCssProperty)) {
                    el.boff();
                } else {
                    el.disable();
                }
            }
        }
    };
},{
    attach:false
});