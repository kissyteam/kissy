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
  _$jscoverage['/json/stringify.js'].lineData[7] = 0;
  _$jscoverage['/json/stringify.js'].lineData[9] = 0;
  _$jscoverage['/json/stringify.js'].lineData[10] = 0;
  _$jscoverage['/json/stringify.js'].lineData[13] = 0;
  _$jscoverage['/json/stringify.js'].lineData[14] = 0;
  _$jscoverage['/json/stringify.js'].lineData[15] = 0;
  _$jscoverage['/json/stringify.js'].lineData[16] = 0;
  _$jscoverage['/json/stringify.js'].lineData[17] = 0;
  _$jscoverage['/json/stringify.js'].lineData[18] = 0;
  _$jscoverage['/json/stringify.js'].lineData[19] = 0;
  _$jscoverage['/json/stringify.js'].lineData[26] = 0;
  _$jscoverage['/json/stringify.js'].lineData[27] = 0;
  _$jscoverage['/json/stringify.js'].lineData[30] = 0;
  _$jscoverage['/json/stringify.js'].lineData[31] = 0;
  _$jscoverage['/json/stringify.js'].lineData[34] = 0;
  _$jscoverage['/json/stringify.js'].lineData[36] = 0;
  _$jscoverage['/json/stringify.js'].lineData[38] = 0;
  _$jscoverage['/json/stringify.js'].lineData[40] = 0;
  _$jscoverage['/json/stringify.js'].lineData[42] = 0;
  _$jscoverage['/json/stringify.js'].lineData[43] = 0;
  _$jscoverage['/json/stringify.js'].lineData[45] = 0;
  _$jscoverage['/json/stringify.js'].lineData[46] = 0;
  _$jscoverage['/json/stringify.js'].lineData[48] = 0;
  _$jscoverage['/json/stringify.js'].lineData[52] = 0;
  _$jscoverage['/json/stringify.js'].lineData[55] = 0;
  _$jscoverage['/json/stringify.js'].lineData[56] = 0;
  _$jscoverage['/json/stringify.js'].lineData[57] = 0;
  _$jscoverage['/json/stringify.js'].lineData[58] = 0;
  _$jscoverage['/json/stringify.js'].lineData[60] = 0;
  _$jscoverage['/json/stringify.js'].lineData[63] = 0;
  _$jscoverage['/json/stringify.js'].lineData[64] = 0;
  _$jscoverage['/json/stringify.js'].lineData[65] = 0;
  _$jscoverage['/json/stringify.js'].lineData[66] = 0;
  _$jscoverage['/json/stringify.js'].lineData[67] = 0;
  _$jscoverage['/json/stringify.js'].lineData[69] = 0;
  _$jscoverage['/json/stringify.js'].lineData[71] = 0;
  _$jscoverage['/json/stringify.js'].lineData[72] = 0;
  _$jscoverage['/json/stringify.js'].lineData[73] = 0;
  _$jscoverage['/json/stringify.js'].lineData[74] = 0;
  _$jscoverage['/json/stringify.js'].lineData[75] = 0;
  _$jscoverage['/json/stringify.js'].lineData[76] = 0;
  _$jscoverage['/json/stringify.js'].lineData[77] = 0;
  _$jscoverage['/json/stringify.js'].lineData[78] = 0;
  _$jscoverage['/json/stringify.js'].lineData[79] = 0;
  _$jscoverage['/json/stringify.js'].lineData[81] = 0;
  _$jscoverage['/json/stringify.js'].lineData[82] = 0;
  _$jscoverage['/json/stringify.js'].lineData[85] = 0;
  _$jscoverage['/json/stringify.js'].lineData[86] = 0;
  _$jscoverage['/json/stringify.js'].lineData[87] = 0;
  _$jscoverage['/json/stringify.js'].lineData[89] = 0;
  _$jscoverage['/json/stringify.js'].lineData[90] = 0;
  _$jscoverage['/json/stringify.js'].lineData[92] = 0;
  _$jscoverage['/json/stringify.js'].lineData[93] = 0;
  _$jscoverage['/json/stringify.js'].lineData[94] = 0;
  _$jscoverage['/json/stringify.js'].lineData[97] = 0;
  _$jscoverage['/json/stringify.js'].lineData[98] = 0;
  _$jscoverage['/json/stringify.js'].lineData[100] = 0;
  _$jscoverage['/json/stringify.js'].lineData[103] = 0;
  _$jscoverage['/json/stringify.js'].lineData[104] = 0;
  _$jscoverage['/json/stringify.js'].lineData[105] = 0;
  _$jscoverage['/json/stringify.js'].lineData[106] = 0;
  _$jscoverage['/json/stringify.js'].lineData[108] = 0;
  _$jscoverage['/json/stringify.js'].lineData[110] = 0;
  _$jscoverage['/json/stringify.js'].lineData[111] = 0;
  _$jscoverage['/json/stringify.js'].lineData[112] = 0;
  _$jscoverage['/json/stringify.js'].lineData[113] = 0;
  _$jscoverage['/json/stringify.js'].lineData[114] = 0;
  _$jscoverage['/json/stringify.js'].lineData[115] = 0;
  _$jscoverage['/json/stringify.js'].lineData[116] = 0;
  _$jscoverage['/json/stringify.js'].lineData[117] = 0;
  _$jscoverage['/json/stringify.js'].lineData[118] = 0;
  _$jscoverage['/json/stringify.js'].lineData[120] = 0;
  _$jscoverage['/json/stringify.js'].lineData[122] = 0;
  _$jscoverage['/json/stringify.js'].lineData[124] = 0;
  _$jscoverage['/json/stringify.js'].lineData[125] = 0;
  _$jscoverage['/json/stringify.js'].lineData[126] = 0;
  _$jscoverage['/json/stringify.js'].lineData[128] = 0;
  _$jscoverage['/json/stringify.js'].lineData[129] = 0;
  _$jscoverage['/json/stringify.js'].lineData[131] = 0;
  _$jscoverage['/json/stringify.js'].lineData[132] = 0;
  _$jscoverage['/json/stringify.js'].lineData[133] = 0;
  _$jscoverage['/json/stringify.js'].lineData[136] = 0;
  _$jscoverage['/json/stringify.js'].lineData[137] = 0;
  _$jscoverage['/json/stringify.js'].lineData[140] = 0;
  _$jscoverage['/json/stringify.js'].lineData[143] = 0;
  _$jscoverage['/json/stringify.js'].lineData[144] = 0;
  _$jscoverage['/json/stringify.js'].lineData[145] = 0;
  _$jscoverage['/json/stringify.js'].lineData[146] = 0;
  _$jscoverage['/json/stringify.js'].lineData[147] = 0;
  _$jscoverage['/json/stringify.js'].lineData[148] = 0;
  _$jscoverage['/json/stringify.js'].lineData[149] = 0;
  _$jscoverage['/json/stringify.js'].lineData[150] = 0;
  _$jscoverage['/json/stringify.js'].lineData[154] = 0;
  _$jscoverage['/json/stringify.js'].lineData[155] = 0;
  _$jscoverage['/json/stringify.js'].lineData[156] = 0;
  _$jscoverage['/json/stringify.js'].lineData[157] = 0;
  _$jscoverage['/json/stringify.js'].lineData[158] = 0;
  _$jscoverage['/json/stringify.js'].lineData[161] = 0;
  _$jscoverage['/json/stringify.js'].lineData[166] = 0;
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
  _$jscoverage['/json/stringify.js'].branchData['10'] = [];
  _$jscoverage['/json/stringify.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['15'] = [];
  _$jscoverage['/json/stringify.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['16'] = [];
  _$jscoverage['/json/stringify.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['18'] = [];
  _$jscoverage['/json/stringify.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['26'] = [];
  _$jscoverage['/json/stringify.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['26'][2] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['30'] = [];
  _$jscoverage['/json/stringify.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['42'] = [];
  _$jscoverage['/json/stringify.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['45'] = [];
  _$jscoverage['/json/stringify.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['56'] = [];
  _$jscoverage['/json/stringify.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['57'] = [];
  _$jscoverage['/json/stringify.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['66'] = [];
  _$jscoverage['/json/stringify.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['72'] = [];
  _$jscoverage['/json/stringify.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['75'] = [];
  _$jscoverage['/json/stringify.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['78'] = [];
  _$jscoverage['/json/stringify.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['86'] = [];
  _$jscoverage['/json/stringify.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['89'] = [];
  _$jscoverage['/json/stringify.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['97'] = [];
  _$jscoverage['/json/stringify.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['104'] = [];
  _$jscoverage['/json/stringify.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['105'] = [];
  _$jscoverage['/json/stringify.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['115'] = [];
  _$jscoverage['/json/stringify.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['117'] = [];
  _$jscoverage['/json/stringify.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['125'] = [];
  _$jscoverage['/json/stringify.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['128'] = [];
  _$jscoverage['/json/stringify.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['136'] = [];
  _$jscoverage['/json/stringify.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['146'] = [];
  _$jscoverage['/json/stringify.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['147'] = [];
  _$jscoverage['/json/stringify.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['149'] = [];
  _$jscoverage['/json/stringify.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['154'] = [];
  _$jscoverage['/json/stringify.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['157'] = [];
  _$jscoverage['/json/stringify.js'].branchData['157'][1] = new BranchData();
}
_$jscoverage['/json/stringify.js'].branchData['157'][1].init(449, 25, 'typeof space === \'string\'');
function visit76_157_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['154'][1].init(309, 25, 'typeof space === \'number\'');
function visit75_154_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['149'][1].init(120, 19, 'S.isArray(replacer)');
function visit74_149_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['147'][1].init(17, 30, 'typeof replacer === \'function\'');
function visit73_147_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['146'][1].init(79, 8, 'replacer');
function visit72_146_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['136'][1].init(1059, 9, '\'@DEBUG@\'');
function visit71_136_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['128'][1].init(17, 4, '!gap');
function visit70_128_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['125'][1].init(684, 15, '!partial.length');
function visit69_125_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['117'][1].init(119, 18, 'strP === undefined');
function visit68_117_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['115'][1].init(336, 11, 'index < len');
function visit67_115_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['105'][1].init(17, 23, 'S.inArray(value, stack)');
function visit66_105_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['104'][1].init(13, 9, '\'@DEBUG@\'');
function visit65_104_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['97'][1].init(1288, 9, '\'@DEBUG@\'');
function visit64_97_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['89'][1].init(17, 4, '!gap');
function visit63_89_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['86'][1].init(913, 15, '!partial.length');
function visit62_86_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['78'][1].init(97, 3, 'gap');
function visit61_78_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['75'][1].init(129, 18, 'strP !== undefined');
function visit60_75_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['72'][1].init(457, 6, 'i < kl');
function visit59_72_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['66'][1].init(278, 26, 'propertyList !== undefined');
function visit58_66_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['57'][1].init(17, 23, 'S.inArray(value, stack)');
function visit57_57_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['56'][1].init(13, 9, '\'@DEBUG@\'');
function visit56_56_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['45'][1].init(117, 16, 'S.isArray(value)');
function visit55_45_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['42'][1].init(34, 6, '!value');
function visit54_42_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['30'][1].init(839, 30, 'replacerFunction !== undefined');
function visit53_30_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['26'][2].init(625, 52, 'value instanceof Number || value instanceof Boolean');
function visit52_26_2(result) {
  _$jscoverage['/json/stringify.js'].branchData['26'][2].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['26'][1].init(597, 80, 'value instanceof String || value instanceof Number || value instanceof Boolean');
function visit51_26_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['18'][1].init(122, 21, 'value instanceof Date');
function visit50_18_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['16'][1].init(17, 34, 'typeof value.toJSON === \'function\'');
function visit49_16_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['15'][2].init(55, 25, 'typeof value === \'object\'');
function visit48_15_2(result) {
  _$jscoverage['/json/stringify.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['15'][1].init(46, 34, 'value && typeof value === \'object\'');
function visit47_15_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['10'][1].init(16, 6, 'n < 10');
function visit46_10_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/json/stringify.js'].functionData[0]++;
  _$jscoverage['/json/stringify.js'].lineData[7]++;
  var Quote = require('./quote');
  _$jscoverage['/json/stringify.js'].lineData[9]++;
  function padding2(n) {
    _$jscoverage['/json/stringify.js'].functionData[1]++;
    _$jscoverage['/json/stringify.js'].lineData[10]++;
    return visit46_10_1(n < 10) ? '0' + n : n;
  }
  _$jscoverage['/json/stringify.js'].lineData[13]++;
  function str(key, holder, replacerFunction, propertyList, gap, stack, indent) {
    _$jscoverage['/json/stringify.js'].functionData[2]++;
    _$jscoverage['/json/stringify.js'].lineData[14]++;
    var value = holder[key];
    _$jscoverage['/json/stringify.js'].lineData[15]++;
    if (visit47_15_1(value && visit48_15_2(typeof value === 'object'))) {
      _$jscoverage['/json/stringify.js'].lineData[16]++;
      if (visit49_16_1(typeof value.toJSON === 'function')) {
        _$jscoverage['/json/stringify.js'].lineData[17]++;
        value = value.toJSON(key);
      } else {
        _$jscoverage['/json/stringify.js'].lineData[18]++;
        if (visit50_18_1(value instanceof Date)) {
          _$jscoverage['/json/stringify.js'].lineData[19]++;
          value = isFinite(value.valueOf()) ? value.getUTCFullYear() + '-' + padding2(value.getUTCMonth() + 1) + '-' + padding2(value.getUTCDate()) + 'T' + padding2(value.getUTCHours()) + ':' + padding2(value.getUTCMinutes()) + ':' + padding2(value.getUTCSeconds()) + 'Z' : null;
        } else {
          _$jscoverage['/json/stringify.js'].lineData[26]++;
          if (visit51_26_1(value instanceof String || visit52_26_2(value instanceof Number || value instanceof Boolean))) {
            _$jscoverage['/json/stringify.js'].lineData[27]++;
            value = value.valueOf();
          }
        }
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[30]++;
    if (visit53_30_1(replacerFunction !== undefined)) {
      _$jscoverage['/json/stringify.js'].lineData[31]++;
      value = replacerFunction.call(holder, key, value);
    }
    _$jscoverage['/json/stringify.js'].lineData[34]++;
    switch (typeof value) {
      case 'number':
        _$jscoverage['/json/stringify.js'].lineData[36]++;
        return isFinite(value) ? String(value) : 'null';
      case 'string':
        _$jscoverage['/json/stringify.js'].lineData[38]++;
        return Quote.quote(value);
      case 'boolean':
        _$jscoverage['/json/stringify.js'].lineData[40]++;
        return String(value);
      case 'object':
        _$jscoverage['/json/stringify.js'].lineData[42]++;
        if (visit54_42_1(!value)) {
          _$jscoverage['/json/stringify.js'].lineData[43]++;
          return 'null';
        }
        _$jscoverage['/json/stringify.js'].lineData[45]++;
        if (visit55_45_1(S.isArray(value))) {
          _$jscoverage['/json/stringify.js'].lineData[46]++;
          return ja(value, replacerFunction, propertyList, gap, stack, indent);
        }
        _$jscoverage['/json/stringify.js'].lineData[48]++;
        return jo(value, replacerFunction, propertyList, gap, stack, indent);
    }
    _$jscoverage['/json/stringify.js'].lineData[52]++;
    return undefined;
  }
  _$jscoverage['/json/stringify.js'].lineData[55]++;
  function jo(value, replacerFunction, propertyList, gap, stack, indent) {
    _$jscoverage['/json/stringify.js'].functionData[3]++;
    _$jscoverage['/json/stringify.js'].lineData[56]++;
    if (visit56_56_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[57]++;
      if (visit57_57_1(S.inArray(value, stack))) {
        _$jscoverage['/json/stringify.js'].lineData[58]++;
        throw new TypeError('cyclic json');
      }
      _$jscoverage['/json/stringify.js'].lineData[60]++;
      stack[stack.length] = value;
    }
    _$jscoverage['/json/stringify.js'].lineData[63]++;
    var stepBack = indent;
    _$jscoverage['/json/stringify.js'].lineData[64]++;
    indent += gap;
    _$jscoverage['/json/stringify.js'].lineData[65]++;
    var k, kl, i, p;
    _$jscoverage['/json/stringify.js'].lineData[66]++;
    if (visit58_66_1(propertyList !== undefined)) {
      _$jscoverage['/json/stringify.js'].lineData[67]++;
      k = propertyList;
    } else {
      _$jscoverage['/json/stringify.js'].lineData[69]++;
      k = S.keys(value);
    }
    _$jscoverage['/json/stringify.js'].lineData[71]++;
    var partial = [];
    _$jscoverage['/json/stringify.js'].lineData[72]++;
    for (i = 0 , kl = k.length; visit59_72_1(i < kl); i++) {
      _$jscoverage['/json/stringify.js'].lineData[73]++;
      p = k[i];
      _$jscoverage['/json/stringify.js'].lineData[74]++;
      var strP = str(p, value, replacerFunction, propertyList, gap, stack, indent);
      _$jscoverage['/json/stringify.js'].lineData[75]++;
      if (visit60_75_1(strP !== undefined)) {
        _$jscoverage['/json/stringify.js'].lineData[76]++;
        var member = Quote.quote(p);
        _$jscoverage['/json/stringify.js'].lineData[77]++;
        member += ':';
        _$jscoverage['/json/stringify.js'].lineData[78]++;
        if (visit61_78_1(gap)) {
          _$jscoverage['/json/stringify.js'].lineData[79]++;
          member += ' ';
        }
        _$jscoverage['/json/stringify.js'].lineData[81]++;
        member += strP;
        _$jscoverage['/json/stringify.js'].lineData[82]++;
        partial[partial.length] = member;
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[85]++;
    var ret;
    _$jscoverage['/json/stringify.js'].lineData[86]++;
    if (visit62_86_1(!partial.length)) {
      _$jscoverage['/json/stringify.js'].lineData[87]++;
      ret = '{}';
    } else {
      _$jscoverage['/json/stringify.js'].lineData[89]++;
      if (visit63_89_1(!gap)) {
        _$jscoverage['/json/stringify.js'].lineData[90]++;
        ret = '{' + partial.join(',') + '}';
      } else {
        _$jscoverage['/json/stringify.js'].lineData[92]++;
        var separator = ",\n" + indent;
        _$jscoverage['/json/stringify.js'].lineData[93]++;
        var properties = partial.join(separator);
        _$jscoverage['/json/stringify.js'].lineData[94]++;
        ret = '{\n' + indent + properties + '\n' + stepBack + '}';
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[97]++;
    if (visit64_97_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[98]++;
      stack.pop();
    }
    _$jscoverage['/json/stringify.js'].lineData[100]++;
    return ret;
  }
  _$jscoverage['/json/stringify.js'].lineData[103]++;
  function ja(value, replacerFunction, propertyList, gap, stack, indent) {
    _$jscoverage['/json/stringify.js'].functionData[4]++;
    _$jscoverage['/json/stringify.js'].lineData[104]++;
    if (visit65_104_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[105]++;
      if (visit66_105_1(S.inArray(value, stack))) {
        _$jscoverage['/json/stringify.js'].lineData[106]++;
        throw new TypeError('cyclic json');
      }
      _$jscoverage['/json/stringify.js'].lineData[108]++;
      stack[stack.length] = value;
    }
    _$jscoverage['/json/stringify.js'].lineData[110]++;
    var stepBack = indent;
    _$jscoverage['/json/stringify.js'].lineData[111]++;
    indent += gap;
    _$jscoverage['/json/stringify.js'].lineData[112]++;
    var partial = [];
    _$jscoverage['/json/stringify.js'].lineData[113]++;
    var len = value.length;
    _$jscoverage['/json/stringify.js'].lineData[114]++;
    var index = 0;
    _$jscoverage['/json/stringify.js'].lineData[115]++;
    while (visit67_115_1(index < len)) {
      _$jscoverage['/json/stringify.js'].lineData[116]++;
      var strP = str(String(index), value, replacerFunction, propertyList, gap, stack, indent);
      _$jscoverage['/json/stringify.js'].lineData[117]++;
      if (visit68_117_1(strP === undefined)) {
        _$jscoverage['/json/stringify.js'].lineData[118]++;
        partial[partial.length] = 'null';
      } else {
        _$jscoverage['/json/stringify.js'].lineData[120]++;
        partial[partial.length] = strP;
      }
      _$jscoverage['/json/stringify.js'].lineData[122]++;
      ++index;
    }
    _$jscoverage['/json/stringify.js'].lineData[124]++;
    var ret;
    _$jscoverage['/json/stringify.js'].lineData[125]++;
    if (visit69_125_1(!partial.length)) {
      _$jscoverage['/json/stringify.js'].lineData[126]++;
      ret = '[]';
    } else {
      _$jscoverage['/json/stringify.js'].lineData[128]++;
      if (visit70_128_1(!gap)) {
        _$jscoverage['/json/stringify.js'].lineData[129]++;
        ret = '[' + partial.join(',') + ']';
      } else {
        _$jscoverage['/json/stringify.js'].lineData[131]++;
        var separator = '\n,' + indent;
        _$jscoverage['/json/stringify.js'].lineData[132]++;
        var properties = partial.join(separator);
        _$jscoverage['/json/stringify.js'].lineData[133]++;
        ret = '[\n' + indent + properties + '\n' + stepBack + ']';
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[136]++;
    if (visit71_136_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[137]++;
      stack.pop();
    }
    _$jscoverage['/json/stringify.js'].lineData[140]++;
    return ret;
  }
  _$jscoverage['/json/stringify.js'].lineData[143]++;
  function stringify(value, replacer, space) {
    _$jscoverage['/json/stringify.js'].functionData[5]++;
    _$jscoverage['/json/stringify.js'].lineData[144]++;
    var gap = '';
    _$jscoverage['/json/stringify.js'].lineData[145]++;
    var propertyList, replacerFunction;
    _$jscoverage['/json/stringify.js'].lineData[146]++;
    if (visit72_146_1(replacer)) {
      _$jscoverage['/json/stringify.js'].lineData[147]++;
      if (visit73_147_1(typeof replacer === 'function')) {
        _$jscoverage['/json/stringify.js'].lineData[148]++;
        replacerFunction = replacer;
      } else {
        _$jscoverage['/json/stringify.js'].lineData[149]++;
        if (visit74_149_1(S.isArray(replacer))) {
          _$jscoverage['/json/stringify.js'].lineData[150]++;
          propertyList = replacer;
        }
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[154]++;
    if (visit75_154_1(typeof space === 'number')) {
      _$jscoverage['/json/stringify.js'].lineData[155]++;
      space = Math.min(10, space);
      _$jscoverage['/json/stringify.js'].lineData[156]++;
      gap = new Array(space + 1).join(' ');
    } else {
      _$jscoverage['/json/stringify.js'].lineData[157]++;
      if (visit76_157_1(typeof space === 'string')) {
        _$jscoverage['/json/stringify.js'].lineData[158]++;
        gap = space.slice(0, 10);
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[161]++;
    return str('', {
  '': value}, replacerFunction, propertyList, gap, [], '');
  }
  _$jscoverage['/json/stringify.js'].lineData[166]++;
  return stringify;
});
