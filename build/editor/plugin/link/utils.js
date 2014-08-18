/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:23
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/link/utils
*/

KISSY.add("editor/plugin/link/utils", ["editor"], function(S, require) {
  var Editor = require("editor");
  var Node = S.Node, KEStyle = Editor.Style, savedHref = "_ke_saved_href", linkStyle = {element:"a", attributes:{href:"#(href)", title:"#(title)", _ke_saved_href:"#(_ke_saved_href)", target:"#(target)"}};
  function getAttributes(el) {
    var attributes = el.attributes, re = {};
    for(var i = 0;i < attributes.length;i++) {
      var a = attributes[i];
      if(a.specified) {
        re[a.name] = a.value
      }
    }
    if(el.style.cssText) {
      re.style = el.style.cssText
    }
    return re
  }
  function removeLink(editor, a) {
    editor.execCommand("save");
    var sel = editor.getSelection(), range = sel.getRanges()[0];
    if(range && range.collapsed) {
      var bs = sel.createBookmarks();
      a._4eRemove(true);
      sel.selectBookmarks(bs)
    }else {
      if(range) {
        var attrs = getAttributes(a[0]);
        (new KEStyle(linkStyle, attrs)).remove(editor.get("document")[0])
      }
    }
    editor.execCommand("save");
    editor.notifySelectionChange()
  }
  function applyLink(editor, attr, _selectedEl) {
    attr[savedHref] = attr.href;
    if(_selectedEl) {
      editor.execCommand("save");
      _selectedEl.attr(attr)
    }else {
      var sel = editor.getSelection(), range = sel && sel.getRanges()[0];
      if(!range || range.collapsed) {
        var a = new Node("<a>" + attr.href + "</a>", attr, editor.get("document")[0]);
        editor.insertElement(a)
      }else {
        editor.execCommand("save");
        var linkStyleObj = new KEStyle(linkStyle, attr);
        linkStyleObj.apply(editor.get("document")[0])
      }
    }
    editor.execCommand("save");
    editor.notifySelectionChange()
  }
  return{removeLink:removeLink, applyLink:applyLink, savedHref:savedHref}
});

