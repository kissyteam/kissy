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
if (! _$jscoverage['/runtime/scope.js']) {
  _$jscoverage['/runtime/scope.js'] = {};
  _$jscoverage['/runtime/scope.js'].lineData = [];
  _$jscoverage['/runtime/scope.js'].lineData[5] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[6] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[8] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[10] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[11] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[13] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[16] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[17] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[20] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[24] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[25] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[30] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[31] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[33] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[37] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[41] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[45] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[46] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[47] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[49] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[50] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[55] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[56] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[57] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[59] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[61] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[62] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[65] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[66] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[69] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[70] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[73] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[74] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[75] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[76] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[79] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[83] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[85] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[86] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[89] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[94] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[95] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[96] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[97] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[98] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[99] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[100] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[104] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[105] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[108] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[110] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[111] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[114] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[115] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[116] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[118] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[120] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[125] = 0;
}
if (! _$jscoverage['/runtime/scope.js'].functionData) {
  _$jscoverage['/runtime/scope.js'].functionData = [];
  _$jscoverage['/runtime/scope.js'].functionData[0] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[1] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[2] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[3] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[4] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[5] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[6] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[7] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[8] = 0;
}
if (! _$jscoverage['/runtime/scope.js'].branchData) {
  _$jscoverage['/runtime/scope.js'].branchData = {};
  _$jscoverage['/runtime/scope.js'].branchData['10'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['30'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['46'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['59'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['61'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['65'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['69'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['73'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['75'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['85'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['85'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['94'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['94'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['98'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['99'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['104'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['112'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['112'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['114'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['115'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['115'][2] = new BranchData();
}
_$jscoverage['/runtime/scope.js'].branchData['115'][2].init(35, 7, 'i < len');
function visit53_115_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['115'][1].init(30, 12, 'v && i < len');
function visit52_115_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['114'][1].init(828, 10, 'v && scope');
function visit51_114_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['112'][2].init(770, 11, 'v === undef');
function visit50_112_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['112'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['112'][1].init(65, 37, 'v === undef && (scope = scope.parent)');
function visit49_112_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['104'][1].init(592, 4, '!len');
function visit48_104_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['99'][1].init(25, 16, 'scope && depth--');
function visit47_99_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['98'][1].init(444, 5, 'depth');
function visit46_98_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['94'][2].init(303, 19, 'parts[0] === \'root\'');
function visit45_94_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['94'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['94'][1].init(296, 26, 'len && parts[0] === \'root\'');
function visit44_94_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['85'][2].init(60, 18, 'parts.length === 1');
function visit43_85_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['85'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['85'][1].init(50, 28, '!depth && parts.length === 1');
function visit42_85_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['75'][1].init(464, 15, 'name === \'root\'');
function visit41_75_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['73'][1].init(390, 15, 'name === \'this\'');
function visit40_73_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['69'][1].init(314, 11, 'v !== undef');
function visit39_69_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['65'][1].init(229, 14, 'data !== undef');
function visit38_65_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['61'][1].init(153, 11, 'v !== undef');
function visit37_61_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['59'][1].init(112, 20, 'affix && affix[name]');
function visit36_59_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['46'][1].init(55, 6, '!affix');
function visit35_46_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['30'][1].init(18, 11, '!this.affix');
function visit34_30_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['10'][1].init(29, 16, 'arguments.length');
function visit33_10_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].lineData[5]++;
KISSY.add(function() {
  _$jscoverage['/runtime/scope.js'].functionData[0]++;
  _$jscoverage['/runtime/scope.js'].lineData[6]++;
  var undef;
  _$jscoverage['/runtime/scope.js'].lineData[8]++;
  function Scope(data) {
    _$jscoverage['/runtime/scope.js'].functionData[1]++;
    _$jscoverage['/runtime/scope.js'].lineData[10]++;
    if (visit33_10_1(arguments.length)) {
      _$jscoverage['/runtime/scope.js'].lineData[11]++;
      this.data = data;
    } else {
      _$jscoverage['/runtime/scope.js'].lineData[13]++;
      this.data = {};
    }
    _$jscoverage['/runtime/scope.js'].lineData[16]++;
    this.affix = undef;
    _$jscoverage['/runtime/scope.js'].lineData[17]++;
    this.root = this;
  }
  _$jscoverage['/runtime/scope.js'].lineData[20]++;
  Scope.prototype = {
  isScope: 1, 
  setParent: function(parentScope) {
  _$jscoverage['/runtime/scope.js'].functionData[2]++;
  _$jscoverage['/runtime/scope.js'].lineData[24]++;
  this.parent = parentScope;
  _$jscoverage['/runtime/scope.js'].lineData[25]++;
  this.root = parentScope.root;
}, 
  set: function(name, value) {
  _$jscoverage['/runtime/scope.js'].functionData[3]++;
  _$jscoverage['/runtime/scope.js'].lineData[30]++;
  if (visit34_30_1(!this.affix)) {
    _$jscoverage['/runtime/scope.js'].lineData[31]++;
    this.affix = {};
  }
  _$jscoverage['/runtime/scope.js'].lineData[33]++;
  this.affix[name] = value;
}, 
  setData: function(data) {
  _$jscoverage['/runtime/scope.js'].functionData[4]++;
  _$jscoverage['/runtime/scope.js'].lineData[37]++;
  this.data = data;
}, 
  getData: function() {
  _$jscoverage['/runtime/scope.js'].functionData[5]++;
  _$jscoverage['/runtime/scope.js'].lineData[41]++;
  return this.data;
}, 
  mix: function(v) {
  _$jscoverage['/runtime/scope.js'].functionData[6]++;
  _$jscoverage['/runtime/scope.js'].lineData[45]++;
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[46]++;
  if (visit35_46_1(!affix)) {
    _$jscoverage['/runtime/scope.js'].lineData[47]++;
    affix = this.affix = {};
  }
  _$jscoverage['/runtime/scope.js'].lineData[49]++;
  for (var name in v) {
    _$jscoverage['/runtime/scope.js'].lineData[50]++;
    affix[name] = v[name];
  }
}, 
  get: function(name) {
  _$jscoverage['/runtime/scope.js'].functionData[7]++;
  _$jscoverage['/runtime/scope.js'].lineData[55]++;
  var data = this.data;
  _$jscoverage['/runtime/scope.js'].lineData[56]++;
  var v;
  _$jscoverage['/runtime/scope.js'].lineData[57]++;
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[59]++;
  v = visit36_59_1(affix && affix[name]);
  _$jscoverage['/runtime/scope.js'].lineData[61]++;
  if (visit37_61_1(v !== undef)) {
    _$jscoverage['/runtime/scope.js'].lineData[62]++;
    return v;
  }
  _$jscoverage['/runtime/scope.js'].lineData[65]++;
  if (visit38_65_1(data !== undef)) {
    _$jscoverage['/runtime/scope.js'].lineData[66]++;
    v = data[name];
  }
  _$jscoverage['/runtime/scope.js'].lineData[69]++;
  if (visit39_69_1(v !== undef)) {
    _$jscoverage['/runtime/scope.js'].lineData[70]++;
    return v;
  }
  _$jscoverage['/runtime/scope.js'].lineData[73]++;
  if (visit40_73_1(name === 'this')) {
    _$jscoverage['/runtime/scope.js'].lineData[74]++;
    return data;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[75]++;
    if (visit41_75_1(name === 'root')) {
      _$jscoverage['/runtime/scope.js'].lineData[76]++;
      return this.root.data;
    }
  }
  _$jscoverage['/runtime/scope.js'].lineData[79]++;
  return v;
}, 
  resolve: function(parts, depth) {
  _$jscoverage['/runtime/scope.js'].functionData[8]++;
  _$jscoverage['/runtime/scope.js'].lineData[83]++;
  var self = this;
  _$jscoverage['/runtime/scope.js'].lineData[85]++;
  if (visit42_85_1(!depth && visit43_85_2(parts.length === 1))) {
    _$jscoverage['/runtime/scope.js'].lineData[86]++;
    return self.get(parts[0]);
  }
  _$jscoverage['/runtime/scope.js'].lineData[89]++;
  var len = parts.length, scope = self, i, v;
  _$jscoverage['/runtime/scope.js'].lineData[94]++;
  if (visit44_94_1(len && visit45_94_2(parts[0] === 'root'))) {
    _$jscoverage['/runtime/scope.js'].lineData[95]++;
    parts.shift();
    _$jscoverage['/runtime/scope.js'].lineData[96]++;
    scope = scope.root;
    _$jscoverage['/runtime/scope.js'].lineData[97]++;
    len--;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[98]++;
    if (visit46_98_1(depth)) {
      _$jscoverage['/runtime/scope.js'].lineData[99]++;
      while (visit47_99_1(scope && depth--)) {
        _$jscoverage['/runtime/scope.js'].lineData[100]++;
        scope = scope.parent;
      }
    }
  }
  _$jscoverage['/runtime/scope.js'].lineData[104]++;
  if (visit48_104_1(!len)) {
    _$jscoverage['/runtime/scope.js'].lineData[105]++;
    return scope.data;
  }
  _$jscoverage['/runtime/scope.js'].lineData[108]++;
  var part0 = parts[0];
  _$jscoverage['/runtime/scope.js'].lineData[110]++;
  do {
    _$jscoverage['/runtime/scope.js'].lineData[111]++;
    v = scope.get(part0);
  } while (visit49_112_1(visit50_112_2(v === undef) && (scope = scope.parent)));
  _$jscoverage['/runtime/scope.js'].lineData[114]++;
  if (visit51_114_1(v && scope)) {
    _$jscoverage['/runtime/scope.js'].lineData[115]++;
    for (i = 1; visit52_115_1(v && visit53_115_2(i < len)); i++) {
      _$jscoverage['/runtime/scope.js'].lineData[116]++;
      v = v[parts[i]];
    }
    _$jscoverage['/runtime/scope.js'].lineData[118]++;
    return v;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[120]++;
    return undef;
  }
}};
  _$jscoverage['/runtime/scope.js'].lineData[125]++;
  return Scope;
});
