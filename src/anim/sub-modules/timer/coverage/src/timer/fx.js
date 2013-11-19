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
  _$jscoverage['/timer/fx.js'].lineData[11] = 0;
  _$jscoverage['/timer/fx.js'].lineData[12] = 0;
  _$jscoverage['/timer/fx.js'].lineData[13] = 0;
  _$jscoverage['/timer/fx.js'].lineData[14] = 0;
  _$jscoverage['/timer/fx.js'].lineData[22] = 0;
  _$jscoverage['/timer/fx.js'].lineData[23] = 0;
  _$jscoverage['/timer/fx.js'].lineData[26] = 0;
  _$jscoverage['/timer/fx.js'].lineData[37] = 0;
  _$jscoverage['/timer/fx.js'].lineData[45] = 0;
  _$jscoverage['/timer/fx.js'].lineData[46] = 0;
  _$jscoverage['/timer/fx.js'].lineData[49] = 0;
  _$jscoverage['/timer/fx.js'].lineData[57] = 0;
  _$jscoverage['/timer/fx.js'].lineData[58] = 0;
  _$jscoverage['/timer/fx.js'].lineData[61] = 0;
  _$jscoverage['/timer/fx.js'].lineData[63] = 0;
  _$jscoverage['/timer/fx.js'].lineData[64] = 0;
  _$jscoverage['/timer/fx.js'].lineData[67] = 0;
  _$jscoverage['/timer/fx.js'].lineData[69] = 0;
  _$jscoverage['/timer/fx.js'].lineData[71] = 0;
  _$jscoverage['/timer/fx.js'].lineData[72] = 0;
  _$jscoverage['/timer/fx.js'].lineData[75] = 0;
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
  _$jscoverage['/timer/fx.js'].lineData[178] = 0;
  _$jscoverage['/timer/fx.js'].lineData[179] = 0;
  _$jscoverage['/timer/fx.js'].lineData[181] = 0;
  _$jscoverage['/timer/fx.js'].lineData[184] = 0;
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
  _$jscoverage['/timer/fx.js'].branchData['14'] = [];
  _$jscoverage['/timer/fx.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['45'] = [];
  _$jscoverage['/timer/fx.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['57'] = [];
  _$jscoverage['/timer/fx.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['63'] = [];
  _$jscoverage['/timer/fx.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['63'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['63'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['71'] = [];
  _$jscoverage['/timer/fx.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['75'] = [];
  _$jscoverage['/timer/fx.js'].branchData['75'][1] = new BranchData();
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
  _$jscoverage['/timer/fx.js'].branchData['175'] = [];
  _$jscoverage['/timer/fx.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['178'] = [];
  _$jscoverage['/timer/fx.js'].branchData['178'][1] = new BranchData();
}
_$jscoverage['/timer/fx.js'].branchData['178'][1].init(182, 54, '!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop])');
function visit69_178_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['175'][1].init(85, 19, 'fxType = cfg.fxType');
function visit68_175_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['161'][1].init(276, 19, 'runTime >= duration');
function visit67_161_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['159'][1].init(218, 12, 'runTime <= 0');
function visit66_159_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['146'][1].init(57, 42, 'Dom.attr(node, prop, undefined, 1) != null');
function visit65_146_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['145'][3].init(68, 26, 'node.style[prop] == null');
function visit64_145_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['145'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['145'][2].init(53, 41, '!node.style || node.style[prop] == null');
function visit63_145_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['145'][1].init(53, 100, '(!node.style || node.style[prop] == null) && Dom.attr(node, prop, undefined, 1) != null');
function visit62_145_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['138'][2].init(53, 12, 'r === \'auto\'');
function visit61_138_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['138'][1].init(47, 18, '!r || r === \'auto\'');
function visit60_138_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['129'][1].init(435, 14, 'type == \'attr\'');
function visit59_129_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['126'][1].init(310, 19, '!(type = self.type)');
function visit58_126_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['124'][1].init(24, 15, 'node[prop] || 0');
function visit57_124_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['123'][1].init(221, 15, 'self.isCustomFx');
function visit56_123_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['104'][1].init(45, 22, 'typeof to === \'number\'');
function visit55_104_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['103'][2].init(49, 24, 'typeof from === \'number\'');
function visit54_103_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['103'][1].init(49, 69, '(typeof from === \'number\') && (typeof to === \'number\')');
function visit53_103_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['85'][1].init(400, 19, 'self.type == \'attr\'');
function visit52_85_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['76'][1].init(21, 42, 'val === undefined');
function visit51_76_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['75'][1].init(779, 16, '!self.isCustomFx');
function visit50_75_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['71'][1].init(628, 14, 'propData.frame');
function visit49_71_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['63'][3].init(470, 9, 'pos === 0');
function visit48_63_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['63'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['63'][2].init(455, 11, 'from === to');
function visit47_63_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['63'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['63'][1].init(455, 24, 'from === to || pos === 0');
function visit46_63_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['57'][1].init(328, 17, 'pos === undefined');
function visit45_57_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['45'][1].init(17, 14, 'this.pos === 1');
function visit44_45_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['14'][1].init(69, 15, 'self.unit || \'\'');
function visit43_14_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/timer/fx.js'].functionData[0]++;
  _$jscoverage['/timer/fx.js'].lineData[7]++;
  var module = this;
  _$jscoverage['/timer/fx.js'].lineData[8]++;
  var logger = S.getLogger('s/aim/timer/fx');
  _$jscoverage['/timer/fx.js'].lineData[9]++;
  var Dom = module.require('dom');
  _$jscoverage['/timer/fx.js'].lineData[11]++;
  function load(self, cfg) {
    _$jscoverage['/timer/fx.js'].functionData[1]++;
    _$jscoverage['/timer/fx.js'].lineData[12]++;
    S.mix(self, cfg);
    _$jscoverage['/timer/fx.js'].lineData[13]++;
    self.pos = 0;
    _$jscoverage['/timer/fx.js'].lineData[14]++;
    self.unit = visit43_14_1(self.unit || '');
  }
  _$jscoverage['/timer/fx.js'].lineData[22]++;
  function Fx(cfg) {
    _$jscoverage['/timer/fx.js'].functionData[2]++;
    _$jscoverage['/timer/fx.js'].lineData[23]++;
    load(this, cfg);
  }
  _$jscoverage['/timer/fx.js'].lineData[26]++;
  Fx.prototype = {
  isCustomFx: 0, 
  constructor: Fx, 
  load: function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[3]++;
  _$jscoverage['/timer/fx.js'].lineData[37]++;
  load(this, cfg);
}, 
  frame: function(pos) {
  _$jscoverage['/timer/fx.js'].functionData[4]++;
  _$jscoverage['/timer/fx.js'].lineData[45]++;
  if (visit44_45_1(this.pos === 1)) {
    _$jscoverage['/timer/fx.js'].lineData[46]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[49]++;
  var self = this, anim = self.anim, prop = self.prop, node = anim.node, from = self.from, propData = self.propData, to = self.to;
  _$jscoverage['/timer/fx.js'].lineData[57]++;
  if (visit45_57_1(pos === undefined)) {
    _$jscoverage['/timer/fx.js'].lineData[58]++;
    pos = getPos(anim, propData);
  }
  _$jscoverage['/timer/fx.js'].lineData[61]++;
  self.pos = pos;
  _$jscoverage['/timer/fx.js'].lineData[63]++;
  if (visit46_63_1(visit47_63_2(from === to) || visit48_63_3(pos === 0))) {
    _$jscoverage['/timer/fx.js'].lineData[64]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[67]++;
  var val = self.interpolate(from, to, self.pos);
  _$jscoverage['/timer/fx.js'].lineData[69]++;
  self.val = val;
  _$jscoverage['/timer/fx.js'].lineData[71]++;
  if (visit49_71_1(propData.frame)) {
    _$jscoverage['/timer/fx.js'].lineData[72]++;
    propData.frame.call(self, anim, self);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[75]++;
    if (visit50_75_1(!self.isCustomFx)) {
      _$jscoverage['/timer/fx.js'].lineData[76]++;
      if (visit51_76_1(val === undefined)) {
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
      if (visit52_85_1(self.type == 'attr')) {
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
  if (visit53_103_1((visit54_103_2(typeof from === 'number')) && (visit55_104_1(typeof to === 'number')))) {
    _$jscoverage['/timer/fx.js'].lineData[105]++;
    return Math.round((from + (to - from) * pos) * 1e5) / 1e5;
  } else {
    _$jscoverage['/timer/fx.js'].lineData[107]++;
    return undefined;
  }
}, 
  cur: function() {
  _$jscoverage['/timer/fx.js'].functionData[6]++;
  _$jscoverage['/timer/fx.js'].lineData[116]++;
  var self = this, prop = self.prop, type, parsed, r, node = self.anim.node;
  _$jscoverage['/timer/fx.js'].lineData[123]++;
  if (visit56_123_1(self.isCustomFx)) {
    _$jscoverage['/timer/fx.js'].lineData[124]++;
    return visit57_124_1(node[prop] || 0);
  }
  _$jscoverage['/timer/fx.js'].lineData[126]++;
  if (visit58_126_1(!(type = self.type))) {
    _$jscoverage['/timer/fx.js'].lineData[127]++;
    type = self.type = isAttr(node, prop) ? 'attr' : 'css';
  }
  _$jscoverage['/timer/fx.js'].lineData[129]++;
  if (visit59_129_1(type == 'attr')) {
    _$jscoverage['/timer/fx.js'].lineData[130]++;
    r = Dom.attr(node, prop, undefined, 1);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[132]++;
    r = Dom.css(node, prop);
  }
  _$jscoverage['/timer/fx.js'].lineData[137]++;
  return isNaN(parsed = parseFloat(r)) ? visit60_138_1(!r || visit61_138_2(r === 'auto')) ? 0 : r : parsed;
}};
  _$jscoverage['/timer/fx.js'].lineData[143]++;
  function isAttr(node, prop) {
    _$jscoverage['/timer/fx.js'].functionData[7]++;
    _$jscoverage['/timer/fx.js'].lineData[145]++;
    if (visit62_145_1((visit63_145_2(!node.style || visit64_145_3(node.style[prop] == null))) && visit65_146_1(Dom.attr(node, prop, undefined, 1) != null))) {
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
    var t = S.now(), runTime, startTime = anim.startTime, delay = propData.delay, duration = propData.duration;
    _$jscoverage['/timer/fx.js'].lineData[158]++;
    runTime = t - startTime - delay;
    _$jscoverage['/timer/fx.js'].lineData[159]++;
    if (visit66_159_1(runTime <= 0)) {
      _$jscoverage['/timer/fx.js'].lineData[160]++;
      return 0;
    } else {
      _$jscoverage['/timer/fx.js'].lineData[161]++;
      if (visit67_161_1(runTime >= duration)) {
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
  if (visit68_175_1(fxType = cfg.fxType)) {
    _$jscoverage['/timer/fx.js'].lineData[176]++;
    Constructor = Fx.FxTypes[fxType];
  } else {
    _$jscoverage['/timer/fx.js'].lineData[178]++;
    if (visit69_178_1(!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop]))) {
      _$jscoverage['/timer/fx.js'].lineData[179]++;
      Constructor = SubClass;
    }
  }
  _$jscoverage['/timer/fx.js'].lineData[181]++;
  return new Constructor(cfg);
};
  _$jscoverage['/timer/fx.js'].lineData[184]++;
  return Fx;
});
