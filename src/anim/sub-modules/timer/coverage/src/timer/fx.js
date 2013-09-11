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
  _$jscoverage['/timer/fx.js'].lineData[11] = 0;
  _$jscoverage['/timer/fx.js'].lineData[19] = 0;
  _$jscoverage['/timer/fx.js'].lineData[20] = 0;
  _$jscoverage['/timer/fx.js'].lineData[23] = 0;
  _$jscoverage['/timer/fx.js'].lineData[34] = 0;
  _$jscoverage['/timer/fx.js'].lineData[42] = 0;
  _$jscoverage['/timer/fx.js'].lineData[43] = 0;
  _$jscoverage['/timer/fx.js'].lineData[46] = 0;
  _$jscoverage['/timer/fx.js'].lineData[54] = 0;
  _$jscoverage['/timer/fx.js'].lineData[55] = 0;
  _$jscoverage['/timer/fx.js'].lineData[58] = 0;
  _$jscoverage['/timer/fx.js'].lineData[60] = 0;
  _$jscoverage['/timer/fx.js'].lineData[61] = 0;
  _$jscoverage['/timer/fx.js'].lineData[64] = 0;
  _$jscoverage['/timer/fx.js'].lineData[66] = 0;
  _$jscoverage['/timer/fx.js'].lineData[68] = 0;
  _$jscoverage['/timer/fx.js'].lineData[69] = 0;
  _$jscoverage['/timer/fx.js'].lineData[72] = 0;
  _$jscoverage['/timer/fx.js'].lineData[73] = 0;
  _$jscoverage['/timer/fx.js'].lineData[75] = 0;
  _$jscoverage['/timer/fx.js'].lineData[76] = 0;
  _$jscoverage['/timer/fx.js'].lineData[77] = 0;
  _$jscoverage['/timer/fx.js'].lineData[79] = 0;
  _$jscoverage['/timer/fx.js'].lineData[81] = 0;
  _$jscoverage['/timer/fx.js'].lineData[82] = 0;
  _$jscoverage['/timer/fx.js'].lineData[83] = 0;
  _$jscoverage['/timer/fx.js'].lineData[85] = 0;
  _$jscoverage['/timer/fx.js'].lineData[100] = 0;
  _$jscoverage['/timer/fx.js'].lineData[102] = 0;
  _$jscoverage['/timer/fx.js'].lineData[104] = 0;
  _$jscoverage['/timer/fx.js'].lineData[113] = 0;
  _$jscoverage['/timer/fx.js'].lineData[117] = 0;
  _$jscoverage['/timer/fx.js'].lineData[118] = 0;
  _$jscoverage['/timer/fx.js'].lineData[120] = 0;
  _$jscoverage['/timer/fx.js'].lineData[121] = 0;
  _$jscoverage['/timer/fx.js'].lineData[123] = 0;
  _$jscoverage['/timer/fx.js'].lineData[128] = 0;
  _$jscoverage['/timer/fx.js'].lineData[135] = 0;
  _$jscoverage['/timer/fx.js'].lineData[137] = 0;
  _$jscoverage['/timer/fx.js'].lineData[139] = 0;
  _$jscoverage['/timer/fx.js'].lineData[141] = 0;
  _$jscoverage['/timer/fx.js'].lineData[144] = 0;
  _$jscoverage['/timer/fx.js'].lineData[145] = 0;
  _$jscoverage['/timer/fx.js'].lineData[150] = 0;
  _$jscoverage['/timer/fx.js'].lineData[151] = 0;
  _$jscoverage['/timer/fx.js'].lineData[152] = 0;
  _$jscoverage['/timer/fx.js'].lineData[153] = 0;
  _$jscoverage['/timer/fx.js'].lineData[154] = 0;
  _$jscoverage['/timer/fx.js'].lineData[156] = 0;
  _$jscoverage['/timer/fx.js'].lineData[160] = 0;
  _$jscoverage['/timer/fx.js'].lineData[162] = 0;
  _$jscoverage['/timer/fx.js'].lineData[163] = 0;
  _$jscoverage['/timer/fx.js'].lineData[165] = 0;
  _$jscoverage['/timer/fx.js'].lineData[166] = 0;
  _$jscoverage['/timer/fx.js'].lineData[168] = 0;
  _$jscoverage['/timer/fx.js'].lineData[171] = 0;
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
  _$jscoverage['/timer/fx.js'].branchData['11'] = [];
  _$jscoverage['/timer/fx.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['42'] = [];
  _$jscoverage['/timer/fx.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['54'] = [];
  _$jscoverage['/timer/fx.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['60'] = [];
  _$jscoverage['/timer/fx.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['60'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['60'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['68'] = [];
  _$jscoverage['/timer/fx.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['72'] = [];
  _$jscoverage['/timer/fx.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['73'] = [];
  _$jscoverage['/timer/fx.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['82'] = [];
  _$jscoverage['/timer/fx.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['100'] = [];
  _$jscoverage['/timer/fx.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['101'] = [];
  _$jscoverage['/timer/fx.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['117'] = [];
  _$jscoverage['/timer/fx.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['118'] = [];
  _$jscoverage['/timer/fx.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['120'] = [];
  _$jscoverage['/timer/fx.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['129'] = [];
  _$jscoverage['/timer/fx.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['137'] = [];
  _$jscoverage['/timer/fx.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['137'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['138'] = [];
  _$jscoverage['/timer/fx.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['151'] = [];
  _$jscoverage['/timer/fx.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['153'] = [];
  _$jscoverage['/timer/fx.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['165'] = [];
  _$jscoverage['/timer/fx.js'].branchData['165'][1] = new BranchData();
}
_$jscoverage['/timer/fx.js'].branchData['165'][1].init(68, 54, '!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop])');
function visit67_165_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['153'][1].init(285, 19, 'runTime >= duration');
function visit66_153_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['151'][1].init(225, 12, 'runTime <= 0');
function visit65_151_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['138'][1].init(58, 42, 'Dom.attr(node, prop, undefined, 1) != null');
function visit64_138_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['137'][3].init(70, 26, 'node.style[prop] == null');
function visit63_137_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['137'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['137'][2].init(55, 41, '!node.style || node.style[prop] == null');
function visit62_137_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['137'][1].init(55, 101, '(!node.style || node.style[prop] == null) && Dom.attr(node, prop, undefined, 1) != null');
function visit61_137_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['129'][2].init(58, 12, 'r === \'auto\'');
function visit60_129_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['129'][1].init(52, 18, '!r || r === \'auto\'');
function visit59_129_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['120'][1].init(259, 18, 'isAttr(node, prop)');
function visit58_120_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['118'][1].init(25, 15, 'node[prop] || 0');
function visit57_118_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['117'][1].init(161, 15, 'self.isCustomFx');
function visit56_117_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['101'][1].init(46, 22, 'typeof to === \'number\'');
function visit55_101_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['100'][2].init(51, 24, 'typeof from === \'number\'');
function visit54_100_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['100'][1].init(51, 70, '(typeof from === \'number\') && (typeof to === \'number\')');
function visit53_100_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['82'][1].init(410, 18, 'isAttr(node, prop)');
function visit52_82_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['73'][1].init(22, 42, 'val === undefined');
function visit51_73_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['72'][1].init(810, 16, '!self.isCustomFx');
function visit50_72_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['68'][1].init(655, 14, 'propData.frame');
function visit49_68_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['60'][3].init(489, 9, 'pos === 0');
function visit48_60_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['60'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['60'][2].init(474, 11, 'from === to');
function visit47_60_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['60'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['60'][1].init(474, 24, 'from === to || pos === 0');
function visit46_60_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['54'][1].init(341, 17, 'pos === undefined');
function visit45_54_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['42'][1].init(18, 14, 'this.pos === 1');
function visit44_42_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['11'][1].init(72, 15, 'self.unit || \'\'');
function visit43_11_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].lineData[6]++;
KISSY.add('anim/timer/fx', function(S, Dom, undefined) {
  _$jscoverage['/timer/fx.js'].functionData[0]++;
  _$jscoverage['/timer/fx.js'].lineData[7]++;
  var logger = S.getLogger('s/aim/timer/fx');
  _$jscoverage['/timer/fx.js'].lineData[8]++;
  function load(self, cfg) {
    _$jscoverage['/timer/fx.js'].functionData[1]++;
    _$jscoverage['/timer/fx.js'].lineData[9]++;
    S.mix(self, cfg);
    _$jscoverage['/timer/fx.js'].lineData[10]++;
    self.pos = 0;
    _$jscoverage['/timer/fx.js'].lineData[11]++;
    self.unit = visit43_11_1(self.unit || '');
  }
  _$jscoverage['/timer/fx.js'].lineData[19]++;
  function Fx(cfg) {
    _$jscoverage['/timer/fx.js'].functionData[2]++;
    _$jscoverage['/timer/fx.js'].lineData[20]++;
    load(this, cfg);
  }
  _$jscoverage['/timer/fx.js'].lineData[23]++;
  Fx.prototype = {
  isCustomFx: 0, 
  constructor: Fx, 
  load: function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[3]++;
  _$jscoverage['/timer/fx.js'].lineData[34]++;
  load(this, cfg);
}, 
  frame: function(pos) {
  _$jscoverage['/timer/fx.js'].functionData[4]++;
  _$jscoverage['/timer/fx.js'].lineData[42]++;
  if (visit44_42_1(this.pos === 1)) {
    _$jscoverage['/timer/fx.js'].lineData[43]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[46]++;
  var self = this, anim = self.anim, prop = self.prop, node = anim.node, from = self.from, propData = self.propData, to = self.to;
  _$jscoverage['/timer/fx.js'].lineData[54]++;
  if (visit45_54_1(pos === undefined)) {
    _$jscoverage['/timer/fx.js'].lineData[55]++;
    pos = getPos(anim, propData);
  }
  _$jscoverage['/timer/fx.js'].lineData[58]++;
  self.pos = pos;
  _$jscoverage['/timer/fx.js'].lineData[60]++;
  if (visit46_60_1(visit47_60_2(from === to) || visit48_60_3(pos === 0))) {
    _$jscoverage['/timer/fx.js'].lineData[61]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[64]++;
  var val = self.interpolate(from, to, self.pos);
  _$jscoverage['/timer/fx.js'].lineData[66]++;
  self.val = val;
  _$jscoverage['/timer/fx.js'].lineData[68]++;
  if (visit49_68_1(propData.frame)) {
    _$jscoverage['/timer/fx.js'].lineData[69]++;
    propData.frame.call(self, anim, self);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[72]++;
    if (visit50_72_1(!self.isCustomFx)) {
      _$jscoverage['/timer/fx.js'].lineData[73]++;
      if (visit51_73_1(val === undefined)) {
        _$jscoverage['/timer/fx.js'].lineData[75]++;
        self.pos = 1;
        _$jscoverage['/timer/fx.js'].lineData[76]++;
        val = to;
        _$jscoverage['/timer/fx.js'].lineData[77]++;
        logger.warn(prop + ' update directly ! : ' + val + ' : ' + from + ' : ' + to);
      } else {
        _$jscoverage['/timer/fx.js'].lineData[79]++;
        val += self.unit;
      }
      _$jscoverage['/timer/fx.js'].lineData[81]++;
      self.val = val;
      _$jscoverage['/timer/fx.js'].lineData[82]++;
      if (visit52_82_1(isAttr(node, prop))) {
        _$jscoverage['/timer/fx.js'].lineData[83]++;
        Dom.attr(node, prop, val, 1);
      } else {
        _$jscoverage['/timer/fx.js'].lineData[85]++;
        Dom.css(node, prop, val);
      }
    }
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/fx.js'].functionData[5]++;
  _$jscoverage['/timer/fx.js'].lineData[100]++;
  if (visit53_100_1((visit54_100_2(typeof from === 'number')) && (visit55_101_1(typeof to === 'number')))) {
    _$jscoverage['/timer/fx.js'].lineData[102]++;
    return Math.round((from + (to - from) * pos) * 1e5) / 1e5;
  } else {
    _$jscoverage['/timer/fx.js'].lineData[104]++;
    return undefined;
  }
}, 
  cur: function() {
  _$jscoverage['/timer/fx.js'].functionData[6]++;
  _$jscoverage['/timer/fx.js'].lineData[113]++;
  var self = this, prop = self.prop, node = self.anim.node;
  _$jscoverage['/timer/fx.js'].lineData[117]++;
  if (visit56_117_1(self.isCustomFx)) {
    _$jscoverage['/timer/fx.js'].lineData[118]++;
    return visit57_118_1(node[prop] || 0);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[120]++;
    if (visit58_120_1(isAttr(node, prop))) {
      _$jscoverage['/timer/fx.js'].lineData[121]++;
      return Dom.attr(node, prop, undefined, 1);
    } else {
      _$jscoverage['/timer/fx.js'].lineData[123]++;
      var parsed, r = Dom.css(node, prop);
      _$jscoverage['/timer/fx.js'].lineData[128]++;
      return isNaN(parsed = parseFloat(r)) ? visit59_129_1(!r || visit60_129_2(r === 'auto')) ? 0 : r : parsed;
    }
  }
}};
  _$jscoverage['/timer/fx.js'].lineData[135]++;
  function isAttr(node, prop) {
    _$jscoverage['/timer/fx.js'].functionData[7]++;
    _$jscoverage['/timer/fx.js'].lineData[137]++;
    if (visit61_137_1((visit62_137_2(!node.style || visit63_137_3(node.style[prop] == null))) && visit64_138_1(Dom.attr(node, prop, undefined, 1) != null))) {
      _$jscoverage['/timer/fx.js'].lineData[139]++;
      return 1;
    }
    _$jscoverage['/timer/fx.js'].lineData[141]++;
    return 0;
  }
  _$jscoverage['/timer/fx.js'].lineData[144]++;
  function getPos(anim, propData) {
    _$jscoverage['/timer/fx.js'].functionData[8]++;
    _$jscoverage['/timer/fx.js'].lineData[145]++;
    var t = S.now(), runTime, startTime = anim.startTime, delay = propData.delay, duration = propData.duration;
    _$jscoverage['/timer/fx.js'].lineData[150]++;
    runTime = t - startTime - delay;
    _$jscoverage['/timer/fx.js'].lineData[151]++;
    if (visit65_151_1(runTime <= 0)) {
      _$jscoverage['/timer/fx.js'].lineData[152]++;
      return 0;
    } else {
      _$jscoverage['/timer/fx.js'].lineData[153]++;
      if (visit66_153_1(runTime >= duration)) {
        _$jscoverage['/timer/fx.js'].lineData[154]++;
        return 1;
      } else {
        _$jscoverage['/timer/fx.js'].lineData[156]++;
        return propData.easing(runTime / duration);
      }
    }
  }
  _$jscoverage['/timer/fx.js'].lineData[160]++;
  Fx.Factories = {};
  _$jscoverage['/timer/fx.js'].lineData[162]++;
  Fx.getFx = function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[9]++;
  _$jscoverage['/timer/fx.js'].lineData[163]++;
  var Constructor = Fx, SubClass;
  _$jscoverage['/timer/fx.js'].lineData[165]++;
  if (visit67_165_1(!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop]))) {
    _$jscoverage['/timer/fx.js'].lineData[166]++;
    Constructor = SubClass;
  }
  _$jscoverage['/timer/fx.js'].lineData[168]++;
  return new Constructor(cfg);
};
  _$jscoverage['/timer/fx.js'].lineData[171]++;
  return Fx;
}, {
  requires: ['dom']});
