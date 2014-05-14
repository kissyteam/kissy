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
  _$jscoverage['/timer/fx.js'].lineData[9] = 0;
  _$jscoverage['/timer/fx.js'].lineData[10] = 0;
  _$jscoverage['/timer/fx.js'].lineData[12] = 0;
  _$jscoverage['/timer/fx.js'].lineData[13] = 0;
  _$jscoverage['/timer/fx.js'].lineData[14] = 0;
  _$jscoverage['/timer/fx.js'].lineData[15] = 0;
  _$jscoverage['/timer/fx.js'].lineData[23] = 0;
  _$jscoverage['/timer/fx.js'].lineData[24] = 0;
  _$jscoverage['/timer/fx.js'].lineData[27] = 0;
  _$jscoverage['/timer/fx.js'].lineData[38] = 0;
  _$jscoverage['/timer/fx.js'].lineData[46] = 0;
  _$jscoverage['/timer/fx.js'].lineData[47] = 0;
  _$jscoverage['/timer/fx.js'].lineData[50] = 0;
  _$jscoverage['/timer/fx.js'].lineData[58] = 0;
  _$jscoverage['/timer/fx.js'].lineData[59] = 0;
  _$jscoverage['/timer/fx.js'].lineData[62] = 0;
  _$jscoverage['/timer/fx.js'].lineData[64] = 0;
  _$jscoverage['/timer/fx.js'].lineData[65] = 0;
  _$jscoverage['/timer/fx.js'].lineData[68] = 0;
  _$jscoverage['/timer/fx.js'].lineData[70] = 0;
  _$jscoverage['/timer/fx.js'].lineData[72] = 0;
  _$jscoverage['/timer/fx.js'].lineData[73] = 0;
  _$jscoverage['/timer/fx.js'].lineData[74] = 0;
  _$jscoverage['/timer/fx.js'].lineData[76] = 0;
  _$jscoverage['/timer/fx.js'].lineData[78] = 0;
  _$jscoverage['/timer/fx.js'].lineData[79] = 0;
  _$jscoverage['/timer/fx.js'].lineData[80] = 0;
  _$jscoverage['/timer/fx.js'].lineData[82] = 0;
  _$jscoverage['/timer/fx.js'].lineData[84] = 0;
  _$jscoverage['/timer/fx.js'].lineData[85] = 0;
  _$jscoverage['/timer/fx.js'].lineData[86] = 0;
  _$jscoverage['/timer/fx.js'].lineData[88] = 0;
  _$jscoverage['/timer/fx.js'].lineData[103] = 0;
  _$jscoverage['/timer/fx.js'].lineData[105] = 0;
  _$jscoverage['/timer/fx.js'].lineData[107] = 0;
  _$jscoverage['/timer/fx.js'].lineData[116] = 0;
  _$jscoverage['/timer/fx.js'].lineData[123] = 0;
  _$jscoverage['/timer/fx.js'].lineData[124] = 0;
  _$jscoverage['/timer/fx.js'].lineData[126] = 0;
  _$jscoverage['/timer/fx.js'].lineData[127] = 0;
  _$jscoverage['/timer/fx.js'].lineData[129] = 0;
  _$jscoverage['/timer/fx.js'].lineData[130] = 0;
  _$jscoverage['/timer/fx.js'].lineData[132] = 0;
  _$jscoverage['/timer/fx.js'].lineData[137] = 0;
  _$jscoverage['/timer/fx.js'].lineData[143] = 0;
  _$jscoverage['/timer/fx.js'].lineData[145] = 0;
  _$jscoverage['/timer/fx.js'].lineData[147] = 0;
  _$jscoverage['/timer/fx.js'].lineData[149] = 0;
  _$jscoverage['/timer/fx.js'].lineData[152] = 0;
  _$jscoverage['/timer/fx.js'].lineData[153] = 0;
  _$jscoverage['/timer/fx.js'].lineData[158] = 0;
  _$jscoverage['/timer/fx.js'].lineData[159] = 0;
  _$jscoverage['/timer/fx.js'].lineData[160] = 0;
  _$jscoverage['/timer/fx.js'].lineData[161] = 0;
  _$jscoverage['/timer/fx.js'].lineData[162] = 0;
  _$jscoverage['/timer/fx.js'].lineData[164] = 0;
  _$jscoverage['/timer/fx.js'].lineData[168] = 0;
  _$jscoverage['/timer/fx.js'].lineData[169] = 0;
  _$jscoverage['/timer/fx.js'].lineData[171] = 0;
  _$jscoverage['/timer/fx.js'].lineData[172] = 0;
  _$jscoverage['/timer/fx.js'].lineData[175] = 0;
  _$jscoverage['/timer/fx.js'].lineData[176] = 0;
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
  _$jscoverage['/timer/fx.js'].branchData['15'] = [];
  _$jscoverage['/timer/fx.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['46'] = [];
  _$jscoverage['/timer/fx.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['58'] = [];
  _$jscoverage['/timer/fx.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['64'] = [];
  _$jscoverage['/timer/fx.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['64'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['64'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['72'] = [];
  _$jscoverage['/timer/fx.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['74'] = [];
  _$jscoverage['/timer/fx.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['76'] = [];
  _$jscoverage['/timer/fx.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['85'] = [];
  _$jscoverage['/timer/fx.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['103'] = [];
  _$jscoverage['/timer/fx.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['104'] = [];
  _$jscoverage['/timer/fx.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['123'] = [];
  _$jscoverage['/timer/fx.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['124'] = [];
  _$jscoverage['/timer/fx.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['126'] = [];
  _$jscoverage['/timer/fx.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['129'] = [];
  _$jscoverage['/timer/fx.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['138'] = [];
  _$jscoverage['/timer/fx.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['145'] = [];
  _$jscoverage['/timer/fx.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['145'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['146'] = [];
  _$jscoverage['/timer/fx.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['159'] = [];
  _$jscoverage['/timer/fx.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['161'] = [];
  _$jscoverage['/timer/fx.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['177'] = [];
  _$jscoverage['/timer/fx.js'].branchData['177'][1] = new BranchData();
}
_$jscoverage['/timer/fx.js'].branchData['177'][1].init(182, 54, '!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop])');
function visit64_177_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['161'][1].init(288, 19, 'runTime >= duration');
function visit63_161_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['159'][1].init(228, 12, 'runTime <= 0');
function visit62_159_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['146'][1].init(58, 38, 'Dom.attr(node, prop, undef, 1) != null');
function visit61_146_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['145'][3].init(70, 26, 'node.style[prop] == null');
function visit60_145_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['145'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['145'][2].init(55, 41, '!node.style || node.style[prop] == null');
function visit59_145_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['145'][1].init(55, 97, '(!node.style || node.style[prop] == null) && Dom.attr(node, prop, undef, 1) != null');
function visit58_145_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['138'][2].init(58, 12, 'r === \'auto\'');
function visit57_138_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['138'][1].init(52, 18, '!r || r === \'auto\'');
function visit56_138_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['129'][1].init(449, 15, 'type === \'attr\'');
function visit55_129_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['126'][1].init(321, 19, '!(type = self.type)');
function visit54_126_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['124'][1].init(25, 15, 'node[prop] || 0');
function visit53_124_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['123'][1].init(229, 15, 'self.isCustomFx');
function visit52_123_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['104'][1].init(46, 22, 'typeof to === \'number\'');
function visit51_104_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['103'][2].init(51, 24, 'typeof from === \'number\'');
function visit50_103_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['103'][1].init(51, 70, '(typeof from === \'number\') && (typeof to === \'number\')');
function visit49_103_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['85'][1].init(428, 20, 'self.type === \'attr\'');
function visit48_85_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['76'][1].init(69, 13, 'val === undef');
function visit47_76_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['74'][1].init(750, 16, '!self.isCustomFx');
function visit46_74_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['72'][1].init(651, 14, 'propData.frame');
function visit45_72_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['64'][3].init(485, 9, 'pos === 0');
function visit44_64_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['64'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['64'][2].init(470, 11, 'from === to');
function visit43_64_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['64'][1].init(470, 24, 'from === to || pos === 0');
function visit42_64_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['58'][1].init(341, 13, 'pos === undef');
function visit41_58_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['46'][1].init(18, 14, 'this.pos === 1');
function visit40_46_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['15'][1].init(75, 15, 'self.unit || \'\'');
function visit39_15_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/timer/fx.js'].functionData[0]++;
  _$jscoverage['/timer/fx.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/timer/fx.js'].lineData[8]++;
  var logger = S.getLogger('s/aim/timer/fx');
  _$jscoverage['/timer/fx.js'].lineData[9]++;
  var Dom = require('dom');
  _$jscoverage['/timer/fx.js'].lineData[10]++;
  var undef;
  _$jscoverage['/timer/fx.js'].lineData[12]++;
  function load(self, cfg) {
    _$jscoverage['/timer/fx.js'].functionData[1]++;
    _$jscoverage['/timer/fx.js'].lineData[13]++;
    util.mix(self, cfg);
    _$jscoverage['/timer/fx.js'].lineData[14]++;
    self.pos = 0;
    _$jscoverage['/timer/fx.js'].lineData[15]++;
    self.unit = visit39_15_1(self.unit || '');
  }
  _$jscoverage['/timer/fx.js'].lineData[23]++;
  function Fx(cfg) {
    _$jscoverage['/timer/fx.js'].functionData[2]++;
    _$jscoverage['/timer/fx.js'].lineData[24]++;
    load(this, cfg);
  }
  _$jscoverage['/timer/fx.js'].lineData[27]++;
  Fx.prototype = {
  isCustomFx: 0, 
  constructor: Fx, 
  load: function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[3]++;
  _$jscoverage['/timer/fx.js'].lineData[38]++;
  load(this, cfg);
}, 
  frame: function(pos) {
  _$jscoverage['/timer/fx.js'].functionData[4]++;
  _$jscoverage['/timer/fx.js'].lineData[46]++;
  if (visit40_46_1(this.pos === 1)) {
    _$jscoverage['/timer/fx.js'].lineData[47]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[50]++;
  var self = this, anim = self.anim, prop = self.prop, node = anim.node, from = self.from, propData = self.propData, to = self.to;
  _$jscoverage['/timer/fx.js'].lineData[58]++;
  if (visit41_58_1(pos === undef)) {
    _$jscoverage['/timer/fx.js'].lineData[59]++;
    pos = getPos(anim, propData);
  }
  _$jscoverage['/timer/fx.js'].lineData[62]++;
  self.pos = pos;
  _$jscoverage['/timer/fx.js'].lineData[64]++;
  if (visit42_64_1(visit43_64_2(from === to) || visit44_64_3(pos === 0))) {
    _$jscoverage['/timer/fx.js'].lineData[65]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[68]++;
  var val = self.interpolate(from, to, self.pos);
  _$jscoverage['/timer/fx.js'].lineData[70]++;
  self.val = val;
  _$jscoverage['/timer/fx.js'].lineData[72]++;
  if (visit45_72_1(propData.frame)) {
    _$jscoverage['/timer/fx.js'].lineData[73]++;
    propData.frame.call(self, anim, self);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[74]++;
    if (visit46_74_1(!self.isCustomFx)) {
      _$jscoverage['/timer/fx.js'].lineData[76]++;
      if (visit47_76_1(val === undef)) {
        _$jscoverage['/timer/fx.js'].lineData[78]++;
        self.pos = 1;
        _$jscoverage['/timer/fx.js'].lineData[79]++;
        val = to;
        _$jscoverage['/timer/fx.js'].lineData[80]++;
        logger.warn(prop + ' update directly ! : ' + val + ' : ' + from + ' : ' + to);
      } else {
        _$jscoverage['/timer/fx.js'].lineData[82]++;
        val += self.unit;
      }
      _$jscoverage['/timer/fx.js'].lineData[84]++;
      self.val = val;
      _$jscoverage['/timer/fx.js'].lineData[85]++;
      if (visit48_85_1(self.type === 'attr')) {
        _$jscoverage['/timer/fx.js'].lineData[86]++;
        Dom.attr(node, prop, val, 1);
      } else {
        _$jscoverage['/timer/fx.js'].lineData[88]++;
        Dom.css(node, prop, val);
      }
    }
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/fx.js'].functionData[5]++;
  _$jscoverage['/timer/fx.js'].lineData[103]++;
  if (visit49_103_1((visit50_103_2(typeof from === 'number')) && (visit51_104_1(typeof to === 'number')))) {
    _$jscoverage['/timer/fx.js'].lineData[105]++;
    return Math.round((from + (to - from) * pos) * 1e5) / 1e5;
  } else {
    _$jscoverage['/timer/fx.js'].lineData[107]++;
    return null;
  }
}, 
  cur: function() {
  _$jscoverage['/timer/fx.js'].functionData[6]++;
  _$jscoverage['/timer/fx.js'].lineData[116]++;
  var self = this, prop = self.prop, type, parsed, r, node = self.anim.node;
  _$jscoverage['/timer/fx.js'].lineData[123]++;
  if (visit52_123_1(self.isCustomFx)) {
    _$jscoverage['/timer/fx.js'].lineData[124]++;
    return visit53_124_1(node[prop] || 0);
  }
  _$jscoverage['/timer/fx.js'].lineData[126]++;
  if (visit54_126_1(!(type = self.type))) {
    _$jscoverage['/timer/fx.js'].lineData[127]++;
    type = self.type = isAttr(node, prop) ? 'attr' : 'css';
  }
  _$jscoverage['/timer/fx.js'].lineData[129]++;
  if (visit55_129_1(type === 'attr')) {
    _$jscoverage['/timer/fx.js'].lineData[130]++;
    r = Dom.attr(node, prop, undef, 1);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[132]++;
    r = Dom.css(node, prop);
  }
  _$jscoverage['/timer/fx.js'].lineData[137]++;
  return isNaN(parsed = parseFloat(r)) ? visit56_138_1(!r || visit57_138_2(r === 'auto')) ? 0 : r : parsed;
}};
  _$jscoverage['/timer/fx.js'].lineData[143]++;
  function isAttr(node, prop) {
    _$jscoverage['/timer/fx.js'].functionData[7]++;
    _$jscoverage['/timer/fx.js'].lineData[145]++;
    if (visit58_145_1((visit59_145_2(!node.style || visit60_145_3(node.style[prop] == null))) && visit61_146_1(Dom.attr(node, prop, undef, 1) != null))) {
      _$jscoverage['/timer/fx.js'].lineData[147]++;
      return 1;
    }
    _$jscoverage['/timer/fx.js'].lineData[149]++;
    return 0;
  }
  _$jscoverage['/timer/fx.js'].lineData[152]++;
  function getPos(anim, propData) {
    _$jscoverage['/timer/fx.js'].functionData[8]++;
    _$jscoverage['/timer/fx.js'].lineData[153]++;
    var t = util.now(), runTime, startTime = anim.startTime, delay = propData.delay, duration = propData.duration;
    _$jscoverage['/timer/fx.js'].lineData[158]++;
    runTime = t - startTime - delay;
    _$jscoverage['/timer/fx.js'].lineData[159]++;
    if (visit62_159_1(runTime <= 0)) {
      _$jscoverage['/timer/fx.js'].lineData[160]++;
      return 0;
    } else {
      _$jscoverage['/timer/fx.js'].lineData[161]++;
      if (visit63_161_1(runTime >= duration)) {
        _$jscoverage['/timer/fx.js'].lineData[162]++;
        return 1;
      } else {
        _$jscoverage['/timer/fx.js'].lineData[164]++;
        return propData.easing(runTime / duration);
      }
    }
  }
  _$jscoverage['/timer/fx.js'].lineData[168]++;
  Fx.Factories = {};
  _$jscoverage['/timer/fx.js'].lineData[169]++;
  Fx.FxTypes = {};
  _$jscoverage['/timer/fx.js'].lineData[171]++;
  Fx.getFx = function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[9]++;
  _$jscoverage['/timer/fx.js'].lineData[172]++;
  var Constructor = Fx, fxType, SubClass;
  _$jscoverage['/timer/fx.js'].lineData[175]++;
  if ((fxType = cfg.fxType)) {
    _$jscoverage['/timer/fx.js'].lineData[176]++;
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
