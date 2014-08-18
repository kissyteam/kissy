/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/font-family
*/

KISSY.add("editor/plugin/font-family", ["editor", "./font/ui", "./font-family/cmd", "./menubutton"], function(S, require) {
  var Editor = require("editor");
  var ui = require("./font/ui");
  var cmd = require("./font-family/cmd");
  require("./menubutton");
  function FontFamilyPlugin(config) {
    this.config = config || {}
  }
  S.augment(FontFamilyPlugin, {pluginRenderUI:function(editor) {
    cmd.init(editor);
    var fontFamilies = this.config;
    var menu = {};
    S.mix(menu, {children:[{content:"\u5b8b\u4f53", value:"SimSun"}, {content:"\u9ed1\u4f53", value:"SimHei"}, {content:"\u96b6\u4e66", value:"LiSu"}, {content:"\u6977\u4f53", value:"KaiTi_GB2312"}, {content:"\u5fae\u8f6f\u96c5\u9ed1", value:'"Microsoft YaHei"'}, {content:"Georgia", value:"Georgia"}, {content:"Times New Roman", value:'"Times New Roman"'}, {content:"Impact", value:"Impact"}, {content:"Courier New", value:'"Courier New"'}, {content:"Arial", value:"Arial"}, {content:"Verdana", value:"Verdana"}, 
    {content:"Tahoma", value:"Tahoma"}], width:"130px"});
    S.each(menu.children, function(item) {
      var attrs = item.elAttrs || {}, value = item.value;
      attrs.style = attrs.style || "";
      attrs.style += ";font-family:" + value;
      item.elAttrs = attrs
    });
    fontFamilies.menu = S.mix(menu, fontFamilies.menu);
    editor.addSelect("fontFamily", S.mix({cmdType:"fontFamily", defaultCaption:"\u5b57\u4f53", width:130, mode:Editor.Mode.WYSIWYG_MODE}, fontFamilies), ui.Select)
  }});
  return FontFamilyPlugin
});

