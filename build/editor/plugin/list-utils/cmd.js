/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/list-utils/cmd
*/

KISSY.add("editor/plugin/list-utils/cmd", ["editor", "../list-utils"], function(S, require) {
  var Editor = require("editor");
  var ListUtils = require("../list-utils");
  var insertUnorderedList = "insertUnorderedList", insertOrderedList = "insertOrderedList", listNodeNames = {ol:insertOrderedList, ul:insertUnorderedList}, KER = Editor.RangeType, ElementPath = Editor.ElementPath, Walker = Editor.Walker, UA = S.UA, Node = S.Node, Dom = S.DOM, headerTagRegex = /^h[1-6]$/;
  function ListCommand(type) {
    this.type = type
  }
  ListCommand.prototype = {constructor:ListCommand, changeListType:function(editor, groupObj, database, listsCreated, listStyleType) {
    var listArray = ListUtils.listToArray(groupObj.root, database, undefined, undefined, undefined), selectedListItems = [];
    for(var i = 0;i < groupObj.contents.length;i++) {
      var itemNode = groupObj.contents[i];
      itemNode = itemNode.closest("li", undefined);
      if(!itemNode || !itemNode[0] || itemNode.data("list_item_processed")) {
        continue
      }
      selectedListItems.push(itemNode);
      itemNode._4eSetMarker(database, "list_item_processed", true, undefined)
    }
    var fakeParent = new Node(groupObj.root[0].ownerDocument.createElement(this.type));
    fakeParent.css("list-style-type", listStyleType);
    for(i = 0;i < selectedListItems.length;i++) {
      var listIndex = selectedListItems[i].data("listarray_index");
      listArray[listIndex].parent = fakeParent
    }
    var newList = ListUtils.arrayToList(listArray, database, null, "p");
    var child, length = newList.listNode.childNodes.length;
    for(i = 0;i < length && (child = new Node(newList.listNode.childNodes[i]));i++) {
      if(child.nodeName() === this.type) {
        listsCreated.push(child)
      }
    }
    groupObj.root.before(newList.listNode);
    groupObj.root.remove()
  }, createList:function(editor, groupObj, listsCreated, listStyleType) {
    var contents = groupObj.contents, doc = groupObj.root[0].ownerDocument, listContents = [];
    if(contents.length === 1 && contents[0][0] === groupObj.root[0]) {
      var divBlock = new Node(doc.createElement("div"));
      if(contents[0][0].nodeType !== Dom.NodeType.TEXT_NODE) {
        contents[0]._4eMoveChildren(divBlock, undefined, undefined)
      }
      contents[0][0].appendChild(divBlock[0]);
      contents[0] = divBlock
    }
    var commonParent = groupObj.contents[0].parent();
    for(var i = 0;i < contents.length;i++) {
      commonParent = commonParent._4eCommonAncestor(contents[i].parent(), undefined)
    }
    for(i = 0;i < contents.length;i++) {
      var contentNode = contents[i], parentNode;
      while(parentNode = contentNode.parent()) {
        if(parentNode[0] === commonParent[0]) {
          listContents.push(contentNode);
          break
        }
        contentNode = parentNode
      }
    }
    if(listContents.length < 1) {
      return
    }
    var insertAnchor = new Node(listContents[listContents.length - 1][0].nextSibling), listNode = new Node(doc.createElement(this.type));
    listNode.css("list-style-type", listStyleType);
    listsCreated.push(listNode);
    while(listContents.length) {
      var contentBlock = listContents.shift(), listItem = new Node(doc.createElement("li"));
      if(headerTagRegex.test(contentBlock.nodeName())) {
        listItem[0].appendChild(contentBlock[0])
      }else {
        contentBlock._4eCopyAttributes(listItem, undefined, undefined);
        contentBlock._4eMoveChildren(listItem, undefined, undefined);
        contentBlock.remove()
      }
      listNode[0].appendChild(listItem[0]);
      if(!UA.ie) {
        listItem._4eAppendBogus(undefined)
      }
    }
    if(insertAnchor[0]) {
      listNode.insertBefore(insertAnchor, undefined)
    }else {
      commonParent.append(listNode)
    }
  }, removeList:function(editor, groupObj, database) {
    var listArray = ListUtils.listToArray(groupObj.root, database, undefined, undefined, undefined), selectedListItems = [];
    for(var i = 0;i < groupObj.contents.length;i++) {
      var itemNode = groupObj.contents[i];
      itemNode = itemNode.closest("li", undefined);
      if(!itemNode || itemNode.data("list_item_processed")) {
        continue
      }
      selectedListItems.push(itemNode);
      itemNode._4eSetMarker(database, "list_item_processed", true, undefined)
    }
    var lastListIndex = null;
    for(i = 0;i < selectedListItems.length;i++) {
      var listIndex = selectedListItems[i].data("listarray_index");
      listArray[listIndex].indent = -1;
      lastListIndex = listIndex
    }
    for(i = lastListIndex + 1;i < listArray.length;i++) {
      if(listArray[i].indent > Math.max(listArray[i - 1].indent, 0)) {
        var indentOffset = listArray[i - 1].indent + 1 - listArray[i].indent;
        var oldIndent = listArray[i].indent;
        while(listArray[i] && listArray[i].indent >= oldIndent) {
          listArray[i].indent += indentOffset;
          i++
        }
        i--
      }
    }
    var newList = ListUtils.arrayToList(listArray, database, null, "p");
    var docFragment = newList.listNode, boundaryNode, siblingNode;
    function compensateBrs(isStart) {
      if((boundaryNode = new Node(docFragment[isStart ? "firstChild" : "lastChild"])) && !(boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && boundaryNode._4eIsBlockBoundary(undefined, undefined)) && (siblingNode = groupObj.root[isStart ? "prev" : "next"](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && siblingNode._4eIsBlockBoundary({br:1}, undefined))) {
        boundaryNode[isStart ? "before" : "after"](editor.get("document")[0].createElement("br"))
      }
    }
    compensateBrs(true);
    compensateBrs(undefined);
    groupObj.root.before(docFragment);
    groupObj.root.remove()
  }, exec:function(editor, listStyleType) {
    var selection = editor.getSelection(), ranges = selection && selection.getRanges();
    if(!ranges || ranges.length < 1) {
      return
    }
    var startElement = selection.getStartElement(), groupObj, i, currentPath = new Editor.ElementPath(startElement);
    var state = queryActive(this.type, currentPath);
    var bookmarks = selection.createBookmarks(true);
    var listGroups = [], database = {};
    while(ranges.length > 0) {
      var range = ranges.shift();
      var boundaryNodes = range.getBoundaryNodes(), startNode = boundaryNodes.startNode, endNode = boundaryNodes.endNode;
      if(startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && startNode.nodeName() === "td") {
        range.setStartAt(boundaryNodes.startNode, KER.POSITION_AFTER_START)
      }
      if(endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && endNode.nodeName() === "td") {
        range.setEndAt(boundaryNodes.endNode, KER.POSITION_BEFORE_END)
      }
      var iterator = range.createIterator(), block;
      iterator.forceBrBreak = false;
      while(block = iterator.getNextParagraph()) {
        if(block.data("list_block")) {
          continue
        }else {
          block._4eSetMarker(database, "list_block", 1, undefined)
        }
        var path = new ElementPath(block), pathElements = path.elements, pathElementsCount = pathElements.length, processedFlag = false, blockLimit = path.blockLimit, element;
        for(i = pathElementsCount - 1;i >= 0 && (element = pathElements[i]);i--) {
          if(listNodeNames[element.nodeName()] && blockLimit.contains(element)) {
            blockLimit.removeData("list_group_object");
            groupObj = element.data("list_group_object");
            if(groupObj) {
              groupObj.contents.push(block)
            }else {
              groupObj = {root:element, contents:[block]};
              listGroups.push(groupObj);
              element._4eSetMarker(database, "list_group_object", groupObj, undefined)
            }
            processedFlag = true;
            break
          }
        }
        if(processedFlag) {
          continue
        }
        var root = blockLimit || path.block;
        if(root.data("list_group_object")) {
          root.data("list_group_object").contents.push(block)
        }else {
          groupObj = {root:root, contents:[block]};
          root._4eSetMarker(database, "list_group_object", groupObj, undefined);
          listGroups.push(groupObj)
        }
      }
    }
    var listsCreated = [];
    while(listGroups.length > 0) {
      groupObj = listGroups.shift();
      if(!state) {
        if(listNodeNames[groupObj.root.nodeName()]) {
          this.changeListType(editor, groupObj, database, listsCreated, listStyleType)
        }else {
          Editor.Utils.clearAllMarkers(database);
          this.createList(editor, groupObj, listsCreated, listStyleType)
        }
      }else {
        if(listNodeNames[groupObj.root.nodeName()]) {
          if(groupObj.root.css("list-style-type") === listStyleType) {
            this.removeList(editor, groupObj, database)
          }else {
            groupObj.root.css("list-style-type", listStyleType)
          }
        }
      }
    }
    var self = this;
    for(i = 0;i < listsCreated.length;i++) {
      var listNode = listsCreated[i];
      var mergeSibling = function(rtl, listNode) {
        var sibling = listNode[rtl ? "prev" : "next"](Walker.whitespaces(true), 1);
        if(sibling && sibling[0] && sibling.nodeName() === self.type && sibling.css("list-style-type") === listStyleType) {
          sibling.remove();
          sibling._4eMoveChildren(listNode, rtl ? true : false, undefined)
        }
      };
      mergeSibling(undefined, listNode);
      mergeSibling(true, listNode)
    }
    Editor.Utils.clearAllMarkers(database);
    selection.selectBookmarks(bookmarks)
  }};
  function queryActive(type, elementPath) {
    var element, name, i, blockLimit = elementPath.blockLimit, elements = elementPath.elements;
    if(!blockLimit) {
      return false
    }
    if(elements) {
      for(i = 0;i < elements.length && (element = elements[i]) && element[0] !== blockLimit[0];i++) {
        if(listNodeNames[name = element.nodeName()]) {
          if(name === type) {
            return element.css("list-style-type")
          }
        }
      }
    }
    return false
  }
  return{ListCommand:ListCommand, queryActive:queryActive}
});

