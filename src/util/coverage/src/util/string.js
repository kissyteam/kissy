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
if (! _$jscoverage['/util/string.js']) {
  _$jscoverage['/util/string.js'] = {};
  _$jscoverage['/util/string.js'].lineData = [];
  _$jscoverage['/util/string.js'].lineData[7] = 0;
  _$jscoverage['/util/string.js'].lineData[8] = 0;
  _$jscoverage['/util/string.js'].lineData[9] = 0;
  _$jscoverage['/util/string.js'].lineData[13] = 0;
  _$jscoverage['/util/string.js'].lineData[15] = 0;
  _$jscoverage['/util/string.js'].lineData[16] = 0;
  _$jscoverage['/util/string.js'].lineData[18] = 0;
  _$jscoverage['/util/string.js'].lineData[22] = 0;
  _$jscoverage['/util/string.js'].lineData[23] = 0;
  _$jscoverage['/util/string.js'].lineData[25] = 0;
  _$jscoverage['/util/string.js'].lineData[28] = 0;
  _$jscoverage['/util/string.js'].lineData[29] = 0;
  _$jscoverage['/util/string.js'].lineData[32] = 0;
  _$jscoverage['/util/string.js'].lineData[52] = 0;
  _$jscoverage['/util/string.js'].lineData[53] = 0;
  _$jscoverage['/util/string.js'].lineData[54] = 0;
  _$jscoverage['/util/string.js'].lineData[55] = 0;
  _$jscoverage['/util/string.js'].lineData[57] = 0;
  _$jscoverage['/util/string.js'].lineData[59] = 0;
  _$jscoverage['/util/string.js'].lineData[61] = 0;
  _$jscoverage['/util/string.js'].lineData[62] = 0;
  _$jscoverage['/util/string.js'].lineData[65] = 0;
  _$jscoverage['/util/string.js'].lineData[66] = 0;
  _$jscoverage['/util/string.js'].lineData[67] = 0;
  _$jscoverage['/util/string.js'].lineData[68] = 0;
  _$jscoverage['/util/string.js'].lineData[70] = 0;
  _$jscoverage['/util/string.js'].lineData[71] = 0;
  _$jscoverage['/util/string.js'].lineData[73] = 0;
  _$jscoverage['/util/string.js'].lineData[74] = 0;
  _$jscoverage['/util/string.js'].lineData[75] = 0;
  _$jscoverage['/util/string.js'].lineData[76] = 0;
  _$jscoverage['/util/string.js'].lineData[77] = 0;
  _$jscoverage['/util/string.js'].lineData[78] = 0;
  _$jscoverage['/util/string.js'].lineData[80] = 0;
  _$jscoverage['/util/string.js'].lineData[87] = 0;
  _$jscoverage['/util/string.js'].lineData[88] = 0;
  _$jscoverage['/util/string.js'].lineData[107] = 0;
  _$jscoverage['/util/string.js'].lineData[108] = 0;
  _$jscoverage['/util/string.js'].lineData[110] = 0;
  _$jscoverage['/util/string.js'].lineData[111] = 0;
  _$jscoverage['/util/string.js'].lineData[112] = 0;
  _$jscoverage['/util/string.js'].lineData[119] = 0;
  _$jscoverage['/util/string.js'].lineData[120] = 0;
  _$jscoverage['/util/string.js'].lineData[121] = 0;
  _$jscoverage['/util/string.js'].lineData[122] = 0;
  _$jscoverage['/util/string.js'].lineData[123] = 0;
  _$jscoverage['/util/string.js'].lineData[126] = 0;
  _$jscoverage['/util/string.js'].lineData[127] = 0;
  _$jscoverage['/util/string.js'].lineData[128] = 0;
  _$jscoverage['/util/string.js'].lineData[129] = 0;
  _$jscoverage['/util/string.js'].lineData[131] = 0;
  _$jscoverage['/util/string.js'].lineData[132] = 0;
  _$jscoverage['/util/string.js'].lineData[134] = 0;
  _$jscoverage['/util/string.js'].lineData[135] = 0;
  _$jscoverage['/util/string.js'].lineData[138] = 0;
  _$jscoverage['/util/string.js'].lineData[139] = 0;
  _$jscoverage['/util/string.js'].lineData[140] = 0;
  _$jscoverage['/util/string.js'].lineData[142] = 0;
  _$jscoverage['/util/string.js'].lineData[145] = 0;
  _$jscoverage['/util/string.js'].lineData[148] = 0;
  _$jscoverage['/util/string.js'].lineData[158] = 0;
  _$jscoverage['/util/string.js'].lineData[169] = 0;
  _$jscoverage['/util/string.js'].lineData[170] = 0;
  _$jscoverage['/util/string.js'].lineData[180] = 0;
  _$jscoverage['/util/string.js'].lineData[183] = 0;
  _$jscoverage['/util/string.js'].lineData[193] = 0;
  _$jscoverage['/util/string.js'].lineData[204] = 0;
  _$jscoverage['/util/string.js'].lineData[208] = 0;
  _$jscoverage['/util/string.js'].lineData[219] = 0;
  _$jscoverage['/util/string.js'].lineData[220] = 0;
  _$jscoverage['/util/string.js'].lineData[223] = 0;
  _$jscoverage['/util/string.js'].lineData[224] = 0;
  _$jscoverage['/util/string.js'].lineData[225] = 0;
  _$jscoverage['/util/string.js'].lineData[227] = 0;
  _$jscoverage['/util/string.js'].lineData[237] = 0;
  _$jscoverage['/util/string.js'].lineData[238] = 0;
}
if (! _$jscoverage['/util/string.js'].functionData) {
  _$jscoverage['/util/string.js'].functionData = [];
  _$jscoverage['/util/string.js'].functionData[0] = 0;
  _$jscoverage['/util/string.js'].functionData[1] = 0;
  _$jscoverage['/util/string.js'].functionData[2] = 0;
  _$jscoverage['/util/string.js'].functionData[3] = 0;
  _$jscoverage['/util/string.js'].functionData[4] = 0;
  _$jscoverage['/util/string.js'].functionData[5] = 0;
  _$jscoverage['/util/string.js'].functionData[6] = 0;
  _$jscoverage['/util/string.js'].functionData[7] = 0;
  _$jscoverage['/util/string.js'].functionData[8] = 0;
  _$jscoverage['/util/string.js'].functionData[9] = 0;
  _$jscoverage['/util/string.js'].functionData[10] = 0;
  _$jscoverage['/util/string.js'].functionData[11] = 0;
  _$jscoverage['/util/string.js'].functionData[12] = 0;
  _$jscoverage['/util/string.js'].functionData[13] = 0;
  _$jscoverage['/util/string.js'].functionData[14] = 0;
}
if (! _$jscoverage['/util/string.js'].branchData) {
  _$jscoverage['/util/string.js'].branchData = {};
  _$jscoverage['/util/string.js'].branchData['25'] = [];
  _$jscoverage['/util/string.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['25'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['25'][3] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['25'][4] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['25'][5] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['52'] = [];
  _$jscoverage['/util/string.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['53'] = [];
  _$jscoverage['/util/string.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['54'] = [];
  _$jscoverage['/util/string.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['65'] = [];
  _$jscoverage['/util/string.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['67'] = [];
  _$jscoverage['/util/string.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['71'] = [];
  _$jscoverage['/util/string.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['73'] = [];
  _$jscoverage['/util/string.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['75'] = [];
  _$jscoverage['/util/string.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['77'] = [];
  _$jscoverage['/util/string.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['107'] = [];
  _$jscoverage['/util/string.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['107'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['110'] = [];
  _$jscoverage['/util/string.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['111'] = [];
  _$jscoverage['/util/string.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['119'] = [];
  _$jscoverage['/util/string.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['121'] = [];
  _$jscoverage['/util/string.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['134'] = [];
  _$jscoverage['/util/string.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['138'] = [];
  _$jscoverage['/util/string.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['139'] = [];
  _$jscoverage['/util/string.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['158'] = [];
  _$jscoverage['/util/string.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['170'] = [];
  _$jscoverage['/util/string.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['170'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['170'][3] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['180'] = [];
  _$jscoverage['/util/string.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['183'] = [];
  _$jscoverage['/util/string.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['219'] = [];
  _$jscoverage['/util/string.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['219'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['223'] = [];
  _$jscoverage['/util/string.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['224'] = [];
  _$jscoverage['/util/string.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['227'] = [];
  _$jscoverage['/util/string.js'].branchData['227'][1] = new BranchData();
}
_$jscoverage['/util/string.js'].branchData['227'][1].init(138, 17, 'o[name] === undef');
function visit171_227_1(result) {
  _$jscoverage['/util/string.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['224'][1].init(22, 24, 'match.charAt(0) === \'\\\\\'');
function visit170_224_1(result) {
  _$jscoverage['/util/string.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['223'][1].init(129, 24, 'regexp || SUBSTITUTE_REG');
function visit169_223_1(result) {
  _$jscoverage['/util/string.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['219'][2].init(18, 23, 'typeof str !== \'string\'');
function visit168_219_2(result) {
  _$jscoverage['/util/string.js'].branchData['219'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['219'][1].init(18, 29, 'typeof str !== \'string\' || !o');
function visit167_219_1(result) {
  _$jscoverage['/util/string.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['183'][1].init(25, 11, 'str == null');
function visit166_183_1(result) {
  _$jscoverage['/util/string.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['180'][1].init(25, 11, 'str == null');
function visit165_180_1(result) {
  _$jscoverage['/util/string.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['170'][3].init(84, 32, 'str.indexOf(suffix, ind) === ind');
function visit164_170_3(result) {
  _$jscoverage['/util/string.js'].branchData['170'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['170'][2].init(72, 8, 'ind >= 0');
function visit163_170_2(result) {
  _$jscoverage['/util/string.js'].branchData['170'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['170'][1].init(72, 44, 'ind >= 0 && str.indexOf(suffix, ind) === ind');
function visit162_170_1(result) {
  _$jscoverage['/util/string.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['158'][1].init(21, 32, 'str.lastIndexOf(prefix, 0) === 0');
function visit161_158_1(result) {
  _$jscoverage['/util/string.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['139'][1].init(26, 19, 'S.isArray(ret[key])');
function visit160_139_1(result) {
  _$jscoverage['/util/string.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['138'][1].init(794, 10, 'key in ret');
function visit159_138_1(result) {
  _$jscoverage['/util/string.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['134'][1].init(448, 21, 'S.endsWith(key, \'[]\')');
function visit158_134_1(result) {
  _$jscoverage['/util/string.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['121'][1].init(71, 14, 'eqIndex === -1');
function visit157_121_1(result) {
  _$jscoverage['/util/string.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['119'][1].init(397, 7, 'i < len');
function visit156_119_1(result) {
  _$jscoverage['/util/string.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['111'][1].init(161, 8, 'eq || EQ');
function visit155_111_1(result) {
  _$jscoverage['/util/string.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['110'][1].init(131, 10, 'sep || SEP');
function visit154_110_1(result) {
  _$jscoverage['/util/string.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['107'][2].init(18, 23, 'typeof str !== \'string\'');
function visit153_107_2(result) {
  _$jscoverage['/util/string.js'].branchData['107'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['107'][1].init(18, 47, 'typeof str !== \'string\' || !(str = S.trim(str))');
function visit152_107_1(result) {
  _$jscoverage['/util/string.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['77'][1].init(119, 11, 'v !== undef');
function visit151_77_1(result) {
  _$jscoverage['/util/string.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['75'][1].init(67, 20, 'isValidParamValue(v)');
function visit150_75_1(result) {
  _$jscoverage['/util/string.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['73'][1].init(99, 7, 'i < len');
function visit149_73_1(result) {
  _$jscoverage['/util/string.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['71'][1].init(394, 28, 'S.isArray(val) && val.length');
function visit148_71_1(result) {
  _$jscoverage['/util/string.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['67'][1].init(62, 13, 'val !== undef');
function visit147_67_1(result) {
  _$jscoverage['/util/string.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['65'][1].init(142, 22, 'isValidParamValue(val)');
function visit146_65_1(result) {
  _$jscoverage['/util/string.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['54'][1].init(77, 24, 'serializeArray === undef');
function visit145_54_1(result) {
  _$jscoverage['/util/string.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['53'][1].init(50, 8, 'eq || EQ');
function visit144_53_1(result) {
  _$jscoverage['/util/string.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['52'][1].init(20, 10, 'sep || SEP');
function visit143_52_1(result) {
  _$jscoverage['/util/string.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][5].init(165, 16, 't !== \'function\'');
function visit142_25_5(result) {
  _$jscoverage['/util/string.js'].branchData['25'][5].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][4].init(147, 14, 't !== \'object\'');
function visit141_25_4(result) {
  _$jscoverage['/util/string.js'].branchData['25'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][3].init(147, 34, 't !== \'object\' && t !== \'function\'');
function visit140_25_3(result) {
  _$jscoverage['/util/string.js'].branchData['25'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][2].init(131, 11, 'val == null');
function visit139_25_2(result) {
  _$jscoverage['/util/string.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][1].init(131, 51, 'val == null || (t !== \'object\' && t !== \'function\')');
function visit138_25_1(result) {
  _$jscoverage['/util/string.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].lineData[7]++;
KISSY.add(function(S) {
  _$jscoverage['/util/string.js'].functionData[0]++;
  _$jscoverage['/util/string.js'].lineData[8]++;
  var undef;
  _$jscoverage['/util/string.js'].lineData[9]++;
  var logger = S.getLogger('s/util');
  _$jscoverage['/util/string.js'].lineData[13]++;
  var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g, EMPTY = '';
  _$jscoverage['/util/string.js'].lineData[15]++;
  var RE_DASH = /-([a-z])/ig;
  _$jscoverage['/util/string.js'].lineData[16]++;
  var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g, trim = String.prototype.trim;
  _$jscoverage['/util/string.js'].lineData[18]++;
  var SEP = '&', EQ = '=', TRUE = true;
  _$jscoverage['/util/string.js'].lineData[22]++;
  function isValidParamValue(val) {
    _$jscoverage['/util/string.js'].functionData[1]++;
    _$jscoverage['/util/string.js'].lineData[23]++;
    var t = typeof val;
    _$jscoverage['/util/string.js'].lineData[25]++;
    return visit138_25_1(visit139_25_2(val == null) || (visit140_25_3(visit141_25_4(t !== 'object') && visit142_25_5(t !== 'function'))));
  }
  _$jscoverage['/util/string.js'].lineData[28]++;
  function upperCase() {
    _$jscoverage['/util/string.js'].functionData[2]++;
    _$jscoverage['/util/string.js'].lineData[29]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/util/string.js'].lineData[32]++;
  S.mix(S, {
  param: function(o, sep, eq, serializeArray) {
  _$jscoverage['/util/string.js'].functionData[3]++;
  _$jscoverage['/util/string.js'].lineData[52]++;
  sep = visit143_52_1(sep || SEP);
  _$jscoverage['/util/string.js'].lineData[53]++;
  eq = visit144_53_1(eq || EQ);
  _$jscoverage['/util/string.js'].lineData[54]++;
  if (visit145_54_1(serializeArray === undef)) {
    _$jscoverage['/util/string.js'].lineData[55]++;
    serializeArray = TRUE;
  }
  _$jscoverage['/util/string.js'].lineData[57]++;
  var buf = [], key, i, v, len, val, encode = S.urlEncode;
  _$jscoverage['/util/string.js'].lineData[59]++;
  for (key in o) {
    _$jscoverage['/util/string.js'].lineData[61]++;
    val = o[key];
    _$jscoverage['/util/string.js'].lineData[62]++;
    key = encode(key);
    _$jscoverage['/util/string.js'].lineData[65]++;
    if (visit146_65_1(isValidParamValue(val))) {
      _$jscoverage['/util/string.js'].lineData[66]++;
      buf.push(key);
      _$jscoverage['/util/string.js'].lineData[67]++;
      if (visit147_67_1(val !== undef)) {
        _$jscoverage['/util/string.js'].lineData[68]++;
        buf.push(eq, encode(val + EMPTY));
      }
      _$jscoverage['/util/string.js'].lineData[70]++;
      buf.push(sep);
    } else {
      _$jscoverage['/util/string.js'].lineData[71]++;
      if (visit148_71_1(S.isArray(val) && val.length)) {
        _$jscoverage['/util/string.js'].lineData[73]++;
        for (i = 0 , len = val.length; visit149_73_1(i < len); ++i) {
          _$jscoverage['/util/string.js'].lineData[74]++;
          v = val[i];
          _$jscoverage['/util/string.js'].lineData[75]++;
          if (visit150_75_1(isValidParamValue(v))) {
            _$jscoverage['/util/string.js'].lineData[76]++;
            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
            _$jscoverage['/util/string.js'].lineData[77]++;
            if (visit151_77_1(v !== undef)) {
              _$jscoverage['/util/string.js'].lineData[78]++;
              buf.push(eq, encode(v + EMPTY));
            }
            _$jscoverage['/util/string.js'].lineData[80]++;
            buf.push(sep);
          }
        }
      }
    }
  }
  _$jscoverage['/util/string.js'].lineData[87]++;
  buf.pop();
  _$jscoverage['/util/string.js'].lineData[88]++;
  return buf.join(EMPTY);
}, 
  unparam: function(str, sep, eq) {
  _$jscoverage['/util/string.js'].functionData[4]++;
  _$jscoverage['/util/string.js'].lineData[107]++;
  if (visit152_107_1(visit153_107_2(typeof str !== 'string') || !(str = S.trim(str)))) {
    _$jscoverage['/util/string.js'].lineData[108]++;
    return {};
  }
  _$jscoverage['/util/string.js'].lineData[110]++;
  sep = visit154_110_1(sep || SEP);
  _$jscoverage['/util/string.js'].lineData[111]++;
  eq = visit155_111_1(eq || EQ);
  _$jscoverage['/util/string.js'].lineData[112]++;
  var ret = {}, eqIndex, decode = S.urlDecode, pairs = str.split(sep), key, val, i = 0, len = pairs.length;
  _$jscoverage['/util/string.js'].lineData[119]++;
  for (; visit156_119_1(i < len); ++i) {
    _$jscoverage['/util/string.js'].lineData[120]++;
    eqIndex = pairs[i].indexOf(eq);
    _$jscoverage['/util/string.js'].lineData[121]++;
    if (visit157_121_1(eqIndex === -1)) {
      _$jscoverage['/util/string.js'].lineData[122]++;
      key = decode(pairs[i]);
      _$jscoverage['/util/string.js'].lineData[123]++;
      val = undef;
    } else {
      _$jscoverage['/util/string.js'].lineData[126]++;
      key = decode(pairs[i].substring(0, eqIndex));
      _$jscoverage['/util/string.js'].lineData[127]++;
      val = pairs[i].substring(eqIndex + 1);
      _$jscoverage['/util/string.js'].lineData[128]++;
      try {
        _$jscoverage['/util/string.js'].lineData[129]++;
        val = decode(val);
      }      catch (e) {
  _$jscoverage['/util/string.js'].lineData[131]++;
  logger.error('decodeURIComponent error : ' + val);
  _$jscoverage['/util/string.js'].lineData[132]++;
  logger.error(e);
}
      _$jscoverage['/util/string.js'].lineData[134]++;
      if (visit158_134_1(S.endsWith(key, '[]'))) {
        _$jscoverage['/util/string.js'].lineData[135]++;
        key = key.substring(0, key.length - 2);
      }
    }
    _$jscoverage['/util/string.js'].lineData[138]++;
    if (visit159_138_1(key in ret)) {
      _$jscoverage['/util/string.js'].lineData[139]++;
      if (visit160_139_1(S.isArray(ret[key]))) {
        _$jscoverage['/util/string.js'].lineData[140]++;
        ret[key].push(val);
      } else {
        _$jscoverage['/util/string.js'].lineData[142]++;
        ret[key] = [ret[key], val];
      }
    } else {
      _$jscoverage['/util/string.js'].lineData[145]++;
      ret[key] = val;
    }
  }
  _$jscoverage['/util/string.js'].lineData[148]++;
  return ret;
}, 
  startsWith: function(str, prefix) {
  _$jscoverage['/util/string.js'].functionData[5]++;
  _$jscoverage['/util/string.js'].lineData[158]++;
  return visit161_158_1(str.lastIndexOf(prefix, 0) === 0);
}, 
  endsWith: function(str, suffix) {
  _$jscoverage['/util/string.js'].functionData[6]++;
  _$jscoverage['/util/string.js'].lineData[169]++;
  var ind = str.length - suffix.length;
  _$jscoverage['/util/string.js'].lineData[170]++;
  return visit162_170_1(visit163_170_2(ind >= 0) && visit164_170_3(str.indexOf(suffix, ind) === ind));
}, 
  trim: trim ? function(str) {
  _$jscoverage['/util/string.js'].functionData[7]++;
  _$jscoverage['/util/string.js'].lineData[180]++;
  return visit165_180_1(str == null) ? EMPTY : trim.call(str);
} : function(str) {
  _$jscoverage['/util/string.js'].functionData[8]++;
  _$jscoverage['/util/string.js'].lineData[183]++;
  return visit166_183_1(str == null) ? EMPTY : (str + '').replace(RE_TRIM, EMPTY);
}, 
  urlEncode: function(s) {
  _$jscoverage['/util/string.js'].functionData[9]++;
  _$jscoverage['/util/string.js'].lineData[193]++;
  return encodeURIComponent(String(s));
}, 
  urlDecode: function(s) {
  _$jscoverage['/util/string.js'].functionData[10]++;
  _$jscoverage['/util/string.js'].lineData[204]++;
  return decodeURIComponent(s.replace(/\+/g, ' '));
}, 
  camelCase: function(name) {
  _$jscoverage['/util/string.js'].functionData[11]++;
  _$jscoverage['/util/string.js'].lineData[208]++;
  return name.replace(RE_DASH, upperCase);
}, 
  substitute: function(str, o, regexp) {
  _$jscoverage['/util/string.js'].functionData[12]++;
  _$jscoverage['/util/string.js'].lineData[219]++;
  if (visit167_219_1(visit168_219_2(typeof str !== 'string') || !o)) {
    _$jscoverage['/util/string.js'].lineData[220]++;
    return str;
  }
  _$jscoverage['/util/string.js'].lineData[223]++;
  return str.replace(visit169_223_1(regexp || SUBSTITUTE_REG), function(match, name) {
  _$jscoverage['/util/string.js'].functionData[13]++;
  _$jscoverage['/util/string.js'].lineData[224]++;
  if (visit170_224_1(match.charAt(0) === '\\')) {
    _$jscoverage['/util/string.js'].lineData[225]++;
    return match.slice(1);
  }
  _$jscoverage['/util/string.js'].lineData[227]++;
  return (visit171_227_1(o[name] === undef)) ? EMPTY : o[name];
});
}, 
  ucfirst: function(s) {
  _$jscoverage['/util/string.js'].functionData[14]++;
  _$jscoverage['/util/string.js'].lineData[237]++;
  s += '';
  _$jscoverage['/util/string.js'].lineData[238]++;
  return s.charAt(0).toUpperCase() + s.substring(1);
}});
});
