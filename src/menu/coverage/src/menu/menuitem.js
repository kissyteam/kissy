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
if (! _$jscoverage['/menu/menuitem.js']) {
  _$jscoverage['/menu/menuitem.js'] = {};
  _$jscoverage['/menu/menuitem.js'].lineData = [];
  _$jscoverage['/menu/menuitem.js'].lineData[6] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[8] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[16] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[22] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[23] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[34] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[36] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[37] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[39] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[40] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[46] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[49] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[52] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[53] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[55] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[57] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[62] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[63] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[67] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[69] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[70] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[72] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[86] = 0;
}
if (! _$jscoverage['/menu/menuitem.js'].functionData) {
  _$jscoverage['/menu/menuitem.js'].functionData = [];
  _$jscoverage['/menu/menuitem.js'].functionData[0] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[1] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[2] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[3] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[4] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[5] = 0;
}
if (! _$jscoverage['/menu/menuitem.js'].branchData) {
  _$jscoverage['/menu/menuitem.js'].branchData = {};
  _$jscoverage['/menu/menuitem.js'].branchData['36'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['49'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['52'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['55'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['62'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['67'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['69'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['69'][1] = new BranchData();
}
_$jscoverage['/menu/menuitem.js'].branchData['69'][1].init(331, 2, '!p');
function visit36_69_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['67'][1].init(33, 33, '$(e).css("overflow") != "visible"');
function visit35_67_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['62'][1].init(555, 1, 'v');
function visit34_62_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['55'][1].init(26, 1, 'v');
function visit33_55_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['52'][1].init(22, 20, 'self.get(\'rendered\')');
function visit32_52_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['49'][1].init(96, 31, 'e && e.byPassSetHighlightedItem');
function visit31_49_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['36'][1].init(67, 22, 'self.get("selectable")');
function visit30_36_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].lineData[6]++;
KISSY.add("menu/menuitem", function(S, Control, MenuItemRender) {
  _$jscoverage['/menu/menuitem.js'].functionData[0]++;
  _$jscoverage['/menu/menuitem.js'].lineData[8]++;
  var $ = S.all;
  _$jscoverage['/menu/menuitem.js'].lineData[16]++;
  return Control.extend({
  isMenuItem: 1, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/menu/menuitem.js'].functionData[1]++;
  _$jscoverage['/menu/menuitem.js'].lineData[22]++;
  this.callSuper(e);
  _$jscoverage['/menu/menuitem.js'].lineData[23]++;
  this.set("highlighted", true);
}, 
  handleClickInternal: function() {
  _$jscoverage['/menu/menuitem.js'].functionData[2]++;
  _$jscoverage['/menu/menuitem.js'].lineData[34]++;
  var self = this;
  _$jscoverage['/menu/menuitem.js'].lineData[36]++;
  if (visit30_36_1(self.get("selectable"))) {
    _$jscoverage['/menu/menuitem.js'].lineData[37]++;
    self.set("selected", true);
  }
  _$jscoverage['/menu/menuitem.js'].lineData[39]++;
  self.fire("click");
  _$jscoverage['/menu/menuitem.js'].lineData[40]++;
  return true;
}, 
  _onSetHighlighted: function(v, e) {
  _$jscoverage['/menu/menuitem.js'].functionData[3]++;
  _$jscoverage['/menu/menuitem.js'].lineData[46]++;
  var self = this, parent = self.get('parent');
  _$jscoverage['/menu/menuitem.js'].lineData[49]++;
  if (visit31_49_1(e && e.byPassSetHighlightedItem)) {
  } else {
    _$jscoverage['/menu/menuitem.js'].lineData[52]++;
    if (visit32_52_1(self.get('rendered'))) {
      _$jscoverage['/menu/menuitem.js'].lineData[53]++;
      parent.set('highlightedItem', v ? self : null);
    } else {
      _$jscoverage['/menu/menuitem.js'].lineData[55]++;
      if (visit33_55_1(v)) {
        _$jscoverage['/menu/menuitem.js'].lineData[57]++;
        parent.set('highlightedItem', self);
      }
    }
  }
  _$jscoverage['/menu/menuitem.js'].lineData[62]++;
  if (visit34_62_1(v)) {
    _$jscoverage['/menu/menuitem.js'].lineData[63]++;
    var el = self.$el, p = el.parent(function(e) {
  _$jscoverage['/menu/menuitem.js'].functionData[4]++;
  _$jscoverage['/menu/menuitem.js'].lineData[67]++;
  return visit35_67_1($(e).css("overflow") != "visible");
}, parent.get('el').parent());
    _$jscoverage['/menu/menuitem.js'].lineData[69]++;
    if (visit36_69_1(!p)) {
      _$jscoverage['/menu/menuitem.js'].lineData[70]++;
      return;
    }
    _$jscoverage['/menu/menuitem.js'].lineData[72]++;
    el.scrollIntoView(p, {
  alignWithTop: true, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
}, 
  containsElement: function(element) {
  _$jscoverage['/menu/menuitem.js'].functionData[5]++;
  _$jscoverage['/menu/menuitem.js'].lineData[86]++;
  return this.view.containsElement(element);
}}, {
  ATTRS: {
  focusable: {
  value: false}, 
  handleMouseEvents: {
  value: false}, 
  selectable: {
  view: 1}, 
  value: {}, 
  selected: {
  view: 1}, 
  xrender: {
  value: MenuItemRender}}, 
  xclass: "menuitem"});
}, {
  requires: ['component/control', './menuitem-render']});
