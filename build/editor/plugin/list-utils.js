/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/list-utils
*/

KISSY.add("editor/plugin/list-utils", [], function(S) {
  var listNodeNames = {ol:1, ul:1}, Node = S.Node, Dom = S.DOM, NodeType = Dom.NodeType, UA = S.UA, list = {listToArray:function(listNode, database, baseArray, baseIndentLevel, grandparentNode) {
    if(!listNodeNames[listNode.nodeName()]) {
      return[]
    }
    if(!baseIndentLevel) {
      baseIndentLevel = 0
    }
    if(!baseArray) {
      baseArray = []
    }
    for(var i = 0, count = listNode[0].childNodes.length;i < count;i++) {
      var listItem = new Node(listNode[0].childNodes[i]);
      if(listItem.nodeName() !== "li") {
        continue
      }
      var itemObj = {parent:listNode, indent:baseIndentLevel, element:listItem, contents:[]};
      if(!grandparentNode) {
        itemObj.grandparent = listNode.parent();
        if(itemObj.grandparent && itemObj.grandparent.nodeName() === "li") {
          itemObj.grandparent = itemObj.grandparent.parent()
        }
      }else {
        itemObj.grandparent = grandparentNode
      }
      if(database) {
        listItem._4eSetMarker(database, "listarray_index", baseArray.length, undefined)
      }
      baseArray.push(itemObj);
      for(var j = 0, itemChildCount = listItem[0].childNodes.length, child;j < itemChildCount;j++) {
        child = new Node(listItem[0].childNodes[j]);
        if(child[0].nodeType === Dom.NodeType.ELEMENT_NODE && listNodeNames[child.nodeName()]) {
          list.listToArray(child, database, baseArray, baseIndentLevel + 1, itemObj.grandparent)
        }else {
          itemObj.contents.push(child)
        }
      }
    }
    return baseArray
  }, arrayToList:function(listArray, database, baseIndex, paragraphMode) {
    if(!baseIndex) {
      baseIndex = 0
    }
    if(!listArray || listArray.length < baseIndex + 1) {
      return null
    }
    var doc = listArray[baseIndex].parent[0].ownerDocument, retval = doc.createDocumentFragment(), rootNode = null, i, currentIndex = baseIndex, indentLevel = Math.max(listArray[baseIndex].indent, 0), currentListItem = null;
    while(true) {
      var item = listArray[currentIndex];
      if(item.indent === indentLevel) {
        if(!rootNode || listArray[currentIndex].parent.nodeName() !== rootNode.nodeName()) {
          rootNode = listArray[currentIndex].parent.clone(false);
          retval.appendChild(rootNode[0])
        }
        currentListItem = rootNode[0].appendChild(item.element.clone(false)[0]);
        for(i = 0;i < item.contents.length;i++) {
          currentListItem.appendChild(item.contents[i].clone(true)[0])
        }
        currentIndex++
      }else {
        if(item.indent === Math.max(indentLevel, 0) + 1) {
          var listData = list.arrayToList(listArray, null, currentIndex, paragraphMode);
          currentListItem.appendChild(listData.listNode);
          currentIndex = listData.nextIndex
        }else {
          if(item.indent === -1 && !baseIndex && item.grandparent) {
            if(listNodeNames[item.grandparent.nodeName()]) {
              currentListItem = item.element.clone(false)[0]
            }else {
              if(item.grandparent.nodeName() !== "td") {
                currentListItem = doc.createElement(paragraphMode);
                item.element._4eCopyAttributes(new Node(currentListItem))
              }else {
                currentListItem = doc.createDocumentFragment()
              }
            }
            for(i = 0;i < item.contents.length;i++) {
              var ic = item.contents[i].clone(true);
              if(currentListItem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
                item.element._4eCopyAttributes(new Node(ic))
              }
              currentListItem.appendChild(ic[0])
            }
            if(currentListItem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE && currentIndex !== listArray.length - 1) {
              if(currentListItem.lastChild && currentListItem.lastChild.nodeType === Dom.NodeType.ELEMENT_NODE && currentListItem.lastChild.getAttribute("type") === "_moz") {
                Dom._4eRemove(currentListItem.lastChild)
              }
              Dom._4eAppendBogus(currentListItem)
            }
            if(currentListItem.nodeType === Dom.NodeType.ELEMENT_NODE && Dom.nodeName(currentListItem) === paragraphMode && currentListItem.firstChild) {
              Dom._4eTrim(currentListItem);
              var firstChild = currentListItem.firstChild;
              if(firstChild.nodeType === Dom.NodeType.ELEMENT_NODE && Dom._4eIsBlockBoundary(firstChild)) {
                var tmp = doc.createDocumentFragment();
                Dom._4eMoveChildren(currentListItem, tmp);
                currentListItem = tmp
              }
            }
            var currentListItemName = Dom.nodeName(currentListItem);
            if(!UA.ie && (currentListItemName === "div" || currentListItemName === "p")) {
              Dom._4eAppendBogus(currentListItem)
            }
            retval.appendChild(currentListItem);
            rootNode = null;
            currentIndex++
          }else {
            return null
          }
        }
      }
      if(listArray.length <= currentIndex || Math.max(listArray[currentIndex].indent, 0) < indentLevel) {
        break
      }
    }
    if(database) {
      var currentNode = new Node(retval.firstChild);
      while(currentNode && currentNode[0]) {
        if(currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) {
          currentNode._4eClearMarkers(database, true)
        }
        currentNode = currentNode._4eNextSourceNode()
      }
    }
    return{listNode:retval, nextIndex:currentIndex}
  }};
  return list
});

