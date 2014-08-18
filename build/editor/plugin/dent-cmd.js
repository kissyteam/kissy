/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:20
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/dent-cmd
*/

KISSY.add("editor/plugin/dent-cmd", ["editor", "./list-utils"], function(S, require) {
  var Editor = require("editor");
  var ListUtils = require("./list-utils");
  var listNodeNames = {ol:1, ul:1}, Walker = Editor.Walker, Dom = S.DOM, Node = S.Node, UA = S.UA, isNotWhitespaces = Walker.whitespaces(true), INDENT_CSS_PROPERTY = "margin-left", INDENT_OFFSET = 40, INDENT_UNIT = "px", isNotBookmark = Walker.bookmark(false, true);
  function isListItem(node) {
    return node.nodeType === Dom.NodeType.ELEMENT_NODE && Dom.nodeName(node) === "li"
  }
  function indentList(range, listNode, type) {
    var startContainer = range.startContainer, endContainer = range.endContainer;
    while(startContainer && !startContainer.parent().equals(listNode)) {
      startContainer = startContainer.parent()
    }
    while(endContainer && !endContainer.parent().equals(listNode)) {
      endContainer = endContainer.parent()
    }
    if(!startContainer || !endContainer) {
      return
    }
    var block = startContainer, itemsToMove = [], stopFlag = false;
    while(!stopFlag) {
      if(block.equals(endContainer)) {
        stopFlag = true
      }
      itemsToMove.push(block);
      block = block.next()
    }
    if(itemsToMove.length < 1) {
      return
    }
    var listParents = listNode._4eParents(true, undefined);
    listParents.each(function(n, i) {
      listParents[i] = n
    });
    for(var i = 0;i < listParents.length;i++) {
      if(listNodeNames[listParents[i].nodeName()]) {
        listNode = listParents[i];
        break
      }
    }
    var indentOffset = type === "indent" ? 1 : -1, startItem = itemsToMove[0], lastItem = itemsToMove[itemsToMove.length - 1], database = {};
    var listArray = ListUtils.listToArray(listNode, database);
    var baseIndent = listArray[lastItem.data("listarray_index")].indent;
    for(i = startItem.data("listarray_index");i <= lastItem.data("listarray_index");i++) {
      listArray[i].indent += indentOffset;
      var listRoot = listArray[i].parent;
      listArray[i].parent = new Node(listRoot[0].ownerDocument.createElement(listRoot.nodeName()))
    }
    for(i = lastItem.data("listarray_index") + 1;i < listArray.length && listArray[i].indent > baseIndent;i++) {
      listArray[i].indent += indentOffset
    }
    var newList = ListUtils.arrayToList(listArray, database, null, "p");
    var pendingList = [];
    var parentLiElement;
    if(type === "outdent") {
      if((parentLiElement = listNode.parent()) && parentLiElement.nodeName() === "li") {
        var children = newList.listNode.childNodes, count = children.length, child;
        for(i = count - 1;i >= 0;i--) {
          if((child = new Node(children[i])) && child.nodeName() === "li") {
            pendingList.push(child)
          }
        }
      }
    }
    if(newList) {
      Dom.insertBefore(newList.listNode[0] || newList.listNode, listNode[0] || listNode);
      listNode.remove()
    }
    if(pendingList && pendingList.length) {
      for(i = 0;i < pendingList.length;i++) {
        var li = pendingList[i], followingList = li;
        while((followingList = followingList.next()) && followingList.nodeName() in listNodeNames) {
          if(UA.ie && !li.first(function(node) {
            return isNotWhitespaces(node) && isNotBookmark(node)
          }, 1)) {
            li[0].appendChild(range.document.createTextNode("\u00a0"))
          }
          li[0].appendChild(followingList[0])
        }
        Dom.insertAfter(li[0], parentLiElement[0])
      }
    }
    Editor.Utils.clearAllMarkers(database)
  }
  function indentBlock(range, type) {
    var iterator = range.createIterator(), block;
    iterator.enforceRealBlocks = true;
    iterator.enlargeBr = true;
    while(block = iterator.getNextParagraph()) {
      indentElement(block, type)
    }
  }
  function indentElement(element, type) {
    var currentOffset = parseInt(element.style(INDENT_CSS_PROPERTY), 10);
    if(isNaN(currentOffset)) {
      currentOffset = 0
    }
    currentOffset += (type === "indent" ? 1 : -1) * INDENT_OFFSET;
    if(currentOffset < 0) {
      return false
    }
    currentOffset = Math.max(currentOffset, 0);
    currentOffset = Math.ceil(currentOffset / INDENT_OFFSET) * INDENT_OFFSET;
    element.css(INDENT_CSS_PROPERTY, currentOffset ? currentOffset + INDENT_UNIT : "");
    if(element[0].style.cssText === "") {
      element.removeAttr("style")
    }
    return true
  }
  function indentEditor(editor, type) {
    var selection = editor.getSelection(), range = selection && selection.getRanges()[0];
    if(!range) {
      return
    }
    var startContainer = range.startContainer, endContainer = range.endContainer, rangeRoot = range.getCommonAncestor(), nearestListBlock = rangeRoot;
    while(nearestListBlock && !(nearestListBlock[0].nodeType === Dom.NodeType.ELEMENT_NODE && listNodeNames[nearestListBlock.nodeName()])) {
      nearestListBlock = nearestListBlock.parent()
    }
    var walker;
    if(nearestListBlock && startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && startContainer.nodeName() in listNodeNames) {
      walker = new Walker(range);
      walker.evaluator = isListItem;
      range.startContainer = walker.next()
    }
    if(nearestListBlock && endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && endContainer.nodeName() in listNodeNames) {
      walker = new Walker(range);
      walker.evaluator = isListItem;
      range.endContainer = walker.previous()
    }
    var bookmarks = selection.createBookmarks(true);
    if(nearestListBlock) {
      var firstListItem = nearestListBlock.first();
      while(firstListItem && firstListItem.nodeName() !== "li") {
        firstListItem = firstListItem.next()
      }
      var rangeStart = range.startContainer, indentWholeList = firstListItem[0] === rangeStart[0] || firstListItem.contains(rangeStart);
      if(!(indentWholeList && indentElement(nearestListBlock, type))) {
        indentList(range, nearestListBlock, type)
      }
    }else {
      indentBlock(range, type)
    }
    selection.selectBookmarks(bookmarks)
  }
  function addCommand(editor, cmdType) {
    if(!editor.hasCommand(cmdType)) {
      editor.addCommand(cmdType, {exec:function(editor) {
        editor.execCommand("save");
        indentEditor(editor, cmdType);
        editor.execCommand("save");
        editor.notifySelectionChange()
      }})
    }
  }
  return{checkOutdentActive:function(elementPath) {
    var blockLimit = elementPath.blockLimit;
    if(elementPath.contains(listNodeNames)) {
      return true
    }else {
      var block = elementPath.block || blockLimit;
      return block && block.style(INDENT_CSS_PROPERTY)
    }
  }, addCommand:addCommand}
});

