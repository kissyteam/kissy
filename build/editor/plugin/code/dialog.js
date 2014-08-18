/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:20
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/code/dialog
*/

KISSY.add("editor/plugin/code/dialog", ["editor", "menubutton", "../dialog"], function(S, require) {
  var Editor = require("editor");
  var MenuButton = require("menubutton");
  var xhtmlDtd = Editor.XHTML_DTD;
  var NodeType = S.DOM.NodeType;
  var notWhitespaceEval = Editor.Walker.whitespaces(true);
  var Dialog4E = require("../dialog");
  var codeTypes = [["ActionScript3", "as3"], ["Bash/Shell", "bash"], ["C/C++", "cpp"], ["Css", "css"], ["CodeFunction", "cf"], ["C#", "c#"], ["Delphi", "delphi"], ["Diff", "diff"], ["Erlang", "erlang"], ["Groovy", "groovy"], ["HTML", "html"], ["Java", "java"], ["JavaFx", "jfx"], ["Javascript", "js"], ["Perl", "pl"], ["Php", "php"], ["Plain Text", "plain"], ["PowerShell", "ps"], ["Python", "python"], ["Ruby", "ruby"], ["Scala", "scala"], ["Sql", "sql"], ["Vb", "vb"], ["Xml", "xml"]], bodyTpl = '<div class="{prefixCls}code-wrap">' + 
  '<table class="{prefixCls}code-table">' + "<tr>" + '<td class="{prefixCls}code-label">' + '<label for="ks-editor-code-type">' + "\u7c7b\u578b\uff1a" + "</label>" + "</td>" + '<td class="{prefixCls}code-content">' + "<select " + 'id="ks-editor-code-type" ' + ' class="{prefixCls}code-type">' + S.map(codeTypes, function(codeType) {
    return'<option value="' + codeType[1] + '">' + codeType[0] + "</option>"
  }) + "</select>" + "</td>" + "</tr>" + "<tr>" + "<td>" + '<label for="ks-editor-code-textarea">' + "\u4ee3\u7801\uff1a" + "</label>" + "</td>" + "<td>" + "<textarea " + 'id="ks-editor-code-textarea" ' + ' class="{prefixCls}code-textarea {prefixCls}input">' + "</textarea>" + "</td>" + "</tr>" + "</table>" + "</div>", footTpl = '<div class="{prefixCls}code-table-action">' + "<a href=\"javascript:void('\u63d2\u5165')\"" + ' class="{prefixCls}code-insert {prefixCls}button">\u63d2\u5165</a>' + "<a href=\"javascript:void('\u53d6\u6d88')\"" + 
  ' class="{prefixCls}code-cancel {prefixCls}button">\u53d6\u6d88</a>' + "</td>" + "</div>", codeTpl = '<pre class="prettyprint ks-editor-code brush:{type};toolbar:false;">' + "{code}" + "</pre>";
  function CodeDialog(editor) {
    this.editor = editor
  }
  S.augment(CodeDialog, {initDialog:function() {
    var self = this, prefixCls = self.editor.get("prefixCls") + "editor-", el, d;
    d = self.dialog = (new Dialog4E({width:500, mask:true, headerContent:"\u63d2\u5165\u4ee3\u7801", bodyContent:S.substitute(bodyTpl, {prefixCls:prefixCls}), footerContent:S.substitute(footTpl, {prefixCls:prefixCls})})).render();
    el = d.get("el");
    self.insert = el.one("." + prefixCls + "code-insert");
    self.cancel = el.one("." + prefixCls + "code-cancel");
    self.type = MenuButton.Select.decorate(el.one("." + prefixCls + "code-type"), {prefixCls:prefixCls + "big-", width:150, menuCfg:{prefixCls:prefixCls, height:320, render:d.get("contentEl")}});
    self.code = el.one("." + prefixCls + "code-textarea");
    self.insert.on("click", self._insert, self);
    self.cancel.on("click", self.hide, self)
  }, hide:function() {
    this.dialog.hide()
  }, _insert:function() {
    var self = this, val, editor = self.editor, code = self.code;
    if(!S.trim(val = code.val())) {
      alert("\u8bf7\u8f93\u5165\u4ee3\u7801!");
      return
    }
    var codeEl = S.all(S.substitute(codeTpl, {type:self.type.get("value"), code:S.escapeHtml(val)}), editor.get("document")[0]);
    self.dialog.hide();
    editor.insertElement(codeEl);
    var range = editor.getSelection().getRanges()[0];
    var next = codeEl.next(notWhitespaceEval, 1);
    var nextName = next && next[0].nodeType === NodeType.ELEMENT_NODE && next.nodeName();
    if(!(nextName && xhtmlDtd.$block[nextName] && xhtmlDtd[nextName]["#text"])) {
      next = S.all("<p></p>", editor.get("document")[0]);
      if(!S.UA.ie) {
        next._4eAppendBogus()
      }
      codeEl.after(next)
    }
    range.moveToElementEditablePosition(next);
    editor.getSelection().selectRanges([range])
  }, show:function() {
    if(!this.dialog) {
      this.initDialog()
    }
    this.dialog.show()
  }});
  return CodeDialog
});

