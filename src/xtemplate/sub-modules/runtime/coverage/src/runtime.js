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
if (! _$jscoverage['/runtime.js']) {
  _$jscoverage['/runtime.js'] = {};
  _$jscoverage['/runtime.js'].lineData = [];
  _$jscoverage['/runtime.js'].lineData[6] = 0;
  _$jscoverage['/runtime.js'].lineData[7] = 0;
  _$jscoverage['/runtime.js'].lineData[8] = 0;
  _$jscoverage['/runtime.js'].lineData[9] = 0;
  _$jscoverage['/runtime.js'].lineData[10] = 0;
  _$jscoverage['/runtime.js'].lineData[11] = 0;
  _$jscoverage['/runtime.js'].lineData[12] = 0;
  _$jscoverage['/runtime.js'].lineData[13] = 0;
  _$jscoverage['/runtime.js'].lineData[14] = 0;
  _$jscoverage['/runtime.js'].lineData[17] = 0;
  _$jscoverage['/runtime.js'].lineData[20] = 0;
  _$jscoverage['/runtime.js'].lineData[22] = 0;
  _$jscoverage['/runtime.js'].lineData[23] = 0;
  _$jscoverage['/runtime.js'].lineData[24] = 0;
  _$jscoverage['/runtime.js'].lineData[25] = 0;
  _$jscoverage['/runtime.js'].lineData[26] = 0;
  _$jscoverage['/runtime.js'].lineData[27] = 0;
  _$jscoverage['/runtime.js'].lineData[28] = 0;
  _$jscoverage['/runtime.js'].lineData[29] = 0;
  _$jscoverage['/runtime.js'].lineData[30] = 0;
  _$jscoverage['/runtime.js'].lineData[31] = 0;
  _$jscoverage['/runtime.js'].lineData[33] = 0;
  _$jscoverage['/runtime.js'].lineData[35] = 0;
  _$jscoverage['/runtime.js'].lineData[36] = 0;
  _$jscoverage['/runtime.js'].lineData[37] = 0;
  _$jscoverage['/runtime.js'].lineData[39] = 0;
  _$jscoverage['/runtime.js'].lineData[40] = 0;
  _$jscoverage['/runtime.js'].lineData[42] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[45] = 0;
  _$jscoverage['/runtime.js'].lineData[48] = 0;
  _$jscoverage['/runtime.js'].lineData[49] = 0;
  _$jscoverage['/runtime.js'].lineData[50] = 0;
  _$jscoverage['/runtime.js'].lineData[52] = 0;
  _$jscoverage['/runtime.js'].lineData[54] = 0;
  _$jscoverage['/runtime.js'].lineData[58] = 0;
  _$jscoverage['/runtime.js'].lineData[59] = 0;
  _$jscoverage['/runtime.js'].lineData[60] = 0;
  _$jscoverage['/runtime.js'].lineData[61] = 0;
  _$jscoverage['/runtime.js'].lineData[62] = 0;
  _$jscoverage['/runtime.js'].lineData[63] = 0;
  _$jscoverage['/runtime.js'].lineData[64] = 0;
  _$jscoverage['/runtime.js'].lineData[65] = 0;
  _$jscoverage['/runtime.js'].lineData[67] = 0;
  _$jscoverage['/runtime.js'].lineData[68] = 0;
  _$jscoverage['/runtime.js'].lineData[72] = 0;
  _$jscoverage['/runtime.js'].lineData[73] = 0;
  _$jscoverage['/runtime.js'].lineData[74] = 0;
  _$jscoverage['/runtime.js'].lineData[77] = 0;
  _$jscoverage['/runtime.js'].lineData[79] = 0;
  _$jscoverage['/runtime.js'].lineData[82] = 0;
  _$jscoverage['/runtime.js'].lineData[87] = 0;
  _$jscoverage['/runtime.js'].lineData[88] = 0;
  _$jscoverage['/runtime.js'].lineData[90] = 0;
  _$jscoverage['/runtime.js'].lineData[91] = 0;
  _$jscoverage['/runtime.js'].lineData[99] = 0;
  _$jscoverage['/runtime.js'].lineData[100] = 0;
  _$jscoverage['/runtime.js'].lineData[101] = 0;
  _$jscoverage['/runtime.js'].lineData[102] = 0;
  _$jscoverage['/runtime.js'].lineData[104] = 0;
  _$jscoverage['/runtime.js'].lineData[105] = 0;
  _$jscoverage['/runtime.js'].lineData[106] = 0;
  _$jscoverage['/runtime.js'].lineData[107] = 0;
  _$jscoverage['/runtime.js'].lineData[108] = 0;
  _$jscoverage['/runtime.js'].lineData[109] = 0;
  _$jscoverage['/runtime.js'].lineData[110] = 0;
  _$jscoverage['/runtime.js'].lineData[113] = 0;
  _$jscoverage['/runtime.js'].lineData[114] = 0;
  _$jscoverage['/runtime.js'].lineData[115] = 0;
  _$jscoverage['/runtime.js'].lineData[117] = 0;
  _$jscoverage['/runtime.js'].lineData[119] = 0;
  _$jscoverage['/runtime.js'].lineData[121] = 0;
  _$jscoverage['/runtime.js'].lineData[122] = 0;
  _$jscoverage['/runtime.js'].lineData[124] = 0;
  _$jscoverage['/runtime.js'].lineData[127] = 0;
  _$jscoverage['/runtime.js'].lineData[171] = 0;
  _$jscoverage['/runtime.js'].lineData[172] = 0;
  _$jscoverage['/runtime.js'].lineData[173] = 0;
  _$jscoverage['/runtime.js'].lineData[175] = 0;
  _$jscoverage['/runtime.js'].lineData[188] = 0;
  _$jscoverage['/runtime.js'].lineData[189] = 0;
  _$jscoverage['/runtime.js'].lineData[190] = 0;
  _$jscoverage['/runtime.js'].lineData[191] = 0;
  _$jscoverage['/runtime.js'].lineData[192] = 0;
  _$jscoverage['/runtime.js'].lineData[193] = 0;
  _$jscoverage['/runtime.js'].lineData[194] = 0;
  _$jscoverage['/runtime.js'].lineData[195] = 0;
  _$jscoverage['/runtime.js'].lineData[198] = 0;
  _$jscoverage['/runtime.js'].lineData[212] = 0;
  _$jscoverage['/runtime.js'].lineData[223] = 0;
  _$jscoverage['/runtime.js'].lineData[227] = 0;
  _$jscoverage['/runtime.js'].lineData[232] = 0;
  _$jscoverage['/runtime.js'].lineData[240] = 0;
  _$jscoverage['/runtime.js'].lineData[249] = 0;
  _$jscoverage['/runtime.js'].lineData[259] = 0;
  _$jscoverage['/runtime.js'].lineData[260] = 0;
  _$jscoverage['/runtime.js'].lineData[262] = 0;
  _$jscoverage['/runtime.js'].lineData[266] = 0;
}
if (! _$jscoverage['/runtime.js'].functionData) {
  _$jscoverage['/runtime.js'].functionData = [];
  _$jscoverage['/runtime.js'].functionData[0] = 0;
  _$jscoverage['/runtime.js'].functionData[1] = 0;
  _$jscoverage['/runtime.js'].functionData[2] = 0;
  _$jscoverage['/runtime.js'].functionData[3] = 0;
  _$jscoverage['/runtime.js'].functionData[4] = 0;
  _$jscoverage['/runtime.js'].functionData[5] = 0;
  _$jscoverage['/runtime.js'].functionData[6] = 0;
  _$jscoverage['/runtime.js'].functionData[7] = 0;
  _$jscoverage['/runtime.js'].functionData[8] = 0;
  _$jscoverage['/runtime.js'].functionData[9] = 0;
  _$jscoverage['/runtime.js'].functionData[10] = 0;
  _$jscoverage['/runtime.js'].functionData[11] = 0;
  _$jscoverage['/runtime.js'].functionData[12] = 0;
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['11'] = [];
  _$jscoverage['/runtime.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['13'] = [];
  _$jscoverage['/runtime.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['26'] = [];
  _$jscoverage['/runtime.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['27'] = [];
  _$jscoverage['/runtime.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['29'] = [];
  _$jscoverage['/runtime.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['36'] = [];
  _$jscoverage['/runtime.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['39'] = [];
  _$jscoverage['/runtime.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['63'] = [];
  _$jscoverage['/runtime.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['73'] = [];
  _$jscoverage['/runtime.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['87'] = [];
  _$jscoverage['/runtime.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['93'] = [];
  _$jscoverage['/runtime.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['99'] = [];
  _$jscoverage['/runtime.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['104'] = [];
  _$jscoverage['/runtime.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['107'] = [];
  _$jscoverage['/runtime.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['109'] = [];
  _$jscoverage['/runtime.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['113'] = [];
  _$jscoverage['/runtime.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['119'] = [];
  _$jscoverage['/runtime.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['121'] = [];
  _$jscoverage['/runtime.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['172'] = [];
  _$jscoverage['/runtime.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['194'] = [];
  _$jscoverage['/runtime.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['259'] = [];
  _$jscoverage['/runtime.js'].branchData['259'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['259'][1].init(18, 15, '!keepDataFormat');
function visit41_259_1(result) {
  _$jscoverage['/runtime.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['194'][1].init(221, 19, 'config.macros || {}');
function visit40_194_1(result) {
  _$jscoverage['/runtime.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['172'][1].init(72, 4, '!tpl');
function visit39_172_1(result) {
  _$jscoverage['/runtime.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['121'][1].init(115, 22, 'typeof v == \'function\'');
function visit38_121_1(result) {
  _$jscoverage['/runtime.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['119'][1].init(578, 5, 'valid');
function visit37_119_1(result) {
  _$jscoverage['/runtime.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['113'][2].init(239, 20, 'typeof v != \'object\'');
function visit36_113_2(result) {
  _$jscoverage['/runtime.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['113'][1].init(239, 33, 'typeof v != \'object\' || !(p in v)');
function visit35_113_1(result) {
  _$jscoverage['/runtime.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['109'][1].init(69, 12, 'p === \'this\'');
function visit34_109_1(result) {
  _$jscoverage['/runtime.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['107'][1].init(102, 7, 'i < len');
function visit33_107_1(result) {
  _$jscoverage['/runtime.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['104'][1].init(643, 6, 'j < sl');
function visit32_104_1(result) {
  _$jscoverage['/runtime.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['99'][1].init(481, 18, 'parts[0] == \'root\'');
function visit31_99_1(result) {
  _$jscoverage['/runtime.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['93'][1].init(72, 10, 'depth || 0');
function visit30_93_1(result) {
  _$jscoverage['/runtime.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['87'][1].init(77, 13, 'parts === \'.\'');
function visit29_87_1(result) {
  _$jscoverage['/runtime.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['73'][1].init(98, 14, 'tmp2 === false');
function visit28_73_1(result) {
  _$jscoverage['/runtime.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['63'][1].init(268, 8, 'command1');
function visit27_63_1(result) {
  _$jscoverage['/runtime.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['39'][1].init(595, 27, 'typeof property == \'object\'');
function visit26_39_1(result) {
  _$jscoverage['/runtime.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['36'][1].init(456, 19, 'S.isArray(property)');
function visit25_36_1(result) {
  _$jscoverage['/runtime.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['29'][1].init(103, 18, 'property === false');
function visit24_29_1(result) {
  _$jscoverage['/runtime.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['27'][1].init(26, 32, '!options.params && !options.hash');
function visit23_27_1(result) {
  _$jscoverage['/runtime.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['26'][1].init(241, 8, '!command');
function visit22_26_1(result) {
  _$jscoverage['/runtime.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['13'][1].init(52, 4, '!cmd');
function visit21_13_1(result) {
  _$jscoverage['/runtime.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['11'][1].init(126, 7, 'i < len');
function visit20_11_1(result) {
  _$jscoverage['/runtime.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].lineData[6]++;
KISSY.add('xtemplate/runtime', function(S, commands) {
  _$jscoverage['/runtime.js'].functionData[0]++;
  _$jscoverage['/runtime.js'].lineData[7]++;
  function findCommand(commands, name) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[8]++;
    var parts = name.split('.');
    _$jscoverage['/runtime.js'].lineData[9]++;
    var cmd = commands;
    _$jscoverage['/runtime.js'].lineData[10]++;
    var len = parts.length;
    _$jscoverage['/runtime.js'].lineData[11]++;
    for (var i = 0; visit20_11_1(i < len); i++) {
      _$jscoverage['/runtime.js'].lineData[12]++;
      cmd = cmd[parts[i]];
      _$jscoverage['/runtime.js'].lineData[13]++;
      if (visit21_13_1(!cmd)) {
        _$jscoverage['/runtime.js'].lineData[14]++;
        break;
      }
    }
    _$jscoverage['/runtime.js'].lineData[17]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[20]++;
  var utils = {
  'runBlockCommand': function(engine, scopes, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[2]++;
  _$jscoverage['/runtime.js'].lineData[22]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[23]++;
  var logFn = S[config.silent ? 'log' : 'error'];
  _$jscoverage['/runtime.js'].lineData[24]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[25]++;
  var command = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[26]++;
  if (visit22_26_1(!command)) {
    _$jscoverage['/runtime.js'].lineData[27]++;
    if (visit23_27_1(!options.params && !options.hash)) {
      _$jscoverage['/runtime.js'].lineData[28]++;
      var property = utils.getProperty(name, scopes);
      _$jscoverage['/runtime.js'].lineData[29]++;
      if (visit24_29_1(property === false)) {
        _$jscoverage['/runtime.js'].lineData[30]++;
        logFn("can not find property: '" + name + "' at line " + line);
        _$jscoverage['/runtime.js'].lineData[31]++;
        property = '';
      } else {
        _$jscoverage['/runtime.js'].lineData[33]++;
        property = property[0];
      }
      _$jscoverage['/runtime.js'].lineData[35]++;
      command = commands['if'];
      _$jscoverage['/runtime.js'].lineData[36]++;
      if (visit25_36_1(S.isArray(property))) {
        _$jscoverage['/runtime.js'].lineData[37]++;
        command = commands.each;
      } else {
        _$jscoverage['/runtime.js'].lineData[39]++;
        if (visit26_39_1(typeof property == 'object')) {
          _$jscoverage['/runtime.js'].lineData[40]++;
          command = commands['with'];
        }
      }
      _$jscoverage['/runtime.js'].lineData[42]++;
      options.params = [property];
    } else {
      _$jscoverage['/runtime.js'].lineData[44]++;
      S.error("can not find command module: " + name + "' at line " + line);
      _$jscoverage['/runtime.js'].lineData[45]++;
      return '';
    }
  }
  _$jscoverage['/runtime.js'].lineData[48]++;
  var ret = '';
  _$jscoverage['/runtime.js'].lineData[49]++;
  try {
    _$jscoverage['/runtime.js'].lineData[50]++;
    ret = command.call(engine, scopes, options);
  }  catch (e) {
  _$jscoverage['/runtime.js'].lineData[52]++;
  S.error(e.message + ": '" + name + "' at line " + line);
}
  _$jscoverage['/runtime.js'].lineData[54]++;
  return ret;
}, 
  'getPropertyOrRunCommand': function(engine, scopes, options, name, depth, line) {
  _$jscoverage['/runtime.js'].functionData[3]++;
  _$jscoverage['/runtime.js'].lineData[58]++;
  var id0;
  _$jscoverage['/runtime.js'].lineData[59]++;
  var config = engine.config;
  _$jscoverage['/runtime.js'].lineData[60]++;
  var commands = config.commands;
  _$jscoverage['/runtime.js'].lineData[61]++;
  var command1 = findCommand(commands, name);
  _$jscoverage['/runtime.js'].lineData[62]++;
  var logFn = S[config.silent ? 'log' : 'error'];
  _$jscoverage['/runtime.js'].lineData[63]++;
  if (visit27_63_1(command1)) {
    _$jscoverage['/runtime.js'].lineData[64]++;
    try {
      _$jscoverage['/runtime.js'].lineData[65]++;
      id0 = command1.call(engine, scopes, options);
    }    catch (e) {
  _$jscoverage['/runtime.js'].lineData[67]++;
  S.error(e.message + ": '" + name + "' at line " + line);
  _$jscoverage['/runtime.js'].lineData[68]++;
  return '';
}
  } else {
    _$jscoverage['/runtime.js'].lineData[72]++;
    var tmp2 = utils.getProperty(name, scopes, depth);
    _$jscoverage['/runtime.js'].lineData[73]++;
    if (visit28_73_1(tmp2 === false)) {
      _$jscoverage['/runtime.js'].lineData[74]++;
      logFn("can not find property: '" + name + "' at line " + line, "warn");
      _$jscoverage['/runtime.js'].lineData[77]++;
      return undefined;
    } else {
      _$jscoverage['/runtime.js'].lineData[79]++;
      id0 = tmp2[0];
    }
  }
  _$jscoverage['/runtime.js'].lineData[82]++;
  return id0;
}, 
  'getProperty': function(parts, scopes, depth) {
  _$jscoverage['/runtime.js'].functionData[4]++;
  _$jscoverage['/runtime.js'].lineData[87]++;
  if (visit29_87_1(parts === '.')) {
    _$jscoverage['/runtime.js'].lineData[88]++;
    parts = 'this';
  }
  _$jscoverage['/runtime.js'].lineData[90]++;
  parts = parts.split('.');
  _$jscoverage['/runtime.js'].lineData[91]++;
  var len = parts.length, i, j = visit30_93_1(depth || 0), v, p, valid, sl = scopes.length;
  _$jscoverage['/runtime.js'].lineData[99]++;
  if (visit31_99_1(parts[0] == 'root')) {
    _$jscoverage['/runtime.js'].lineData[100]++;
    j = sl - 1;
    _$jscoverage['/runtime.js'].lineData[101]++;
    parts.shift();
    _$jscoverage['/runtime.js'].lineData[102]++;
    len--;
  }
  _$jscoverage['/runtime.js'].lineData[104]++;
  for (; visit32_104_1(j < sl); j++) {
    _$jscoverage['/runtime.js'].lineData[105]++;
    v = scopes[j];
    _$jscoverage['/runtime.js'].lineData[106]++;
    valid = 1;
    _$jscoverage['/runtime.js'].lineData[107]++;
    for (i = 0; visit33_107_1(i < len); i++) {
      _$jscoverage['/runtime.js'].lineData[108]++;
      p = parts[i];
      _$jscoverage['/runtime.js'].lineData[109]++;
      if (visit34_109_1(p === 'this')) {
        _$jscoverage['/runtime.js'].lineData[110]++;
        continue;
      } else {
        _$jscoverage['/runtime.js'].lineData[113]++;
        if (visit35_113_1(visit36_113_2(typeof v != 'object') || !(p in v))) {
          _$jscoverage['/runtime.js'].lineData[114]++;
          valid = 0;
          _$jscoverage['/runtime.js'].lineData[115]++;
          break;
        }
      }
      _$jscoverage['/runtime.js'].lineData[117]++;
      v = v[p];
    }
    _$jscoverage['/runtime.js'].lineData[119]++;
    if (visit37_119_1(valid)) {
      _$jscoverage['/runtime.js'].lineData[121]++;
      if (visit38_121_1(typeof v == 'function')) {
        _$jscoverage['/runtime.js'].lineData[122]++;
        v = v.call(scopes[0]);
      }
      _$jscoverage['/runtime.js'].lineData[124]++;
      return [v];
    }
  }
  _$jscoverage['/runtime.js'].lineData[127]++;
  return false;
}}, defaultConfig = {
  silent: true, 
  name: 'unspecified', 
  escapeHtml: true, 
  loader: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[171]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[172]++;
  if (visit39_172_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[173]++;
    S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[175]++;
  return tpl;
}};
  _$jscoverage['/runtime.js'].lineData[188]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[6]++;
    _$jscoverage['/runtime.js'].lineData[189]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[190]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[191]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/runtime.js'].lineData[192]++;
    config.commands = S.merge(config.commands, commands);
    _$jscoverage['/runtime.js'].lineData[193]++;
    config.utils = utils;
    _$jscoverage['/runtime.js'].lineData[194]++;
    config.macros = visit40_194_1(config.macros || {});
    _$jscoverage['/runtime.js'].lineData[195]++;
    this.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[198]++;
  S.mix(XTemplateRuntime, {
  commands: commands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[212]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[223]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[227]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  invokeEngine: function(tpl, scopes, config) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[232]++;
  return new this.constructor(tpl, config).render(scopes, true);
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[240]++;
  delete this.config.commands[commandName];
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[249]++;
  this.config.commands[commandName] = fn;
}, 
  render: function(data, keepDataFormat) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[259]++;
  if (visit41_259_1(!keepDataFormat)) {
    _$jscoverage['/runtime.js'].lineData[260]++;
    data = [data];
  }
  _$jscoverage['/runtime.js'].lineData[262]++;
  return this.tpl(data);
}};
  _$jscoverage['/runtime.js'].lineData[266]++;
  return XTemplateRuntime;
}, {
  requires: ['./runtime/commands']});
