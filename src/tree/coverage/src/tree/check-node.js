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
  _$jscoverage['/tree/check-node.js'].lineData[5] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[6] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[16] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[18] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[26] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[29] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[30] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[31] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[35] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[37] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[38] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[40] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[44] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[46] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[47] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[51] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[59] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[60] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[61] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[67] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[68] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[69] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[70] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[71] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[72] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[74] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[75] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[76] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[77] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[78] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[83] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[84] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[87] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[88] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[92] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[136] = 0;
  _$jscoverage['/tree/check-node.js'].lineData[151] = 0;
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
  _$jscoverage['/tree/check-node.js'].branchData['29'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['37'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['59'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['59'][3] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['67'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['70'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['74'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['77'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['83'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/tree/check-node.js'].branchData['87'] = [];
  _$jscoverage['/tree/check-node.js'].branchData['87'][1] = new BranchData();
}
_$jscoverage['/tree/check-node.js'].branchData['87'][1].init(750, 23, 'checkCount == cs.length');
function visit11_87_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['83'][1].init(597, 16, 'checkCount === 0');
function visit10_83_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['77'][1].init(313, 15, 'cState == CHECK');
function visit9_77_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['74'][1].init(154, 23, 'cState == PARTIAL_CHECK');
function visit8_74_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['70'][1].init(109, 13, 'i < cs.length');
function visit7_70_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['67'][1].init(474, 6, 'parent');
function visit6_67_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['59'][3].init(225, 10, 's == EMPTY');
function visit5_59_3(result) {
  _$jscoverage['/tree/check-node.js'].branchData['59'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['59'][2].init(211, 10, 's == CHECK');
function visit4_59_2(result) {
  _$jscoverage['/tree/check-node.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['59'][1].init(211, 24, 's == CHECK || s == EMPTY');
function visit3_59_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['37'][1].init(587, 19, 'checkState == CHECK');
function visit2_37_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].branchData['29'][1].init(358, 27, 'target.equals(expandIconEl)');
function visit1_29_1(result) {
  _$jscoverage['/tree/check-node.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/check-node.js'].lineData[5]++;
KISSY.add("tree/check-node", function(S, Node, TreeNode) {
  _$jscoverage['/tree/check-node.js'].functionData[0]++;
  _$jscoverage['/tree/check-node.js'].lineData[6]++;
  var $ = Node.all, PARTIAL_CHECK = 2, CHECK = 1, EMPTY = 0;
  _$jscoverage['/tree/check-node.js'].lineData[16]++;
  var CheckNode = TreeNode.extend({
  handleClickInternal: function(e) {
  _$jscoverage['/tree/check-node.js'].functionData[1]++;
  _$jscoverage['/tree/check-node.js'].lineData[18]++;
  var self = this, checkState, expanded = self.get("expanded"), expandIconEl = self.get("expandIconEl"), tree = self.get("tree"), target = $(e.target);
  _$jscoverage['/tree/check-node.js'].lineData[26]++;
  tree.focus();
  _$jscoverage['/tree/check-node.js'].lineData[29]++;
  if (visit1_29_1(target.equals(expandIconEl))) {
    _$jscoverage['/tree/check-node.js'].lineData[30]++;
    self.set("expanded", !expanded);
    _$jscoverage['/tree/check-node.js'].lineData[31]++;
    return;
  }
  _$jscoverage['/tree/check-node.js'].lineData[35]++;
  checkState = self.get("checkState");
  _$jscoverage['/tree/check-node.js'].lineData[37]++;
  if (visit2_37_1(checkState == CHECK)) {
    _$jscoverage['/tree/check-node.js'].lineData[38]++;
    checkState = EMPTY;
  } else {
    _$jscoverage['/tree/check-node.js'].lineData[40]++;
    checkState = CHECK;
  }
  _$jscoverage['/tree/check-node.js'].lineData[44]++;
  self.set("checkState", checkState);
  _$jscoverage['/tree/check-node.js'].lineData[46]++;
  self.fire("click");
  _$jscoverage['/tree/check-node.js'].lineData[47]++;
  return true;
}, 
  _onSetCheckState: function(s) {
  _$jscoverage['/tree/check-node.js'].functionData[2]++;
  _$jscoverage['/tree/check-node.js'].lineData[51]++;
  var self = this, parent = self.get('parent'), checkCount, i, c, cState, cs;
  _$jscoverage['/tree/check-node.js'].lineData[59]++;
  if (visit3_59_1(visit4_59_2(s == CHECK) || visit5_59_3(s == EMPTY))) {
    _$jscoverage['/tree/check-node.js'].lineData[60]++;
    S.each(self.get("children"), function(c) {
  _$jscoverage['/tree/check-node.js'].functionData[3]++;
  _$jscoverage['/tree/check-node.js'].lineData[61]++;
  c.set("checkState", s);
});
  }
  _$jscoverage['/tree/check-node.js'].lineData[67]++;
  if (visit6_67_1(parent)) {
    _$jscoverage['/tree/check-node.js'].lineData[68]++;
    checkCount = 0;
    _$jscoverage['/tree/check-node.js'].lineData[69]++;
    cs = parent.get("children");
    _$jscoverage['/tree/check-node.js'].lineData[70]++;
    for (i = 0; visit7_70_1(i < cs.length); i++) {
      _$jscoverage['/tree/check-node.js'].lineData[71]++;
      c = cs[i];
      _$jscoverage['/tree/check-node.js'].lineData[72]++;
      cState = c.get("checkState");
      _$jscoverage['/tree/check-node.js'].lineData[74]++;
      if (visit8_74_1(cState == PARTIAL_CHECK)) {
        _$jscoverage['/tree/check-node.js'].lineData[75]++;
        parent.set("checkState", PARTIAL_CHECK);
        _$jscoverage['/tree/check-node.js'].lineData[76]++;
        return;
      } else {
        _$jscoverage['/tree/check-node.js'].lineData[77]++;
        if (visit9_77_1(cState == CHECK)) {
          _$jscoverage['/tree/check-node.js'].lineData[78]++;
          checkCount++;
        }
      }
    }
    _$jscoverage['/tree/check-node.js'].lineData[83]++;
    if (visit10_83_1(checkCount === 0)) {
      _$jscoverage['/tree/check-node.js'].lineData[84]++;
      parent.set("checkState", EMPTY);
    } else {
      _$jscoverage['/tree/check-node.js'].lineData[87]++;
      if (visit11_87_1(checkCount == cs.length)) {
        _$jscoverage['/tree/check-node.js'].lineData[88]++;
        parent.set("checkState", CHECK);
      } else {
        _$jscoverage['/tree/check-node.js'].lineData[92]++;
        parent.set("checkState", PARTIAL_CHECK);
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
  xclass: "check-tree-node"});
  _$jscoverage['/tree/check-node.js'].lineData[136]++;
  CheckNode.CheckState = {
  PARTIAL_CHECK: PARTIAL_CHECK, 
  CHECK: CHECK, 
  EMPTY: EMPTY};
  _$jscoverage['/tree/check-node.js'].lineData[151]++;
  return CheckNode;
}, {
  requires: ['node', './node']});
