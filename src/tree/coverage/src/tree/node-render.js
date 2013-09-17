function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/tree/node-render.js']) {
  _$jscoverage['/tree/node-render.js'] = {};
  _$jscoverage['/tree/node-render.js'].lineData = [];
  _$jscoverage['/tree/node-render.js'].lineData[6] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[7] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[33] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[36] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[44] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[54] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[62] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[63] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[64] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[66] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[67] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[68] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[69] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[71] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[72] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[76] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[77] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[82] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[88] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[90] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[91] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[95] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[97] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[98] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[102] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[106] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[110] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[114] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[125] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[128] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[131] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[132] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[133] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[134] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[135] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[137] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[140] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[144] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[147] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[148] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[149] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[150] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[151] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[152] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[156] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[159] = 0;
  _$jscoverage['/tree/node-render.js'].lineData[162] = 0;
}
if (! _$jscoverage['/tree/node-render.js'].functionData) {
  _$jscoverage['/tree/node-render.js'].functionData = [];
  _$jscoverage['/tree/node-render.js'].functionData[0] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[1] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[2] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[3] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[4] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[5] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[6] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[7] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[8] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[9] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[10] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[11] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[12] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[13] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[14] = 0;
  _$jscoverage['/tree/node-render.js'].functionData[15] = 0;
}
if (! _$jscoverage['/tree/node-render.js'].branchData) {
  _$jscoverage['/tree/node-render.js'].branchData = {};
  _$jscoverage['/tree/node-render.js'].branchData['62'] = [];
  _$jscoverage['/tree/node-render.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/tree/node-render.js'].branchData['67'] = [];
  _$jscoverage['/tree/node-render.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/tree/node-render.js'].branchData['132'] = [];
  _$jscoverage['/tree/node-render.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/tree/node-render.js'].branchData['134'] = [];
  _$jscoverage['/tree/node-render.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/tree/node-render.js'].branchData['141'] = [];
  _$jscoverage['/tree/node-render.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/tree/node-render.js'].branchData['148'] = [];
  _$jscoverage['/tree/node-render.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/tree/node-render.js'].branchData['150'] = [];
  _$jscoverage['/tree/node-render.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/tree/node-render.js'].branchData['151'] = [];
  _$jscoverage['/tree/node-render.js'].branchData['151'][1] = new BranchData();
}
_$jscoverage['/tree/node-render.js'].branchData['151'][1].init(30, 56, 'checkIconEl.hasClass(this.getBaseCssClass(allStates[i]))');
function visit25_151_1(result) {
  _$jscoverage['/tree/node-render.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-render.js'].branchData['150'][1].init(104, 20, 'i < allStates.length');
function visit24_150_1(result) {
  _$jscoverage['/tree/node-render.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-render.js'].branchData['148'][1].init(104, 11, 'checkIconEl');
function visit23_148_1(result) {
  _$jscoverage['/tree/node-render.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-render.js'].branchData['141'][1].init(6, 95, 'el.one("." + this.getBaseCssClass(CHILDREN_CLS)).css("display") != "none"');
function visit22_141_1(result) {
  _$jscoverage['/tree/node-render.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-render.js'].branchData['134'][1].init(164, 43, 'el.hasClass(self.getBaseCssClass("folder"))');
function visit21_134_1(result) {
  _$jscoverage['/tree/node-render.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-render.js'].branchData['132'][1].init(56, 41, 'el.hasClass(self.getBaseCssClass("leaf"))');
function visit20_132_1(result) {
  _$jscoverage['/tree/node-render.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-render.js'].branchData['67'][1].init(79, 8, 'expanded');
function visit19_67_1(result) {
  _$jscoverage['/tree/node-render.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-render.js'].branchData['62'][1].init(316, 10, 'isNodeLeaf');
function visit18_62_1(result) {
  _$jscoverage['/tree/node-render.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node-render.js'].lineData[6]++;
KISSY.add("tree/node-render", function(S, Node, Container, TreeNodeTpl, ContentRenderExtension) {
  _$jscoverage['/tree/node-render.js'].functionData[0]++;
  _$jscoverage['/tree/node-render.js'].lineData[7]++;
  var SELECTED_CLS = "selected", COMMON_EXPAND_EL_CLS = "expand-icon-{t}", EXPAND_ICON_EL_FILE_CLS = [COMMON_EXPAND_EL_CLS].join(" "), EXPAND_ICON_EL_FOLDER_EXPAND_CLS = [COMMON_EXPAND_EL_CLS + "minus"].join(" "), EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS = [COMMON_EXPAND_EL_CLS + "plus"].join(" "), ICON_EL_FILE_CLS = ["file-icon"].join(" "), ICON_EL_FOLDER_EXPAND_CLS = ["expanded-folder-icon"].join(" "), ICON_EL_FOLDER_COLLAPSE_CLS = ["collapsed-folder-icon"].join(" "), ROW_EL_CLS = 'row', CHILDREN_CLS = "children", CHILDREN_CLS_L = "lchildren", CHECK_CLS = "checked", ALL_STATES_CLS = "checked0 checked1 checked2";
  _$jscoverage['/tree/node-render.js'].lineData[33]++;
  return Container.getDefaultRender().extend([ContentRenderExtension], {
  beforeCreateDom: function(renderData, childrenElSelectors) {
  _$jscoverage['/tree/node-render.js'].functionData[1]++;
  _$jscoverage['/tree/node-render.js'].lineData[36]++;
  S.mix(renderData.elAttrs, {
  role: 'tree-node', 
  'aria-labelledby': 'ks-content' + renderData.id, 
  'aria-expanded': renderData.expanded ? 'true' : 'false', 
  'aria-selected': renderData.selected ? 'true' : 'false', 
  'aria-level': renderData.depth, 
  'title': renderData.tooltip});
  _$jscoverage['/tree/node-render.js'].lineData[44]++;
  S.mix(childrenElSelectors, {
  expandIconEl: '#ks-tree-node-expand-icon-{id}', 
  rowEl: '#ks-tree-node-row-{id}', 
  iconEl: '#ks-tree-node-icon-{id}', 
  childrenEl: '#ks-tree-node-children-{id}', 
  checkIconEl: '#ks-tree-node-checked-{id}'});
}, 
  refreshCss: function(isNodeSingleOrLast, isNodeLeaf) {
  _$jscoverage['/tree/node-render.js'].functionData[2]++;
  _$jscoverage['/tree/node-render.js'].lineData[54]++;
  var self = this, control = self.control, iconEl = control.get("iconEl"), iconElCss, expandElCss, expandIconEl = control.get("expandIconEl"), childrenEl = control.get("childrenEl");
  _$jscoverage['/tree/node-render.js'].lineData[62]++;
  if (visit18_62_1(isNodeLeaf)) {
    _$jscoverage['/tree/node-render.js'].lineData[63]++;
    iconElCss = ICON_EL_FILE_CLS;
    _$jscoverage['/tree/node-render.js'].lineData[64]++;
    expandElCss = EXPAND_ICON_EL_FILE_CLS;
  } else {
    _$jscoverage['/tree/node-render.js'].lineData[66]++;
    var expanded = control.get("expanded");
    _$jscoverage['/tree/node-render.js'].lineData[67]++;
    if (visit19_67_1(expanded)) {
      _$jscoverage['/tree/node-render.js'].lineData[68]++;
      iconElCss = ICON_EL_FOLDER_EXPAND_CLS;
      _$jscoverage['/tree/node-render.js'].lineData[69]++;
      expandElCss = EXPAND_ICON_EL_FOLDER_EXPAND_CLS;
    } else {
      _$jscoverage['/tree/node-render.js'].lineData[71]++;
      iconElCss = ICON_EL_FOLDER_COLLAPSE_CLS;
      _$jscoverage['/tree/node-render.js'].lineData[72]++;
      expandElCss = EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS;
    }
  }
  _$jscoverage['/tree/node-render.js'].lineData[76]++;
  iconEl[0].className = self.getBaseCssClasses(iconElCss);
  _$jscoverage['/tree/node-render.js'].lineData[77]++;
  expandIconEl[0].className = self.getBaseCssClasses(S.substitute(expandElCss, {
  "t": isNodeSingleOrLast ? "l" : "t"}));
  _$jscoverage['/tree/node-render.js'].lineData[82]++;
  childrenEl[0].className = self.getBaseCssClasses((isNodeSingleOrLast ? CHILDREN_CLS_L : CHILDREN_CLS));
}, 
  _onSetExpanded: function(v) {
  _$jscoverage['/tree/node-render.js'].functionData[3]++;
  _$jscoverage['/tree/node-render.js'].lineData[88]++;
  var self = this, childrenEl = self.control.get("childrenEl");
  _$jscoverage['/tree/node-render.js'].lineData[90]++;
  childrenEl[v ? "show" : "hide"]();
  _$jscoverage['/tree/node-render.js'].lineData[91]++;
  self.el.setAttribute("aria-expanded", v);
}, 
  _onSetSelected: function(v) {
  _$jscoverage['/tree/node-render.js'].functionData[4]++;
  _$jscoverage['/tree/node-render.js'].lineData[95]++;
  var self = this, rowEl = self.control.get("rowEl");
  _$jscoverage['/tree/node-render.js'].lineData[97]++;
  rowEl[v ? "addClass" : "removeClass"](self.getBaseCssClasses(SELECTED_CLS));
  _$jscoverage['/tree/node-render.js'].lineData[98]++;
  self.el.setAttribute("aria-selected", v);
}, 
  '_onSetDepth': function(v) {
  _$jscoverage['/tree/node-render.js'].functionData[5]++;
  _$jscoverage['/tree/node-render.js'].lineData[102]++;
  this.el.setAttribute("aria-level", v);
}, 
  _onSetCheckState: function(s) {
  _$jscoverage['/tree/node-render.js'].functionData[6]++;
  _$jscoverage['/tree/node-render.js'].lineData[106]++;
  var self = this, checkCls = self.getBaseCssClasses(CHECK_CLS).split(/\s+/).join(s + ' ') + s, checkIconEl = self.control.get("checkIconEl");
  _$jscoverage['/tree/node-render.js'].lineData[110]++;
  checkIconEl.removeClass(self.getBaseCssClasses(ALL_STATES_CLS)).addClass(checkCls);
}, 
  getChildrenContainerEl: function() {
  _$jscoverage['/tree/node-render.js'].functionData[7]++;
  _$jscoverage['/tree/node-render.js'].lineData[114]++;
  return this.control.get('childrenEl');
}}, {
  ATTRS: {
  contentTpl: {
  value: TreeNodeTpl}}, 
  HTML_PARSER: {
  rowEl: function(el) {
  _$jscoverage['/tree/node-render.js'].functionData[8]++;
  _$jscoverage['/tree/node-render.js'].lineData[125]++;
  return el.one('.' + this.getBaseCssClass(ROW_EL_CLS));
}, 
  childrenEl: function(el) {
  _$jscoverage['/tree/node-render.js'].functionData[9]++;
  _$jscoverage['/tree/node-render.js'].lineData[128]++;
  return el.one("." + this.getBaseCssClass(CHILDREN_CLS));
}, 
  isLeaf: function(el) {
  _$jscoverage['/tree/node-render.js'].functionData[10]++;
  _$jscoverage['/tree/node-render.js'].lineData[131]++;
  var self = this;
  _$jscoverage['/tree/node-render.js'].lineData[132]++;
  if (visit20_132_1(el.hasClass(self.getBaseCssClass("leaf")))) {
    _$jscoverage['/tree/node-render.js'].lineData[133]++;
    return true;
  } else {
    _$jscoverage['/tree/node-render.js'].lineData[134]++;
    if (visit21_134_1(el.hasClass(self.getBaseCssClass("folder")))) {
      _$jscoverage['/tree/node-render.js'].lineData[135]++;
      return false;
    }
  }
  _$jscoverage['/tree/node-render.js'].lineData[137]++;
  return undefined;
}, 
  expanded: function(el) {
  _$jscoverage['/tree/node-render.js'].functionData[11]++;
  _$jscoverage['/tree/node-render.js'].lineData[140]++;
  return visit22_141_1(el.one("." + this.getBaseCssClass(CHILDREN_CLS)).css("display") != "none");
}, 
  expandIconEl: function(el) {
  _$jscoverage['/tree/node-render.js'].functionData[12]++;
  _$jscoverage['/tree/node-render.js'].lineData[144]++;
  return el.one('.' + this.getBaseCssClass('expand-icon'));
}, 
  checkState: function(el) {
  _$jscoverage['/tree/node-render.js'].functionData[13]++;
  _$jscoverage['/tree/node-render.js'].lineData[147]++;
  var checkIconEl = el.one('.' + this.getBaseCssClass(CHECK_CLS));
  _$jscoverage['/tree/node-render.js'].lineData[148]++;
  if (visit23_148_1(checkIconEl)) {
    _$jscoverage['/tree/node-render.js'].lineData[149]++;
    var allStates = ALL_STATES_CLS.split(/\s+/);
    _$jscoverage['/tree/node-render.js'].lineData[150]++;
    for (var i = 0; visit24_150_1(i < allStates.length); i++) {
      _$jscoverage['/tree/node-render.js'].lineData[151]++;
      if (visit25_151_1(checkIconEl.hasClass(this.getBaseCssClass(allStates[i])))) {
        _$jscoverage['/tree/node-render.js'].lineData[152]++;
        return i;
      }
    }
  }
  _$jscoverage['/tree/node-render.js'].lineData[156]++;
  return 0;
}, 
  iconEl: function(el) {
  _$jscoverage['/tree/node-render.js'].functionData[14]++;
  _$jscoverage['/tree/node-render.js'].lineData[159]++;
  return el.one('.' + this.getBaseCssClass('icon'));
}, 
  checkIconEl: function(el) {
  _$jscoverage['/tree/node-render.js'].functionData[15]++;
  _$jscoverage['/tree/node-render.js'].lineData[162]++;
  return el.one('.' + this.getBaseCssClass(CHECK_CLS));
}}});
}, {
  requires: ['node', 'component/container', './node-xtpl', 'component/extension/content-render']});
