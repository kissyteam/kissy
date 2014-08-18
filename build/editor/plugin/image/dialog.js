/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:22
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/image/dialog/dialog-tpl
 editor/plugin/image/dialog
*/

KISSY.add("editor/plugin/image/dialog/dialog-tpl", [], "<div class='{prefixCls}img-tabs'>\n    <div class='{prefixCls}img-tabs-bar ks-clear'>\n        <div\n                class='{prefixCls}img-tabs-tab-selected {prefixCls}img-tabs-tab'\n\n                hidefocus='hidefocus'>\n            \u7f51\u7edc\u56fe\u7247\n        </div>\n        <div\n                class='{prefixCls}img-tabs-tab'\n                hidefocus='hide\n    focus'>\n            \u672c\u5730\u4e0a\u4f20\n        </div>\n    </div>\n    <div class='{prefixCls}img-tabs-body'>\n        <div class='{prefixCls}img-tabs-panel {prefixCls}img-tabs-panel-selected'>\n            <label>\n        <span class='{prefixCls}image-title'>\n        \u56fe\u7247\u5730\u5740\uff1a\n        </span>\n                <input\n                        data-verify='^(https?:/)?/[^\\s]'\n                        data-warning='\u7f51\u5740\u683c\u5f0f\u4e3a\uff1ahttp:// \u6216 /'\n                        class='{prefixCls}img-url {prefixCls}input'\n                        style='width:390px;vertical-align:middle;'\n                        />\n            </label>\n        </div>\n        <div class='{prefixCls}img-tabs-panel'>\n            <form class='{prefixCls}img-upload-form' enctype='multipart/form-data'>\n                <p style='zoom:1;'>\n                    <input class='{prefixCls}input {prefixCls}img-local-url'\n                           readonly='readonly'\n                           style='margin-right: 15px;\n            vertical-align: middle;\n            width: 368px;\n            color:#969696;'/>\n                    <a\n                            style='padding:3px 11px;\n            position:absolute;\n            left:390px;\n            top:0;\n            z-index:1;'\n                            class='{prefixCls}image-up {prefixCls}button ks-inline-block'>\u6d4f\u89c8...</a>\n                </p>\n\n                <div class='{prefixCls}img-up-extraHTML'>\n                </div>\n            </form>\n        </div>\n    </div>\n</div>\n<div style='\n            padding:0 20px 5px 20px;'>\n    <table\n            style='width:100%;margin-top:8px;'\n            class='{prefixCls}img-setting'>\n        <tr>\n            <td>\n                <label>\n                    \u5bbd\u5ea6\uff1a\n                </label>\n                <input\n                        data-verify='^(\u81ea\u52a8|((?!0$)\\d+))?$'\n                        data-warning='\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570'\n                        class='{prefixCls}img-width {prefixCls}input'\n                        style='vertical-align:middle;width:60px'\n                        /> \u50cf\u7d20\n\n            </td>\n            <td>\n                <label>\n                    \u9ad8\u5ea6\uff1a\n                    <label>\n                        <input\n                                data-verify='^(\u81ea\u52a8|((?!0$)\\d+))?$'\n                                data-warning='\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570'\n                                class='{prefixCls}img-height {prefixCls}input'\n                                style='vertical-align:middle;width:60px'\n                                /> \u50cf\u7d20 </label>\n\n                    <input\n                            type='checkbox'\n                            class='{prefixCls}img-ratio'\n                            style='vertical-align:middle;margin-left:5px;'\n                            checked='checked'/>\n                    \u9501\u5b9a\u9ad8\u5bbd\u6bd4\n                </label>\n            </td>\n        </tr>\n        <tr>\n            <td>\n                <label>\n                    \u5bf9\u9f50\uff1a\n                </label>\n                <select class='{prefixCls}img-align' title='\u5bf9\u9f50'>\n                    <option value='none'>\u65e0</option>\n                    <option value='left'>\u5de6\u5bf9\u9f50</option>\n                    <option value='right'>\u53f3\u5bf9\u9f50</option>\n                </select>\n\n            </td>\n            <td><label>\n                \u95f4\u8ddd\uff1a\n            </label>\n                <input\n                        data-verify='^\\d+$'\n                        data-warning='\u95f4\u8ddd\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570'\n                        class='{prefixCls}img-margin {prefixCls}input'\n                        style='width:60px'/> \u50cf\u7d20\n\n            </td>\n        </tr>\n        <tr>\n            <td colspan='2' style='padding-top: 6px'>\n                <label>\n                    \u94fe\u63a5\u7f51\u5740\uff1a\n                </label>\n                <input\n                        class='{prefixCls}img-link {prefixCls}input'\n                        style='width:235px;vertical-align:middle;'\n                        data-verify='^(?:(?:\\s*)|(?:https?://[^\\s]+)|(?:#.+))$'\n                        data-warning='\u8bf7\u8f93\u5165\u5408\u9002\u7684\u7f51\u5740\u683c\u5f0f'\n                        />\n\n                <label>\n                    <input\n                            class='{prefixCls}img-link-blank'\n                            style='vertical-align:middle;\n                margin-left:5px;'\n                            type='checkbox'/>\n                    &nbsp; \u5728\u65b0\u7a97\u53e3\u6253\u5f00\u94fe\u63a5\n                </label>\n            </td>\n        </tr>\n    </table>\n</div>\n");
KISSY.add("editor/plugin/image/dialog", ["editor", "io", "../dialog", "tabs", "../menubutton", "./dialog/dialog-tpl"], function(S, require) {
  var Editor = require("editor");
  var IO = require("io");
  var Dialog4E = require("../dialog");
  var Tabs = require("tabs");
  var MenuButton = require("../menubutton");
  var bodyTpl = require("./dialog/dialog-tpl");
  var dtd = Editor.XHTML_DTD, UA = S.UA, Node = KISSY.NodeList, HTTP_TIP = "http://", AUTOMATIC_TIP = "\u81ea\u52a8", MARGIN_DEFAULT = 10, IMAGE_DIALOG_BODY_HTML = bodyTpl, IMAGE_DIALOG_FOOT_HTML = '<div style="padding:5px 20px 20px;">' + "<a " + "href=\"javascript:void('\u786e\u5b9a')\" " + 'class="{prefixCls}img-insert {prefixCls}button ks-inline-block" ' + 'style="margin-right:30px;">\u786e\u5b9a</a> ' + "<a  " + "href=\"javascript:void('\u53d6\u6d88')\" " + 'class="{prefixCls}img-cancel {prefixCls}button ks-inline-block">\u53d6\u6d88</a></div>', 
  warning = "\u8bf7\u70b9\u51fb\u6d4f\u89c8\u4e0a\u4f20\u56fe\u7247", valInput = Editor.Utils.valInput;
  function findAWithImg(img) {
    var ret = img;
    while(ret) {
      var name = ret.nodeName();
      if(name === "a") {
        return ret
      }
      if(dtd.$block[name] || dtd.$blockLimit[name]) {
        return null
      }
      ret = ret.parent()
    }
    return null
  }
  function ImageDialog(editor, config) {
    var self = this;
    self.editor = editor;
    self.imageCfg = config || {};
    self.cfg = self.imageCfg.upload || null;
    self.suffix = self.cfg && self.cfg.suffix || "png,jpg,jpeg,gif";
    self.suffixReg = new RegExp(self.suffix.split(/,/).join("|") + "$", "i");
    self.suffixWarning = "\u53ea\u5141\u8bb8\u540e\u7f00\u540d\u4e3a" + self.suffix + "\u7684\u56fe\u7247"
  }
  S.augment(ImageDialog, {_prepare:function() {
    var self = this;
    var editor = self.editor, prefixCls = editor.get("prefixCls") + "editor-";
    self.dialog = self.d = (new Dialog4E({width:500, headerContent:"\u56fe\u7247", bodyContent:S.substitute(IMAGE_DIALOG_BODY_HTML, {prefixCls:prefixCls}), footerContent:S.substitute(IMAGE_DIALOG_FOOT_HTML, {prefixCls:prefixCls}), mask:true})).render();
    var content = self.d.get("el"), cancel = content.one("." + prefixCls + "img-cancel"), ok = content.one("." + prefixCls + "img-insert"), verifyInputs = Editor.Utils.verifyInputs, commonSettingTable = content.one("." + prefixCls + "img-setting");
    self.uploadForm = content.one("." + prefixCls + "img-upload-form");
    self.imgLocalUrl = content.one("." + prefixCls + "img-local-url");
    self.tab = (new Tabs({srcNode:self.d.get("body").one("." + prefixCls + "img-tabs"), prefixCls:prefixCls + "img-"})).render();
    self.imgLocalUrl.val(warning);
    self.imgUrl = content.one("." + prefixCls + "img-url");
    self.imgHeight = content.one("." + prefixCls + "img-height");
    self.imgWidth = content.one("." + prefixCls + "img-width");
    self.imgRatio = content.one("." + prefixCls + "img-ratio");
    self.imgAlign = MenuButton.Select.decorate(content.one("." + prefixCls + "img-align"), {prefixCls:prefixCls + "big-", width:80, menuCfg:{prefixCls:prefixCls + "", render:content}});
    self.imgMargin = content.one("." + prefixCls + "img-margin");
    self.imgLink = content.one("." + prefixCls + "img-link");
    self.imgLinkBlank = content.one("." + prefixCls + "img-link-blank");
    var placeholder = Editor.Utils.placeholder;
    placeholder(self.imgUrl, HTTP_TIP);
    placeholder(self.imgHeight, AUTOMATIC_TIP);
    placeholder(self.imgWidth, AUTOMATIC_TIP);
    placeholder(self.imgLink, "http://");
    self.imgHeight.on("keyup", function() {
      var v = parseInt(valInput(self.imgHeight), 10);
      if(!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue) {
        return
      }
      valInput(self.imgWidth, Math.floor(v * self.imgRatioValue))
    });
    self.imgWidth.on("keyup", function() {
      var v = parseInt(valInput(self.imgWidth), 10);
      if(!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue) {
        return
      }
      valInput(self.imgHeight, Math.floor(v / self.imgRatioValue))
    });
    cancel.on("click", function(ev) {
      self.d.hide();
      ev.halt()
    });
    var loadingCancel = (new Node('<a class="' + prefixCls + 'button ks-inline-block" ' + 'style="position:absolute;' + "z-index:" + Editor.baseZIndex(Editor.ZIndexManager.LOADING_CANCEL) + ";" + "left:-9999px;" + "top:-9999px;" + '">\u53d6\u6d88\u4e0a\u4f20</a>')).appendTo(document.body, undefined);
    self.loadingCancel = loadingCancel;
    function getFileSize(file) {
      if(file.files) {
        return file.files[0].size
      }else {
        if(1 > 2) {
          try {
            var fso = new window.ActiveXObject("Scripting.FileSystemObject"), file2 = fso.GetFile(file.value);
            return file2.size
          }catch(e) {
          }
        }
      }
      return 0
    }
    ok.on("click", function(ev) {
      ev.halt();
      if((self.imageCfg.remote === false || S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) === 1) && self.cfg) {
        if(!verifyInputs(commonSettingTable.all("input"))) {
          return
        }
        if(self.imgLocalUrl.val() === warning) {
          alert("\u8bf7\u5148\u9009\u62e9\u6587\u4ef6!");
          return
        }
        if(!self.suffixReg.test(self.imgLocalUrl.val())) {
          alert(self.suffixWarning);
          self.uploadForm[0].reset();
          self.imgLocalUrl.val(warning);
          return
        }
        var size = getFileSize(self.fileInput[0]);
        if(sizeLimit && sizeLimit < size / 1E3) {
          alert("\u4e0a\u4f20\u56fe\u7247\u6700\u5927\uff1a" + sizeLimit / 1E3 + "M");
          return
        }
        self.d.loading();
        loadingCancel.on("click", function(ev) {
          ev.halt();
          uploadIO.abort()
        });
        var serverParams = Editor.Utils.normParams(self.cfg.serverParams) || {};
        serverParams["document-domain"] = document.domain;
        var uploadIO = IO({data:serverParams, url:self.cfg.serverUrl, form:self.uploadForm[0], dataType:"json", type:"post", complete:function(data, status) {
          loadingCancel.css({left:-9999, top:-9999});
          self.d.unloading();
          if(status === "abort") {
            return
          }
          if(!data) {
            data = {error:"\u670d\u52a1\u5668\u51fa\u9519\uff0c\u8bf7\u91cd\u8bd5"}
          }
          if(data.error) {
            alert(data.error);
            return
          }
          valInput(self.imgUrl, data.imgUrl);
          (new Image).src = data.imgUrl;
          self._insert()
        }});
        var loadingMaskEl = self.d.get("el"), offset = loadingMaskEl.offset(), width = loadingMaskEl[0].offsetWidth, height = loadingMaskEl[0].offsetHeight;
        loadingCancel.css({left:offset.left + width / 2.5, top:offset.top + height / 1.5})
      }else {
        if(!verifyInputs(content.all("input"))) {
          return
        }
        self._insert()
      }
    });
    if(self.cfg) {
      if(self.cfg.extraHTML) {
        content.one("." + prefixCls + "img-up-extraHTML").html(self.cfg.extraHTML)
      }
      var imageUp = content.one("." + prefixCls + "image-up"), sizeLimit = self.cfg && self.cfg.sizeLimit;
      self.fileInput = (new Node("<input " + 'type="file" ' + 'style="position:absolute;' + "cursor:pointer;" + "left:" + (UA.ie ? "360" : UA.chrome ? "319" : "369") + "px;" + "z-index:2;" + "top:0px;" + 'height:26px;" ' + 'size="1" ' + 'name="' + (self.cfg.fileInput || "Filedata") + '"/>')).insertAfter(self.imgLocalUrl);
      if(sizeLimit) {
        warning = "\u5355\u5f20\u56fe\u7247\u5bb9\u91cf\u4e0d\u8d85\u8fc7 " + sizeLimit / 1E3 + " M"
      }
      self.imgLocalUrl.val(warning);
      self.fileInput.css("opacity", 0);
      self.fileInput.on("mouseenter", function() {
        imageUp.addClass("" + prefixCls + "button-hover")
      });
      self.fileInput.on("mouseleave", function() {
        imageUp.removeClass("" + prefixCls + "button-hover")
      });
      self.fileInput.on("change", function() {
        var file = self.fileInput.val();
        self.imgLocalUrl.val(file.replace(/.+[\/\\]/, ""))
      });
      if(self.imageCfg.remote === false) {
        self.tab.removeItemAt(0, 1)
      }
    }else {
      self.tab.removeItemAt(1, 1)
    }
    self._prepare = S.noop
  }, _insert:function() {
    var self = this, url = valInput(self.imgUrl), img, height = parseInt(valInput(self.imgHeight), 10), width = parseInt(valInput(self.imgWidth), 10), align = self.imgAlign.get("value"), margin = parseInt(self.imgMargin.val(), 10), style = "";
    if(height) {
      style += "height:" + height + "px;"
    }
    if(width) {
      style += "width:" + width + "px;"
    }
    if(align !== "none") {
      style += "float:" + align + ";"
    }
    if(!isNaN(margin) && margin !== 0) {
      style += "margin:" + margin + "px;"
    }
    self.d.hide();
    if(self.selectedEl) {
      img = self.selectedEl;
      self.editor.execCommand("save");
      self.selectedEl.attr({src:url, _ke_saved_src:url, style:style})
    }else {
      img = new Node("<img " + (style ? 'style="' + style + '"' : "") + ' src="' + url + '" ' + '_ke_saved_src="' + url + '" alt="" />', null, self.editor.get("document")[0]);
      self.editor.insertElement(img)
    }
    setTimeout(function() {
      var link = findAWithImg(img), linkVal = S.trim(valInput(self.imgLink)), sel = self.editor.getSelection(), target = self.imgLinkBlank.attr("checked") ? "_blank" : "_self", linkTarget, skip = 0, prev, next, bs;
      if(link) {
        linkTarget = link.attr("target") || "_self";
        if(linkVal !== link.attr("href") || linkTarget !== target) {
          img._4eBreakParent(link);
          if((prev = img.prev()) && prev.nodeName() === "a" && !prev[0].childNodes.length) {
            prev.remove()
          }
          if((next = img.next()) && next.nodeName() === "a" && !next[0].childNodes.length) {
            next.remove()
          }
        }else {
          skip = 1
        }
      }
      if(!skip && linkVal) {
        if(!self.selectedEl) {
          bs = sel.createBookmarks()
        }
        link = new Node("<a></a>");
        link.attr("_ke_saved_href", linkVal).attr("href", linkVal).attr("target", target);
        var t = img[0];
        t.parentNode.replaceChild(link[0], t);
        link.append(t)
      }
      if(bs) {
        sel.selectBookmarks(bs)
      }else {
        if(self.selectedEl) {
          self.editor.getSelection().selectElement(self.selectedEl)
        }
      }
      if(!skip) {
        self.editor.execCommand("save")
      }
    }, 100)
  }, _update:function(selectedEl) {
    var self = this, active = 0, link, resetInput = Editor.Utils.resetInput;
    self.selectedEl = selectedEl;
    if(selectedEl && self.imageCfg.remote !== false) {
      valInput(self.imgUrl, selectedEl.attr("src"));
      var w = parseInt(selectedEl.style("width"), 10), h = parseInt(selectedEl.style("height"), 10);
      if(h) {
        valInput(self.imgHeight, h)
      }else {
        resetInput(self.imgHeight)
      }
      if(w) {
        valInput(self.imgWidth, w)
      }else {
        resetInput(self.imgWidth)
      }
      self.imgAlign.set("value", selectedEl.style("float") || "none");
      var margin = parseInt(selectedEl.style("margin"), 10) || 0;
      self.imgMargin.val(margin);
      self.imgRatio[0].disabled = false;
      self.imgRatioValue = w / h;
      link = findAWithImg(selectedEl)
    }else {
      var editor = self.editor;
      var editorSelection = editor.getSelection();
      var inElement = editorSelection && editorSelection.getCommonAncestor();
      if(inElement) {
        link = findAWithImg(inElement)
      }
      var defaultMargin = self.imageCfg.defaultMargin;
      if(defaultMargin === undefined) {
        defaultMargin = MARGIN_DEFAULT
      }
      if(self.tab.get("bar").get("children").length === 2) {
        active = 1
      }
      self.imgLinkBlank.attr("checked", true);
      resetInput(self.imgUrl);
      resetInput(self.imgLink);
      resetInput(self.imgHeight);
      resetInput(self.imgWidth);
      self.imgAlign.set("value", "none");
      self.imgMargin.val(defaultMargin);
      self.imgRatio[0].disabled = true;
      self.imgRatioValue = null
    }
    if(link) {
      valInput(self.imgLink, link.attr("_ke_saved_href") || link.attr("href"));
      self.imgLinkBlank.attr("checked", link.attr("target") === "_blank")
    }else {
      resetInput(self.imgLink);
      self.imgLinkBlank.attr("checked", true)
    }
    self.uploadForm[0].reset();
    self.imgLocalUrl.val(warning);
    var tab = self.tab;
    tab.setSelectedTab(tab.getTabAt(active))
  }, show:function(_selectedEl) {
    var self = this;
    self._prepare();
    self._update(_selectedEl);
    self.d.show()
  }, destroy:function() {
    var self = this;
    self.d.destroy();
    self.tab.destroy();
    if(self.loadingCancel) {
      self.loadingCancel.remove()
    }
    if(self.imgAlign) {
      self.imgAlign.destroy()
    }
  }});
  return ImageDialog
});

