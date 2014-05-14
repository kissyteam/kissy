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
if (! _$jscoverage['/tree/check-node.js']) {
  _$jscoverage['/tree/check-node.js'] = {};
  _$jscoverage['/tree/check-node.js'].lineData = [];
  _$jscoverage['/tree/check-node.js'].lineData[6] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[7] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[8] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[9] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[11] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[16] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[24] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[26] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[34] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[35] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[37] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[38] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[39] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[43] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[45] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[46] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[48] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[51] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[52] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[56] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[64] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[67] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[69] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[70] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[71] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[77] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[78] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[79] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[80] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[81] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[82] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[84] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[85] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[86] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[87] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[88] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[93] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[94] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[95] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[97] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[100] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[108] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[134] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[135] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[136] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[137] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[138] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[139] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[143] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[149] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[162] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[177] = 0;
}
if (! _$jscoverage['/tree/check-node.js'].functionData) {
  _$jscoverage['/tree/check-node.js'].functionData = [];
  _$jscoverage['/tree/check-node.js'].functionData[0] = 0;
  _$jscoverage['/tree/check-node.js'].functionData[1] = 0;
  _$jscoverage['/tree/check-node.js'].functionData[2] = 0;
  _$jscoverage['/tree/check-node.js'].functionData[3] = 0;
  _$jscoverage['/tree/check-node.js'].functionData[4] = 0;
  _$jscoverage['/tree/check-node.js'].functionData[5] = 0;
  _$jscoverage['/tree/check-node.js'].functionData[6] = 0;
}
if (! _$jscoverage['/tree/check-node.js'].branchData) {
  _$jscoverage['/tree/check-node.js'].branchData = {};
  _$jscoverage['/tree/check-node.js'].branchData['37'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['45'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['69'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['69'][3] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['77'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['80'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['84'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['87'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['93'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['95'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['135'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['137'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['138'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['138'][1] = new BranchData();
}
_$jscoverage['/tree/check-node.js'].branchData['138'][1].init(34, 56, 'checkIconEl.hasClass(this.getBaseCssClass(allStates[i]))');
function visit14_138_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['137'][1].init(112, 20, 'i < allStates.length');
function visit13_137_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['135'][1].init(90, 11, 'checkIconEl');
function visit12_135_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['95'][1].init(702, 24, 'checkCount === cs.length');
function visit11_95_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['93'][1].init(599, 16, 'checkCount === 0');
function visit10_93_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['87'][1].init(314, 16, 'cState === CHECK');
function visit9_87_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['84'][1].init(154, 24, 'cState === PARTIAL_CHECK');
function visit8_84_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['80'][1].init(109, 13, 'i < cs.length');
function visit7_80_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['77'][1].init(746, 6, 'parent');
function visit6_77_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['69'][3].init(493, 11, 's === EMPTY');
function visit5_69_3(result) {
  _$jscoverage['/tree/check-node.js'].branchData['69'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['69'][2].init(478, 11, 's === CHECK');
function visit4_69_2(result) {
  _$jscoverage['/tree/check-node.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['69'][1].init(478, 26, 's === CHECK || s === EMPTY');
function visit3_69_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['45'][1].init(617, 20, 'checkState === CHECK');
function visit2_45_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['37'][1].init(388, 27, 'target.equals(expandIconEl)');
function visit1_37_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/tree/check-node.js'].functionData[0]++;
  _$jscoverage['/tree/check-node.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/tree/check-node.js'].lineData[8]++;
  var TreeNode = require('./node');
  _$jscoverage['/tree/check-node.js'].lineData[9]++;
  var util = require('util');
  _$jscoverage['/tree/check-node.js'].lineData[11]++;
  var $ = Node.all, PARTIAL_CHECK = 2, CHECK = 1, EMPTY = 0;
  _$jscoverage['/tree/check-node.js'].lineData[16]++;
  var CHECK_CLS = 'checked', ALL_STATES_CLS = 'checked0 checked1 checked2';
  _$jscoverage['/tree/check-node.js'].lineData[24]++;
  var CheckNode = TreeNode.extend({
  handleClickInternal: function(e) {
  _$jscoverage['/tree/check-node.js'].functionData[1]++;
  _$jscoverage['/tree/check-node.js'].lineData[26]++;
  var self = this, checkState, expanded = self.get('expanded'), expandIconEl = self.get('expandIconEl'), tree = self.get('tree'), target = $(e.target);
  _$jscoverage['/tree/check-node.js'].lineData[34]++;
  tree.focus();
  _$jscoverage['/tree/check-node.js'].lineData[35]++;
  self.callSuper(e);
  _$jscoverage['/tree/check-node.js'].lineData[37]++;
  if (visit1_37_1(target.equals(expandIconEl))) {
    _$jscoverage['/tree/check-node.js'].lineData[38]++;
    self.set('expanded', !expanded);
    _$jscoverage['/tree/check-node.js'].lineData[39]++;
    return;
  }
  _$jscoverage['/tree/check-node.js'].lineData[43]++;
  checkState = self.get('checkState');
  _$jscoverage['/tree/check-node.js'].lineData[45]++;
  if (visit2_45_1(checkState === CHECK)) {
    _$jscoverage['/tree/check-node.js'].lineData[46]++;
    checkState = EMPTY;
  } else {
    _$jscoverage['/tree/check-node.js'].lineData[48]++;
    checkState = CHECK;
  }
  _$jscoverage['/tree/check-node.js'].lineData[51]++;
  self.set('checkState', checkState);
  _$jscoverage['/tree/check-node.js'].lineData[52]++;
  return true;
}, 
  _onSetCheckState: function(s) {
  _$jscoverage['/tree/check-node.js'].functionData[2]++;
  _$jscoverage['/tree/check-node.js'].lineData[56]++;
  var self = this, parent = self.get('parent'), checkCount, i, c, cState, cs;
  _$jscoverage['/tree/check-node.js'].lineData[64]++;
  var checkCls = self.getBaseCssClasses(CHECK_CLS).split(/\s+/).join(s + ' ') + s, checkIconEl = self.get('checkIconEl');
  _$jscoverage['/tree/check-node.js'].lineData[67]++;
  checkIconEl.removeClass(self.getBaseCssClasses(ALL_STATES_CLS)).addClass(checkCls);
  _$jscoverage['/tree/check-node.js'].lineData[69]++;
  if (visit3_69_1(visit4_69_2(s === CHECK) || visit5_69_3(s === EMPTY))) {
    _$jscoverage['/tree/check-node.js'].lineData[70]++;
    util.each(self.get('children'), function(c) {
  _$jscoverage['/tree/check-node.js'].functionData[3]++;
  _$jscoverage['/tree/check-node.js'].lineData[71]++;
  c.set('checkState', s);
});
  }
  _$jscoverage['/tree/check-node.js'].lineData[77]++;
  if (visit6_77_1(parent)) {
    _$jscoverage['/tree/check-node.js'].lineData[78]++;
    checkCount = 0;
    _$jscoverage['/tree/check-node.js'].lineData[79]++;
    cs = parent.get('children');
    _$jscoverage['/tree/check-node.js'].lineData[80]++;
    for (i = 0; visit7_80_1(i < cs.length); i++) {
      _$jscoverage['/tree/check-node.js'].lineData[81]++;
      c = cs[i];
      _$jscoverage['/tree/check-node.js'].lineData[82]++;
      cState = c.get('checkState');
      _$jscoverage['/tree/check-node.js'].lineData[84]++;
      if (visit8_84_1(cState === PARTIAL_CHECK)) {
        _$jscoverage['/tree/check-node.js'].lineData[85]++;
        parent.set('checkState', PARTIAL_CHECK);
        _$jscoverage['/tree/check-node.js'].lineData[86]++;
        return;
      } else {
        _$jscoverage['/tree/check-node.js'].lineData[87]++;
        if (visit9_87_1(cState === CHECK)) {
          _$jscoverage['/tree/check-node.js'].lineData[88]++;
          checkCount++;
        }
      }
    }
    _$jscoverage['/tree/check-node.js'].lineData[93]++;
    if (visit10_93_1(checkCount === 0)) {
      _$jscoverage['/tree/check-node.js'].lineData[94]++;
      parent.set('checkState', EMPTY);
    } else {
      _$jscoverage['/tree/check-node.js'].lineData[95]++;
      if (visit11_95_1(checkCount === cs.length)) {
        _$jscoverage['/tree/check-node.js'].lineData[97]++;
        parent.set('checkState', CHECK);
      } else {
        _$jscoverage['/tree/check-node.js'].lineData[100]++;
        parent.set('checkState', PARTIAL_CHECK);
      }
    }
  }
}}, {
  ATTRS: {
  checkIconEl: {
  selector: function() {
  _$jscoverage['/tree/check-node.js'].functionData[4]++;
  _$jscoverage['/tree/check-node.js'].lineData[108]++;
  return ('.' + this.getBaseCssClass(CHECK_CLS));
}}, 
  checkable: {
  value: true, 
  render: 1, 
  sync: 0}, 
  checkState: {
  value: 0, 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/tree/check-node.js'].functionData[5]++;
  _$jscoverage['/tree/check-node.js'].lineData[134]++;
  var checkIconEl = this.get('checkIconEl');
  _$jscoverage['/tree/check-node.js'].lineData[135]++;
  if (visit12_135_1(checkIconEl)) {
    _$jscoverage['/tree/check-node.js'].lineData[136]++;
    var allStates = ALL_STATES_CLS.split(/\s+/);
    _$jscoverage['/tree/check-node.js'].lineData[137]++;
    for (var i = 0; visit13_137_1(i < allStates.length); i++) {
      _$jscoverage['/tree/check-node.js'].lineData[138]++;
      if (visit14_138_1(checkIconEl.hasClass(this.getBaseCssClass(allStates[i])))) {
        _$jscoverage['/tree/check-node.js'].lineData[139]++;
        return i;
      }
    }
  }
  _$jscoverage['/tree/check-node.js'].lineData[143]++;
  return undefined;
}}, 
  defaultChildCfg: {
  valueFn: function() {
  _$jscoverage['/tree/check-node.js'].functionData[6]++;
  _$jscoverage['/tree/check-node.js'].lineData[149]++;
  return {
  xclass: 'check-tree-node'};
}}}, 
  xclass: 'check-tree-node'});
  _$jscoverage['/tree/check-node.js'].lineData[162]++;
  CheckNode.CheckState = {
  PARTIAL_CHECK: PARTIAL_CHECK, 
  CHECK: CHECK, 
  EMPTY: EMPTY};
  _$jscoverage['/tree/check-node.js'].lineData[177]++;
  return CheckNode;
});
