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
  _$jscoverage['/runtime/scope.js'].lineData[1] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[2] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[4] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[6] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[7] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[10] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[14] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[15] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[19] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[23] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[28] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[29] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[31] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[35] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[39] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[43] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[44] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[46] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[50] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[51] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[53] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[54] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[57] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[62] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[63] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[65] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[66] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[69] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[70] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[73] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[78] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[79] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[82] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[84] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[88] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[89] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[90] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[91] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[92] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[93] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[97] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[99] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[101] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[102] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[103] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[104] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[105] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[106] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[107] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[108] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[110] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[111] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[112] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[113] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[115] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[118] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[119] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[120] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[122] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[125] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[126] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[127] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[130] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[132] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[134] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[136] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[137] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[140] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[142] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[146] = 0;
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
  _$jscoverage['/runtime/scope.js'].branchData['4'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['4'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['28'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['43'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['53'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['57'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['65'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['69'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['78'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['88'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['91'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['92'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['104'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['106'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['110'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['111'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['118'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['125'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['126'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['130'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['136'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['136'][1] = new BranchData();
}
_$jscoverage['/runtime/scope.js'].branchData['136'][1].init(1314, 12, 'endScopeFind');
function visit40_136_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['130'][1].init(210, 23, 'typeof v === \'function\'');
function visit39_130_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['126'][1].init(26, 14, 'v && v.isScope');
function visit38_126_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['125'][1].init(862, 5, 'valid');
function visit37_125_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['118'][2].init(83, 21, 'typeof v !== \'object\'');
function visit36_118_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['118'][1].init(83, 34, 'typeof v !== \'object\' || !(p in v)');
function visit35_118_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['111'][1].init(30, 13, '!scope.has(p)');
function visit34_111_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['110'][1].init(203, 11, 'v === scope');
function visit33_110_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['106'][1].init(61, 12, 'p === \'this\'');
function visit32_106_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['104'][1].init(86, 7, 'i < len');
function visit31_104_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['92'][1].init(25, 16, 'scope && depth--');
function visit30_92_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['91'][1].init(427, 5, 'depth');
function visit29_91_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['88'][1].init(310, 19, 'parts[0] === \'root\'');
function visit28_88_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['78'][1].init(69, 12, 'name === \'.\'');
function visit27_78_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['69'][2].init(191, 24, 'typeof data === \'object\'');
function visit26_69_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['69'][1].init(191, 42, 'typeof data === \'object\' && (name in data)');
function visit25_69_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['65'][1].init(92, 24, 'affix && (name in affix)');
function visit24_65_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['57'][2].init(187, 24, 'typeof data === \'object\'');
function visit23_57_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['57'][1].init(187, 42, 'typeof data === \'object\' && (name in data)');
function visit22_57_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['53'][1].init(92, 24, 'affix && (name in affix)');
function visit21_53_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['43'][1].init(18, 11, '!this.affix');
function visit20_43_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['28'][1].init(18, 11, '!this.affix');
function visit19_28_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['4'][1].init(37, 10, 'data || {}');
function visit18_4_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['4'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].lineData[1]++;
KISSY.add(function(S) {
  _$jscoverage['/runtime/scope.js'].functionData[0]++;
  _$jscoverage['/runtime/scope.js'].lineData[2]++;
  function Scope(data, affix) {
    _$jscoverage['/runtime/scope.js'].functionData[1]++;
    _$jscoverage['/runtime/scope.js'].lineData[4]++;
    this.data = visit18_4_1(data || {});
    _$jscoverage['/runtime/scope.js'].lineData[6]++;
    this.affix = affix;
    _$jscoverage['/runtime/scope.js'].lineData[7]++;
    this.root = this;
  }
  _$jscoverage['/runtime/scope.js'].lineData[10]++;
  Scope.prototype = {
  isScope: 1, 
  setParent: function(parentScope) {
  _$jscoverage['/runtime/scope.js'].functionData[2]++;
  _$jscoverage['/runtime/scope.js'].lineData[14]++;
  this.parent = parentScope;
  _$jscoverage['/runtime/scope.js'].lineData[15]++;
  this.root = parentScope.root;
}, 
  'getParent': function() {
  _$jscoverage['/runtime/scope.js'].functionData[3]++;
  _$jscoverage['/runtime/scope.js'].lineData[19]++;
  return this.parent;
}, 
  'getRoot': function() {
  _$jscoverage['/runtime/scope.js'].functionData[4]++;
  _$jscoverage['/runtime/scope.js'].lineData[23]++;
  return this.root;
}, 
  set: function(name, value) {
  _$jscoverage['/runtime/scope.js'].functionData[5]++;
  _$jscoverage['/runtime/scope.js'].lineData[28]++;
  if (visit19_28_1(!this.affix)) {
    _$jscoverage['/runtime/scope.js'].lineData[29]++;
    this.affix = {};
  }
  _$jscoverage['/runtime/scope.js'].lineData[31]++;
  this.affix[name] = value;
}, 
  setData: function(data) {
  _$jscoverage['/runtime/scope.js'].functionData[6]++;
  _$jscoverage['/runtime/scope.js'].lineData[35]++;
  this.data = data;
}, 
  getData: function() {
  _$jscoverage['/runtime/scope.js'].functionData[7]++;
  _$jscoverage['/runtime/scope.js'].lineData[39]++;
  return this.data;
}, 
  mix: function(v) {
  _$jscoverage['/runtime/scope.js'].functionData[8]++;
  _$jscoverage['/runtime/scope.js'].lineData[43]++;
  if (visit20_43_1(!this.affix)) {
    _$jscoverage['/runtime/scope.js'].lineData[44]++;
    this.affix = {};
  }
  _$jscoverage['/runtime/scope.js'].lineData[46]++;
  S.mix(this.affix, v);
}, 
  has: function(name) {
  _$jscoverage['/runtime/scope.js'].functionData[9]++;
  _$jscoverage['/runtime/scope.js'].lineData[50]++;
  var data = this.data;
  _$jscoverage['/runtime/scope.js'].lineData[51]++;
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[53]++;
  if (visit21_53_1(affix && (name in affix))) {
    _$jscoverage['/runtime/scope.js'].lineData[54]++;
    return true;
  }
  _$jscoverage['/runtime/scope.js'].lineData[57]++;
  return visit22_57_1(visit23_57_2(typeof data === 'object') && (name in data));
}, 
  get: function(name) {
  _$jscoverage['/runtime/scope.js'].functionData[10]++;
  _$jscoverage['/runtime/scope.js'].lineData[62]++;
  var data = this.data;
  _$jscoverage['/runtime/scope.js'].lineData[63]++;
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[65]++;
  if (visit24_65_1(affix && (name in affix))) {
    _$jscoverage['/runtime/scope.js'].lineData[66]++;
    return affix[name];
  }
  _$jscoverage['/runtime/scope.js'].lineData[69]++;
  if (visit25_69_1(visit26_69_2(typeof data === 'object') && (name in data))) {
    _$jscoverage['/runtime/scope.js'].lineData[70]++;
    return data[name];
  }
  _$jscoverage['/runtime/scope.js'].lineData[73]++;
  return undefined;
}, 
  resolve: function(name, depth) {
  _$jscoverage['/runtime/scope.js'].functionData[11]++;
  _$jscoverage['/runtime/scope.js'].lineData[78]++;
  if (visit27_78_1(name === '.')) {
    _$jscoverage['/runtime/scope.js'].lineData[79]++;
    name = 'this';
  }
  _$jscoverage['/runtime/scope.js'].lineData[82]++;
  var parts = name.split('.');
  _$jscoverage['/runtime/scope.js'].lineData[84]++;
  var scope = this, len, i, v, p, valid;
  _$jscoverage['/runtime/scope.js'].lineData[88]++;
  if (visit28_88_1(parts[0] === 'root')) {
    _$jscoverage['/runtime/scope.js'].lineData[89]++;
    parts.shift();
    _$jscoverage['/runtime/scope.js'].lineData[90]++;
    scope = scope.root;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[91]++;
    if (visit29_91_1(depth)) {
      _$jscoverage['/runtime/scope.js'].lineData[92]++;
      while (visit30_92_1(scope && depth--)) {
        _$jscoverage['/runtime/scope.js'].lineData[93]++;
        scope = scope.parent;
      }
    }
  }
  _$jscoverage['/runtime/scope.js'].lineData[97]++;
  var endScopeFind = 0;
  _$jscoverage['/runtime/scope.js'].lineData[99]++;
  len = parts.length;
  _$jscoverage['/runtime/scope.js'].lineData[101]++;
  while (scope) {
    _$jscoverage['/runtime/scope.js'].lineData[102]++;
    valid = 1;
    _$jscoverage['/runtime/scope.js'].lineData[103]++;
    v = scope;
    _$jscoverage['/runtime/scope.js'].lineData[104]++;
    for (i = 0; visit31_104_1(i < len); i++) {
      _$jscoverage['/runtime/scope.js'].lineData[105]++;
      p = parts[i];
      _$jscoverage['/runtime/scope.js'].lineData[106]++;
      if (visit32_106_1(p === 'this')) {
        _$jscoverage['/runtime/scope.js'].lineData[107]++;
        endScopeFind = 1;
        _$jscoverage['/runtime/scope.js'].lineData[108]++;
        continue;
      }
      _$jscoverage['/runtime/scope.js'].lineData[110]++;
      if (visit33_110_1(v === scope)) {
        _$jscoverage['/runtime/scope.js'].lineData[111]++;
        if (visit34_111_1(!scope.has(p))) {
          _$jscoverage['/runtime/scope.js'].lineData[112]++;
          valid = 0;
          _$jscoverage['/runtime/scope.js'].lineData[113]++;
          break;
        }
        _$jscoverage['/runtime/scope.js'].lineData[115]++;
        v = scope.get(p);
      } else {
        _$jscoverage['/runtime/scope.js'].lineData[118]++;
        if (visit35_118_1(visit36_118_2(typeof v !== 'object') || !(p in v))) {
          _$jscoverage['/runtime/scope.js'].lineData[119]++;
          valid = 0;
          _$jscoverage['/runtime/scope.js'].lineData[120]++;
          break;
        }
        _$jscoverage['/runtime/scope.js'].lineData[122]++;
        v = v[p];
      }
    }
    _$jscoverage['/runtime/scope.js'].lineData[125]++;
    if (visit37_125_1(valid)) {
      _$jscoverage['/runtime/scope.js'].lineData[126]++;
      if (visit38_126_1(v && v.isScope)) {
        _$jscoverage['/runtime/scope.js'].lineData[127]++;
        v = v.data;
      }
      _$jscoverage['/runtime/scope.js'].lineData[130]++;
      if (visit39_130_1(typeof v === 'function')) {
        _$jscoverage['/runtime/scope.js'].lineData[132]++;
        v = v.call(this.data);
      }
      _$jscoverage['/runtime/scope.js'].lineData[134]++;
      return [v];
    }
    _$jscoverage['/runtime/scope.js'].lineData[136]++;
    if (visit40_136_1(endScopeFind)) {
      _$jscoverage['/runtime/scope.js'].lineData[137]++;
      break;
    }
    _$jscoverage['/runtime/scope.js'].lineData[140]++;
    scope = scope.parent;
  }
  _$jscoverage['/runtime/scope.js'].lineData[142]++;
  return false;
}};
  _$jscoverage['/runtime/scope.js'].lineData[146]++;
  return Scope;
});
