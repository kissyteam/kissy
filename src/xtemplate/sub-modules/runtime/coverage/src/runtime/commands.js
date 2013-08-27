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
if (! _$jscoverage['/runtime/commands.js']) {
  _$jscoverage['/runtime/commands.js'] = {};
  _$jscoverage['/runtime/commands.js'].lineData = [];
  _$jscoverage['/runtime/commands.js'].lineData[6] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[7] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[9] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[11] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[12] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[13] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[14] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[16] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[18] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[19] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[20] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[21] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[23] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[24] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[28] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[31] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[32] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[33] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[36] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[40] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[41] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[43] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[47] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[48] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[49] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[50] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[51] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[53] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[54] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[55] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[56] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[58] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[62] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[63] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[64] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[65] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[66] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[67] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[69] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[70] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[72] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[77] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[78] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[79] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[80] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[83] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[87] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[89] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[90] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[92] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[93] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[94] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[97] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[98] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[101] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[102] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[103] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[104] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[106] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[109] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[111] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[113] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[115] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[117] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[118] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[122] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[123] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[124] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[125] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[127] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[129] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[130] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[136] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[137] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[138] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[139] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[140] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[141] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[144] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[145] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[147] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[148] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[149] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[151] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[156] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].functionData) {
  _$jscoverage['/runtime/commands.js'].functionData = [];
  _$jscoverage['/runtime/commands.js'].functionData[0] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[1] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[2] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[3] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[4] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[5] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[6] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[7] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[8] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].branchData) {
  _$jscoverage['/runtime/commands.js'].branchData = {};
  _$jscoverage['/runtime/commands.js'].branchData['16'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['19'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['21'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['40'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['51'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['55'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['65'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['66'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['69'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['77'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['78'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['92'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['92'][2] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['101'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['102'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['127'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['129'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['138'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['140'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['140'][1] = new BranchData();
}
_$jscoverage['/runtime/commands.js'].branchData['140'][1].init(77, 6, '!macro');
function visit19_140_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['138'][1].init(109, 6, '!macro');
function visit18_138_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['129'][1].init(82, 18, '!macros[macroName]');
function visit17_129_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['127'][1].init(216, 9, 'config.fn');
function visit16_127_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['102'][1].init(22, 23, 'myName == \'unspecified\'');
function visit15_102_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['101'][1].init(455, 27, 'subTplName.charAt(0) == \'.\'');
function visit14_101_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['92'][2].init(226, 18, 'params.length != 1');
function visit13_92_2(result) {
  _$jscoverage['/runtime/commands.js'].branchData['92'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['92'][1].init(215, 29, '!params || params.length != 1');
function visit12_92_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['78'][1].init(22, 28, 'typeof scopes[i] == \'object\'');
function visit11_78_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['77'][1].init(122, 6, 'i >= 0');
function visit10_77_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['69'][1].init(263, 14, 'config.inverse');
function visit9_69_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['66'][1].init(22, 9, 'config.fn');
function visit8_66_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['65'][1].init(126, 6, 'param0');
function visit7_65_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['55'][1].init(349, 14, 'config.inverse');
function visit6_55_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['51'][1].init(174, 6, 'param0');
function visit5_51_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['40'][1].init(1212, 14, 'config.inverse');
function visit4_40_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['21'][1].init(88, 15, 'xindex < xcount');
function visit3_21_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['19'][1].init(130, 17, 'S.isArray(param0)');
function visit2_19_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['16'][1].init(211, 6, 'param0');
function visit1_16_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].lineData[6]++;
KISSY.add("xtemplate/runtime/commands", function(S) {
  _$jscoverage['/runtime/commands.js'].functionData[0]++;
  _$jscoverage['/runtime/commands.js'].lineData[7]++;
  var commands;
  _$jscoverage['/runtime/commands.js'].lineData[9]++;
  return commands = {
  'each': function(scopes, config) {
  _$jscoverage['/runtime/commands.js'].functionData[1]++;
  _$jscoverage['/runtime/commands.js'].lineData[11]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[12]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[13]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[14]++;
  var xcount;
  _$jscoverage['/runtime/commands.js'].lineData[16]++;
  if (visit1_16_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[18]++;
    var opScopes = [0, 0].concat(scopes);
    _$jscoverage['/runtime/commands.js'].lineData[19]++;
    if (visit2_19_1(S.isArray(param0))) {
      _$jscoverage['/runtime/commands.js'].lineData[20]++;
      xcount = param0.length;
      _$jscoverage['/runtime/commands.js'].lineData[21]++;
      for (var xindex = 0; visit3_21_1(xindex < xcount); xindex++) {
        _$jscoverage['/runtime/commands.js'].lineData[23]++;
        opScopes[0] = param0[xindex];
        _$jscoverage['/runtime/commands.js'].lineData[24]++;
        opScopes[1] = {
  xcount: xcount, 
  xindex: xindex};
        _$jscoverage['/runtime/commands.js'].lineData[28]++;
        buffer += config.fn(opScopes);
      }
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[31]++;
      for (var name in param0) {
        _$jscoverage['/runtime/commands.js'].lineData[32]++;
        opScopes[0] = param0[name];
        _$jscoverage['/runtime/commands.js'].lineData[33]++;
        opScopes[1] = {
  xindex: name};
        _$jscoverage['/runtime/commands.js'].lineData[36]++;
        buffer += config.fn(opScopes);
      }
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[40]++;
    if (visit4_40_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[41]++;
      buffer = config.inverse(scopes);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[43]++;
  return buffer;
}, 
  'with': function(scopes, config) {
  _$jscoverage['/runtime/commands.js'].functionData[2]++;
  _$jscoverage['/runtime/commands.js'].lineData[47]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[48]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[49]++;
  var opScopes = [0].concat(scopes);
  _$jscoverage['/runtime/commands.js'].lineData[50]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[51]++;
  if (visit5_51_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[53]++;
    opScopes[0] = param0;
    _$jscoverage['/runtime/commands.js'].lineData[54]++;
    buffer = config.fn(opScopes);
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[55]++;
    if (visit6_55_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[56]++;
      buffer = config.inverse(scopes);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[58]++;
  return buffer;
}, 
  'if': function(scopes, config) {
  _$jscoverage['/runtime/commands.js'].functionData[3]++;
  _$jscoverage['/runtime/commands.js'].lineData[62]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[63]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[64]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[65]++;
  if (visit7_65_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[66]++;
    if (visit8_66_1(config.fn)) {
      _$jscoverage['/runtime/commands.js'].lineData[67]++;
      buffer = config.fn(scopes);
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[69]++;
    if (visit9_69_1(config.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[70]++;
      buffer = config.inverse(scopes);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[72]++;
  return buffer;
}, 
  'set': function(scopes, config) {
  _$jscoverage['/runtime/commands.js'].functionData[4]++;
  _$jscoverage['/runtime/commands.js'].lineData[77]++;
  for (var i = scopes.length - 1; visit10_77_1(i >= 0); i--) {
    _$jscoverage['/runtime/commands.js'].lineData[78]++;
    if (visit11_78_1(typeof scopes[i] == 'object')) {
      _$jscoverage['/runtime/commands.js'].lineData[79]++;
      S.mix(scopes[i], config.hash);
      _$jscoverage['/runtime/commands.js'].lineData[80]++;
      break;
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[83]++;
  return '';
}, 
  include: function(scopes, config) {
  _$jscoverage['/runtime/commands.js'].functionData[5]++;
  _$jscoverage['/runtime/commands.js'].lineData[87]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[89]++;
  var extra = config.hash ? [config.hash] : [];
  _$jscoverage['/runtime/commands.js'].lineData[90]++;
  scopes = extra.concat(scopes);
  _$jscoverage['/runtime/commands.js'].lineData[92]++;
  if (visit12_92_1(!params || visit13_92_2(params.length != 1))) {
    _$jscoverage['/runtime/commands.js'].lineData[93]++;
    S.error('include must has one param');
    _$jscoverage['/runtime/commands.js'].lineData[94]++;
    return '';
  }
  _$jscoverage['/runtime/commands.js'].lineData[97]++;
  var myName = this.config.name;
  _$jscoverage['/runtime/commands.js'].lineData[98]++;
  var subTplName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[101]++;
  if (visit14_101_1(subTplName.charAt(0) == '.')) {
    _$jscoverage['/runtime/commands.js'].lineData[102]++;
    if (visit15_102_1(myName == 'unspecified')) {
      _$jscoverage['/runtime/commands.js'].lineData[103]++;
      S.error('parent template does not have name' + ' for relative sub tpl name: ' + subTplName);
      _$jscoverage['/runtime/commands.js'].lineData[104]++;
      return '';
    }
    _$jscoverage['/runtime/commands.js'].lineData[106]++;
    subTplName = S.Path.resolve(myName, '../', subTplName);
  }
  _$jscoverage['/runtime/commands.js'].lineData[109]++;
  var tpl = this.config.loader.call(this, subTplName);
  _$jscoverage['/runtime/commands.js'].lineData[111]++;
  config = S.merge(this.config);
  _$jscoverage['/runtime/commands.js'].lineData[113]++;
  config.name = subTplName;
  _$jscoverage['/runtime/commands.js'].lineData[115]++;
  config.commands = this.config.commands;
  _$jscoverage['/runtime/commands.js'].lineData[117]++;
  config.macros = this.config.macros;
  _$jscoverage['/runtime/commands.js'].lineData[118]++;
  return this.invokeEngine(tpl, scopes, config);
}, 
  'macro': function(scopes, config) {
  _$jscoverage['/runtime/commands.js'].functionData[6]++;
  _$jscoverage['/runtime/commands.js'].lineData[122]++;
  var params = config.params;
  _$jscoverage['/runtime/commands.js'].lineData[123]++;
  var macroName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[124]++;
  var params1 = params.slice(1);
  _$jscoverage['/runtime/commands.js'].lineData[125]++;
  var macros = this.config.macros;
  _$jscoverage['/runtime/commands.js'].lineData[127]++;
  if (visit16_127_1(config.fn)) {
    _$jscoverage['/runtime/commands.js'].lineData[129]++;
    if (visit17_129_1(!macros[macroName])) {
      _$jscoverage['/runtime/commands.js'].lineData[130]++;
      macros[macroName] = {
  paramNames: params1, 
  fn: config.fn};
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[136]++;
    var paramValues = {};
    _$jscoverage['/runtime/commands.js'].lineData[137]++;
    var macro = macros[macroName];
    _$jscoverage['/runtime/commands.js'].lineData[138]++;
    if (visit18_138_1(!macro)) {
      _$jscoverage['/runtime/commands.js'].lineData[139]++;
      macro = S.require(macroName);
      _$jscoverage['/runtime/commands.js'].lineData[140]++;
      if (visit19_140_1(!macro)) {
        _$jscoverage['/runtime/commands.js'].lineData[141]++;
        S.error("can not find macro module:" + name);
      }
    }
    _$jscoverage['/runtime/commands.js'].lineData[144]++;
    S.each(macro.paramNames, function(p, i) {
  _$jscoverage['/runtime/commands.js'].functionData[7]++;
  _$jscoverage['/runtime/commands.js'].lineData[145]++;
  paramValues[p] = params1[i];
});
    _$jscoverage['/runtime/commands.js'].lineData[147]++;
    var newScopes = scopes.concat();
    _$jscoverage['/runtime/commands.js'].lineData[148]++;
    newScopes.unshift(paramValues);
    _$jscoverage['/runtime/commands.js'].lineData[149]++;
    return macro.fn.call(this, newScopes);
  }
  _$jscoverage['/runtime/commands.js'].lineData[151]++;
  return '';
}, 
  parse: function(scopes, config) {
  _$jscoverage['/runtime/commands.js'].functionData[8]++;
  _$jscoverage['/runtime/commands.js'].lineData[156]++;
  return commands.include.call(this, [], config);
}};
});
