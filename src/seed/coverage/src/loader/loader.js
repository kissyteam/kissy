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
  _$jscoverage['/loader/loader.js'].lineData[12] = 0;
  _$jscoverage['/loader/loader.js'].lineData[13] = 0;
  _$jscoverage['/loader/loader.js'].lineData[19] = 0;
  _$jscoverage['/loader/loader.js'].lineData[23] = 0;
  _$jscoverage['/loader/loader.js'].lineData[25] = 0;
  _$jscoverage['/loader/loader.js'].lineData[26] = 0;
  _$jscoverage['/loader/loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/loader.js'].lineData[32] = 0;
  _$jscoverage['/loader/loader.js'].lineData[36] = 0;
  _$jscoverage['/loader/loader.js'].lineData[40] = 0;
  _$jscoverage['/loader/loader.js'].lineData[44] = 0;
  _$jscoverage['/loader/loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/loader.js'].lineData[67] = 0;
  _$jscoverage['/loader/loader.js'].lineData[84] = 0;
  _$jscoverage['/loader/loader.js'].lineData[90] = 0;
  _$jscoverage['/loader/loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/loader.js'].lineData[94] = 0;
  _$jscoverage['/loader/loader.js'].lineData[96] = 0;
  _$jscoverage['/loader/loader.js'].lineData[99] = 0;
  _$jscoverage['/loader/loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/loader.js'].lineData[102] = 0;
  _$jscoverage['/loader/loader.js'].lineData[104] = 0;
  _$jscoverage['/loader/loader.js'].lineData[105] = 0;
  _$jscoverage['/loader/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/loader.js'].lineData[109] = 0;
  _$jscoverage['/loader/loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/loader.js'].lineData[111] = 0;
  _$jscoverage['/loader/loader.js'].lineData[114] = 0;
  _$jscoverage['/loader/loader.js'].lineData[115] = 0;
  _$jscoverage['/loader/loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/loader.js'].lineData[121] = 0;
  _$jscoverage['/loader/loader.js'].lineData[122] = 0;
  _$jscoverage['/loader/loader.js'].lineData[124] = 0;
  _$jscoverage['/loader/loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/loader.js'].lineData[131] = 0;
  _$jscoverage['/loader/loader.js'].lineData[135] = 0;
  _$jscoverage['/loader/loader.js'].lineData[140] = 0;
  _$jscoverage['/loader/loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/loader.js'].lineData[143] = 0;
  _$jscoverage['/loader/loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/loader.js'].lineData[147] = 0;
  _$jscoverage['/loader/loader.js'].lineData[157] = 0;
  _$jscoverage['/loader/loader.js'].lineData[158] = 0;
  _$jscoverage['/loader/loader.js'].lineData[159] = 0;
  _$jscoverage['/loader/loader.js'].lineData[161] = 0;
  _$jscoverage['/loader/loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/loader.js'].lineData[169] = 0;
  _$jscoverage['/loader/loader.js'].lineData[172] = 0;
  _$jscoverage['/loader/loader.js'].lineData[175] = 0;
  _$jscoverage['/loader/loader.js'].lineData[176] = 0;
  _$jscoverage['/loader/loader.js'].lineData[177] = 0;
  _$jscoverage['/loader/loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/loader.js'].lineData[182] = 0;
  _$jscoverage['/loader/loader.js'].lineData[183] = 0;
  _$jscoverage['/loader/loader.js'].lineData[185] = 0;
  _$jscoverage['/loader/loader.js'].lineData[188] = 0;
  _$jscoverage['/loader/loader.js'].lineData[189] = 0;
  _$jscoverage['/loader/loader.js'].lineData[191] = 0;
  _$jscoverage['/loader/loader.js'].lineData[196] = 0;
  _$jscoverage['/loader/loader.js'].lineData[197] = 0;
  _$jscoverage['/loader/loader.js'].lineData[199] = 0;
  _$jscoverage['/loader/loader.js'].lineData[202] = 0;
  _$jscoverage['/loader/loader.js'].lineData[203] = 0;
  _$jscoverage['/loader/loader.js'].lineData[205] = 0;
  _$jscoverage['/loader/loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/loader.js'].lineData[207] = 0;
  _$jscoverage['/loader/loader.js'].lineData[208] = 0;
  _$jscoverage['/loader/loader.js'].lineData[209] = 0;
  _$jscoverage['/loader/loader.js'].lineData[211] = 0;
  _$jscoverage['/loader/loader.js'].lineData[215] = 0;
  _$jscoverage['/loader/loader.js'].lineData[231] = 0;
  _$jscoverage['/loader/loader.js'].lineData[234] = 0;
  _$jscoverage['/loader/loader.js'].lineData[238] = 0;
  _$jscoverage['/loader/loader.js'].lineData[239] = 0;
  _$jscoverage['/loader/loader.js'].lineData[240] = 0;
  _$jscoverage['/loader/loader.js'].lineData[244] = 0;
  _$jscoverage['/loader/loader.js'].lineData[245] = 0;
  _$jscoverage['/loader/loader.js'].lineData[248] = 0;
  _$jscoverage['/loader/loader.js'].lineData[251] = 0;
  _$jscoverage['/loader/loader.js'].lineData[257] = 0;
  _$jscoverage['/loader/loader.js'].lineData[269] = 0;
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
  _$jscoverage['/loader/loader.js'].branchData['25'] = [];
  _$jscoverage['/loader/loader.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['90'] = [];
  _$jscoverage['/loader/loader.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['108'] = [];
  _$jscoverage['/loader/loader.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['109'] = [];
  _$jscoverage['/loader/loader.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['110'] = [];
  _$jscoverage['/loader/loader.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['119'] = [];
  _$jscoverage['/loader/loader.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['120'] = [];
  _$jscoverage['/loader/loader.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['121'] = [];
  _$jscoverage['/loader/loader.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['140'] = [];
  _$jscoverage['/loader/loader.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['158'] = [];
  _$jscoverage['/loader/loader.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['175'] = [];
  _$jscoverage['/loader/loader.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['176'] = [];
  _$jscoverage['/loader/loader.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['182'] = [];
  _$jscoverage['/loader/loader.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['188'] = [];
  _$jscoverage['/loader/loader.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['189'] = [];
  _$jscoverage['/loader/loader.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['196'] = [];
  _$jscoverage['/loader/loader.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['202'] = [];
  _$jscoverage['/loader/loader.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['207'] = [];
  _$jscoverage['/loader/loader.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['238'] = [];
  _$jscoverage['/loader/loader.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['239'] = [];
  _$jscoverage['/loader/loader.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['248'] = [];
  _$jscoverage['/loader/loader.js'].branchData['248'][1] = new BranchData();
}
_$jscoverage['/loader/loader.js'].branchData['248'][1].init(8016, 11, 'S.UA.nodejs');
function visit444_248_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['239'][1].init(18, 43, 'info = getBaseInfoFromOneScript(scripts[i])');
function visit443_239_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['238'][1].init(230, 6, 'i >= 0');
function visit442_238_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['207'][1].init(22, 23, 'part.match(baseTestReg)');
function visit441_207_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['202'][1].init(183, 35, 'base.charAt(base.length - 1) != \'/\'');
function visit440_202_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['196'][1].init(652, 11, 'index == -1');
function visit439_196_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['189'][1].init(501, 24, 'baseInfo.comboSep || \',\'');
function visit438_189_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['188'][1].init(427, 28, 'baseInfo.comboPrefix || \'??\'');
function visit437_188_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['182'][1].init(260, 8, 'baseInfo');
function visit436_182_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['176'][1].init(122, 23, '!src.match(baseTestReg)');
function visit435_176_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['175'][1].init(91, 16, 'script.src || \'\'');
function visit434_175_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['158'][1].init(118, 43, 'Utils.attachModsRecursively(moduleNames, S)');
function visit433_158_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['140'][1].init(2187, 4, 'sync');
function visit432_140_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['121'][1].init(30, 4, 'sync');
function visit431_121_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['120'][1].init(26, 5, 'error');
function visit430_120_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['119'][1].init(680, 16, 'errorList.length');
function visit429_119_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['110'][1].init(30, 4, 'sync');
function visit428_110_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['109'][1].init(26, 7, 'success');
function visit427_109_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['108'][1].init(182, 3, 'ret');
function visit426_108_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['90'][1].init(194, 24, 'S.isPlainObject(success)');
function visit425_90_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['25'][1].init(79, 36, 'fn && S.isEmptyObject(self.waitMods)');
function visit424_25_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/loader.js'].functionData[0]++;
  _$jscoverage['/loader/loader.js'].lineData[7]++;
  var Loader = S.Loader, Env = S.Env, Utils = Loader.Utils, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader/loader.js'].lineData[12]++;
  function WaitingModules(fn) {
    _$jscoverage['/loader/loader.js'].functionData[1]++;
    _$jscoverage['/loader/loader.js'].lineData[13]++;
    S.mix(this, {
  fn: fn, 
  waitMods: {}});
  }
  _$jscoverage['/loader/loader.js'].lineData[19]++;
  WaitingModules.prototype = {
  constructor: WaitingModules, 
  notifyAll: function() {
  _$jscoverage['/loader/loader.js'].functionData[2]++;
  _$jscoverage['/loader/loader.js'].lineData[23]++;
  var self = this, fn = self.fn;
  _$jscoverage['/loader/loader.js'].lineData[25]++;
  if (visit424_25_1(fn && S.isEmptyObject(self.waitMods))) {
    _$jscoverage['/loader/loader.js'].lineData[26]++;
    self.fn = null;
    _$jscoverage['/loader/loader.js'].lineData[27]++;
    fn();
  }
}, 
  add: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[3]++;
  _$jscoverage['/loader/loader.js'].lineData[32]++;
  this.waitMods[modName] = 1;
}, 
  remove: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[4]++;
  _$jscoverage['/loader/loader.js'].lineData[36]++;
  delete this.waitMods[modName];
}, 
  contains: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[5]++;
  _$jscoverage['/loader/loader.js'].lineData[40]++;
  return this.waitMods[modName];
}};
  _$jscoverage['/loader/loader.js'].lineData[44]++;
  Loader.WaitingModules = WaitingModules;
  _$jscoverage['/loader/loader.js'].lineData[46]++;
  S.mix(S, {
  add: function(name, fn, cfg) {
  _$jscoverage['/loader/loader.js'].functionData[6]++;
  _$jscoverage['/loader/loader.js'].lineData[67]++;
  ComboLoader.add(name, fn, cfg, S);
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader/loader.js'].functionData[7]++;
  _$jscoverage['/loader/loader.js'].lineData[84]++;
  var normalizedModNames, loader, error, sync, waitingModules = new WaitingModules(loadReady);
  _$jscoverage['/loader/loader.js'].lineData[90]++;
  if (visit425_90_1(S.isPlainObject(success))) {
    _$jscoverage['/loader/loader.js'].lineData[92]++;
    sync = success.sync;
    _$jscoverage['/loader/loader.js'].lineData[94]++;
    error = success.error;
    _$jscoverage['/loader/loader.js'].lineData[96]++;
    success = success.success;
  }
  _$jscoverage['/loader/loader.js'].lineData[99]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader/loader.js'].lineData[100]++;
  modNames = Utils.normalizeModNamesWithAlias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[102]++;
  normalizedModNames = Utils.unalias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[104]++;
  function loadReady() {
    _$jscoverage['/loader/loader.js'].functionData[8]++;
    _$jscoverage['/loader/loader.js'].lineData[105]++;
    var errorList = [], ret;
    _$jscoverage['/loader/loader.js'].lineData[107]++;
    ret = Utils.attachModsRecursively(normalizedModNames, S, undefined, errorList);
    _$jscoverage['/loader/loader.js'].lineData[108]++;
    if (visit426_108_1(ret)) {
      _$jscoverage['/loader/loader.js'].lineData[109]++;
      if (visit427_109_1(success)) {
        _$jscoverage['/loader/loader.js'].lineData[110]++;
        if (visit428_110_1(sync)) {
          _$jscoverage['/loader/loader.js'].lineData[111]++;
          success.apply(S, Utils.getModules(S, modNames));
        } else {
          _$jscoverage['/loader/loader.js'].lineData[114]++;
          setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[9]++;
  _$jscoverage['/loader/loader.js'].lineData[115]++;
  success.apply(S, Utils.getModules(S, modNames));
}, 0);
        }
      }
    } else {
      _$jscoverage['/loader/loader.js'].lineData[119]++;
      if (visit429_119_1(errorList.length)) {
        _$jscoverage['/loader/loader.js'].lineData[120]++;
        if (visit430_120_1(error)) {
          _$jscoverage['/loader/loader.js'].lineData[121]++;
          if (visit431_121_1(sync)) {
            _$jscoverage['/loader/loader.js'].lineData[122]++;
            error.apply(S, errorList);
          } else {
            _$jscoverage['/loader/loader.js'].lineData[124]++;
            setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[10]++;
  _$jscoverage['/loader/loader.js'].lineData[125]++;
  error.apply(S, errorList);
}, 0);
          }
        }
      } else {
        _$jscoverage['/loader/loader.js'].lineData[130]++;
        waitingModules.fn = loadReady;
        _$jscoverage['/loader/loader.js'].lineData[131]++;
        loader.use(normalizedModNames);
      }
    }
  }
  _$jscoverage['/loader/loader.js'].lineData[135]++;
  loader = new ComboLoader(S, waitingModules);
  _$jscoverage['/loader/loader.js'].lineData[140]++;
  if (visit432_140_1(sync)) {
    _$jscoverage['/loader/loader.js'].lineData[141]++;
    waitingModules.notifyAll();
  } else {
    _$jscoverage['/loader/loader.js'].lineData[143]++;
    setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[11]++;
  _$jscoverage['/loader/loader.js'].lineData[144]++;
  waitingModules.notifyAll();
}, 0);
  }
  _$jscoverage['/loader/loader.js'].lineData[147]++;
  return S;
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/loader.js'].functionData[12]++;
  _$jscoverage['/loader/loader.js'].lineData[157]++;
  var moduleNames = Utils.unalias(S, Utils.normalizeModNamesWithAlias(S, [moduleName]));
  _$jscoverage['/loader/loader.js'].lineData[158]++;
  if (visit433_158_1(Utils.attachModsRecursively(moduleNames, S))) {
    _$jscoverage['/loader/loader.js'].lineData[159]++;
    return Utils.getModules(S, moduleNames)[1];
  }
  _$jscoverage['/loader/loader.js'].lineData[161]++;
  return undefined;
}});
  _$jscoverage['/loader/loader.js'].lineData[165]++;
  function returnJson(s) {
    _$jscoverage['/loader/loader.js'].functionData[13]++;
    _$jscoverage['/loader/loader.js'].lineData[166]++;
    return (new Function('return ' + s))();
  }
  _$jscoverage['/loader/loader.js'].lineData[169]++;
  var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i, baseTestReg = /(seed|kissy)(?:-min)?\.js/i;
  _$jscoverage['/loader/loader.js'].lineData[172]++;
  function getBaseInfoFromOneScript(script) {
    _$jscoverage['/loader/loader.js'].functionData[14]++;
    _$jscoverage['/loader/loader.js'].lineData[175]++;
    var src = visit434_175_1(script.src || '');
    _$jscoverage['/loader/loader.js'].lineData[176]++;
    if (visit435_176_1(!src.match(baseTestReg))) {
      _$jscoverage['/loader/loader.js'].lineData[177]++;
      return 0;
    }
    _$jscoverage['/loader/loader.js'].lineData[180]++;
    var baseInfo = script.getAttribute('data-config');
    _$jscoverage['/loader/loader.js'].lineData[182]++;
    if (visit436_182_1(baseInfo)) {
      _$jscoverage['/loader/loader.js'].lineData[183]++;
      baseInfo = returnJson(baseInfo);
    } else {
      _$jscoverage['/loader/loader.js'].lineData[185]++;
      baseInfo = {};
    }
    _$jscoverage['/loader/loader.js'].lineData[188]++;
    var comboPrefix = baseInfo.comboPrefix = visit437_188_1(baseInfo.comboPrefix || '??');
    _$jscoverage['/loader/loader.js'].lineData[189]++;
    var comboSep = baseInfo.comboSep = visit438_189_1(baseInfo.comboSep || ',');
    _$jscoverage['/loader/loader.js'].lineData[191]++;
    var parts, base, index = src.indexOf(comboPrefix);
    _$jscoverage['/loader/loader.js'].lineData[196]++;
    if (visit439_196_1(index == -1)) {
      _$jscoverage['/loader/loader.js'].lineData[197]++;
      base = src.replace(baseReg, '$1');
    } else {
      _$jscoverage['/loader/loader.js'].lineData[199]++;
      base = src.substring(0, index);
      _$jscoverage['/loader/loader.js'].lineData[202]++;
      if (visit440_202_1(base.charAt(base.length - 1) != '/')) {
        _$jscoverage['/loader/loader.js'].lineData[203]++;
        base += '/';
      }
      _$jscoverage['/loader/loader.js'].lineData[205]++;
      parts = src.substring(index + comboPrefix.length).split(comboSep);
      _$jscoverage['/loader/loader.js'].lineData[206]++;
      S.each(parts, function(part) {
  _$jscoverage['/loader/loader.js'].functionData[15]++;
  _$jscoverage['/loader/loader.js'].lineData[207]++;
  if (visit441_207_1(part.match(baseTestReg))) {
    _$jscoverage['/loader/loader.js'].lineData[208]++;
    base += part.replace(baseReg, '$1');
    _$jscoverage['/loader/loader.js'].lineData[209]++;
    return false;
  }
  _$jscoverage['/loader/loader.js'].lineData[211]++;
  return undefined;
});
    }
    _$jscoverage['/loader/loader.js'].lineData[215]++;
    return S.mix({
  base: base}, baseInfo);
  }
  _$jscoverage['/loader/loader.js'].lineData[231]++;
  function getBaseInfo() {
    _$jscoverage['/loader/loader.js'].functionData[16]++;
    _$jscoverage['/loader/loader.js'].lineData[234]++;
    var scripts = Env.host.document.getElementsByTagName('script'), i, info;
    _$jscoverage['/loader/loader.js'].lineData[238]++;
    for (i = scripts.length - 1; visit442_238_1(i >= 0); i--) {
      _$jscoverage['/loader/loader.js'].lineData[239]++;
      if (visit443_239_1(info = getBaseInfoFromOneScript(scripts[i]))) {
        _$jscoverage['/loader/loader.js'].lineData[240]++;
        return info;
      }
    }
    _$jscoverage['/loader/loader.js'].lineData[244]++;
    S.error('must load kissy by file name: seed.js or seed-min.js');
    _$jscoverage['/loader/loader.js'].lineData[245]++;
    return null;
  }
  _$jscoverage['/loader/loader.js'].lineData[248]++;
  if (visit444_248_1(S.UA.nodejs)) {
    _$jscoverage['/loader/loader.js'].lineData[251]++;
    S.config({
  charset: 'utf-8', 
  base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'});
  } else {
    _$jscoverage['/loader/loader.js'].lineData[257]++;
    S.config(S.mix({
  comboMaxUrlLength: 2000, 
  comboMaxFileNum: 40, 
  charset: 'utf-8', 
  lang: 'zh-cn', 
  tag: '@TIMESTAMP@'}, getBaseInfo()));
  }
  _$jscoverage['/loader/loader.js'].lineData[269]++;
  Env.mods = {};
})(KISSY);
