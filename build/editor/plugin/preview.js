/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Nov 27 00:45
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/preview
*/

KISSY.add("editor/plugin/preview", ["./button"], function(S, require) {
  var win = window;
  require("./button");
  function Preview() {
  }
  S.augment(Preview, {pluginRenderUI:function(editor) {
    editor.addButton("preview", {tooltip:"\u9884\u89c8", listeners:{click:function() {
      try {
        var screen = win.screen, iWidth = Math.round(screen.width * 0.8), iHeight = Math.round(screen.height * 0.7), iLeft = Math.round(screen.width * 0.1)
      }catch(e) {
        iWidth = 640;
        iHeight = 420;
        iLeft = 80
      }
      var sHTML = S.substitute(editor.getDocHtml(), {title:"\u9884\u89c8"}), sOpenUrl = "", oWindow = win.open(sOpenUrl, "", "toolbar=yes," + "location=no," + "status=yes," + "menubar=yes," + "scrollbars=yes," + "resizable=yes," + "width=" + iWidth + ",height=" + iHeight + ",left=" + iLeft), winDoc = oWindow.document;
      winDoc.open();
      winDoc.write(sHTML);
      winDoc.close();
      oWindow.focus()
    }}})
  }});
  return Preview
});

