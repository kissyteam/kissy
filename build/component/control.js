/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Apr 4 12:10
*/
/*
 Combined modules by KISSY Module Compiler: 

 component/control/process
 component/control/render-xtpl
 component/control/render
 component/control
*/

KISSY.add("component/control/process", ["base"], function(S, require) {
  var Base = require("base");
  var __getHook = Base.prototype.__getHook;
  var noop = S.noop;
  var ControlProcess = Base.extend({bindInternal:noop, syncInternal:noop, renderUI:noop, syncUI:noop, bindUI:noop, create:function() {
    var self = this;
    if(!self.get("created")) {
      self.fire("beforeCreateDom");
      self.createDom();
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
      ControlProcess.superclass.bindInternal.call(self);
      self.bindUI();
      self.__callPluginsMethod("pluginBindUI");
      self.fire("afterBindUI");
      self.fire("beforeSyncUI");
      ControlProcess.superclass.syncInternal.call(self);
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
  }}, {__hooks__:{createDom:__getHook("__createDom"), renderUI:__getHook("__renderUI"), bindUI:__getHook("__bindUI"), syncUI:__getHook("__syncUI")}, name:"ControlProcess", ATTRS:{rendered:{value:false}, created:{value:false}}});
  return ControlProcess
});
KISSY.add("component/control/render-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, buffer, payload, undefined) {
    var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("1.50" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
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
KISSY.add("component/control/render", ["base", "node", "xtemplate/runtime", "./render-xtpl", "component/manager", "ua"], function(S, require) {
  var Base = require("base");
  var __getHook = Base.prototype.__getHook;
  var noop = S.noop;
  var Node = require("node");
  var XTemplateRuntime = require("xtemplate/runtime");
  var RenderTpl = require("./render-xtpl");
  var Manager = require("component/manager");
  var ON_SET = "_onSet", trim = S.trim, $ = Node.all, UA = require("ua"), startTpl = RenderTpl, endTpl = "</div>", doc = S.Env.host.document, HTML_PARSER = "HTML_PARSER";
  function pxSetter(v) {
    if(typeof v === "number") {
      v += "px"
    }
    return v
  }
  function applyParser(srcNode, parser, control) {
    var self = this, p, v, ret;
    for(p in parser) {
      v = parser[p];
      if(typeof v === "function") {
        ret = v.call(self, srcNode);
        if(ret !== undefined) {
          control.setInternal(p, ret)
        }
      }else {
        if(typeof v === "string") {
          control.setInternal(p, srcNode.one(v))
        }else {
          if(S.isArray(v) && v[0]) {
            control.setInternal(p, srcNode.all(v[0]))
          }
        }
      }
    }
  }
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
  function onSetAttrChange(e) {
    var self = this, method;
    if(e.target === self.control) {
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      method.call(self, e.newVal, e)
    }
  }
  function getBaseCssClassesCmd(_, options) {
    return this.config.view.getBaseCssClasses(options && options.params && options.params[0])
  }
  function getBaseCssClassCmd() {
    return this.config.view.getBaseCssClass(arguments[1].params[0])
  }
  return Base.extend({bindInternal:noop, syncInternal:noop, isRender:true, create:function() {
    var self = this, srcNode = self.control.get("srcNode");
    if(srcNode) {
      self.decorateDom(srcNode)
    }else {
      self.createDom()
    }
  }, beforeCreateDom:function(renderData) {
    var self = this, control = self.control, width, height, visible, elAttrs = control.get("elAttrs"), cls = control.get("elCls"), disabled, attrs = control.getAttrs(), a, attr, elStyle = control.get("elStyle"), zIndex, elCls = control.get("elCls");
    for(a in attrs) {
      attr = attrs[a];
      if(attr.view) {
        renderData[a] = control.get(a)
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
    if(disabled = control.get("disabled")) {
      cls.push(self.getBaseCssClasses("disabled"));
      elAttrs["aria-disabled"] = "true"
    }
    if(control.get("highlighted")) {
      cls.push(self.getBaseCssClasses("hover"))
    }
    if(control.get("focusable")) {
      if(UA.ieMode < 9) {
        elAttrs.hideFocus = "true"
      }
      elAttrs.tabindex = disabled ? "-1" : "0"
    }
  }, createDom:function() {
    var self = this;
    self.beforeCreateDom(self.renderData = {}, self.childrenElSelectors = {}, self.renderCommands = {getBaseCssClasses:getBaseCssClassesCmd, getBaseCssClass:getBaseCssClassCmd});
    var control = self.control, html;
    html = self.renderTpl(startTpl) + self.renderTpl(self.get("contentTpl")) + endTpl;
    control.setInternal("el", self.$el = $(html));
    self.el = self.$el[0];
    self.fillChildrenElsBySelectors()
  }, decorateDom:function(srcNode) {
    var self = this, control = self.control;
    if(!srcNode.attr("id")) {
      srcNode.attr("id", control.get("id"))
    }
    applyParser.call(self, srcNode, self.constructor.HTML_PARSER, control);
    control.setInternal("el", self.$el = srcNode);
    self.el = srcNode[0]
  }, renderUI:function() {
    var self = this, control = self.control, el = self.$el;
    if(!control.get("srcNode")) {
      var render = control.get("render"), renderBefore = control.get("elBefore");
      if(renderBefore) {
        el.insertBefore(renderBefore, undefined)
      }else {
        if(render) {
          el.appendTo(render, undefined)
        }else {
          el.appendTo(doc.body, undefined)
        }
      }
    }
  }, bindUI:function() {
    var self = this;
    var control = self.control;
    var attrs = control.getAttrs();
    var attrName, attrCfg;
    for(attrName in attrs) {
      attrCfg = attrs[attrName];
      var ucName = S.ucfirst(attrName);
      var attrChangeFn = self[ON_SET + ucName];
      if(attrCfg.view && attrChangeFn) {
        control.on("after" + ucName + "Change", onSetAttrChange, self)
      }
    }
  }, syncUI:noop, destructor:function() {
    if(this.$el) {
      this.$el.remove()
    }
  }, $:function(selector) {
    return this.$el.all(selector)
  }, fillChildrenElsBySelectors:function(childrenElSelectors) {
    var self = this, el = self.$el, control = self.control, childName, selector;
    childrenElSelectors = childrenElSelectors || self.childrenElSelectors;
    for(childName in childrenElSelectors) {
      selector = childrenElSelectors[childName];
      if(typeof selector === "function") {
        control.setInternal(childName, selector(el))
      }else {
        control.setInternal(childName, self.$(S.substitute(selector, self.renderData)))
      }
      delete childrenElSelectors[childName]
    }
  }, renderTpl:function(tpl, renderData, renderCommands) {
    var self = this;
    renderData = renderData || self.renderData;
    renderCommands = renderCommands || self.renderCommands;
    var XTemplate = self.get("XTemplate");
    return(new XTemplate(tpl, {control:self.control, view:self, commands:renderCommands})).render(renderData)
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
    var control = self.control, constructor = control.constructor, xclass, re = [];
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
    var componentCssClasses = this.getComponentCssClasses(), i = 0, control = this.get("control"), cls = "", l = componentCssClasses.length, prefixCls = control.get("prefixCls");
    for(;i < l;i++) {
      cls += prefixExtra(prefixCls, componentCssClasses[i], extras)
    }
    return trim(cls)
  }, getBaseCssClass:function(extras) {
    return trim(prefixExtra(this.control.get("prefixCls"), this.getComponentCssClasses()[0], normalExtras(extras)))
  }, getKeyEventTarget:function() {
    return this.$el
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
  }, _onSetHighlighted:function(v) {
    var self = this, componentCls = self.getBaseCssClasses("hover"), el = self.$el;
    el[v ? "addClass" : "removeClass"](componentCls)
  }, _onSetDisabled:function(v) {
    var self = this, control = self.control, componentCls = self.getBaseCssClasses("disabled"), el = self.$el;
    el[v ? "addClass" : "removeClass"](componentCls).attr("aria-disabled", v);
    if(control.get("focusable")) {
      self.getKeyEventTarget().attr("tabindex", v ? -1 : 0)
    }
  }, _onSetActive:function(v) {
    var self = this, componentCls = self.getBaseCssClasses("active");
    self.$el[v ? "addClass" : "removeClass"](componentCls).attr("aria-pressed", !!v)
  }, _onSetFocused:function(v) {
    var self = this, el = self.$el, componentCls = self.getBaseCssClasses("focused");
    el[v ? "addClass" : "removeClass"](componentCls)
  }, _onSetZIndex:function(x) {
    this.$el.css("z-index", x)
  }}, {__hooks__:{createDom:__getHook("__createDom"), renderUI:__getHook("__renderUI"), bindUI:__getHook("__bindUI"), syncUI:__getHook("__syncUI"), decorateDom:__getHook("__decorateDom"), beforeCreateDom:__getHook("__beforeCreateDom")}, extend:function extend(extensions, px, sx) {
    var self = this, NewClass, parsers = {};
    NewClass = Base.extend.apply(self, arguments);
    NewClass[HTML_PARSER] = NewClass[HTML_PARSER] || {};
    if(S.isArray(extensions)) {
      S.each(extensions.concat(NewClass), function(ext) {
        if(ext) {
          S.each(ext.HTML_PARSER, function(v, name) {
            parsers[name] = v
          })
        }
      });
      NewClass[HTML_PARSER] = parsers
    }
    S.mix(NewClass[HTML_PARSER], self[HTML_PARSER], false);
    NewClass.extend = extend;
    return NewClass
  }, ATTRS:{control:{setter:function(v) {
    this.control = v
  }}, XTemplate:{value:XTemplateRuntime}, contentTpl:{value:function(scope, buffer) {
    return buffer.write(scope.get("content"))
  }}}, HTML_PARSER:{id:function(el) {
    var id = el[0].id;
    return id ? id : undefined
  }, content:function(el) {
    return el.html()
  }, disabled:function(el) {
    return el.hasClass(this.getBaseCssClass("disabled"))
  }}, name:"render"})
});
KISSY.add("component/control", ["node", "./control/process", "component/manager", "./control/render", "ua"], function(S, require) {
  var Node = require("node");
  var ControlProcess = require("./control/process");
  var Manager = require("component/manager");
  var Render = require("./control/render");
  var UA = require("ua");
  var ie = UA.ieMode, Feature = S.Feature, Gesture = Node.Gesture, isTouchGestureSupported = Feature.isTouchGestureSupported();
  var Control = ControlProcess.extend({isControl:true, createDom:function() {
    var self = this, Render = self.get("xrender"), view = self.get("view"), id = self.get("id"), el;
    if(view) {
      view.set("control", self)
    }else {
      self.set("view", this.view = view = new Render({control:self}))
    }
    view.create();
    el = view.getKeyEventTarget();
    if(!self.get("allowTextSelection")) {
      el.unselectable()
    }
    Manager.addComponent(id, self)
  }, renderUI:function() {
    this.view.renderUI();
    this.view.bindUI()
  }, bindUI:function() {
    var self = this, el = self.view.getKeyEventTarget();
    if(self.get("focusable")) {
      el.on("focus", self.handleFocus, self).on("blur", self.handleBlur, self).on("keydown", self.handleKeydown, self)
    }
    if(self.get("handleGestureEvents")) {
      el = self.$el;
      el.on("mouseenter", self.handleMouseEnter, self).on("mouseleave", self.handleMouseLeave, self).on("contextmenu", self.handleContextMenu, self);
      el.on(Gesture.start, self.handleMouseDown, self).on(Gesture.end, self.handleMouseUp, self).on(Gesture.tap, self.handleClick, self);
      if(Gesture.cancel) {
        el.on(Gesture.cancel, self.handleMouseUp, self)
      }
      if(ie < 9) {
        el.on("dblclick", self.handleDblClick, self)
      }
    }
  }, syncUI:function() {
    this.view.syncUI()
  }, destructor:function() {
    var self = this;
    Manager.removeComponent(self.get("id"));
    if(self.view) {
      self.view.destroy()
    }else {
      if(self.get("srcNode")) {
        self.get("srcNode").remove()
      }
    }
  }, createComponent:function(cfg, parent) {
    return Manager.createComponent(cfg, parent || this)
  }, _onSetFocused:function(v) {
    var target = this.view.getKeyEventTarget()[0];
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
  }, _onSetX:function(x) {
    this.$el.offset({left:x})
  }, _onSetY:function(y) {
    this.$el.offset({top:y})
  }, _onSetVisible:function(v) {
    this.fire(v ? "show" : "hide")
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
  }, handleDblClick:function(ev) {
    if(!this.get("disabled")) {
      this.handleDblClickInternal(ev)
    }
  }, handleDblClickInternal:function(ev) {
    this.handleClickInternal(ev)
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
  }}, {name:"control", ATTRS:{id:{view:1, valueFn:function() {
    return S.guid("ks-component")
  }}, content:{view:1, value:""}, width:{view:1}, height:{view:1}, elCls:{view:1, value:[], setter:function(v) {
    if(typeof v === "string") {
      v = v.split(/\s+/)
    }
    return v || []
  }}, elStyle:{view:1, value:{}}, elAttrs:{view:1, value:{}}, elBefore:{}, el:{setter:function(el) {
    this.$el = el;
    this.el = el[0]
  }}, x:{}, y:{}, xy:{setter:function(v) {
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
  }}, zIndex:{view:1}, render:{}, visible:{sync:0, value:true, view:1}, srcNode:{setter:function(v) {
    return Node.all(v)
  }}, handleGestureEvents:{value:true}, focusable:{value:true, view:1}, allowTextSelection:{value:false}, activeable:{value:true}, focused:{view:1}, active:{view:1, value:false}, highlighted:{view:1, value:false}, prefixCls:{view:1, value:S.config("component/prefixCls") || "ks-"}, prefixXClass:{}, parent:{setter:function(p, prev) {
    if(prev = this.get("parent")) {
      this.removeTarget(prev)
    }
    if(p) {
      this.addTarget(p)
    }
  }}, disabled:{view:1, value:false}, xrender:{value:Render}, view:{setter:function(v) {
    this.view = v
  }}}});
  function getDefaultRender() {
    var attrs, self = this;
    do {
      attrs = self.ATTRS;
      self = self.superclass
    }while(!attrs || !attrs.xrender);
    return attrs.xrender.value
  }
  Control.getDefaultRender = getDefaultRender;
  Control.extend = function extend(extensions, px, sx) {
    var args = S.makeArray(arguments), self = this, xclass, newClass, argsLen = args.length, last = args[argsLen - 1];
    if(last && (xclass = last.xclass)) {
      last.name = xclass
    }
    newClass = ControlProcess.extend.apply(self, args);
    if(xclass) {
      Manager.setConstructorByXClass(xclass, newClass)
    }
    newClass.extend = extend;
    newClass.getDefaultRender = getDefaultRender;
    return newClass
  };
  return Control
});

