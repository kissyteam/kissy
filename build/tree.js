/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: Aug 20 18:40
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 tree/node-xtpl
 tree/node-render
 tree/node
 tree/tree-manager
 tree/control
 tree/check-node
 tree/check-tree
 tree
*/

KISSY.add("tree/node-xtpl", ["component/extension/content-xtpl"], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += '<div id="ks-tree-node-row-';
    var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
    buffer += renderOutputUtil(id0, true);
    buffer += '"\n     class="';
    var config2 = {};
    var params3 = [];
    params3.push("row");
    config2.params = params3;
    var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
    buffer += renderOutputUtil(id1, true);
    buffer += "\n     ";
    var config4 = {};
    var params5 = [];
    var id6 = getPropertyUtil(engine, scope, "selected", 0, 3);
    params5.push(id6);
    config4.params = params5;
    config4.fn = function(scope) {
      var buffer = "";
      buffer += "\n        ";
      var config8 = {};
      var params9 = [];
      params9.push("selected");
      config8.params = params9;
      var id7 = runInlineCommandUtil(engine, scope, config8, "getBaseCssClasses", 4);
      buffer += renderOutputUtil(id7, true);
      buffer += "\n     ";
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config4, "if", 3);
    buffer += '\n     ">\n    <div id="ks-tree-node-expand-icon-';
    var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 7);
    buffer += renderOutputUtil(id10, true);
    buffer += '"\n         class="';
    var config12 = {};
    var params13 = [];
    params13.push("expand-icon");
    config12.params = params13;
    var id11 = runInlineCommandUtil(engine, scope, config12, "getBaseCssClasses", 8);
    buffer += renderOutputUtil(id11, true);
    buffer += '">\n    </div>\n    ';
    var config14 = {};
    var params15 = [];
    var id16 = getPropertyUtil(engine, scope, "checkable", 0, 10);
    params15.push(id16);
    config14.params = params15;
    config14.fn = function(scope) {
      var buffer = "";
      buffer += '\n    <div id="ks-tree-node-checked-';
      var id17 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 11);
      buffer += renderOutputUtil(id17, true);
      buffer += '"\n         class="';
      var config19 = {};
      var params20 = [];
      var id21 = getPropertyUtil(engine, scope, "checkState", 0, 12);
      params20.push("checked" + id21);
      config19.params = params20;
      var id18 = runInlineCommandUtil(engine, scope, config19, "getBaseCssClasses", 12);
      buffer += renderOutputUtil(id18, true);
      buffer += '"></div>\n    ';
      return buffer
    };
    buffer += runBlockCommandUtil(engine, scope, config14, "if", 10);
    buffer += '\n    <div id="ks-tree-node-icon-';
    var id22 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 14);
    buffer += renderOutputUtil(id22, true);
    buffer += '"\n         class="';
    var config24 = {};
    var params25 = [];
    params25.push("icon");
    config24.params = params25;
    var id23 = runInlineCommandUtil(engine, scope, config24, "getBaseCssClasses", 15);
    buffer += renderOutputUtil(id23, true);
    buffer += '">\n\n    </div>\n    ';
    var config27 = {};
    var params28 = [];
    params28.push("component/extension/content-xtpl");
    config27.params = params28;
    if(moduleWrap) {
      require("component/extension/content-xtpl");
      config27.params[0] = moduleWrap.resolveByName(config27.params[0])
    }
    var id26 = runInlineCommandUtil(engine, scope, config27, "include", 18);
    buffer += renderOutputUtil(id26, false);
    buffer += '\n</div>\n<div id="ks-tree-node-children-';
    var id29 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 20);
    buffer += renderOutputUtil(id29, true);
    buffer += '"\n     class="';
    var config31 = {};
    var params32 = [];
    params32.push("children");
    config31.params = params32;
    var id30 = runInlineCommandUtil(engine, scope, config31, "getBaseCssClasses", 21);
    buffer += renderOutputUtil(id30, true);
    buffer += '"\n';
    var config33 = {};
    var params34 = [];
    var id35 = getPropertyUtil(engine, scope, "expanded", 0, 22);
    params34.push(id35);
    config33.params = params34;
    config33.fn = function(scope) {
      var buffer = "";
      buffer += '\nstyle="display:none"\n';
      return buffer
    };
    var inverse36 = config33.fn;
    config33.fn = config33.inverse;
    config33.inverse = inverse36;
    buffer += runBlockCommandUtil(engine, scope, config33, "if", 22);
    buffer += "\n>\n</div>";
    return buffer
  }
});
KISSY.add("tree/node-render", ["component/container", "./node-xtpl", "component/extension/content-render"], function(S, require) {
  var Container = require("component/container");
  var TreeNodeTpl = require("./node-xtpl");
  var ContentRenderExtension = require("component/extension/content-render");
  var SELECTED_CLS = "selected", COMMON_EXPAND_EL_CLS = "expand-icon-{t}", EXPAND_ICON_EL_FILE_CLS = [COMMON_EXPAND_EL_CLS].join(" "), EXPAND_ICON_EL_FOLDER_EXPAND_CLS = [COMMON_EXPAND_EL_CLS + "minus"].join(" "), EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS = [COMMON_EXPAND_EL_CLS + "plus"].join(" "), ICON_EL_FILE_CLS = ["file-icon"].join(" "), ICON_EL_FOLDER_EXPAND_CLS = ["expanded-folder-icon"].join(" "), ICON_EL_FOLDER_COLLAPSE_CLS = ["collapsed-folder-icon"].join(" "), ROW_EL_CLS = "row", CHILDREN_CLS = 
  "children", CHILDREN_CLS_L = "lchildren", CHECK_CLS = "checked", ALL_STATES_CLS = "checked0 checked1 checked2";
  return Container.getDefaultRender().extend([ContentRenderExtension], {beforeCreateDom:function(renderData, childrenElSelectors) {
    S.mix(renderData.elAttrs, {role:"tree-node", "aria-labelledby":"ks-content" + renderData.id, "aria-expanded":renderData.expanded ? "true" : "false", "aria-selected":renderData.selected ? "true" : "false", "aria-level":renderData.depth, title:renderData.tooltip});
    S.mix(childrenElSelectors, {expandIconEl:"#ks-tree-node-expand-icon-{id}", rowEl:"#ks-tree-node-row-{id}", iconEl:"#ks-tree-node-icon-{id}", childrenEl:"#ks-tree-node-children-{id}", checkIconEl:"#ks-tree-node-checked-{id}"})
  }, refreshCss:function(isNodeSingleOrLast, isNodeLeaf) {
    var self = this, control = self.control, iconEl = control.get("iconEl"), iconElCss, expandElCss, expandIconEl = control.get("expandIconEl"), childrenEl = control.get("childrenEl");
    if(isNodeLeaf) {
      iconElCss = ICON_EL_FILE_CLS;
      expandElCss = EXPAND_ICON_EL_FILE_CLS
    }else {
      var expanded = control.get("expanded");
      if(expanded) {
        iconElCss = ICON_EL_FOLDER_EXPAND_CLS;
        expandElCss = EXPAND_ICON_EL_FOLDER_EXPAND_CLS
      }else {
        iconElCss = ICON_EL_FOLDER_COLLAPSE_CLS;
        expandElCss = EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS
      }
    }
    iconEl[0].className = self.getBaseCssClasses(iconElCss);
    expandIconEl[0].className = self.getBaseCssClasses(S.substitute(expandElCss, {t:isNodeSingleOrLast ? "l" : "t"}));
    childrenEl[0].className = self.getBaseCssClasses(isNodeSingleOrLast ? CHILDREN_CLS_L : CHILDREN_CLS)
  }, _onSetExpanded:function(v) {
    var self = this, childrenEl = self.control.get("childrenEl");
    childrenEl[v ? "show" : "hide"]();
    self.el.setAttribute("aria-expanded", v)
  }, _onSetSelected:function(v) {
    var self = this, rowEl = self.control.get("rowEl");
    rowEl[v ? "addClass" : "removeClass"](self.getBaseCssClasses(SELECTED_CLS));
    self.el.setAttribute("aria-selected", v)
  }, _onSetDepth:function(v) {
    this.el.setAttribute("aria-level", v)
  }, _onSetCheckState:function(s) {
    var self = this, checkCls = self.getBaseCssClasses(CHECK_CLS).split(/\s+/).join(s + " ") + s, checkIconEl = self.control.get("checkIconEl");
    checkIconEl.removeClass(self.getBaseCssClasses(ALL_STATES_CLS)).addClass(checkCls)
  }, getChildrenContainerEl:function() {
    return this.control.get("childrenEl")
  }}, {ATTRS:{contentTpl:{value:TreeNodeTpl}}, HTML_PARSER:{rowEl:function(el) {
    return el.one("." + this.getBaseCssClass(ROW_EL_CLS))
  }, childrenEl:function(el) {
    return el.one("." + this.getBaseCssClass(CHILDREN_CLS))
  }, isLeaf:function(el) {
    var self = this;
    if(el.hasClass(self.getBaseCssClass("leaf"))) {
      return true
    }else {
      if(el.hasClass(self.getBaseCssClass("folder"))) {
        return false
      }
    }
    return undefined
  }, expanded:function(el) {
    return el.one("." + this.getBaseCssClass(CHILDREN_CLS)).css("display") !== "none"
  }, expandIconEl:function(el) {
    return el.one("." + this.getBaseCssClass("expand-icon"))
  }, checkState:function(el) {
    var checkIconEl = el.one("." + this.getBaseCssClass(CHECK_CLS));
    if(checkIconEl) {
      var allStates = ALL_STATES_CLS.split(/\s+/);
      for(var i = 0;i < allStates.length;i++) {
        if(checkIconEl.hasClass(this.getBaseCssClass(allStates[i]))) {
          return i
        }
      }
    }
    return 0
  }, iconEl:function(el) {
    return el.one("." + this.getBaseCssClass("icon"))
  }, checkIconEl:function(el) {
    return el.one("." + this.getBaseCssClass(CHECK_CLS))
  }}})
});
KISSY.add("tree/node", ["node", "component/container", "./node-render"], function(S, require) {
  var Node = require("node");
  var Container = require("component/container");
  var TreeNodeRender = require("./node-render");
  var $ = Node.all, KeyCode = Node.KeyCode;
  return Container.extend({bindUI:function() {
    this.on("afterAddChild", onAddChild);
    this.on("afterRemoveChild", onRemoveChild);
    this.on("afterAddChild afterRemoveChild", syncAriaSetSize)
  }, syncUI:function() {
    refreshCss(this);
    syncAriaSetSize.call(this, {target:this})
  }, handleKeyDownInternal:function(e) {
    var self = this, processed = true, tree = self.get("tree"), expanded = self.get("expanded"), nodeToBeSelected, isLeaf = self.get("isLeaf"), children = self.get("children"), keyCode = e.keyCode;
    switch(keyCode) {
      case KeyCode.ENTER:
        return self.handleClickInternal(e);
      case KeyCode.HOME:
        nodeToBeSelected = tree;
        break;
      case KeyCode.END:
        nodeToBeSelected = getLastVisibleDescendant(tree);
        break;
      case KeyCode.UP:
        nodeToBeSelected = getPreviousVisibleNode(self);
        break;
      case KeyCode.DOWN:
        nodeToBeSelected = getNextVisibleNode(self);
        break;
      case KeyCode.LEFT:
        if(expanded && (children.length || isLeaf === false)) {
          self.set("expanded", false)
        }else {
          nodeToBeSelected = self.get("parent")
        }
        break;
      case KeyCode.RIGHT:
        if(children.length || isLeaf === false) {
          if(!expanded) {
            self.set("expanded", true)
          }else {
            nodeToBeSelected = children[0]
          }
        }
        break;
      default:
        processed = false;
        break
    }
    if(nodeToBeSelected) {
      nodeToBeSelected.select()
    }
    return processed
  }, next:function() {
    var self = this, parent = self.get("parent"), siblings, index;
    if(!parent) {
      return null
    }
    siblings = parent.get("children");
    index = S.indexOf(self, siblings);
    if(index === siblings.length - 1) {
      return null
    }
    return siblings[index + 1]
  }, prev:function() {
    var self = this, parent = self.get("parent"), siblings, index;
    if(!parent) {
      return null
    }
    siblings = parent.get("children");
    index = S.indexOf(self, siblings);
    if(index === 0) {
      return null
    }
    return siblings[index - 1]
  }, select:function() {
    this.set("selected", true)
  }, handleClickInternal:function(e) {
    var self = this, target = $(e.target), expanded = self.get("expanded"), tree = self.get("tree");
    tree.focus();
    self.callSuper(e);
    if(target.equals(self.get("expandIconEl"))) {
      self.set("expanded", !expanded)
    }else {
      self.select();
      self.fire("click", {domEvent:e})
    }
    return true
  }, createChildren:function() {
    var self = this;
    self.renderChildren.apply(self, arguments);
    if(self === self.get("tree")) {
      updateSubTreeStatus(self, self, -1, 0)
    }
  }, _onSetExpanded:function(v) {
    var self = this;
    refreshCss(self);
    self.fire(v ? "expand" : "collapse")
  }, _onSetSelected:function(v, e) {
    var tree = this.get("tree");
    if(!(e && e.byPassSetTreeSelectedItem)) {
      tree.set("selectedItem", v ? this : null)
    }
  }, expandAll:function() {
    var self = this;
    self.set("expanded", true);
    S.each(self.get("children"), function(c) {
      c.expandAll()
    })
  }, collapseAll:function() {
    var self = this;
    self.set("expanded", false);
    S.each(self.get("children"), function(c) {
      c.collapseAll()
    })
  }}, {ATTRS:{xrender:{value:TreeNodeRender}, checkable:{value:false, view:1}, handleMouseEvents:{value:false}, isLeaf:{view:1}, expandIconEl:{}, iconEl:{}, selected:{view:1}, expanded:{sync:0, value:false, view:1}, tooltip:{view:1}, tree:{getter:function() {
    var from = this;
    while(from && !from.isTree) {
      from = from.get("parent")
    }
    return from
  }}, depth:{view:1}, focusable:{value:false}, defaultChildCfg:{value:{xclass:"tree-node"}}}, xclass:"tree-node"});
  function onAddChild(e) {
    var self = this;
    if(e.target === self) {
      updateSubTreeStatus(self, e.component, self.get("depth"), e.index)
    }
  }
  function onRemoveChild(e) {
    var self = this;
    if(e.target === self) {
      recursiveSetDepth(self.get("tree"), e.component);
      refreshCssForSelfAndChildren(self, e.index)
    }
  }
  function syncAriaSetSize(e) {
    var self = this;
    if(e.target === self) {
      self.el.setAttribute("aria-setsize", self.get("children").length)
    }
  }
  function isNodeSingleOrLast(self) {
    var parent = self.get("parent"), children = parent && parent.get("children"), lastChild = children && children[children.length - 1];
    return!lastChild || lastChild === self
  }
  function isNodeLeaf(self) {
    var isLeaf = self.get("isLeaf");
    return!(isLeaf === false || isLeaf === undefined && self.get("children").length)
  }
  function getLastVisibleDescendant(self) {
    var children = self.get("children");
    if(!self.get("expanded") || !children.length) {
      return self
    }
    return getLastVisibleDescendant(children[children.length - 1])
  }
  function getPreviousVisibleNode(self) {
    var prev = self.prev();
    if(!prev) {
      prev = self.get("parent")
    }else {
      prev = getLastVisibleDescendant(prev)
    }
    return prev
  }
  function getNextVisibleNode(self) {
    var children = self.get("children"), n, parent;
    if(self.get("expanded") && children.length) {
      return children[0]
    }
    n = self.next();
    parent = self;
    while(!n && (parent = parent.get("parent"))) {
      n = parent.next()
    }
    return n
  }
  function refreshCss(self) {
    if(self.get && self.view) {
      self.view.refreshCss(isNodeSingleOrLast(self), isNodeLeaf(self))
    }
  }
  function updateSubTreeStatus(self, c, depth, index) {
    var tree = self.get("tree");
    if(tree) {
      recursiveSetDepth(tree, c, depth + 1);
      refreshCssForSelfAndChildren(self, index)
    }
  }
  function recursiveSetDepth(tree, c, setDepth) {
    if(setDepth !== undefined) {
      c.set("depth", setDepth)
    }
    S.each(c.get("children"), function(child) {
      if(typeof setDepth === "number") {
        recursiveSetDepth(tree, child, setDepth + 1)
      }else {
        recursiveSetDepth(tree, child)
      }
    })
  }
  function refreshCssForSelfAndChildren(self, index) {
    refreshCss(self);
    index = Math.max(0, index - 1);
    var children = self.get("children"), c, len = children.length;
    for(;index < len;index++) {
      c = children[index];
      refreshCss(c);
      c.el.setAttribute("aria-posinset", index + 1)
    }
  }
});
KISSY.add("tree/tree-manager", ["node", "component/extension/delegate-children"], function(S, require) {
  var Node = require("node");
  var DelegateChildrenExtension = require("component/extension/delegate-children");
  var UA = S.UA, ie = UA.ieMode, Features = S.Features, Gesture = Node.Gesture, isTouchEventSupported = Features.isTouchEventSupported();
  function TreeManager() {
  }
  TreeManager.ATTRS = {showRootNode:{value:true, view:1}, selectedItem:{}, focusable:{value:true}, handleMouseEvents:{value:true}};
  S.augment(TreeManager, DelegateChildrenExtension, {isTree:1, __bindUI:function() {
    var self = this, prefixCls = self.get("prefixCls"), delegateCls = prefixCls + "tree-node", events = Gesture.tap;
    if(!isTouchEventSupported) {
      events += ie && ie < 9 ? " dblclick " : ""
    }
    self.$el.delegate(events, "." + delegateCls, self.handleChildrenEvents, self)
  }, _onSetSelectedItem:function(n, ev) {
    if(n && ev.prevVal) {
      ev.prevVal.set("selected", false, {data:{byPassSetTreeSelectedItem:1}})
    }
  }, _onSetShowRootNode:function(v) {
    this.get("rowEl")[v ? "show" : "hide"]()
  }});
  return TreeManager
});
KISSY.add("tree/control", ["./node", "./tree-manager"], function(S, require) {
  var TreeNode = require("./node");
  var TreeManager = require("./tree-manager");
  return TreeNode.extend([TreeManager], {handleKeyDownInternal:function(e) {
    var current = this.get("selectedItem");
    if(current === this) {
      return this.callSuper(e)
    }
    return current && current.handleKeyDownInternal(e)
  }, _onSetFocused:function(v) {
    var self = this;
    self.callSuper(v);
    if(v && !self.get("selectedItem")) {
      self.select()
    }
  }}, {ATTRS:{defaultChildCfg:{value:{xclass:"tree-node"}}}, xclass:"tree"})
});
KISSY.add("tree/check-node", ["node", "./node"], function(S, require) {
  var Node = require("node");
  var TreeNode = require("./node");
  var $ = Node.all, PARTIAL_CHECK = 2, CHECK = 1, EMPTY = 0;
  var CheckNode = TreeNode.extend({handleClickInternal:function(e) {
    var self = this, checkState, expanded = self.get("expanded"), expandIconEl = self.get("expandIconEl"), tree = self.get("tree"), target = $(e.target);
    tree.focus();
    self.callSuper(e);
    if(target.equals(expandIconEl)) {
      self.set("expanded", !expanded);
      return
    }
    checkState = self.get("checkState");
    if(checkState === CHECK) {
      checkState = EMPTY
    }else {
      checkState = CHECK
    }
    self.set("checkState", checkState);
    return true
  }, _onSetCheckState:function(s) {
    var self = this, parent = self.get("parent"), checkCount, i, c, cState, cs;
    if(s === CHECK || s === EMPTY) {
      S.each(self.get("children"), function(c) {
        c.set("checkState", s)
      })
    }
    if(parent) {
      checkCount = 0;
      cs = parent.get("children");
      for(i = 0;i < cs.length;i++) {
        c = cs[i];
        cState = c.get("checkState");
        if(cState === PARTIAL_CHECK) {
          parent.set("checkState", PARTIAL_CHECK);
          return
        }else {
          if(cState === CHECK) {
            checkCount++
          }
        }
      }
      if(checkCount === 0) {
        parent.set("checkState", EMPTY)
      }else {
        if(checkCount === cs.length) {
          parent.set("checkState", CHECK)
        }else {
          parent.set("checkState", PARTIAL_CHECK)
        }
      }
    }
  }}, {ATTRS:{checkIconEl:{}, checkable:{value:true, view:1}, checkState:{value:0, sync:0, view:1}, defaultChildCfg:{value:{xclass:"check-tree-node"}}}, xclass:"check-tree-node"});
  CheckNode.CheckState = {PARTIAL_CHECK:PARTIAL_CHECK, CHECK:CHECK, EMPTY:EMPTY};
  return CheckNode
});
KISSY.add("tree/check-tree", ["./check-node", "./tree-manager"], function(S, require) {
  var CheckNode = require("./check-node");
  var TreeManager = require("./tree-manager");
  return CheckNode.extend([TreeManager], {handleKeyDownInternal:function(e) {
    var current = this.get("selectedItem");
    if(current === this) {
      return this.callSuper(e)
    }
    return current && current.handleKeyDownInternal(e)
  }, _onSetFocused:function(v, e) {
    var self = this;
    self.callSuper(v, e);
    if(v && !self.get("selectedItem")) {
      self.select()
    }
  }}, {ATTRS:{defaultChildCfg:{value:{xclass:"check-tree-node"}}}, xclass:"check-tree"})
});
KISSY.add("tree", ["tree/control", "tree/node", "tree/check-node", "tree/check-tree"], function(S, require) {
  var Tree = require("tree/control");
  var TreeNode = require("tree/node");
  var CheckNode = require("tree/check-node");
  var CheckTree = require("tree/check-tree");
  Tree.Node = TreeNode;
  Tree.CheckNode = CheckNode;
  Tree.CheckTree = CheckTree;
  return Tree
});

