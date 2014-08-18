/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/smiley
*/

KISSY.add("editor/plugin/smiley", ["editor", "./overlay", "./button"], function(S, require) {
  var Editor = require("editor");
  var Overlay4E = require("./overlay");
  require("./button");
  var smileyMarkup = '<div class="{prefixCls}editor-smiley-sprite">';
  for(var i = 0;i <= 98;i++) {
    smileyMarkup += '<a href="javascript:void(0)" ' + 'data-icon="http://a.tbcdn.cn/sys/wangwang/smiley/48x48/' + i + '.gif">' + "</a>"
  }
  smileyMarkup += "</div>";
  function Smiley() {
  }
  S.augment(Smiley, {pluginRenderUI:function(editor) {
    var prefixCls = editor.get("prefixCls");
    editor.addButton("smiley", {tooltip:"\u63d2\u5165\u8868\u60c5", checkable:true, listeners:{afterSyncUI:function() {
      var self = this;
      self.on("blur", function() {
        setTimeout(function() {
          if(self.smiley) {
            self.smiley.hide()
          }
        }, 150)
      })
    }, click:function() {
      var self = this, smiley, checked = self.get("checked");
      if(checked) {
        if(!(smiley = self.smiley)) {
          smiley = self.smiley = (new Overlay4E({content:S.substitute(smileyMarkup, {prefixCls:prefixCls}), focus4e:false, width:300, elCls:prefixCls + "editor-popup", zIndex:Editor.baseZIndex(Editor.ZIndexManager.POPUP_MENU), mask:false})).render();
          smiley.get("el").on("click", function(ev) {
            var t = new S.Node(ev.target), icon;
            if(t.nodeName() === "a" && (icon = t.attr("data-icon"))) {
              var img = new S.Node("<img " + 'alt="" src="' + icon + '"/>', null, editor.get("document")[0]);
              editor.insertElement(img)
            }
          });
          smiley.on("hide", function() {
            self.set("checked", false)
          })
        }
        smiley.set("align", {node:this.get("el"), points:["bl", "tl"], overflow:{adjustX:1, adjustY:1}});
        smiley.show()
      }else {
        if(self.smiley) {
          self.smiley.hide()
        }
      }
    }, destroy:function() {
      if(this.smiley) {
        this.smiley.destroy()
      }
    }}, mode:Editor.Mode.WYSIWYG_MODE})
  }});
  return Smiley
});

