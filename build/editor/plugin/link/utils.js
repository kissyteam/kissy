/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Nov 27 00:00
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/link/utils
*/

KISSY.add("editor/plugin/link/utils", ["editor"], function(S, require) {
  var Editor = require("editor");
  var Node = S.Node, KEStyle = Editor.Style, _ke_saved_href = "_ke_saved_href", link_Style = {element:"a", attributes:{href:"#(href)", title:"#(title)", _ke_saved_href:"#(_ke_saved_href)", target:"#(target)"}};
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
      a._4e_remove(true);
      sel.selectBookmarks(bs)
    }else {
      if(range) {
        var attrs = getAttributes(a[0]);
        (new KEStyle(link_Style, attrs)).remove(editor.get("document")[0])
      }
    }
    editor.execCommand("save");
    editor.notifySelectionChange()
  }
  function applyLink(editor, attr, _selectedEl) {
    attr[_ke_saved_href] = attr.href;
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
        var linkStyle = new KEStyle(link_Style, attr);
        linkStyle.apply(editor.get("document")[0])
      }
    }
    editor.execCommand("save");
    editor.notifySelectionChange()
  }
  return{removeLink:removeLink, applyLink:applyLink, _ke_saved_href:_ke_saved_href}
});

