/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/flash-common/utils
*/

KISSY.add("editor/plugin/flash-common/utils", ["swf"], function(S, require) {
  var SWF = require("swf");
  var Dom = S.DOM, flashUtils = {insertFlash:function(editor, src, attrs, _cls, _type) {
    var nodeInfo = flashUtils.createSWF({src:src, attrs:attrs, document:editor.get("document")[0]}), real = nodeInfo.el, substitute = editor.createFakeElement(real, _cls || "ke_flash", _type || "flash", true, nodeInfo.html, attrs);
    editor.insertElement(substitute);
    return substitute
  }, isFlashEmbed:function(element) {
    return Dom.attr(element, "type") === "application/x-shockwave-flash" || /\.swf(?:$|\?)/i.test(Dom.attr(element, "src") || "")
  }, getUrl:function(r) {
    return SWF.getSrc(r)
  }, createSWF:function(cfg) {
    var render = Dom.create('<div style="' + "position:absolute;left:-9999px;top:-9999px;" + '"></div>', undefined, cfg.document);
    cfg.htmlMode = "full";
    Dom.append(render, cfg.document.body);
    cfg.render = render;
    var swf = new SWF(cfg);
    Dom.remove(render);
    return{el:S.all(swf.get("el")), html:swf.get("html")}
  }};
  return flashUtils
});

