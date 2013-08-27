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
if (! _$jscoverage['/json/stringify.js']) {
  _$jscoverage['/json/stringify.js'] = {};
  _$jscoverage['/json/stringify.js'].lineData = [];
  _$jscoverage['/json/stringify.js'].lineData[6] = 0;
  _$jscoverage['/json/stringify.js'].lineData[8] = 0;
  _$jscoverage['/json/stringify.js'].lineData[9] = 0;
  _$jscoverage['/json/stringify.js'].lineData[12] = 0;
  _$jscoverage['/json/stringify.js'].lineData[13] = 0;
  _$jscoverage['/json/stringify.js'].lineData[14] = 0;
  _$jscoverage['/json/stringify.js'].lineData[15] = 0;
  _$jscoverage['/json/stringify.js'].lineData[16] = 0;
  _$jscoverage['/json/stringify.js'].lineData[17] = 0;
  _$jscoverage['/json/stringify.js'].lineData[18] = 0;
  _$jscoverage['/json/stringify.js'].lineData[25] = 0;
  _$jscoverage['/json/stringify.js'].lineData[26] = 0;
  _$jscoverage['/json/stringify.js'].lineData[29] = 0;
  _$jscoverage['/json/stringify.js'].lineData[30] = 0;
  _$jscoverage['/json/stringify.js'].lineData[33] = 0;
  _$jscoverage['/json/stringify.js'].lineData[35] = 0;
  _$jscoverage['/json/stringify.js'].lineData[37] = 0;
  _$jscoverage['/json/stringify.js'].lineData[39] = 0;
  _$jscoverage['/json/stringify.js'].lineData[41] = 0;
  _$jscoverage['/json/stringify.js'].lineData[42] = 0;
  _$jscoverage['/json/stringify.js'].lineData[44] = 0;
  _$jscoverage['/json/stringify.js'].lineData[45] = 0;
  _$jscoverage['/json/stringify.js'].lineData[47] = 0;
  _$jscoverage['/json/stringify.js'].lineData[51] = 0;
  _$jscoverage['/json/stringify.js'].lineData[54] = 0;
  _$jscoverage['/json/stringify.js'].lineData[55] = 0;
  _$jscoverage['/json/stringify.js'].lineData[56] = 0;
  _$jscoverage['/json/stringify.js'].lineData[57] = 0;
  _$jscoverage['/json/stringify.js'].lineData[59] = 0;
  _$jscoverage['/json/stringify.js'].lineData[62] = 0;
  _$jscoverage['/json/stringify.js'].lineData[63] = 0;
  _$jscoverage['/json/stringify.js'].lineData[64] = 0;
  _$jscoverage['/json/stringify.js'].lineData[65] = 0;
  _$jscoverage['/json/stringify.js'].lineData[66] = 0;
  _$jscoverage['/json/stringify.js'].lineData[68] = 0;
  _$jscoverage['/json/stringify.js'].lineData[70] = 0;
  _$jscoverage['/json/stringify.js'].lineData[71] = 0;
  _$jscoverage['/json/stringify.js'].lineData[72] = 0;
  _$jscoverage['/json/stringify.js'].lineData[73] = 0;
  _$jscoverage['/json/stringify.js'].lineData[74] = 0;
  _$jscoverage['/json/stringify.js'].lineData[75] = 0;
  _$jscoverage['/json/stringify.js'].lineData[76] = 0;
  _$jscoverage['/json/stringify.js'].lineData[77] = 0;
  _$jscoverage['/json/stringify.js'].lineData[78] = 0;
  _$jscoverage['/json/stringify.js'].lineData[80] = 0;
  _$jscoverage['/json/stringify.js'].lineData[81] = 0;
  _$jscoverage['/json/stringify.js'].lineData[84] = 0;
  _$jscoverage['/json/stringify.js'].lineData[85] = 0;
  _$jscoverage['/json/stringify.js'].lineData[86] = 0;
  _$jscoverage['/json/stringify.js'].lineData[88] = 0;
  _$jscoverage['/json/stringify.js'].lineData[89] = 0;
  _$jscoverage['/json/stringify.js'].lineData[91] = 0;
  _$jscoverage['/json/stringify.js'].lineData[92] = 0;
  _$jscoverage['/json/stringify.js'].lineData[93] = 0;
  _$jscoverage['/json/stringify.js'].lineData[96] = 0;
  _$jscoverage['/json/stringify.js'].lineData[97] = 0;
  _$jscoverage['/json/stringify.js'].lineData[99] = 0;
  _$jscoverage['/json/stringify.js'].lineData[102] = 0;
  _$jscoverage['/json/stringify.js'].lineData[103] = 0;
  _$jscoverage['/json/stringify.js'].lineData[104] = 0;
  _$jscoverage['/json/stringify.js'].lineData[105] = 0;
  _$jscoverage['/json/stringify.js'].lineData[107] = 0;
  _$jscoverage['/json/stringify.js'].lineData[109] = 0;
  _$jscoverage['/json/stringify.js'].lineData[110] = 0;
  _$jscoverage['/json/stringify.js'].lineData[111] = 0;
  _$jscoverage['/json/stringify.js'].lineData[112] = 0;
  _$jscoverage['/json/stringify.js'].lineData[113] = 0;
  _$jscoverage['/json/stringify.js'].lineData[114] = 0;
  _$jscoverage['/json/stringify.js'].lineData[115] = 0;
  _$jscoverage['/json/stringify.js'].lineData[116] = 0;
  _$jscoverage['/json/stringify.js'].lineData[117] = 0;
  _$jscoverage['/json/stringify.js'].lineData[119] = 0;
  _$jscoverage['/json/stringify.js'].lineData[121] = 0;
  _$jscoverage['/json/stringify.js'].lineData[123] = 0;
  _$jscoverage['/json/stringify.js'].lineData[124] = 0;
  _$jscoverage['/json/stringify.js'].lineData[125] = 0;
  _$jscoverage['/json/stringify.js'].lineData[127] = 0;
  _$jscoverage['/json/stringify.js'].lineData[128] = 0;
  _$jscoverage['/json/stringify.js'].lineData[130] = 0;
  _$jscoverage['/json/stringify.js'].lineData[131] = 0;
  _$jscoverage['/json/stringify.js'].lineData[132] = 0;
  _$jscoverage['/json/stringify.js'].lineData[135] = 0;
  _$jscoverage['/json/stringify.js'].lineData[136] = 0;
  _$jscoverage['/json/stringify.js'].lineData[139] = 0;
  _$jscoverage['/json/stringify.js'].lineData[142] = 0;
  _$jscoverage['/json/stringify.js'].lineData[143] = 0;
  _$jscoverage['/json/stringify.js'].lineData[144] = 0;
  _$jscoverage['/json/stringify.js'].lineData[145] = 0;
  _$jscoverage['/json/stringify.js'].lineData[146] = 0;
  _$jscoverage['/json/stringify.js'].lineData[147] = 0;
  _$jscoverage['/json/stringify.js'].lineData[148] = 0;
  _$jscoverage['/json/stringify.js'].lineData[149] = 0;
  _$jscoverage['/json/stringify.js'].lineData[153] = 0;
  _$jscoverage['/json/stringify.js'].lineData[154] = 0;
  _$jscoverage['/json/stringify.js'].lineData[155] = 0;
  _$jscoverage['/json/stringify.js'].lineData[156] = 0;
  _$jscoverage['/json/stringify.js'].lineData[157] = 0;
  _$jscoverage['/json/stringify.js'].lineData[160] = 0;
  _$jscoverage['/json/stringify.js'].lineData[165] = 0;
}
if (! _$jscoverage['/json/stringify.js'].functionData) {
  _$jscoverage['/json/stringify.js'].functionData = [];
  _$jscoverage['/json/stringify.js'].functionData[0] = 0;
  _$jscoverage['/json/stringify.js'].functionData[1] = 0;
  _$jscoverage['/json/stringify.js'].functionData[2] = 0;
  _$jscoverage['/json/stringify.js'].functionData[3] = 0;
  _$jscoverage['/json/stringify.js'].functionData[4] = 0;
  _$jscoverage['/json/stringify.js'].functionData[5] = 0;
}
if (! _$jscoverage['/json/stringify.js'].branchData) {
  _$jscoverage['/json/stringify.js'].branchData = {};
  _$jscoverage['/json/stringify.js'].branchData['9'] = [];
  _$jscoverage['/json/stringify.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['14'] = [];
  _$jscoverage['/json/stringify.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['14'][2] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['15'] = [];
  _$jscoverage['/json/stringify.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['17'] = [];
  _$jscoverage['/json/stringify.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['25'] = [];
  _$jscoverage['/json/stringify.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['25'][2] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['29'] = [];
  _$jscoverage['/json/stringify.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['41'] = [];
  _$jscoverage['/json/stringify.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['44'] = [];
  _$jscoverage['/json/stringify.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['55'] = [];
  _$jscoverage['/json/stringify.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['56'] = [];
  _$jscoverage['/json/stringify.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['65'] = [];
  _$jscoverage['/json/stringify.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['71'] = [];
  _$jscoverage['/json/stringify.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['74'] = [];
  _$jscoverage['/json/stringify.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['77'] = [];
  _$jscoverage['/json/stringify.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['85'] = [];
  _$jscoverage['/json/stringify.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['88'] = [];
  _$jscoverage['/json/stringify.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['96'] = [];
  _$jscoverage['/json/stringify.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['103'] = [];
  _$jscoverage['/json/stringify.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['104'] = [];
  _$jscoverage['/json/stringify.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['114'] = [];
  _$jscoverage['/json/stringify.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['116'] = [];
  _$jscoverage['/json/stringify.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['124'] = [];
  _$jscoverage['/json/stringify.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['127'] = [];
  _$jscoverage['/json/stringify.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['135'] = [];
  _$jscoverage['/json/stringify.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['145'] = [];
  _$jscoverage['/json/stringify.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['146'] = [];
  _$jscoverage['/json/stringify.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['148'] = [];
  _$jscoverage['/json/stringify.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['153'] = [];
  _$jscoverage['/json/stringify.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['156'] = [];
  _$jscoverage['/json/stringify.js'].branchData['156'][1] = new BranchData();
}
_$jscoverage['/json/stringify.js'].branchData['156'][1].init(463, 25, 'typeof space === \'string\'');
function visit76_156_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['153'][1].init(320, 25, 'typeof space === \'number\'');
function visit75_153_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['148'][1].init(123, 19, 'S.isArray(replacer)');
function visit74_148_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['146'][1].init(18, 30, 'typeof replacer === \'function\'');
function visit73_146_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['145'][1].init(82, 8, 'replacer');
function visit72_145_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['135'][1].init(1092, 9, '\'@DEBUG@\'');
function visit71_135_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['127'][1].init(18, 4, '!gap');
function visit70_127_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['124'][1].init(706, 15, '!partial.length');
function visit69_124_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['116'][1].init(121, 18, 'strP === undefined');
function visit68_116_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['114'][1].init(348, 11, 'index < len');
function visit67_114_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['104'][1].init(18, 23, 'S.inArray(value, stack)');
function visit66_104_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['103'][1].init(14, 9, '\'@DEBUG@\'');
function visit65_103_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['96'][1].init(1330, 9, '\'@DEBUG@\'');
function visit64_96_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['88'][1].init(18, 4, '!gap');
function visit63_88_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['85'][1].init(944, 15, '!partial.length');
function visit62_85_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['77'][1].init(100, 3, 'gap');
function visit61_77_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['74'][1].init(132, 18, 'strP !== undefined');
function visit60_74_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['71'][1].init(474, 6, 'i < kl');
function visit59_71_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['65'][1].init(289, 26, 'propertyList !== undefined');
function visit58_65_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['56'][1].init(18, 23, 'S.inArray(value, stack)');
function visit57_56_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['55'][1].init(14, 9, '\'@DEBUG@\'');
function visit56_55_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['44'][1].init(121, 16, 'S.isArray(value)');
function visit55_44_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['41'][1].init(35, 6, '!value');
function visit54_41_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['29'][1].init(856, 30, 'replacerFunction !== undefined');
function visit53_29_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['25'][2].init(636, 52, 'value instanceof Number || value instanceof Boolean');
function visit52_25_2(result) {
  _$jscoverage['/json/stringify.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['25'][1].init(608, 80, 'value instanceof String || value instanceof Number || value instanceof Boolean');
function visit51_25_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['17'][1].init(125, 21, 'value instanceof Date');
function visit50_17_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['15'][1].init(18, 34, 'typeof value.toJSON === \'function\'');
function visit49_15_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['14'][2].init(57, 25, 'typeof value === \'object\'');
function visit48_14_2(result) {
  _$jscoverage['/json/stringify.js'].branchData['14'][2].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['14'][1].init(48, 34, 'value && typeof value === \'object\'');
function visit47_14_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['9'][1].init(17, 6, 'n < 10');
function visit46_9_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].lineData[6]++;
KISSY.add('json/stringify', function(S, Quote) {
  _$jscoverage['/json/stringify.js'].functionData[0]++;
  _$jscoverage['/json/stringify.js'].lineData[8]++;
  function padding2(n) {
    _$jscoverage['/json/stringify.js'].functionData[1]++;
    _$jscoverage['/json/stringify.js'].lineData[9]++;
    return visit46_9_1(n < 10) ? '0' + n : n;
  }
  _$jscoverage['/json/stringify.js'].lineData[12]++;
  function str(key, holder, replacerFunction, propertyList, gap, stack, indent) {
    _$jscoverage['/json/stringify.js'].functionData[2]++;
    _$jscoverage['/json/stringify.js'].lineData[13]++;
    var value = holder[key];
    _$jscoverage['/json/stringify.js'].lineData[14]++;
    if (visit47_14_1(value && visit48_14_2(typeof value === 'object'))) {
      _$jscoverage['/json/stringify.js'].lineData[15]++;
      if (visit49_15_1(typeof value.toJSON === 'function')) {
        _$jscoverage['/json/stringify.js'].lineData[16]++;
        value = value.toJSON(key);
      } else {
        _$jscoverage['/json/stringify.js'].lineData[17]++;
        if (visit50_17_1(value instanceof Date)) {
          _$jscoverage['/json/stringify.js'].lineData[18]++;
          value = isFinite(value.valueOf()) ? value.getUTCFullYear() + '-' + padding2(value.getUTCMonth() + 1) + '-' + padding2(value.getUTCDate()) + 'T' + padding2(value.getUTCHours()) + ':' + padding2(value.getUTCMinutes()) + ':' + padding2(value.getUTCSeconds()) + 'Z' : null;
        } else {
          _$jscoverage['/json/stringify.js'].lineData[25]++;
          if (visit51_25_1(value instanceof String || visit52_25_2(value instanceof Number || value instanceof Boolean))) {
            _$jscoverage['/json/stringify.js'].lineData[26]++;
            value = value.valueOf();
          }
        }
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[29]++;
    if (visit53_29_1(replacerFunction !== undefined)) {
      _$jscoverage['/json/stringify.js'].lineData[30]++;
      value = replacerFunction.call(holder, key, value);
    }
    _$jscoverage['/json/stringify.js'].lineData[33]++;
    switch (typeof value) {
      case 'number':
        _$jscoverage['/json/stringify.js'].lineData[35]++;
        return isFinite(value) ? String(value) : 'null';
      case 'string':
        _$jscoverage['/json/stringify.js'].lineData[37]++;
        return Quote.quote(value);
      case 'boolean':
        _$jscoverage['/json/stringify.js'].lineData[39]++;
        return String(value);
      case 'object':
        _$jscoverage['/json/stringify.js'].lineData[41]++;
        if (visit54_41_1(!value)) {
          _$jscoverage['/json/stringify.js'].lineData[42]++;
          return 'null';
        }
        _$jscoverage['/json/stringify.js'].lineData[44]++;
        if (visit55_44_1(S.isArray(value))) {
          _$jscoverage['/json/stringify.js'].lineData[45]++;
          return ja(value, replacerFunction, propertyList, gap, stack, indent);
        }
        _$jscoverage['/json/stringify.js'].lineData[47]++;
        return jo(value, replacerFunction, propertyList, gap, stack, indent);
    }
    _$jscoverage['/json/stringify.js'].lineData[51]++;
    return undefined;
  }
  _$jscoverage['/json/stringify.js'].lineData[54]++;
  function jo(value, replacerFunction, propertyList, gap, stack, indent) {
    _$jscoverage['/json/stringify.js'].functionData[3]++;
    _$jscoverage['/json/stringify.js'].lineData[55]++;
    if (visit56_55_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[56]++;
      if (visit57_56_1(S.inArray(value, stack))) {
        _$jscoverage['/json/stringify.js'].lineData[57]++;
        throw new TypeError('cyclic json');
      }
      _$jscoverage['/json/stringify.js'].lineData[59]++;
      stack[stack.length] = value;
    }
    _$jscoverage['/json/stringify.js'].lineData[62]++;
    var stepBack = indent;
    _$jscoverage['/json/stringify.js'].lineData[63]++;
    indent += gap;
    _$jscoverage['/json/stringify.js'].lineData[64]++;
    var k, kl, i, p;
    _$jscoverage['/json/stringify.js'].lineData[65]++;
    if (visit58_65_1(propertyList !== undefined)) {
      _$jscoverage['/json/stringify.js'].lineData[66]++;
      k = propertyList;
    } else {
      _$jscoverage['/json/stringify.js'].lineData[68]++;
      k = S.keys(value);
    }
    _$jscoverage['/json/stringify.js'].lineData[70]++;
    var partial = [];
    _$jscoverage['/json/stringify.js'].lineData[71]++;
    for (i = 0 , kl = k.length; visit59_71_1(i < kl); i++) {
      _$jscoverage['/json/stringify.js'].lineData[72]++;
      p = k[i];
      _$jscoverage['/json/stringify.js'].lineData[73]++;
      var strP = str(p, value, replacerFunction, propertyList, gap, stack, indent);
      _$jscoverage['/json/stringify.js'].lineData[74]++;
      if (visit60_74_1(strP !== undefined)) {
        _$jscoverage['/json/stringify.js'].lineData[75]++;
        var member = Quote.quote(p);
        _$jscoverage['/json/stringify.js'].lineData[76]++;
        member += ':';
        _$jscoverage['/json/stringify.js'].lineData[77]++;
        if (visit61_77_1(gap)) {
          _$jscoverage['/json/stringify.js'].lineData[78]++;
          member += ' ';
        }
        _$jscoverage['/json/stringify.js'].lineData[80]++;
        member += strP;
        _$jscoverage['/json/stringify.js'].lineData[81]++;
        partial[partial.length] = member;
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[84]++;
    var ret;
    _$jscoverage['/json/stringify.js'].lineData[85]++;
    if (visit62_85_1(!partial.length)) {
      _$jscoverage['/json/stringify.js'].lineData[86]++;
      ret = '{}';
    } else {
      _$jscoverage['/json/stringify.js'].lineData[88]++;
      if (visit63_88_1(!gap)) {
        _$jscoverage['/json/stringify.js'].lineData[89]++;
        ret = '{' + partial.join(',') + '}';
      } else {
        _$jscoverage['/json/stringify.js'].lineData[91]++;
        var separator = ",\n" + indent;
        _$jscoverage['/json/stringify.js'].lineData[92]++;
        var properties = partial.join(separator);
        _$jscoverage['/json/stringify.js'].lineData[93]++;
        ret = '{\n' + indent + properties + '\n' + stepBack + '}';
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[96]++;
    if (visit64_96_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[97]++;
      stack.pop();
    }
    _$jscoverage['/json/stringify.js'].lineData[99]++;
    return ret;
  }
  _$jscoverage['/json/stringify.js'].lineData[102]++;
  function ja(value, replacerFunction, propertyList, gap, stack, indent) {
    _$jscoverage['/json/stringify.js'].functionData[4]++;
    _$jscoverage['/json/stringify.js'].lineData[103]++;
    if (visit65_103_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[104]++;
      if (visit66_104_1(S.inArray(value, stack))) {
        _$jscoverage['/json/stringify.js'].lineData[105]++;
        throw new TypeError('cyclic json');
      }
      _$jscoverage['/json/stringify.js'].lineData[107]++;
      stack[stack.length] = value;
    }
    _$jscoverage['/json/stringify.js'].lineData[109]++;
    var stepBack = indent;
    _$jscoverage['/json/stringify.js'].lineData[110]++;
    indent += gap;
    _$jscoverage['/json/stringify.js'].lineData[111]++;
    var partial = [];
    _$jscoverage['/json/stringify.js'].lineData[112]++;
    var len = value.length;
    _$jscoverage['/json/stringify.js'].lineData[113]++;
    var index = 0;
    _$jscoverage['/json/stringify.js'].lineData[114]++;
    while (visit67_114_1(index < len)) {
      _$jscoverage['/json/stringify.js'].lineData[115]++;
      var strP = str(String(index), value, replacerFunction, propertyList, gap, stack, indent);
      _$jscoverage['/json/stringify.js'].lineData[116]++;
      if (visit68_116_1(strP === undefined)) {
        _$jscoverage['/json/stringify.js'].lineData[117]++;
        partial[partial.length] = 'null';
      } else {
        _$jscoverage['/json/stringify.js'].lineData[119]++;
        partial[partial.length] = strP;
      }
      _$jscoverage['/json/stringify.js'].lineData[121]++;
      ++index;
    }
    _$jscoverage['/json/stringify.js'].lineData[123]++;
    var ret;
    _$jscoverage['/json/stringify.js'].lineData[124]++;
    if (visit69_124_1(!partial.length)) {
      _$jscoverage['/json/stringify.js'].lineData[125]++;
      ret = '[]';
    } else {
      _$jscoverage['/json/stringify.js'].lineData[127]++;
      if (visit70_127_1(!gap)) {
        _$jscoverage['/json/stringify.js'].lineData[128]++;
        ret = '[' + partial.join(',') + ']';
      } else {
        _$jscoverage['/json/stringify.js'].lineData[130]++;
        var separator = '\n,' + indent;
        _$jscoverage['/json/stringify.js'].lineData[131]++;
        var properties = partial.join(separator);
        _$jscoverage['/json/stringify.js'].lineData[132]++;
        ret = '[\n' + indent + properties + '\n' + stepBack + ']';
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[135]++;
    if (visit71_135_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[136]++;
      stack.pop();
    }
    _$jscoverage['/json/stringify.js'].lineData[139]++;
    return ret;
  }
  _$jscoverage['/json/stringify.js'].lineData[142]++;
  function stringify(value, replacer, space) {
    _$jscoverage['/json/stringify.js'].functionData[5]++;
    _$jscoverage['/json/stringify.js'].lineData[143]++;
    var gap = '';
    _$jscoverage['/json/stringify.js'].lineData[144]++;
    var propertyList, replacerFunction;
    _$jscoverage['/json/stringify.js'].lineData[145]++;
    if (visit72_145_1(replacer)) {
      _$jscoverage['/json/stringify.js'].lineData[146]++;
      if (visit73_146_1(typeof replacer === 'function')) {
        _$jscoverage['/json/stringify.js'].lineData[147]++;
        replacerFunction = replacer;
      } else {
        _$jscoverage['/json/stringify.js'].lineData[148]++;
        if (visit74_148_1(S.isArray(replacer))) {
          _$jscoverage['/json/stringify.js'].lineData[149]++;
          propertyList = replacer;
        }
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[153]++;
    if (visit75_153_1(typeof space === 'number')) {
      _$jscoverage['/json/stringify.js'].lineData[154]++;
      space = Math.min(10, space);
      _$jscoverage['/json/stringify.js'].lineData[155]++;
      gap = new Array(space + 1).join(' ');
    } else {
      _$jscoverage['/json/stringify.js'].lineData[156]++;
      if (visit76_156_1(typeof space === 'string')) {
        _$jscoverage['/json/stringify.js'].lineData[157]++;
        gap = space.slice(0, 10);
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[160]++;
    return str('', {
  '': value}, replacerFunction, propertyList, gap, [], '');
  }
  _$jscoverage['/json/stringify.js'].lineData[165]++;
  return stringify;
}, {
  requires: ['./quote']});
