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
if (! _$jscoverage['/loader/simple-loader.js']) {
  _$jscoverage['/loader/simple-loader.js'] = {};
  _$jscoverage['/loader/simple-loader.js'].lineData = [];
  _$jscoverage['/loader/simple-loader.js'].lineData[6] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[7] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[17] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[18] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[19] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[20] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[22] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[23] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[24] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[33] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[34] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[41] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[43] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[45] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[54] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[58] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[59] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[60] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[61] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[66] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[73] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[75] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[76] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[81] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[82] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[84] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[91] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[98] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[99] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[101] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[104] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[109] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[116] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[132] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[143] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[147] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[149] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[160] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[167] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[168] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[169] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[171] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[174] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[177] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[181] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[185] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[192] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[193] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[199] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[200] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[201] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[202] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[203] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[207] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[216] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[218] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[221] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[222] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[223] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[224] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[225] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[227] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[229] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[230] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[231] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[234] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[242] = 0;
}
if (! _$jscoverage['/loader/simple-loader.js'].functionData) {
  _$jscoverage['/loader/simple-loader.js'].functionData = [];
  _$jscoverage['/loader/simple-loader.js'].functionData[0] = 0;
  _$jscoverage['/loader/simple-loader.js'].functionData[1] = 0;
  _$jscoverage['/loader/simple-loader.js'].functionData[2] = 0;
  _$jscoverage['/loader/simple-loader.js'].functionData[3] = 0;
  _$jscoverage['/loader/simple-loader.js'].functionData[4] = 0;
  _$jscoverage['/loader/simple-loader.js'].functionData[5] = 0;
  _$jscoverage['/loader/simple-loader.js'].functionData[6] = 0;
  _$jscoverage['/loader/simple-loader.js'].functionData[7] = 0;
  _$jscoverage['/loader/simple-loader.js'].functionData[8] = 0;
  _$jscoverage['/loader/simple-loader.js'].functionData[9] = 0;
  _$jscoverage['/loader/simple-loader.js'].functionData[10] = 0;
  _$jscoverage['/loader/simple-loader.js'].functionData[11] = 0;
}
if (! _$jscoverage['/loader/simple-loader.js'].branchData) {
  _$jscoverage['/loader/simple-loader.js'].branchData = {};
  _$jscoverage['/loader/simple-loader.js'].branchData['45'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['58'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['75'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['75'][3] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['81'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['91'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['107'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['123'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['127'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['141'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['147'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['168'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['199'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['201'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['206'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['222'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['225'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['225'][1] = new BranchData();
}
_$jscoverage['/loader/simple-loader.js'].branchData['225'][1].init(68, 5, 'UA.ie');
function visit443_225_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['222'][1].init(14, 26, 'typeof name === \'function\'');
function visit442_222_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['206'][1].init(386, 2, 're');
function visit441_206_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['201'][1].init(52, 34, 'script.readyState == \'interactive\'');
function visit440_201_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['199'][1].init(189, 6, 'i >= 0');
function visit439_199_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['168'][1].init(22, 6, 'mod.fn');
function visit438_168_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['147'][1].init(185, 10, 'currentMod');
function visit437_147_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['141'][1].init(28, 5, 'isCss');
function visit436_141_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['127'][1].init(386, 12, 'ie && !isCss');
function visit435_127_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['123'][1].init(291, 22, 'mod.getType() == \'css\'');
function visit434_123_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['107'][1].init(927, 16, 'status < LOADING');
function visit433_107_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['91'][1].init(347, 6, 'isWait');
function visit432_91_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['81'][1].init(486, 17, 'status === LOADED');
function visit431_81_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['75'][3].init(319, 15, 'status == ERROR');
function visit430_75_3(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['75'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['75'][2].init(297, 18, 'status == ATTACHED');
function visit429_75_2(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['75'][1].init(297, 37, 'status == ATTACHED || status == ERROR');
function visit428_75_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['58'][1].init(203, 27, '!requireLoadedMods[modName]');
function visit427_58_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['45'][1].init(94, 5, 'i < l');
function visit426_45_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/simple-loader.js'].functionData[0]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[7]++;
  var Loader, Status, Utils, UA, logger = S.getLogger('s/loader'), currentMod = undefined, startLoadTime = 0, startLoadModName, LOADING, LOADED, ERROR, ATTACHED;
  _$jscoverage['/loader/simple-loader.js'].lineData[17]++;
  Loader = S.Loader;
  _$jscoverage['/loader/simple-loader.js'].lineData[18]++;
  Status = Loader.Status;
  _$jscoverage['/loader/simple-loader.js'].lineData[19]++;
  Utils = Loader.Utils;
  _$jscoverage['/loader/simple-loader.js'].lineData[20]++;
  UA = S.UA;
  _$jscoverage['/loader/simple-loader.js'].lineData[21]++;
  LOADING = Status.LOADING;
  _$jscoverage['/loader/simple-loader.js'].lineData[22]++;
  LOADED = Status.LOADED;
  _$jscoverage['/loader/simple-loader.js'].lineData[23]++;
  ERROR = Status.ERROR;
  _$jscoverage['/loader/simple-loader.js'].lineData[24]++;
  ATTACHED = Status.ATTACHED;
  _$jscoverage['/loader/simple-loader.js'].lineData[33]++;
  function SimpleLoader(runtime, waitingModules) {
    _$jscoverage['/loader/simple-loader.js'].functionData[1]++;
    _$jscoverage['/loader/simple-loader.js'].lineData[34]++;
    S.mix(this, {
  runtime: runtime, 
  requireLoadedMods: {}, 
  waitingModules: waitingModules});
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[41]++;
  S.augment(SimpleLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/simple-loader.js'].functionData[2]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[43]++;
  var i, l = normalizedModNames.length;
  _$jscoverage['/loader/simple-loader.js'].lineData[45]++;
  for (i = 0; visit426_45_1(i < l); i++) {
    _$jscoverage['/loader/simple-loader.js'].lineData[46]++;
    this.loadModule(normalizedModNames[i]);
  }
}, 
  loadModRequires: function(mod) {
  _$jscoverage['/loader/simple-loader.js'].functionData[3]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[54]++;
  var self = this, requireLoadedMods = self.requireLoadedMods, modName = mod.name, requires;
  _$jscoverage['/loader/simple-loader.js'].lineData[58]++;
  if (visit427_58_1(!requireLoadedMods[modName])) {
    _$jscoverage['/loader/simple-loader.js'].lineData[59]++;
    requireLoadedMods[modName] = 1;
    _$jscoverage['/loader/simple-loader.js'].lineData[60]++;
    requires = mod.getNormalizedRequires();
    _$jscoverage['/loader/simple-loader.js'].lineData[61]++;
    self.use(requires);
  }
}, 
  loadModule: function(modName) {
  _$jscoverage['/loader/simple-loader.js'].functionData[4]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[66]++;
  var self = this, waitingModules = self.waitingModules, runtime = self.runtime, status, isWait, mod = Utils.createModuleInfo(runtime, modName);
  _$jscoverage['/loader/simple-loader.js'].lineData[73]++;
  status = mod.status;
  _$jscoverage['/loader/simple-loader.js'].lineData[75]++;
  if (visit428_75_1(visit429_75_2(status == ATTACHED) || visit430_75_3(status == ERROR))) {
    _$jscoverage['/loader/simple-loader.js'].lineData[76]++;
    return;
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[81]++;
  if (visit431_81_1(status === LOADED)) {
    _$jscoverage['/loader/simple-loader.js'].lineData[82]++;
    self.loadModRequires(mod);
  } else {
    _$jscoverage['/loader/simple-loader.js'].lineData[84]++;
    isWait = waitingModules.contains(modName);
    _$jscoverage['/loader/simple-loader.js'].lineData[91]++;
    if (visit432_91_1(isWait)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[92]++;
      return;
    }
    _$jscoverage['/loader/simple-loader.js'].lineData[95]++;
    mod.addCallback(function() {
  _$jscoverage['/loader/simple-loader.js'].functionData[5]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[98]++;
  self.loadModRequires(mod);
  _$jscoverage['/loader/simple-loader.js'].lineData[99]++;
  waitingModules.remove(modName);
  _$jscoverage['/loader/simple-loader.js'].lineData[101]++;
  waitingModules.notifyAll();
});
    _$jscoverage['/loader/simple-loader.js'].lineData[104]++;
    waitingModules.add(modName);
    _$jscoverage['/loader/simple-loader.js'].lineData[107]++;
    if (visit433_107_1(status < LOADING)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[109]++;
      self.fetchModule(mod);
    }
  }
}, 
  fetchModule: function(mod) {
  _$jscoverage['/loader/simple-loader.js'].functionData[6]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[116]++;
  var self = this, runtime = self.runtime, timeout = runtime.Config.timeout, modName = mod.getName(), charset = mod.getCharset(), url = mod.getFullPath(), ie = UA.ie, isCss = visit434_123_1(mod.getType() == 'css');
  _$jscoverage['/loader/simple-loader.js'].lineData[125]++;
  mod.status = LOADING;
  _$jscoverage['/loader/simple-loader.js'].lineData[127]++;
  if (visit435_127_1(ie && !isCss)) {
    _$jscoverage['/loader/simple-loader.js'].lineData[128]++;
    startLoadModName = modName;
    _$jscoverage['/loader/simple-loader.js'].lineData[129]++;
    startLoadTime = Number(+new Date());
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[132]++;
  S.getScript(url, {
  attrs: ie ? {
  'data-mod-name': modName} : undefined, 
  timeout: timeout, 
  success: function() {
  _$jscoverage['/loader/simple-loader.js'].functionData[7]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[141]++;
  if (visit436_141_1(isCss)) {
    _$jscoverage['/loader/simple-loader.js'].lineData[143]++;
    Utils.registerModule(runtime, modName, S.noop);
  } else {
    _$jscoverage['/loader/simple-loader.js'].lineData[147]++;
    if (visit437_147_1(currentMod)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[149]++;
      Utils.registerModule(runtime, modName, currentMod.fn, currentMod.config);
      _$jscoverage['/loader/simple-loader.js'].lineData[152]++;
      currentMod = undefined;
    }
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[160]++;
  S.later(checkHandler);
}, 
  error: checkHandler, 
  charset: charset});
  _$jscoverage['/loader/simple-loader.js'].lineData[167]++;
  function checkHandler() {
    _$jscoverage['/loader/simple-loader.js'].functionData[8]++;
    _$jscoverage['/loader/simple-loader.js'].lineData[168]++;
    if (visit438_168_1(mod.fn)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[169]++;
      var msg = 'load remote module: "' + modName + '" from: "' + url + '"';
      _$jscoverage['/loader/simple-loader.js'].lineData[171]++;
      logger.log(msg, 'info');
    } else {
      _$jscoverage['/loader/simple-loader.js'].lineData[174]++;
      _modError();
    }
    _$jscoverage['/loader/simple-loader.js'].lineData[177]++;
    mod.notifyAll();
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[180]++;
  function _modError() {
    _$jscoverage['/loader/simple-loader.js'].functionData[9]++;
    _$jscoverage['/loader/simple-loader.js'].lineData[181]++;
    var msg = modName + ' is not loaded! can not find module in path : ' + url;
    _$jscoverage['/loader/simple-loader.js'].lineData[184]++;
    S.log(msg, 'error');
    _$jscoverage['/loader/simple-loader.js'].lineData[185]++;
    mod.status = ERROR;
  }
}});
  _$jscoverage['/loader/simple-loader.js'].lineData[192]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/simple-loader.js'].functionData[10]++;
    _$jscoverage['/loader/simple-loader.js'].lineData[193]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/simple-loader.js'].lineData[199]++;
    for (i = scripts.length - 1; visit439_199_1(i >= 0); i--) {
      _$jscoverage['/loader/simple-loader.js'].lineData[200]++;
      script = scripts[i];
      _$jscoverage['/loader/simple-loader.js'].lineData[201]++;
      if (visit440_201_1(script.readyState == 'interactive')) {
        _$jscoverage['/loader/simple-loader.js'].lineData[202]++;
        re = script;
        _$jscoverage['/loader/simple-loader.js'].lineData[203]++;
        break;
      }
    }
    _$jscoverage['/loader/simple-loader.js'].lineData[206]++;
    if (visit441_206_1(re)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[207]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/simple-loader.js'].lineData[216]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/simple-loader.js'].lineData[218]++;
    return name;
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[221]++;
  SimpleLoader.add = function(name, fn, config, runtime) {
  _$jscoverage['/loader/simple-loader.js'].functionData[11]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[222]++;
  if (visit442_222_1(typeof name === 'function')) {
    _$jscoverage['/loader/simple-loader.js'].lineData[223]++;
    config = fn;
    _$jscoverage['/loader/simple-loader.js'].lineData[224]++;
    fn = name;
    _$jscoverage['/loader/simple-loader.js'].lineData[225]++;
    if (visit443_225_1(UA.ie)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[227]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/simple-loader.js'].lineData[229]++;
      Utils.registerModule(runtime, name, fn, config);
      _$jscoverage['/loader/simple-loader.js'].lineData[230]++;
      startLoadModName = null;
      _$jscoverage['/loader/simple-loader.js'].lineData[231]++;
      startLoadTime = 0;
    } else {
      _$jscoverage['/loader/simple-loader.js'].lineData[234]++;
      currentMod = {
  fn: fn, 
  config: config};
    }
  }
};
  _$jscoverage['/loader/simple-loader.js'].lineData[242]++;
  Loader.SimpleLoader = SimpleLoader;
})(KISSY);
