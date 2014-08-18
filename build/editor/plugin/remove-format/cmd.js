/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/remove-format/cmd
*/

KISSY.add("editor/plugin/remove-format/cmd", ["editor"], function(S, require) {
  var Editor = require("editor");
  var KER = Editor.RangeType, ElementPath = Editor.ElementPath, Dom = S.DOM, removeFormatTags = "b,big,code,del,dfn,em,font,i,ins,kbd," + "q,samp,small,span,strike,strong,sub,sup,tt,u,var,s", removeFormatAttributes = ("class,style,lang,width,height," + "align,hspace,valign").split(/,/), tagsRegex = new RegExp("^(?:" + removeFormatTags.replace(/,/g, "|") + ")$", "i");
  function removeAttrs(el, attrs) {
    for(var i = 0;i < attrs.length;i++) {
      el.removeAttr(attrs[i])
    }
  }
  return{init:function(editor) {
    if(!editor.hasCommand("removeFormat")) {
      editor.addCommand("removeFormat", {exec:function() {
        editor.focus();
        tagsRegex.lastIndex = 0;
        var ranges = editor.getSelection().getRanges();
        editor.execCommand("save");
        for(var i = 0, range;range = ranges[i];i++) {
          if(range.collapsed) {
            continue
          }
          range.enlarge(KER.ENLARGE_ELEMENT);
          var bookmark = range.createBookmark(), startNode = bookmark.startNode, endNode = bookmark.endNode;
          var breakParent = function(node) {
            var path = new ElementPath(node), pathElements = path.elements;
            for(var i = 1, pathElement;pathElement = pathElements[i];i++) {
              if(pathElement.equals(path.block) || pathElement.equals(path.blockLimit)) {
                break
              }
              if(tagsRegex.test(pathElement.nodeName())) {
                node._4eBreakParent(pathElement)
              }
            }
          };
          breakParent(startNode);
          breakParent(endNode);
          var currentNode = startNode._4eNextSourceNode(true, Dom.NodeType.ELEMENT_NODE, undefined, undefined);
          while(currentNode) {
            if(currentNode.equals(endNode)) {
              break
            }
            var nextNode = currentNode._4eNextSourceNode(false, Dom.NodeType.ELEMENT_NODE, undefined, undefined);
            if(!(currentNode.nodeName() === "img" && (currentNode.attr("_ke_real_element") || /\bke_/.test(currentNode[0].className)))) {
              if(tagsRegex.test(currentNode.nodeName())) {
                currentNode._4eRemove(true)
              }else {
                removeAttrs(currentNode, removeFormatAttributes)
              }
            }
            currentNode = nextNode
          }
          range.moveToBookmark(bookmark)
        }
        editor.getSelection().selectRanges(ranges);
        editor.execCommand("save")
      }})
    }
  }}
});

