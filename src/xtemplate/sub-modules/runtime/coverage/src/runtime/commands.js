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
  _$jscoverage['/runtime/commands.js'].lineData[28] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[29] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[30] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[31] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[32] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[33] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[34] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[35] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[37] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[38] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[39] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[40] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[41] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[44] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[46] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[47] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[48] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[49] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[51] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[52] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[55] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[56] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[57] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[58] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[59] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[60] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[62] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[63] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[67] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[68] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[70] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[74] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[75] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[76] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[77] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[79] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[80] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[81] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[82] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[83] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[85] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[89] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[90] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[91] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[92] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[93] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[94] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[96] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[97] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[99] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[103] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[104] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[108] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[109] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[111] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[112] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[113] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[114] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[117] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[118] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[120] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[121] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[122] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[123] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[125] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[128] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[133] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[137] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[141] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[142] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[143] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[144] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[145] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[146] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[147] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[149] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[150] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[152] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[156] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[157] = 0;
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
  _$jscoverage['/runtime/commands.js'].lineData[169] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[170] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[173] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[174] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[175] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[176] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[177] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[178] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[180] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[184] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[188] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[189] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[190] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[191] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[192] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[194] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[195] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[200] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[201] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[202] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[203] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[204] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[205] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[206] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[208] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[210] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[212] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[215] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[219] = 0;
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
}
if (! _$jscoverage['/runtime/commands.js'].branchData) {
  _$jscoverage['/runtime/commands.js'].branchData = {};
  _$jscoverage['/runtime/commands.js'].branchData['14'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['16'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['17'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['30'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['37'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['39'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['44'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['48'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['59'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['67'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['77'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['82'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['92'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['93'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['96'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['111'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['120'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['121'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['145'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['149'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['156'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['158'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['159'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['162'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['165'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['165'][2] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['174'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['177'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['192'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['194'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['203'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['204'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['204'][1] = new BranchData();
}
_$jscoverage['/runtime/commands.js'].branchData['204'][1].init(62, 7, 'i < len');
function visit32_204_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['203'][1].init(138, 40, 'macro && (paramNames = macro.paramNames)');
function visit31_203_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['194'][1].init(258, 9, 'option.fn');
function visit30_194_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['192'][1].init(194, 20, 'payload.macros || {}');
function visit29_192_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['177'][1].init(25, 9, 'cursor.fn');
function visit28_177_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['174'][1].init(1180, 22, '!payload.extendTplName');
function visit27_174_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['165'][2].init(103, 25, 'cursor.type === \'prepend\'');
function visit26_165_2(result) {
  _$jscoverage['/runtime/commands.js'].branchData['165'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['165'][1].init(93, 35, 'cursor && cursor.type === \'prepend\'');
function visit25_165_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['162'][1].init(165, 23, 'head.type === \'prepend\'');
function visit24_162_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['159'][1].init(21, 22, 'head.type === \'append\'');
function visit23_159_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['158'][1].init(582, 9, 'head.type');
function visit22_158_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['156'][1].init(504, 5, '!head');
function visit21_156_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['149'][1].init(299, 20, 'payload.blocks || {}');
function visit20_149_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['145'][1].init(147, 19, 'params.length === 2');
function visit19_145_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['121'][1].init(21, 7, '!myName');
function visit18_121_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['120'][1].init(375, 28, 'subTplName.charAt(0) === \'.\'');
function visit17_120_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['111'][1].init(120, 11, 'option.hash');
function visit16_111_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['96'][1].init(254, 14, 'option.inverse');
function visit15_96_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['93'][1].init(21, 9, 'option.fn');
function visit14_93_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['92'][1].init(122, 6, 'param0');
function visit13_92_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['82'][1].init(345, 14, 'option.inverse');
function visit12_82_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['77'][1].init(122, 6, 'param0');
function visit11_77_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['67'][1].init(1608, 14, 'option.inverse');
function visit10_67_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['59'][1].init(132, 9, 'valueName');
function visit9_59_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['48'][1].init(205, 9, 'valueName');
function visit8_48_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['44'][1].init(194, 15, 'xindex < xcount');
function visit7_44_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['39'][1].init(60, 17, 'S.isArray(param0)');
function visit6_39_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['37'][1].init(344, 6, 'param0');
function visit5_37_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['30'][1].init(106, 21, 'params[2] || \'xindex\'');
function visit4_30_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['30'][1].ranCondition(result);
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
  'each': function(scope, option) {
  _$jscoverage['/runtime/commands.js'].functionData[2]++;
  _$jscoverage['/runtime/commands.js'].lineData[28]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[29]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[30]++;
  var xindexName = visit4_30_1(params[2] || 'xindex');
  _$jscoverage['/runtime/commands.js'].lineData[31]++;
  var valueName = params[1];
  _$jscoverage['/runtime/commands.js'].lineData[32]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[33]++;
  var xcount;
  _$jscoverage['/runtime/commands.js'].lineData[34]++;
  var opScope;
  _$jscoverage['/runtime/commands.js'].lineData[35]++;
  var affix;
  _$jscoverage['/runtime/commands.js'].lineData[37]++;
  if (visit5_37_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[38]++;
    opScope = new Scope();
    _$jscoverage['/runtime/commands.js'].lineData[39]++;
    if (visit6_39_1(S.isArray(param0))) {
      _$jscoverage['/runtime/commands.js'].lineData[40]++;
      xcount = param0.length;
      _$jscoverage['/runtime/commands.js'].lineData[41]++;
      affix = opScope.affix = {
  xcount: xcount};
      _$jscoverage['/runtime/commands.js'].lineData[44]++;
      for (var xindex = 0; visit7_44_1(xindex < xcount); xindex++) {
        _$jscoverage['/runtime/commands.js'].lineData[46]++;
        opScope.data = param0[xindex];
        _$jscoverage['/runtime/commands.js'].lineData[47]++;
        affix[xindexName] = xindex;
        _$jscoverage['/runtime/commands.js'].lineData[48]++;
        if (visit8_48_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[49]++;
          affix[valueName] = param0[xindex];
        }
        _$jscoverage['/runtime/commands.js'].lineData[51]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[52]++;
        buffer += option.fn(opScope);
      }
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[55]++;
      affix = opScope.affix = {};
      _$jscoverage['/runtime/commands.js'].lineData[56]++;
      for (var name in param0) {
        _$jscoverage['/runtime/commands.js'].lineData[57]++;
        opScope.data = param0[name];
        _$jscoverage['/runtime/commands.js'].lineData[58]++;
        affix[xindexName] = name;
        _$jscoverage['/runtime/commands.js'].lineData[59]++;
        if (visit9_59_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[60]++;
          affix[valueName] = param0[name];
        }
        _$jscoverage['/runtime/commands.js'].lineData[62]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[63]++;
        buffer += option.fn(opScope);
      }
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[67]++;
    if (visit10_67_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[68]++;
      buffer = option.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[70]++;
  return buffer;
}, 
  'with': function(scope, option) {
  _$jscoverage['/runtime/commands.js'].functionData[3]++;
  _$jscoverage['/runtime/commands.js'].lineData[74]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[75]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[76]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[77]++;
  if (visit11_77_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[79]++;
    var opScope = new Scope(param0);
    _$jscoverage['/runtime/commands.js'].lineData[80]++;
    opScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[81]++;
    buffer = option.fn(opScope);
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[82]++;
    if (visit12_82_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[83]++;
      buffer = option.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[85]++;
  return buffer;
}, 
  'if': function(scope, option) {
  _$jscoverage['/runtime/commands.js'].functionData[4]++;
  _$jscoverage['/runtime/commands.js'].lineData[89]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[90]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[91]++;
  var buffer = '';
  _$jscoverage['/runtime/commands.js'].lineData[92]++;
  if (visit13_92_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[93]++;
    if (visit14_93_1(option.fn)) {
      _$jscoverage['/runtime/commands.js'].lineData[94]++;
      buffer = option.fn(scope);
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[96]++;
    if (visit15_96_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[97]++;
      buffer = option.inverse(scope);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[99]++;
  return buffer;
}, 
  'set': function(scope, option) {
  _$jscoverage['/runtime/commands.js'].functionData[5]++;
  _$jscoverage['/runtime/commands.js'].lineData[103]++;
  scope.mix(option.hash);
  _$jscoverage['/runtime/commands.js'].lineData[104]++;
  return '';
}, 
  include: function(scope, option, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[6]++;
  _$jscoverage['/runtime/commands.js'].lineData[108]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[109]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[111]++;
  if (visit16_111_1(option.hash)) {
    _$jscoverage['/runtime/commands.js'].lineData[112]++;
    var newScope = new Scope(option.hash);
    _$jscoverage['/runtime/commands.js'].lineData[113]++;
    newScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[114]++;
    scope = newScope;
  }
  _$jscoverage['/runtime/commands.js'].lineData[117]++;
  var myName = self.name;
  _$jscoverage['/runtime/commands.js'].lineData[118]++;
  var subTplName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[120]++;
  if (visit17_120_1(subTplName.charAt(0) === '.')) {
    _$jscoverage['/runtime/commands.js'].lineData[121]++;
    if (visit18_121_1(!myName)) {
      _$jscoverage['/runtime/commands.js'].lineData[122]++;
      S.error('parent template does not have name' + ' for relative sub tpl name: ' + subTplName);
      _$jscoverage['/runtime/commands.js'].lineData[123]++;
      return '';
    }
    _$jscoverage['/runtime/commands.js'].lineData[125]++;
    subTplName = getSubNameFromParentName(myName, subTplName);
  }
  _$jscoverage['/runtime/commands.js'].lineData[128]++;
  return self.load(subTplName).render(scope, payload);
}, 
  parse: function(scope, option) {
  _$jscoverage['/runtime/commands.js'].functionData[7]++;
  _$jscoverage['/runtime/commands.js'].lineData[133]++;
  return commands.include.call(this, new Scope(), option);
}, 
  extend: function(scope, option, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[8]++;
  _$jscoverage['/runtime/commands.js'].lineData[137]++;
  payload.extendTplName = option.params[0];
}, 
  block: function(scope, option, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[9]++;
  _$jscoverage['/runtime/commands.js'].lineData[141]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[142]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[143]++;
  var blockName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[144]++;
  var type;
  _$jscoverage['/runtime/commands.js'].lineData[145]++;
  if (visit19_145_1(params.length === 2)) {
    _$jscoverage['/runtime/commands.js'].lineData[146]++;
    type = params[0];
    _$jscoverage['/runtime/commands.js'].lineData[147]++;
    blockName = params[1];
  }
  _$jscoverage['/runtime/commands.js'].lineData[149]++;
  var blocks = payload.blocks = visit20_149_1(payload.blocks || {});
  _$jscoverage['/runtime/commands.js'].lineData[150]++;
  var head = blocks[blockName], cursor;
  _$jscoverage['/runtime/commands.js'].lineData[152]++;
  var current = {
  fn: option.fn, 
  type: type};
  _$jscoverage['/runtime/commands.js'].lineData[156]++;
  if (visit21_156_1(!head)) {
    _$jscoverage['/runtime/commands.js'].lineData[157]++;
    blocks[blockName] = current;
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[158]++;
    if (visit22_158_1(head.type)) {
      _$jscoverage['/runtime/commands.js'].lineData[159]++;
      if (visit23_159_1(head.type === 'append')) {
        _$jscoverage['/runtime/commands.js'].lineData[160]++;
        current.next = head;
        _$jscoverage['/runtime/commands.js'].lineData[161]++;
        blocks[blockName] = current;
      } else {
        _$jscoverage['/runtime/commands.js'].lineData[162]++;
        if (visit24_162_1(head.type === 'prepend')) {
          _$jscoverage['/runtime/commands.js'].lineData[163]++;
          var prev;
          _$jscoverage['/runtime/commands.js'].lineData[164]++;
          cursor = head;
          _$jscoverage['/runtime/commands.js'].lineData[165]++;
          while (visit25_165_1(cursor && visit26_165_2(cursor.type === 'prepend'))) {
            _$jscoverage['/runtime/commands.js'].lineData[166]++;
            prev = cursor;
            _$jscoverage['/runtime/commands.js'].lineData[167]++;
            cursor = cursor.next;
          }
          _$jscoverage['/runtime/commands.js'].lineData[169]++;
          current.next = cursor;
          _$jscoverage['/runtime/commands.js'].lineData[170]++;
          prev.next = current;
        }
      }
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[173]++;
  var ret = '';
  _$jscoverage['/runtime/commands.js'].lineData[174]++;
  if (visit27_174_1(!payload.extendTplName)) {
    _$jscoverage['/runtime/commands.js'].lineData[175]++;
    cursor = blocks[blockName];
    _$jscoverage['/runtime/commands.js'].lineData[176]++;
    while (cursor) {
      _$jscoverage['/runtime/commands.js'].lineData[177]++;
      if (visit28_177_1(cursor.fn)) {
        _$jscoverage['/runtime/commands.js'].lineData[178]++;
        ret += cursor.fn.call(self, scope);
      }
      _$jscoverage['/runtime/commands.js'].lineData[180]++;
      cursor = cursor.next;
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[184]++;
  return ret;
}, 
  'macro': function(scope, option, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[10]++;
  _$jscoverage['/runtime/commands.js'].lineData[188]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[189]++;
  var macroName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[190]++;
  var params1 = params.slice(1);
  _$jscoverage['/runtime/commands.js'].lineData[191]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[192]++;
  var macros = payload.macros = visit29_192_1(payload.macros || {});
  _$jscoverage['/runtime/commands.js'].lineData[194]++;
  if (visit30_194_1(option.fn)) {
    _$jscoverage['/runtime/commands.js'].lineData[195]++;
    macros[macroName] = {
  paramNames: params1, 
  fn: option.fn};
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[200]++;
    var paramValues = {};
    _$jscoverage['/runtime/commands.js'].lineData[201]++;
    var macro = macros[macroName];
    _$jscoverage['/runtime/commands.js'].lineData[202]++;
    var paramNames;
    _$jscoverage['/runtime/commands.js'].lineData[203]++;
    if (visit31_203_1(macro && (paramNames = macro.paramNames))) {
      _$jscoverage['/runtime/commands.js'].lineData[204]++;
      for (var i = 0, len = paramNames.length; visit32_204_1(i < len); i++) {
        _$jscoverage['/runtime/commands.js'].lineData[205]++;
        var p = paramNames[i];
        _$jscoverage['/runtime/commands.js'].lineData[206]++;
        paramValues[p] = params1[i];
      }
      _$jscoverage['/runtime/commands.js'].lineData[208]++;
      var newScope = new Scope(paramValues);
      _$jscoverage['/runtime/commands.js'].lineData[210]++;
      return macro.fn.call(self, newScope);
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[212]++;
      S.error('can not find macro:' + name);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[215]++;
  return '';
}};
  _$jscoverage['/runtime/commands.js'].lineData[219]++;
  return commands;
});
