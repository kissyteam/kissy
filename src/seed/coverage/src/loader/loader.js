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
if (! _$jscoverage['/loader/loader.js']) {
  _$jscoverage['/loader/loader.js'] = {};
  _$jscoverage['/loader/loader.js'].lineData = [];
  _$jscoverage['/loader/loader.js'].lineData[6] = 0;
  _$jscoverage['/loader/loader.js'].lineData[7] = 0;
  _$jscoverage['/loader/loader.js'].lineData[13] = 0;
  _$jscoverage['/loader/loader.js'].lineData[14] = 0;
  _$jscoverage['/loader/loader.js'].lineData[20] = 0;
  _$jscoverage['/loader/loader.js'].lineData[24] = 0;
  _$jscoverage['/loader/loader.js'].lineData[26] = 0;
  _$jscoverage['/loader/loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/loader.js'].lineData[28] = 0;
  _$jscoverage['/loader/loader.js'].lineData[33] = 0;
  _$jscoverage['/loader/loader.js'].lineData[37] = 0;
  _$jscoverage['/loader/loader.js'].lineData[41] = 0;
  _$jscoverage['/loader/loader.js'].lineData[45] = 0;
  _$jscoverage['/loader/loader.js'].lineData[47] = 0;
  _$jscoverage['/loader/loader.js'].lineData[69] = 0;
  _$jscoverage['/loader/loader.js'].lineData[70] = 0;
  _$jscoverage['/loader/loader.js'].lineData[71] = 0;
  _$jscoverage['/loader/loader.js'].lineData[72] = 0;
  _$jscoverage['/loader/loader.js'].lineData[74] = 0;
  _$jscoverage['/loader/loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/loader.js'].lineData[99] = 0;
  _$jscoverage['/loader/loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/loader.js'].lineData[101] = 0;
  _$jscoverage['/loader/loader.js'].lineData[102] = 0;
  _$jscoverage['/loader/loader.js'].lineData[105] = 0;
  _$jscoverage['/loader/loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/loader.js'].lineData[111] = 0;
  _$jscoverage['/loader/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader/loader.js'].lineData[114] = 0;
  _$jscoverage['/loader/loader.js'].lineData[115] = 0;
  _$jscoverage['/loader/loader.js'].lineData[116] = 0;
  _$jscoverage['/loader/loader.js'].lineData[117] = 0;
  _$jscoverage['/loader/loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/loader.js'].lineData[121] = 0;
  _$jscoverage['/loader/loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/loader.js'].lineData[131] = 0;
  _$jscoverage['/loader/loader.js'].lineData[136] = 0;
  _$jscoverage['/loader/loader.js'].lineData[137] = 0;
  _$jscoverage['/loader/loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/loader.js'].lineData[142] = 0;
  _$jscoverage['/loader/loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/loader.js'].lineData[150] = 0;
  _$jscoverage['/loader/loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/loader.js'].lineData[153] = 0;
  _$jscoverage['/loader/loader.js'].lineData[154] = 0;
  _$jscoverage['/loader/loader.js'].lineData[157] = 0;
  _$jscoverage['/loader/loader.js'].lineData[167] = 0;
  _$jscoverage['/loader/loader.js'].lineData[168] = 0;
  _$jscoverage['/loader/loader.js'].lineData[169] = 0;
  _$jscoverage['/loader/loader.js'].lineData[171] = 0;
  _$jscoverage['/loader/loader.js'].lineData[175] = 0;
  _$jscoverage['/loader/loader.js'].lineData[176] = 0;
  _$jscoverage['/loader/loader.js'].lineData[179] = 0;
  _$jscoverage['/loader/loader.js'].lineData[182] = 0;
  _$jscoverage['/loader/loader.js'].lineData[185] = 0;
  _$jscoverage['/loader/loader.js'].lineData[186] = 0;
  _$jscoverage['/loader/loader.js'].lineData[187] = 0;
  _$jscoverage['/loader/loader.js'].lineData[190] = 0;
  _$jscoverage['/loader/loader.js'].lineData[192] = 0;
  _$jscoverage['/loader/loader.js'].lineData[193] = 0;
  _$jscoverage['/loader/loader.js'].lineData[195] = 0;
  _$jscoverage['/loader/loader.js'].lineData[198] = 0;
  _$jscoverage['/loader/loader.js'].lineData[199] = 0;
  _$jscoverage['/loader/loader.js'].lineData[201] = 0;
  _$jscoverage['/loader/loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/loader.js'].lineData[207] = 0;
  _$jscoverage['/loader/loader.js'].lineData[209] = 0;
  _$jscoverage['/loader/loader.js'].lineData[212] = 0;
  _$jscoverage['/loader/loader.js'].lineData[213] = 0;
  _$jscoverage['/loader/loader.js'].lineData[215] = 0;
  _$jscoverage['/loader/loader.js'].lineData[216] = 0;
  _$jscoverage['/loader/loader.js'].lineData[217] = 0;
  _$jscoverage['/loader/loader.js'].lineData[218] = 0;
  _$jscoverage['/loader/loader.js'].lineData[219] = 0;
  _$jscoverage['/loader/loader.js'].lineData[221] = 0;
  _$jscoverage['/loader/loader.js'].lineData[225] = 0;
  _$jscoverage['/loader/loader.js'].lineData[241] = 0;
  _$jscoverage['/loader/loader.js'].lineData[244] = 0;
  _$jscoverage['/loader/loader.js'].lineData[248] = 0;
  _$jscoverage['/loader/loader.js'].lineData[249] = 0;
  _$jscoverage['/loader/loader.js'].lineData[250] = 0;
  _$jscoverage['/loader/loader.js'].lineData[254] = 0;
  _$jscoverage['/loader/loader.js'].lineData[255] = 0;
  _$jscoverage['/loader/loader.js'].lineData[258] = 0;
  _$jscoverage['/loader/loader.js'].lineData[260] = 0;
  _$jscoverage['/loader/loader.js'].lineData[266] = 0;
  _$jscoverage['/loader/loader.js'].lineData[278] = 0;
}
if (! _$jscoverage['/loader/loader.js'].functionData) {
  _$jscoverage['/loader/loader.js'].functionData = [];
  _$jscoverage['/loader/loader.js'].functionData[0] = 0;
  _$jscoverage['/loader/loader.js'].functionData[1] = 0;
  _$jscoverage['/loader/loader.js'].functionData[2] = 0;
  _$jscoverage['/loader/loader.js'].functionData[3] = 0;
  _$jscoverage['/loader/loader.js'].functionData[4] = 0;
  _$jscoverage['/loader/loader.js'].functionData[5] = 0;
  _$jscoverage['/loader/loader.js'].functionData[6] = 0;
  _$jscoverage['/loader/loader.js'].functionData[7] = 0;
  _$jscoverage['/loader/loader.js'].functionData[8] = 0;
  _$jscoverage['/loader/loader.js'].functionData[9] = 0;
  _$jscoverage['/loader/loader.js'].functionData[10] = 0;
  _$jscoverage['/loader/loader.js'].functionData[11] = 0;
  _$jscoverage['/loader/loader.js'].functionData[12] = 0;
  _$jscoverage['/loader/loader.js'].functionData[13] = 0;
  _$jscoverage['/loader/loader.js'].functionData[14] = 0;
  _$jscoverage['/loader/loader.js'].functionData[15] = 0;
  _$jscoverage['/loader/loader.js'].functionData[16] = 0;
}
if (! _$jscoverage['/loader/loader.js'].branchData) {
  _$jscoverage['/loader/loader.js'].branchData = {};
  _$jscoverage['/loader/loader.js'].branchData['26'] = [];
  _$jscoverage['/loader/loader.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['69'] = [];
  _$jscoverage['/loader/loader.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['71'] = [];
  _$jscoverage['/loader/loader.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['99'] = [];
  _$jscoverage['/loader/loader.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['114'] = [];
  _$jscoverage['/loader/loader.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['115'] = [];
  _$jscoverage['/loader/loader.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['116'] = [];
  _$jscoverage['/loader/loader.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['125'] = [];
  _$jscoverage['/loader/loader.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['126'] = [];
  _$jscoverage['/loader/loader.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['127'] = [];
  _$jscoverage['/loader/loader.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['141'] = [];
  _$jscoverage['/loader/loader.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['150'] = [];
  _$jscoverage['/loader/loader.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['168'] = [];
  _$jscoverage['/loader/loader.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['185'] = [];
  _$jscoverage['/loader/loader.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['186'] = [];
  _$jscoverage['/loader/loader.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['192'] = [];
  _$jscoverage['/loader/loader.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['198'] = [];
  _$jscoverage['/loader/loader.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['199'] = [];
  _$jscoverage['/loader/loader.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['206'] = [];
  _$jscoverage['/loader/loader.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['212'] = [];
  _$jscoverage['/loader/loader.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['217'] = [];
  _$jscoverage['/loader/loader.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['248'] = [];
  _$jscoverage['/loader/loader.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['249'] = [];
  _$jscoverage['/loader/loader.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['258'] = [];
  _$jscoverage['/loader/loader.js'].branchData['258'][1] = new BranchData();
}
_$jscoverage['/loader/loader.js'].branchData['258'][1].init(8391, 11, 'S.UA.nodejs');
function visit437_258_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['249'][1].init(18, 43, 'info = getBaseInfoFromOneScript(scripts[i])');
function visit436_249_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['248'][1].init(230, 6, 'i >= 0');
function visit435_248_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['217'][1].init(22, 23, 'part.match(baseTestReg)');
function visit434_217_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['212'][1].init(183, 35, 'base.charAt(base.length - 1) != \'/\'');
function visit433_212_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['206'][1].init(652, 11, 'index == -1');
function visit432_206_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['199'][1].init(501, 24, 'baseInfo.comboSep || \',\'');
function visit431_199_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['198'][1].init(427, 28, 'baseInfo.comboPrefix || \'??\'');
function visit430_198_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['192'][1].init(260, 8, 'baseInfo');
function visit429_192_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['186'][1].init(122, 23, '!src.match(baseTestReg)');
function visit428_186_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['185'][1].init(91, 16, 'script.src || \'\'');
function visit427_185_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['168'][1].init(118, 43, 'Utils.attachModsRecursively(moduleNames, S)');
function visit426_168_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['150'][1].init(2203, 4, 'sync');
function visit425_150_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['141'][1].init(1873, 14, 'Config.combine');
function visit424_141_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['127'][1].init(30, 4, 'sync');
function visit423_127_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['126'][1].init(26, 5, 'error');
function visit422_126_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['125'][1].init(680, 16, 'errorList.length');
function visit421_125_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['116'][1].init(30, 4, 'sync');
function visit420_116_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['115'][1].init(26, 7, 'success');
function visit419_115_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['114'][1].init(182, 3, 'ret');
function visit418_114_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['99'][1].init(230, 24, 'S.isPlainObject(success)');
function visit417_99_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['71'][1].init(127, 17, '!S.Config.combine');
function visit416_71_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['69'][1].init(18, 23, 'typeof name == \'string\'');
function visit415_69_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['26'][1].init(79, 36, 'fn && S.isEmptyObject(self.waitMods)');
function visit414_26_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/loader.js'].functionData[0]++;
  _$jscoverage['/loader/loader.js'].lineData[7]++;
  var Loader = KISSY.Loader, Env = S.Env, Utils = Loader.Utils, SimpleLoader = Loader.SimpleLoader, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader/loader.js'].lineData[13]++;
  function WaitingModules(fn) {
    _$jscoverage['/loader/loader.js'].functionData[1]++;
    _$jscoverage['/loader/loader.js'].lineData[14]++;
    S.mix(this, {
  fn: fn, 
  waitMods: {}});
  }
  _$jscoverage['/loader/loader.js'].lineData[20]++;
  WaitingModules.prototype = {
  constructor: WaitingModules, 
  notifyAll: function() {
  _$jscoverage['/loader/loader.js'].functionData[2]++;
  _$jscoverage['/loader/loader.js'].lineData[24]++;
  var self = this, fn = self.fn;
  _$jscoverage['/loader/loader.js'].lineData[26]++;
  if (visit414_26_1(fn && S.isEmptyObject(self.waitMods))) {
    _$jscoverage['/loader/loader.js'].lineData[27]++;
    self.fn = null;
    _$jscoverage['/loader/loader.js'].lineData[28]++;
    fn();
  }
}, 
  add: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[3]++;
  _$jscoverage['/loader/loader.js'].lineData[33]++;
  this.waitMods[modName] = 1;
}, 
  remove: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[4]++;
  _$jscoverage['/loader/loader.js'].lineData[37]++;
  delete this.waitMods[modName];
}, 
  contains: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[5]++;
  _$jscoverage['/loader/loader.js'].lineData[41]++;
  return this.waitMods[modName];
}};
  _$jscoverage['/loader/loader.js'].lineData[45]++;
  Loader.WaitingModules = WaitingModules;
  _$jscoverage['/loader/loader.js'].lineData[47]++;
  S.mix(S, {
  add: function(name, fn, cfg) {
  _$jscoverage['/loader/loader.js'].functionData[6]++;
  _$jscoverage['/loader/loader.js'].lineData[69]++;
  if (visit415_69_1(typeof name == 'string')) {
    _$jscoverage['/loader/loader.js'].lineData[70]++;
    Utils.registerModule(S, name, fn, cfg);
  } else {
    _$jscoverage['/loader/loader.js'].lineData[71]++;
    if (visit416_71_1(!S.Config.combine)) {
      _$jscoverage['/loader/loader.js'].lineData[72]++;
      SimpleLoader.add(name, fn, cfg, S);
    } else {
      _$jscoverage['/loader/loader.js'].lineData[74]++;
      throw new Error('Unsupported KISSY.add format!');
    }
  }
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader/loader.js'].functionData[7]++;
  _$jscoverage['/loader/loader.js'].lineData[92]++;
  var Config = S.Config, normalizedModNames, loader, error, sync, waitingModules = new WaitingModules(loadReady);
  _$jscoverage['/loader/loader.js'].lineData[99]++;
  if (visit417_99_1(S.isPlainObject(success))) {
    _$jscoverage['/loader/loader.js'].lineData[100]++;
    sync = success.sync;
    _$jscoverage['/loader/loader.js'].lineData[101]++;
    error = success.error;
    _$jscoverage['/loader/loader.js'].lineData[102]++;
    success = success.success;
  }
  _$jscoverage['/loader/loader.js'].lineData[105]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader/loader.js'].lineData[106]++;
  modNames = Utils.normalizeModNamesWithAlias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[108]++;
  normalizedModNames = Utils.unalias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[110]++;
  function loadReady() {
    _$jscoverage['/loader/loader.js'].functionData[8]++;
    _$jscoverage['/loader/loader.js'].lineData[111]++;
    var errorList = [], ret;
    _$jscoverage['/loader/loader.js'].lineData[113]++;
    ret = Utils.attachModsRecursively(normalizedModNames, S, undefined, errorList);
    _$jscoverage['/loader/loader.js'].lineData[114]++;
    if (visit418_114_1(ret)) {
      _$jscoverage['/loader/loader.js'].lineData[115]++;
      if (visit419_115_1(success)) {
        _$jscoverage['/loader/loader.js'].lineData[116]++;
        if (visit420_116_1(sync)) {
          _$jscoverage['/loader/loader.js'].lineData[117]++;
          success.apply(S, Utils.getModules(S, modNames));
        } else {
          _$jscoverage['/loader/loader.js'].lineData[120]++;
          setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[9]++;
  _$jscoverage['/loader/loader.js'].lineData[121]++;
  success.apply(S, Utils.getModules(S, modNames));
}, 0);
        }
      }
    } else {
      _$jscoverage['/loader/loader.js'].lineData[125]++;
      if (visit421_125_1(errorList.length)) {
        _$jscoverage['/loader/loader.js'].lineData[126]++;
        if (visit422_126_1(error)) {
          _$jscoverage['/loader/loader.js'].lineData[127]++;
          if (visit423_127_1(sync)) {
            _$jscoverage['/loader/loader.js'].lineData[128]++;
            error.apply(S, errorList);
          } else {
            _$jscoverage['/loader/loader.js'].lineData[130]++;
            setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[10]++;
  _$jscoverage['/loader/loader.js'].lineData[131]++;
  error.apply(S, errorList);
}, 0);
          }
        }
      } else {
        _$jscoverage['/loader/loader.js'].lineData[136]++;
        waitingModules.fn = loadReady;
        _$jscoverage['/loader/loader.js'].lineData[137]++;
        loader.use(normalizedModNames);
      }
    }
  }
  _$jscoverage['/loader/loader.js'].lineData[141]++;
  if (visit424_141_1(Config.combine)) {
    _$jscoverage['/loader/loader.js'].lineData[142]++;
    loader = new ComboLoader(S, waitingModules);
  } else {
    _$jscoverage['/loader/loader.js'].lineData[144]++;
    loader = new SimpleLoader(S, waitingModules);
  }
  _$jscoverage['/loader/loader.js'].lineData[150]++;
  if (visit425_150_1(sync)) {
    _$jscoverage['/loader/loader.js'].lineData[151]++;
    waitingModules.notifyAll();
  } else {
    _$jscoverage['/loader/loader.js'].lineData[153]++;
    setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[11]++;
  _$jscoverage['/loader/loader.js'].lineData[154]++;
  waitingModules.notifyAll();
}, 0);
  }
  _$jscoverage['/loader/loader.js'].lineData[157]++;
  return S;
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/loader.js'].functionData[12]++;
  _$jscoverage['/loader/loader.js'].lineData[167]++;
  var moduleNames = Utils.unalias(S, Utils.normalizeModNamesWithAlias(S, [moduleName]));
  _$jscoverage['/loader/loader.js'].lineData[168]++;
  if (visit426_168_1(Utils.attachModsRecursively(moduleNames, S))) {
    _$jscoverage['/loader/loader.js'].lineData[169]++;
    return Utils.getModules(S, moduleNames)[1];
  }
  _$jscoverage['/loader/loader.js'].lineData[171]++;
  return undefined;
}});
  _$jscoverage['/loader/loader.js'].lineData[175]++;
  function returnJson(s) {
    _$jscoverage['/loader/loader.js'].functionData[13]++;
    _$jscoverage['/loader/loader.js'].lineData[176]++;
    return (new Function('return ' + s))();
  }
  _$jscoverage['/loader/loader.js'].lineData[179]++;
  var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i, baseTestReg = /(seed|kissy)(?:-min)?\.js/i;
  _$jscoverage['/loader/loader.js'].lineData[182]++;
  function getBaseInfoFromOneScript(script) {
    _$jscoverage['/loader/loader.js'].functionData[14]++;
    _$jscoverage['/loader/loader.js'].lineData[185]++;
    var src = visit427_185_1(script.src || '');
    _$jscoverage['/loader/loader.js'].lineData[186]++;
    if (visit428_186_1(!src.match(baseTestReg))) {
      _$jscoverage['/loader/loader.js'].lineData[187]++;
      return 0;
    }
    _$jscoverage['/loader/loader.js'].lineData[190]++;
    var baseInfo = script.getAttribute('data-config');
    _$jscoverage['/loader/loader.js'].lineData[192]++;
    if (visit429_192_1(baseInfo)) {
      _$jscoverage['/loader/loader.js'].lineData[193]++;
      baseInfo = returnJson(baseInfo);
    } else {
      _$jscoverage['/loader/loader.js'].lineData[195]++;
      baseInfo = {};
    }
    _$jscoverage['/loader/loader.js'].lineData[198]++;
    var comboPrefix = baseInfo.comboPrefix = visit430_198_1(baseInfo.comboPrefix || '??');
    _$jscoverage['/loader/loader.js'].lineData[199]++;
    var comboSep = baseInfo.comboSep = visit431_199_1(baseInfo.comboSep || ',');
    _$jscoverage['/loader/loader.js'].lineData[201]++;
    var parts, base, index = src.indexOf(comboPrefix);
    _$jscoverage['/loader/loader.js'].lineData[206]++;
    if (visit432_206_1(index == -1)) {
      _$jscoverage['/loader/loader.js'].lineData[207]++;
      base = src.replace(baseReg, '$1');
    } else {
      _$jscoverage['/loader/loader.js'].lineData[209]++;
      base = src.substring(0, index);
      _$jscoverage['/loader/loader.js'].lineData[212]++;
      if (visit433_212_1(base.charAt(base.length - 1) != '/')) {
        _$jscoverage['/loader/loader.js'].lineData[213]++;
        base += '/';
      }
      _$jscoverage['/loader/loader.js'].lineData[215]++;
      parts = src.substring(index + comboPrefix.length).split(comboSep);
      _$jscoverage['/loader/loader.js'].lineData[216]++;
      S.each(parts, function(part) {
  _$jscoverage['/loader/loader.js'].functionData[15]++;
  _$jscoverage['/loader/loader.js'].lineData[217]++;
  if (visit434_217_1(part.match(baseTestReg))) {
    _$jscoverage['/loader/loader.js'].lineData[218]++;
    base += part.replace(baseReg, '$1');
    _$jscoverage['/loader/loader.js'].lineData[219]++;
    return false;
  }
  _$jscoverage['/loader/loader.js'].lineData[221]++;
  return undefined;
});
    }
    _$jscoverage['/loader/loader.js'].lineData[225]++;
    return S.mix({
  base: base}, baseInfo);
  }
  _$jscoverage['/loader/loader.js'].lineData[241]++;
  function getBaseInfo() {
    _$jscoverage['/loader/loader.js'].functionData[16]++;
    _$jscoverage['/loader/loader.js'].lineData[244]++;
    var scripts = Env.host.document.getElementsByTagName('script'), i, info;
    _$jscoverage['/loader/loader.js'].lineData[248]++;
    for (i = scripts.length - 1; visit435_248_1(i >= 0); i--) {
      _$jscoverage['/loader/loader.js'].lineData[249]++;
      if (visit436_249_1(info = getBaseInfoFromOneScript(scripts[i]))) {
        _$jscoverage['/loader/loader.js'].lineData[250]++;
        return info;
      }
    }
    _$jscoverage['/loader/loader.js'].lineData[254]++;
    S.error('must load kissy by file name: seed.js or seed-min.js');
    _$jscoverage['/loader/loader.js'].lineData[255]++;
    return null;
  }
  _$jscoverage['/loader/loader.js'].lineData[258]++;
  if (visit437_258_1(S.UA.nodejs)) {
    _$jscoverage['/loader/loader.js'].lineData[260]++;
    S.config({
  charset: 'utf-8', 
  base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'});
  } else {
    _$jscoverage['/loader/loader.js'].lineData[266]++;
    S.config(S.mix({
  comboMaxUrlLength: 2000, 
  comboMaxFileNum: 40, 
  charset: 'utf-8', 
  lang: 'zh-cn', 
  tag: '@TIMESTAMP@'}, getBaseInfo()));
  }
  _$jscoverage['/loader/loader.js'].lineData[278]++;
  Env.mods = {};
})(KISSY);
