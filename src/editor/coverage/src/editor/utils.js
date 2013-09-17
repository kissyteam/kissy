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
if (! _$jscoverage['/editor/utils.js']) {
  _$jscoverage['/editor/utils.js'] = {};
  _$jscoverage['/editor/utils.js'].lineData = [];
  _$jscoverage['/editor/utils.js'].lineData[6] = 0;
  _$jscoverage['/editor/utils.js'].lineData[7] = 0;
  _$jscoverage['/editor/utils.js'].lineData[21] = 0;
  _$jscoverage['/editor/utils.js'].lineData[22] = 0;
  _$jscoverage['/editor/utils.js'].lineData[23] = 0;
  _$jscoverage['/editor/utils.js'].lineData[25] = 0;
  _$jscoverage['/editor/utils.js'].lineData[26] = 0;
  _$jscoverage['/editor/utils.js'].lineData[27] = 0;
  _$jscoverage['/editor/utils.js'].lineData[29] = 0;
  _$jscoverage['/editor/utils.js'].lineData[31] = 0;
  _$jscoverage['/editor/utils.js'].lineData[33] = 0;
  _$jscoverage['/editor/utils.js'].lineData[37] = 0;
  _$jscoverage['/editor/utils.js'].lineData[38] = 0;
  _$jscoverage['/editor/utils.js'].lineData[39] = 0;
  _$jscoverage['/editor/utils.js'].lineData[40] = 0;
  _$jscoverage['/editor/utils.js'].lineData[41] = 0;
  _$jscoverage['/editor/utils.js'].lineData[46] = 0;
  _$jscoverage['/editor/utils.js'].lineData[50] = 0;
  _$jscoverage['/editor/utils.js'].lineData[51] = 0;
  _$jscoverage['/editor/utils.js'].lineData[54] = 0;
  _$jscoverage['/editor/utils.js'].lineData[55] = 0;
  _$jscoverage['/editor/utils.js'].lineData[56] = 0;
  _$jscoverage['/editor/utils.js'].lineData[58] = 0;
  _$jscoverage['/editor/utils.js'].lineData[62] = 0;
  _$jscoverage['/editor/utils.js'].lineData[63] = 0;
  _$jscoverage['/editor/utils.js'].lineData[64] = 0;
  _$jscoverage['/editor/utils.js'].lineData[65] = 0;
  _$jscoverage['/editor/utils.js'].lineData[66] = 0;
  _$jscoverage['/editor/utils.js'].lineData[67] = 0;
  _$jscoverage['/editor/utils.js'].lineData[72] = 0;
  _$jscoverage['/editor/utils.js'].lineData[76] = 0;
  _$jscoverage['/editor/utils.js'].lineData[77] = 0;
  _$jscoverage['/editor/utils.js'].lineData[82] = 0;
  _$jscoverage['/editor/utils.js'].lineData[86] = 0;
  _$jscoverage['/editor/utils.js'].lineData[90] = 0;
  _$jscoverage['/editor/utils.js'].lineData[94] = 0;
  _$jscoverage['/editor/utils.js'].lineData[95] = 0;
  _$jscoverage['/editor/utils.js'].lineData[99] = 0;
  _$jscoverage['/editor/utils.js'].lineData[100] = 0;
  _$jscoverage['/editor/utils.js'].lineData[101] = 0;
  _$jscoverage['/editor/utils.js'].lineData[104] = 0;
  _$jscoverage['/editor/utils.js'].lineData[108] = 0;
  _$jscoverage['/editor/utils.js'].lineData[109] = 0;
  _$jscoverage['/editor/utils.js'].lineData[113] = 0;
  _$jscoverage['/editor/utils.js'].lineData[114] = 0;
  _$jscoverage['/editor/utils.js'].lineData[115] = 0;
  _$jscoverage['/editor/utils.js'].lineData[116] = 0;
  _$jscoverage['/editor/utils.js'].lineData[117] = 0;
  _$jscoverage['/editor/utils.js'].lineData[118] = 0;
  _$jscoverage['/editor/utils.js'].lineData[123] = 0;
  _$jscoverage['/editor/utils.js'].lineData[124] = 0;
  _$jscoverage['/editor/utils.js'].lineData[125] = 0;
  _$jscoverage['/editor/utils.js'].lineData[127] = 0;
  _$jscoverage['/editor/utils.js'].lineData[130] = 0;
  _$jscoverage['/editor/utils.js'].lineData[131] = 0;
  _$jscoverage['/editor/utils.js'].lineData[133] = 0;
  _$jscoverage['/editor/utils.js'].lineData[137] = 0;
  _$jscoverage['/editor/utils.js'].lineData[138] = 0;
  _$jscoverage['/editor/utils.js'].lineData[139] = 0;
  _$jscoverage['/editor/utils.js'].lineData[141] = 0;
  _$jscoverage['/editor/utils.js'].lineData[142] = 0;
  _$jscoverage['/editor/utils.js'].lineData[143] = 0;
  _$jscoverage['/editor/utils.js'].lineData[144] = 0;
  _$jscoverage['/editor/utils.js'].lineData[147] = 0;
  _$jscoverage['/editor/utils.js'].lineData[148] = 0;
  _$jscoverage['/editor/utils.js'].lineData[149] = 0;
  _$jscoverage['/editor/utils.js'].lineData[150] = 0;
  _$jscoverage['/editor/utils.js'].lineData[161] = 0;
  _$jscoverage['/editor/utils.js'].lineData[162] = 0;
  _$jscoverage['/editor/utils.js'].lineData[164] = 0;
  _$jscoverage['/editor/utils.js'].lineData[165] = 0;
  _$jscoverage['/editor/utils.js'].lineData[166] = 0;
  _$jscoverage['/editor/utils.js'].lineData[170] = 0;
  _$jscoverage['/editor/utils.js'].lineData[181] = 0;
  _$jscoverage['/editor/utils.js'].lineData[183] = 0;
  _$jscoverage['/editor/utils.js'].lineData[185] = 0;
  _$jscoverage['/editor/utils.js'].lineData[190] = 0;
  _$jscoverage['/editor/utils.js'].lineData[191] = 0;
  _$jscoverage['/editor/utils.js'].lineData[192] = 0;
  _$jscoverage['/editor/utils.js'].lineData[193] = 0;
  _$jscoverage['/editor/utils.js'].lineData[194] = 0;
  _$jscoverage['/editor/utils.js'].lineData[195] = 0;
  _$jscoverage['/editor/utils.js'].lineData[196] = 0;
  _$jscoverage['/editor/utils.js'].lineData[197] = 0;
  _$jscoverage['/editor/utils.js'].lineData[198] = 0;
  _$jscoverage['/editor/utils.js'].lineData[200] = 0;
  _$jscoverage['/editor/utils.js'].lineData[201] = 0;
  _$jscoverage['/editor/utils.js'].lineData[202] = 0;
  _$jscoverage['/editor/utils.js'].lineData[205] = 0;
  _$jscoverage['/editor/utils.js'].lineData[213] = 0;
  _$jscoverage['/editor/utils.js'].lineData[214] = 0;
  _$jscoverage['/editor/utils.js'].lineData[215] = 0;
  _$jscoverage['/editor/utils.js'].lineData[219] = 0;
  _$jscoverage['/editor/utils.js'].lineData[220] = 0;
  _$jscoverage['/editor/utils.js'].lineData[221] = 0;
  _$jscoverage['/editor/utils.js'].lineData[222] = 0;
  _$jscoverage['/editor/utils.js'].lineData[223] = 0;
  _$jscoverage['/editor/utils.js'].lineData[225] = 0;
  _$jscoverage['/editor/utils.js'].lineData[226] = 0;
  _$jscoverage['/editor/utils.js'].lineData[228] = 0;
  _$jscoverage['/editor/utils.js'].lineData[229] = 0;
  _$jscoverage['/editor/utils.js'].lineData[233] = 0;
  _$jscoverage['/editor/utils.js'].lineData[237] = 0;
  _$jscoverage['/editor/utils.js'].lineData[238] = 0;
  _$jscoverage['/editor/utils.js'].lineData[243] = 0;
  _$jscoverage['/editor/utils.js'].lineData[245] = 0;
}
if (! _$jscoverage['/editor/utils.js'].functionData) {
  _$jscoverage['/editor/utils.js'].functionData = [];
  _$jscoverage['/editor/utils.js'].functionData[0] = 0;
  _$jscoverage['/editor/utils.js'].functionData[1] = 0;
  _$jscoverage['/editor/utils.js'].functionData[2] = 0;
  _$jscoverage['/editor/utils.js'].functionData[3] = 0;
  _$jscoverage['/editor/utils.js'].functionData[4] = 0;
  _$jscoverage['/editor/utils.js'].functionData[5] = 0;
  _$jscoverage['/editor/utils.js'].functionData[6] = 0;
  _$jscoverage['/editor/utils.js'].functionData[7] = 0;
  _$jscoverage['/editor/utils.js'].functionData[8] = 0;
  _$jscoverage['/editor/utils.js'].functionData[9] = 0;
  _$jscoverage['/editor/utils.js'].functionData[10] = 0;
  _$jscoverage['/editor/utils.js'].functionData[11] = 0;
  _$jscoverage['/editor/utils.js'].functionData[12] = 0;
  _$jscoverage['/editor/utils.js'].functionData[13] = 0;
  _$jscoverage['/editor/utils.js'].functionData[14] = 0;
  _$jscoverage['/editor/utils.js'].functionData[15] = 0;
  _$jscoverage['/editor/utils.js'].functionData[16] = 0;
  _$jscoverage['/editor/utils.js'].functionData[17] = 0;
  _$jscoverage['/editor/utils.js'].functionData[18] = 0;
  _$jscoverage['/editor/utils.js'].functionData[19] = 0;
  _$jscoverage['/editor/utils.js'].functionData[20] = 0;
  _$jscoverage['/editor/utils.js'].functionData[21] = 0;
  _$jscoverage['/editor/utils.js'].functionData[22] = 0;
  _$jscoverage['/editor/utils.js'].functionData[23] = 0;
  _$jscoverage['/editor/utils.js'].functionData[24] = 0;
  _$jscoverage['/editor/utils.js'].functionData[25] = 0;
}
if (! _$jscoverage['/editor/utils.js'].branchData) {
  _$jscoverage['/editor/utils.js'].branchData = {};
  _$jscoverage['/editor/utils.js'].branchData['22'] = [];
  _$jscoverage['/editor/utils.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['25'] = [];
  _$jscoverage['/editor/utils.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['26'] = [];
  _$jscoverage['/editor/utils.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['63'] = [];
  _$jscoverage['/editor/utils.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['94'] = [];
  _$jscoverage['/editor/utils.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['99'] = [];
  _$jscoverage['/editor/utils.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['114'] = [];
  _$jscoverage['/editor/utils.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['117'] = [];
  _$jscoverage['/editor/utils.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['123'] = [];
  _$jscoverage['/editor/utils.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['124'] = [];
  _$jscoverage['/editor/utils.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['138'] = [];
  _$jscoverage['/editor/utils.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['142'] = [];
  _$jscoverage['/editor/utils.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['149'] = [];
  _$jscoverage['/editor/utils.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['165'] = [];
  _$jscoverage['/editor/utils.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['174'] = [];
  _$jscoverage['/editor/utils.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['181'] = [];
  _$jscoverage['/editor/utils.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['197'] = [];
  _$jscoverage['/editor/utils.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['197'][2] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['200'] = [];
  _$jscoverage['/editor/utils.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['201'] = [];
  _$jscoverage['/editor/utils.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['213'] = [];
  _$jscoverage['/editor/utils.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['219'] = [];
  _$jscoverage['/editor/utils.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['220'] = [];
  _$jscoverage['/editor/utils.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['222'] = [];
  _$jscoverage['/editor/utils.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['225'] = [];
  _$jscoverage['/editor/utils.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['228'] = [];
  _$jscoverage['/editor/utils.js'].branchData['228'][1] = new BranchData();
}
_$jscoverage['/editor/utils.js'].branchData['228'][1].init(147, 8, 'r.remove');
function visit1071_228_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['225'][1].init(30, 9, 'r.destroy');
function visit1070_225_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['222'][1].init(63, 23, 'typeof r === \'function\'');
function visit1069_222_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['220'][1].init(79, 14, 'i < res.length');
function visit1068_220_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['219'][1].init(28, 16, 'this.__res || []');
function visit1067_219_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['213'][1].init(31, 16, 'this.__res || []');
function visit1066_213_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['201'][2].init(64, 25, 'ret[0] && ret[0].nodeType');
function visit1065_201_2(result) {
  _$jscoverage['/editor/utils.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['201'][1].init(42, 48, 'ret.__IS_NODELIST || (ret[0] && ret[0].nodeType)');
function visit1064_201_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['200'][1].init(38, 14, 'S.isArray(ret)');
function visit1063_200_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['197'][2].init(235, 31, 'ret.nodeType || S.isWindow(ret)');
function visit1062_197_2(result) {
  _$jscoverage['/editor/utils.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['197'][1].init(227, 40, 'ret && (ret.nodeType || S.isWindow(ret))');
function visit1061_197_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['181'][1].init(22, 8, 'UA[\'ie\']');
function visit1060_181_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['174'][1].init(5389, 36, 'document[\'documentMode\'] || UA[\'ie\']');
function visit1059_174_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['165'][1].init(68, 23, 'typeof v === \'function\'');
function visit1058_165_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['149'][1].init(87, 24, 'S.trim(inp.val()) == tip');
function visit1057_149_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['142'][1].init(26, 18, '!S.trim(inp.val())');
function visit1056_142_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['138'][1].init(69, 9, '!UA[\'ie\']');
function visit1055_138_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['124'][1].init(26, 35, 'inp.hasClass("ks-editor-input-tip")');
function visit1054_124_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['123'][1].init(22, 17, 'val === undefined');
function visit1053_123_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['117'][1].init(239, 9, '!UA[\'ie\']');
function visit1052_117_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['114'][1].init(82, 23, 'placeholder && UA[\'ie\']');
function visit1051_114_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['99'][1].init(264, 37, 'verify && !new RegExp(verify).test(v)');
function visit1050_99_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['94'][1].init(34, 17, 'i < inputs.length');
function visit1049_94_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['63'][1].init(95, 10, 'i < length');
function visit1048_63_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['26'][1].init(26, 22, 'url.indexOf("?") != -1');
function visit1047_26_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['25'][1].init(185, 23, 'url.indexOf("?t") == -1');
function visit1046_25_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['22'][1].init(62, 13, '!Config.debug');
function visit1045_22_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].lineData[6]++;
KISSY.add("editor/utils", function(S, Editor) {
  _$jscoverage['/editor/utils.js'].functionData[0]++;
  _$jscoverage['/editor/utils.js'].lineData[7]++;
  var TRUE = true, FALSE = false, NULL = null, Node = S.Node, Dom = S.DOM, UA = S.UA, Utils = {
  debugUrl: function(url) {
  _$jscoverage['/editor/utils.js'].functionData[1]++;
  _$jscoverage['/editor/utils.js'].lineData[21]++;
  var Config = S.Config;
  _$jscoverage['/editor/utils.js'].lineData[22]++;
  if (visit1045_22_1(!Config.debug)) {
    _$jscoverage['/editor/utils.js'].lineData[23]++;
    url = url.replace(/\.(js|css)/i, "-min.$1");
  }
  _$jscoverage['/editor/utils.js'].lineData[25]++;
  if (visit1046_25_1(url.indexOf("?t") == -1)) {
    _$jscoverage['/editor/utils.js'].lineData[26]++;
    if (visit1047_26_1(url.indexOf("?") != -1)) {
      _$jscoverage['/editor/utils.js'].lineData[27]++;
      url += "&";
    } else {
      _$jscoverage['/editor/utils.js'].lineData[29]++;
      url += "?";
    }
    _$jscoverage['/editor/utils.js'].lineData[31]++;
    url += "t=" + encodeURIComponent(Config.tag);
  }
  _$jscoverage['/editor/utils.js'].lineData[33]++;
  return Config.base + "editor/" + url;
}, 
  lazyRun: function(obj, before, after) {
  _$jscoverage['/editor/utils.js'].functionData[2]++;
  _$jscoverage['/editor/utils.js'].lineData[37]++;
  var b = obj[before], a = obj[after];
  _$jscoverage['/editor/utils.js'].lineData[38]++;
  obj[before] = function() {
  _$jscoverage['/editor/utils.js'].functionData[3]++;
  _$jscoverage['/editor/utils.js'].lineData[39]++;
  b.apply(this, arguments);
  _$jscoverage['/editor/utils.js'].lineData[40]++;
  obj[before] = obj[after];
  _$jscoverage['/editor/utils.js'].lineData[41]++;
  return a.apply(this, arguments);
};
}, 
  getXY: function(offset, editor) {
  _$jscoverage['/editor/utils.js'].functionData[4]++;
  _$jscoverage['/editor/utils.js'].lineData[46]++;
  var x = offset.left, y = offset.top, currentWindow = editor.get("window")[0];
  _$jscoverage['/editor/utils.js'].lineData[50]++;
  x -= Dom.scrollLeft(currentWindow);
  _$jscoverage['/editor/utils.js'].lineData[51]++;
  y -= Dom.scrollTop(currentWindow);
  _$jscoverage['/editor/utils.js'].lineData[54]++;
  var iframePosition = editor.get("iframe").offset();
  _$jscoverage['/editor/utils.js'].lineData[55]++;
  x += iframePosition.left;
  _$jscoverage['/editor/utils.js'].lineData[56]++;
  y += iframePosition.top;
  _$jscoverage['/editor/utils.js'].lineData[58]++;
  return {
  left: x, 
  top: y};
}, 
  tryThese: function(var_args) {
  _$jscoverage['/editor/utils.js'].functionData[5]++;
  _$jscoverage['/editor/utils.js'].lineData[62]++;
  var returnValue;
  _$jscoverage['/editor/utils.js'].lineData[63]++;
  for (var i = 0, length = arguments.length; visit1048_63_1(i < length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[64]++;
    var lambda = arguments[i];
    _$jscoverage['/editor/utils.js'].lineData[65]++;
    try {
      _$jscoverage['/editor/utils.js'].lineData[66]++;
      returnValue = lambda();
      _$jscoverage['/editor/utils.js'].lineData[67]++;
      break;
    }    catch (e) {
}
  }
  _$jscoverage['/editor/utils.js'].lineData[72]++;
  return returnValue;
}, 
  clearAllMarkers: function(database) {
  _$jscoverage['/editor/utils.js'].functionData[6]++;
  _$jscoverage['/editor/utils.js'].lineData[76]++;
  for (var i in database) {
    _$jscoverage['/editor/utils.js'].lineData[77]++;
    database[i]._4e_clearMarkers(database, TRUE, undefined);
  }
}, 
  ltrim: function(str) {
  _$jscoverage['/editor/utils.js'].functionData[7]++;
  _$jscoverage['/editor/utils.js'].lineData[82]++;
  return str.replace(/^\s+/, "");
}, 
  rtrim: function(str) {
  _$jscoverage['/editor/utils.js'].functionData[8]++;
  _$jscoverage['/editor/utils.js'].lineData[86]++;
  return str.replace(/\s+$/, "");
}, 
  isNumber: function(n) {
  _$jscoverage['/editor/utils.js'].functionData[9]++;
  _$jscoverage['/editor/utils.js'].lineData[90]++;
  return /^\d+(.\d+)?$/.test(S.trim(n));
}, 
  verifyInputs: function(inputs) {
  _$jscoverage['/editor/utils.js'].functionData[10]++;
  _$jscoverage['/editor/utils.js'].lineData[94]++;
  for (var i = 0; visit1049_94_1(i < inputs.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[95]++;
    var input = new Node(inputs[i]), v = S.trim(Utils.valInput(input)), verify = input.attr("data-verify"), warning = input.attr("data-warning");
    _$jscoverage['/editor/utils.js'].lineData[99]++;
    if (visit1050_99_1(verify && !new RegExp(verify).test(v))) {
      _$jscoverage['/editor/utils.js'].lineData[100]++;
      alert(warning);
      _$jscoverage['/editor/utils.js'].lineData[101]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[104]++;
  return TRUE;
}, 
  sourceDisable: function(editor, plugin) {
  _$jscoverage['/editor/utils.js'].functionData[11]++;
  _$jscoverage['/editor/utils.js'].lineData[108]++;
  editor.on("sourceMode", plugin.disable, plugin);
  _$jscoverage['/editor/utils.js'].lineData[109]++;
  editor.on("wysiwygMode", plugin.enable, plugin);
}, 
  resetInput: function(inp) {
  _$jscoverage['/editor/utils.js'].functionData[12]++;
  _$jscoverage['/editor/utils.js'].lineData[113]++;
  var placeholder = inp.attr("placeholder");
  _$jscoverage['/editor/utils.js'].lineData[114]++;
  if (visit1051_114_1(placeholder && UA['ie'])) {
    _$jscoverage['/editor/utils.js'].lineData[115]++;
    inp.addClass("ks-editor-input-tip");
    _$jscoverage['/editor/utils.js'].lineData[116]++;
    inp.val(placeholder);
  } else {
    _$jscoverage['/editor/utils.js'].lineData[117]++;
    if (visit1052_117_1(!UA['ie'])) {
      _$jscoverage['/editor/utils.js'].lineData[118]++;
      inp.val("");
    }
  }
}, 
  valInput: function(inp, val) {
  _$jscoverage['/editor/utils.js'].functionData[13]++;
  _$jscoverage['/editor/utils.js'].lineData[123]++;
  if (visit1053_123_1(val === undefined)) {
    _$jscoverage['/editor/utils.js'].lineData[124]++;
    if (visit1054_124_1(inp.hasClass("ks-editor-input-tip"))) {
      _$jscoverage['/editor/utils.js'].lineData[125]++;
      return "";
    } else {
      _$jscoverage['/editor/utils.js'].lineData[127]++;
      return inp.val();
    }
  } else {
    _$jscoverage['/editor/utils.js'].lineData[130]++;
    inp.removeClass("ks-editor-input-tip");
    _$jscoverage['/editor/utils.js'].lineData[131]++;
    inp.val(val);
  }
  _$jscoverage['/editor/utils.js'].lineData[133]++;
  return undefined;
}, 
  placeholder: function(inp, tip) {
  _$jscoverage['/editor/utils.js'].functionData[14]++;
  _$jscoverage['/editor/utils.js'].lineData[137]++;
  inp.attr("placeholder", tip);
  _$jscoverage['/editor/utils.js'].lineData[138]++;
  if (visit1055_138_1(!UA['ie'])) {
    _$jscoverage['/editor/utils.js'].lineData[139]++;
    return;
  }
  _$jscoverage['/editor/utils.js'].lineData[141]++;
  inp.on("blur", function() {
  _$jscoverage['/editor/utils.js'].functionData[15]++;
  _$jscoverage['/editor/utils.js'].lineData[142]++;
  if (visit1056_142_1(!S.trim(inp.val()))) {
    _$jscoverage['/editor/utils.js'].lineData[143]++;
    inp.addClass("ks-editor-input-tip");
    _$jscoverage['/editor/utils.js'].lineData[144]++;
    inp.val(tip);
  }
});
  _$jscoverage['/editor/utils.js'].lineData[147]++;
  inp.on("focus", function() {
  _$jscoverage['/editor/utils.js'].functionData[16]++;
  _$jscoverage['/editor/utils.js'].lineData[148]++;
  inp.removeClass("ks-editor-input-tip");
  _$jscoverage['/editor/utils.js'].lineData[149]++;
  if (visit1057_149_1(S.trim(inp.val()) == tip)) {
    _$jscoverage['/editor/utils.js'].lineData[150]++;
    inp.val("");
  }
});
}, 
  normParams: function(params) {
  _$jscoverage['/editor/utils.js'].functionData[17]++;
  _$jscoverage['/editor/utils.js'].lineData[161]++;
  params = S.clone(params);
  _$jscoverage['/editor/utils.js'].lineData[162]++;
  for (var p in params) {
    _$jscoverage['/editor/utils.js'].lineData[164]++;
    var v = params[p];
    _$jscoverage['/editor/utils.js'].lineData[165]++;
    if (visit1058_165_1(typeof v === 'function')) {
      _$jscoverage['/editor/utils.js'].lineData[166]++;
      params[p] = v();
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[170]++;
  return params;
}, 
  ieEngine: visit1059_174_1(document['documentMode'] || UA['ie']), 
  preventFocus: function(el) {
  _$jscoverage['/editor/utils.js'].functionData[18]++;
  _$jscoverage['/editor/utils.js'].lineData[181]++;
  if (visit1060_181_1(UA['ie'])) {
    _$jscoverage['/editor/utils.js'].lineData[183]++;
    el.unselectable();
  } else {
    _$jscoverage['/editor/utils.js'].lineData[185]++;
    el.attr("onmousedown", "return false;");
  }
}, 
  injectDom: function(editorDom) {
  _$jscoverage['/editor/utils.js'].functionData[19]++;
  _$jscoverage['/editor/utils.js'].lineData[190]++;
  S.mix(Dom, editorDom);
  _$jscoverage['/editor/utils.js'].lineData[191]++;
  for (var dm in editorDom) {
    _$jscoverage['/editor/utils.js'].lineData[192]++;
    (function(dm) {
  _$jscoverage['/editor/utils.js'].functionData[20]++;
  _$jscoverage['/editor/utils.js'].lineData[193]++;
  Node.prototype[dm] = function() {
  _$jscoverage['/editor/utils.js'].functionData[21]++;
  _$jscoverage['/editor/utils.js'].lineData[194]++;
  var args = [].slice.call(arguments, 0);
  _$jscoverage['/editor/utils.js'].lineData[195]++;
  args.unshift(this[0]);
  _$jscoverage['/editor/utils.js'].lineData[196]++;
  var ret = editorDom[dm].apply(NULL, args);
  _$jscoverage['/editor/utils.js'].lineData[197]++;
  if (visit1061_197_1(ret && (visit1062_197_2(ret.nodeType || S.isWindow(ret))))) {
    _$jscoverage['/editor/utils.js'].lineData[198]++;
    return new Node(ret);
  } else {
    _$jscoverage['/editor/utils.js'].lineData[200]++;
    if (visit1063_200_1(S.isArray(ret))) {
      _$jscoverage['/editor/utils.js'].lineData[201]++;
      if (visit1064_201_1(ret.__IS_NODELIST || (visit1065_201_2(ret[0] && ret[0].nodeType)))) {
        _$jscoverage['/editor/utils.js'].lineData[202]++;
        return new Node(ret);
      }
    }
    _$jscoverage['/editor/utils.js'].lineData[205]++;
    return ret;
  }
};
})(dm);
  }
}, 
  addRes: function() {
  _$jscoverage['/editor/utils.js'].functionData[22]++;
  _$jscoverage['/editor/utils.js'].lineData[213]++;
  this.__res = visit1066_213_1(this.__res || []);
  _$jscoverage['/editor/utils.js'].lineData[214]++;
  var res = this.__res;
  _$jscoverage['/editor/utils.js'].lineData[215]++;
  res.push.apply(res, S.makeArray(arguments));
}, 
  destroyRes: function() {
  _$jscoverage['/editor/utils.js'].functionData[23]++;
  _$jscoverage['/editor/utils.js'].lineData[219]++;
  var res = visit1067_219_1(this.__res || []);
  _$jscoverage['/editor/utils.js'].lineData[220]++;
  for (var i = 0; visit1068_220_1(i < res.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[221]++;
    var r = res[i];
    _$jscoverage['/editor/utils.js'].lineData[222]++;
    if (visit1069_222_1(typeof r === 'function')) {
      _$jscoverage['/editor/utils.js'].lineData[223]++;
      r();
    } else {
      _$jscoverage['/editor/utils.js'].lineData[225]++;
      if (visit1070_225_1(r.destroy)) {
        _$jscoverage['/editor/utils.js'].lineData[226]++;
        r.destroy();
      } else {
        _$jscoverage['/editor/utils.js'].lineData[228]++;
        if (visit1071_228_1(r.remove)) {
          _$jscoverage['/editor/utils.js'].lineData[229]++;
          r.remove();
        }
      }
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[233]++;
  this.__res = [];
}, 
  getQueryCmd: function(cmd) {
  _$jscoverage['/editor/utils.js'].functionData[24]++;
  _$jscoverage['/editor/utils.js'].lineData[237]++;
  return "query" + ("-" + cmd).replace(/-(\w)/g, function(m, m1) {
  _$jscoverage['/editor/utils.js'].functionData[25]++;
  _$jscoverage['/editor/utils.js'].lineData[238]++;
  return m1.toUpperCase();
}) + "Value";
}};
  _$jscoverage['/editor/utils.js'].lineData[243]++;
  Editor.Utils = Utils;
  _$jscoverage['/editor/utils.js'].lineData[245]++;
  return Utils;
}, {
  requires: ['./base', 'node']});
