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
if (! _$jscoverage['/timer/fx.js']) {
  _$jscoverage['/timer/fx.js'] = {};
  _$jscoverage['/timer/fx.js'].lineData = [];
  _$jscoverage['/timer/fx.js'].lineData[6] = 0;
  _$jscoverage['/timer/fx.js'].lineData[7] = 0;
  _$jscoverage['/timer/fx.js'].lineData[8] = 0;
  _$jscoverage['/timer/fx.js'].lineData[10] = 0;
  _$jscoverage['/timer/fx.js'].lineData[11] = 0;
  _$jscoverage['/timer/fx.js'].lineData[12] = 0;
  _$jscoverage['/timer/fx.js'].lineData[13] = 0;
  _$jscoverage['/timer/fx.js'].lineData[21] = 0;
  _$jscoverage['/timer/fx.js'].lineData[22] = 0;
  _$jscoverage['/timer/fx.js'].lineData[25] = 0;
  _$jscoverage['/timer/fx.js'].lineData[36] = 0;
  _$jscoverage['/timer/fx.js'].lineData[44] = 0;
  _$jscoverage['/timer/fx.js'].lineData[45] = 0;
  _$jscoverage['/timer/fx.js'].lineData[48] = 0;
  _$jscoverage['/timer/fx.js'].lineData[56] = 0;
  _$jscoverage['/timer/fx.js'].lineData[57] = 0;
  _$jscoverage['/timer/fx.js'].lineData[60] = 0;
  _$jscoverage['/timer/fx.js'].lineData[62] = 0;
  _$jscoverage['/timer/fx.js'].lineData[63] = 0;
  _$jscoverage['/timer/fx.js'].lineData[66] = 0;
  _$jscoverage['/timer/fx.js'].lineData[68] = 0;
  _$jscoverage['/timer/fx.js'].lineData[70] = 0;
  _$jscoverage['/timer/fx.js'].lineData[71] = 0;
  _$jscoverage['/timer/fx.js'].lineData[74] = 0;
  _$jscoverage['/timer/fx.js'].lineData[75] = 0;
  _$jscoverage['/timer/fx.js'].lineData[77] = 0;
  _$jscoverage['/timer/fx.js'].lineData[78] = 0;
  _$jscoverage['/timer/fx.js'].lineData[79] = 0;
  _$jscoverage['/timer/fx.js'].lineData[81] = 0;
  _$jscoverage['/timer/fx.js'].lineData[83] = 0;
  _$jscoverage['/timer/fx.js'].lineData[84] = 0;
  _$jscoverage['/timer/fx.js'].lineData[85] = 0;
  _$jscoverage['/timer/fx.js'].lineData[87] = 0;
  _$jscoverage['/timer/fx.js'].lineData[102] = 0;
  _$jscoverage['/timer/fx.js'].lineData[104] = 0;
  _$jscoverage['/timer/fx.js'].lineData[106] = 0;
  _$jscoverage['/timer/fx.js'].lineData[115] = 0;
  _$jscoverage['/timer/fx.js'].lineData[122] = 0;
  _$jscoverage['/timer/fx.js'].lineData[123] = 0;
  _$jscoverage['/timer/fx.js'].lineData[125] = 0;
  _$jscoverage['/timer/fx.js'].lineData[126] = 0;
  _$jscoverage['/timer/fx.js'].lineData[128] = 0;
  _$jscoverage['/timer/fx.js'].lineData[129] = 0;
  _$jscoverage['/timer/fx.js'].lineData[131] = 0;
  _$jscoverage['/timer/fx.js'].lineData[136] = 0;
  _$jscoverage['/timer/fx.js'].lineData[142] = 0;
  _$jscoverage['/timer/fx.js'].lineData[144] = 0;
  _$jscoverage['/timer/fx.js'].lineData[146] = 0;
  _$jscoverage['/timer/fx.js'].lineData[148] = 0;
  _$jscoverage['/timer/fx.js'].lineData[151] = 0;
  _$jscoverage['/timer/fx.js'].lineData[152] = 0;
  _$jscoverage['/timer/fx.js'].lineData[157] = 0;
  _$jscoverage['/timer/fx.js'].lineData[158] = 0;
  _$jscoverage['/timer/fx.js'].lineData[159] = 0;
  _$jscoverage['/timer/fx.js'].lineData[160] = 0;
  _$jscoverage['/timer/fx.js'].lineData[161] = 0;
  _$jscoverage['/timer/fx.js'].lineData[163] = 0;
  _$jscoverage['/timer/fx.js'].lineData[167] = 0;
  _$jscoverage['/timer/fx.js'].lineData[168] = 0;
  _$jscoverage['/timer/fx.js'].lineData[170] = 0;
  _$jscoverage['/timer/fx.js'].lineData[171] = 0;
  _$jscoverage['/timer/fx.js'].lineData[174] = 0;
  _$jscoverage['/timer/fx.js'].lineData[175] = 0;
  _$jscoverage['/timer/fx.js'].lineData[177] = 0;
  _$jscoverage['/timer/fx.js'].lineData[178] = 0;
  _$jscoverage['/timer/fx.js'].lineData[180] = 0;
  _$jscoverage['/timer/fx.js'].lineData[183] = 0;
}
if (! _$jscoverage['/timer/fx.js'].functionData) {
  _$jscoverage['/timer/fx.js'].functionData = [];
  _$jscoverage['/timer/fx.js'].functionData[0] = 0;
  _$jscoverage['/timer/fx.js'].functionData[1] = 0;
  _$jscoverage['/timer/fx.js'].functionData[2] = 0;
  _$jscoverage['/timer/fx.js'].functionData[3] = 0;
  _$jscoverage['/timer/fx.js'].functionData[4] = 0;
  _$jscoverage['/timer/fx.js'].functionData[5] = 0;
  _$jscoverage['/timer/fx.js'].functionData[6] = 0;
  _$jscoverage['/timer/fx.js'].functionData[7] = 0;
  _$jscoverage['/timer/fx.js'].functionData[8] = 0;
  _$jscoverage['/timer/fx.js'].functionData[9] = 0;
}
if (! _$jscoverage['/timer/fx.js'].branchData) {
  _$jscoverage['/timer/fx.js'].branchData = {};
  _$jscoverage['/timer/fx.js'].branchData['13'] = [];
  _$jscoverage['/timer/fx.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['44'] = [];
  _$jscoverage['/timer/fx.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['56'] = [];
  _$jscoverage['/timer/fx.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['62'] = [];
  _$jscoverage['/timer/fx.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['62'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['62'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['70'] = [];
  _$jscoverage['/timer/fx.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['74'] = [];
  _$jscoverage['/timer/fx.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['75'] = [];
  _$jscoverage['/timer/fx.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['84'] = [];
  _$jscoverage['/timer/fx.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['102'] = [];
  _$jscoverage['/timer/fx.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['103'] = [];
  _$jscoverage['/timer/fx.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['122'] = [];
  _$jscoverage['/timer/fx.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['123'] = [];
  _$jscoverage['/timer/fx.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['125'] = [];
  _$jscoverage['/timer/fx.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['128'] = [];
  _$jscoverage['/timer/fx.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['137'] = [];
  _$jscoverage['/timer/fx.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['144'] = [];
  _$jscoverage['/timer/fx.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['144'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['145'] = [];
  _$jscoverage['/timer/fx.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['158'] = [];
  _$jscoverage['/timer/fx.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['160'] = [];
  _$jscoverage['/timer/fx.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['177'] = [];
  _$jscoverage['/timer/fx.js'].branchData['177'][1] = new BranchData();
}
_$jscoverage['/timer/fx.js'].branchData['177'][1].init(184, 54, '!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop])');
function visit64_177_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['160'][1].init(276, 19, 'runTime >= duration');
function visit63_160_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['158'][1].init(218, 12, 'runTime <= 0');
function visit62_158_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['145'][1].init(57, 42, 'Dom.attr(node, prop, undefined, 1) != null');
function visit61_145_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['144'][3].init(68, 26, 'node.style[prop] == null');
function visit60_144_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['144'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['144'][2].init(53, 41, '!node.style || node.style[prop] == null');
function visit59_144_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['144'][1].init(53, 100, '(!node.style || node.style[prop] == null) && Dom.attr(node, prop, undefined, 1) != null');
function visit58_144_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['137'][2].init(53, 12, 'r === \'auto\'');
function visit57_137_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['137'][1].init(47, 18, '!r || r === \'auto\'');
function visit56_137_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['128'][1].init(435, 15, 'type === \'attr\'');
function visit55_128_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['125'][1].init(310, 19, '!(type = self.type)');
function visit54_125_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['123'][1].init(24, 15, 'node[prop] || 0');
function visit53_123_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['122'][1].init(221, 15, 'self.isCustomFx');
function visit52_122_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['103'][1].init(45, 22, 'typeof to === \'number\'');
function visit51_103_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['102'][2].init(49, 24, 'typeof from === \'number\'');
function visit50_102_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['102'][1].init(49, 69, '(typeof from === \'number\') && (typeof to === \'number\')');
function visit49_102_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['84'][1].init(400, 20, 'self.type === \'attr\'');
function visit48_84_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['75'][1].init(21, 42, 'val === undefined');
function visit47_75_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['74'][1].init(779, 16, '!self.isCustomFx');
function visit46_74_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['70'][1].init(628, 14, 'propData.frame');
function visit45_70_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['62'][3].init(470, 9, 'pos === 0');
function visit44_62_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['62'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['62'][2].init(455, 11, 'from === to');
function visit43_62_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['62'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['62'][1].init(455, 24, 'from === to || pos === 0');
function visit42_62_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['56'][1].init(328, 17, 'pos === undefined');
function visit41_56_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['44'][1].init(17, 14, 'this.pos === 1');
function visit40_44_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['13'][1].init(69, 15, 'self.unit || \'\'');
function visit39_13_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/timer/fx.js'].functionData[0]++;
  _$jscoverage['/timer/fx.js'].lineData[7]++;
  var logger = S.getLogger('s/aim/timer/fx');
  _$jscoverage['/timer/fx.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/timer/fx.js'].lineData[10]++;
  function load(self, cfg) {
    _$jscoverage['/timer/fx.js'].functionData[1]++;
    _$jscoverage['/timer/fx.js'].lineData[11]++;
    S.mix(self, cfg);
    _$jscoverage['/timer/fx.js'].lineData[12]++;
    self.pos = 0;
    _$jscoverage['/timer/fx.js'].lineData[13]++;
    self.unit = visit39_13_1(self.unit || '');
  }
  _$jscoverage['/timer/fx.js'].lineData[21]++;
  function Fx(cfg) {
    _$jscoverage['/timer/fx.js'].functionData[2]++;
    _$jscoverage['/timer/fx.js'].lineData[22]++;
    load(this, cfg);
  }
  _$jscoverage['/timer/fx.js'].lineData[25]++;
  Fx.prototype = {
  isCustomFx: 0, 
  constructor: Fx, 
  load: function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[3]++;
  _$jscoverage['/timer/fx.js'].lineData[36]++;
  load(this, cfg);
}, 
  frame: function(pos) {
  _$jscoverage['/timer/fx.js'].functionData[4]++;
  _$jscoverage['/timer/fx.js'].lineData[44]++;
  if (visit40_44_1(this.pos === 1)) {
    _$jscoverage['/timer/fx.js'].lineData[45]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[48]++;
  var self = this, anim = self.anim, prop = self.prop, node = anim.node, from = self.from, propData = self.propData, to = self.to;
  _$jscoverage['/timer/fx.js'].lineData[56]++;
  if (visit41_56_1(pos === undefined)) {
    _$jscoverage['/timer/fx.js'].lineData[57]++;
    pos = getPos(anim, propData);
  }
  _$jscoverage['/timer/fx.js'].lineData[60]++;
  self.pos = pos;
  _$jscoverage['/timer/fx.js'].lineData[62]++;
  if (visit42_62_1(visit43_62_2(from === to) || visit44_62_3(pos === 0))) {
    _$jscoverage['/timer/fx.js'].lineData[63]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[66]++;
  var val = self.interpolate(from, to, self.pos);
  _$jscoverage['/timer/fx.js'].lineData[68]++;
  self.val = val;
  _$jscoverage['/timer/fx.js'].lineData[70]++;
  if (visit45_70_1(propData.frame)) {
    _$jscoverage['/timer/fx.js'].lineData[71]++;
    propData.frame.call(self, anim, self);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[74]++;
    if (visit46_74_1(!self.isCustomFx)) {
      _$jscoverage['/timer/fx.js'].lineData[75]++;
      if (visit47_75_1(val === undefined)) {
        _$jscoverage['/timer/fx.js'].lineData[77]++;
        self.pos = 1;
        _$jscoverage['/timer/fx.js'].lineData[78]++;
        val = to;
        _$jscoverage['/timer/fx.js'].lineData[79]++;
        logger.warn(prop + ' update directly ! : ' + val + ' : ' + from + ' : ' + to);
      } else {
        _$jscoverage['/timer/fx.js'].lineData[81]++;
        val += self.unit;
      }
      _$jscoverage['/timer/fx.js'].lineData[83]++;
      self.val = val;
      _$jscoverage['/timer/fx.js'].lineData[84]++;
      if (visit48_84_1(self.type === 'attr')) {
        _$jscoverage['/timer/fx.js'].lineData[85]++;
        Dom.attr(node, prop, val, 1);
      } else {
        _$jscoverage['/timer/fx.js'].lineData[87]++;
        Dom.css(node, prop, val);
      }
    }
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/fx.js'].functionData[5]++;
  _$jscoverage['/timer/fx.js'].lineData[102]++;
  if (visit49_102_1((visit50_102_2(typeof from === 'number')) && (visit51_103_1(typeof to === 'number')))) {
    _$jscoverage['/timer/fx.js'].lineData[104]++;
    return Math.round((from + (to - from) * pos) * 1e5) / 1e5;
  } else {
    _$jscoverage['/timer/fx.js'].lineData[106]++;
    return undefined;
  }
}, 
  cur: function() {
  _$jscoverage['/timer/fx.js'].functionData[6]++;
  _$jscoverage['/timer/fx.js'].lineData[115]++;
  var self = this, prop = self.prop, type, parsed, r, node = self.anim.node;
  _$jscoverage['/timer/fx.js'].lineData[122]++;
  if (visit52_122_1(self.isCustomFx)) {
    _$jscoverage['/timer/fx.js'].lineData[123]++;
    return visit53_123_1(node[prop] || 0);
  }
  _$jscoverage['/timer/fx.js'].lineData[125]++;
  if (visit54_125_1(!(type = self.type))) {
    _$jscoverage['/timer/fx.js'].lineData[126]++;
    type = self.type = isAttr(node, prop) ? 'attr' : 'css';
  }
  _$jscoverage['/timer/fx.js'].lineData[128]++;
  if (visit55_128_1(type === 'attr')) {
    _$jscoverage['/timer/fx.js'].lineData[129]++;
    r = Dom.attr(node, prop, undefined, 1);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[131]++;
    r = Dom.css(node, prop);
  }
  _$jscoverage['/timer/fx.js'].lineData[136]++;
  return isNaN(parsed = parseFloat(r)) ? visit56_137_1(!r || visit57_137_2(r === 'auto')) ? 0 : r : parsed;
}};
  _$jscoverage['/timer/fx.js'].lineData[142]++;
  function isAttr(node, prop) {
    _$jscoverage['/timer/fx.js'].functionData[7]++;
    _$jscoverage['/timer/fx.js'].lineData[144]++;
    if (visit58_144_1((visit59_144_2(!node.style || visit60_144_3(node.style[prop] == null))) && visit61_145_1(Dom.attr(node, prop, undefined, 1) != null))) {
      _$jscoverage['/timer/fx.js'].lineData[146]++;
      return 1;
    }
    _$jscoverage['/timer/fx.js'].lineData[148]++;
    return 0;
  }
  _$jscoverage['/timer/fx.js'].lineData[151]++;
  function getPos(anim, propData) {
    _$jscoverage['/timer/fx.js'].functionData[8]++;
    _$jscoverage['/timer/fx.js'].lineData[152]++;
    var t = S.now(), runTime, startTime = anim.startTime, delay = propData.delay, duration = propData.duration;
    _$jscoverage['/timer/fx.js'].lineData[157]++;
    runTime = t - startTime - delay;
    _$jscoverage['/timer/fx.js'].lineData[158]++;
    if (visit62_158_1(runTime <= 0)) {
      _$jscoverage['/timer/fx.js'].lineData[159]++;
      return 0;
    } else {
      _$jscoverage['/timer/fx.js'].lineData[160]++;
      if (visit63_160_1(runTime >= duration)) {
        _$jscoverage['/timer/fx.js'].lineData[161]++;
        return 1;
      } else {
        _$jscoverage['/timer/fx.js'].lineData[163]++;
        return propData.easing(runTime / duration);
      }
    }
  }
  _$jscoverage['/timer/fx.js'].lineData[167]++;
  Fx.Factories = {};
  _$jscoverage['/timer/fx.js'].lineData[168]++;
  Fx.FxTypes = {};
  _$jscoverage['/timer/fx.js'].lineData[170]++;
  Fx.getFx = function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[9]++;
  _$jscoverage['/timer/fx.js'].lineData[171]++;
  var Constructor = Fx, fxType, SubClass;
  _$jscoverage['/timer/fx.js'].lineData[174]++;
  if ((fxType = cfg.fxType)) {
    _$jscoverage['/timer/fx.js'].lineData[175]++;
    Constructor = Fx.FxTypes[fxType];
  } else {
    _$jscoverage['/timer/fx.js'].lineData[177]++;
    if (visit64_177_1(!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop]))) {
      _$jscoverage['/timer/fx.js'].lineData[178]++;
      Constructor = SubClass;
    }
  }
  _$jscoverage['/timer/fx.js'].lineData[180]++;
  return new Constructor(cfg);
};
  _$jscoverage['/timer/fx.js'].lineData[183]++;
  return Fx;
});
