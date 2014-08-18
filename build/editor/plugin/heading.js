/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:22
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/heading
*/

KISSY.add("editor/plugin/heading", ["./menubutton", "editor", "./heading/cmd"], function(S, require) {
  require("./menubutton");
  var Editor = require("editor");
  var headingCmd = require("./heading/cmd");
  function HeadingPlugin() {
  }
  S.augment(HeadingPlugin, {pluginRenderUI:function(editor) {
    headingCmd.init(editor);
    var FORMAT_SELECTION_ITEMS = [], FORMATS = {"\u666e\u901a\u6587\u672c":"p", "\u6807\u98981":"h1", "\u6807\u98982":"h2", "\u6807\u98983":"h3", "\u6807\u98984":"h4", "\u6807\u98985":"h5", "\u6807\u98986":"h6"}, FORMAT_SIZES = {p:"1em", h1:"2em", h2:"1.5em", h3:"1.17em", h4:"1em", h5:"0.83em", h6:"0.67em"};
    for(var p in FORMATS) {
      FORMAT_SELECTION_ITEMS.push({content:p, value:FORMATS[p], elAttrs:{style:"font-size:" + FORMAT_SIZES[FORMATS[p]]}})
    }
    editor.addSelect("heading", {defaultCaption:"\u6807\u9898", width:"120px", menu:{children:FORMAT_SELECTION_ITEMS}, mode:Editor.Mode.WYSIWYG_MODE, listeners:{click:function(ev) {
      var v = ev.target.get("value");
      editor.execCommand("heading", v)
    }, afterSyncUI:function() {
      var self = this;
      editor.on("selectionChange", function() {
        if(editor.get("mode") === Editor.Mode.SOURCE_MODE) {
          return
        }
        var headingValue = editor.queryCommandValue("heading"), value;
        for(value in FORMAT_SIZES) {
          if(value === headingValue) {
            self.set("value", value);
            return
          }
        }
        self.set("value", null)
      })
    }}})
  }});
  return HeadingPlugin
});

