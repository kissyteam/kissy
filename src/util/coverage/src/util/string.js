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
  _$jscoverage['/util/string.js'].lineData[12] = 0;
  _$jscoverage['/util/string.js'].lineData[14] = 0;
  _$jscoverage['/util/string.js'].lineData[15] = 0;
  _$jscoverage['/util/string.js'].lineData[17] = 0;
  _$jscoverage['/util/string.js'].lineData[21] = 0;
  _$jscoverage['/util/string.js'].lineData[22] = 0;
  _$jscoverage['/util/string.js'].lineData[24] = 0;
  _$jscoverage['/util/string.js'].lineData[27] = 0;
  _$jscoverage['/util/string.js'].lineData[28] = 0;
  _$jscoverage['/util/string.js'].lineData[31] = 0;
  _$jscoverage['/util/string.js'].lineData[51] = 0;
  _$jscoverage['/util/string.js'].lineData[52] = 0;
  _$jscoverage['/util/string.js'].lineData[53] = 0;
  _$jscoverage['/util/string.js'].lineData[54] = 0;
  _$jscoverage['/util/string.js'].lineData[56] = 0;
  _$jscoverage['/util/string.js'].lineData[58] = 0;
  _$jscoverage['/util/string.js'].lineData[60] = 0;
  _$jscoverage['/util/string.js'].lineData[61] = 0;
  _$jscoverage['/util/string.js'].lineData[64] = 0;
  _$jscoverage['/util/string.js'].lineData[65] = 0;
  _$jscoverage['/util/string.js'].lineData[66] = 0;
  _$jscoverage['/util/string.js'].lineData[67] = 0;
  _$jscoverage['/util/string.js'].lineData[69] = 0;
  _$jscoverage['/util/string.js'].lineData[70] = 0;
  _$jscoverage['/util/string.js'].lineData[72] = 0;
  _$jscoverage['/util/string.js'].lineData[73] = 0;
  _$jscoverage['/util/string.js'].lineData[74] = 0;
  _$jscoverage['/util/string.js'].lineData[75] = 0;
  _$jscoverage['/util/string.js'].lineData[76] = 0;
  _$jscoverage['/util/string.js'].lineData[77] = 0;
  _$jscoverage['/util/string.js'].lineData[79] = 0;
  _$jscoverage['/util/string.js'].lineData[86] = 0;
  _$jscoverage['/util/string.js'].lineData[87] = 0;
  _$jscoverage['/util/string.js'].lineData[106] = 0;
  _$jscoverage['/util/string.js'].lineData[107] = 0;
  _$jscoverage['/util/string.js'].lineData[109] = 0;
  _$jscoverage['/util/string.js'].lineData[110] = 0;
  _$jscoverage['/util/string.js'].lineData[111] = 0;
  _$jscoverage['/util/string.js'].lineData[118] = 0;
  _$jscoverage['/util/string.js'].lineData[119] = 0;
  _$jscoverage['/util/string.js'].lineData[120] = 0;
  _$jscoverage['/util/string.js'].lineData[121] = 0;
  _$jscoverage['/util/string.js'].lineData[122] = 0;
  _$jscoverage['/util/string.js'].lineData[125] = 0;
  _$jscoverage['/util/string.js'].lineData[126] = 0;
  _$jscoverage['/util/string.js'].lineData[127] = 0;
  _$jscoverage['/util/string.js'].lineData[128] = 0;
  _$jscoverage['/util/string.js'].lineData[130] = 0;
  _$jscoverage['/util/string.js'].lineData[131] = 0;
  _$jscoverage['/util/string.js'].lineData[133] = 0;
  _$jscoverage['/util/string.js'].lineData[134] = 0;
  _$jscoverage['/util/string.js'].lineData[137] = 0;
  _$jscoverage['/util/string.js'].lineData[138] = 0;
  _$jscoverage['/util/string.js'].lineData[139] = 0;
  _$jscoverage['/util/string.js'].lineData[141] = 0;
  _$jscoverage['/util/string.js'].lineData[144] = 0;
  _$jscoverage['/util/string.js'].lineData[147] = 0;
  _$jscoverage['/util/string.js'].lineData[157] = 0;
  _$jscoverage['/util/string.js'].lineData[168] = 0;
  _$jscoverage['/util/string.js'].lineData[169] = 0;
  _$jscoverage['/util/string.js'].lineData[179] = 0;
  _$jscoverage['/util/string.js'].lineData[182] = 0;
  _$jscoverage['/util/string.js'].lineData[192] = 0;
  _$jscoverage['/util/string.js'].lineData[203] = 0;
  _$jscoverage['/util/string.js'].lineData[207] = 0;
  _$jscoverage['/util/string.js'].lineData[218] = 0;
  _$jscoverage['/util/string.js'].lineData[219] = 0;
  _$jscoverage['/util/string.js'].lineData[222] = 0;
  _$jscoverage['/util/string.js'].lineData[223] = 0;
  _$jscoverage['/util/string.js'].lineData[224] = 0;
  _$jscoverage['/util/string.js'].lineData[226] = 0;
  _$jscoverage['/util/string.js'].lineData[236] = 0;
  _$jscoverage['/util/string.js'].lineData[237] = 0;
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
  _$jscoverage['/util/string.js'].branchData['24'] = [];
  _$jscoverage['/util/string.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['24'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['24'][3] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['24'][4] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['24'][5] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['51'] = [];
  _$jscoverage['/util/string.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['52'] = [];
  _$jscoverage['/util/string.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['53'] = [];
  _$jscoverage['/util/string.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['64'] = [];
  _$jscoverage['/util/string.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['66'] = [];
  _$jscoverage['/util/string.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['70'] = [];
  _$jscoverage['/util/string.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['72'] = [];
  _$jscoverage['/util/string.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['74'] = [];
  _$jscoverage['/util/string.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['76'] = [];
  _$jscoverage['/util/string.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['106'] = [];
  _$jscoverage['/util/string.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['109'] = [];
  _$jscoverage['/util/string.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['110'] = [];
  _$jscoverage['/util/string.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['118'] = [];
  _$jscoverage['/util/string.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['120'] = [];
  _$jscoverage['/util/string.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['133'] = [];
  _$jscoverage['/util/string.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['137'] = [];
  _$jscoverage['/util/string.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['138'] = [];
  _$jscoverage['/util/string.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['157'] = [];
  _$jscoverage['/util/string.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['169'] = [];
  _$jscoverage['/util/string.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['169'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['169'][3] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['179'] = [];
  _$jscoverage['/util/string.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['182'] = [];
  _$jscoverage['/util/string.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['218'] = [];
  _$jscoverage['/util/string.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['218'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['222'] = [];
  _$jscoverage['/util/string.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['223'] = [];
  _$jscoverage['/util/string.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['226'] = [];
  _$jscoverage['/util/string.js'].branchData['226'][1] = new BranchData();
}
_$jscoverage['/util/string.js'].branchData['226'][1].init(138, 21, 'o[name] === undefined');
function visit171_226_1(result) {
  _$jscoverage['/util/string.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['223'][1].init(22, 24, 'match.charAt(0) === \'\\\\\'');
function visit170_223_1(result) {
  _$jscoverage['/util/string.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['222'][1].init(129, 24, 'regexp || SUBSTITUTE_REG');
function visit169_222_1(result) {
  _$jscoverage['/util/string.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['218'][2].init(18, 23, 'typeof str !== \'string\'');
function visit168_218_2(result) {
  _$jscoverage['/util/string.js'].branchData['218'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['218'][1].init(18, 29, 'typeof str !== \'string\' || !o');
function visit167_218_1(result) {
  _$jscoverage['/util/string.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['182'][1].init(25, 11, 'str == null');
function visit166_182_1(result) {
  _$jscoverage['/util/string.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['179'][1].init(25, 11, 'str == null');
function visit165_179_1(result) {
  _$jscoverage['/util/string.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['169'][3].init(84, 32, 'str.indexOf(suffix, ind) === ind');
function visit164_169_3(result) {
  _$jscoverage['/util/string.js'].branchData['169'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['169'][2].init(72, 8, 'ind >= 0');
function visit163_169_2(result) {
  _$jscoverage['/util/string.js'].branchData['169'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['169'][1].init(72, 44, 'ind >= 0 && str.indexOf(suffix, ind) === ind');
function visit162_169_1(result) {
  _$jscoverage['/util/string.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['157'][1].init(21, 32, 'str.lastIndexOf(prefix, 0) === 0');
function visit161_157_1(result) {
  _$jscoverage['/util/string.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['138'][1].init(26, 19, 'S.isArray(ret[key])');
function visit160_138_1(result) {
  _$jscoverage['/util/string.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['137'][1].init(798, 10, 'key in ret');
function visit159_137_1(result) {
  _$jscoverage['/util/string.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['133'][1].init(448, 21, 'S.endsWith(key, \'[]\')');
function visit158_133_1(result) {
  _$jscoverage['/util/string.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['120'][1].init(71, 14, 'eqIndex === -1');
function visit157_120_1(result) {
  _$jscoverage['/util/string.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['118'][1].init(397, 7, 'i < len');
function visit156_118_1(result) {
  _$jscoverage['/util/string.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['110'][1].init(161, 8, 'eq || EQ');
function visit155_110_1(result) {
  _$jscoverage['/util/string.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['109'][1].init(131, 10, 'sep || SEP');
function visit154_109_1(result) {
  _$jscoverage['/util/string.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['106'][2].init(18, 23, 'typeof str !== \'string\'');
function visit153_106_2(result) {
  _$jscoverage['/util/string.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['106'][1].init(18, 47, 'typeof str !== \'string\' || !(str = S.trim(str))');
function visit152_106_1(result) {
  _$jscoverage['/util/string.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['76'][1].init(119, 15, 'v !== undefined');
function visit151_76_1(result) {
  _$jscoverage['/util/string.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['74'][1].init(67, 20, 'isValidParamValue(v)');
function visit150_74_1(result) {
  _$jscoverage['/util/string.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['72'][1].init(99, 7, 'i < len');
function visit149_72_1(result) {
  _$jscoverage['/util/string.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['70'][1].init(398, 28, 'S.isArray(val) && val.length');
function visit148_70_1(result) {
  _$jscoverage['/util/string.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['66'][1].init(62, 17, 'val !== undefined');
function visit147_66_1(result) {
  _$jscoverage['/util/string.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['64'][1].init(142, 22, 'isValidParamValue(val)');
function visit146_64_1(result) {
  _$jscoverage['/util/string.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['53'][1].init(77, 28, 'serializeArray === undefined');
function visit145_53_1(result) {
  _$jscoverage['/util/string.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['52'][1].init(50, 8, 'eq || EQ');
function visit144_52_1(result) {
  _$jscoverage['/util/string.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['51'][1].init(20, 10, 'sep || SEP');
function visit143_51_1(result) {
  _$jscoverage['/util/string.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['24'][5].init(169, 16, 't !== \'function\'');
function visit142_24_5(result) {
  _$jscoverage['/util/string.js'].branchData['24'][5].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['24'][4].init(151, 14, 't !== \'object\'');
function visit141_24_4(result) {
  _$jscoverage['/util/string.js'].branchData['24'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['24'][3].init(151, 34, 't !== \'object\' && t !== \'function\'');
function visit140_24_3(result) {
  _$jscoverage['/util/string.js'].branchData['24'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['24'][2].init(135, 11, 'val == null');
function visit139_24_2(result) {
  _$jscoverage['/util/string.js'].branchData['24'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['24'][1].init(135, 51, 'val == null || (t !== \'object\' && t !== \'function\')');
function visit138_24_1(result) {
  _$jscoverage['/util/string.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].lineData[7]++;
KISSY.add(function(S, undefined) {
  _$jscoverage['/util/string.js'].functionData[0]++;
  _$jscoverage['/util/string.js'].lineData[8]++;
  var logger = S.getLogger('s/util');
  _$jscoverage['/util/string.js'].lineData[12]++;
  var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g, EMPTY = '';
  _$jscoverage['/util/string.js'].lineData[14]++;
  var RE_DASH = /-([a-z])/ig;
  _$jscoverage['/util/string.js'].lineData[15]++;
  var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g, trim = String.prototype.trim;
  _$jscoverage['/util/string.js'].lineData[17]++;
  var SEP = '&', EQ = '=', TRUE = true;
  _$jscoverage['/util/string.js'].lineData[21]++;
  function isValidParamValue(val) {
    _$jscoverage['/util/string.js'].functionData[1]++;
    _$jscoverage['/util/string.js'].lineData[22]++;
    var t = typeof val;
    _$jscoverage['/util/string.js'].lineData[24]++;
    return visit138_24_1(visit139_24_2(val == null) || (visit140_24_3(visit141_24_4(t !== 'object') && visit142_24_5(t !== 'function'))));
  }
  _$jscoverage['/util/string.js'].lineData[27]++;
  function upperCase() {
    _$jscoverage['/util/string.js'].functionData[2]++;
    _$jscoverage['/util/string.js'].lineData[28]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/util/string.js'].lineData[31]++;
  S.mix(S, {
  param: function(o, sep, eq, serializeArray) {
  _$jscoverage['/util/string.js'].functionData[3]++;
  _$jscoverage['/util/string.js'].lineData[51]++;
  sep = visit143_51_1(sep || SEP);
  _$jscoverage['/util/string.js'].lineData[52]++;
  eq = visit144_52_1(eq || EQ);
  _$jscoverage['/util/string.js'].lineData[53]++;
  if (visit145_53_1(serializeArray === undefined)) {
    _$jscoverage['/util/string.js'].lineData[54]++;
    serializeArray = TRUE;
  }
  _$jscoverage['/util/string.js'].lineData[56]++;
  var buf = [], key, i, v, len, val, encode = S.urlEncode;
  _$jscoverage['/util/string.js'].lineData[58]++;
  for (key in o) {
    _$jscoverage['/util/string.js'].lineData[60]++;
    val = o[key];
    _$jscoverage['/util/string.js'].lineData[61]++;
    key = encode(key);
    _$jscoverage['/util/string.js'].lineData[64]++;
    if (visit146_64_1(isValidParamValue(val))) {
      _$jscoverage['/util/string.js'].lineData[65]++;
      buf.push(key);
      _$jscoverage['/util/string.js'].lineData[66]++;
      if (visit147_66_1(val !== undefined)) {
        _$jscoverage['/util/string.js'].lineData[67]++;
        buf.push(eq, encode(val + EMPTY));
      }
      _$jscoverage['/util/string.js'].lineData[69]++;
      buf.push(sep);
    } else {
      _$jscoverage['/util/string.js'].lineData[70]++;
      if (visit148_70_1(S.isArray(val) && val.length)) {
        _$jscoverage['/util/string.js'].lineData[72]++;
        for (i = 0 , len = val.length; visit149_72_1(i < len); ++i) {
          _$jscoverage['/util/string.js'].lineData[73]++;
          v = val[i];
          _$jscoverage['/util/string.js'].lineData[74]++;
          if (visit150_74_1(isValidParamValue(v))) {
            _$jscoverage['/util/string.js'].lineData[75]++;
            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
            _$jscoverage['/util/string.js'].lineData[76]++;
            if (visit151_76_1(v !== undefined)) {
              _$jscoverage['/util/string.js'].lineData[77]++;
              buf.push(eq, encode(v + EMPTY));
            }
            _$jscoverage['/util/string.js'].lineData[79]++;
            buf.push(sep);
          }
        }
      }
    }
  }
  _$jscoverage['/util/string.js'].lineData[86]++;
  buf.pop();
  _$jscoverage['/util/string.js'].lineData[87]++;
  return buf.join(EMPTY);
}, 
  unparam: function(str, sep, eq) {
  _$jscoverage['/util/string.js'].functionData[4]++;
  _$jscoverage['/util/string.js'].lineData[106]++;
  if (visit152_106_1(visit153_106_2(typeof str !== 'string') || !(str = S.trim(str)))) {
    _$jscoverage['/util/string.js'].lineData[107]++;
    return {};
  }
  _$jscoverage['/util/string.js'].lineData[109]++;
  sep = visit154_109_1(sep || SEP);
  _$jscoverage['/util/string.js'].lineData[110]++;
  eq = visit155_110_1(eq || EQ);
  _$jscoverage['/util/string.js'].lineData[111]++;
  var ret = {}, eqIndex, decode = S.urlDecode, pairs = str.split(sep), key, val, i = 0, len = pairs.length;
  _$jscoverage['/util/string.js'].lineData[118]++;
  for (; visit156_118_1(i < len); ++i) {
    _$jscoverage['/util/string.js'].lineData[119]++;
    eqIndex = pairs[i].indexOf(eq);
    _$jscoverage['/util/string.js'].lineData[120]++;
    if (visit157_120_1(eqIndex === -1)) {
      _$jscoverage['/util/string.js'].lineData[121]++;
      key = decode(pairs[i]);
      _$jscoverage['/util/string.js'].lineData[122]++;
      val = undefined;
    } else {
      _$jscoverage['/util/string.js'].lineData[125]++;
      key = decode(pairs[i].substring(0, eqIndex));
      _$jscoverage['/util/string.js'].lineData[126]++;
      val = pairs[i].substring(eqIndex + 1);
      _$jscoverage['/util/string.js'].lineData[127]++;
      try {
        _$jscoverage['/util/string.js'].lineData[128]++;
        val = decode(val);
      }      catch (e) {
  _$jscoverage['/util/string.js'].lineData[130]++;
  logger.error('decodeURIComponent error : ' + val);
  _$jscoverage['/util/string.js'].lineData[131]++;
  logger.error(e);
}
      _$jscoverage['/util/string.js'].lineData[133]++;
      if (visit158_133_1(S.endsWith(key, '[]'))) {
        _$jscoverage['/util/string.js'].lineData[134]++;
        key = key.substring(0, key.length - 2);
      }
    }
    _$jscoverage['/util/string.js'].lineData[137]++;
    if (visit159_137_1(key in ret)) {
      _$jscoverage['/util/string.js'].lineData[138]++;
      if (visit160_138_1(S.isArray(ret[key]))) {
        _$jscoverage['/util/string.js'].lineData[139]++;
        ret[key].push(val);
      } else {
        _$jscoverage['/util/string.js'].lineData[141]++;
        ret[key] = [ret[key], val];
      }
    } else {
      _$jscoverage['/util/string.js'].lineData[144]++;
      ret[key] = val;
    }
  }
  _$jscoverage['/util/string.js'].lineData[147]++;
  return ret;
}, 
  startsWith: function(str, prefix) {
  _$jscoverage['/util/string.js'].functionData[5]++;
  _$jscoverage['/util/string.js'].lineData[157]++;
  return visit161_157_1(str.lastIndexOf(prefix, 0) === 0);
}, 
  endsWith: function(str, suffix) {
  _$jscoverage['/util/string.js'].functionData[6]++;
  _$jscoverage['/util/string.js'].lineData[168]++;
  var ind = str.length - suffix.length;
  _$jscoverage['/util/string.js'].lineData[169]++;
  return visit162_169_1(visit163_169_2(ind >= 0) && visit164_169_3(str.indexOf(suffix, ind) === ind));
}, 
  trim: trim ? function(str) {
  _$jscoverage['/util/string.js'].functionData[7]++;
  _$jscoverage['/util/string.js'].lineData[179]++;
  return visit165_179_1(str == null) ? EMPTY : trim.call(str);
} : function(str) {
  _$jscoverage['/util/string.js'].functionData[8]++;
  _$jscoverage['/util/string.js'].lineData[182]++;
  return visit166_182_1(str == null) ? EMPTY : (str + '').replace(RE_TRIM, EMPTY);
}, 
  urlEncode: function(s) {
  _$jscoverage['/util/string.js'].functionData[9]++;
  _$jscoverage['/util/string.js'].lineData[192]++;
  return encodeURIComponent(String(s));
}, 
  urlDecode: function(s) {
  _$jscoverage['/util/string.js'].functionData[10]++;
  _$jscoverage['/util/string.js'].lineData[203]++;
  return decodeURIComponent(s.replace(/\+/g, ' '));
}, 
  camelCase: function(name) {
  _$jscoverage['/util/string.js'].functionData[11]++;
  _$jscoverage['/util/string.js'].lineData[207]++;
  return name.replace(RE_DASH, upperCase);
}, 
  substitute: function(str, o, regexp) {
  _$jscoverage['/util/string.js'].functionData[12]++;
  _$jscoverage['/util/string.js'].lineData[218]++;
  if (visit167_218_1(visit168_218_2(typeof str !== 'string') || !o)) {
    _$jscoverage['/util/string.js'].lineData[219]++;
    return str;
  }
  _$jscoverage['/util/string.js'].lineData[222]++;
  return str.replace(visit169_222_1(regexp || SUBSTITUTE_REG), function(match, name) {
  _$jscoverage['/util/string.js'].functionData[13]++;
  _$jscoverage['/util/string.js'].lineData[223]++;
  if (visit170_223_1(match.charAt(0) === '\\')) {
    _$jscoverage['/util/string.js'].lineData[224]++;
    return match.slice(1);
  }
  _$jscoverage['/util/string.js'].lineData[226]++;
  return (visit171_226_1(o[name] === undefined)) ? EMPTY : o[name];
});
}, 
  ucfirst: function(s) {
  _$jscoverage['/util/string.js'].functionData[14]++;
  _$jscoverage['/util/string.js'].lineData[236]++;
  s += '';
  _$jscoverage['/util/string.js'].lineData[237]++;
  return s.charAt(0).toUpperCase() + s.substring(1);
}});
});
