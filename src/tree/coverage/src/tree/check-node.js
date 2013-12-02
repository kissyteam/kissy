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
  _$jscoverage['/tree/check-node.js'].lineData[10] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[20] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[22] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[30] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[31] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[33] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[34] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[35] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[39] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[41] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[42] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[44] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[47] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[49] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[50] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[54] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[62] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[63] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[64] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[70] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[71] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[72] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[73] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[74] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[75] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[77] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[78] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[79] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[80] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[81] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[86] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[87] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[90] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[91] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[95] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[139] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[154] = 0;
}
if (! _$jscoverage['/tree/check-node.js'].functionData) {
  _$jscoverage['/tree/check-node.js'].functionData = [];
  _$jscoverage['/tree/check-node.js'].functionData[0] = 0;
  _$jscoverage['/tree/check-node.js'].functionData[1] = 0;
  _$jscoverage['/tree/check-node.js'].functionData[2] = 0;
  _$jscoverage['/tree/check-node.js'].functionData[3] = 0;
}
if (! _$jscoverage['/tree/check-node.js'].branchData) {
  _$jscoverage['/tree/check-node.js'].branchData = {};
  _$jscoverage['/tree/check-node.js'].branchData['33'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['41'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['62'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['62'][2] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['62'][3] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['70'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['73'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['77'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['80'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['86'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['90'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['90'][1] = new BranchData();
}
_$jscoverage['/tree/check-node.js'].branchData['90'][1].init(732, 24, 'checkCount === cs.length');
function visit11_90_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['86'][1].init(583, 16, 'checkCount === 0');
function visit10_86_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['80'][1].init(307, 16, 'cState === CHECK');
function visit9_80_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['77'][1].init(150, 24, 'cState === PARTIAL_CHECK');
function visit8_77_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['73'][1].init(106, 13, 'i < cs.length');
function visit7_73_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['70'][1].init(459, 6, 'parent');
function visit6_70_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['62'][3].init(217, 11, 's === EMPTY');
function visit5_62_3(result) {
  _$jscoverage['/tree/check-node.js'].branchData['62'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['62'][2].init(202, 11, 's === CHECK');
function visit4_62_2(result) {
  _$jscoverage['/tree/check-node.js'].branchData['62'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['62'][1].init(202, 26, 's === CHECK || s === EMPTY');
function visit3_62_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['41'][1].init(597, 20, 'checkState === CHECK');
function visit2_41_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['33'][1].init(376, 27, 'target.equals(expandIconEl)');
function visit1_33_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/tree/check-node.js'].functionData[0]++;
  _$jscoverage['/tree/check-node.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/tree/check-node.js'].lineData[8]++;
  var TreeNode = require('./node');
  _$jscoverage['/tree/check-node.js'].lineData[10]++;
  var $ = Node.all, PARTIAL_CHECK = 2, CHECK = 1, EMPTY = 0;
  _$jscoverage['/tree/check-node.js'].lineData[20]++;
  var CheckNode = TreeNode.extend({
  handleClickInternal: function(e) {
  _$jscoverage['/tree/check-node.js'].functionData[1]++;
  _$jscoverage['/tree/check-node.js'].lineData[22]++;
  var self = this, checkState, expanded = self.get('expanded'), expandIconEl = self.get('expandIconEl'), tree = self.get('tree'), target = $(e.target);
  _$jscoverage['/tree/check-node.js'].lineData[30]++;
  tree.focus();
  _$jscoverage['/tree/check-node.js'].lineData[31]++;
  self.callSuper(e);
  _$jscoverage['/tree/check-node.js'].lineData[33]++;
  if (visit1_33_1(target.equals(expandIconEl))) {
    _$jscoverage['/tree/check-node.js'].lineData[34]++;
    self.set('expanded', !expanded);
    _$jscoverage['/tree/check-node.js'].lineData[35]++;
    return;
  }
  _$jscoverage['/tree/check-node.js'].lineData[39]++;
  checkState = self.get('checkState');
  _$jscoverage['/tree/check-node.js'].lineData[41]++;
  if (visit2_41_1(checkState === CHECK)) {
    _$jscoverage['/tree/check-node.js'].lineData[42]++;
    checkState = EMPTY;
  } else {
    _$jscoverage['/tree/check-node.js'].lineData[44]++;
    checkState = CHECK;
  }
  _$jscoverage['/tree/check-node.js'].lineData[47]++;
  self.set('checkState', checkState);
  _$jscoverage['/tree/check-node.js'].lineData[49]++;
  self.fire('click');
  _$jscoverage['/tree/check-node.js'].lineData[50]++;
  return true;
}, 
  _onSetCheckState: function(s) {
  _$jscoverage['/tree/check-node.js'].functionData[2]++;
  _$jscoverage['/tree/check-node.js'].lineData[54]++;
  var self = this, parent = self.get('parent'), checkCount, i, c, cState, cs;
  _$jscoverage['/tree/check-node.js'].lineData[62]++;
  if (visit3_62_1(visit4_62_2(s === CHECK) || visit5_62_3(s === EMPTY))) {
    _$jscoverage['/tree/check-node.js'].lineData[63]++;
    S.each(self.get('children'), function(c) {
  _$jscoverage['/tree/check-node.js'].functionData[3]++;
  _$jscoverage['/tree/check-node.js'].lineData[64]++;
  c.set('checkState', s);
});
  }
  _$jscoverage['/tree/check-node.js'].lineData[70]++;
  if (visit6_70_1(parent)) {
    _$jscoverage['/tree/check-node.js'].lineData[71]++;
    checkCount = 0;
    _$jscoverage['/tree/check-node.js'].lineData[72]++;
    cs = parent.get('children');
    _$jscoverage['/tree/check-node.js'].lineData[73]++;
    for (i = 0; visit7_73_1(i < cs.length); i++) {
      _$jscoverage['/tree/check-node.js'].lineData[74]++;
      c = cs[i];
      _$jscoverage['/tree/check-node.js'].lineData[75]++;
      cState = c.get('checkState');
      _$jscoverage['/tree/check-node.js'].lineData[77]++;
      if (visit8_77_1(cState === PARTIAL_CHECK)) {
        _$jscoverage['/tree/check-node.js'].lineData[78]++;
        parent.set('checkState', PARTIAL_CHECK);
        _$jscoverage['/tree/check-node.js'].lineData[79]++;
        return;
      } else {
        _$jscoverage['/tree/check-node.js'].lineData[80]++;
        if (visit9_80_1(cState === CHECK)) {
          _$jscoverage['/tree/check-node.js'].lineData[81]++;
          checkCount++;
        }
      }
    }
    _$jscoverage['/tree/check-node.js'].lineData[86]++;
    if (visit10_86_1(checkCount === 0)) {
      _$jscoverage['/tree/check-node.js'].lineData[87]++;
      parent.set('checkState', EMPTY);
    } else {
      _$jscoverage['/tree/check-node.js'].lineData[90]++;
      if (visit11_90_1(checkCount === cs.length)) {
        _$jscoverage['/tree/check-node.js'].lineData[91]++;
        parent.set('checkState', CHECK);
      } else {
        _$jscoverage['/tree/check-node.js'].lineData[95]++;
        parent.set('checkState', PARTIAL_CHECK);
      }
    }
  }
}}, {
  ATTRS: {
  checkIconEl: {}, 
  checkable: {
  value: true, 
  view: 1}, 
  checkState: {
  value: 0, 
  sync: 0, 
  view: 1}, 
  defaultChildCfg: {
  value: {
  xclass: 'check-tree-node'}}}, 
  xclass: 'check-tree-node'});
  _$jscoverage['/tree/check-node.js'].lineData[139]++;
  CheckNode.CheckState = {
  PARTIAL_CHECK: PARTIAL_CHECK, 
  CHECK: CHECK, 
  EMPTY: EMPTY};
  _$jscoverage['/tree/check-node.js'].lineData[154]++;
  return CheckNode;
});
