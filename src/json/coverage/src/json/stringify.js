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
  _$jscoverage['/json/stringify.js'].lineData[8] = 0;
  _$jscoverage['/json/stringify.js'].lineData[10] = 0;
  _$jscoverage['/json/stringify.js'].lineData[11] = 0;
  _$jscoverage['/json/stringify.js'].lineData[14] = 0;
  _$jscoverage['/json/stringify.js'].lineData[15] = 0;
  _$jscoverage['/json/stringify.js'].lineData[16] = 0;
  _$jscoverage['/json/stringify.js'].lineData[17] = 0;
  _$jscoverage['/json/stringify.js'].lineData[18] = 0;
  _$jscoverage['/json/stringify.js'].lineData[19] = 0;
  _$jscoverage['/json/stringify.js'].lineData[20] = 0;
  _$jscoverage['/json/stringify.js'].lineData[27] = 0;
  _$jscoverage['/json/stringify.js'].lineData[28] = 0;
  _$jscoverage['/json/stringify.js'].lineData[31] = 0;
  _$jscoverage['/json/stringify.js'].lineData[32] = 0;
  _$jscoverage['/json/stringify.js'].lineData[35] = 0;
  _$jscoverage['/json/stringify.js'].lineData[37] = 0;
  _$jscoverage['/json/stringify.js'].lineData[39] = 0;
  _$jscoverage['/json/stringify.js'].lineData[41] = 0;
  _$jscoverage['/json/stringify.js'].lineData[43] = 0;
  _$jscoverage['/json/stringify.js'].lineData[44] = 0;
  _$jscoverage['/json/stringify.js'].lineData[46] = 0;
  _$jscoverage['/json/stringify.js'].lineData[47] = 0;
  _$jscoverage['/json/stringify.js'].lineData[49] = 0;
  _$jscoverage['/json/stringify.js'].lineData[53] = 0;
  _$jscoverage['/json/stringify.js'].lineData[56] = 0;
  _$jscoverage['/json/stringify.js'].lineData[57] = 0;
  _$jscoverage['/json/stringify.js'].lineData[58] = 0;
  _$jscoverage['/json/stringify.js'].lineData[59] = 0;
  _$jscoverage['/json/stringify.js'].lineData[61] = 0;
  _$jscoverage['/json/stringify.js'].lineData[64] = 0;
  _$jscoverage['/json/stringify.js'].lineData[65] = 0;
  _$jscoverage['/json/stringify.js'].lineData[66] = 0;
  _$jscoverage['/json/stringify.js'].lineData[67] = 0;
  _$jscoverage['/json/stringify.js'].lineData[68] = 0;
  _$jscoverage['/json/stringify.js'].lineData[70] = 0;
  _$jscoverage['/json/stringify.js'].lineData[72] = 0;
  _$jscoverage['/json/stringify.js'].lineData[73] = 0;
  _$jscoverage['/json/stringify.js'].lineData[74] = 0;
  _$jscoverage['/json/stringify.js'].lineData[75] = 0;
  _$jscoverage['/json/stringify.js'].lineData[76] = 0;
  _$jscoverage['/json/stringify.js'].lineData[77] = 0;
  _$jscoverage['/json/stringify.js'].lineData[78] = 0;
  _$jscoverage['/json/stringify.js'].lineData[79] = 0;
  _$jscoverage['/json/stringify.js'].lineData[80] = 0;
  _$jscoverage['/json/stringify.js'].lineData[82] = 0;
  _$jscoverage['/json/stringify.js'].lineData[83] = 0;
  _$jscoverage['/json/stringify.js'].lineData[86] = 0;
  _$jscoverage['/json/stringify.js'].lineData[87] = 0;
  _$jscoverage['/json/stringify.js'].lineData[88] = 0;
  _$jscoverage['/json/stringify.js'].lineData[90] = 0;
  _$jscoverage['/json/stringify.js'].lineData[91] = 0;
  _$jscoverage['/json/stringify.js'].lineData[93] = 0;
  _$jscoverage['/json/stringify.js'].lineData[94] = 0;
  _$jscoverage['/json/stringify.js'].lineData[95] = 0;
  _$jscoverage['/json/stringify.js'].lineData[98] = 0;
  _$jscoverage['/json/stringify.js'].lineData[99] = 0;
  _$jscoverage['/json/stringify.js'].lineData[101] = 0;
  _$jscoverage['/json/stringify.js'].lineData[104] = 0;
  _$jscoverage['/json/stringify.js'].lineData[105] = 0;
  _$jscoverage['/json/stringify.js'].lineData[106] = 0;
  _$jscoverage['/json/stringify.js'].lineData[107] = 0;
  _$jscoverage['/json/stringify.js'].lineData[109] = 0;
  _$jscoverage['/json/stringify.js'].lineData[111] = 0;
  _$jscoverage['/json/stringify.js'].lineData[112] = 0;
  _$jscoverage['/json/stringify.js'].lineData[113] = 0;
  _$jscoverage['/json/stringify.js'].lineData[114] = 0;
  _$jscoverage['/json/stringify.js'].lineData[115] = 0;
  _$jscoverage['/json/stringify.js'].lineData[116] = 0;
  _$jscoverage['/json/stringify.js'].lineData[117] = 0;
  _$jscoverage['/json/stringify.js'].lineData[118] = 0;
  _$jscoverage['/json/stringify.js'].lineData[119] = 0;
  _$jscoverage['/json/stringify.js'].lineData[121] = 0;
  _$jscoverage['/json/stringify.js'].lineData[123] = 0;
  _$jscoverage['/json/stringify.js'].lineData[125] = 0;
  _$jscoverage['/json/stringify.js'].lineData[126] = 0;
  _$jscoverage['/json/stringify.js'].lineData[127] = 0;
  _$jscoverage['/json/stringify.js'].lineData[129] = 0;
  _$jscoverage['/json/stringify.js'].lineData[130] = 0;
  _$jscoverage['/json/stringify.js'].lineData[132] = 0;
  _$jscoverage['/json/stringify.js'].lineData[133] = 0;
  _$jscoverage['/json/stringify.js'].lineData[134] = 0;
  _$jscoverage['/json/stringify.js'].lineData[137] = 0;
  _$jscoverage['/json/stringify.js'].lineData[138] = 0;
  _$jscoverage['/json/stringify.js'].lineData[141] = 0;
  _$jscoverage['/json/stringify.js'].lineData[144] = 0;
  _$jscoverage['/json/stringify.js'].lineData[145] = 0;
  _$jscoverage['/json/stringify.js'].lineData[146] = 0;
  _$jscoverage['/json/stringify.js'].lineData[147] = 0;
  _$jscoverage['/json/stringify.js'].lineData[148] = 0;
  _$jscoverage['/json/stringify.js'].lineData[149] = 0;
  _$jscoverage['/json/stringify.js'].lineData[150] = 0;
  _$jscoverage['/json/stringify.js'].lineData[151] = 0;
  _$jscoverage['/json/stringify.js'].lineData[155] = 0;
  _$jscoverage['/json/stringify.js'].lineData[156] = 0;
  _$jscoverage['/json/stringify.js'].lineData[157] = 0;
  _$jscoverage['/json/stringify.js'].lineData[158] = 0;
  _$jscoverage['/json/stringify.js'].lineData[159] = 0;
  _$jscoverage['/json/stringify.js'].lineData[162] = 0;
  _$jscoverage['/json/stringify.js'].lineData[167] = 0;
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
  _$jscoverage['/json/stringify.js'].branchData['11'] = [];
  _$jscoverage['/json/stringify.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['16'] = [];
  _$jscoverage['/json/stringify.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['16'][2] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['17'] = [];
  _$jscoverage['/json/stringify.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['19'] = [];
  _$jscoverage['/json/stringify.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['27'] = [];
  _$jscoverage['/json/stringify.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['27'][2] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['31'] = [];
  _$jscoverage['/json/stringify.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['43'] = [];
  _$jscoverage['/json/stringify.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['46'] = [];
  _$jscoverage['/json/stringify.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['57'] = [];
  _$jscoverage['/json/stringify.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['58'] = [];
  _$jscoverage['/json/stringify.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['67'] = [];
  _$jscoverage['/json/stringify.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['73'] = [];
  _$jscoverage['/json/stringify.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['76'] = [];
  _$jscoverage['/json/stringify.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['79'] = [];
  _$jscoverage['/json/stringify.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['87'] = [];
  _$jscoverage['/json/stringify.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['90'] = [];
  _$jscoverage['/json/stringify.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['98'] = [];
  _$jscoverage['/json/stringify.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['105'] = [];
  _$jscoverage['/json/stringify.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['106'] = [];
  _$jscoverage['/json/stringify.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['116'] = [];
  _$jscoverage['/json/stringify.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['118'] = [];
  _$jscoverage['/json/stringify.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['126'] = [];
  _$jscoverage['/json/stringify.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['129'] = [];
  _$jscoverage['/json/stringify.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['137'] = [];
  _$jscoverage['/json/stringify.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['147'] = [];
  _$jscoverage['/json/stringify.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['148'] = [];
  _$jscoverage['/json/stringify.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['150'] = [];
  _$jscoverage['/json/stringify.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['155'] = [];
  _$jscoverage['/json/stringify.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/json/stringify.js'].branchData['158'] = [];
  _$jscoverage['/json/stringify.js'].branchData['158'][1] = new BranchData();
}
_$jscoverage['/json/stringify.js'].branchData['158'][1].init(467, 25, 'typeof space === \'string\'');
function visit81_158_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['155'][1].init(324, 25, 'typeof space === \'number\'');
function visit80_155_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['150'][1].init(123, 22, 'util.isArray(replacer)');
function visit79_150_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['148'][1].init(18, 30, 'typeof replacer === \'function\'');
function visit78_148_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['147'][1].init(82, 8, 'replacer');
function visit77_147_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['137'][1].init(1095, 9, '\'@DEBUG@\'');
function visit76_137_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['129'][1].init(18, 4, '!gap');
function visit75_129_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['126'][1].init(709, 15, '!partial.length');
function visit74_126_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['118'][1].init(121, 18, 'strP === undefined');
function visit73_118_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['116'][1].init(351, 11, 'index < len');
function visit72_116_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['106'][1].init(18, 26, 'util.inArray(value, stack)');
function visit71_106_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['105'][1].init(14, 9, '\'@DEBUG@\'');
function visit70_105_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['98'][1].init(1336, 9, '\'@DEBUG@\'');
function visit69_98_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['90'][1].init(18, 4, '!gap');
function visit68_90_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['87'][1].init(950, 15, '!partial.length');
function visit67_87_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['79'][1].init(100, 3, 'gap');
function visit66_79_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['76'][1].init(132, 18, 'strP !== undefined');
function visit65_76_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['73'][1].init(480, 6, 'i < kl');
function visit64_73_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['67'][1].init(292, 26, 'propertyList !== undefined');
function visit63_67_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['58'][1].init(18, 26, 'util.inArray(value, stack)');
function visit62_58_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['57'][1].init(14, 9, '\'@DEBUG@\'');
function visit61_57_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['46'][1].init(121, 19, 'util.isArray(value)');
function visit60_46_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['43'][1].init(35, 6, '!value');
function visit59_43_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['31'][1].init(856, 30, 'replacerFunction !== undefined');
function visit58_31_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['27'][2].init(636, 52, 'value instanceof Number || value instanceof Boolean');
function visit57_27_2(result) {
  _$jscoverage['/json/stringify.js'].branchData['27'][2].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['27'][1].init(608, 80, 'value instanceof String || value instanceof Number || value instanceof Boolean');
function visit56_27_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['19'][1].init(125, 21, 'value instanceof Date');
function visit55_19_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['17'][1].init(18, 34, 'typeof value.toJSON === \'function\'');
function visit54_17_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['16'][2].init(57, 25, 'typeof value === \'object\'');
function visit53_16_2(result) {
  _$jscoverage['/json/stringify.js'].branchData['16'][2].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['16'][1].init(48, 34, 'value && typeof value === \'object\'');
function visit52_16_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].branchData['11'][1].init(17, 6, 'n < 10');
function visit51_11_1(result) {
  _$jscoverage['/json/stringify.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/stringify.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/json/stringify.js'].functionData[0]++;
  _$jscoverage['/json/stringify.js'].lineData[7]++;
  var Quote = require('./quote');
  _$jscoverage['/json/stringify.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/json/stringify.js'].lineData[10]++;
  function padding2(n) {
    _$jscoverage['/json/stringify.js'].functionData[1]++;
    _$jscoverage['/json/stringify.js'].lineData[11]++;
    return visit51_11_1(n < 10) ? '0' + n : n;
  }
  _$jscoverage['/json/stringify.js'].lineData[14]++;
  function str(key, holder, replacerFunction, propertyList, gap, stack, indent) {
    _$jscoverage['/json/stringify.js'].functionData[2]++;
    _$jscoverage['/json/stringify.js'].lineData[15]++;
    var value = holder[key];
    _$jscoverage['/json/stringify.js'].lineData[16]++;
    if (visit52_16_1(value && visit53_16_2(typeof value === 'object'))) {
      _$jscoverage['/json/stringify.js'].lineData[17]++;
      if (visit54_17_1(typeof value.toJSON === 'function')) {
        _$jscoverage['/json/stringify.js'].lineData[18]++;
        value = value.toJSON(key);
      } else {
        _$jscoverage['/json/stringify.js'].lineData[19]++;
        if (visit55_19_1(value instanceof Date)) {
          _$jscoverage['/json/stringify.js'].lineData[20]++;
          value = isFinite(value.valueOf()) ? value.getUTCFullYear() + '-' + padding2(value.getUTCMonth() + 1) + '-' + padding2(value.getUTCDate()) + 'T' + padding2(value.getUTCHours()) + ':' + padding2(value.getUTCMinutes()) + ':' + padding2(value.getUTCSeconds()) + 'Z' : null;
        } else {
          _$jscoverage['/json/stringify.js'].lineData[27]++;
          if (visit56_27_1(value instanceof String || visit57_27_2(value instanceof Number || value instanceof Boolean))) {
            _$jscoverage['/json/stringify.js'].lineData[28]++;
            value = value.valueOf();
          }
        }
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[31]++;
    if (visit58_31_1(replacerFunction !== undefined)) {
      _$jscoverage['/json/stringify.js'].lineData[32]++;
      value = replacerFunction.call(holder, key, value);
    }
    _$jscoverage['/json/stringify.js'].lineData[35]++;
    switch (typeof value) {
      case 'number':
        _$jscoverage['/json/stringify.js'].lineData[37]++;
        return isFinite(value) ? String(value) : 'null';
      case 'string':
        _$jscoverage['/json/stringify.js'].lineData[39]++;
        return Quote.quote(value);
      case 'boolean':
        _$jscoverage['/json/stringify.js'].lineData[41]++;
        return String(value);
      case 'object':
        _$jscoverage['/json/stringify.js'].lineData[43]++;
        if (visit59_43_1(!value)) {
          _$jscoverage['/json/stringify.js'].lineData[44]++;
          return 'null';
        }
        _$jscoverage['/json/stringify.js'].lineData[46]++;
        if (visit60_46_1(util.isArray(value))) {
          _$jscoverage['/json/stringify.js'].lineData[47]++;
          return ja(value, replacerFunction, propertyList, gap, stack, indent);
        }
        _$jscoverage['/json/stringify.js'].lineData[49]++;
        return jo(value, replacerFunction, propertyList, gap, stack, indent);
    }
    _$jscoverage['/json/stringify.js'].lineData[53]++;
    return undefined;
  }
  _$jscoverage['/json/stringify.js'].lineData[56]++;
  function jo(value, replacerFunction, propertyList, gap, stack, indent) {
    _$jscoverage['/json/stringify.js'].functionData[3]++;
    _$jscoverage['/json/stringify.js'].lineData[57]++;
    if (visit61_57_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[58]++;
      if (visit62_58_1(util.inArray(value, stack))) {
        _$jscoverage['/json/stringify.js'].lineData[59]++;
        throw new TypeError('cyclic json');
      }
      _$jscoverage['/json/stringify.js'].lineData[61]++;
      stack[stack.length] = value;
    }
    _$jscoverage['/json/stringify.js'].lineData[64]++;
    var stepBack = indent;
    _$jscoverage['/json/stringify.js'].lineData[65]++;
    indent += gap;
    _$jscoverage['/json/stringify.js'].lineData[66]++;
    var k, kl, i, p;
    _$jscoverage['/json/stringify.js'].lineData[67]++;
    if (visit63_67_1(propertyList !== undefined)) {
      _$jscoverage['/json/stringify.js'].lineData[68]++;
      k = propertyList;
    } else {
      _$jscoverage['/json/stringify.js'].lineData[70]++;
      k = util.keys(value);
    }
    _$jscoverage['/json/stringify.js'].lineData[72]++;
    var partial = [];
    _$jscoverage['/json/stringify.js'].lineData[73]++;
    for (i = 0 , kl = k.length; visit64_73_1(i < kl); i++) {
      _$jscoverage['/json/stringify.js'].lineData[74]++;
      p = k[i];
      _$jscoverage['/json/stringify.js'].lineData[75]++;
      var strP = str(p, value, replacerFunction, propertyList, gap, stack, indent);
      _$jscoverage['/json/stringify.js'].lineData[76]++;
      if (visit65_76_1(strP !== undefined)) {
        _$jscoverage['/json/stringify.js'].lineData[77]++;
        var member = Quote.quote(p);
        _$jscoverage['/json/stringify.js'].lineData[78]++;
        member += ':';
        _$jscoverage['/json/stringify.js'].lineData[79]++;
        if (visit66_79_1(gap)) {
          _$jscoverage['/json/stringify.js'].lineData[80]++;
          member += ' ';
        }
        _$jscoverage['/json/stringify.js'].lineData[82]++;
        member += strP;
        _$jscoverage['/json/stringify.js'].lineData[83]++;
        partial[partial.length] = member;
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[86]++;
    var ret;
    _$jscoverage['/json/stringify.js'].lineData[87]++;
    if (visit67_87_1(!partial.length)) {
      _$jscoverage['/json/stringify.js'].lineData[88]++;
      ret = '{}';
    } else {
      _$jscoverage['/json/stringify.js'].lineData[90]++;
      if (visit68_90_1(!gap)) {
        _$jscoverage['/json/stringify.js'].lineData[91]++;
        ret = '{' + partial.join(',') + '}';
      } else {
        _$jscoverage['/json/stringify.js'].lineData[93]++;
        var separator = ',\n' + indent;
        _$jscoverage['/json/stringify.js'].lineData[94]++;
        var properties = partial.join(separator);
        _$jscoverage['/json/stringify.js'].lineData[95]++;
        ret = '{\n' + indent + properties + '\n' + stepBack + '}';
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[98]++;
    if (visit69_98_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[99]++;
      stack.pop();
    }
    _$jscoverage['/json/stringify.js'].lineData[101]++;
    return ret;
  }
  _$jscoverage['/json/stringify.js'].lineData[104]++;
  function ja(value, replacerFunction, propertyList, gap, stack, indent) {
    _$jscoverage['/json/stringify.js'].functionData[4]++;
    _$jscoverage['/json/stringify.js'].lineData[105]++;
    if (visit70_105_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[106]++;
      if (visit71_106_1(util.inArray(value, stack))) {
        _$jscoverage['/json/stringify.js'].lineData[107]++;
        throw new TypeError('cyclic json');
      }
      _$jscoverage['/json/stringify.js'].lineData[109]++;
      stack[stack.length] = value;
    }
    _$jscoverage['/json/stringify.js'].lineData[111]++;
    var stepBack = indent;
    _$jscoverage['/json/stringify.js'].lineData[112]++;
    indent += gap;
    _$jscoverage['/json/stringify.js'].lineData[113]++;
    var partial = [];
    _$jscoverage['/json/stringify.js'].lineData[114]++;
    var len = value.length;
    _$jscoverage['/json/stringify.js'].lineData[115]++;
    var index = 0;
    _$jscoverage['/json/stringify.js'].lineData[116]++;
    while (visit72_116_1(index < len)) {
      _$jscoverage['/json/stringify.js'].lineData[117]++;
      var strP = str(String(index), value, replacerFunction, propertyList, gap, stack, indent);
      _$jscoverage['/json/stringify.js'].lineData[118]++;
      if (visit73_118_1(strP === undefined)) {
        _$jscoverage['/json/stringify.js'].lineData[119]++;
        partial[partial.length] = 'null';
      } else {
        _$jscoverage['/json/stringify.js'].lineData[121]++;
        partial[partial.length] = strP;
      }
      _$jscoverage['/json/stringify.js'].lineData[123]++;
      ++index;
    }
    _$jscoverage['/json/stringify.js'].lineData[125]++;
    var ret;
    _$jscoverage['/json/stringify.js'].lineData[126]++;
    if (visit74_126_1(!partial.length)) {
      _$jscoverage['/json/stringify.js'].lineData[127]++;
      ret = '[]';
    } else {
      _$jscoverage['/json/stringify.js'].lineData[129]++;
      if (visit75_129_1(!gap)) {
        _$jscoverage['/json/stringify.js'].lineData[130]++;
        ret = '[' + partial.join(',') + ']';
      } else {
        _$jscoverage['/json/stringify.js'].lineData[132]++;
        var separator = '\n,' + indent;
        _$jscoverage['/json/stringify.js'].lineData[133]++;
        var properties = partial.join(separator);
        _$jscoverage['/json/stringify.js'].lineData[134]++;
        ret = '[\n' + indent + properties + '\n' + stepBack + ']';
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[137]++;
    if (visit76_137_1('@DEBUG@')) {
      _$jscoverage['/json/stringify.js'].lineData[138]++;
      stack.pop();
    }
    _$jscoverage['/json/stringify.js'].lineData[141]++;
    return ret;
  }
  _$jscoverage['/json/stringify.js'].lineData[144]++;
  function stringify(value, replacer, space) {
    _$jscoverage['/json/stringify.js'].functionData[5]++;
    _$jscoverage['/json/stringify.js'].lineData[145]++;
    var gap = '';
    _$jscoverage['/json/stringify.js'].lineData[146]++;
    var propertyList, replacerFunction;
    _$jscoverage['/json/stringify.js'].lineData[147]++;
    if (visit77_147_1(replacer)) {
      _$jscoverage['/json/stringify.js'].lineData[148]++;
      if (visit78_148_1(typeof replacer === 'function')) {
        _$jscoverage['/json/stringify.js'].lineData[149]++;
        replacerFunction = replacer;
      } else {
        _$jscoverage['/json/stringify.js'].lineData[150]++;
        if (visit79_150_1(util.isArray(replacer))) {
          _$jscoverage['/json/stringify.js'].lineData[151]++;
          propertyList = replacer;
        }
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[155]++;
    if (visit80_155_1(typeof space === 'number')) {
      _$jscoverage['/json/stringify.js'].lineData[156]++;
      space = Math.min(10, space);
      _$jscoverage['/json/stringify.js'].lineData[157]++;
      gap = new Array(space + 1).join(' ');
    } else {
      _$jscoverage['/json/stringify.js'].lineData[158]++;
      if (visit81_158_1(typeof space === 'string')) {
        _$jscoverage['/json/stringify.js'].lineData[159]++;
        gap = space.slice(0, 10);
      }
    }
    _$jscoverage['/json/stringify.js'].lineData[162]++;
    return str('', {
  '': value}, replacerFunction, propertyList, gap, [], '');
  }
  _$jscoverage['/json/stringify.js'].lineData[167]++;
  return stringify;
});
