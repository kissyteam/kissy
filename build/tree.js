/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:51
*/
/*
 Combined modules by KISSY Module Compiler: 

 tree/node-xtpl
 tree/node
 tree/tree-manager
 tree/control
 tree/check-node
 tree/check-tree
 tree
*/

KISSY.add("tree/node-xtpl", ["component/extension/content-xtpl"], function(S, require, exports, module) {
  var t = function(scope, buffer, payload, undefined) {
    var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("5.0.0" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write('<div class="');
    var option0 = {escape:1};
    var params1 = [];
    params1.push("row");
    option0.params = params1;
    var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
    if(commandRet2 && commandRet2.isBuffer) {
      buffer = commandRet2;
      commandRet2 = undefined
    }
    buffer.write(commandRet2, true);
    buffer.write("\n     ");
    var option3 = {escape:1};
    var params4 = [];
    var id5 = scope.resolve(["selected"]);
    params4.push(id5);
    option3.params = params4;
    option3.fn = function(scope, buffer) {
      buffer.write("\n        ");
      var option6 = {escape:1};
      var params7 = [];
      params7.push("selected");
      option6.params = params7;
      var commandRet8 = callCommandUtil(engine, scope, option6, buffer, "getBaseCssClasses", 3);
      if(commandRet8 && commandRet8.isBuffer) {
        buffer = commandRet8;
        commandRet8 = undefined
      }
      buffer.write(commandRet8, true);
      buffer.write("\n     ");
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option3, buffer, 2, payload);
    buffer.write('\n     ">\n    <div class="');
    var option9 = {escape:1};
    var params10 = [];
    params10.push("expand-icon");
    option9.params = params10;
    var commandRet11 = callCommandUtil(engine, scope, option9, buffer, "getBaseCssClasses", 6);
    if(commandRet11 && commandRet11.isBuffer) {
      buffer = commandRet11;
      commandRet11 = undefined
    }
    buffer.write(commandRet11, true);
    buffer.write('">\n    </div>\n    ');
    var option12 = {escape:1};
    var params13 = [];
    var id14 = scope.resolve(["checkable"]);
    params13.push(id14);
    option12.params = params13;
    option12.fn = function(scope, buffer) {
      buffer.write('\n    <div class="');
      var option15 = {escape:1};
      var params16 = [];
      var exp18 = "checked";
      var id17 = scope.resolve(["checkState"]);
      exp18 = "checked" + id17;
      params16.push(exp18);
      option15.params = params16;
      var commandRet19 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 9);
      if(commandRet19 && commandRet19.isBuffer) {
        buffer = commandRet19;
        commandRet19 = undefined
      }
      buffer.write(commandRet19, true);
      buffer.write(" ");
      var option20 = {escape:1};
      var params21 = [];
      params21.push("checked");
      option20.params = params21;
      var commandRet22 = callCommandUtil(engine, scope, option20, buffer, "getBaseCssClasses", 9);
      if(commandRet22 && commandRet22.isBuffer) {
        buffer = commandRet22;
        commandRet22 = undefined
      }
      buffer.write(commandRet22, true);
      buffer.write('"></div>\n    ');
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option12, buffer, 8, payload);
    buffer.write('\n    <div class="');
    var option23 = {escape:1};
    var params24 = [];
    params24.push("icon");
    option23.params = params24;
    var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 11);
    if(commandRet25 && commandRet25.isBuffer) {
      buffer = commandRet25;
      commandRet25 = undefined
    }
    buffer.write(commandRet25, true);
    buffer.write('">\n\n    </div>\n    ');
    var option26 = {};
    var params27 = [];
    params27.push("component/extension/content-xtpl");
    option26.params = params27;
    require("component/extension/content-xtpl");
    option26.params[0] = module.resolve(option26.params[0]);
    var commandRet28 = includeCommand.call(engine, scope, option26, buffer, 14, payload);
    if(commandRet28 && commandRet28.isBuffer) {
      buffer = commandRet28;
      commandRet28 = undefined
    }
    buffer.write(commandRet28, false);
    buffer.write('\n</div>\n<div class="');
    var option29 = {escape:1};
    var params30 = [];
    params30.push("children");
    option29.params = params30;
    var commandRet31 = callCommandUtil(engine, scope, option29, buffer, "getBaseCssClasses", 16);
    if(commandRet31 && commandRet31.isBuffer) {
      buffer = commandRet31;
      commandRet31 = undefined
    }
    buffer.write(commandRet31, true);
    buffer.write('"\n');
    var option32 = {escape:1};
    var params33 = [];
    var id34 = scope.resolve(["expanded"]);
    params33.push(!id34);
    option32.params = params33;
    option32.fn = function(scope, buffer) {
      buffer.write('\nstyle="display:none"\n');
      return buffer
    };
    buffer = ifCommand.call(engine, scope, option32, buffer, 17, payload);
    buffer.write("\n>\n</div>");
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("tree/node", ["node", "component/container", "./node-xtpl", "component/extension/content-box"], function(S, require) {
  var Node = require("node");
  var Container = require("component/container");
  var $ = Node.all, KeyCode = Node.KeyCode;
  var SELECTED_CLS = "selected", EXPAND_EL_CLS = "expand-icon", COMMON_EXPAND_EL_CLS = "expand-icon-{t}", EXPAND_ICON_EL_FILE_CLS = [COMMON_EXPAND_EL_CLS].join(" "), EXPAND_ICON_EL_FOLDER_EXPAND_CLS = [COMMON_EXPAND_EL_CLS + "minus"].join(" "), EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS = [COMMON_EXPAND_EL_CLS + "plus"].join(" "), ICON_EL_FILE_CLS = ["file-icon"].join(" "), ICON_EL_FOLDER_EXPAND_CLS = ["expanded-folder-icon"].join(" "), ICON_EL_FOLDER_COLLAPSE_CLS = ["collapsed-folder-icon"].join(" "), ROW_EL_CLS = 
  "row", CHILDREN_CLS = "children", CHILDREN_CLS_L = "lchildren";
  var TreeNodeTpl = require("./node-xtpl");
  var ContentBox = require("component/extension/content-box");
  return Container.extend([ContentBox], {beforeCreateDom:function(renderData) {
    S.mix(renderData.elAttrs, {role:"tree-node", "aria-labelledby":"ks-content" + renderData.id, "aria-expanded":renderData.expanded ? "true" : "false", "aria-selected":renderData.selected ? "true" : "false", "aria-level":renderData.depth, title:renderData.tooltip})
  }, bindUI:function() {
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
    e.stopPropagation();
    var self = this, target = $(e.target), expanded = self.get("expanded"), tree = self.get("tree");
    tree.focus();
    self.callSuper(e);
    if(target.equals(self.get("expandIconEl"))) {
      self.set("expanded", !expanded)
    }else {
      self.select();
      self.fire("click")
    }
    return true
  }, createChildren:function() {
    var self = this;
    self.renderChildren.apply(self, arguments);
    if(self === self.get("tree")) {
      updateSubTreeStatus(self, self, -1, 0)
    }
  }, refreshCss:function(isNodeSingleOrLast, isNodeLeaf) {
    var self = this, iconEl = self.get("iconEl"), iconElCss, expandElCss, expandIconEl = self.get("expandIconEl"), childrenEl = self.getChildrenContainerEl();
    if(isNodeLeaf) {
      iconElCss = ICON_EL_FILE_CLS;
      expandElCss = EXPAND_ICON_EL_FILE_CLS
    }else {
      var expanded = self.get("expanded");
      if(expanded) {
        iconElCss = ICON_EL_FOLDER_EXPAND_CLS;
        expandElCss = EXPAND_ICON_EL_FOLDER_EXPAND_CLS
      }else {
        iconElCss = ICON_EL_FOLDER_COLLAPSE_CLS;
        expandElCss = EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS
      }
    }
    iconEl[0].className = self.getBaseCssClasses(iconElCss);
    expandIconEl[0].className = self.getBaseCssClasses([EXPAND_EL_CLS, S.substitute(expandElCss, {t:isNodeSingleOrLast ? "l" : "t"})]);
    childrenEl[0].className = self.getBaseCssClasses(isNodeSingleOrLast ? CHILDREN_CLS_L : CHILDREN_CLS)
  }, _onSetDepth:function(v) {
    this.el.setAttribute("aria-level", v)
  }, getChildrenContainerEl:function() {
    return this.get("childrenEl")
  }, _onSetExpanded:function(v) {
    var self = this, childrenEl = self.getChildrenContainerEl();
    childrenEl[v ? "show" : "hide"]();
    self.el.setAttribute("aria-expanded", v);
    refreshCss(self);
    self.fire(v ? "expand" : "collapse")
  }, _onSetSelected:function(v, e) {
    var self = this, rowEl = self.get("rowEl");
    rowEl[v ? "addClass" : "removeClass"](self.getBaseCssClasses(SELECTED_CLS));
    self.el.setAttribute("aria-selected", v);
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
  }}, {ATTRS:{contentTpl:{value:TreeNodeTpl}, handleGestureEvents:{value:false}, isLeaf:{render:1, sync:0, parse:function(el) {
    var self = this;
    if(el.hasClass(self.getBaseCssClass("leaf"))) {
      return true
    }else {
      if(el.hasClass(self.getBaseCssClass("folder"))) {
        return false
      }
    }
    return undefined
  }}, rowEl:{selector:function() {
    return"." + this.getBaseCssClass(ROW_EL_CLS)
  }}, childrenEl:{selector:function() {
    return"." + this.getBaseCssClass(CHILDREN_CLS)
  }}, expandIconEl:{selector:function() {
    return"." + this.getBaseCssClass(EXPAND_EL_CLS)
  }}, iconEl:{selector:function() {
    return"." + this.getBaseCssClass("icon")
  }}, selected:{render:1, sync:0}, expanded:{sync:0, value:false, render:1, parse:function() {
    return this.get("childrenEl").css("display") !== "none"
  }}, tooltip:{render:1, sync:0}, tree:{getter:function() {
    var self = this, from = self;
    while(from && !from.isTree) {
      from = from.get("parent")
    }
    return from
  }}, depth:{render:1, sync:0}, focusable:{value:false}, defaultChildCfg:{value:{xclass:"tree-node"}}}, xclass:"tree-node"});
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
    self.refreshCss(isNodeSingleOrLast(self), isNodeLeaf(self))
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
KISSY.add("tree/tree-manager", ["component/extension/delegate-children", "event/gesture/tap"], function(S, require) {
  var DelegateChildrenExtension = require("component/extension/delegate-children");
  var TapGesture = require("event/gesture/tap");
  function TreeManager() {
  }
  TreeManager.ATTRS = {showRootNode:{value:true, render:1}, selectedItem:{}, focusable:{value:true}, handleGestureEvents:{value:true}};
  S.augment(TreeManager, DelegateChildrenExtension, {isTree:1, __bindUI:function() {
    var self = this, prefixCls = self.get("prefixCls"), delegateCls = prefixCls + "tree-node";
    self.$el.delegate(TapGesture.TAP, "." + delegateCls, self.handleChildrenEvents, self)
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
  var CHECK_CLS = "checked", ALL_STATES_CLS = "checked0 checked1 checked2";
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
    var checkCls = self.getBaseCssClasses(CHECK_CLS).split(/\s+/).join(s + " ") + s, checkIconEl = self.get("checkIconEl");
    checkIconEl.removeClass(self.getBaseCssClasses(ALL_STATES_CLS)).addClass(checkCls);
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
  }}, {ATTRS:{checkIconEl:{selector:function() {
    return"." + this.getBaseCssClass(CHECK_CLS)
  }}, checkable:{value:true, render:1, sync:0}, checkState:{value:0, sync:0, render:1, parse:function() {
    var checkIconEl = this.get("checkIconEl");
    if(checkIconEl) {
      var allStates = ALL_STATES_CLS.split(/\s+/);
      for(var i = 0;i < allStates.length;i++) {
        if(checkIconEl.hasClass(this.getBaseCssClass(allStates[i]))) {
          return i
        }
      }
    }
    return undefined
  }}, defaultChildCfg:{value:{xclass:"check-tree-node"}}}, xclass:"check-tree-node"});
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

