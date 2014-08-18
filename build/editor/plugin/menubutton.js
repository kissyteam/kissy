/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/menubutton
*/

KISSY.add("editor/plugin/menubutton", ["editor", "menubutton"], function(S, require) {
  var Editor = require("editor");
  var MenuButton = require("menubutton");
  Editor.prototype.addSelect = function(id, cfg, SelectType) {
    SelectType = SelectType || MenuButton.Select;
    var self = this, prefixCls = self.get("prefixCls") + "editor-";
    if(cfg) {
      cfg.editor = self;
      if(cfg.menu) {
        cfg.menu.zIndex = Editor.baseZIndex(Editor.ZIndexManager.SELECT)
      }
      if(cfg.elCls) {
        cfg.elCls = prefixCls + cfg.elCls
      }
    }
    var s = (new SelectType(S.mix({render:self.get("toolBarEl"), prefixCls:prefixCls}, cfg))).render();
    if(cfg.mode === Editor.Mode.WYSIWYG_MODE) {
      self.on("wysiwygMode", function() {
        s.set("disabled", false)
      });
      self.on("sourceMode", function() {
        s.set("disabled", true)
      })
    }
    self.addControl(id + "/select", s);
    return s
  };
  return MenuButton
});

