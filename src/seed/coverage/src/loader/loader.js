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
  _$jscoverage['/loader/loader.js'].lineData[68] = 0;
  _$jscoverage['/loader/loader.js'].lineData[84] = 0;
  _$jscoverage['/loader/loader.js'].lineData[91] = 0;
  _$jscoverage['/loader/loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/loader.js'].lineData[97] = 0;
  _$jscoverage['/loader/loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/loader.js'].lineData[101] = 0;
  _$jscoverage['/loader/loader.js'].lineData[103] = 0;
  _$jscoverage['/loader/loader.js'].lineData[105] = 0;
  _$jscoverage['/loader/loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/loader.js'].lineData[111] = 0;
  _$jscoverage['/loader/loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader/loader.js'].lineData[114] = 0;
  _$jscoverage['/loader/loader.js'].lineData[115] = 0;
  _$jscoverage['/loader/loader.js'].lineData[118] = 0;
  _$jscoverage['/loader/loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/loader.js'].lineData[123] = 0;
  _$jscoverage['/loader/loader.js'].lineData[124] = 0;
  _$jscoverage['/loader/loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/loader.js'].lineData[134] = 0;
  _$jscoverage['/loader/loader.js'].lineData[135] = 0;
  _$jscoverage['/loader/loader.js'].lineData[136] = 0;
  _$jscoverage['/loader/loader.js'].lineData[140] = 0;
  _$jscoverage['/loader/loader.js'].lineData[145] = 0;
  _$jscoverage['/loader/loader.js'].lineData[146] = 0;
  _$jscoverage['/loader/loader.js'].lineData[148] = 0;
  _$jscoverage['/loader/loader.js'].lineData[149] = 0;
  _$jscoverage['/loader/loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/loader.js'].lineData[162] = 0;
  _$jscoverage['/loader/loader.js'].lineData[163] = 0;
  _$jscoverage['/loader/loader.js'].lineData[164] = 0;
  _$jscoverage['/loader/loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/loader.js'].lineData[170] = 0;
  _$jscoverage['/loader/loader.js'].lineData[171] = 0;
  _$jscoverage['/loader/loader.js'].lineData[174] = 0;
  _$jscoverage['/loader/loader.js'].lineData[177] = 0;
  _$jscoverage['/loader/loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/loader.js'].lineData[181] = 0;
  _$jscoverage['/loader/loader.js'].lineData[182] = 0;
  _$jscoverage['/loader/loader.js'].lineData[185] = 0;
  _$jscoverage['/loader/loader.js'].lineData[187] = 0;
  _$jscoverage['/loader/loader.js'].lineData[188] = 0;
  _$jscoverage['/loader/loader.js'].lineData[190] = 0;
  _$jscoverage['/loader/loader.js'].lineData[193] = 0;
  _$jscoverage['/loader/loader.js'].lineData[194] = 0;
  _$jscoverage['/loader/loader.js'].lineData[196] = 0;
  _$jscoverage['/loader/loader.js'].lineData[201] = 0;
  _$jscoverage['/loader/loader.js'].lineData[202] = 0;
  _$jscoverage['/loader/loader.js'].lineData[204] = 0;
  _$jscoverage['/loader/loader.js'].lineData[207] = 0;
  _$jscoverage['/loader/loader.js'].lineData[208] = 0;
  _$jscoverage['/loader/loader.js'].lineData[210] = 0;
  _$jscoverage['/loader/loader.js'].lineData[211] = 0;
  _$jscoverage['/loader/loader.js'].lineData[212] = 0;
  _$jscoverage['/loader/loader.js'].lineData[213] = 0;
  _$jscoverage['/loader/loader.js'].lineData[214] = 0;
  _$jscoverage['/loader/loader.js'].lineData[216] = 0;
  _$jscoverage['/loader/loader.js'].lineData[220] = 0;
  _$jscoverage['/loader/loader.js'].lineData[236] = 0;
  _$jscoverage['/loader/loader.js'].lineData[239] = 0;
  _$jscoverage['/loader/loader.js'].lineData[243] = 0;
  _$jscoverage['/loader/loader.js'].lineData[244] = 0;
  _$jscoverage['/loader/loader.js'].lineData[245] = 0;
  _$jscoverage['/loader/loader.js'].lineData[249] = 0;
  _$jscoverage['/loader/loader.js'].lineData[250] = 0;
  _$jscoverage['/loader/loader.js'].lineData[253] = 0;
  _$jscoverage['/loader/loader.js'].lineData[256] = 0;
  _$jscoverage['/loader/loader.js'].lineData[262] = 0;
  _$jscoverage['/loader/loader.js'].lineData[273] = 0;
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
  _$jscoverage['/loader/loader.js'].branchData['91'] = [];
  _$jscoverage['/loader/loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['112'] = [];
  _$jscoverage['/loader/loader.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['113'] = [];
  _$jscoverage['/loader/loader.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['114'] = [];
  _$jscoverage['/loader/loader.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['123'] = [];
  _$jscoverage['/loader/loader.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['124'] = [];
  _$jscoverage['/loader/loader.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['125'] = [];
  _$jscoverage['/loader/loader.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['145'] = [];
  _$jscoverage['/loader/loader.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['163'] = [];
  _$jscoverage['/loader/loader.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['180'] = [];
  _$jscoverage['/loader/loader.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['181'] = [];
  _$jscoverage['/loader/loader.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['187'] = [];
  _$jscoverage['/loader/loader.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['193'] = [];
  _$jscoverage['/loader/loader.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['194'] = [];
  _$jscoverage['/loader/loader.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['201'] = [];
  _$jscoverage['/loader/loader.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['207'] = [];
  _$jscoverage['/loader/loader.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['212'] = [];
  _$jscoverage['/loader/loader.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['243'] = [];
  _$jscoverage['/loader/loader.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['244'] = [];
  _$jscoverage['/loader/loader.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['253'] = [];
  _$jscoverage['/loader/loader.js'].branchData['253'][1] = new BranchData();
}
_$jscoverage['/loader/loader.js'].branchData['253'][1].init(8269, 11, 'S.UA.nodejs');
function visit444_253_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['244'][1].init(18, 43, 'info = getBaseInfoFromOneScript(scripts[i])');
function visit443_244_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['243'][1].init(230, 6, 'i >= 0');
function visit442_243_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['212'][1].init(22, 23, 'part.match(baseTestReg)');
function visit441_212_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['207'][1].init(183, 35, 'base.charAt(base.length - 1) != \'/\'');
function visit440_207_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['201'][1].init(652, 11, 'index == -1');
function visit439_201_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['194'][1].init(501, 24, 'baseInfo.comboSep || \',\'');
function visit438_194_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['193'][1].init(427, 28, 'baseInfo.comboPrefix || \'??\'');
function visit437_193_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['187'][1].init(260, 8, 'baseInfo');
function visit436_187_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['181'][1].init(122, 23, '!src.match(baseTestReg)');
function visit435_181_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['180'][1].init(91, 16, 'script.src || \'\'');
function visit434_180_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['163'][1].init(118, 43, 'Utils.attachModsRecursively(moduleNames, S)');
function visit433_163_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['145'][1].init(2436, 4, 'sync');
function visit432_145_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['125'][1].init(30, 4, 'sync');
function visit431_125_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['124'][1].init(26, 5, 'error');
function visit430_124_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['123'][1].init(829, 16, 'errorList.length');
function visit429_123_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['114'][1].init(30, 4, 'sync');
function visit428_114_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['113'][1].init(26, 7, 'success');
function visit427_113_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['112'][1].init(331, 3, 'ret');
function visit426_112_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['91'][1].init(225, 24, 'S.isPlainObject(success)');
function visit425_91_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['26'][1].init(79, 36, 'fn && S.isEmptyObject(self.waitMods)');
function visit424_26_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/loader.js'].functionData[0]++;
  _$jscoverage['/loader/loader.js'].lineData[7]++;
  var Loader = S.Loader, Env = S.Env, logger = S.getLogger('s/loader'), Utils = Loader.Utils, ComboLoader = Loader.ComboLoader;
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
  if (visit424_26_1(fn && S.isEmptyObject(self.waitMods))) {
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
  _$jscoverage['/loader/loader.js'].lineData[68]++;
  ComboLoader.add(name, fn, cfg, S);
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader/loader.js'].functionData[7]++;
  _$jscoverage['/loader/loader.js'].lineData[84]++;
  var normalizedModNames, loader, error, sync, tryCount = 0, waitingModules = new WaitingModules(loadReady);
  _$jscoverage['/loader/loader.js'].lineData[91]++;
  if (visit425_91_1(S.isPlainObject(success))) {
    _$jscoverage['/loader/loader.js'].lineData[93]++;
    sync = success.sync;
    _$jscoverage['/loader/loader.js'].lineData[95]++;
    error = success.error;
    _$jscoverage['/loader/loader.js'].lineData[97]++;
    success = success.success;
  }
  _$jscoverage['/loader/loader.js'].lineData[100]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader/loader.js'].lineData[101]++;
  modNames = Utils.normalizeModNamesWithAlias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[103]++;
  normalizedModNames = Utils.unalias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[105]++;
  function loadReady() {
    _$jscoverage['/loader/loader.js'].functionData[8]++;
    _$jscoverage['/loader/loader.js'].lineData[106]++;
    ++tryCount;
    _$jscoverage['/loader/loader.js'].lineData[107]++;
    var errorList = [], start = S.now(), ret;
    _$jscoverage['/loader/loader.js'].lineData[110]++;
    ret = Utils.attachModsRecursively(normalizedModNames, S, undefined, errorList);
    _$jscoverage['/loader/loader.js'].lineData[111]++;
    logger.debug(tryCount + ' check duration ' + (S.now() - start));
    _$jscoverage['/loader/loader.js'].lineData[112]++;
    if (visit426_112_1(ret)) {
      _$jscoverage['/loader/loader.js'].lineData[113]++;
      if (visit427_113_1(success)) {
        _$jscoverage['/loader/loader.js'].lineData[114]++;
        if (visit428_114_1(sync)) {
          _$jscoverage['/loader/loader.js'].lineData[115]++;
          success.apply(S, Utils.getModules(S, modNames));
        } else {
          _$jscoverage['/loader/loader.js'].lineData[118]++;
          setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[9]++;
  _$jscoverage['/loader/loader.js'].lineData[119]++;
  success.apply(S, Utils.getModules(S, modNames));
}, 0);
        }
      }
    } else {
      _$jscoverage['/loader/loader.js'].lineData[123]++;
      if (visit429_123_1(errorList.length)) {
        _$jscoverage['/loader/loader.js'].lineData[124]++;
        if (visit430_124_1(error)) {
          _$jscoverage['/loader/loader.js'].lineData[125]++;
          if (visit431_125_1(sync)) {
            _$jscoverage['/loader/loader.js'].lineData[126]++;
            error.apply(S, errorList);
          } else {
            _$jscoverage['/loader/loader.js'].lineData[128]++;
            setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[10]++;
  _$jscoverage['/loader/loader.js'].lineData[129]++;
  error.apply(S, errorList);
}, 0);
          }
        }
      } else {
        _$jscoverage['/loader/loader.js'].lineData[134]++;
        logger.debug(tryCount + ' reload ' + modNames);
        _$jscoverage['/loader/loader.js'].lineData[135]++;
        waitingModules.fn = loadReady;
        _$jscoverage['/loader/loader.js'].lineData[136]++;
        loader.use(normalizedModNames);
      }
    }
  }
  _$jscoverage['/loader/loader.js'].lineData[140]++;
  loader = new ComboLoader(S, waitingModules);
  _$jscoverage['/loader/loader.js'].lineData[145]++;
  if (visit432_145_1(sync)) {
    _$jscoverage['/loader/loader.js'].lineData[146]++;
    waitingModules.notifyAll();
  } else {
    _$jscoverage['/loader/loader.js'].lineData[148]++;
    setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[11]++;
  _$jscoverage['/loader/loader.js'].lineData[149]++;
  waitingModules.notifyAll();
}, 0);
  }
  _$jscoverage['/loader/loader.js'].lineData[152]++;
  return S;
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/loader.js'].functionData[12]++;
  _$jscoverage['/loader/loader.js'].lineData[162]++;
  var moduleNames = Utils.unalias(S, Utils.normalizeModNamesWithAlias(S, [moduleName]));
  _$jscoverage['/loader/loader.js'].lineData[163]++;
  if (visit433_163_1(Utils.attachModsRecursively(moduleNames, S))) {
    _$jscoverage['/loader/loader.js'].lineData[164]++;
    return Utils.getModules(S, moduleNames)[1];
  }
  _$jscoverage['/loader/loader.js'].lineData[166]++;
  return undefined;
}});
  _$jscoverage['/loader/loader.js'].lineData[170]++;
  function returnJson(s) {
    _$jscoverage['/loader/loader.js'].functionData[13]++;
    _$jscoverage['/loader/loader.js'].lineData[171]++;
    return (new Function('return ' + s))();
  }
  _$jscoverage['/loader/loader.js'].lineData[174]++;
  var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i, baseTestReg = /(seed|kissy)(?:-min)?\.js/i;
  _$jscoverage['/loader/loader.js'].lineData[177]++;
  function getBaseInfoFromOneScript(script) {
    _$jscoverage['/loader/loader.js'].functionData[14]++;
    _$jscoverage['/loader/loader.js'].lineData[180]++;
    var src = visit434_180_1(script.src || '');
    _$jscoverage['/loader/loader.js'].lineData[181]++;
    if (visit435_181_1(!src.match(baseTestReg))) {
      _$jscoverage['/loader/loader.js'].lineData[182]++;
      return 0;
    }
    _$jscoverage['/loader/loader.js'].lineData[185]++;
    var baseInfo = script.getAttribute('data-config');
    _$jscoverage['/loader/loader.js'].lineData[187]++;
    if (visit436_187_1(baseInfo)) {
      _$jscoverage['/loader/loader.js'].lineData[188]++;
      baseInfo = returnJson(baseInfo);
    } else {
      _$jscoverage['/loader/loader.js'].lineData[190]++;
      baseInfo = {};
    }
    _$jscoverage['/loader/loader.js'].lineData[193]++;
    var comboPrefix = baseInfo.comboPrefix = visit437_193_1(baseInfo.comboPrefix || '??');
    _$jscoverage['/loader/loader.js'].lineData[194]++;
    var comboSep = baseInfo.comboSep = visit438_194_1(baseInfo.comboSep || ',');
    _$jscoverage['/loader/loader.js'].lineData[196]++;
    var parts, base, index = src.indexOf(comboPrefix);
    _$jscoverage['/loader/loader.js'].lineData[201]++;
    if (visit439_201_1(index == -1)) {
      _$jscoverage['/loader/loader.js'].lineData[202]++;
      base = src.replace(baseReg, '$1');
    } else {
      _$jscoverage['/loader/loader.js'].lineData[204]++;
      base = src.substring(0, index);
      _$jscoverage['/loader/loader.js'].lineData[207]++;
      if (visit440_207_1(base.charAt(base.length - 1) != '/')) {
        _$jscoverage['/loader/loader.js'].lineData[208]++;
        base += '/';
      }
      _$jscoverage['/loader/loader.js'].lineData[210]++;
      parts = src.substring(index + comboPrefix.length).split(comboSep);
      _$jscoverage['/loader/loader.js'].lineData[211]++;
      S.each(parts, function(part) {
  _$jscoverage['/loader/loader.js'].functionData[15]++;
  _$jscoverage['/loader/loader.js'].lineData[212]++;
  if (visit441_212_1(part.match(baseTestReg))) {
    _$jscoverage['/loader/loader.js'].lineData[213]++;
    base += part.replace(baseReg, '$1');
    _$jscoverage['/loader/loader.js'].lineData[214]++;
    return false;
  }
  _$jscoverage['/loader/loader.js'].lineData[216]++;
  return undefined;
});
    }
    _$jscoverage['/loader/loader.js'].lineData[220]++;
    return S.mix({
  base: base}, baseInfo);
  }
  _$jscoverage['/loader/loader.js'].lineData[236]++;
  function getBaseInfo() {
    _$jscoverage['/loader/loader.js'].functionData[16]++;
    _$jscoverage['/loader/loader.js'].lineData[239]++;
    var scripts = Env.host.document.getElementsByTagName('script'), i, info;
    _$jscoverage['/loader/loader.js'].lineData[243]++;
    for (i = scripts.length - 1; visit442_243_1(i >= 0); i--) {
      _$jscoverage['/loader/loader.js'].lineData[244]++;
      if (visit443_244_1(info = getBaseInfoFromOneScript(scripts[i]))) {
        _$jscoverage['/loader/loader.js'].lineData[245]++;
        return info;
      }
    }
    _$jscoverage['/loader/loader.js'].lineData[249]++;
    S.error('must load kissy by file name: seed.js or seed-min.js');
    _$jscoverage['/loader/loader.js'].lineData[250]++;
    return null;
  }
  _$jscoverage['/loader/loader.js'].lineData[253]++;
  if (visit444_253_1(S.UA.nodejs)) {
    _$jscoverage['/loader/loader.js'].lineData[256]++;
    S.config({
  charset: 'utf-8', 
  base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'});
  } else {
    _$jscoverage['/loader/loader.js'].lineData[262]++;
    S.config(S.mix({
  comboMaxUrlLength: 2000, 
  comboMaxFileNum: 40, 
  charset: 'utf-8', 
  lang: 'zh-cn', 
  tag: '@TIMESTAMP@'}, getBaseInfo()));
  }
  _$jscoverage['/loader/loader.js'].lineData[273]++;
  Env.mods = {};
})(KISSY);
