/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:27
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/video/dialog
*/

KISSY.add("editor/plugin/video/dialog", ["editor", "io", "../flash/dialog", "../menubutton"], function(S, require) {
  var Editor = require("editor");
  var io = require("io");
  var FlashDialog = require("../flash/dialog");
  var MenuButton = require("../menubutton");
  var CLS_VIDEO = "ke_video", TYPE_VIDEO = "video", DTIP = "\u81ea\u52a8", MARGIN_DEFAULT = 0, bodyHTML = '<div style="padding:20px 20px 0 20px">' + "<p>" + "<label>" + "\u94fe\u63a5\uff1a " + "" + "<input " + 'class="{prefixCls}editor-video-url {prefixCls}editor-input" style="width:410px;' + '"/>' + "</label>" + "</p>" + "<table " + 'style="margin:10px 0 5px  40px;width:400px;">' + "<tr><td>" + "<label>\u5bbd\u5ea6\uff1a " + " " + "<input " + ' data-verify="^(' + DTIP + '|((?!0$)\\d+))?$" ' + ' data-warning="\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 
  'class="{prefixCls}editor-video-width {prefixCls}editor-input" ' + 'style="width:60px;' + '" ' + "/> \u50cf\u7d20" + "</label>" + "</td>" + "<td>" + "<label> \u9ad8\u5ea6\uff1a " + "" + " <input " + ' data-verify="^(' + DTIP + '|((?!0$)\\d+))?$" ' + ' data-warning="\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'class="{prefixCls}editor-video-height {prefixCls}editor-input" style="width:60px;' + '"/> \u50cf\u7d20' + "</label>" + "</td></tr>" + "<tr>" + "<td>" + "<label>\u5bf9\u9f50\uff1a " + 
  '<select class="{prefixCls}editor-video-align" title="\u5bf9\u9f50">' + '<option value="none">\u65e0</option>' + '<option value="left">\u5de6\u5bf9\u9f50</option>' + '<option value="right">\u53f3\u5bf9\u9f50</option>' + "</select>" + "</td>" + "<td>" + "<label>\u95f4\u8ddd\uff1a " + "<input " + "" + ' data-verify="^\\d+$" ' + ' data-warning="\u95f4\u8ddd\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570" ' + 'class="{prefixCls}editor-video-margin {prefixCls}editor-input" style="width:60px;' + '" value="' + 
  MARGIN_DEFAULT + '"/> \u50cf\u7d20' + "</label>" + "</td></tr>" + "</table>" + "</div>", footHTML = '<div style="padding:10px 0 35px 20px;"><a ' + 'class="{prefixCls}editor-video-ok {prefixCls}editor-button ks-inline-block" ' + 'style="margin-left:40px;margin-right:20px;">\u786e\u5b9a</button> ' + '<a class="{prefixCls}editor-video-cancel {prefixCls}editor-button ks-inline-block">\u53d6\u6d88</a></div>';
  function VideoDialog() {
    VideoDialog.superclass.constructor.apply(this, arguments)
  }
  S.extend(VideoDialog, FlashDialog, {_config:function() {
    var self = this, editor = self.editor, prefixCls = editor.get("prefixCls"), cfg = self.config;
    self._cls = CLS_VIDEO;
    self._type = TYPE_VIDEO;
    self._title = "\u89c6\u9891";
    self._bodyHTML = S.substitute(bodyHTML, {prefixCls:prefixCls});
    self._footHTML = S.substitute(footHTML, {prefixCls:prefixCls});
    self.urlCfg = cfg.urlCfg;
    self._urlTip = cfg.urlTip || "\u8bf7\u8f93\u5165\u89c6\u9891\u64ad\u653e\u94fe\u63a5..."
  }, _initD:function() {
    var self = this, d = self.dialog, editor = self.editor, prefixCls = editor.get("prefixCls"), el = d.get("el");
    self.dUrl = el.one("." + prefixCls + "editor-video-url");
    self.dAlign = MenuButton.Select.decorate(el.one("." + prefixCls + "editor-video-align"), {prefixCls:prefixCls + "editor-big-", width:80, menuCfg:{prefixCls:prefixCls + "editor-", render:el}});
    self.dMargin = el.one("." + prefixCls + "editor-video-margin");
    self.dWidth = el.one("." + prefixCls + "editor-video-width");
    self.dHeight = el.one("." + prefixCls + "editor-video-height");
    var action = el.one("." + prefixCls + "editor-video-ok"), cancel = el.one("." + prefixCls + "editor-video-cancel");
    action.on("click", self._gen, self);
    cancel.on("click", function(ev) {
      d.hide();
      ev.halt()
    });
    Editor.Utils.placeholder(self.dUrl, self._urlTip);
    Editor.Utils.placeholder(self.dWidth, DTIP);
    Editor.Utils.placeholder(self.dHeight, DTIP);
    self.addRes(self.dAlign)
  }, _getDInfo:function() {
    var self = this, url = self.dUrl.val();
    var videoCfg = self.config, p = videoCfg.getProvider(url);
    if(!p) {
      window.alert("\u4e0d\u652f\u6301\u8be5\u94fe\u63a5\u6765\u6e90!")
    }else {
      var re = p.detect(url);
      if(!re) {
        window.alert("\u4e0d\u652f\u6301\u8be5\u94fe\u63a5\uff0c\u8bf7\u76f4\u63a5\u8f93\u5165\u8be5\u89c6\u9891\u63d0\u4f9b\u7684\u5206\u4eab\u94fe\u63a5");
        return undefined
      }
      return{url:re, attrs:{height:parseInt(self.dHeight.val(), 10) || p.height, width:parseInt(self.dWidth.val(), 10) || p.width, style:"margin:" + (parseInt(self.dMargin.val(), 10) || 0) + "px;" + "float:" + self.dAlign.get("value") + ";"}}
    }
    return undefined
  }, _gen:function(ev) {
    var self = this, url = self.dUrl.val(), urlCfg = self.urlCfg;
    if(urlCfg) {
      for(var i = 0;i < urlCfg.length;i++) {
        var c = urlCfg[i];
        if(c.reg.test(url)) {
          self.dialog.loading();
          var data = {};
          data[c.paramName || "url"] = url;
          io({url:c.url, data:data, dataType:"jsonp", success:function(data) {
            self._dynamicUrlPrepare(data[1])
          }});
          return
        }
      }
    }
    VideoDialog.superclass._gen.call(self, ev);
    if(ev) {
      ev.halt()
    }
  }, _dynamicUrlPrepare:function(re) {
    var self = this;
    self.dUrl.val(re);
    self.dialog.unloading();
    VideoDialog.superclass._gen.call(self)
  }, _updateD:function() {
    var self = this, editor = self.editor, f = self.selectedFlash;
    if(f) {
      var r = editor.restoreRealElement(f);
      Editor.Utils.valInput(self.dUrl, self._getFlashUrl(r));
      self.dAlign.set("value", f.css("float"));
      self.dMargin.val(parseInt(r.style("margin"), 10) || 0);
      Editor.Utils.valInput(self.dWidth, parseInt(f.css("width"), 10));
      Editor.Utils.valInput(self.dHeight, parseInt(f.css("height"), 10))
    }else {
      Editor.Utils.resetInput(self.dUrl);
      self.dAlign.set("value", "none");
      self.dMargin.val(MARGIN_DEFAULT);
      Editor.Utils.resetInput(self.dWidth);
      Editor.Utils.resetInput(self.dHeight)
    }
  }});
  return VideoDialog
});

