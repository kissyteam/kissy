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
  _$jscoverage['/util/string.js'].lineData[6] = 0;
  _$jscoverage['/util/string.js'].lineData[7] = 0;
  _$jscoverage['/util/string.js'].lineData[8] = 0;
  _$jscoverage['/util/string.js'].lineData[9] = 0;
  _$jscoverage['/util/string.js'].lineData[13] = 0;
  _$jscoverage['/util/string.js'].lineData[16] = 0;
  _$jscoverage['/util/string.js'].lineData[18] = 0;
  _$jscoverage['/util/string.js'].lineData[22] = 0;
  _$jscoverage['/util/string.js'].lineData[23] = 0;
  _$jscoverage['/util/string.js'].lineData[25] = 0;
  _$jscoverage['/util/string.js'].lineData[28] = 0;
  _$jscoverage['/util/string.js'].lineData[30] = 0;
  _$jscoverage['/util/string.js'].lineData[31] = 0;
  _$jscoverage['/util/string.js'].lineData[34] = 0;
  _$jscoverage['/util/string.js'].lineData[54] = 0;
  _$jscoverage['/util/string.js'].lineData[55] = 0;
  _$jscoverage['/util/string.js'].lineData[56] = 0;
  _$jscoverage['/util/string.js'].lineData[57] = 0;
  _$jscoverage['/util/string.js'].lineData[59] = 0;
  _$jscoverage['/util/string.js'].lineData[61] = 0;
  _$jscoverage['/util/string.js'].lineData[63] = 0;
  _$jscoverage['/util/string.js'].lineData[64] = 0;
  _$jscoverage['/util/string.js'].lineData[67] = 0;
  _$jscoverage['/util/string.js'].lineData[68] = 0;
  _$jscoverage['/util/string.js'].lineData[69] = 0;
  _$jscoverage['/util/string.js'].lineData[70] = 0;
  _$jscoverage['/util/string.js'].lineData[72] = 0;
  _$jscoverage['/util/string.js'].lineData[73] = 0;
  _$jscoverage['/util/string.js'].lineData[75] = 0;
  _$jscoverage['/util/string.js'].lineData[76] = 0;
  _$jscoverage['/util/string.js'].lineData[77] = 0;
  _$jscoverage['/util/string.js'].lineData[78] = 0;
  _$jscoverage['/util/string.js'].lineData[79] = 0;
  _$jscoverage['/util/string.js'].lineData[80] = 0;
  _$jscoverage['/util/string.js'].lineData[82] = 0;
  _$jscoverage['/util/string.js'].lineData[89] = 0;
  _$jscoverage['/util/string.js'].lineData[90] = 0;
  _$jscoverage['/util/string.js'].lineData[109] = 0;
  _$jscoverage['/util/string.js'].lineData[110] = 0;
  _$jscoverage['/util/string.js'].lineData[112] = 0;
  _$jscoverage['/util/string.js'].lineData[113] = 0;
  _$jscoverage['/util/string.js'].lineData[114] = 0;
  _$jscoverage['/util/string.js'].lineData[121] = 0;
  _$jscoverage['/util/string.js'].lineData[122] = 0;
  _$jscoverage['/util/string.js'].lineData[123] = 0;
  _$jscoverage['/util/string.js'].lineData[124] = 0;
  _$jscoverage['/util/string.js'].lineData[125] = 0;
  _$jscoverage['/util/string.js'].lineData[128] = 0;
  _$jscoverage['/util/string.js'].lineData[129] = 0;
  _$jscoverage['/util/string.js'].lineData[130] = 0;
  _$jscoverage['/util/string.js'].lineData[131] = 0;
  _$jscoverage['/util/string.js'].lineData[133] = 0;
  _$jscoverage['/util/string.js'].lineData[134] = 0;
  _$jscoverage['/util/string.js'].lineData[136] = 0;
  _$jscoverage['/util/string.js'].lineData[137] = 0;
  _$jscoverage['/util/string.js'].lineData[140] = 0;
  _$jscoverage['/util/string.js'].lineData[141] = 0;
  _$jscoverage['/util/string.js'].lineData[142] = 0;
  _$jscoverage['/util/string.js'].lineData[144] = 0;
  _$jscoverage['/util/string.js'].lineData[147] = 0;
  _$jscoverage['/util/string.js'].lineData[150] = 0;
  _$jscoverage['/util/string.js'].lineData[160] = 0;
  _$jscoverage['/util/string.js'].lineData[171] = 0;
  _$jscoverage['/util/string.js'].lineData[172] = 0;
  _$jscoverage['/util/string.js'].lineData[182] = 0;
  _$jscoverage['/util/string.js'].lineData[185] = 0;
  _$jscoverage['/util/string.js'].lineData[195] = 0;
  _$jscoverage['/util/string.js'].lineData[206] = 0;
  _$jscoverage['/util/string.js'].lineData[210] = 0;
  _$jscoverage['/util/string.js'].lineData[221] = 0;
  _$jscoverage['/util/string.js'].lineData[222] = 0;
  _$jscoverage['/util/string.js'].lineData[225] = 0;
  _$jscoverage['/util/string.js'].lineData[226] = 0;
  _$jscoverage['/util/string.js'].lineData[227] = 0;
  _$jscoverage['/util/string.js'].lineData[229] = 0;
  _$jscoverage['/util/string.js'].lineData[239] = 0;
  _$jscoverage['/util/string.js'].lineData[240] = 0;
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
  _$jscoverage['/util/string.js'].branchData['54'] = [];
  _$jscoverage['/util/string.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['55'] = [];
  _$jscoverage['/util/string.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['56'] = [];
  _$jscoverage['/util/string.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['67'] = [];
  _$jscoverage['/util/string.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['69'] = [];
  _$jscoverage['/util/string.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['73'] = [];
  _$jscoverage['/util/string.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['75'] = [];
  _$jscoverage['/util/string.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['77'] = [];
  _$jscoverage['/util/string.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['79'] = [];
  _$jscoverage['/util/string.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['109'] = [];
  _$jscoverage['/util/string.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['112'] = [];
  _$jscoverage['/util/string.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['113'] = [];
  _$jscoverage['/util/string.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['121'] = [];
  _$jscoverage['/util/string.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['123'] = [];
  _$jscoverage['/util/string.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['136'] = [];
  _$jscoverage['/util/string.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['140'] = [];
  _$jscoverage['/util/string.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['141'] = [];
  _$jscoverage['/util/string.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['160'] = [];
  _$jscoverage['/util/string.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['172'] = [];
  _$jscoverage['/util/string.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['172'][3] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['182'] = [];
  _$jscoverage['/util/string.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['185'] = [];
  _$jscoverage['/util/string.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['221'] = [];
  _$jscoverage['/util/string.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['221'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['225'] = [];
  _$jscoverage['/util/string.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['226'] = [];
  _$jscoverage['/util/string.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['229'] = [];
  _$jscoverage['/util/string.js'].branchData['229'][1] = new BranchData();
}
_$jscoverage['/util/string.js'].branchData['229'][1].init(138, 17, 'o[name] === undef');
function visit185_229_1(result) {
  _$jscoverage['/util/string.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['226'][1].init(22, 24, 'match.charAt(0) === \'\\\\\'');
function visit184_226_1(result) {
  _$jscoverage['/util/string.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['225'][1].init(129, 24, 'regexp || SUBSTITUTE_REG');
function visit183_225_1(result) {
  _$jscoverage['/util/string.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['221'][2].init(18, 23, 'typeof str !== \'string\'');
function visit182_221_2(result) {
  _$jscoverage['/util/string.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['221'][1].init(18, 29, 'typeof str !== \'string\' || !o');
function visit181_221_1(result) {
  _$jscoverage['/util/string.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['185'][1].init(25, 11, 'str == null');
function visit180_185_1(result) {
  _$jscoverage['/util/string.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['182'][1].init(25, 11, 'str == null');
function visit179_182_1(result) {
  _$jscoverage['/util/string.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['172'][3].init(84, 32, 'str.indexOf(suffix, ind) === ind');
function visit178_172_3(result) {
  _$jscoverage['/util/string.js'].branchData['172'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['172'][2].init(72, 8, 'ind >= 0');
function visit177_172_2(result) {
  _$jscoverage['/util/string.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['172'][1].init(72, 44, 'ind >= 0 && str.indexOf(suffix, ind) === ind');
function visit176_172_1(result) {
  _$jscoverage['/util/string.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['160'][1].init(21, 32, 'str.lastIndexOf(prefix, 0) === 0');
function visit175_160_1(result) {
  _$jscoverage['/util/string.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['141'][1].init(26, 22, 'util.isArray(ret[key])');
function visit174_141_1(result) {
  _$jscoverage['/util/string.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['140'][1].init(797, 10, 'key in ret');
function visit173_140_1(result) {
  _$jscoverage['/util/string.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['136'][1].init(448, 24, 'util.endsWith(key, \'[]\')');
function visit172_136_1(result) {
  _$jscoverage['/util/string.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['123'][1].init(71, 14, 'eqIndex === -1');
function visit171_123_1(result) {
  _$jscoverage['/util/string.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['121'][1].init(403, 7, 'i < len');
function visit170_121_1(result) {
  _$jscoverage['/util/string.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['113'][1].init(164, 8, 'eq || EQ');
function visit169_113_1(result) {
  _$jscoverage['/util/string.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['112'][1].init(134, 10, 'sep || SEP');
function visit168_112_1(result) {
  _$jscoverage['/util/string.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['109'][2].init(18, 23, 'typeof str !== \'string\'');
function visit167_109_2(result) {
  _$jscoverage['/util/string.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['109'][1].init(18, 50, 'typeof str !== \'string\' || !(str = util.trim(str))');
function visit166_109_1(result) {
  _$jscoverage['/util/string.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['79'][1].init(119, 11, 'v !== undef');
function visit165_79_1(result) {
  _$jscoverage['/util/string.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['77'][1].init(67, 20, 'isValidParamValue(v)');
function visit164_77_1(result) {
  _$jscoverage['/util/string.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['75'][1].init(99, 7, 'i < len');
function visit163_75_1(result) {
  _$jscoverage['/util/string.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['73'][1].init(394, 31, 'util.isArray(val) && val.length');
function visit162_73_1(result) {
  _$jscoverage['/util/string.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['69'][1].init(62, 13, 'val !== undef');
function visit161_69_1(result) {
  _$jscoverage['/util/string.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['67'][1].init(142, 22, 'isValidParamValue(val)');
function visit160_67_1(result) {
  _$jscoverage['/util/string.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['56'][1].init(77, 24, 'serializeArray === undef');
function visit159_56_1(result) {
  _$jscoverage['/util/string.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['55'][1].init(50, 8, 'eq || EQ');
function visit158_55_1(result) {
  _$jscoverage['/util/string.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['54'][1].init(20, 10, 'sep || SEP');
function visit157_54_1(result) {
  _$jscoverage['/util/string.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][5].init(165, 16, 't !== \'function\'');
function visit156_25_5(result) {
  _$jscoverage['/util/string.js'].branchData['25'][5].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][4].init(147, 14, 't !== \'object\'');
function visit155_25_4(result) {
  _$jscoverage['/util/string.js'].branchData['25'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][3].init(147, 34, 't !== \'object\' && t !== \'function\'');
function visit154_25_3(result) {
  _$jscoverage['/util/string.js'].branchData['25'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][2].init(131, 11, 'val == null');
function visit153_25_2(result) {
  _$jscoverage['/util/string.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][1].init(131, 51, 'val == null || (t !== \'object\' && t !== \'function\')');
function visit152_25_1(result) {
  _$jscoverage['/util/string.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/util/string.js'].functionData[0]++;
  _$jscoverage['/util/string.js'].lineData[7]++;
  var util = require('./base');
  _$jscoverage['/util/string.js'].lineData[8]++;
  var undef;
  _$jscoverage['/util/string.js'].lineData[9]++;
  var logger = S.getLogger('util');
  _$jscoverage['/util/string.js'].lineData[13]++;
  var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g, EMPTY = '';
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
    return visit152_25_1(visit153_25_2(val == null) || (visit154_25_3(visit155_25_4(t !== 'object') && visit156_25_5(t !== 'function'))));
  }
  _$jscoverage['/util/string.js'].lineData[28]++;
  var RE_DASH = /-([a-z])/ig;
  _$jscoverage['/util/string.js'].lineData[30]++;
  function upperCase() {
    _$jscoverage['/util/string.js'].functionData[2]++;
    _$jscoverage['/util/string.js'].lineData[31]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/util/string.js'].lineData[34]++;
  util.mix(util, {
  param: function(o, sep, eq, serializeArray) {
  _$jscoverage['/util/string.js'].functionData[3]++;
  _$jscoverage['/util/string.js'].lineData[54]++;
  sep = visit157_54_1(sep || SEP);
  _$jscoverage['/util/string.js'].lineData[55]++;
  eq = visit158_55_1(eq || EQ);
  _$jscoverage['/util/string.js'].lineData[56]++;
  if (visit159_56_1(serializeArray === undef)) {
    _$jscoverage['/util/string.js'].lineData[57]++;
    serializeArray = TRUE;
  }
  _$jscoverage['/util/string.js'].lineData[59]++;
  var buf = [], key, i, v, len, val, encode = util.urlEncode;
  _$jscoverage['/util/string.js'].lineData[61]++;
  for (key in o) {
    _$jscoverage['/util/string.js'].lineData[63]++;
    val = o[key];
    _$jscoverage['/util/string.js'].lineData[64]++;
    key = encode(key);
    _$jscoverage['/util/string.js'].lineData[67]++;
    if (visit160_67_1(isValidParamValue(val))) {
      _$jscoverage['/util/string.js'].lineData[68]++;
      buf.push(key);
      _$jscoverage['/util/string.js'].lineData[69]++;
      if (visit161_69_1(val !== undef)) {
        _$jscoverage['/util/string.js'].lineData[70]++;
        buf.push(eq, encode(val + EMPTY));
      }
      _$jscoverage['/util/string.js'].lineData[72]++;
      buf.push(sep);
    } else {
      _$jscoverage['/util/string.js'].lineData[73]++;
      if (visit162_73_1(util.isArray(val) && val.length)) {
        _$jscoverage['/util/string.js'].lineData[75]++;
        for (i = 0 , len = val.length; visit163_75_1(i < len); ++i) {
          _$jscoverage['/util/string.js'].lineData[76]++;
          v = val[i];
          _$jscoverage['/util/string.js'].lineData[77]++;
          if (visit164_77_1(isValidParamValue(v))) {
            _$jscoverage['/util/string.js'].lineData[78]++;
            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
            _$jscoverage['/util/string.js'].lineData[79]++;
            if (visit165_79_1(v !== undef)) {
              _$jscoverage['/util/string.js'].lineData[80]++;
              buf.push(eq, encode(v + EMPTY));
            }
            _$jscoverage['/util/string.js'].lineData[82]++;
            buf.push(sep);
          }
        }
      }
    }
  }
  _$jscoverage['/util/string.js'].lineData[89]++;
  buf.pop();
  _$jscoverage['/util/string.js'].lineData[90]++;
  return buf.join(EMPTY);
}, 
  unparam: function(str, sep, eq) {
  _$jscoverage['/util/string.js'].functionData[4]++;
  _$jscoverage['/util/string.js'].lineData[109]++;
  if (visit166_109_1(visit167_109_2(typeof str !== 'string') || !(str = util.trim(str)))) {
    _$jscoverage['/util/string.js'].lineData[110]++;
    return {};
  }
  _$jscoverage['/util/string.js'].lineData[112]++;
  sep = visit168_112_1(sep || SEP);
  _$jscoverage['/util/string.js'].lineData[113]++;
  eq = visit169_113_1(eq || EQ);
  _$jscoverage['/util/string.js'].lineData[114]++;
  var ret = {}, eqIndex, decode = util.urlDecode, pairs = str.split(sep), key, val, i = 0, len = pairs.length;
  _$jscoverage['/util/string.js'].lineData[121]++;
  for (; visit170_121_1(i < len); ++i) {
    _$jscoverage['/util/string.js'].lineData[122]++;
    eqIndex = pairs[i].indexOf(eq);
    _$jscoverage['/util/string.js'].lineData[123]++;
    if (visit171_123_1(eqIndex === -1)) {
      _$jscoverage['/util/string.js'].lineData[124]++;
      key = decode(pairs[i]);
      _$jscoverage['/util/string.js'].lineData[125]++;
      val = undef;
    } else {
      _$jscoverage['/util/string.js'].lineData[128]++;
      key = decode(pairs[i].substring(0, eqIndex));
      _$jscoverage['/util/string.js'].lineData[129]++;
      val = pairs[i].substring(eqIndex + 1);
      _$jscoverage['/util/string.js'].lineData[130]++;
      try {
        _$jscoverage['/util/string.js'].lineData[131]++;
        val = decode(val);
      }      catch (e) {
  _$jscoverage['/util/string.js'].lineData[133]++;
  logger.error('decodeURIComponent error : ' + val);
  _$jscoverage['/util/string.js'].lineData[134]++;
  logger.error(e);
}
      _$jscoverage['/util/string.js'].lineData[136]++;
      if (visit172_136_1(util.endsWith(key, '[]'))) {
        _$jscoverage['/util/string.js'].lineData[137]++;
        key = key.substring(0, key.length - 2);
      }
    }
    _$jscoverage['/util/string.js'].lineData[140]++;
    if (visit173_140_1(key in ret)) {
      _$jscoverage['/util/string.js'].lineData[141]++;
      if (visit174_141_1(util.isArray(ret[key]))) {
        _$jscoverage['/util/string.js'].lineData[142]++;
        ret[key].push(val);
      } else {
        _$jscoverage['/util/string.js'].lineData[144]++;
        ret[key] = [ret[key], val];
      }
    } else {
      _$jscoverage['/util/string.js'].lineData[147]++;
      ret[key] = val;
    }
  }
  _$jscoverage['/util/string.js'].lineData[150]++;
  return ret;
}, 
  startsWith: function(str, prefix) {
  _$jscoverage['/util/string.js'].functionData[5]++;
  _$jscoverage['/util/string.js'].lineData[160]++;
  return visit175_160_1(str.lastIndexOf(prefix, 0) === 0);
}, 
  endsWith: function(str, suffix) {
  _$jscoverage['/util/string.js'].functionData[6]++;
  _$jscoverage['/util/string.js'].lineData[171]++;
  var ind = str.length - suffix.length;
  _$jscoverage['/util/string.js'].lineData[172]++;
  return visit176_172_1(visit177_172_2(ind >= 0) && visit178_172_3(str.indexOf(suffix, ind) === ind));
}, 
  trim: trim ? function(str) {
  _$jscoverage['/util/string.js'].functionData[7]++;
  _$jscoverage['/util/string.js'].lineData[182]++;
  return visit179_182_1(str == null) ? EMPTY : trim.call(str);
} : function(str) {
  _$jscoverage['/util/string.js'].functionData[8]++;
  _$jscoverage['/util/string.js'].lineData[185]++;
  return visit180_185_1(str == null) ? EMPTY : (str + '').replace(RE_TRIM, EMPTY);
}, 
  urlEncode: function(s) {
  _$jscoverage['/util/string.js'].functionData[9]++;
  _$jscoverage['/util/string.js'].lineData[195]++;
  return encodeURIComponent(String(s));
}, 
  urlDecode: function(s) {
  _$jscoverage['/util/string.js'].functionData[10]++;
  _$jscoverage['/util/string.js'].lineData[206]++;
  return decodeURIComponent(s.replace(/\+/g, ' '));
}, 
  camelCase: function(name) {
  _$jscoverage['/util/string.js'].functionData[11]++;
  _$jscoverage['/util/string.js'].lineData[210]++;
  return name.replace(RE_DASH, upperCase);
}, 
  substitute: function(str, o, regexp) {
  _$jscoverage['/util/string.js'].functionData[12]++;
  _$jscoverage['/util/string.js'].lineData[221]++;
  if (visit181_221_1(visit182_221_2(typeof str !== 'string') || !o)) {
    _$jscoverage['/util/string.js'].lineData[222]++;
    return str;
  }
  _$jscoverage['/util/string.js'].lineData[225]++;
  return str.replace(visit183_225_1(regexp || SUBSTITUTE_REG), function(match, name) {
  _$jscoverage['/util/string.js'].functionData[13]++;
  _$jscoverage['/util/string.js'].lineData[226]++;
  if (visit184_226_1(match.charAt(0) === '\\')) {
    _$jscoverage['/util/string.js'].lineData[227]++;
    return match.slice(1);
  }
  _$jscoverage['/util/string.js'].lineData[229]++;
  return (visit185_229_1(o[name] === undef)) ? EMPTY : o[name];
});
}, 
  ucfirst: function(s) {
  _$jscoverage['/util/string.js'].functionData[14]++;
  _$jscoverage['/util/string.js'].lineData[239]++;
  s += '';
  _$jscoverage['/util/string.js'].lineData[240]++;
  return s.charAt(0).toUpperCase() + s.substring(1);
}});
});
