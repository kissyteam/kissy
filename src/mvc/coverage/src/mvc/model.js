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
if (! _$jscoverage['/mvc/model.js']) {
  _$jscoverage['/mvc/model.js'] = {};
  _$jscoverage['/mvc/model.js'].lineData = [];
  _$jscoverage['/mvc/model.js'].lineData[6] = 0;
  _$jscoverage['/mvc/model.js'].lineData[7] = 0;
  _$jscoverage['/mvc/model.js'].lineData[8] = 0;
  _$jscoverage['/mvc/model.js'].lineData[25] = 0;
  _$jscoverage['/mvc/model.js'].lineData[27] = 0;
  _$jscoverage['/mvc/model.js'].lineData[35] = 0;
  _$jscoverage['/mvc/model.js'].lineData[36] = 0;
  _$jscoverage['/mvc/model.js'].lineData[43] = 0;
  _$jscoverage['/mvc/model.js'].lineData[44] = 0;
  _$jscoverage['/mvc/model.js'].lineData[51] = 0;
  _$jscoverage['/mvc/model.js'].lineData[59] = 0;
  _$jscoverage['/mvc/model.js'].lineData[63] = 0;
  _$jscoverage['/mvc/model.js'].lineData[64] = 0;
  _$jscoverage['/mvc/model.js'].lineData[72] = 0;
  _$jscoverage['/mvc/model.js'].lineData[80] = 0;
  _$jscoverage['/mvc/model.js'].lineData[92] = 0;
  _$jscoverage['/mvc/model.js'].lineData[93] = 0;
  _$jscoverage['/mvc/model.js'].lineData[94] = 0;
  _$jscoverage['/mvc/model.js'].lineData[98] = 0;
  _$jscoverage['/mvc/model.js'].lineData[99] = 0;
  _$jscoverage['/mvc/model.js'].lineData[100] = 0;
  _$jscoverage['/mvc/model.js'].lineData[101] = 0;
  _$jscoverage['/mvc/model.js'].lineData[102] = 0;
  _$jscoverage['/mvc/model.js'].lineData[103] = 0;
  _$jscoverage['/mvc/model.js'].lineData[106] = 0;
  _$jscoverage['/mvc/model.js'].lineData[107] = 0;
  _$jscoverage['/mvc/model.js'].lineData[109] = 0;
  _$jscoverage['/mvc/model.js'].lineData[110] = 0;
  _$jscoverage['/mvc/model.js'].lineData[111] = 0;
  _$jscoverage['/mvc/model.js'].lineData[114] = 0;
  _$jscoverage['/mvc/model.js'].lineData[115] = 0;
  _$jscoverage['/mvc/model.js'].lineData[117] = 0;
  _$jscoverage['/mvc/model.js'].lineData[118] = 0;
  _$jscoverage['/mvc/model.js'].lineData[119] = 0;
  _$jscoverage['/mvc/model.js'].lineData[123] = 0;
  _$jscoverage['/mvc/model.js'].lineData[135] = 0;
  _$jscoverage['/mvc/model.js'].lineData[136] = 0;
  _$jscoverage['/mvc/model.js'].lineData[137] = 0;
  _$jscoverage['/mvc/model.js'].lineData[141] = 0;
  _$jscoverage['/mvc/model.js'].lineData[142] = 0;
  _$jscoverage['/mvc/model.js'].lineData[143] = 0;
  _$jscoverage['/mvc/model.js'].lineData[144] = 0;
  _$jscoverage['/mvc/model.js'].lineData[145] = 0;
  _$jscoverage['/mvc/model.js'].lineData[148] = 0;
  _$jscoverage['/mvc/model.js'].lineData[149] = 0;
  _$jscoverage['/mvc/model.js'].lineData[150] = 0;
  _$jscoverage['/mvc/model.js'].lineData[153] = 0;
  _$jscoverage['/mvc/model.js'].lineData[154] = 0;
  _$jscoverage['/mvc/model.js'].lineData[166] = 0;
  _$jscoverage['/mvc/model.js'].lineData[167] = 0;
  _$jscoverage['/mvc/model.js'].lineData[168] = 0;
  _$jscoverage['/mvc/model.js'].lineData[172] = 0;
  _$jscoverage['/mvc/model.js'].lineData[173] = 0;
  _$jscoverage['/mvc/model.js'].lineData[174] = 0;
  _$jscoverage['/mvc/model.js'].lineData[175] = 0;
  _$jscoverage['/mvc/model.js'].lineData[176] = 0;
  _$jscoverage['/mvc/model.js'].lineData[179] = 0;
  _$jscoverage['/mvc/model.js'].lineData[180] = 0;
  _$jscoverage['/mvc/model.js'].lineData[181] = 0;
  _$jscoverage['/mvc/model.js'].lineData[184] = 0;
  _$jscoverage['/mvc/model.js'].lineData[185] = 0;
  _$jscoverage['/mvc/model.js'].lineData[193] = 0;
  _$jscoverage['/mvc/model.js'].lineData[194] = 0;
  _$jscoverage['/mvc/model.js'].lineData[195] = 0;
  _$jscoverage['/mvc/model.js'].lineData[197] = 0;
  _$jscoverage['/mvc/model.js'].lineData[218] = 0;
  _$jscoverage['/mvc/model.js'].lineData[244] = 0;
  _$jscoverage['/mvc/model.js'].lineData[254] = 0;
  _$jscoverage['/mvc/model.js'].lineData[260] = 0;
  _$jscoverage['/mvc/model.js'].lineData[261] = 0;
  _$jscoverage['/mvc/model.js'].lineData[262] = 0;
  _$jscoverage['/mvc/model.js'].lineData[263] = 0;
  _$jscoverage['/mvc/model.js'].lineData[264] = 0;
  _$jscoverage['/mvc/model.js'].lineData[266] = 0;
  _$jscoverage['/mvc/model.js'].lineData[268] = 0;
  _$jscoverage['/mvc/model.js'].lineData[271] = 0;
  _$jscoverage['/mvc/model.js'].lineData[272] = 0;
  _$jscoverage['/mvc/model.js'].lineData[275] = 0;
  _$jscoverage['/mvc/model.js'].lineData[276] = 0;
  _$jscoverage['/mvc/model.js'].lineData[277] = 0;
  _$jscoverage['/mvc/model.js'].lineData[278] = 0;
  _$jscoverage['/mvc/model.js'].lineData[281] = 0;
  _$jscoverage['/mvc/model.js'].lineData[283] = 0;
  _$jscoverage['/mvc/model.js'].lineData[284] = 0;
  _$jscoverage['/mvc/model.js'].lineData[287] = 0;
  _$jscoverage['/mvc/model.js'].lineData[288] = 0;
}
if (! _$jscoverage['/mvc/model.js'].functionData) {
  _$jscoverage['/mvc/model.js'].functionData = [];
  _$jscoverage['/mvc/model.js'].functionData[0] = 0;
  _$jscoverage['/mvc/model.js'].functionData[1] = 0;
  _$jscoverage['/mvc/model.js'].functionData[2] = 0;
  _$jscoverage['/mvc/model.js'].functionData[3] = 0;
  _$jscoverage['/mvc/model.js'].functionData[4] = 0;
  _$jscoverage['/mvc/model.js'].functionData[5] = 0;
  _$jscoverage['/mvc/model.js'].functionData[6] = 0;
  _$jscoverage['/mvc/model.js'].functionData[7] = 0;
  _$jscoverage['/mvc/model.js'].functionData[8] = 0;
  _$jscoverage['/mvc/model.js'].functionData[9] = 0;
  _$jscoverage['/mvc/model.js'].functionData[10] = 0;
  _$jscoverage['/mvc/model.js'].functionData[11] = 0;
  _$jscoverage['/mvc/model.js'].functionData[12] = 0;
  _$jscoverage['/mvc/model.js'].functionData[13] = 0;
  _$jscoverage['/mvc/model.js'].functionData[14] = 0;
  _$jscoverage['/mvc/model.js'].functionData[15] = 0;
  _$jscoverage['/mvc/model.js'].functionData[16] = 0;
  _$jscoverage['/mvc/model.js'].functionData[17] = 0;
  _$jscoverage['/mvc/model.js'].functionData[18] = 0;
  _$jscoverage['/mvc/model.js'].functionData[19] = 0;
  _$jscoverage['/mvc/model.js'].functionData[20] = 0;
  _$jscoverage['/mvc/model.js'].functionData[21] = 0;
}
if (! _$jscoverage['/mvc/model.js'].branchData) {
  _$jscoverage['/mvc/model.js'].branchData = {};
  _$jscoverage['/mvc/model.js'].branchData['27'] = [];
  _$jscoverage['/mvc/model.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['80'] = [];
  _$jscoverage['/mvc/model.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['93'] = [];
  _$jscoverage['/mvc/model.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['100'] = [];
  _$jscoverage['/mvc/model.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['102'] = [];
  _$jscoverage['/mvc/model.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['110'] = [];
  _$jscoverage['/mvc/model.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['114'] = [];
  _$jscoverage['/mvc/model.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['118'] = [];
  _$jscoverage['/mvc/model.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['136'] = [];
  _$jscoverage['/mvc/model.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['142'] = [];
  _$jscoverage['/mvc/model.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['144'] = [];
  _$jscoverage['/mvc/model.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['149'] = [];
  _$jscoverage['/mvc/model.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['167'] = [];
  _$jscoverage['/mvc/model.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['173'] = [];
  _$jscoverage['/mvc/model.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['175'] = [];
  _$jscoverage['/mvc/model.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['180'] = [];
  _$jscoverage['/mvc/model.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['262'] = [];
  _$jscoverage['/mvc/model.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['263'] = [];
  _$jscoverage['/mvc/model.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['276'] = [];
  _$jscoverage['/mvc/model.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['281'] = [];
  _$jscoverage['/mvc/model.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['283'] = [];
  _$jscoverage['/mvc/model.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['287'] = [];
  _$jscoverage['/mvc/model.js'].branchData['287'][1] = new BranchData();
}
_$jscoverage['/mvc/model.js'].branchData['287'][1].init(389, 36, 'base.charAt(base.length - 1) === \'/\'');
function visit49_287_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['283'][1].init(314, 12, 'this.isNew()');
function visit48_283_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['281'][1].init(266, 33, 'getUrl(cv) || this.get(\'urlRoot\')');
function visit47_281_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['276'][1].init(17, 29, 'collections.hasOwnProperty(c)');
function visit46_276_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['263'][1].init(17, 21, 'typeof u === \'string\'');
function visit45_263_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['262'][1].init(28, 23, 'o && (u = o.get(\'url\'))');
function visit44_262_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['180'][1].init(263, 7, 'success');
function visit43_180_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['175'][1].init(89, 1, 'v');
function visit42_175_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['173'][1].init(21, 4, 'resp');
function visit41_173_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['167'][1].init(49, 10, 'opts || {}');
function visit40_167_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['149'][1].init(263, 7, 'success');
function visit39_149_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['144'][1].init(89, 1, 'v');
function visit38_144_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['142'][1].init(21, 4, 'resp');
function visit37_142_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['136'][1].init(49, 10, 'opts || {}');
function visit36_136_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['118'][1].init(53, 13, 'opts.complete');
function visit35_118_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['114'][1].init(730, 31, '!self.isNew() && opts[\'delete\']');
function visit34_114_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['110'][1].init(419, 7, 'success');
function visit33_110_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['102'][1].init(89, 1, 'v');
function visit32_102_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['100'][1].init(72, 4, 'resp');
function visit31_100_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['93'][1].init(49, 10, 'opts || {}');
function visit30_93_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['80'][1].init(23, 33, 'this.isNew() || this.__isModified');
function visit29_80_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['27'][1].init(21, 43, 'this.collections || (this.collections = {})');
function visit28_27_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/mvc/model.js'].functionData[0]++;
  _$jscoverage['/mvc/model.js'].lineData[7]++;
  var Attribute = require('attribute');
  _$jscoverage['/mvc/model.js'].lineData[8]++;
  var blacklist = ['idAttribute', 'destroyed', 'plugins', 'listeners', 'clientId', 'urlRoot', 'url', 'parse', 'sync'];
  _$jscoverage['/mvc/model.js'].lineData[25]++;
  return Attribute.extend({
  getCollections: function() {
  _$jscoverage['/mvc/model.js'].functionData[1]++;
  _$jscoverage['/mvc/model.js'].lineData[27]++;
  return visit28_27_1(this.collections || (this.collections = {}));
}, 
  addToCollection: function(c) {
  _$jscoverage['/mvc/model.js'].functionData[2]++;
  _$jscoverage['/mvc/model.js'].lineData[35]++;
  this.getCollections()[S.stamp(c)] = c;
  _$jscoverage['/mvc/model.js'].lineData[36]++;
  this.addTarget(c);
}, 
  removeFromCollection: function(c) {
  _$jscoverage['/mvc/model.js'].functionData[3]++;
  _$jscoverage['/mvc/model.js'].lineData[43]++;
  delete this.getCollections()[S.stamp(c)];
  _$jscoverage['/mvc/model.js'].lineData[44]++;
  this.removeTarget(c);
}, 
  getId: function() {
  _$jscoverage['/mvc/model.js'].functionData[4]++;
  _$jscoverage['/mvc/model.js'].lineData[51]++;
  return this.get(this.get('idAttribute'));
}, 
  'setId': function(id) {
  _$jscoverage['/mvc/model.js'].functionData[5]++;
  _$jscoverage['/mvc/model.js'].lineData[59]++;
  return this.set(this.get('idAttribute'), id);
}, 
  setInternal: function() {
  _$jscoverage['/mvc/model.js'].functionData[6]++;
  _$jscoverage['/mvc/model.js'].lineData[63]++;
  this.__isModified = 1;
  _$jscoverage['/mvc/model.js'].lineData[64]++;
  return this.callSuper.apply(this, arguments);
}, 
  isNew: function() {
  _$jscoverage['/mvc/model.js'].functionData[7]++;
  _$jscoverage['/mvc/model.js'].lineData[72]++;
  return !this.getId();
}, 
  isModified: function() {
  _$jscoverage['/mvc/model.js'].functionData[8]++;
  _$jscoverage['/mvc/model.js'].lineData[80]++;
  return !!(visit29_80_1(this.isNew() || this.__isModified));
}, 
  destroy: function(opts) {
  _$jscoverage['/mvc/model.js'].functionData[9]++;
  _$jscoverage['/mvc/model.js'].lineData[92]++;
  var self = this;
  _$jscoverage['/mvc/model.js'].lineData[93]++;
  opts = visit30_93_1(opts || {});
  _$jscoverage['/mvc/model.js'].lineData[94]++;
  var success = opts.success;
  _$jscoverage['/mvc/model.js'].lineData[98]++;
  opts.success = function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[10]++;
  _$jscoverage['/mvc/model.js'].lineData[99]++;
  var lists = self.getCollections();
  _$jscoverage['/mvc/model.js'].lineData[100]++;
  if (visit31_100_1(resp)) {
    _$jscoverage['/mvc/model.js'].lineData[101]++;
    var v = self.get('parse').call(self, resp);
    _$jscoverage['/mvc/model.js'].lineData[102]++;
    if (visit32_102_1(v)) {
      _$jscoverage['/mvc/model.js'].lineData[103]++;
      self.set(v, opts);
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[106]++;
  for (var l in lists) {
    _$jscoverage['/mvc/model.js'].lineData[107]++;
    lists[l].remove(self, opts);
  }
  _$jscoverage['/mvc/model.js'].lineData[109]++;
  self.fire('destroy');
  _$jscoverage['/mvc/model.js'].lineData[110]++;
  if (visit33_110_1(success)) {
    _$jscoverage['/mvc/model.js'].lineData[111]++;
    success.apply(self, arguments);
  }
};
  _$jscoverage['/mvc/model.js'].lineData[114]++;
  if (visit34_114_1(!self.isNew() && opts['delete'])) {
    _$jscoverage['/mvc/model.js'].lineData[115]++;
    self.get('sync').call(self, self, 'delete', opts);
  } else {
    _$jscoverage['/mvc/model.js'].lineData[117]++;
    opts.success();
    _$jscoverage['/mvc/model.js'].lineData[118]++;
    if (visit35_118_1(opts.complete)) {
      _$jscoverage['/mvc/model.js'].lineData[119]++;
      opts.complete();
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[123]++;
  return self;
}, 
  load: function(opts) {
  _$jscoverage['/mvc/model.js'].functionData[11]++;
  _$jscoverage['/mvc/model.js'].lineData[135]++;
  var self = this;
  _$jscoverage['/mvc/model.js'].lineData[136]++;
  opts = visit36_136_1(opts || {});
  _$jscoverage['/mvc/model.js'].lineData[137]++;
  var success = opts.success;
  _$jscoverage['/mvc/model.js'].lineData[141]++;
  opts.success = function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[12]++;
  _$jscoverage['/mvc/model.js'].lineData[142]++;
  if (visit37_142_1(resp)) {
    _$jscoverage['/mvc/model.js'].lineData[143]++;
    var v = self.get('parse').call(self, resp);
    _$jscoverage['/mvc/model.js'].lineData[144]++;
    if (visit38_144_1(v)) {
      _$jscoverage['/mvc/model.js'].lineData[145]++;
      self.set(v, opts);
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[148]++;
  self.__isModified = 0;
  _$jscoverage['/mvc/model.js'].lineData[149]++;
  if (visit39_149_1(success)) {
    _$jscoverage['/mvc/model.js'].lineData[150]++;
    success.apply(self, arguments);
  }
};
  _$jscoverage['/mvc/model.js'].lineData[153]++;
  self.get('sync').call(self, self, 'read', opts);
  _$jscoverage['/mvc/model.js'].lineData[154]++;
  return self;
}, 
  save: function(opts) {
  _$jscoverage['/mvc/model.js'].functionData[13]++;
  _$jscoverage['/mvc/model.js'].lineData[166]++;
  var self = this;
  _$jscoverage['/mvc/model.js'].lineData[167]++;
  opts = visit40_167_1(opts || {});
  _$jscoverage['/mvc/model.js'].lineData[168]++;
  var success = opts.success;
  _$jscoverage['/mvc/model.js'].lineData[172]++;
  opts.success = function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[14]++;
  _$jscoverage['/mvc/model.js'].lineData[173]++;
  if (visit41_173_1(resp)) {
    _$jscoverage['/mvc/model.js'].lineData[174]++;
    var v = self.get('parse').call(self, resp);
    _$jscoverage['/mvc/model.js'].lineData[175]++;
    if (visit42_175_1(v)) {
      _$jscoverage['/mvc/model.js'].lineData[176]++;
      self.set(v, opts);
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[179]++;
  self.__isModified = 0;
  _$jscoverage['/mvc/model.js'].lineData[180]++;
  if (visit43_180_1(success)) {
    _$jscoverage['/mvc/model.js'].lineData[181]++;
    success.apply(self, arguments);
  }
};
  _$jscoverage['/mvc/model.js'].lineData[184]++;
  self.get('sync').call(self, self, self.isNew() ? 'create' : 'update', opts);
  _$jscoverage['/mvc/model.js'].lineData[185]++;
  return self;
}, 
  toJSON: function() {
  _$jscoverage['/mvc/model.js'].functionData[15]++;
  _$jscoverage['/mvc/model.js'].lineData[193]++;
  var ret = this.getAttrVals();
  _$jscoverage['/mvc/model.js'].lineData[194]++;
  S.each(blacklist, function(b) {
  _$jscoverage['/mvc/model.js'].functionData[16]++;
  _$jscoverage['/mvc/model.js'].lineData[195]++;
  delete ret[b];
});
  _$jscoverage['/mvc/model.js'].lineData[197]++;
  return ret;
}}, {
  ATTRS: {
  idAttribute: {
  value: 'id'}, 
  clientId: {
  valueFn: function() {
  _$jscoverage['/mvc/model.js'].functionData[17]++;
  _$jscoverage['/mvc/model.js'].lineData[218]++;
  return S.guid('mvc-client');
}}, 
  url: {
  value: url}, 
  urlRoot: {
  value: ''}, 
  sync: {
  value: function() {
  _$jscoverage['/mvc/model.js'].functionData[18]++;
  _$jscoverage['/mvc/model.js'].lineData[244]++;
  S.require('mvc').sync.apply(this, arguments);
}}, 
  parse: {
  value: function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[19]++;
  _$jscoverage['/mvc/model.js'].lineData[254]++;
  return resp;
}}}});
  _$jscoverage['/mvc/model.js'].lineData[260]++;
  function getUrl(o) {
    _$jscoverage['/mvc/model.js'].functionData[20]++;
    _$jscoverage['/mvc/model.js'].lineData[261]++;
    var u;
    _$jscoverage['/mvc/model.js'].lineData[262]++;
    if (visit44_262_1(o && (u = o.get('url')))) {
      _$jscoverage['/mvc/model.js'].lineData[263]++;
      if (visit45_263_1(typeof u === 'string')) {
        _$jscoverage['/mvc/model.js'].lineData[264]++;
        return u;
      }
      _$jscoverage['/mvc/model.js'].lineData[266]++;
      return u.call(o);
    }
    _$jscoverage['/mvc/model.js'].lineData[268]++;
    return u;
  }
  _$jscoverage['/mvc/model.js'].lineData[271]++;
  function url() {
    _$jscoverage['/mvc/model.js'].functionData[21]++;
    _$jscoverage['/mvc/model.js'].lineData[272]++;
    var c, cv, collections = this.getCollections();
    _$jscoverage['/mvc/model.js'].lineData[275]++;
    for (c in collections) {
      _$jscoverage['/mvc/model.js'].lineData[276]++;
      if (visit46_276_1(collections.hasOwnProperty(c))) {
        _$jscoverage['/mvc/model.js'].lineData[277]++;
        cv = collections[c];
        _$jscoverage['/mvc/model.js'].lineData[278]++;
        break;
      }
    }
    _$jscoverage['/mvc/model.js'].lineData[281]++;
    var base = visit47_281_1(getUrl(cv) || this.get('urlRoot'));
    _$jscoverage['/mvc/model.js'].lineData[283]++;
    if (visit48_283_1(this.isNew())) {
      _$jscoverage['/mvc/model.js'].lineData[284]++;
      return base;
    }
    _$jscoverage['/mvc/model.js'].lineData[287]++;
    base = base + (visit49_287_1(base.charAt(base.length - 1) === '/') ? '' : '/');
    _$jscoverage['/mvc/model.js'].lineData[288]++;
    return base + encodeURIComponent(this.getId()) + '/';
  }
});
