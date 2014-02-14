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
  _$jscoverage['/runtime/scope.js'].lineData[14] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[18] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[19] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[23] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[27] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[32] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[33] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[35] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[39] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[43] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[47] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[48] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[50] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[54] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[55] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[57] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[58] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[61] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[66] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[67] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[69] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[70] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[73] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[74] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[77] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[82] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[83] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[86] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[88] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[92] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[93] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[94] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[95] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[96] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[97] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[101] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[103] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[105] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[106] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[107] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[108] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[109] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[110] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[111] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[112] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[114] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[115] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[116] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[117] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[119] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[122] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[123] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[124] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[126] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[129] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[130] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[131] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[134] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[136] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[138] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[140] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[141] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[144] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[146] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[150] = 0;
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
  _$jscoverage['/runtime/scope.js'].functionData[9] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[10] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[11] = 0;
}
if (! _$jscoverage['/runtime/scope.js'].branchData) {
  _$jscoverage['/runtime/scope.js'].branchData = {};
  _$jscoverage['/runtime/scope.js'].branchData['8'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['32'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['47'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['57'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['61'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['69'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['73'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['73'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['82'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['92'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['95'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['96'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['108'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['110'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['114'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['115'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['122'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['122'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['129'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['130'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['134'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['140'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['140'][1] = new BranchData();
}
_$jscoverage['/runtime/scope.js'].branchData['140'][1].init(1314, 12, 'endScopeFind');
function visit46_140_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['134'][1].init(210, 23, 'typeof v === \'function\'');
function visit45_134_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['130'][1].init(26, 14, 'v && v.isScope');
function visit44_130_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['129'][1].init(862, 5, 'valid');
function visit43_129_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['122'][2].init(83, 21, 'typeof v !== \'object\'');
function visit42_122_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['122'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['122'][1].init(83, 34, 'typeof v !== \'object\' || !(p in v)');
function visit41_122_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['115'][1].init(30, 13, '!scope.has(p)');
function visit40_115_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['114'][1].init(203, 11, 'v === scope');
function visit39_114_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['110'][1].init(61, 12, 'p === \'this\'');
function visit38_110_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['108'][1].init(86, 7, 'i < len');
function visit37_108_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['96'][1].init(25, 16, 'scope && depth--');
function visit36_96_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['95'][1].init(427, 5, 'depth');
function visit35_95_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['92'][1].init(310, 19, 'parts[0] === \'root\'');
function visit34_92_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['82'][1].init(69, 12, 'name === \'.\'');
function visit33_82_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['73'][2].init(191, 24, 'typeof data === \'object\'');
function visit32_73_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['73'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['73'][1].init(191, 42, 'typeof data === \'object\' && (name in data)');
function visit31_73_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['69'][1].init(92, 24, 'affix && (name in affix)');
function visit30_69_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['61'][2].init(187, 24, 'typeof data === \'object\'');
function visit29_61_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['61'][1].init(187, 42, 'typeof data === \'object\' && (name in data)');
function visit28_61_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['57'][1].init(92, 24, 'affix && (name in affix)');
function visit27_57_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['47'][1].init(18, 11, '!this.affix');
function visit26_47_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['32'][1].init(18, 11, '!this.affix');
function visit25_32_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['8'][1].init(37, 10, 'data || {}');
function visit24_8_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].lineData[5]++;
KISSY.add(function(S) {
  _$jscoverage['/runtime/scope.js'].functionData[0]++;
  _$jscoverage['/runtime/scope.js'].lineData[6]++;
  function Scope(data, affix) {
    _$jscoverage['/runtime/scope.js'].functionData[1]++;
    _$jscoverage['/runtime/scope.js'].lineData[8]++;
    this.data = visit24_8_1(data || {});
    _$jscoverage['/runtime/scope.js'].lineData[10]++;
    this.affix = affix;
    _$jscoverage['/runtime/scope.js'].lineData[11]++;
    this.root = this;
  }
  _$jscoverage['/runtime/scope.js'].lineData[14]++;
  Scope.prototype = {
  isScope: 1, 
  setParent: function(parentScope) {
  _$jscoverage['/runtime/scope.js'].functionData[2]++;
  _$jscoverage['/runtime/scope.js'].lineData[18]++;
  this.parent = parentScope;
  _$jscoverage['/runtime/scope.js'].lineData[19]++;
  this.root = parentScope.root;
}, 
  'getParent': function() {
  _$jscoverage['/runtime/scope.js'].functionData[3]++;
  _$jscoverage['/runtime/scope.js'].lineData[23]++;
  return this.parent;
}, 
  'getRoot': function() {
  _$jscoverage['/runtime/scope.js'].functionData[4]++;
  _$jscoverage['/runtime/scope.js'].lineData[27]++;
  return this.root;
}, 
  set: function(name, value) {
  _$jscoverage['/runtime/scope.js'].functionData[5]++;
  _$jscoverage['/runtime/scope.js'].lineData[32]++;
  if (visit25_32_1(!this.affix)) {
    _$jscoverage['/runtime/scope.js'].lineData[33]++;
    this.affix = {};
  }
  _$jscoverage['/runtime/scope.js'].lineData[35]++;
  this.affix[name] = value;
}, 
  setData: function(data) {
  _$jscoverage['/runtime/scope.js'].functionData[6]++;
  _$jscoverage['/runtime/scope.js'].lineData[39]++;
  this.data = data;
}, 
  getData: function() {
  _$jscoverage['/runtime/scope.js'].functionData[7]++;
  _$jscoverage['/runtime/scope.js'].lineData[43]++;
  return this.data;
}, 
  mix: function(v) {
  _$jscoverage['/runtime/scope.js'].functionData[8]++;
  _$jscoverage['/runtime/scope.js'].lineData[47]++;
  if (visit26_47_1(!this.affix)) {
    _$jscoverage['/runtime/scope.js'].lineData[48]++;
    this.affix = {};
  }
  _$jscoverage['/runtime/scope.js'].lineData[50]++;
  S.mix(this.affix, v);
}, 
  has: function(name) {
  _$jscoverage['/runtime/scope.js'].functionData[9]++;
  _$jscoverage['/runtime/scope.js'].lineData[54]++;
  var data = this.data;
  _$jscoverage['/runtime/scope.js'].lineData[55]++;
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[57]++;
  if (visit27_57_1(affix && (name in affix))) {
    _$jscoverage['/runtime/scope.js'].lineData[58]++;
    return true;
  }
  _$jscoverage['/runtime/scope.js'].lineData[61]++;
  return visit28_61_1(visit29_61_2(typeof data === 'object') && (name in data));
}, 
  get: function(name) {
  _$jscoverage['/runtime/scope.js'].functionData[10]++;
  _$jscoverage['/runtime/scope.js'].lineData[66]++;
  var data = this.data;
  _$jscoverage['/runtime/scope.js'].lineData[67]++;
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[69]++;
  if (visit30_69_1(affix && (name in affix))) {
    _$jscoverage['/runtime/scope.js'].lineData[70]++;
    return affix[name];
  }
  _$jscoverage['/runtime/scope.js'].lineData[73]++;
  if (visit31_73_1(visit32_73_2(typeof data === 'object') && (name in data))) {
    _$jscoverage['/runtime/scope.js'].lineData[74]++;
    return data[name];
  }
  _$jscoverage['/runtime/scope.js'].lineData[77]++;
  return undefined;
}, 
  resolve: function(name, depth) {
  _$jscoverage['/runtime/scope.js'].functionData[11]++;
  _$jscoverage['/runtime/scope.js'].lineData[82]++;
  if (visit33_82_1(name === '.')) {
    _$jscoverage['/runtime/scope.js'].lineData[83]++;
    name = 'this';
  }
  _$jscoverage['/runtime/scope.js'].lineData[86]++;
  var parts = name.split('.');
  _$jscoverage['/runtime/scope.js'].lineData[88]++;
  var scope = this, len, i, v, p, valid;
  _$jscoverage['/runtime/scope.js'].lineData[92]++;
  if (visit34_92_1(parts[0] === 'root')) {
    _$jscoverage['/runtime/scope.js'].lineData[93]++;
    parts.shift();
    _$jscoverage['/runtime/scope.js'].lineData[94]++;
    scope = scope.root;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[95]++;
    if (visit35_95_1(depth)) {
      _$jscoverage['/runtime/scope.js'].lineData[96]++;
      while (visit36_96_1(scope && depth--)) {
        _$jscoverage['/runtime/scope.js'].lineData[97]++;
        scope = scope.parent;
      }
    }
  }
  _$jscoverage['/runtime/scope.js'].lineData[101]++;
  var endScopeFind = 0;
  _$jscoverage['/runtime/scope.js'].lineData[103]++;
  len = parts.length;
  _$jscoverage['/runtime/scope.js'].lineData[105]++;
  while (scope) {
    _$jscoverage['/runtime/scope.js'].lineData[106]++;
    valid = 1;
    _$jscoverage['/runtime/scope.js'].lineData[107]++;
    v = scope;
    _$jscoverage['/runtime/scope.js'].lineData[108]++;
    for (i = 0; visit37_108_1(i < len); i++) {
      _$jscoverage['/runtime/scope.js'].lineData[109]++;
      p = parts[i];
      _$jscoverage['/runtime/scope.js'].lineData[110]++;
      if (visit38_110_1(p === 'this')) {
        _$jscoverage['/runtime/scope.js'].lineData[111]++;
        endScopeFind = 1;
        _$jscoverage['/runtime/scope.js'].lineData[112]++;
        continue;
      }
      _$jscoverage['/runtime/scope.js'].lineData[114]++;
      if (visit39_114_1(v === scope)) {
        _$jscoverage['/runtime/scope.js'].lineData[115]++;
        if (visit40_115_1(!scope.has(p))) {
          _$jscoverage['/runtime/scope.js'].lineData[116]++;
          valid = 0;
          _$jscoverage['/runtime/scope.js'].lineData[117]++;
          break;
        }
        _$jscoverage['/runtime/scope.js'].lineData[119]++;
        v = scope.get(p);
      } else {
        _$jscoverage['/runtime/scope.js'].lineData[122]++;
        if (visit41_122_1(visit42_122_2(typeof v !== 'object') || !(p in v))) {
          _$jscoverage['/runtime/scope.js'].lineData[123]++;
          valid = 0;
          _$jscoverage['/runtime/scope.js'].lineData[124]++;
          break;
        }
        _$jscoverage['/runtime/scope.js'].lineData[126]++;
        v = v[p];
      }
    }
    _$jscoverage['/runtime/scope.js'].lineData[129]++;
    if (visit43_129_1(valid)) {
      _$jscoverage['/runtime/scope.js'].lineData[130]++;
      if (visit44_130_1(v && v.isScope)) {
        _$jscoverage['/runtime/scope.js'].lineData[131]++;
        v = v.data;
      }
      _$jscoverage['/runtime/scope.js'].lineData[134]++;
      if (visit45_134_1(typeof v === 'function')) {
        _$jscoverage['/runtime/scope.js'].lineData[136]++;
        v = v.call(this.data);
      }
      _$jscoverage['/runtime/scope.js'].lineData[138]++;
      return [v];
    }
    _$jscoverage['/runtime/scope.js'].lineData[140]++;
    if (visit46_140_1(endScopeFind)) {
      _$jscoverage['/runtime/scope.js'].lineData[141]++;
      break;
    }
    _$jscoverage['/runtime/scope.js'].lineData[144]++;
    scope = scope.parent;
  }
  _$jscoverage['/runtime/scope.js'].lineData[146]++;
  return false;
}};
  _$jscoverage['/runtime/scope.js'].lineData[150]++;
  return Scope;
});
