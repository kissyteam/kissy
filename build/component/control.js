/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:35
*/
/*
 Combined modules by KISSY Module Compiler: 

 component/control/render-xtpl
 component/control
*/

KISSY.add("component/control/render-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, buffer, payload, undefined) {
    var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("5.0.0" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write('<div id="');
    var id0 = scope.resolve(["id"]);
    buffer.write(id0, true);
    buffer.write('"\n class="');
    var option1 = {escape:1};
    var commandRet2 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
    if(commandRet2 && commandRet2.isBuffer) {
      buffer = commandRet2;
      commandRet2 = undefined
    }
    buffer.write(commandRet2, true);
    buffer.write("\n");
    var option3 = {escape:1};
    var params4 = [];
    var id5 = scope.resolve(["elCls"]);
    params4.push(id5);
    option3.params = params4;
    option3.fn = function(scope, buffer) {
      buffer.write("\n ");
      var id6 = scope.resolve(["this"]);
      buffer.write(id6, true);
      buffer.write("\n");
      return buffer
    };
    buffer = eachCommand.call(engine, scope, option3, buffer, 3, payload);
    buffer.write('\n"\n\n');
    var option7 = {escape:1};
    var params8 = [];
    var id9 = scope.resolve(["elAttrs"]);
    params8.push(id9);
    option7.params = params8;
    option7.fn = function(scope, buffer) {
      buffer.write("\n ");
      var id10 = scope.resolve(["xindex"]);
      buffer.write(id10, true);
      buffer.write('="');
      var id11 = scope.resolve(["this"]);
      buffer.write(id11, true);
      buffer.write('"\n');
      return buffer
    };
    buffer = eachCommand.call(engine, scope, option7, buffer, 8, payload);
    buffer.write('\n\nstyle="\n');
    var option12 = {escape:1};
    var params13 = [];
    var id14 = scope.resolve(["elStyle"]);
    params13.push(id14);
    option12.params = params13;
    option12.fn = function(scope, buffer) {
      buffer.write("\n ");
      var id15 = scope.resolve(["xindex"]);
      buffer.write(id15, true);
      buffer.write(":");
      var id16 = scope.resolve(["this"]);
      buffer.write(id16, true);
      buffer.write(";\n");
      return buffer
    };
    buffer = eachCommand.call(engine, scope, option12, buffer, 13, payload);
    buffer.write('\n">');
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("component/control", ["node", "event/gesture/base", "event/gesture/tap", "component/manager", "base", "./control/render-xtpl", "ua", "xtemplate/runtime"], function(S, require) {
  var Node = require("node");
  var BaseGesture = require("event/gesture/base");
  var TapGesture = require("event/gesture/tap");
  var Manager = require("component/manager");
  var Base = require("base");
  var RenderTpl = require("./control/render-xtpl");
  var UA = require("ua");
  var Feature = S.Feature;
  var __getHook = Base.prototype.__getHook;
  var startTpl = RenderTpl;
  var endTpl = "</div>";
  var isTouchGestureSupported = Feature.isTouchGestureSupported();
  var noop = S.noop;
  var XTemplateRuntime = require("xtemplate/runtime");
  var trim = S.trim;
  var $ = Node.all;
  var doc = S.Env.host.document;
  function normalExtras(extras) {
    if(!extras) {
      extras = [""]
    }
    if(typeof extras === "string") {
      extras = extras.split(/\s+/)
    }
    return extras
  }
  function prefixExtra(prefixCls, componentCls, extras) {
    var cls = "", i = 0, l = extras.length, e, prefix = prefixCls + componentCls;
    for(;i < l;i++) {
      e = extras[i];
      e = e ? "-" + e : e;
      cls += " " + prefix + e
    }
    return cls
  }
  function pxSetter(v) {
    if(typeof v === "number") {
      v += "px"
    }
    return v
  }
  function applyParser(srcNode) {
    var self = this, attr, attrName, ret;
    var attrs = self.getAttrs();
    for(attrName in attrs) {
      attr = attrs[attrName];
      if(attr.parse) {
        ret = attr.parse.call(self, srcNode);
        if(ret !== undefined) {
          self.setInternal(attrName, ret)
        }
      }
    }
  }
  function getBaseCssClassesCmd(_, options) {
    return this.config.control.getBaseCssClasses(options && options.params && options.params[0])
  }
  function getBaseCssClassCmd() {
    return this.config.control.getBaseCssClass(arguments[1].params[0])
  }
  var Control = Base.extend({isControl:true, bindInternal:noop, syncInternal:noop, initializer:function() {
    var self = this;
    var attrName, attr;
    var attrs = self.getAttrs();
    self.renderData = {};
    self.childrenElSelectors = {};
    self.renderCommands = {getBaseCssClasses:getBaseCssClassesCmd, getBaseCssClass:getBaseCssClassCmd};
    for(attrName in attrs) {
      attr = attrs[attrName];
      if(attr.selector) {
        self.childrenElSelectors[attrName] = attr.selector
      }
    }
  }, beforeCreateDom:function(renderData) {
    var self = this, width, height, visible, elAttrs = self.get("elAttrs"), disabled, attrs = self.getAttrs(), attrName, attr, elStyle = self.get("elStyle"), zIndex, elCls = self.get("elCls");
    for(attrName in attrs) {
      attr = attrs[attrName];
      if(attr.render) {
        renderData[attrName] = self.get(attrName)
      }
    }
    width = renderData.width;
    height = renderData.height;
    visible = renderData.visible;
    zIndex = renderData.zIndex;
    if(width) {
      elStyle.width = pxSetter(width)
    }
    if(height) {
      elStyle.height = pxSetter(height)
    }
    if(zIndex) {
      elStyle["z-index"] = zIndex
    }
    if(!visible) {
      elCls.push(self.getBaseCssClasses("hidden"))
    }
    if(disabled = self.get("disabled")) {
      elCls.push(self.getBaseCssClasses("disabled"));
      elAttrs["aria-disabled"] = "true"
    }
    if(self.get("highlighted")) {
      elCls.push(self.getBaseCssClasses("hover"))
    }
    if(self.get("focusable")) {
      if(UA.ieMode < 9) {
        elAttrs.hideFocus = "true"
      }
      elAttrs.tabindex = disabled ? "-1" : "0"
    }
  }, createDom:function() {
    var self = this;
    var html = self.renderTpl(startTpl) + self.renderTpl(self.get("contentTpl")) + endTpl;
    self.$el = $(html);
    self.el = self.$el[0];
    self.fillChildrenElsBySelectors()
  }, decorateDom:function(srcNode) {
    var self = this;
    self.$el = srcNode;
    self.el = srcNode[0];
    self.fillChildrenElsBySelectors();
    applyParser.call(self, srcNode)
  }, renderUI:function() {
    var self = this;
    Manager.addComponent(self);
    var $el = self.$el;
    if(!self.get("allowTextSelection")) {
      $el.unselectable()
    }
    if(!self.get("srcNode")) {
      var render = self.get("render"), renderBefore = self.get("elBefore");
      if(renderBefore) {
        $el.insertBefore(renderBefore, undefined)
      }else {
        if(render) {
          $el.appendTo(render, undefined)
        }else {
          $el.appendTo(doc.body, undefined)
        }
      }
    }
  }, bindUI:function() {
    var self = this;
    if(self.get("focusable")) {
      self.getKeyEventTarget().on("focus", self.handleFocus, self).on("blur", self.handleBlur, self).on("keydown", self.handleKeydown, self)
    }
    if(self.get("handleGestureEvents")) {
      self.$el.on("mouseenter", self.handleMouseEnter, self).on("mouseleave", self.handleMouseLeave, self).on("contextmenu", self.handleContextMenu, self).on(BaseGesture.START, self.handleMouseDown, self).on(BaseGesture.END, self.handleMouseUp, self).on(TapGesture.TAP, self.handleClick, self)
    }
  }, syncUI:noop, create:function() {
    var self = this;
    if(!self.get("created")) {
      self.fire("beforeCreateDom");
      var srcNode = self.get("srcNode");
      if(srcNode) {
        self.decorateDom(srcNode)
      }
      self.beforeCreateDom(self.renderData, self.renderCommands, self.childrenElSelectors);
      if(!srcNode) {
        self.createDom()
      }
      self.__callPluginsMethod("pluginCreateDom");
      self.fire("afterCreateDom");
      self.setInternal("created", true)
    }
    return self
  }, render:function() {
    var self = this;
    if(!self.get("rendered")) {
      self.create();
      self.fire("beforeRenderUI");
      self.renderUI();
      self.__callPluginsMethod("pluginRenderUI");
      self.fire("afterRenderUI");
      self.fire("beforeBindUI");
      Control.superclass.bindInternal.call(self);
      self.bindUI();
      self.__callPluginsMethod("pluginBindUI");
      self.fire("afterBindUI");
      self.fire("beforeSyncUI");
      Control.superclass.syncInternal.call(self);
      self.syncUI();
      self.__callPluginsMethod("pluginSyncUI");
      self.fire("afterSyncUI");
      self.setInternal("rendered", true)
    }
    return self
  }, plug:function(plugin) {
    var self = this, p, plugins = self.get("plugins");
    self.callSuper(plugin);
    p = plugins[plugins.length - 1];
    if(self.get("rendered")) {
      if(p.pluginCreateDom) {
        p.pluginCreateDom(self)
      }
      if(p.pluginRenderUI) {
        p.pluginCreateDom(self)
      }
      if(p.pluginBindUI) {
        p.pluginBindUI(self)
      }
      if(p.pluginSyncUI) {
        p.pluginSyncUI(self)
      }
    }else {
      if(self.get("created")) {
        if(p.pluginCreateDom) {
          p.pluginCreateDom(self)
        }
      }
    }
    return self
  }, getKeyEventTarget:function() {
    return this.$el
  }, handleMouseEnter:function(ev) {
    if(!this.get("disabled")) {
      this.handleMouseEnterInternal(ev)
    }
  }, handleMouseEnterInternal:function(ev) {
    this.set("highlighted", !!ev)
  }, handleMouseLeave:function(ev) {
    if(!this.get("disabled")) {
      this.handleMouseLeaveInternal(ev)
    }
  }, handleMouseLeaveInternal:function(ev) {
    var self = this;
    self.set("active", false);
    self.set("highlighted", !ev)
  }, handleMouseDown:function(ev) {
    if(!this.get("disabled")) {
      this.handleMouseDownInternal(ev)
    }
  }, handleMouseDownInternal:function(ev) {
    var self = this, n, isMouseActionButton = ev.which === 1;
    if(isMouseActionButton || isTouchGestureSupported) {
      if(self.get("activeable")) {
        self.set("active", true)
      }
      if(self.get("focusable")) {
        self.focus()
      }
      if(!self.get("allowTextSelection") && ev.gestureType === "mouse") {
        n = ev.target.nodeName;
        n = n && n.toLowerCase();
        if(n !== "input" && n !== "textarea" && n !== "button") {
          ev.preventDefault()
        }
      }
    }
  }, handleMouseUp:function(ev) {
    if(!this.get("disabled")) {
      this.handleMouseUpInternal(ev)
    }
  }, handleMouseUpInternal:function(ev) {
    var self = this;
    if(self.get("active") && (ev.which === 1 || isTouchGestureSupported)) {
      self.set("active", false)
    }
  }, handleContextMenu:function(ev) {
    if(!this.get("disabled")) {
      this.handleContextMenuInternal(ev)
    }
  }, handleContextMenuInternal:function() {
  }, handleFocus:function() {
    if(!this.get("disabled")) {
      this.handleFocusInternal()
    }
  }, handleFocusInternal:function() {
    this.focus();
    this.fire("focus")
  }, handleBlur:function() {
    if(!this.get("disabled")) {
      this.handleBlurInternal()
    }
  }, handleBlurInternal:function() {
    this.blur();
    this.fire("blur")
  }, handleKeydown:function(ev) {
    var self = this;
    if(!this.get("disabled") && self.handleKeyDownInternal(ev)) {
      ev.halt();
      return true
    }
    return undefined
  }, handleKeyDownInternal:function(ev) {
    if(ev.keyCode === Node.KeyCode.ENTER) {
      return this.handleClickInternal(ev)
    }
    return undefined
  }, handleClick:function(ev) {
    if(!this.get("disabled")) {
      this.handleClickInternal(ev)
    }
  }, handleClickInternal:function() {
    var self = this;
    if(self.get("focusable")) {
      self.focus()
    }
  }, $:function(selector) {
    return this.$el.all(selector)
  }, fillChildrenElsBySelectors:function(childrenElSelectors) {
    var self = this, el = self.$el, childName, selector;
    childrenElSelectors = childrenElSelectors || self.childrenElSelectors;
    for(childName in childrenElSelectors) {
      selector = childrenElSelectors[childName];
      var node = selector.call(self, el);
      if(typeof node === "string") {
        node = self.$(node)
      }
      self.setInternal(childName, node)
    }
  }, renderTpl:function(tpl, renderData, renderCommands) {
    var self = this;
    renderData = renderData || self.renderData;
    renderCommands = renderCommands || self.renderCommands;
    var XTemplate = self.get("XTemplate");
    return(new XTemplate(tpl, {control:self, commands:renderCommands})).render(renderData)
  }, getComponentConstructorByNode:function(prefixCls, childNode) {
    var cls = childNode[0].className;
    if(cls) {
      cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
      return Manager.getConstructorByXClass(cls)
    }
    return null
  }, getComponentCssClasses:function() {
    var self = this;
    if(self.componentCssClasses) {
      return self.componentCssClasses
    }
    var constructor = self.constructor, xclass, re = [];
    while(constructor && !constructor.prototype.hasOwnProperty("isControl")) {
      xclass = constructor.xclass;
      if(xclass) {
        re.push(xclass)
      }
      constructor = constructor.superclass && constructor.superclass.constructor
    }
    self.componentCssClasses = re;
    return re
  }, getBaseCssClasses:function(extras) {
    extras = normalExtras(extras);
    var componentCssClasses = this.getComponentCssClasses(), i = 0, cls = "", l = componentCssClasses.length, prefixCls = this.get("prefixCls");
    for(;i < l;i++) {
      cls += prefixExtra(prefixCls, componentCssClasses[i], extras)
    }
    return trim(cls)
  }, getBaseCssClass:function(extras) {
    return trim(prefixExtra(this.get("prefixCls"), this.getComponentCssClasses()[0], normalExtras(extras)))
  }, createComponent:function(cfg, parent) {
    return Manager.createComponent(cfg, parent || this)
  }, show:function() {
    var self = this;
    self.render();
    self.set("visible", true);
    return self
  }, hide:function() {
    var self = this;
    self.set("visible", false);
    return self
  }, focus:function() {
    if(this.get("focusable")) {
      this.set("focused", true)
    }
  }, blur:function() {
    if(this.get("focusable")) {
      this.set("focused", false)
    }
  }, move:function(x, y) {
    this.set({x:x, y:y})
  }, _onSetWidth:function(w) {
    this.$el.width(w)
  }, _onSetHeight:function(h) {
    this.$el.height(h)
  }, _onSetContent:function(c) {
    var el = this.$el;
    el.html(c);
    if(!this.get("allowTextSelection")) {
      el.unselectable()
    }
  }, _onSetVisible:function(visible) {
    var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses("hidden");
    if(visible) {
      el.removeClass(hiddenCls)
    }else {
      el.addClass(hiddenCls)
    }
    this.fire(visible ? "show" : "hide")
  }, _onSetHighlighted:function(v) {
    var self = this, componentCls = self.getBaseCssClasses("hover"), el = self.$el;
    el[v ? "addClass" : "removeClass"](componentCls)
  }, _onSetDisabled:function(v) {
    var self = this, componentCls = self.getBaseCssClasses("disabled"), el = self.$el;
    el[v ? "addClass" : "removeClass"](componentCls).attr("aria-disabled", v);
    if(self.get("focusable")) {
      self.getKeyEventTarget().attr("tabindex", v ? -1 : 0)
    }
  }, _onSetActive:function(v) {
    var self = this, componentCls = self.getBaseCssClasses("active");
    self.$el[v ? "addClass" : "removeClass"](componentCls).attr("aria-pressed", !!v)
  }, _onSetZIndex:function(v) {
    this.$el.css("z-index", v)
  }, _onSetFocused:function(v) {
    var target = this.getKeyEventTarget()[0];
    if(v) {
      try {
        target.focus()
      }catch(e) {
        S.log(target);
        S.log("focus error", "warn")
      }
    }else {
      if(target.ownerDocument.activeElement === target) {
        target.ownerDocument.body.focus()
      }
    }
    var self = this, el = self.$el, componentCls = self.getBaseCssClasses("focused");
    el[v ? "addClass" : "removeClass"](componentCls)
  }, _onSetX:function(x) {
    this.$el.offset({left:x})
  }, _onSetY:function(y) {
    this.$el.offset({top:y})
  }, destructor:function() {
    var self = this;
    Manager.removeComponent(self);
    if(self.$el) {
      self.$el.remove()
    }
  }}, {__hooks__:{beforeCreateDom:__getHook("__beforeCreateDom"), createDom:__getHook("__createDom"), decorateDom:__getHook("__decorateDom"), renderUI:__getHook("__renderUI"), bindUI:__getHook("__bindUI"), syncUI:__getHook("__syncUI")}, name:"control", ATTRS:{contentTpl:{value:function(scope, buffer) {
    return buffer.write(scope.get("content"))
  }}, content:{parse:function(el) {
    return el.html()
  }, render:1, sync:0, value:""}, width:{render:1, sync:0}, height:{render:1, sync:0}, elCls:{render:1, value:[], setter:function(v) {
    if(typeof v === "string") {
      v = v.split(/\s+/)
    }
    return v || []
  }}, elStyle:{render:1, value:{}}, elAttrs:{render:1, value:{}}, x:{}, y:{}, xy:{setter:function(v) {
    var self = this, xy = S.makeArray(v);
    if(xy.length) {
      if(xy[0] !== undefined) {
        self.set("x", xy[0])
      }
      if(xy[1] !== undefined) {
        self.set("y", xy[1])
      }
    }
    return v
  }, getter:function() {
    return[this.get("x"), this.get("y")]
  }}, zIndex:{render:1, sync:0}, visible:{render:1, sync:0, value:true}, activeable:{value:true}, focused:{}, active:{value:false}, highlighted:{render:1, sync:0, value:false}, disabled:{render:1, sync:0, value:false, parse:function(el) {
    return el.hasClass(this.getBaseCssClass("disabled"))
  }}, rendered:{value:false}, created:{value:false}, render:{}, id:{render:1, parse:function(el) {
    var id = el.attr("id");
    if(!id) {
      id = S.guid("ks-component");
      el.attr("id", id)
    }
    return id
  }, valueFn:function() {
    return S.guid("ks-component")
  }}, elBefore:{}, el:{getter:function() {
    return this.$el
  }}, srcNode:{setter:function(v) {
    return $(v)
  }}, handleGestureEvents:{value:true}, focusable:{value:true}, allowTextSelection:{value:false}, prefixCls:{render:1, value:S.config("component/prefixCls") || "ks-"}, prefixXClass:{}, parent:{setter:function(p, prev) {
    if(prev = this.get("parent")) {
      this.removeTarget(prev)
    }
    if(p) {
      this.addTarget(p)
    }
  }}, XTemplate:{value:XTemplateRuntime}}});
  Control.extend = function extend(extensions, px, sx) {
    var args = S.makeArray(arguments), self = this, xclass, argsLen = args.length, last = args[argsLen - 1];
    if(last && (xclass = last.xclass)) {
      last.name = xclass
    }
    var NewClass = Base.extend.apply(self, arguments);
    NewClass.extend = extend;
    if(xclass) {
      Manager.setConstructorByXClass(xclass, NewClass)
    }
    return NewClass
  };
  return Control
});

