/*
Copyright 2013, KISSY v1.41
MIT Licensed
build time: Dec 4 22:13
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/separator
*/

KISSY.add("editor/plugin/separator", [], function(S) {
  function Separator() {
  }
  S.augment(Separator, {pluginRenderUI:function(editor) {
    S.all("<span " + 'class="' + editor.get("prefixCls") + 'editor-toolbar-separator">&nbsp;' + "</span>").appendTo(editor.get("toolBarEl"))
  }});
  return Separator
});

