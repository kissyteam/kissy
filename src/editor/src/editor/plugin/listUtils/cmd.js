/**
 * Add ul and ol command identifier for KISSY Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/listUtils/cmd", function (S, KE, ListUtils, undefined) {

    var insertUnorderedList = "insertUnorderedList",
        insertOrderedList = "insertOrderedList",
        listNodeNames = {"ol":insertOrderedList, "ul":insertUnorderedList},
        KER = KE.RANGE,
        ElementPath = KE.ElementPath,
        Walker = KE.Walker,
        KEN = KE.NODE,
        UA = S.UA,
        Node = S.Node,
        DOM = S.DOM,
        headerTagRegex = /^h[1-6]$/;

    function ListCommand(type) {
        this.type = type;
    }

    ListCommand.prototype = {

        changeListType:function (editor, groupObj, database, listsCreated) {
            // This case is easy...
            // 1. Convert the whole list into a one-dimensional array.
            // 2. Change the list type by modifying the array.
            // 3. Recreate the whole list by converting the array to a list.
            // 4. Replace the original list with the recreated list.
            var listArray = ListUtils.listToArray(groupObj.root, database,
                undefined, undefined, undefined),
                selectedListItems = [];

            for (var i = 0; i < groupObj.contents.length; i++) {
                var itemNode = groupObj.contents[i];
                itemNode = itemNode._4e_ascendant('li', true);
                if ((!itemNode || !itemNode[0]) ||
                    itemNode.data('list_item_processed'))
                    continue;
                selectedListItems.push(itemNode);
                itemNode._4e_setMarker(database, 'list_item_processed', true, undefined);
            }

            var fakeParent = new Node(groupObj.root[0].ownerDocument.createElement(this.type));
            for (i = 0; i < selectedListItems.length; i++) {
                var listIndex = selectedListItems[i].data('listarray_index');
                listArray[listIndex].parent = fakeParent;
            }
            var newList = ListUtils.arrayToList(listArray, database, null, "p");
            var child, length = newList.listNode.childNodes.length;
            for (i = 0; i < length &&
                ( child = new Node(newList.listNode.childNodes[i]) ); i++) {
                if (child._4e_name() == this.type)
                    listsCreated.push(child);
            }
            DOM.insertBefore(DOM._4e_unwrap(newList.listNode), DOM._4e_unwrap(groupObj.root));
            groupObj.root.remove();
        },

        createList:function (editor, groupObj, listsCreated) {
            var contents = groupObj.contents,
                doc = groupObj.root[0].ownerDocument,
                listContents = [];

            // It is possible to have the contents returned by DomRangeIterator to be the same as the root.
            // e.g. when we're running into table cells.
            // In such a case, enclose the childNodes of contents[0] into a <div>.
            if (contents.length == 1
                && contents[0][0] === groupObj.root[0]) {
                var divBlock = new Node(doc.createElement('div'));
                contents[0][0].nodeType != KEN.NODE_TEXT &&
                contents[0]._4e_moveChildren(divBlock, undefined, undefined);
                contents[0][0].appendChild(divBlock[0]);
                contents[0] = divBlock;
            }

            // Calculate the common parent node of all content blocks.
            var commonParent = groupObj.contents[0].parent();

            for (var i = 0; i < contents.length; i++) {
                commonParent = commonParent._4e_commonAncestor(contents[i].parent(), undefined);
            }

            // We want to insert things that are in the same tree level only,
            // so calculate the contents again
            // by expanding the selected blocks to the same tree level.
            for (i = 0; i < contents.length; i++) {
                var contentNode = contents[i],
                    parentNode;
                while (( parentNode = contentNode.parent() )) {
                    if (parentNode[0] === commonParent[0]) {
                        listContents.push(contentNode);
                        break;
                    }
                    contentNode = parentNode;
                }
            }

            if (listContents.length < 1)
                return;

            // Insert the list to the DOM tree.
            var insertAnchor = new Node(
                listContents[ listContents.length - 1 ][0].nextSibling),
                listNode = new Node(doc.createElement(this.type));

            listsCreated.push(listNode);
            while (listContents.length) {
                var contentBlock = listContents.shift(),
                    listItem = new Node(doc.createElement('li'));

                // Preserve heading structure when converting to list item. (#5271)
                if (headerTagRegex.test(contentBlock._4e_name())) {
                    listItem[0].appendChild(contentBlock[0]);
                } else {
                    contentBlock._4e_copyAttributes(listItem, undefined, undefined);
                    contentBlock._4e_moveChildren(listItem, undefined, undefined);
                    contentBlock.remove();
                }
                listNode[0].appendChild(listItem[0]);

                // Append a bogus BR to force the LI to render at full height
                if (!UA['ie'])
                    listItem._4e_appendBogus(undefined);
            }
            if (insertAnchor[0]) {
                listNode.insertBefore(insertAnchor, undefined);
            } else {
                commonParent.append(listNode);
            }
        },

        removeList:function (editor, groupObj, database) {
            // This is very much like the change list type operation.
            // Except that we're changing the selected items' indent to -1 in the list array.
            var listArray = ListUtils.listToArray(groupObj.root, database,
                undefined, undefined, undefined),
                selectedListItems = [];

            for (var i = 0; i < groupObj.contents.length; i++) {
                var itemNode = groupObj.contents[i];
                itemNode = itemNode._4e_ascendant('li', true);
                if (!itemNode || itemNode.data('list_item_processed'))
                    continue;
                selectedListItems.push(itemNode);
                itemNode._4e_setMarker(database, 'list_item_processed', true, undefined);
            }

            var lastListIndex = null;

            for (i = 0; i < selectedListItems.length; i++) {
                var listIndex = selectedListItems[i].data('listarray_index');
                listArray[listIndex].indent = -1;
                lastListIndex = listIndex;
            }

            // After cutting parts of the list out with indent=-1, we still have to maintain the array list
            // model's nextItem.indent <= currentItem.indent + 1 invariant. Otherwise the array model of the
            // list cannot be converted back to a real DOM list.
            for (i = lastListIndex + 1; i < listArray.length; i++) {
                //if (listArray[i].indent > listArray[i - 1].indent + 1) {
                //modified by yiminghe
                if (listArray[i].indent > Math.max(listArray[i - 1].indent, 0)) {
                    var indentOffset = listArray[i - 1].indent + 1 -
                        listArray[i].indent;
                    var oldIndent = listArray[i].indent;
                    while (listArray[i]
                        && listArray[i].indent >= oldIndent) {
                        listArray[i].indent += indentOffset;
                        i++;
                    }
                    i--;
                }
            }

            var newList = ListUtils.arrayToList(listArray, database, null, "p");

            // Compensate <br> before/after the list node if the surrounds are non-blocks.(#3836)
            var docFragment = newList.listNode, boundaryNode, siblingNode;

            function compensateBrs(isStart) {
                if (( boundaryNode = new Node(docFragment[ isStart ? 'firstChild' : 'lastChild' ]) )
                    && !( boundaryNode[0].nodeType == KEN.NODE_ELEMENT &&
                    boundaryNode._4e_isBlockBoundary(undefined, undefined) )
                    && ( siblingNode = groupObj.root[ isStart ? '_4e_previous' : '_4e_next' ]
                    (Walker.whitespaces(true)) )
                    && !( boundaryNode[0].nodeType == KEN.NODE_ELEMENT &&
                    siblingNode._4e_isBlockBoundary({ br:1 }, undefined) ))
                    DOM[ isStart ? 'insertBefore' : 'insertAfter' ](editor.get("document")[0].createElement('br'),
                        DOM._4e_unwrap(boundaryNode));
            }

            compensateBrs(true);
            compensateBrs(undefined);

            DOM.insertBefore(DOM._4e_unwrap(docFragment), DOM._4e_unwrap(groupObj.root));
            groupObj.root.remove();
        },

        exec:function (editor) {
            var selection = editor.getSelection(),
                ranges = selection && selection.getRanges();

            // There should be at least one selected range.
            if (!ranges || ranges.length < 1)
                return;


            var startElement = selection.getStartElement(),
                currentPath = new KE.ElementPath(startElement);

            var state = queryActive(this.type, currentPath);

            var bookmarks = selection.createBookmarks(true);

            // Group the blocks up because there are many cases where multiple lists have to be created,
            // or multiple lists have to be cancelled.
            var listGroups = [],
                database = {};
            while (ranges.length > 0) {
                var range = ranges.shift();

                var boundaryNodes = range.getBoundaryNodes(),
                    startNode = boundaryNodes.startNode,
                    endNode = boundaryNodes.endNode;

                if (startNode[0].nodeType == KEN.NODE_ELEMENT && startNode._4e_name() == 'td')
                    range.setStartAt(boundaryNodes.startNode, KER.POSITION_AFTER_START);

                if (endNode[0].nodeType == KEN.NODE_ELEMENT && endNode._4e_name() == 'td')
                    range.setEndAt(boundaryNodes.endNode, KER.POSITION_BEFORE_END);

                var iterator = range.createIterator(),
                    block;

                iterator.forceBrBreak = false;

                while (( block = iterator.getNextParagraph() )) {

                    // Avoid duplicate blocks get processed across ranges.
                    if (block.data('list_block'))
                        continue;
                    else
                        block._4e_setMarker(database, 'list_block', 1, undefined);


                    var path = new ElementPath(block),
                        pathElements = path.elements,
                        pathElementsCount = pathElements.length,
                        listNode = null,
                        processedFlag = false,
                        blockLimit = path.blockLimit,
                        element;

                    // First, try to group by a list ancestor.
                    //2010-11-17 :
                    //注意从上往下，从body开始找到最早的list祖先，从那里开始重建!!!
                    for (var i = pathElementsCount - 1; i >= 0 &&
                        ( element = pathElements[ i ] ); i--) {
                        if (listNodeNames[ element._4e_name() ]
                            && blockLimit.contains(element))     // Don't leak outside block limit (#3940).
                        {
                            // If we've encountered a list inside a block limit
                            // The last group object of the block limit element should
                            // no longer be valid. Since paragraphs after the list
                            // should belong to a different group of paragraphs before
                            // the list. (Bug #1309)
                            blockLimit.removeData('list_group_object');

                            var groupObj = element.data('list_group_object');
                            if (groupObj)
                                groupObj.contents.push(block);
                            else {
                                groupObj = { root:element, contents:[ block ] };
                                listGroups.push(groupObj);
                                element._4e_setMarker(database, 'list_group_object', groupObj, undefined);
                            }
                            processedFlag = true;
                            break;
                        }
                    }

                    if (processedFlag) {
                        continue;
                    }

                    // No list ancestor? Group by block limit.
                    var root = blockLimit || path.block;
                    if (root.data('list_group_object')) {
                        root.data('list_group_object').contents.push(block);
                    } else {
                        groupObj = { root:root, contents:[ block ] };
                        root._4e_setMarker(database, 'list_group_object', groupObj, undefined);
                        listGroups.push(groupObj);
                    }
                }
            }

            // Now we have two kinds of list groups, groups rooted at a list, and groups rooted at a block limit element.
            // We either have to build lists or remove lists, for removing a list does not makes sense when we are looking
            // at the group that's not rooted at lists. So we have three cases to handle.
            var listsCreated = [];
            while (listGroups.length > 0) {
                groupObj = listGroups.shift();
                if (!state) {
                    if (listNodeNames[ groupObj.root._4e_name() ]) {
                        this.changeListType(editor, groupObj, database, listsCreated);
                    } else {
                        //2010-11-17
                        //先将之前原来元素的 expando 去除，
                        //防止 ie li 复制原来标签属性带来的输出代码多余
                        KE.Utils.clearAllMarkers(database);
                        this.createList(editor, groupObj, listsCreated);
                    }
                } else if (listNodeNames[ groupObj.root._4e_name() ]) {
                    this.removeList(editor, groupObj, database);
                }
            }

            var self = this;

            // For all new lists created, merge adjacent, same type lists.
            for (i = 0; i < listsCreated.length; i++) {
                listNode = listsCreated[i];

                // note by yiminghe,why not use merge sibling directly
                // listNode._4e_mergeSiblings();
                function mergeSibling(rtl, listNode) {
                    var sibling = listNode[ rtl ?
                        '_4e_previous' : '_4e_next' ](Walker.whitespaces(true));
                    if (sibling && sibling[0] &&
                        sibling._4e_name() == self.type) {
                        sibling.remove();
                        // Move children order by merge direction.(#3820)
                        sibling._4e_moveChildren(listNode, rtl ? true : false, undefined);
                    }
                }

                mergeSibling(undefined, listNode);
                mergeSibling(true, listNode);
            }

            // Clean up, restore selection and update toolbar button states.
            KE.Utils.clearAllMarkers(database);
            selection.selectBookmarks(bookmarks);
        }
    };

    var ulCmd = new ListCommand("ul"),
        olCmd = new ListCommand("ol");

    function queryActive(type, elementPath) {
        var element,
            name,
            blockLimit = elementPath.blockLimit,
            elements = elementPath.elements;
        if (!blockLimit) {
            return false;
        }
        // Grouping should only happen under blockLimit.(#3940).
        if (elements) {
            for (var i = 0; i < elements.length &&
                ( element = elements[ i ] ) &&
                element[0] !== blockLimit[0];
                 i++) {
                if (listNodeNames[name = element._4e_name()]) {
                    if (name == type) {
                        return true;
                    }
                }
            }
        }
        return false;
    }


    return {
        ListCommand:ListCommand,
        queryActive:queryActive
    };

    return {
        init:function (editor) {
            if (!editor.hasCommand(insertUnorderedList)) {
                editor.addCommand(insertUnorderedList, {
                    exec:function (editor) {
                        ulCmd.exec(editor);
                    }
                });
            }

            if (!editor.hasCommand(insertOrderedList)) {
                editor.addCommand(insertOrderedList, {
                    exec:function (editor) {
                        olCmd.exec(editor);
                    }
                });
            }

            var queryUl = KE.Utils.getQueryCmd(insertUnorderedList);

            if (!editor.hasCommand(queryUl)) {
                editor.addCommand(queryUl, {
                    exec:function (editor, elementPath) {
                        return queryActive("ul", elementPath);
                    }
                });
            }

            var queryOl = KE.Utils.getQueryCmd(insertOrderedList);

            if (!editor.hasCommand(queryOl)) {
                editor.addCommand(queryOl, {
                    exec:function (editor, elementPath) {
                        return queryActive("ol", elementPath);
                    }
                });
            }
        }
    }

}, {
    requires:['editor', '../listUtils/']
});