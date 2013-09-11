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
  _$jscoverage['/loader/loader.js'].lineData[14] = 0;
  _$jscoverage['/loader/loader.js'].lineData[15] = 0;
  _$jscoverage['/loader/loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/loader.js'].lineData[25] = 0;
  _$jscoverage['/loader/loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/loader.js'].lineData[28] = 0;
  _$jscoverage['/loader/loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/loader.js'].lineData[34] = 0;
  _$jscoverage['/loader/loader.js'].lineData[38] = 0;
  _$jscoverage['/loader/loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/loader.js'].lineData[48] = 0;
  _$jscoverage['/loader/loader.js'].lineData[69] = 0;
  _$jscoverage['/loader/loader.js'].lineData[70] = 0;
  _$jscoverage['/loader/loader.js'].lineData[71] = 0;
  _$jscoverage['/loader/loader.js'].lineData[72] = 0;
  _$jscoverage['/loader/loader.js'].lineData[74] = 0;
  _$jscoverage['/loader/loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/loader.js'].lineData[98] = 0;
  _$jscoverage['/loader/loader.js'].lineData[99] = 0;
  _$jscoverage['/loader/loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/loader.js'].lineData[101] = 0;
  _$jscoverage['/loader/loader.js'].lineData[104] = 0;
  _$jscoverage['/loader/loader.js'].lineData[105] = 0;
  _$jscoverage['/loader/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/loader.js'].lineData[109] = 0;
  _$jscoverage['/loader/loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader/loader.js'].lineData[114] = 0;
  _$jscoverage['/loader/loader.js'].lineData[115] = 0;
  _$jscoverage['/loader/loader.js'].lineData[116] = 0;
  _$jscoverage['/loader/loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/loader.js'].lineData[124] = 0;
  _$jscoverage['/loader/loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/loader.js'].lineData[135] = 0;
  _$jscoverage['/loader/loader.js'].lineData[136] = 0;
  _$jscoverage['/loader/loader.js'].lineData[140] = 0;
  _$jscoverage['/loader/loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/loader.js'].lineData[143] = 0;
  _$jscoverage['/loader/loader.js'].lineData[149] = 0;
  _$jscoverage['/loader/loader.js'].lineData[150] = 0;
  _$jscoverage['/loader/loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/loader.js'].lineData[153] = 0;
  _$jscoverage['/loader/loader.js'].lineData[156] = 0;
  _$jscoverage['/loader/loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/loader.js'].lineData[167] = 0;
  _$jscoverage['/loader/loader.js'].lineData[168] = 0;
  _$jscoverage['/loader/loader.js'].lineData[170] = 0;
  _$jscoverage['/loader/loader.js'].lineData[174] = 0;
  _$jscoverage['/loader/loader.js'].lineData[175] = 0;
  _$jscoverage['/loader/loader.js'].lineData[178] = 0;
  _$jscoverage['/loader/loader.js'].lineData[181] = 0;
  _$jscoverage['/loader/loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/loader.js'].lineData[185] = 0;
  _$jscoverage['/loader/loader.js'].lineData[186] = 0;
  _$jscoverage['/loader/loader.js'].lineData[189] = 0;
  _$jscoverage['/loader/loader.js'].lineData[191] = 0;
  _$jscoverage['/loader/loader.js'].lineData[192] = 0;
  _$jscoverage['/loader/loader.js'].lineData[194] = 0;
  _$jscoverage['/loader/loader.js'].lineData[197] = 0;
  _$jscoverage['/loader/loader.js'].lineData[198] = 0;
  _$jscoverage['/loader/loader.js'].lineData[200] = 0;
  _$jscoverage['/loader/loader.js'].lineData[205] = 0;
  _$jscoverage['/loader/loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/loader.js'].lineData[208] = 0;
  _$jscoverage['/loader/loader.js'].lineData[211] = 0;
  _$jscoverage['/loader/loader.js'].lineData[212] = 0;
  _$jscoverage['/loader/loader.js'].lineData[214] = 0;
  _$jscoverage['/loader/loader.js'].lineData[215] = 0;
  _$jscoverage['/loader/loader.js'].lineData[216] = 0;
  _$jscoverage['/loader/loader.js'].lineData[217] = 0;
  _$jscoverage['/loader/loader.js'].lineData[218] = 0;
  _$jscoverage['/loader/loader.js'].lineData[220] = 0;
  _$jscoverage['/loader/loader.js'].lineData[224] = 0;
  _$jscoverage['/loader/loader.js'].lineData[240] = 0;
  _$jscoverage['/loader/loader.js'].lineData[243] = 0;
  _$jscoverage['/loader/loader.js'].lineData[247] = 0;
  _$jscoverage['/loader/loader.js'].lineData[248] = 0;
  _$jscoverage['/loader/loader.js'].lineData[249] = 0;
  _$jscoverage['/loader/loader.js'].lineData[253] = 0;
  _$jscoverage['/loader/loader.js'].lineData[254] = 0;
  _$jscoverage['/loader/loader.js'].lineData[257] = 0;
  _$jscoverage['/loader/loader.js'].lineData[259] = 0;
  _$jscoverage['/loader/loader.js'].lineData[265] = 0;
  _$jscoverage['/loader/loader.js'].lineData[277] = 0;
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
  _$jscoverage['/loader/loader.js'].branchData['27'] = [];
  _$jscoverage['/loader/loader.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['69'] = [];
  _$jscoverage['/loader/loader.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['71'] = [];
  _$jscoverage['/loader/loader.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['98'] = [];
  _$jscoverage['/loader/loader.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['113'] = [];
  _$jscoverage['/loader/loader.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['114'] = [];
  _$jscoverage['/loader/loader.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['115'] = [];
  _$jscoverage['/loader/loader.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['124'] = [];
  _$jscoverage['/loader/loader.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['125'] = [];
  _$jscoverage['/loader/loader.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['126'] = [];
  _$jscoverage['/loader/loader.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['140'] = [];
  _$jscoverage['/loader/loader.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['149'] = [];
  _$jscoverage['/loader/loader.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['167'] = [];
  _$jscoverage['/loader/loader.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['184'] = [];
  _$jscoverage['/loader/loader.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['185'] = [];
  _$jscoverage['/loader/loader.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['191'] = [];
  _$jscoverage['/loader/loader.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['197'] = [];
  _$jscoverage['/loader/loader.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['198'] = [];
  _$jscoverage['/loader/loader.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['205'] = [];
  _$jscoverage['/loader/loader.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['211'] = [];
  _$jscoverage['/loader/loader.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['216'] = [];
  _$jscoverage['/loader/loader.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['247'] = [];
  _$jscoverage['/loader/loader.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['248'] = [];
  _$jscoverage['/loader/loader.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['257'] = [];
  _$jscoverage['/loader/loader.js'].branchData['257'][1] = new BranchData();
}
_$jscoverage['/loader/loader.js'].branchData['257'][1].init(8321, 11, 'S.UA.nodejs');
function visit437_257_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['248'][1].init(18, 43, 'info = getBaseInfoFromOneScript(scripts[i])');
function visit436_248_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['247'][1].init(230, 6, 'i >= 0');
function visit435_247_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['216'][1].init(22, 23, 'part.match(baseTestReg)');
function visit434_216_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['211'][1].init(183, 35, 'base.charAt(base.length - 1) != \'/\'');
function visit433_211_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['205'][1].init(652, 11, 'index == -1');
function visit432_205_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['198'][1].init(501, 24, 'baseInfo.comboSep || \',\'');
function visit431_198_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['197'][1].init(427, 28, 'baseInfo.comboPrefix || \'??\'');
function visit430_197_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['191'][1].init(260, 8, 'baseInfo');
function visit429_191_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['185'][1].init(122, 23, '!src.match(baseTestReg)');
function visit428_185_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['184'][1].init(91, 16, 'script.src || \'\'');
function visit427_184_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['167'][1].init(118, 43, 'Utils.attachModsRecursively(moduleNames, S)');
function visit426_167_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['149'][1].init(2167, 4, 'sync');
function visit425_149_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['140'][1].init(1837, 14, 'Config.combine');
function visit424_140_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['126'][1].init(30, 4, 'sync');
function visit423_126_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['125'][1].init(26, 5, 'error');
function visit422_125_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['124'][1].init(680, 16, 'errorList.length');
function visit421_124_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['115'][1].init(30, 4, 'sync');
function visit420_115_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['114'][1].init(26, 7, 'success');
function visit419_114_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['113'][1].init(182, 3, 'ret');
function visit418_113_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['98'][1].init(194, 24, 'S.isPlainObject(success)');
function visit417_98_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['71'][1].init(127, 15, '!Config.combine');
function visit416_71_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['69'][1].init(18, 23, 'typeof name == \'string\'');
function visit415_69_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['27'][1].init(79, 36, 'fn && S.isEmptyObject(self.waitMods)');
function visit414_27_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/loader.js'].functionData[0]++;
  _$jscoverage['/loader/loader.js'].lineData[7]++;
  var Loader = S.Loader, Env = S.Env, Utils = Loader.Utils, Config = S.Config, SimpleLoader = Loader.SimpleLoader, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader/loader.js'].lineData[14]++;
  function WaitingModules(fn) {
    _$jscoverage['/loader/loader.js'].functionData[1]++;
    _$jscoverage['/loader/loader.js'].lineData[15]++;
    S.mix(this, {
  fn: fn, 
  waitMods: {}});
  }
  _$jscoverage['/loader/loader.js'].lineData[21]++;
  WaitingModules.prototype = {
  constructor: WaitingModules, 
  notifyAll: function() {
  _$jscoverage['/loader/loader.js'].functionData[2]++;
  _$jscoverage['/loader/loader.js'].lineData[25]++;
  var self = this, fn = self.fn;
  _$jscoverage['/loader/loader.js'].lineData[27]++;
  if (visit414_27_1(fn && S.isEmptyObject(self.waitMods))) {
    _$jscoverage['/loader/loader.js'].lineData[28]++;
    self.fn = null;
    _$jscoverage['/loader/loader.js'].lineData[29]++;
    fn();
  }
}, 
  add: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[3]++;
  _$jscoverage['/loader/loader.js'].lineData[34]++;
  this.waitMods[modName] = 1;
}, 
  remove: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[4]++;
  _$jscoverage['/loader/loader.js'].lineData[38]++;
  delete this.waitMods[modName];
}, 
  contains: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[5]++;
  _$jscoverage['/loader/loader.js'].lineData[42]++;
  return this.waitMods[modName];
}};
  _$jscoverage['/loader/loader.js'].lineData[46]++;
  Loader.WaitingModules = WaitingModules;
  _$jscoverage['/loader/loader.js'].lineData[48]++;
  S.mix(S, {
  add: function(name, fn, cfg) {
  _$jscoverage['/loader/loader.js'].functionData[6]++;
  _$jscoverage['/loader/loader.js'].lineData[69]++;
  if (visit415_69_1(typeof name == 'string')) {
    _$jscoverage['/loader/loader.js'].lineData[70]++;
    Utils.registerModule(S, name, fn, cfg);
  } else {
    _$jscoverage['/loader/loader.js'].lineData[71]++;
    if (visit416_71_1(!Config.combine)) {
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
  var normalizedModNames, loader, error, sync, waitingModules = new WaitingModules(loadReady);
  _$jscoverage['/loader/loader.js'].lineData[98]++;
  if (visit417_98_1(S.isPlainObject(success))) {
    _$jscoverage['/loader/loader.js'].lineData[99]++;
    sync = success.sync;
    _$jscoverage['/loader/loader.js'].lineData[100]++;
    error = success.error;
    _$jscoverage['/loader/loader.js'].lineData[101]++;
    success = success.success;
  }
  _$jscoverage['/loader/loader.js'].lineData[104]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader/loader.js'].lineData[105]++;
  modNames = Utils.normalizeModNamesWithAlias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[107]++;
  normalizedModNames = Utils.unalias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[109]++;
  function loadReady() {
    _$jscoverage['/loader/loader.js'].functionData[8]++;
    _$jscoverage['/loader/loader.js'].lineData[110]++;
    var errorList = [], ret;
    _$jscoverage['/loader/loader.js'].lineData[112]++;
    ret = Utils.attachModsRecursively(normalizedModNames, S, undefined, errorList);
    _$jscoverage['/loader/loader.js'].lineData[113]++;
    if (visit418_113_1(ret)) {
      _$jscoverage['/loader/loader.js'].lineData[114]++;
      if (visit419_114_1(success)) {
        _$jscoverage['/loader/loader.js'].lineData[115]++;
        if (visit420_115_1(sync)) {
          _$jscoverage['/loader/loader.js'].lineData[116]++;
          success.apply(S, Utils.getModules(S, modNames));
        } else {
          _$jscoverage['/loader/loader.js'].lineData[119]++;
          setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[9]++;
  _$jscoverage['/loader/loader.js'].lineData[120]++;
  success.apply(S, Utils.getModules(S, modNames));
}, 0);
        }
      }
    } else {
      _$jscoverage['/loader/loader.js'].lineData[124]++;
      if (visit421_124_1(errorList.length)) {
        _$jscoverage['/loader/loader.js'].lineData[125]++;
        if (visit422_125_1(error)) {
          _$jscoverage['/loader/loader.js'].lineData[126]++;
          if (visit423_126_1(sync)) {
            _$jscoverage['/loader/loader.js'].lineData[127]++;
            error.apply(S, errorList);
          } else {
            _$jscoverage['/loader/loader.js'].lineData[129]++;
            setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[10]++;
  _$jscoverage['/loader/loader.js'].lineData[130]++;
  error.apply(S, errorList);
}, 0);
          }
        }
      } else {
        _$jscoverage['/loader/loader.js'].lineData[135]++;
        waitingModules.fn = loadReady;
        _$jscoverage['/loader/loader.js'].lineData[136]++;
        loader.use(normalizedModNames);
      }
    }
  }
  _$jscoverage['/loader/loader.js'].lineData[140]++;
  if (visit424_140_1(Config.combine)) {
    _$jscoverage['/loader/loader.js'].lineData[141]++;
    loader = new ComboLoader(S, waitingModules);
  } else {
    _$jscoverage['/loader/loader.js'].lineData[143]++;
    loader = new SimpleLoader(S, waitingModules);
  }
  _$jscoverage['/loader/loader.js'].lineData[149]++;
  if (visit425_149_1(sync)) {
    _$jscoverage['/loader/loader.js'].lineData[150]++;
    waitingModules.notifyAll();
  } else {
    _$jscoverage['/loader/loader.js'].lineData[152]++;
    setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[11]++;
  _$jscoverage['/loader/loader.js'].lineData[153]++;
  waitingModules.notifyAll();
}, 0);
  }
  _$jscoverage['/loader/loader.js'].lineData[156]++;
  return S;
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/loader.js'].functionData[12]++;
  _$jscoverage['/loader/loader.js'].lineData[166]++;
  var moduleNames = Utils.unalias(S, Utils.normalizeModNamesWithAlias(S, [moduleName]));
  _$jscoverage['/loader/loader.js'].lineData[167]++;
  if (visit426_167_1(Utils.attachModsRecursively(moduleNames, S))) {
    _$jscoverage['/loader/loader.js'].lineData[168]++;
    return Utils.getModules(S, moduleNames)[1];
  }
  _$jscoverage['/loader/loader.js'].lineData[170]++;
  return undefined;
}});
  _$jscoverage['/loader/loader.js'].lineData[174]++;
  function returnJson(s) {
    _$jscoverage['/loader/loader.js'].functionData[13]++;
    _$jscoverage['/loader/loader.js'].lineData[175]++;
    return (new Function('return ' + s))();
  }
  _$jscoverage['/loader/loader.js'].lineData[178]++;
  var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i, baseTestReg = /(seed|kissy)(?:-min)?\.js/i;
  _$jscoverage['/loader/loader.js'].lineData[181]++;
  function getBaseInfoFromOneScript(script) {
    _$jscoverage['/loader/loader.js'].functionData[14]++;
    _$jscoverage['/loader/loader.js'].lineData[184]++;
    var src = visit427_184_1(script.src || '');
    _$jscoverage['/loader/loader.js'].lineData[185]++;
    if (visit428_185_1(!src.match(baseTestReg))) {
      _$jscoverage['/loader/loader.js'].lineData[186]++;
      return 0;
    }
    _$jscoverage['/loader/loader.js'].lineData[189]++;
    var baseInfo = script.getAttribute('data-config');
    _$jscoverage['/loader/loader.js'].lineData[191]++;
    if (visit429_191_1(baseInfo)) {
      _$jscoverage['/loader/loader.js'].lineData[192]++;
      baseInfo = returnJson(baseInfo);
    } else {
      _$jscoverage['/loader/loader.js'].lineData[194]++;
      baseInfo = {};
    }
    _$jscoverage['/loader/loader.js'].lineData[197]++;
    var comboPrefix = baseInfo.comboPrefix = visit430_197_1(baseInfo.comboPrefix || '??');
    _$jscoverage['/loader/loader.js'].lineData[198]++;
    var comboSep = baseInfo.comboSep = visit431_198_1(baseInfo.comboSep || ',');
    _$jscoverage['/loader/loader.js'].lineData[200]++;
    var parts, base, index = src.indexOf(comboPrefix);
    _$jscoverage['/loader/loader.js'].lineData[205]++;
    if (visit432_205_1(index == -1)) {
      _$jscoverage['/loader/loader.js'].lineData[206]++;
      base = src.replace(baseReg, '$1');
    } else {
      _$jscoverage['/loader/loader.js'].lineData[208]++;
      base = src.substring(0, index);
      _$jscoverage['/loader/loader.js'].lineData[211]++;
      if (visit433_211_1(base.charAt(base.length - 1) != '/')) {
        _$jscoverage['/loader/loader.js'].lineData[212]++;
        base += '/';
      }
      _$jscoverage['/loader/loader.js'].lineData[214]++;
      parts = src.substring(index + comboPrefix.length).split(comboSep);
      _$jscoverage['/loader/loader.js'].lineData[215]++;
      S.each(parts, function(part) {
  _$jscoverage['/loader/loader.js'].functionData[15]++;
  _$jscoverage['/loader/loader.js'].lineData[216]++;
  if (visit434_216_1(part.match(baseTestReg))) {
    _$jscoverage['/loader/loader.js'].lineData[217]++;
    base += part.replace(baseReg, '$1');
    _$jscoverage['/loader/loader.js'].lineData[218]++;
    return false;
  }
  _$jscoverage['/loader/loader.js'].lineData[220]++;
  return undefined;
});
    }
    _$jscoverage['/loader/loader.js'].lineData[224]++;
    return S.mix({
  base: base}, baseInfo);
  }
  _$jscoverage['/loader/loader.js'].lineData[240]++;
  function getBaseInfo() {
    _$jscoverage['/loader/loader.js'].functionData[16]++;
    _$jscoverage['/loader/loader.js'].lineData[243]++;
    var scripts = Env.host.document.getElementsByTagName('script'), i, info;
    _$jscoverage['/loader/loader.js'].lineData[247]++;
    for (i = scripts.length - 1; visit435_247_1(i >= 0); i--) {
      _$jscoverage['/loader/loader.js'].lineData[248]++;
      if (visit436_248_1(info = getBaseInfoFromOneScript(scripts[i]))) {
        _$jscoverage['/loader/loader.js'].lineData[249]++;
        return info;
      }
    }
    _$jscoverage['/loader/loader.js'].lineData[253]++;
    S.error('must load kissy by file name: seed.js or seed-min.js');
    _$jscoverage['/loader/loader.js'].lineData[254]++;
    return null;
  }
  _$jscoverage['/loader/loader.js'].lineData[257]++;
  if (visit437_257_1(S.UA.nodejs)) {
    _$jscoverage['/loader/loader.js'].lineData[259]++;
    S.config({
  charset: 'utf-8', 
  base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'});
  } else {
    _$jscoverage['/loader/loader.js'].lineData[265]++;
    S.config(S.mix({
  comboMaxUrlLength: 2000, 
  comboMaxFileNum: 40, 
  charset: 'utf-8', 
  lang: 'zh-cn', 
  tag: '@TIMESTAMP@'}, getBaseInfo()));
  }
  _$jscoverage['/loader/loader.js'].lineData[277]++;
  Env.mods = {};
})(KISSY);
