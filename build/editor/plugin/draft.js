/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:20
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/draft
*/

KISSY.add("editor/plugin/draft", ["editor", "json", "event", "./local-storage", "overlay", "./menubutton"], function(S, require) {
  var Editor = require("editor");
  var Json = require("json");
  var Event = require("event");
  var localStorage = require("./local-storage");
  var Overlay = require("overlay");
  var MenuButton = require("./menubutton");
  var Node = S.Node, LIMIT = 5, INTERVAL = 5, DRAFT_SAVE = "ks-editor-draft-save20110503";
  function padding(n, l, p) {
    n += "";
    while(n.length < l) {
      n = p + n
    }
    return n
  }
  function date(d) {
    if(typeof d === "number") {
      d = new Date(d)
    }
    if(d instanceof Date) {
      return[d.getFullYear(), "-", padding(d.getMonth() + 1, 2, "0"), "-", padding(d.getDate(), 2, "0"), " ", padding(d.getHours(), 2, "0"), ":", padding(d.getMinutes(), 2, "0"), ":", padding(d.getSeconds(), 2, "0")].join("")
    }else {
      return d
    }
  }
  function Draft(editor, config) {
    this.editor = editor;
    this.config = config;
    this._init()
  }
  var addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
  S.augment(Draft, {_getSaveKey:function() {
    var self = this, cfg = self.config;
    return cfg.draft && cfg.draft.saveKey || DRAFT_SAVE
  }, _getDrafts:function() {
    var self = this;
    if(!self.drafts) {
      var str = localStorage.getItem(self._getSaveKey()), drafts = [];
      if(str) {
        drafts = localStorage === window.localStorage ? Json.parse(S.urlDecode(str)) : str
      }
      self.drafts = drafts
    }
    return self.drafts
  }, _init:function() {
    var self = this, editor = self.editor, prefixCls = editor.get("prefixCls"), statusbar = editor.get("statusBarEl"), cfg = this.config;
    cfg.draft = cfg.draft || {};
    self.draftInterval = cfg.draft.interval = cfg.draft.interval || INTERVAL;
    self.draftLimit = cfg.draft.limit = cfg.draft.limit || LIMIT;
    var holder = (new Node('<div class="' + prefixCls + 'editor-draft">' + '<span class="' + prefixCls + 'editor-draft-title">' + "\u5185\u5bb9\u6b63\u6587\u6bcf" + cfg.draft.interval + "\u5206\u949f\u81ea\u52a8\u4fdd\u5b58\u4e00\u6b21\u3002" + "</span>" + "</div>")).appendTo(statusbar);
    self.timeTip = (new Node('<span class="' + prefixCls + 'editor-draft-time"/>')).appendTo(holder);
    var save = (new Node(S.substitute('<a href="#" ' + 'onclick="return false;" ' + 'class="{prefixCls}editor-button ' + '{prefixCls}editor-draft-save-btn ks-inline-block" ' + 'style="' + "vertical-align:middle;" + "padding:1px 9px;" + '">' + '<span class="{prefixCls}editor-draft-save">' + "</span>" + "<span>\u7acb\u5373\u4fdd\u5b58</span>" + "</a>", {prefixCls:prefixCls}))).unselectable(undefined).appendTo(holder), versions = (new MenuButton({render:holder, collapseOnClick:true, width:"100px", prefixCls:prefixCls + 
    "editor-", menu:{width:"225px", align:{points:["tr", "br"]}}, matchElWidth:false, content:"\u6062\u590d\u7f16\u8f91\u5386\u53f2"})).render();
    self.versions = versions;
    versions.on("beforeCollapsedChange", function beforeCollapsedChange(e) {
      if(!e.newValue) {
        versions.detach("beforeCollapsedChange", beforeCollapsedChange);
        self.sync()
      }
    });
    save.on("click", function(ev) {
      self.save(false);
      ev.halt()
    });
    addRes.call(self, save);
    if(editor.get("textarea")[0].form) {
      (function() {
        var textarea = editor.get("textarea"), form = textarea[0].form;
        function saveF() {
          self.save(true)
        }
        Event.on(form, "submit", saveF);
        addRes.call(self, function() {
          Event.remove(form, "submit", saveF)
        })
      })()
    }
    var timer = setInterval(function() {
      self.save(true)
    }, self.draftInterval * 60 * 1E3);
    addRes.call(self, function() {
      clearInterval(timer)
    });
    versions.on("click", self.recover, self);
    addRes.call(self, versions);
    self.holder = holder;
    if(cfg.draft.helpHTML) {
      var help = (new Node("<a " + 'tabindex="0" ' + 'hidefocus="hidefocus" ' + 'class="' + prefixCls + 'editor-draft-help" ' + 'title="\u70b9\u51fb\u67e5\u770b\u5e2e\u52a9" ' + "href=\"javascript:void('\u70b9\u51fb\u67e5\u770b\u5e2e\u52a9 ')\">\u70b9\u51fb\u67e5\u770b\u5e2e\u52a9</a>")).unselectable(undefined).appendTo(holder);
      help.on("click", function() {
        help[0].focus();
        if(self.helpPopup && self.helpPopup.get("visible")) {
          self.helpPopup.hide()
        }else {
          self._prepareHelp()
        }
      });
      help.on("blur", function() {
        if(self.helpPopup) {
          self.helpPopup.hide()
        }
      });
      self.helpBtn = help;
      addRes.call(self, help);
      Editor.Utils.lazyRun(self, "_prepareHelp", "_realHelp")
    }
    addRes.call(self, holder)
  }, _prepareHelp:function() {
    var self = this, editor = self.editor, prefixCls = editor.get("prefixCls"), cfg = self.config, draftCfg = cfg.draft, help = new Node(draftCfg.helpHTML || "");
    var arrowCss = "height:0;" + "position:absolute;" + "font-size:0;" + "width:0;" + "border:8px #000 solid;" + "border-color:#000 transparent transparent transparent;" + "border-style:solid dashed dashed dashed;";
    var arrow = new Node('<div style="' + arrowCss + "border-top-color:#CED5E0;" + '">' + '<div style="' + arrowCss + "left:-8px;" + "top:-10px;" + "border-top-color:white;" + '">' + "</div>" + "</div>");
    help.append(arrow);
    help.css({border:"1px solid #ACB4BE", "text-align":"left"});
    self.helpPopup = (new Overlay({content:help, prefixCls:prefixCls + "editor-", width:help.width() + "px", zIndex:Editor.baseZIndex(Editor.ZIndexManager.OVERLAY), mask:false})).render();
    self.helpPopup.get("el").css("border", "none");
    self.helpPopup.arrow = arrow
  }, _realHelp:function() {
    var win = this.helpPopup, helpBtn = this.helpBtn, arrow = win.arrow;
    win.show();
    var off = helpBtn.offset();
    win.get("el").offset({left:off.left - win.get("el").width() + 17, top:off.top - win.get("el").height() - 7});
    arrow.offset({left:off.left - 2, top:off.top - 8})
  }, disable:function() {
    this.holder.css("visibility", "hidden")
  }, enable:function() {
    this.holder.css("visibility", "")
  }, sync:function() {
    var self = this, i, draftLimit = self.draftLimit, timeTip = self.timeTip, versions = self.versions, drafts = self._getDrafts(), draft, tip;
    if(drafts.length > draftLimit) {
      drafts.splice(0, drafts.length - draftLimit)
    }
    versions.removeItems(true);
    for(i = 0;i < drafts.length;i++) {
      draft = drafts[i];
      tip = (draft.auto ? "\u81ea\u52a8" : "\u624b\u52a8") + "\u4fdd\u5b58\u4e8e : " + date(draft.date);
      versions.addItem({content:tip, value:i})
    }
    if(!drafts.length) {
      versions.addItem({disabled:true, content:"\u5c1a\u65e0\u5386\u53f2", value:""})
    }
    timeTip.html(tip);
    localStorage.setItem(self._getSaveKey(), localStorage === window.localStorage ? encodeURIComponent(Json.stringify(drafts)) : drafts)
  }, save:function(auto) {
    var self = this, drafts = self._getDrafts(), editor = self.editor, data = editor.getFormatData();
    if(!data) {
      return
    }
    if(drafts[drafts.length - 1] && data === drafts[drafts.length - 1].content) {
      drafts.length -= 1
    }
    self.drafts = drafts.concat({content:data, date:(new Date).getTime(), auto:auto});
    self.sync()
  }, recover:function(ev) {
    var self = this, editor = self.editor, drafts = self._getDrafts(), v = ev.target.get("value");
    if(window.confirm("\u786e\u8ba4\u6062\u590d " + date(drafts[v].date) + " \u7684\u7f16\u8f91\u5386\u53f2\uff1f")) {
      editor.execCommand("save");
      editor.setData(drafts[v].content);
      editor.execCommand("save")
    }
    ev.halt()
  }, destroy:function() {
    destroyRes.call(this)
  }});
  function init(editor, config) {
    var d = new Draft(editor, config);
    editor.on("destroy", function() {
      d.destroy()
    })
  }
  function DraftPlugin(config) {
    this.config = config || {}
  }
  S.augment(DraftPlugin, {pluginRenderUI:function(editor) {
    var config = this.config;
    if(localStorage.ready) {
      localStorage.ready(function() {
        init(editor, config)
      })
    }else {
      init(editor, config)
    }
  }});
  return DraftPlugin
});

