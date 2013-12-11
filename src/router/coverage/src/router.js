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
if (! _$jscoverage['/router.js']) {
  _$jscoverage['/router.js'] = {};
  _$jscoverage['/router.js'].lineData = [];
  _$jscoverage['/router.js'].lineData[5] = 0;
  _$jscoverage['/router.js'].lineData[6] = 0;
  _$jscoverage['/router.js'].lineData[7] = 0;
  _$jscoverage['/router.js'].lineData[8] = 0;
  _$jscoverage['/router.js'].lineData[9] = 0;
  _$jscoverage['/router.js'].lineData[10] = 0;
  _$jscoverage['/router.js'].lineData[11] = 0;
  _$jscoverage['/router.js'].lineData[12] = 0;
  _$jscoverage['/router.js'].lineData[13] = 0;
  _$jscoverage['/router.js'].lineData[14] = 0;
  _$jscoverage['/router.js'].lineData[15] = 0;
  _$jscoverage['/router.js'].lineData[16] = 0;
  _$jscoverage['/router.js'].lineData[17] = 0;
  _$jscoverage['/router.js'].lineData[18] = 0;
  _$jscoverage['/router.js'].lineData[19] = 0;
  _$jscoverage['/router.js'].lineData[21] = 0;
  _$jscoverage['/router.js'].lineData[24] = 0;
  _$jscoverage['/router.js'].lineData[25] = 0;
  _$jscoverage['/router.js'].lineData[26] = 0;
  _$jscoverage['/router.js'].lineData[27] = 0;
  _$jscoverage['/router.js'].lineData[28] = 0;
  _$jscoverage['/router.js'].lineData[29] = 0;
  _$jscoverage['/router.js'].lineData[31] = 0;
  _$jscoverage['/router.js'].lineData[35] = 0;
  _$jscoverage['/router.js'].lineData[36] = 0;
  _$jscoverage['/router.js'].lineData[37] = 0;
  _$jscoverage['/router.js'].lineData[39] = 0;
  _$jscoverage['/router.js'].lineData[40] = 0;
  _$jscoverage['/router.js'].lineData[41] = 0;
  _$jscoverage['/router.js'].lineData[42] = 0;
  _$jscoverage['/router.js'].lineData[44] = 0;
  _$jscoverage['/router.js'].lineData[45] = 0;
  _$jscoverage['/router.js'].lineData[46] = 0;
  _$jscoverage['/router.js'].lineData[47] = 0;
  _$jscoverage['/router.js'].lineData[48] = 0;
  _$jscoverage['/router.js'].lineData[49] = 0;
  _$jscoverage['/router.js'].lineData[50] = 0;
  _$jscoverage['/router.js'].lineData[51] = 0;
  _$jscoverage['/router.js'].lineData[52] = 0;
  _$jscoverage['/router.js'].lineData[54] = 0;
  _$jscoverage['/router.js'].lineData[59] = 0;
  _$jscoverage['/router.js'].lineData[62] = 0;
  _$jscoverage['/router.js'].lineData[63] = 0;
  _$jscoverage['/router.js'].lineData[64] = 0;
  _$jscoverage['/router.js'].lineData[66] = 0;
  _$jscoverage['/router.js'].lineData[67] = 0;
  _$jscoverage['/router.js'].lineData[68] = 0;
  _$jscoverage['/router.js'].lineData[69] = 0;
  _$jscoverage['/router.js'].lineData[70] = 0;
  _$jscoverage['/router.js'].lineData[71] = 0;
  _$jscoverage['/router.js'].lineData[72] = 0;
  _$jscoverage['/router.js'].lineData[73] = 0;
  _$jscoverage['/router.js'].lineData[74] = 0;
  _$jscoverage['/router.js'].lineData[75] = 0;
  _$jscoverage['/router.js'].lineData[76] = 0;
  _$jscoverage['/router.js'].lineData[77] = 0;
  _$jscoverage['/router.js'].lineData[79] = 0;
  _$jscoverage['/router.js'].lineData[80] = 0;
  _$jscoverage['/router.js'].lineData[81] = 0;
  _$jscoverage['/router.js'].lineData[85] = 0;
  _$jscoverage['/router.js'].lineData[87] = 0;
  _$jscoverage['/router.js'].lineData[92] = 0;
  _$jscoverage['/router.js'].lineData[95] = 0;
  _$jscoverage['/router.js'].lineData[96] = 0;
  _$jscoverage['/router.js'].lineData[97] = 0;
  _$jscoverage['/router.js'].lineData[98] = 0;
  _$jscoverage['/router.js'].lineData[99] = 0;
  _$jscoverage['/router.js'].lineData[101] = 0;
  _$jscoverage['/router.js'].lineData[102] = 0;
  _$jscoverage['/router.js'].lineData[108] = 0;
  _$jscoverage['/router.js'].lineData[111] = 0;
  _$jscoverage['/router.js'].lineData[114] = 0;
  _$jscoverage['/router.js'].lineData[115] = 0;
  _$jscoverage['/router.js'].lineData[116] = 0;
  _$jscoverage['/router.js'].lineData[117] = 0;
  _$jscoverage['/router.js'].lineData[119] = 0;
  _$jscoverage['/router.js'].lineData[131] = 0;
  _$jscoverage['/router.js'].lineData[132] = 0;
  _$jscoverage['/router.js'].lineData[133] = 0;
  _$jscoverage['/router.js'].lineData[135] = 0;
  _$jscoverage['/router.js'].lineData[136] = 0;
  _$jscoverage['/router.js'].lineData[137] = 0;
  _$jscoverage['/router.js'].lineData[141] = 0;
  _$jscoverage['/router.js'].lineData[143] = 0;
  _$jscoverage['/router.js'].lineData[144] = 0;
  _$jscoverage['/router.js'].lineData[146] = 0;
  _$jscoverage['/router.js'].lineData[148] = 0;
  _$jscoverage['/router.js'].lineData[151] = 0;
  _$jscoverage['/router.js'].lineData[152] = 0;
  _$jscoverage['/router.js'].lineData[156] = 0;
  _$jscoverage['/router.js'].lineData[157] = 0;
  _$jscoverage['/router.js'].lineData[158] = 0;
  _$jscoverage['/router.js'].lineData[170] = 0;
  _$jscoverage['/router.js'].lineData[171] = 0;
  _$jscoverage['/router.js'].lineData[173] = 0;
  _$jscoverage['/router.js'].lineData[174] = 0;
  _$jscoverage['/router.js'].lineData[178] = 0;
  _$jscoverage['/router.js'].lineData[179] = 0;
  _$jscoverage['/router.js'].lineData[180] = 0;
  _$jscoverage['/router.js'].lineData[182] = 0;
  _$jscoverage['/router.js'].lineData[186] = 0;
  _$jscoverage['/router.js'].lineData[187] = 0;
  _$jscoverage['/router.js'].lineData[193] = 0;
  _$jscoverage['/router.js'].lineData[194] = 0;
  _$jscoverage['/router.js'].lineData[196] = 0;
  _$jscoverage['/router.js'].lineData[197] = 0;
  _$jscoverage['/router.js'].lineData[199] = 0;
  _$jscoverage['/router.js'].lineData[208] = 0;
  _$jscoverage['/router.js'].lineData[209] = 0;
  _$jscoverage['/router.js'].lineData[210] = 0;
  _$jscoverage['/router.js'].lineData[215] = 0;
  _$jscoverage['/router.js'].lineData[216] = 0;
  _$jscoverage['/router.js'].lineData[217] = 0;
  _$jscoverage['/router.js'].lineData[221] = 0;
  _$jscoverage['/router.js'].lineData[223] = 0;
  _$jscoverage['/router.js'].lineData[228] = 0;
  _$jscoverage['/router.js'].lineData[229] = 0;
  _$jscoverage['/router.js'].lineData[231] = 0;
  _$jscoverage['/router.js'].lineData[232] = 0;
  _$jscoverage['/router.js'].lineData[236] = 0;
  _$jscoverage['/router.js'].lineData[237] = 0;
}
if (! _$jscoverage['/router.js'].functionData) {
  _$jscoverage['/router.js'].functionData = [];
  _$jscoverage['/router.js'].functionData[0] = 0;
  _$jscoverage['/router.js'].functionData[1] = 0;
  _$jscoverage['/router.js'].functionData[2] = 0;
  _$jscoverage['/router.js'].functionData[3] = 0;
  _$jscoverage['/router.js'].functionData[4] = 0;
  _$jscoverage['/router.js'].functionData[5] = 0;
  _$jscoverage['/router.js'].functionData[6] = 0;
  _$jscoverage['/router.js'].functionData[7] = 0;
  _$jscoverage['/router.js'].functionData[8] = 0;
  _$jscoverage['/router.js'].functionData[9] = 0;
  _$jscoverage['/router.js'].functionData[10] = 0;
  _$jscoverage['/router.js'].functionData[11] = 0;
  _$jscoverage['/router.js'].functionData[12] = 0;
}
if (! _$jscoverage['/router.js'].branchData) {
  _$jscoverage['/router.js'].branchData = {};
  _$jscoverage['/router.js'].branchData['19'] = [];
  _$jscoverage['/router.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['25'] = [];
  _$jscoverage['/router.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['27'] = [];
  _$jscoverage['/router.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['41'] = [];
  _$jscoverage['/router.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['45'] = [];
  _$jscoverage['/router.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['68'] = [];
  _$jscoverage['/router.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['75'] = [];
  _$jscoverage['/router.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['80'] = [];
  _$jscoverage['/router.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['101'] = [];
  _$jscoverage['/router.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['115'] = [];
  _$jscoverage['/router.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['132'] = [];
  _$jscoverage['/router.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['135'] = [];
  _$jscoverage['/router.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['136'] = [];
  _$jscoverage['/router.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['144'] = [];
  _$jscoverage['/router.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['151'] = [];
  _$jscoverage['/router.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['171'] = [];
  _$jscoverage['/router.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['173'] = [];
  _$jscoverage['/router.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['174'] = [];
  _$jscoverage['/router.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['178'] = [];
  _$jscoverage['/router.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['186'] = [];
  _$jscoverage['/router.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['187'] = [];
  _$jscoverage['/router.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['193'] = [];
  _$jscoverage['/router.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['194'] = [];
  _$jscoverage['/router.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['208'] = [];
  _$jscoverage['/router.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['216'] = [];
  _$jscoverage['/router.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['228'] = [];
  _$jscoverage['/router.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['231'] = [];
  _$jscoverage['/router.js'].branchData['231'][1] = new BranchData();
}
_$jscoverage['/router.js'].branchData['231'][1].init(742, 12, 'opts.success');
function visit41_231_1(result) {
  _$jscoverage['/router.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['228'][1].init(660, 17, 'opts.triggerRoute');
function visit40_228_1(result) {
  _$jscoverage['/router.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['216'][1].init(18, 40, 'useNativeHistory && supportNativeHistory');
function visit39_216_1(result) {
  _$jscoverage['/router.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['208'][1].init(882, 42, '!utils.equalsIgnoreSlash(locPath, urlRoot)');
function visit38_208_1(result) {
  _$jscoverage['/router.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['194'][1].init(26, 41, 'utils.equalsIgnoreSlash(locPath, urlRoot)');
function visit37_194_1(result) {
  _$jscoverage['/router.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['193'][1].init(216, 11, 'hashIsValid');
function visit36_193_1(result) {
  _$jscoverage['/router.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['187'][1].init(18, 20, 'supportNativeHistory');
function visit35_187_1(result) {
  _$jscoverage['/router.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['186'][1].init(464, 16, 'useNativeHistory');
function visit34_186_1(result) {
  _$jscoverage['/router.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['178'][1].init(186, 18, 'opts.urlRoot || \'\'');
function visit33_178_1(result) {
  _$jscoverage['/router.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['174'][1].init(21, 42, 'opts.success && opts.success.call(exports)');
function visit32_174_1(result) {
  _$jscoverage['/router.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['173'][1].init(44, 7, 'started');
function visit31_173_1(result) {
  _$jscoverage['/router.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['171'][1].init(17, 10, 'opts || {}');
function visit30_171_1(result) {
  _$jscoverage['/router.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['151'][1].init(924, 25, 'opts && opts.triggerRoute');
function visit29_151_1(result) {
  _$jscoverage['/router.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['144'][1].init(69, 14, 'replaceHistory');
function visit28_144_1(result) {
  _$jscoverage['/router.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['136'][1].init(18, 40, 'useNativeHistory && supportNativeHistory');
function visit27_136_1(result) {
  _$jscoverage['/router.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['135'][1].init(122, 26, 'getUrlForRouter() !== path');
function visit26_135_1(result) {
  _$jscoverage['/router.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['132'][1].init(17, 10, 'opts || {}');
function visit25_132_1(result) {
  _$jscoverage['/router.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['115'][1].init(14, 26, 'typeof prefix !== \'string\'');
function visit24_115_1(result) {
  _$jscoverage['/router.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['101'][1].init(189, 21, 'uri.toString() || \'/\'');
function visit23_101_1(result) {
  _$jscoverage['/router.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['80'][1].init(80, 30, 'callbackIndex !== callbacksLen');
function visit22_80_1(result) {
  _$jscoverage['/router.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['75'][1].init(30, 17, 'cause === \'route\'');
function visit21_75_1(result) {
  _$jscoverage['/router.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['68'][1].init(40, 13, 'index !== len');
function visit20_68_1(result) {
  _$jscoverage['/router.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['45'][1].init(76, 53, 'S.startsWith(request.path + \'/\', middleware[0] + \'/\')');
function visit19_45_1(result) {
  _$jscoverage['/router.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['41'][1].init(40, 13, 'index === len');
function visit18_41_1(result) {
  _$jscoverage['/router.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['27'][1].init(84, 40, 'useNativeHistory && supportNativeHistory');
function visit17_27_1(result) {
  _$jscoverage['/router.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['25'][1].init(16, 20, 'url || location.href');
function visit16_25_1(result) {
  _$jscoverage['/router.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['19'][1].init(495, 28, 'history && history.pushState');
function visit15_19_1(result) {
  _$jscoverage['/router.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].lineData[5]++;
KISSY.add(function(S, require, exports) {
  _$jscoverage['/router.js'].functionData[0]++;
  _$jscoverage['/router.js'].lineData[6]++;
  var middlewares = [];
  _$jscoverage['/router.js'].lineData[7]++;
  var routes = [];
  _$jscoverage['/router.js'].lineData[8]++;
  var utils = require('./router/utils');
  _$jscoverage['/router.js'].lineData[9]++;
  var Route = require('./router/route');
  _$jscoverage['/router.js'].lineData[10]++;
  var Uri = require('uri');
  _$jscoverage['/router.js'].lineData[11]++;
  var Request = require('./router/request');
  _$jscoverage['/router.js'].lineData[12]++;
  var DomEvent = require('event/dom');
  _$jscoverage['/router.js'].lineData[13]++;
  var started = false;
  _$jscoverage['/router.js'].lineData[14]++;
  var useNativeHistory;
  _$jscoverage['/router.js'].lineData[15]++;
  var urlRoot;
  _$jscoverage['/router.js'].lineData[16]++;
  var win = S.Env.host;
  _$jscoverage['/router.js'].lineData[17]++;
  var history = win.history;
  _$jscoverage['/router.js'].lineData[18]++;
  var supportNativeHashChange = S.Features.isHashChangeSupported();
  _$jscoverage['/router.js'].lineData[19]++;
  var supportNativeHistory = !!(visit15_19_1(history && history.pushState));
  _$jscoverage['/router.js'].lineData[21]++;
  var BREATH_INTERVAL = 100;
  _$jscoverage['/router.js'].lineData[24]++;
  function getUrlForRouter(url) {
    _$jscoverage['/router.js'].functionData[1]++;
    _$jscoverage['/router.js'].lineData[25]++;
    url = visit16_25_1(url || location.href);
    _$jscoverage['/router.js'].lineData[26]++;
    var uri = new Uri(url);
    _$jscoverage['/router.js'].lineData[27]++;
    if (visit17_27_1(useNativeHistory && supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[28]++;
      var query = uri.query;
      _$jscoverage['/router.js'].lineData[29]++;
      return uri.getPath().substr(urlRoot.length) + (query.has() ? ('?' + query.toString()) : '');
    } else {
      _$jscoverage['/router.js'].lineData[31]++;
      return utils.getHash(uri);
    }
  }
  _$jscoverage['/router.js'].lineData[35]++;
  function fireMiddleWare(request, response, cb) {
    _$jscoverage['/router.js'].functionData[2]++;
    _$jscoverage['/router.js'].lineData[36]++;
    var index = -1;
    _$jscoverage['/router.js'].lineData[37]++;
    var len = middlewares.length;
    _$jscoverage['/router.js'].lineData[39]++;
    function next() {
      _$jscoverage['/router.js'].functionData[3]++;
      _$jscoverage['/router.js'].lineData[40]++;
      index++;
      _$jscoverage['/router.js'].lineData[41]++;
      if (visit18_41_1(index === len)) {
        _$jscoverage['/router.js'].lineData[42]++;
        cb(request, response);
      } else {
        _$jscoverage['/router.js'].lineData[44]++;
        var middleware = middlewares[index];
        _$jscoverage['/router.js'].lineData[45]++;
        if (visit19_45_1(S.startsWith(request.path + '/', middleware[0] + '/'))) {
          _$jscoverage['/router.js'].lineData[46]++;
          var prefixLen = middleware[0].length;
          _$jscoverage['/router.js'].lineData[47]++;
          request.url = request.url.slice(prefixLen);
          _$jscoverage['/router.js'].lineData[48]++;
          var path = request.path;
          _$jscoverage['/router.js'].lineData[49]++;
          request.path = request.path.slice(prefixLen);
          _$jscoverage['/router.js'].lineData[50]++;
          middleware[1](request, next);
          _$jscoverage['/router.js'].lineData[51]++;
          request.url = request.originalUrl;
          _$jscoverage['/router.js'].lineData[52]++;
          request.path = path;
        } else {
          _$jscoverage['/router.js'].lineData[54]++;
          next();
        }
      }
    }
    _$jscoverage['/router.js'].lineData[59]++;
    next();
  }
  _$jscoverage['/router.js'].lineData[62]++;
  function fireRoutes(request, response) {
    _$jscoverage['/router.js'].functionData[4]++;
    _$jscoverage['/router.js'].lineData[63]++;
    var index = -1;
    _$jscoverage['/router.js'].lineData[64]++;
    var len = routes.length;
    _$jscoverage['/router.js'].lineData[66]++;
    function next() {
      _$jscoverage['/router.js'].functionData[5]++;
      _$jscoverage['/router.js'].lineData[67]++;
      index++;
      _$jscoverage['/router.js'].lineData[68]++;
      if (visit20_68_1(index !== len)) {
        _$jscoverage['/router.js'].lineData[69]++;
        var route = routes[index];
        _$jscoverage['/router.js'].lineData[70]++;
        if ((request.params = route.match(request.path))) {
          _$jscoverage['/router.js'].lineData[71]++;
          var callbackIndex = -1;
          _$jscoverage['/router.js'].lineData[72]++;
          var callbacks = route.callbacks;
          _$jscoverage['/router.js'].lineData[73]++;
          var callbacksLen = callbacks.length;
          _$jscoverage['/router.js'].lineData[74]++;
          var nextCallback = function(cause) {
  _$jscoverage['/router.js'].functionData[6]++;
  _$jscoverage['/router.js'].lineData[75]++;
  if (visit21_75_1(cause === 'route')) {
    _$jscoverage['/router.js'].lineData[76]++;
    nextCallback = null;
    _$jscoverage['/router.js'].lineData[77]++;
    next();
  } else {
    _$jscoverage['/router.js'].lineData[79]++;
    callbackIndex++;
    _$jscoverage['/router.js'].lineData[80]++;
    if (visit22_80_1(callbackIndex !== callbacksLen)) {
      _$jscoverage['/router.js'].lineData[81]++;
      callbacks[callbackIndex](request, response, nextCallback);
    }
  }
};
          _$jscoverage['/router.js'].lineData[85]++;
          nextCallback('');
        } else {
          _$jscoverage['/router.js'].lineData[87]++;
          next();
        }
      }
    }
    _$jscoverage['/router.js'].lineData[92]++;
    next();
  }
  _$jscoverage['/router.js'].lineData[95]++;
  function dispatch() {
    _$jscoverage['/router.js'].functionData[7]++;
    _$jscoverage['/router.js'].lineData[96]++;
    var url = getUrlForRouter();
    _$jscoverage['/router.js'].lineData[97]++;
    var uri = new S.Uri(url);
    _$jscoverage['/router.js'].lineData[98]++;
    var query = uri.query.get();
    _$jscoverage['/router.js'].lineData[99]++;
    uri.query.reset();
    _$jscoverage['/router.js'].lineData[101]++;
    var path = visit23_101_1(uri.toString() || '/');
    _$jscoverage['/router.js'].lineData[102]++;
    var request = new Request({
  query: query, 
  path: path, 
  url: url, 
  originalUrl: url});
    _$jscoverage['/router.js'].lineData[108]++;
    var response = {
  redirect: exports.navigate};
    _$jscoverage['/router.js'].lineData[111]++;
    fireMiddleWare(request, response, fireRoutes);
  }
  _$jscoverage['/router.js'].lineData[114]++;
  exports.use = function(prefix, callback) {
  _$jscoverage['/router.js'].functionData[8]++;
  _$jscoverage['/router.js'].lineData[115]++;
  if (visit24_115_1(typeof prefix !== 'string')) {
    _$jscoverage['/router.js'].lineData[116]++;
    callback = prefix;
    _$jscoverage['/router.js'].lineData[117]++;
    prefix = '';
  }
  _$jscoverage['/router.js'].lineData[119]++;
  middlewares.push([prefix, callback]);
};
  _$jscoverage['/router.js'].lineData[131]++;
  exports.navigate = function(path, opts) {
  _$jscoverage['/router.js'].functionData[9]++;
  _$jscoverage['/router.js'].lineData[132]++;
  opts = visit25_132_1(opts || {});
  _$jscoverage['/router.js'].lineData[133]++;
  var replaceHistory = opts.replaceHistory, normalizedPath;
  _$jscoverage['/router.js'].lineData[135]++;
  if (visit26_135_1(getUrlForRouter() !== path)) {
    _$jscoverage['/router.js'].lineData[136]++;
    if (visit27_136_1(useNativeHistory && supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[137]++;
      history[replaceHistory ? 'replaceState' : 'pushState']({}, '', utils.getFullPath(path, urlRoot));
      _$jscoverage['/router.js'].lineData[141]++;
      dispatch();
    } else {
      _$jscoverage['/router.js'].lineData[143]++;
      normalizedPath = '#!' + path;
      _$jscoverage['/router.js'].lineData[144]++;
      if (visit28_144_1(replaceHistory)) {
        _$jscoverage['/router.js'].lineData[146]++;
        location.replace(normalizedPath + (supportNativeHashChange ? Node.REPLACE_HISTORY : ''));
      } else {
        _$jscoverage['/router.js'].lineData[148]++;
        location.hash = normalizedPath;
      }
    }
  } else {
    _$jscoverage['/router.js'].lineData[151]++;
    if (visit29_151_1(opts && opts.triggerRoute)) {
      _$jscoverage['/router.js'].lineData[152]++;
      dispatch();
    }
  }
};
  _$jscoverage['/router.js'].lineData[156]++;
  exports.get = function(path) {
  _$jscoverage['/router.js'].functionData[10]++;
  _$jscoverage['/router.js'].lineData[157]++;
  var callbacks = S.makeArray(arguments).slice(1);
  _$jscoverage['/router.js'].lineData[158]++;
  routes.push(new Route(path, callbacks));
};
  _$jscoverage['/router.js'].lineData[170]++;
  exports.start = function(opts) {
  _$jscoverage['/router.js'].functionData[11]++;
  _$jscoverage['/router.js'].lineData[171]++;
  opts = visit30_171_1(opts || {});
  _$jscoverage['/router.js'].lineData[173]++;
  if (visit31_173_1(started)) {
    _$jscoverage['/router.js'].lineData[174]++;
    return visit32_174_1(opts.success && opts.success.call(exports));
  }
  _$jscoverage['/router.js'].lineData[178]++;
  opts.urlRoot = (visit33_178_1(opts.urlRoot || '')).replace(/\/$/, '');
  _$jscoverage['/router.js'].lineData[179]++;
  useNativeHistory = opts.useNativeHistory;
  _$jscoverage['/router.js'].lineData[180]++;
  urlRoot = opts.urlRoot;
  _$jscoverage['/router.js'].lineData[182]++;
  var locPath = location.pathname, hash = getUrlForRouter(), hashIsValid = location.hash.match(/#!.+/);
  _$jscoverage['/router.js'].lineData[186]++;
  if (visit34_186_1(useNativeHistory)) {
    _$jscoverage['/router.js'].lineData[187]++;
    if (visit35_187_1(supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[193]++;
      if (visit36_193_1(hashIsValid)) {
        _$jscoverage['/router.js'].lineData[194]++;
        if (visit37_194_1(utils.equalsIgnoreSlash(locPath, urlRoot))) {
          _$jscoverage['/router.js'].lineData[196]++;
          history.replaceState({}, '', utils.getFullPath(hash, urlRoot));
          _$jscoverage['/router.js'].lineData[197]++;
          opts.triggerRoute = 1;
        } else {
          _$jscoverage['/router.js'].lineData[199]++;
          S.error('router: location path must be same with urlRoot!');
        }
      }
    } else {
      _$jscoverage['/router.js'].lineData[208]++;
      if (visit38_208_1(!utils.equalsIgnoreSlash(locPath, urlRoot))) {
        _$jscoverage['/router.js'].lineData[209]++;
        location.replace(utils.addEndSlash(urlRoot) + '#!' + hash);
        _$jscoverage['/router.js'].lineData[210]++;
        return undefined;
      }
    }
  }
  _$jscoverage['/router.js'].lineData[215]++;
  setTimeout(function() {
  _$jscoverage['/router.js'].functionData[12]++;
  _$jscoverage['/router.js'].lineData[216]++;
  if (visit39_216_1(useNativeHistory && supportNativeHistory)) {
    _$jscoverage['/router.js'].lineData[217]++;
    DomEvent.on(win, 'popstate', dispatch);
  } else {
    _$jscoverage['/router.js'].lineData[221]++;
    DomEvent.on(win, 'hashchange', dispatch);
    _$jscoverage['/router.js'].lineData[223]++;
    opts.triggerRoute = 1;
  }
  _$jscoverage['/router.js'].lineData[228]++;
  if (visit40_228_1(opts.triggerRoute)) {
    _$jscoverage['/router.js'].lineData[229]++;
    dispatch();
  }
  _$jscoverage['/router.js'].lineData[231]++;
  if (visit41_231_1(opts.success)) {
    _$jscoverage['/router.js'].lineData[232]++;
    opts.success();
  }
}, BREATH_INTERVAL);
  _$jscoverage['/router.js'].lineData[236]++;
  started = true;
  _$jscoverage['/router.js'].lineData[237]++;
  return exports;
};
});
