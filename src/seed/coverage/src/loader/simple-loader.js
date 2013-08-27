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
  _$jscoverage['/loader/simple-loader.js'].lineData[16] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[17] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[18] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[19] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[20] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[22] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[23] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[32] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[33] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[40] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[44] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[45] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[53] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[57] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[58] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[59] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[60] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[65] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[72] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[74] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[75] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[80] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[81] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[83] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[90] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[91] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[94] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[97] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[98] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[103] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[115] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[124] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[131] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[140] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[142] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[146] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[148] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[159] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[167] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[168] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[170] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[173] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[176] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[179] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[183] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[191] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[192] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[198] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[199] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[200] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[201] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[202] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[205] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[215] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[217] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[220] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[221] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[222] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[223] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[224] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[226] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[228] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[229] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[230] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[233] = 0;
  _$jscoverage['/loader/simple-loader.js'].lineData[241] = 0;
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
  _$jscoverage['/loader/simple-loader.js'].branchData['44'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['57'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['74'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['74'][3] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['80'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['90'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['106'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['122'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['126'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['140'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['146'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['167'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['198'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['200'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['205'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['221'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/loader/simple-loader.js'].branchData['224'] = [];
  _$jscoverage['/loader/simple-loader.js'].branchData['224'][1] = new BranchData();
}
_$jscoverage['/loader/simple-loader.js'].branchData['224'][1].init(68, 5, 'UA.ie');
function visit433_224_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['221'][1].init(14, 26, 'typeof name === \'function\'');
function visit432_221_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['205'][1].init(386, 2, 're');
function visit431_205_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['200'][1].init(52, 34, 'script.readyState == \'interactive\'');
function visit430_200_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['198'][1].init(189, 6, 'i >= 0');
function visit429_198_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['167'][1].init(22, 6, 'mod.fn');
function visit428_167_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['146'][1].init(185, 10, 'currentMod');
function visit427_146_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['140'][1].init(28, 5, 'isCss');
function visit426_140_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['126'][1].init(386, 12, 'ie && !isCss');
function visit425_126_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['122'][1].init(291, 22, 'mod.getType() == \'css\'');
function visit424_122_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['106'][1].init(927, 16, 'status < LOADING');
function visit423_106_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['90'][1].init(347, 6, 'isWait');
function visit422_90_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['80'][1].init(486, 17, 'status === LOADED');
function visit421_80_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['74'][3].init(319, 15, 'status == ERROR');
function visit420_74_3(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['74'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['74'][2].init(297, 18, 'status == ATTACHED');
function visit419_74_2(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['74'][1].init(297, 37, 'status == ATTACHED || status == ERROR');
function visit418_74_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['57'][1].init(203, 27, '!requireLoadedMods[modName]');
function visit417_57_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].branchData['44'][1].init(94, 5, 'i < l');
function visit416_44_1(result) {
  _$jscoverage['/loader/simple-loader.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/simple-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/simple-loader.js'].functionData[0]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[7]++;
  var Loader, Status, Utils, UA, currentMod = undefined, startLoadTime = 0, startLoadModName, LOADING, LOADED, ERROR, ATTACHED;
  _$jscoverage['/loader/simple-loader.js'].lineData[16]++;
  Loader = S.Loader;
  _$jscoverage['/loader/simple-loader.js'].lineData[17]++;
  Status = Loader.Status;
  _$jscoverage['/loader/simple-loader.js'].lineData[18]++;
  Utils = Loader.Utils;
  _$jscoverage['/loader/simple-loader.js'].lineData[19]++;
  UA = S.UA;
  _$jscoverage['/loader/simple-loader.js'].lineData[20]++;
  LOADING = Status.LOADING;
  _$jscoverage['/loader/simple-loader.js'].lineData[21]++;
  LOADED = Status.LOADED;
  _$jscoverage['/loader/simple-loader.js'].lineData[22]++;
  ERROR = Status.ERROR;
  _$jscoverage['/loader/simple-loader.js'].lineData[23]++;
  ATTACHED = Status.ATTACHED;
  _$jscoverage['/loader/simple-loader.js'].lineData[32]++;
  function SimpleLoader(runtime, waitingModules) {
    _$jscoverage['/loader/simple-loader.js'].functionData[1]++;
    _$jscoverage['/loader/simple-loader.js'].lineData[33]++;
    S.mix(this, {
  runtime: runtime, 
  requireLoadedMods: {}, 
  waitingModules: waitingModules});
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[40]++;
  S.augment(SimpleLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/simple-loader.js'].functionData[2]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[42]++;
  var i, l = normalizedModNames.length;
  _$jscoverage['/loader/simple-loader.js'].lineData[44]++;
  for (i = 0; visit416_44_1(i < l); i++) {
    _$jscoverage['/loader/simple-loader.js'].lineData[45]++;
    this.loadModule(normalizedModNames[i]);
  }
}, 
  loadModRequires: function(mod) {
  _$jscoverage['/loader/simple-loader.js'].functionData[3]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[53]++;
  var self = this, requireLoadedMods = self.requireLoadedMods, modName = mod.name, requires;
  _$jscoverage['/loader/simple-loader.js'].lineData[57]++;
  if (visit417_57_1(!requireLoadedMods[modName])) {
    _$jscoverage['/loader/simple-loader.js'].lineData[58]++;
    requireLoadedMods[modName] = 1;
    _$jscoverage['/loader/simple-loader.js'].lineData[59]++;
    requires = mod.getNormalizedRequires();
    _$jscoverage['/loader/simple-loader.js'].lineData[60]++;
    self.use(requires);
  }
}, 
  loadModule: function(modName) {
  _$jscoverage['/loader/simple-loader.js'].functionData[4]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[65]++;
  var self = this, waitingModules = self.waitingModules, runtime = self.runtime, status, isWait, mod = Utils.createModuleInfo(runtime, modName);
  _$jscoverage['/loader/simple-loader.js'].lineData[72]++;
  status = mod.status;
  _$jscoverage['/loader/simple-loader.js'].lineData[74]++;
  if (visit418_74_1(visit419_74_2(status == ATTACHED) || visit420_74_3(status == ERROR))) {
    _$jscoverage['/loader/simple-loader.js'].lineData[75]++;
    return;
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[80]++;
  if (visit421_80_1(status === LOADED)) {
    _$jscoverage['/loader/simple-loader.js'].lineData[81]++;
    self.loadModRequires(mod);
  } else {
    _$jscoverage['/loader/simple-loader.js'].lineData[83]++;
    isWait = waitingModules.contains(modName);
    _$jscoverage['/loader/simple-loader.js'].lineData[90]++;
    if (visit422_90_1(isWait)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[91]++;
      return;
    }
    _$jscoverage['/loader/simple-loader.js'].lineData[94]++;
    mod.addCallback(function() {
  _$jscoverage['/loader/simple-loader.js'].functionData[5]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[97]++;
  self.loadModRequires(mod);
  _$jscoverage['/loader/simple-loader.js'].lineData[98]++;
  waitingModules.remove(modName);
  _$jscoverage['/loader/simple-loader.js'].lineData[100]++;
  waitingModules.notifyAll();
});
    _$jscoverage['/loader/simple-loader.js'].lineData[103]++;
    waitingModules.add(modName);
    _$jscoverage['/loader/simple-loader.js'].lineData[106]++;
    if (visit423_106_1(status < LOADING)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[108]++;
      self.fetchModule(mod);
    }
  }
}, 
  fetchModule: function(mod) {
  _$jscoverage['/loader/simple-loader.js'].functionData[6]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[115]++;
  var self = this, runtime = self.runtime, timeout = runtime.Config.timeout, modName = mod.getName(), charset = mod.getCharset(), url = mod.getFullPath(), ie = UA.ie, isCss = visit424_122_1(mod.getType() == 'css');
  _$jscoverage['/loader/simple-loader.js'].lineData[124]++;
  mod.status = LOADING;
  _$jscoverage['/loader/simple-loader.js'].lineData[126]++;
  if (visit425_126_1(ie && !isCss)) {
    _$jscoverage['/loader/simple-loader.js'].lineData[127]++;
    startLoadModName = modName;
    _$jscoverage['/loader/simple-loader.js'].lineData[128]++;
    startLoadTime = Number(+new Date());
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[131]++;
  S.getScript(url, {
  attrs: ie ? {
  'data-mod-name': modName} : undefined, 
  timeout: timeout, 
  success: function() {
  _$jscoverage['/loader/simple-loader.js'].functionData[7]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[140]++;
  if (visit426_140_1(isCss)) {
    _$jscoverage['/loader/simple-loader.js'].lineData[142]++;
    Utils.registerModule(runtime, modName, S.noop);
  } else {
    _$jscoverage['/loader/simple-loader.js'].lineData[146]++;
    if (visit427_146_1(currentMod)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[148]++;
      Utils.registerModule(runtime, modName, currentMod.fn, currentMod.config);
      _$jscoverage['/loader/simple-loader.js'].lineData[151]++;
      currentMod = undefined;
    }
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[159]++;
  S.later(checkHandler);
}, 
  error: checkHandler, 
  charset: charset});
  _$jscoverage['/loader/simple-loader.js'].lineData[166]++;
  function checkHandler() {
    _$jscoverage['/loader/simple-loader.js'].functionData[8]++;
    _$jscoverage['/loader/simple-loader.js'].lineData[167]++;
    if (visit428_167_1(mod.fn)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[168]++;
      var msg = 'load remote module: "' + modName + '" from: "' + url + '"';
      _$jscoverage['/loader/simple-loader.js'].lineData[170]++;
      S.log(msg, 'info');
    } else {
      _$jscoverage['/loader/simple-loader.js'].lineData[173]++;
      _modError();
    }
    _$jscoverage['/loader/simple-loader.js'].lineData[176]++;
    mod.notifyAll();
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[179]++;
  function _modError() {
    _$jscoverage['/loader/simple-loader.js'].functionData[9]++;
    _$jscoverage['/loader/simple-loader.js'].lineData[180]++;
    var msg = modName + ' is not loaded! can not find module in path : ' + url;
    _$jscoverage['/loader/simple-loader.js'].lineData[183]++;
    S.log(msg, 'error');
    _$jscoverage['/loader/simple-loader.js'].lineData[184]++;
    mod.status = ERROR;
  }
}});
  _$jscoverage['/loader/simple-loader.js'].lineData[191]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/simple-loader.js'].functionData[10]++;
    _$jscoverage['/loader/simple-loader.js'].lineData[192]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/simple-loader.js'].lineData[198]++;
    for (i = scripts.length - 1; visit429_198_1(i >= 0); i--) {
      _$jscoverage['/loader/simple-loader.js'].lineData[199]++;
      script = scripts[i];
      _$jscoverage['/loader/simple-loader.js'].lineData[200]++;
      if (visit430_200_1(script.readyState == 'interactive')) {
        _$jscoverage['/loader/simple-loader.js'].lineData[201]++;
        re = script;
        _$jscoverage['/loader/simple-loader.js'].lineData[202]++;
        break;
      }
    }
    _$jscoverage['/loader/simple-loader.js'].lineData[205]++;
    if (visit431_205_1(re)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[206]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/simple-loader.js'].lineData[215]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/simple-loader.js'].lineData[217]++;
    return name;
  }
  _$jscoverage['/loader/simple-loader.js'].lineData[220]++;
  SimpleLoader.add = function(name, fn, config, runtime) {
  _$jscoverage['/loader/simple-loader.js'].functionData[11]++;
  _$jscoverage['/loader/simple-loader.js'].lineData[221]++;
  if (visit432_221_1(typeof name === 'function')) {
    _$jscoverage['/loader/simple-loader.js'].lineData[222]++;
    config = fn;
    _$jscoverage['/loader/simple-loader.js'].lineData[223]++;
    fn = name;
    _$jscoverage['/loader/simple-loader.js'].lineData[224]++;
    if (visit433_224_1(UA.ie)) {
      _$jscoverage['/loader/simple-loader.js'].lineData[226]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/simple-loader.js'].lineData[228]++;
      Utils.registerModule(runtime, name, fn, config);
      _$jscoverage['/loader/simple-loader.js'].lineData[229]++;
      startLoadModName = null;
      _$jscoverage['/loader/simple-loader.js'].lineData[230]++;
      startLoadTime = 0;
    } else {
      _$jscoverage['/loader/simple-loader.js'].lineData[233]++;
      currentMod = {
  fn: fn, 
  config: config};
    }
  }
};
  _$jscoverage['/loader/simple-loader.js'].lineData[241]++;
  Loader.SimpleLoader = SimpleLoader;
})(KISSY);
