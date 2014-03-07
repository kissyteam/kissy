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
  _$jscoverage['/runtime/commands.js'].lineData[8] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[10] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[11] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[12] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[13] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[14] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[15] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[16] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[17] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[18] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[20] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[23] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[26] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[30] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[31] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[32] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[33] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[34] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[35] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[36] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[37] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[39] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[40] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[41] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[42] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[43] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[46] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[48] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[49] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[50] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[51] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[53] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[54] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[57] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[58] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[59] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[60] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[61] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[62] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[64] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[65] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[69] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[70] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[72] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[76] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[77] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[78] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[79] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[81] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[82] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[83] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[84] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[85] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[87] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[91] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[92] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[93] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[94] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[95] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[96] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[98] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[99] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[101] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[105] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[106] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[110] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[111] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[113] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[114] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[115] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[116] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[119] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[120] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[122] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[123] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[124] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[125] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[127] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[130] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[135] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[139] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[143] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[144] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[145] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[146] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[147] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[148] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[149] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[151] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[152] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[154] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[158] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[159] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[160] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[161] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[162] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[163] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[164] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[165] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[166] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[167] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[168] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[169] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[171] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[172] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[175] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[176] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[177] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[178] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[179] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[180] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[182] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[186] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[190] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[191] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[192] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[193] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[194] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[196] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[197] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[202] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[203] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[204] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[205] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[206] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[207] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[208] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[210] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[212] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[214] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[217] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[221] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[222] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[223] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[227] = 0;
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
  _$jscoverage['/runtime/commands.js'].functionData[9] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[10] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[11] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].branchData) {
  _$jscoverage['/runtime/commands.js'].branchData = {};
  _$jscoverage['/runtime/commands.js'].branchData['14'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['16'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['17'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['32'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['39'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['41'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['46'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['50'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['61'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['69'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['79'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['84'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['94'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['95'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['98'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['113'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['122'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['123'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['147'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['151'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['158'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['160'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['161'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['164'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['167'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['176'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['179'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['194'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['196'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['205'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['206'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['221'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['221'][1] = new BranchData();
}
_$jscoverage['/runtime/commands.js'].branchData['221'][1].init(7223, 9, '\'@DEBUG@\'');
function visit33_221_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['206'][1].init(62, 7, 'i < len');
function visit32_206_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['205'][1].init(138, 40, 'macro && (paramNames = macro.paramNames)');
function visit31_205_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['196'][1].init(258, 9, 'option.fn');
function visit30_196_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['194'][1].init(194, 20, 'payload.macros || {}');
function visit29_194_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['179'][1].init(25, 9, 'cursor.fn');
function visit28_179_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['176'][1].init(1180, 22, '!payload.extendTplName');
function visit27_176_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['167'][2].init(103, 25, 'cursor.type === \'prepend\'');
function visit26_167_2(result) {
  _$jscoverage['/runtime/commands.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['167'][1].init(93, 35, 'cursor && cursor.type === \'prepend\'');
function visit25_167_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['164'][1].init(165, 23, 'head.type === \'prepend\'');
function visit24_164_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['161'][1].init(21, 22, 'head.type === \'append\'');
function visit23_161_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['160'][1].init(582, 9, 'head.type');
function visit22_160_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['158'][1].init(504, 5, '!head');
function visit21_158_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['151'][1].init(299, 20, 'payload.blocks || {}');
function visit20_151_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['147'][1].init(147, 19, 'params.length === 2');
function visit19_147_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['123'][1].init(21, 7, '!myName');
function visit18_123_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['122'][1].init(375, 28, 'subTplName.charAt(0) === \'.\'');
function visit17_122_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['113'][1].init(120, 11, 'option.hash');
function visit16_113_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['98'][1].init(254, 14, 'option.inverse');
function visit15_98_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['95'][1].init(21, 9, 'option.fn');
function visit14_95_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['94'][1].init(122, 6, 'param0');
function visit13_94_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['84'][1].init(345, 14, 'option.inverse');
function visit12_84_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['79'][1].init(122, 6, 'param0');
function visit11_79_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['69'][1].init(1608, 14, 'option.inverse');
function visit10_69_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['61'][1].init(132, 9, 'valueName');
function visit9_61_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['50'][1].init(205, 9, 'valueName');
function visit8_50_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['46'][1].init(194, 15, 'xindex < xcount');
function visit7_46_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['41'][1].init(60, 17, 'S.isArray(param0)');
function visit6_41_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['39'][1].init(344, 6, 'param0');
function visit5_39_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['32'][1].init(106, 21, 'params[2] || \'xindex\'');
function visit4_32_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['17'][1].init(99, 16, 'subPart === \'..\'');
function visit3_17_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['16'][1].init(56, 15, 'subPart === \'.\'');
function visit2_16_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['14'][1].init(153, 5, 'i < l');
function visit1_14_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime/commands.js'].functionData[0]++;
  _$jscoverage['/runtime/commands.js'].lineData[7]++;
  var commands;
  _$jscoverage['/runtime/commands.js'].lineData[8]++;
  var Scope = require('./scope');
  _$jscoverage['/runtime/commands.js'].lineData[10]++;
  function getSubNameFromParentName(parentName, subName) {
    _$jscoverage['/runtime/commands.js'].functionData[1]++;
    _$jscoverage['/runtime/commands.js'].lineData[11]++;
    var parts = parentName.split('/');
    _$jscoverage['/runtime/commands.js'].lineData[12]++;
    var subParts = subName.split('/');
    _$jscoverage['/runtime/commands.js'].lineData[13]++;
    parts.pop();
    _$jscoverage['/runtime/commands.js'].lineData[14]++;
    for (var i = 0, l = subParts.length; visit1_14_1(i < l); i++) {
      _$jscoverage['/runtime/commands.js'].lineData[15]++;
      var subPart = subParts[i];
      _$jscoverage['/runtime/commands.js'].lineData[16]++;
      if (visit2_16_1(subPart === '.')) {
      } else {
        _$jscoverage['/runtime/commands.js'].lineData[17]++;
        if (visit3_17_1(subPart === '..')) {
          _$jscoverage['/runtime/commands.js'].lineData[18]++;
          parts.pop();
        } else {
          _$jscoverage['/runtime/commands.js'].lineData[20]++;
          parts.push(subPart);
        }
      }
    }
    _$jscoverage['/runtime/commands.js'].lineData[23]++;
    return parts.join('/');
  }
  _$jscoverage['/runtime/commands.js'].lineData[26]++;
  commands = {
  'debugger': S.noop, 
  'each': function(scope, option) {
  _$jscoverage['/runtime/commands.js'].functionData[2]++;
  _$jscoverage['/runtime/commands.js'].lineData[30]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[31]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[32]++;
  var xindexName = visit4_32_1(params[2] || 'xindex');
  _$jscoverage['/runtime/commands.js'].lineData[33]++;
  var valueName = params[1];
  _$jscoverage['/runtime/commands.js'].lineData[34]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[35]++;
  var xcount;
  _$jscoverage['/runtime/commands.js'].lineData[36]++;
  var opScope;
  _$jscoverage['/runtime/commands.js'].lineData[37]++;
  var affix;
  _$jscoverage['/runtime/commands.js'].lineData[39]++;
  if (visit5_39_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[40]++;
    opScope = new Scope();
    _$jscoverage['/runtime/commands.js'].lineData[41]++;
    if (visit6_41_1(S.isArray(param0))) {
      _$jscoverage['/runtime/commands.js'].lineData[42]++;
      xcount = param0.length;
      _$jscoverage['/runtime/commands.js'].lineData[43]++;
      affix = opScope.affix = {
  xcount: xcount};
      _$jscoverage['/runtime/commands.js'].lineData[46]++;
      for (var xindex = 0; visit7_46_1(xindex < xcount); xindex++) {
        _$jscoverage['/runtime/commands.js'].lineData[48]++;
        opScope.data = param0[xindex];
        _$jscoverage['/runtime/commands.js'].lineData[49]++;
        affix[xindexName] = xindex;
        _$jscoverage['/runtime/commands.js'].lineData[50]++;
        if (visit8_50_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[51]++;
          affix[valueName] = param0[xindex];
        }
        _$jscoverage['/runtime/commands.js'].lineData[53]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[54]++;
        buffer += option.fn(opScope);
      }
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[57]++;
      affix = opScope.affix = {};
      _$jscoverage['/runtime/commands.js'].lineData[58]++;
      for (var name in param0) {
        _$jscoverage['/runtime/commands.js'].lineData[59]++;
        opScope.data = param0[name];
        _$jscoverage['/runtime/commands.js'].lineData[60]++;
        affix[xindexName] = name;
        _$jscoverage['/runtime/commands.js'].lineData[61]++;
        if (visit9_61_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[62]++;
          affix[valueName] = param0[name];
        }
        _$jscoverage['/runtime/commands.js'].lineData[64]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[65]++;
        buffer += option.fn(opScope);
      }
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[69]++;
    if (visit10_69_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[70]++;
      buffer = option.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[72]++;
  return buffer;
}, 
  'with': function(scope, option) {
  _$jscoverage['/runtime/commands.js'].functionData[3]++;
  _$jscoverage['/runtime/commands.js'].lineData[76]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[77]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[78]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[79]++;
  if (visit11_79_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[81]++;
    var opScope = new Scope(param0);
    _$jscoverage['/runtime/commands.js'].lineData[82]++;
    opScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[83]++;
    buffer = option.fn(opScope);
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[84]++;
    if (visit12_84_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[85]++;
      buffer = option.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[87]++;
  return buffer;
}, 
  'if': function(scope, option) {
  _$jscoverage['/runtime/commands.js'].functionData[4]++;
  _$jscoverage['/runtime/commands.js'].lineData[91]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[92]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[93]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[94]++;
  if (visit13_94_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[95]++;
    if (visit14_95_1(option.fn)) {
      _$jscoverage['/runtime/commands.js'].lineData[96]++;
      buffer = option.fn(scope);
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[98]++;
    if (visit15_98_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[99]++;
      buffer = option.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[101]++;
  return buffer;
}, 
  'set': function(scope, option) {
  _$jscoverage['/runtime/commands.js'].functionData[5]++;
  _$jscoverage['/runtime/commands.js'].lineData[105]++;
  scope.mix(option.hash);
  _$jscoverage['/runtime/commands.js'].lineData[106]++;
  return '';
}, 
  include: function(scope, option, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[6]++;
  _$jscoverage['/runtime/commands.js'].lineData[110]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[111]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[113]++;
  if (visit16_113_1(option.hash)) {
    _$jscoverage['/runtime/commands.js'].lineData[114]++;
    var newScope = new Scope(option.hash);
    _$jscoverage['/runtime/commands.js'].lineData[115]++;
    newScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[116]++;
    scope = newScope;
  }
  _$jscoverage['/runtime/commands.js'].lineData[119]++;
  var myName = self.name;
  _$jscoverage['/runtime/commands.js'].lineData[120]++;
  var subTplName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[122]++;
  if (visit17_122_1(subTplName.charAt(0) === '.')) {
    _$jscoverage['/runtime/commands.js'].lineData[123]++;
    if (visit18_123_1(!myName)) {
      _$jscoverage['/runtime/commands.js'].lineData[124]++;
      S.error('parent template does not have name' + ' for relative sub tpl name: ' + subTplName);
      _$jscoverage['/runtime/commands.js'].lineData[125]++;
      return '';
    }
    _$jscoverage['/runtime/commands.js'].lineData[127]++;
    subTplName = getSubNameFromParentName(myName, subTplName);
  }
  _$jscoverage['/runtime/commands.js'].lineData[130]++;
  return self.load(subTplName).render(scope, payload);
}, 
  parse: function(scope, option) {
  _$jscoverage['/runtime/commands.js'].functionData[7]++;
  _$jscoverage['/runtime/commands.js'].lineData[135]++;
  return commands.include.call(this, new Scope(), option);
}, 
  extend: function(scope, option, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[8]++;
  _$jscoverage['/runtime/commands.js'].lineData[139]++;
  payload.extendTplName = option.params[0];
}, 
  block: function(scope, option, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[9]++;
  _$jscoverage['/runtime/commands.js'].lineData[143]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[144]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[145]++;
  var blockName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[146]++;
  var type;
  _$jscoverage['/runtime/commands.js'].lineData[147]++;
  if (visit19_147_1(params.length === 2)) {
    _$jscoverage['/runtime/commands.js'].lineData[148]++;
    type = params[0];
    _$jscoverage['/runtime/commands.js'].lineData[149]++;
    blockName = params[1];
  }
  _$jscoverage['/runtime/commands.js'].lineData[151]++;
  var blocks = payload.blocks = visit20_151_1(payload.blocks || {});
  _$jscoverage['/runtime/commands.js'].lineData[152]++;
  var head = blocks[blockName], cursor;
  _$jscoverage['/runtime/commands.js'].lineData[154]++;
  var current = {
  fn: option.fn, 
  type: type};
  _$jscoverage['/runtime/commands.js'].lineData[158]++;
  if (visit21_158_1(!head)) {
    _$jscoverage['/runtime/commands.js'].lineData[159]++;
    blocks[blockName] = current;
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[160]++;
    if (visit22_160_1(head.type)) {
      _$jscoverage['/runtime/commands.js'].lineData[161]++;
      if (visit23_161_1(head.type === 'append')) {
        _$jscoverage['/runtime/commands.js'].lineData[162]++;
        current.next = head;
        _$jscoverage['/runtime/commands.js'].lineData[163]++;
        blocks[blockName] = current;
      } else {
        _$jscoverage['/runtime/commands.js'].lineData[164]++;
        if (visit24_164_1(head.type === 'prepend')) {
          _$jscoverage['/runtime/commands.js'].lineData[165]++;
          var prev;
          _$jscoverage['/runtime/commands.js'].lineData[166]++;
          cursor = head;
          _$jscoverage['/runtime/commands.js'].lineData[167]++;
          while (visit25_167_1(cursor && visit26_167_2(cursor.type === 'prepend'))) {
            _$jscoverage['/runtime/commands.js'].lineData[168]++;
            prev = cursor;
            _$jscoverage['/runtime/commands.js'].lineData[169]++;
            cursor = cursor.next;
          }
          _$jscoverage['/runtime/commands.js'].lineData[171]++;
          current.next = cursor;
          _$jscoverage['/runtime/commands.js'].lineData[172]++;
          prev.next = current;
        }
      }
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[175]++;
  var ret = '';
  _$jscoverage['/runtime/commands.js'].lineData[176]++;
  if (visit27_176_1(!payload.extendTplName)) {
    _$jscoverage['/runtime/commands.js'].lineData[177]++;
    cursor = blocks[blockName];
    _$jscoverage['/runtime/commands.js'].lineData[178]++;
    while (cursor) {
      _$jscoverage['/runtime/commands.js'].lineData[179]++;
      if (visit28_179_1(cursor.fn)) {
        _$jscoverage['/runtime/commands.js'].lineData[180]++;
        ret += cursor.fn.call(self, scope);
      }
      _$jscoverage['/runtime/commands.js'].lineData[182]++;
      cursor = cursor.next;
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[186]++;
  return ret;
}, 
  'macro': function(scope, option, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[10]++;
  _$jscoverage['/runtime/commands.js'].lineData[190]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[191]++;
  var macroName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[192]++;
  var params1 = params.slice(1);
  _$jscoverage['/runtime/commands.js'].lineData[193]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[194]++;
  var macros = payload.macros = visit29_194_1(payload.macros || {});
  _$jscoverage['/runtime/commands.js'].lineData[196]++;
  if (visit30_196_1(option.fn)) {
    _$jscoverage['/runtime/commands.js'].lineData[197]++;
    macros[macroName] = {
  paramNames: params1, 
  fn: option.fn};
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[202]++;
    var paramValues = {};
    _$jscoverage['/runtime/commands.js'].lineData[203]++;
    var macro = macros[macroName];
    _$jscoverage['/runtime/commands.js'].lineData[204]++;
    var paramNames;
    _$jscoverage['/runtime/commands.js'].lineData[205]++;
    if (visit31_205_1(macro && (paramNames = macro.paramNames))) {
      _$jscoverage['/runtime/commands.js'].lineData[206]++;
      for (var i = 0, len = paramNames.length; visit32_206_1(i < len); i++) {
        _$jscoverage['/runtime/commands.js'].lineData[207]++;
        var p = paramNames[i];
        _$jscoverage['/runtime/commands.js'].lineData[208]++;
        paramValues[p] = params1[i];
      }
      _$jscoverage['/runtime/commands.js'].lineData[210]++;
      var newScope = new Scope(paramValues);
      _$jscoverage['/runtime/commands.js'].lineData[212]++;
      return macro.fn.call(self, newScope);
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[214]++;
      S.error('can not find macro:' + name);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[217]++;
  return '';
}};
  _$jscoverage['/runtime/commands.js'].lineData[221]++;
  if (visit33_221_1('@DEBUG@')) {
    _$jscoverage['/runtime/commands.js'].lineData[222]++;
    commands['debugger'] = function() {
  _$jscoverage['/runtime/commands.js'].functionData[11]++;
  _$jscoverage['/runtime/commands.js'].lineData[223]++;
  S.globalEval('debugger');
};
  }
  _$jscoverage['/runtime/commands.js'].lineData[227]++;
  return commands;
});
