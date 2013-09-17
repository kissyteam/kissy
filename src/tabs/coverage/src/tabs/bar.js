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
if (! _$jscoverage['/tabs/bar.js']) {
  _$jscoverage['/tabs/bar.js'] = {};
  _$jscoverage['/tabs/bar.js'].lineData = [];
  _$jscoverage['/tabs/bar.js'].lineData[6] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[12] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[14] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[15] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[16] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[17] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[23] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[25] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[26] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[27] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[28] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[30] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[35] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[36] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[37] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[38] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[39] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[41] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[42] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[47] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[48] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[49] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[50] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[52] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[57] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[58] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[59] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[60] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[87] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[98] = 0;
}
if (! _$jscoverage['/tabs/bar.js'].functionData) {
  _$jscoverage['/tabs/bar.js'].functionData = [];
  _$jscoverage['/tabs/bar.js'].functionData[0] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[1] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[2] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[3] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[4] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[5] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[6] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[7] = 0;
}
if (! _$jscoverage['/tabs/bar.js'].branchData) {
  _$jscoverage['/tabs/bar.js'].branchData = {};
  _$jscoverage['/tabs/bar.js'].branchData['16'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/tabs/bar.js'].branchData['26'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/tabs/bar.js'].branchData['38'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/tabs/bar.js'].branchData['48'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/tabs/bar.js'].branchData['49'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/tabs/bar.js'].branchData['59'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['59'][1] = new BranchData();
}
_$jscoverage['/tabs/bar.js'].branchData['59'][1].init(82, 33, 'self.get(\'changeType\') == \'mouse\'');
function visit6_59_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].branchData['49'][1].init(22, 23, 'e && (prev = e.prevVal)');
function visit5_49_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].branchData['48'][1].init(41, 1, 'v');
function visit4_48_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].branchData['38'][1].init(163, 25, 'typeof next === \'boolean\'');
function visit3_38_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].branchData['26'][1].init(22, 17, 'c.get("selected")');
function visit2_26_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].branchData['16'][1].init(22, 30, 'e.newVal && e.target.isTabsTab');
function visit1_16_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].lineData[6]++;
KISSY.add("tabs/bar", function(S, Toolbar, BarRender, undefined) {
  _$jscoverage['/tabs/bar.js'].functionData[0]++;
  _$jscoverage['/tabs/bar.js'].lineData[12]++;
  var TabBar = Toolbar.extend({
  bindUI: function() {
  _$jscoverage['/tabs/bar.js'].functionData[1]++;
  _$jscoverage['/tabs/bar.js'].lineData[14]++;
  var self = this;
  _$jscoverage['/tabs/bar.js'].lineData[15]++;
  self.on("afterSelectedChange", function(e) {
  _$jscoverage['/tabs/bar.js'].functionData[2]++;
  _$jscoverage['/tabs/bar.js'].lineData[16]++;
  if (visit1_16_1(e.newVal && e.target.isTabsTab)) {
    _$jscoverage['/tabs/bar.js'].lineData[17]++;
    self.set("selectedTab", e.target);
  }
});
}, 
  syncUI: function() {
  _$jscoverage['/tabs/bar.js'].functionData[3]++;
  _$jscoverage['/tabs/bar.js'].lineData[23]++;
  var bar = this, children = bar.get("children");
  _$jscoverage['/tabs/bar.js'].lineData[25]++;
  S.each(children, function(c) {
  _$jscoverage['/tabs/bar.js'].functionData[4]++;
  _$jscoverage['/tabs/bar.js'].lineData[26]++;
  if (visit2_26_1(c.get("selected"))) {
    _$jscoverage['/tabs/bar.js'].lineData[27]++;
    bar.setInternal("selectedTab", c);
    _$jscoverage['/tabs/bar.js'].lineData[28]++;
    return false;
  }
  _$jscoverage['/tabs/bar.js'].lineData[30]++;
  return undefined;
});
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/tabs/bar.js'].functionData[5]++;
  _$jscoverage['/tabs/bar.js'].lineData[35]++;
  var self = this;
  _$jscoverage['/tabs/bar.js'].lineData[36]++;
  var current = self.get('selectedTab');
  _$jscoverage['/tabs/bar.js'].lineData[37]++;
  var next = self.getNextItemByKeyDown(e, current);
  _$jscoverage['/tabs/bar.js'].lineData[38]++;
  if (visit3_38_1(typeof next === 'boolean')) {
    _$jscoverage['/tabs/bar.js'].lineData[39]++;
    return next;
  } else {
    _$jscoverage['/tabs/bar.js'].lineData[41]++;
    next.set('selected', true);
    _$jscoverage['/tabs/bar.js'].lineData[42]++;
    return true;
  }
}, 
  _onSetSelectedTab: function(v, e) {
  _$jscoverage['/tabs/bar.js'].functionData[6]++;
  _$jscoverage['/tabs/bar.js'].lineData[47]++;
  var prev;
  _$jscoverage['/tabs/bar.js'].lineData[48]++;
  if (visit4_48_1(v)) {
    _$jscoverage['/tabs/bar.js'].lineData[49]++;
    if (visit5_49_1(e && (prev = e.prevVal))) {
      _$jscoverage['/tabs/bar.js'].lineData[50]++;
      prev.set("selected", false);
    }
    _$jscoverage['/tabs/bar.js'].lineData[52]++;
    v.set("selected", true);
  }
}, 
  _onSetHighlightedItem: function(v, e) {
  _$jscoverage['/tabs/bar.js'].functionData[7]++;
  _$jscoverage['/tabs/bar.js'].lineData[57]++;
  var self = this;
  _$jscoverage['/tabs/bar.js'].lineData[58]++;
  self.callSuper(v, e);
  _$jscoverage['/tabs/bar.js'].lineData[59]++;
  if (visit6_59_1(self.get('changeType') == 'mouse')) {
    _$jscoverage['/tabs/bar.js'].lineData[60]++;
    self._onSetSelectedTab.apply(self, arguments);
  }
}}, {
  ATTRS: {
  selectedTab: {}, 
  changeType: {
  value: "click"}, 
  defaultChildCfg: {
  value: {
  xclass: 'tabs-tab'}}, 
  xrender: {
  value: BarRender}}, 
  xclass: 'tabs-bar'});
  _$jscoverage['/tabs/bar.js'].lineData[87]++;
  TabBar.ChangeType = {
  CLICK: "click", 
  MOUSE: "mouse"};
  _$jscoverage['/tabs/bar.js'].lineData[98]++;
  return TabBar;
}, {
  requires: ['toolbar', './bar-render']});
