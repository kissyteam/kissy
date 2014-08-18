/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/flash/dialog
*/

KISSY.add("editor/plugin/flash/dialog", ["editor", "../flash-common/utils", "../dialog", "../menubutton"], function(S, require) {
  var Editor = require("editor");
  var flashUtils = require("../flash-common/utils");
  var Dialog4E = require("../dialog");
  var MenuButton = require("../menubutton");
  var CLS_FLASH = "ke_flash", TYPE_FLASH = "flash", TIP = "\u8bf7\u8f93\u5165\u5982 http://www.xxx.com/xxx.swf", bodyHTML = '<div style="padding:20px 20px 0 20px">' + "<p>" + "<label>\u7f51\u5740\uff1a " + "<input " + ' data-verify="^https?://[^\\s]+$" ' + ' data-warning="\u7f51\u5740\u683c\u5f0f\u4e3a\uff1ahttp://" ' + 'class="{prefixCls}editor-flash-url {prefixCls}editor-input" style="width:300px;' + '" />' + "</label>" + "</p>" + '<table style="margin:10px 0 5px  40px;width:300px;">' + "<tr>" + 
  "<td>" + "<label>\u5bbd\u5ea6\uff1a " + "<input " + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'class="{prefixCls}editor-flash-width {prefixCls}editor-input" style="width:60px;' + '" /> \u50cf\u7d20 </label>' + "</td>" + "<td>" + "<label>\u9ad8\u5ea6\uff1a " + "<input " + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'class="{prefixCls}editor-flash-height {prefixCls}editor-input" ' + 
  'style="width:60px;' + '" /> \u50cf\u7d20 ' + "</label>" + "</td>" + "</tr>" + "<tr>" + "<td>" + "<label>" + "\u5bf9\u9f50\uff1a " + "</label>" + '<select class="{prefixCls}editor-flash-align" title="\u5bf9\u9f50">' + '<option value="none">\u65e0</option>' + '<option value="left">\u5de6\u5bf9\u9f50</option>' + '<option value="right">\u53f3\u5bf9\u9f50</option>' + "</select>" + "</td>" + "<td>" + "<label>\u95f4\u8ddd\uff1a " + "</label>" + "<input " + ' data-verify="^\\d+$" ' + ' data-warning="\u95f4\u8ddd\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570" ' + 
  'class="{prefixCls}editor-flash-margin {prefixCls}editor-input" ' + 'style="width:60px;' + '" value="' + 5 + '"/> \u50cf\u7d20' + "</td></tr>" + "</table>" + "</div>", footHTML = '<div style="padding:10px 0 35px 20px;">' + "<a " + 'class="{prefixCls}editor-flash-ok {prefixCls}editor-button ks-inline-block" ' + 'style="margin-left:40px;margin-right:20px;">\u786e\u5b9a</a> ' + '<a class="{prefixCls}editor-flash-cancel {prefixCls}editor-button ks-inline-block">\u53d6\u6d88</a></div>';
  function FlashDialog(editor, config) {
    var self = this;
    self.editor = editor;
    self.config = config || {};
    Editor.Utils.lazyRun(self, "_prepareShow", "_realShow");
    self._config()
  }
  S.augment(FlashDialog, {addRes:Editor.Utils.addRes, destroyRes:Editor.Utils.destroyRes, _config:function() {
    var self = this, editor = self.editor, prefixCls = editor.get("prefixCls");
    self._urlTip = TIP;
    self._type = TYPE_FLASH;
    self._cls = CLS_FLASH;
    self._configDWidth = "400px";
    self._title = "Flash";
    self._bodyHTML = S.substitute(bodyHTML, {prefixCls:prefixCls});
    self._footHTML = S.substitute(footHTML, {prefixCls:prefixCls})
  }, _prepareShow:function() {
    var self = this;
    self.dialog = (new Dialog4E({headerContent:self._title, bodyContent:self._bodyHTML, footerContent:self._footHTML, width:self._configDWidth || "500px", mask:true})).render();
    self.addRes(self.dialog);
    self._initD()
  }, _realShow:function() {
    this._updateD();
    this.dialog.show()
  }, _getFlashUrl:function(r) {
    return flashUtils.getUrl(r)
  }, _updateD:function() {
    var self = this, editor = self.editor, cfg = self.config, f = self.selectedFlash;
    if(f) {
      var r = editor.restoreRealElement(f);
      if(!r) {
        return
      }
      if(f.css("width")) {
        self.dWidth.val(parseInt(f.css("width"), 10))
      }
      if(f.css("height")) {
        self.dHeight.val(parseInt(f.css("height"), 10))
      }
      self.dAlign.set("value", f.css("float"));
      Editor.Utils.valInput(self.dUrl, self._getFlashUrl(r));
      self.dMargin.val(parseInt(r.style("margin"), 10) || 0)
    }else {
      Editor.Utils.resetInput(self.dUrl);
      self.dWidth.val(cfg.defaultWidth || "");
      self.dHeight.val(cfg.defaultHeight || "");
      self.dAlign.set("value", "none");
      self.dMargin.val("5")
    }
  }, show:function(_selectedEl) {
    var self = this;
    self.selectedFlash = _selectedEl;
    self._prepareShow()
  }, _initD:function() {
    var self = this, d = self.dialog, editor = self.editor, prefixCls = editor.get("prefixCls"), el = d.get("el");
    self.dHeight = el.one("." + prefixCls + "editor-flash-height");
    self.dWidth = el.one("." + prefixCls + "editor-flash-width");
    self.dUrl = el.one("." + prefixCls + "editor-flash-url");
    self.dAlign = MenuButton.Select.decorate(el.one("." + prefixCls + "editor-flash-align"), {prefixCls:prefixCls + "editor-big-", width:80, menuCfg:{prefixCls:prefixCls + "editor-", render:el}});
    self.dMargin = el.one("." + prefixCls + "editor-flash-margin");
    var action = el.one("." + prefixCls + "editor-flash-ok"), cancel = el.one("." + prefixCls + "editor-flash-cancel");
    action.on("click", self._gen, self);
    cancel.on("click", function(ev) {
      d.hide();
      ev.halt()
    });
    Editor.Utils.placeholder(self.dUrl, self._urlTip);
    self.addRes(self.dAlign)
  }, _getDInfo:function() {
    var self = this;
    return{url:self.dUrl.val(), attrs:{width:self.dWidth.val(), height:self.dHeight.val(), style:"margin:" + (parseInt(self.dMargin.val(), 10) || 0) + "px;" + "float:" + self.dAlign.get("value") + ";"}}
  }, _gen:function(ev) {
    if(ev) {
      ev.halt()
    }
    var self = this, editor = self.editor, dinfo = self._getDInfo(), url = dinfo && S.trim(dinfo.url), attrs = dinfo && dinfo.attrs;
    if(!dinfo) {
      return
    }
    var re = Editor.Utils.verifyInputs(self.dialog.get("el").all("input"));
    if(!re) {
      return
    }
    self.dialog.hide();
    var substitute = flashUtils.insertFlash(editor, url, attrs, self._cls, self._type);
    if(self.selectedFlash) {
      editor.getSelection().selectElement(substitute)
    }
    editor.notifySelectionChange()
  }, destroy:function() {
    this.destroyRes()
  }});
  return FlashDialog
});

