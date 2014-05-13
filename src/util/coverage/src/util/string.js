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
  _$jscoverage['/util/string.js'].lineData[29] = 0;
  _$jscoverage['/util/string.js'].lineData[30] = 0;
  _$jscoverage['/util/string.js'].lineData[33] = 0;
  _$jscoverage['/util/string.js'].lineData[53] = 0;
  _$jscoverage['/util/string.js'].lineData[54] = 0;
  _$jscoverage['/util/string.js'].lineData[55] = 0;
  _$jscoverage['/util/string.js'].lineData[56] = 0;
  _$jscoverage['/util/string.js'].lineData[58] = 0;
  _$jscoverage['/util/string.js'].lineData[60] = 0;
  _$jscoverage['/util/string.js'].lineData[62] = 0;
  _$jscoverage['/util/string.js'].lineData[63] = 0;
  _$jscoverage['/util/string.js'].lineData[66] = 0;
  _$jscoverage['/util/string.js'].lineData[67] = 0;
  _$jscoverage['/util/string.js'].lineData[68] = 0;
  _$jscoverage['/util/string.js'].lineData[69] = 0;
  _$jscoverage['/util/string.js'].lineData[71] = 0;
  _$jscoverage['/util/string.js'].lineData[72] = 0;
  _$jscoverage['/util/string.js'].lineData[74] = 0;
  _$jscoverage['/util/string.js'].lineData[75] = 0;
  _$jscoverage['/util/string.js'].lineData[76] = 0;
  _$jscoverage['/util/string.js'].lineData[77] = 0;
  _$jscoverage['/util/string.js'].lineData[78] = 0;
  _$jscoverage['/util/string.js'].lineData[79] = 0;
  _$jscoverage['/util/string.js'].lineData[81] = 0;
  _$jscoverage['/util/string.js'].lineData[88] = 0;
  _$jscoverage['/util/string.js'].lineData[89] = 0;
  _$jscoverage['/util/string.js'].lineData[108] = 0;
  _$jscoverage['/util/string.js'].lineData[109] = 0;
  _$jscoverage['/util/string.js'].lineData[111] = 0;
  _$jscoverage['/util/string.js'].lineData[112] = 0;
  _$jscoverage['/util/string.js'].lineData[113] = 0;
  _$jscoverage['/util/string.js'].lineData[120] = 0;
  _$jscoverage['/util/string.js'].lineData[121] = 0;
  _$jscoverage['/util/string.js'].lineData[122] = 0;
  _$jscoverage['/util/string.js'].lineData[123] = 0;
  _$jscoverage['/util/string.js'].lineData[124] = 0;
  _$jscoverage['/util/string.js'].lineData[127] = 0;
  _$jscoverage['/util/string.js'].lineData[128] = 0;
  _$jscoverage['/util/string.js'].lineData[129] = 0;
  _$jscoverage['/util/string.js'].lineData[130] = 0;
  _$jscoverage['/util/string.js'].lineData[132] = 0;
  _$jscoverage['/util/string.js'].lineData[133] = 0;
  _$jscoverage['/util/string.js'].lineData[135] = 0;
  _$jscoverage['/util/string.js'].lineData[136] = 0;
  _$jscoverage['/util/string.js'].lineData[139] = 0;
  _$jscoverage['/util/string.js'].lineData[140] = 0;
  _$jscoverage['/util/string.js'].lineData[141] = 0;
  _$jscoverage['/util/string.js'].lineData[143] = 0;
  _$jscoverage['/util/string.js'].lineData[146] = 0;
  _$jscoverage['/util/string.js'].lineData[149] = 0;
  _$jscoverage['/util/string.js'].lineData[159] = 0;
  _$jscoverage['/util/string.js'].lineData[170] = 0;
  _$jscoverage['/util/string.js'].lineData[171] = 0;
  _$jscoverage['/util/string.js'].lineData[181] = 0;
  _$jscoverage['/util/string.js'].lineData[184] = 0;
  _$jscoverage['/util/string.js'].lineData[194] = 0;
  _$jscoverage['/util/string.js'].lineData[205] = 0;
  _$jscoverage['/util/string.js'].lineData[209] = 0;
  _$jscoverage['/util/string.js'].lineData[220] = 0;
  _$jscoverage['/util/string.js'].lineData[221] = 0;
  _$jscoverage['/util/string.js'].lineData[224] = 0;
  _$jscoverage['/util/string.js'].lineData[225] = 0;
  _$jscoverage['/util/string.js'].lineData[226] = 0;
  _$jscoverage['/util/string.js'].lineData[228] = 0;
  _$jscoverage['/util/string.js'].lineData[238] = 0;
  _$jscoverage['/util/string.js'].lineData[239] = 0;
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
  _$jscoverage['/util/string.js'].branchData['53'] = [];
  _$jscoverage['/util/string.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['54'] = [];
  _$jscoverage['/util/string.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['55'] = [];
  _$jscoverage['/util/string.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['66'] = [];
  _$jscoverage['/util/string.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['68'] = [];
  _$jscoverage['/util/string.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['72'] = [];
  _$jscoverage['/util/string.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['74'] = [];
  _$jscoverage['/util/string.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['76'] = [];
  _$jscoverage['/util/string.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['78'] = [];
  _$jscoverage['/util/string.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['108'] = [];
  _$jscoverage['/util/string.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['111'] = [];
  _$jscoverage['/util/string.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['112'] = [];
  _$jscoverage['/util/string.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['120'] = [];
  _$jscoverage['/util/string.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['122'] = [];
  _$jscoverage['/util/string.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['135'] = [];
  _$jscoverage['/util/string.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['139'] = [];
  _$jscoverage['/util/string.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['140'] = [];
  _$jscoverage['/util/string.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['159'] = [];
  _$jscoverage['/util/string.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['171'] = [];
  _$jscoverage['/util/string.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['171'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['171'][3] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['181'] = [];
  _$jscoverage['/util/string.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['184'] = [];
  _$jscoverage['/util/string.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['220'] = [];
  _$jscoverage['/util/string.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['220'][2] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['224'] = [];
  _$jscoverage['/util/string.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['225'] = [];
  _$jscoverage['/util/string.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/util/string.js'].branchData['228'] = [];
  _$jscoverage['/util/string.js'].branchData['228'][1] = new BranchData();
}
_$jscoverage['/util/string.js'].branchData['228'][1].init(138, 17, 'o[name] === undef');
function visit176_228_1(result) {
  _$jscoverage['/util/string.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['225'][1].init(22, 24, 'match.charAt(0) === \'\\\\\'');
function visit175_225_1(result) {
  _$jscoverage['/util/string.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['224'][1].init(129, 24, 'regexp || SUBSTITUTE_REG');
function visit174_224_1(result) {
  _$jscoverage['/util/string.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['220'][2].init(18, 23, 'typeof str !== \'string\'');
function visit173_220_2(result) {
  _$jscoverage['/util/string.js'].branchData['220'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['220'][1].init(18, 29, 'typeof str !== \'string\' || !o');
function visit172_220_1(result) {
  _$jscoverage['/util/string.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['184'][1].init(25, 11, 'str == null');
function visit171_184_1(result) {
  _$jscoverage['/util/string.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['181'][1].init(25, 11, 'str == null');
function visit170_181_1(result) {
  _$jscoverage['/util/string.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['171'][3].init(84, 32, 'str.indexOf(suffix, ind) === ind');
function visit169_171_3(result) {
  _$jscoverage['/util/string.js'].branchData['171'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['171'][2].init(72, 8, 'ind >= 0');
function visit168_171_2(result) {
  _$jscoverage['/util/string.js'].branchData['171'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['171'][1].init(72, 44, 'ind >= 0 && str.indexOf(suffix, ind) === ind');
function visit167_171_1(result) {
  _$jscoverage['/util/string.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['159'][1].init(21, 32, 'str.lastIndexOf(prefix, 0) === 0');
function visit166_159_1(result) {
  _$jscoverage['/util/string.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['140'][1].init(26, 22, 'util.isArray(ret[key])');
function visit165_140_1(result) {
  _$jscoverage['/util/string.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['139'][1].init(797, 10, 'key in ret');
function visit164_139_1(result) {
  _$jscoverage['/util/string.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['135'][1].init(448, 24, 'util.endsWith(key, \'[]\')');
function visit163_135_1(result) {
  _$jscoverage['/util/string.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['122'][1].init(71, 14, 'eqIndex === -1');
function visit162_122_1(result) {
  _$jscoverage['/util/string.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['120'][1].init(403, 7, 'i < len');
function visit161_120_1(result) {
  _$jscoverage['/util/string.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['112'][1].init(164, 8, 'eq || EQ');
function visit160_112_1(result) {
  _$jscoverage['/util/string.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['111'][1].init(134, 10, 'sep || SEP');
function visit159_111_1(result) {
  _$jscoverage['/util/string.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['108'][2].init(18, 23, 'typeof str !== \'string\'');
function visit158_108_2(result) {
  _$jscoverage['/util/string.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['108'][1].init(18, 50, 'typeof str !== \'string\' || !(str = util.trim(str))');
function visit157_108_1(result) {
  _$jscoverage['/util/string.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['78'][1].init(119, 11, 'v !== undef');
function visit156_78_1(result) {
  _$jscoverage['/util/string.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['76'][1].init(67, 20, 'isValidParamValue(v)');
function visit155_76_1(result) {
  _$jscoverage['/util/string.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['74'][1].init(99, 7, 'i < len');
function visit154_74_1(result) {
  _$jscoverage['/util/string.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['72'][1].init(394, 31, 'util.isArray(val) && val.length');
function visit153_72_1(result) {
  _$jscoverage['/util/string.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['68'][1].init(62, 13, 'val !== undef');
function visit152_68_1(result) {
  _$jscoverage['/util/string.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['66'][1].init(142, 22, 'isValidParamValue(val)');
function visit151_66_1(result) {
  _$jscoverage['/util/string.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['55'][1].init(77, 24, 'serializeArray === undef');
function visit150_55_1(result) {
  _$jscoverage['/util/string.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['54'][1].init(50, 8, 'eq || EQ');
function visit149_54_1(result) {
  _$jscoverage['/util/string.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['53'][1].init(20, 10, 'sep || SEP');
function visit148_53_1(result) {
  _$jscoverage['/util/string.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][5].init(165, 16, 't !== \'function\'');
function visit147_25_5(result) {
  _$jscoverage['/util/string.js'].branchData['25'][5].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][4].init(147, 14, 't !== \'object\'');
function visit146_25_4(result) {
  _$jscoverage['/util/string.js'].branchData['25'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][3].init(147, 34, 't !== \'object\' && t !== \'function\'');
function visit145_25_3(result) {
  _$jscoverage['/util/string.js'].branchData['25'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][2].init(131, 11, 'val == null');
function visit144_25_2(result) {
  _$jscoverage['/util/string.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/string.js'].branchData['25'][1].init(131, 51, 'val == null || (t !== \'object\' && t !== \'function\')');
function visit143_25_1(result) {
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
  var logger = S.getLogger('s/util');
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
    return visit143_25_1(visit144_25_2(val == null) || (visit145_25_3(visit146_25_4(t !== 'object') && visit147_25_5(t !== 'function'))));
  }
  _$jscoverage['/util/string.js'].lineData[28]++;
  var RE_DASH = /-([a-z])/ig;
  _$jscoverage['/util/string.js'].lineData[29]++;
  function upperCase() {
    _$jscoverage['/util/string.js'].functionData[2]++;
    _$jscoverage['/util/string.js'].lineData[30]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/util/string.js'].lineData[33]++;
  util.mix(util, {
  param: function(o, sep, eq, serializeArray) {
  _$jscoverage['/util/string.js'].functionData[3]++;
  _$jscoverage['/util/string.js'].lineData[53]++;
  sep = visit148_53_1(sep || SEP);
  _$jscoverage['/util/string.js'].lineData[54]++;
  eq = visit149_54_1(eq || EQ);
  _$jscoverage['/util/string.js'].lineData[55]++;
  if (visit150_55_1(serializeArray === undef)) {
    _$jscoverage['/util/string.js'].lineData[56]++;
    serializeArray = TRUE;
  }
  _$jscoverage['/util/string.js'].lineData[58]++;
  var buf = [], key, i, v, len, val, encode = util.urlEncode;
  _$jscoverage['/util/string.js'].lineData[60]++;
  for (key in o) {
    _$jscoverage['/util/string.js'].lineData[62]++;
    val = o[key];
    _$jscoverage['/util/string.js'].lineData[63]++;
    key = encode(key);
    _$jscoverage['/util/string.js'].lineData[66]++;
    if (visit151_66_1(isValidParamValue(val))) {
      _$jscoverage['/util/string.js'].lineData[67]++;
      buf.push(key);
      _$jscoverage['/util/string.js'].lineData[68]++;
      if (visit152_68_1(val !== undef)) {
        _$jscoverage['/util/string.js'].lineData[69]++;
        buf.push(eq, encode(val + EMPTY));
      }
      _$jscoverage['/util/string.js'].lineData[71]++;
      buf.push(sep);
    } else {
      _$jscoverage['/util/string.js'].lineData[72]++;
      if (visit153_72_1(util.isArray(val) && val.length)) {
        _$jscoverage['/util/string.js'].lineData[74]++;
        for (i = 0 , len = val.length; visit154_74_1(i < len); ++i) {
          _$jscoverage['/util/string.js'].lineData[75]++;
          v = val[i];
          _$jscoverage['/util/string.js'].lineData[76]++;
          if (visit155_76_1(isValidParamValue(v))) {
            _$jscoverage['/util/string.js'].lineData[77]++;
            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
            _$jscoverage['/util/string.js'].lineData[78]++;
            if (visit156_78_1(v !== undef)) {
              _$jscoverage['/util/string.js'].lineData[79]++;
              buf.push(eq, encode(v + EMPTY));
            }
            _$jscoverage['/util/string.js'].lineData[81]++;
            buf.push(sep);
          }
        }
      }
    }
  }
  _$jscoverage['/util/string.js'].lineData[88]++;
  buf.pop();
  _$jscoverage['/util/string.js'].lineData[89]++;
  return buf.join(EMPTY);
}, 
  unparam: function(str, sep, eq) {
  _$jscoverage['/util/string.js'].functionData[4]++;
  _$jscoverage['/util/string.js'].lineData[108]++;
  if (visit157_108_1(visit158_108_2(typeof str !== 'string') || !(str = util.trim(str)))) {
    _$jscoverage['/util/string.js'].lineData[109]++;
    return {};
  }
  _$jscoverage['/util/string.js'].lineData[111]++;
  sep = visit159_111_1(sep || SEP);
  _$jscoverage['/util/string.js'].lineData[112]++;
  eq = visit160_112_1(eq || EQ);
  _$jscoverage['/util/string.js'].lineData[113]++;
  var ret = {}, eqIndex, decode = util.urlDecode, pairs = str.split(sep), key, val, i = 0, len = pairs.length;
  _$jscoverage['/util/string.js'].lineData[120]++;
  for (; visit161_120_1(i < len); ++i) {
    _$jscoverage['/util/string.js'].lineData[121]++;
    eqIndex = pairs[i].indexOf(eq);
    _$jscoverage['/util/string.js'].lineData[122]++;
    if (visit162_122_1(eqIndex === -1)) {
      _$jscoverage['/util/string.js'].lineData[123]++;
      key = decode(pairs[i]);
      _$jscoverage['/util/string.js'].lineData[124]++;
      val = undef;
    } else {
      _$jscoverage['/util/string.js'].lineData[127]++;
      key = decode(pairs[i].substring(0, eqIndex));
      _$jscoverage['/util/string.js'].lineData[128]++;
      val = pairs[i].substring(eqIndex + 1);
      _$jscoverage['/util/string.js'].lineData[129]++;
      try {
        _$jscoverage['/util/string.js'].lineData[130]++;
        val = decode(val);
      }      catch (e) {
  _$jscoverage['/util/string.js'].lineData[132]++;
  logger.error('decodeURIComponent error : ' + val);
  _$jscoverage['/util/string.js'].lineData[133]++;
  logger.error(e);
}
      _$jscoverage['/util/string.js'].lineData[135]++;
      if (visit163_135_1(util.endsWith(key, '[]'))) {
        _$jscoverage['/util/string.js'].lineData[136]++;
        key = key.substring(0, key.length - 2);
      }
    }
    _$jscoverage['/util/string.js'].lineData[139]++;
    if (visit164_139_1(key in ret)) {
      _$jscoverage['/util/string.js'].lineData[140]++;
      if (visit165_140_1(util.isArray(ret[key]))) {
        _$jscoverage['/util/string.js'].lineData[141]++;
        ret[key].push(val);
      } else {
        _$jscoverage['/util/string.js'].lineData[143]++;
        ret[key] = [ret[key], val];
      }
    } else {
      _$jscoverage['/util/string.js'].lineData[146]++;
      ret[key] = val;
    }
  }
  _$jscoverage['/util/string.js'].lineData[149]++;
  return ret;
}, 
  startsWith: function(str, prefix) {
  _$jscoverage['/util/string.js'].functionData[5]++;
  _$jscoverage['/util/string.js'].lineData[159]++;
  return visit166_159_1(str.lastIndexOf(prefix, 0) === 0);
}, 
  endsWith: function(str, suffix) {
  _$jscoverage['/util/string.js'].functionData[6]++;
  _$jscoverage['/util/string.js'].lineData[170]++;
  var ind = str.length - suffix.length;
  _$jscoverage['/util/string.js'].lineData[171]++;
  return visit167_171_1(visit168_171_2(ind >= 0) && visit169_171_3(str.indexOf(suffix, ind) === ind));
}, 
  trim: trim ? function(str) {
  _$jscoverage['/util/string.js'].functionData[7]++;
  _$jscoverage['/util/string.js'].lineData[181]++;
  return visit170_181_1(str == null) ? EMPTY : trim.call(str);
} : function(str) {
  _$jscoverage['/util/string.js'].functionData[8]++;
  _$jscoverage['/util/string.js'].lineData[184]++;
  return visit171_184_1(str == null) ? EMPTY : (str + '').replace(RE_TRIM, EMPTY);
}, 
  urlEncode: function(s) {
  _$jscoverage['/util/string.js'].functionData[9]++;
  _$jscoverage['/util/string.js'].lineData[194]++;
  return encodeURIComponent(String(s));
}, 
  urlDecode: function(s) {
  _$jscoverage['/util/string.js'].functionData[10]++;
  _$jscoverage['/util/string.js'].lineData[205]++;
  return decodeURIComponent(s.replace(/\+/g, ' '));
}, 
  camelCase: function(name) {
  _$jscoverage['/util/string.js'].functionData[11]++;
  _$jscoverage['/util/string.js'].lineData[209]++;
  return name.replace(RE_DASH, upperCase);
}, 
  substitute: function(str, o, regexp) {
  _$jscoverage['/util/string.js'].functionData[12]++;
  _$jscoverage['/util/string.js'].lineData[220]++;
  if (visit172_220_1(visit173_220_2(typeof str !== 'string') || !o)) {
    _$jscoverage['/util/string.js'].lineData[221]++;
    return str;
  }
  _$jscoverage['/util/string.js'].lineData[224]++;
  return str.replace(visit174_224_1(regexp || SUBSTITUTE_REG), function(match, name) {
  _$jscoverage['/util/string.js'].functionData[13]++;
  _$jscoverage['/util/string.js'].lineData[225]++;
  if (visit175_225_1(match.charAt(0) === '\\')) {
    _$jscoverage['/util/string.js'].lineData[226]++;
    return match.slice(1);
  }
  _$jscoverage['/util/string.js'].lineData[228]++;
  return (visit176_228_1(o[name] === undef)) ? EMPTY : o[name];
});
}, 
  ucfirst: function(s) {
  _$jscoverage['/util/string.js'].functionData[14]++;
  _$jscoverage['/util/string.js'].lineData[238]++;
  s += '';
  _$jscoverage['/util/string.js'].lineData[239]++;
  return s.charAt(0).toUpperCase() + s.substring(1);
}});
});
