/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:31
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 tabs/bar-render
 tabs/bar
 tabs/body
 tabs/tab-render
 tabs/tab
 tabs/panel-render
 tabs/panel
 tabs/render
 tabs
*/

KISSY.add("tabs/bar-render", ["toolbar"], function(S, require) {
  var Toolbar = require("toolbar");
  return Toolbar.getDefaultRender().extend({beforeCreateDom:function(renderData) {
    renderData.elAttrs.role = "tablist"
  }}, {name:"TabsBarRender"})
});
KISSY.add("tabs/bar", ["toolbar", "./bar-render"], function(S, require) {
  var Toolbar = require("toolbar");
  var BarRender = require("./bar-render");
  var TabBar = Toolbar.extend({bindUI:function() {
    var self = this;
    self.on("afterSelectedChange", function(e) {
      if(e.newVal && e.target.isTabsTab) {
        self.set("selectedTab", e.target)
      }
    })
  }, syncUI:function() {
    var bar = this, children = bar.get("children");
    S.each(children, function(c) {
      if(c.get("selected")) {
        bar.setInternal("selectedTab", c);
        return false
      }
      return undefined
    })
  }, handleKeyDownInternal:function(e) {
    var self = this;
    var current = self.get("selectedTab");
    var next = self.getNextItemByKeyDown(e, current);
    if(typeof next === "boolean") {
      return next
    }else {
      next.set("selected", true);
      return true
    }
  }, _onSetSelectedTab:function(v, e) {
    var prev;
    if(v) {
      if(e && (prev = e.prevVal)) {
        prev.set("selected", false)
      }
      v.set("selected", true)
    }
  }, _onSetHighlightedItem:function(v, e) {
    var self = this;
    self.callSuper(v, e);
    if(self.get("changeType") === "mouse") {
      self._onSetSelectedTab.apply(self, arguments)
    }
  }}, {ATTRS:{selectedTab:{}, changeType:{value:"click"}, defaultChildCfg:{value:{xclass:"tabs-tab"}}, xrender:{value:BarRender}}, xclass:"tabs-bar"});
  TabBar.ChangeType = {CLICK:"click", MOUSE:"mouse"};
  return TabBar
});
KISSY.add("tabs/body", ["component/container"], function(S, require) {
  var Container = require("component/container");
  var TabBody = Container.extend({bindUI:function() {
    var self = this;
    self.on("afterSelectedPanelIndexChange", function(e) {
      var children = self.get("children"), newIndex = e.newVal, hidePanel;
      if(children[newIndex]) {
        if(hidePanel = children[e.prevVal]) {
          hidePanel.set("selected", false)
        }
        self.selectPanelByIndex(newIndex)
      }
    })
  }, syncUI:function() {
    var self = this, children = self.get("children");
    S.each(children, function(c, i) {
      if(c.get("selected")) {
        self.set("selectedPanelIndex", i);
        return false
      }
      return undefined
    })
  }, createChild:function(index) {
    return checkLazy(this, "createChild", index)
  }, renderChild:function(index) {
    return checkLazy(this, "renderChild", index)
  }, selectPanelByIndex:function(newIndex) {
    this.get("children")[newIndex].set("selected", true);
    if(this.get("lazyRender")) {
      this.renderChild(newIndex)
    }
  }}, {ATTRS:{selectedPanelIndex:{}, allowTextSelection:{value:true}, focusable:{value:false}, lazyRender:{}, handleMouseEvents:{value:false}, defaultChildCfg:{value:{xclass:"tabs-panel"}}}, xclass:"tabs-body"});
  function checkLazy(self, method, index) {
    if(self.get("lazyRender")) {
      var c = self.get("children")[index];
      if(!c.get("selected")) {
        return c
      }
    }
    return TabBody.superclass[method].call(self, index)
  }
  return TabBody
});
KISSY.add("tabs/tab-render", ["button"], function(S, require) {
  var Button = require("button");
  return Button.getDefaultRender().extend({beforeCreateDom:function(renderData) {
    var attrs = renderData.elAttrs;
    attrs.role = "tab";
    if(renderData.selected) {
      attrs["aria-selected"] = true;
      renderData.elCls.push(this.getBaseCssClasses("selected"))
    }
  }, _onSetSelected:function(v) {
    var el = this.$el;
    var selectedCls = this.getBaseCssClasses("selected");
    el[v ? "addClass" : "removeClass"](selectedCls).attr("aria-selected", !!v)
  }}, {name:"TabsTabRender", HTML_PARSER:{selected:function(el) {
    return el.hasClass(this.getBaseCssClass("selected"))
  }}})
});
KISSY.add("tabs/tab", ["button", "./tab-render"], function(S, require) {
  var Button = require("button");
  var TabRender = require("./tab-render");
  return Button.extend({isTabsTab:true, bindUI:function() {
    this.on("click", function() {
      this.set("selected", true)
    })
  }}, {ATTRS:{handleMouseEvents:{value:false}, focusable:{value:false}, selected:{view:1}, xrender:{value:TabRender}}, xclass:"tabs-tab"})
});
KISSY.add("tabs/panel-render", ["component/container"], function(S, require) {
  var Container = require("component/container");
  return Container.getDefaultRender().extend({beforeCreateDom:function(renderData) {
    var self = this;
    renderData.elAttrs.role = "tabpanel";
    if(renderData.selected) {
      renderData.elCls.push(self.getBaseCssClasses("selected"))
    }else {
      renderData.elAttrs["aria-hidden"] = false
    }
  }, _onSetSelected:function(v) {
    var el = this.$el;
    var selectedCls = this.getBaseCssClasses("selected");
    el[v ? "addClass" : "removeClass"](selectedCls).attr("aria-hidden", !v)
  }}, {name:"TabsPanelRender", HTML_PARSER:{selected:function(el) {
    return el.hasClass(this.getBaseCssClass("selected"))
  }}})
});
KISSY.add("tabs/panel", ["component/container", "./panel-render"], function(S, require) {
  var Container = require("component/container");
  var PanelRender = require("./panel-render");
  return Container.extend({isTabsPanel:1}, {ATTRS:{selected:{view:1}, focusable:{value:false}, allowTextSelection:{value:true}, xrender:{value:PanelRender}}, xclass:"tabs-panel"})
});
KISSY.add("tabs/render", ["component/container"], function(S, require) {
  var Container = require("component/container");
  var CLS = "top bottom left right";
  return Container.getDefaultRender().extend({beforeCreateDom:function(renderData) {
    renderData.elCls.push(this.getBaseCssClass(this.control.get("barOrientation")))
  }, decorateDom:function() {
    var control = this.control;
    control.get("bar").set("changeType", control.get("changeType"))
  }, _onSetBarOrientation:function(v) {
    var self = this, el = self.$el;
    el.removeClass(self.getBaseCssClass(CLS)).addClass(self.getBaseCssClass(v))
  }}, {name:"TabsRender", HTML_PARSER:{barOrientation:function(el) {
    var orientation = el[0].className.match(/(top|bottom|left|right)\b/);
    return orientation && orientation[1] || "top"
  }}})
});
KISSY.add("tabs", ["component/container", "tabs/bar", "tabs/body", "tabs/tab", "tabs/panel", "tabs/render"], function(S, require) {
  var Container = require("component/container");
  var Bar = require("tabs/bar");
  var Body = require("tabs/body");
  require("tabs/tab");
  var Panel = require("tabs/panel");
  var Render = require("tabs/render");
  function setBar(children, barOrientation, bar) {
    children[BarIndexMap[barOrientation]] = bar
  }
  function setBody(children, barOrientation, body) {
    children[1 - BarIndexMap[barOrientation]] = body
  }
  var Tabs = Container.extend({initializer:function() {
    var self = this, items = self.get("items");
    if(items) {
      var children = self.get("children"), barOrientation = self.get("barOrientation"), selected, prefixCls = self.get("prefixCls"), tabItem, panelItem, bar = {prefixCls:prefixCls, xclass:"tabs-bar", changeType:self.get("changeType"), children:[]}, body = {prefixCls:prefixCls, xclass:"tabs-body", lazyRender:self.get("lazyRender"), children:[]}, barChildren = bar.children, panels = body.children;
      S.each(items, function(item) {
        selected = selected || item.selected;
        barChildren.push(tabItem = {content:item.title, selected:item.selected});
        panels.push(panelItem = {content:item.content, selected:item.selected})
      });
      if(!selected && barChildren.length) {
        barChildren[0].selected = true;
        panels[0].selected = true
      }
      setBar(children, barOrientation, bar);
      setBody(children, barOrientation, body)
    }
  }, addItem:function(item, index) {
    var self = this, bar = self.get("bar"), selectedTab, tabItem, panelItem, barChildren = bar.get("children"), body = self.get("body");
    if(typeof index === "undefined") {
      index = barChildren.length
    }
    tabItem = {content:item.title};
    panelItem = {content:item.content};
    bar.addChild(tabItem, index);
    selectedTab = barChildren[index];
    body.addChild(panelItem, index);
    if(item.selected) {
      bar.set("selectedTab", selectedTab);
      body.set("selectedPanelIndex", index)
    }
    return self
  }, removeItemAt:function(index, destroy) {
    var tabs = this, bar = tabs.get("bar"), barCs = bar.get("children"), tab = bar.getChildAt(index), body = tabs.get("body");
    if(tab.get("selected")) {
      if(barCs.length === 1) {
        bar.set("selectedTab", null)
      }else {
        if(index === 0) {
          bar.set("selectedTab", bar.getChildAt(index + 1))
        }else {
          bar.set("selectedTab", bar.getChildAt(index - 1))
        }
      }
    }
    bar.removeChild(bar.getChildAt(index), destroy);
    body.removeChild(body.getChildAt(index), destroy);
    return tabs
  }, removeItemByTab:function(tab, destroy) {
    var index = S.indexOf(tab, this.get("bar").get("children"));
    return this.removeItemAt(index, destroy)
  }, removeItemByPanel:function(panel, destroy) {
    var index = S.indexOf(panel, this.get("body").get("children"));
    return this.removeItemAt(index, destroy)
  }, getSelectedTab:function() {
    var tabs = this, bar = tabs.get("bar"), child = null;
    S.each(bar.get("children"), function(c) {
      if(c.get("selected")) {
        child = c;
        return false
      }
      return undefined
    });
    return child
  }, getSelectedPanel:function() {
    var tabs = this, body = tabs.get("body"), child = null;
    S.each(body.get("children"), function(c) {
      if(c.get("selected")) {
        child = c;
        return false
      }
      return undefined
    });
    return child
  }, getTabs:function() {
    return this.get("bar").get("children")
  }, getPanels:function() {
    return this.get("body").get("children")
  }, getTabAt:function(index) {
    return this.get("bar").get("children")[index]
  }, getPanelAt:function(index) {
    return this.get("body").get("children")[index]
  }, setSelectedTab:function(tab) {
    var tabs = this, bar = tabs.get("bar"), body = tabs.get("body");
    bar.set("selectedTab", tab);
    body.set("selectedPanelIndex", S.indexOf(tab, bar.get("children")));
    return this
  }, setSelectedPanel:function(panel) {
    var tabs = this, bar = tabs.get("bar"), body = tabs.get("body"), selectedPanelIndex = S.indexOf(panel, body.get("children"));
    body.set("selectedPanelIndex", selectedPanelIndex);
    bar.set("selectedTab", tabs.getTabAt(selectedPanelIndex));
    return this
  }, bindUI:function() {
    this.on("afterSelectedTabChange", function(e) {
      this.setSelectedTab(e.newVal)
    })
  }}, {ATTRS:{items:{}, changeType:{}, lazyRender:{value:false}, handleMouseEvents:{value:false}, allowTextSelection:{value:true}, focusable:{value:false}, bar:{getter:function() {
    return this.get("children")[BarIndexMap[this.get("barOrientation")]]
  }}, body:{getter:function() {
    return this.get("children")[1 - BarIndexMap[this.get("barOrientation")]]
  }}, barOrientation:{view:1, value:"top"}, xrender:{value:Render}}, xclass:"tabs"});
  Tabs.Orientation = {TOP:"top", BOTTOM:"bottom", LEFT:"left", RIGHT:"right"};
  var BarIndexMap = {top:0, left:0, bottom:1, right:0};
  Tabs.ChangeType = Bar.ChangeType;
  Tabs.Bar = Bar;
  Tabs.Body = Body;
  Tabs.Panel = Panel;
  return Tabs
});

