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
  _$jscoverage['/timer/fx.js'].lineData[9] = 0;
  _$jscoverage['/timer/fx.js'].lineData[10] = 0;
  _$jscoverage['/timer/fx.js'].lineData[11] = 0;
  _$jscoverage['/timer/fx.js'].lineData[12] = 0;
  _$jscoverage['/timer/fx.js'].lineData[20] = 0;
  _$jscoverage['/timer/fx.js'].lineData[21] = 0;
  _$jscoverage['/timer/fx.js'].lineData[24] = 0;
  _$jscoverage['/timer/fx.js'].lineData[35] = 0;
  _$jscoverage['/timer/fx.js'].lineData[43] = 0;
  _$jscoverage['/timer/fx.js'].lineData[44] = 0;
  _$jscoverage['/timer/fx.js'].lineData[47] = 0;
  _$jscoverage['/timer/fx.js'].lineData[55] = 0;
  _$jscoverage['/timer/fx.js'].lineData[56] = 0;
  _$jscoverage['/timer/fx.js'].lineData[59] = 0;
  _$jscoverage['/timer/fx.js'].lineData[61] = 0;
  _$jscoverage['/timer/fx.js'].lineData[62] = 0;
  _$jscoverage['/timer/fx.js'].lineData[65] = 0;
  _$jscoverage['/timer/fx.js'].lineData[67] = 0;
  _$jscoverage['/timer/fx.js'].lineData[69] = 0;
  _$jscoverage['/timer/fx.js'].lineData[70] = 0;
  _$jscoverage['/timer/fx.js'].lineData[73] = 0;
  _$jscoverage['/timer/fx.js'].lineData[74] = 0;
  _$jscoverage['/timer/fx.js'].lineData[76] = 0;
  _$jscoverage['/timer/fx.js'].lineData[77] = 0;
  _$jscoverage['/timer/fx.js'].lineData[78] = 0;
  _$jscoverage['/timer/fx.js'].lineData[80] = 0;
  _$jscoverage['/timer/fx.js'].lineData[82] = 0;
  _$jscoverage['/timer/fx.js'].lineData[83] = 0;
  _$jscoverage['/timer/fx.js'].lineData[84] = 0;
  _$jscoverage['/timer/fx.js'].lineData[86] = 0;
  _$jscoverage['/timer/fx.js'].lineData[101] = 0;
  _$jscoverage['/timer/fx.js'].lineData[103] = 0;
  _$jscoverage['/timer/fx.js'].lineData[105] = 0;
  _$jscoverage['/timer/fx.js'].lineData[114] = 0;
  _$jscoverage['/timer/fx.js'].lineData[118] = 0;
  _$jscoverage['/timer/fx.js'].lineData[119] = 0;
  _$jscoverage['/timer/fx.js'].lineData[121] = 0;
  _$jscoverage['/timer/fx.js'].lineData[122] = 0;
  _$jscoverage['/timer/fx.js'].lineData[124] = 0;
  _$jscoverage['/timer/fx.js'].lineData[129] = 0;
  _$jscoverage['/timer/fx.js'].lineData[136] = 0;
  _$jscoverage['/timer/fx.js'].lineData[138] = 0;
  _$jscoverage['/timer/fx.js'].lineData[140] = 0;
  _$jscoverage['/timer/fx.js'].lineData[142] = 0;
  _$jscoverage['/timer/fx.js'].lineData[145] = 0;
  _$jscoverage['/timer/fx.js'].lineData[146] = 0;
  _$jscoverage['/timer/fx.js'].lineData[151] = 0;
  _$jscoverage['/timer/fx.js'].lineData[152] = 0;
  _$jscoverage['/timer/fx.js'].lineData[153] = 0;
  _$jscoverage['/timer/fx.js'].lineData[154] = 0;
  _$jscoverage['/timer/fx.js'].lineData[155] = 0;
  _$jscoverage['/timer/fx.js'].lineData[157] = 0;
  _$jscoverage['/timer/fx.js'].lineData[161] = 0;
  _$jscoverage['/timer/fx.js'].lineData[163] = 0;
  _$jscoverage['/timer/fx.js'].lineData[164] = 0;
  _$jscoverage['/timer/fx.js'].lineData[166] = 0;
  _$jscoverage['/timer/fx.js'].lineData[167] = 0;
  _$jscoverage['/timer/fx.js'].lineData[169] = 0;
  _$jscoverage['/timer/fx.js'].lineData[172] = 0;
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
  _$jscoverage['/timer/fx.js'].branchData['12'] = [];
  _$jscoverage['/timer/fx.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['43'] = [];
  _$jscoverage['/timer/fx.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['55'] = [];
  _$jscoverage['/timer/fx.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['61'] = [];
  _$jscoverage['/timer/fx.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['61'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['69'] = [];
  _$jscoverage['/timer/fx.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['73'] = [];
  _$jscoverage['/timer/fx.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['74'] = [];
  _$jscoverage['/timer/fx.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['83'] = [];
  _$jscoverage['/timer/fx.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['101'] = [];
  _$jscoverage['/timer/fx.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['102'] = [];
  _$jscoverage['/timer/fx.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['118'] = [];
  _$jscoverage['/timer/fx.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['119'] = [];
  _$jscoverage['/timer/fx.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['121'] = [];
  _$jscoverage['/timer/fx.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['130'] = [];
  _$jscoverage['/timer/fx.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['130'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['138'] = [];
  _$jscoverage['/timer/fx.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['138'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['139'] = [];
  _$jscoverage['/timer/fx.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['152'] = [];
  _$jscoverage['/timer/fx.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['154'] = [];
  _$jscoverage['/timer/fx.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['166'] = [];
  _$jscoverage['/timer/fx.js'].branchData['166'][1] = new BranchData();
}
_$jscoverage['/timer/fx.js'].branchData['166'][1].init(68, 54, '!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop])');
function visit67_166_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['154'][1].init(285, 19, 'runTime >= duration');
function visit66_154_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['152'][1].init(225, 12, 'runTime <= 0');
function visit65_152_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['139'][1].init(58, 42, 'Dom.attr(node, prop, undefined, 1) != null');
function visit64_139_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['138'][3].init(70, 26, 'node.style[prop] == null');
function visit63_138_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['138'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['138'][2].init(55, 41, '!node.style || node.style[prop] == null');
function visit62_138_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['138'][1].init(55, 101, '(!node.style || node.style[prop] == null) && Dom.attr(node, prop, undefined, 1) != null');
function visit61_138_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['130'][2].init(58, 12, 'r === \'auto\'');
function visit60_130_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['130'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['130'][1].init(52, 18, '!r || r === \'auto\'');
function visit59_130_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['121'][1].init(259, 18, 'isAttr(node, prop)');
function visit58_121_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['119'][1].init(25, 15, 'node[prop] || 0');
function visit57_119_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['118'][1].init(161, 15, 'self.isCustomFx');
function visit56_118_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['102'][1].init(46, 22, 'typeof to === \'number\'');
function visit55_102_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['101'][2].init(51, 24, 'typeof from === \'number\'');
function visit54_101_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['101'][1].init(51, 70, '(typeof from === \'number\') && (typeof to === \'number\')');
function visit53_101_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['83'][1].init(410, 18, 'isAttr(node, prop)');
function visit52_83_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['74'][1].init(22, 42, 'val === undefined');
function visit51_74_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['73'][1].init(810, 16, '!self.isCustomFx');
function visit50_73_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['69'][1].init(655, 14, 'propData.frame');
function visit49_69_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['61'][3].init(489, 9, 'pos === 0');
function visit48_61_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['61'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['61'][2].init(474, 11, 'from === to');
function visit47_61_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['61'][1].init(474, 24, 'from === to || pos === 0');
function visit46_61_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['55'][1].init(341, 17, 'pos === undefined');
function visit45_55_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['43'][1].init(18, 14, 'this.pos === 1');
function visit44_43_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['12'][1].init(72, 15, 'self.unit || \'\'');
function visit43_12_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].lineData[6]++;
KISSY.add('anim/timer/fx', function(S, Dom, undefined) {
  _$jscoverage['/timer/fx.js'].functionData[0]++;
  _$jscoverage['/timer/fx.js'].lineData[7]++;
  var logger = S.getLogger('s/aim/timer/fx');
  _$jscoverage['/timer/fx.js'].lineData[9]++;
  function load(self, cfg) {
    _$jscoverage['/timer/fx.js'].functionData[1]++;
    _$jscoverage['/timer/fx.js'].lineData[10]++;
    S.mix(self, cfg);
    _$jscoverage['/timer/fx.js'].lineData[11]++;
    self.pos = 0;
    _$jscoverage['/timer/fx.js'].lineData[12]++;
    self.unit = visit43_12_1(self.unit || '');
  }
  _$jscoverage['/timer/fx.js'].lineData[20]++;
  function Fx(cfg) {
    _$jscoverage['/timer/fx.js'].functionData[2]++;
    _$jscoverage['/timer/fx.js'].lineData[21]++;
    load(this, cfg);
  }
  _$jscoverage['/timer/fx.js'].lineData[24]++;
  Fx.prototype = {
  isCustomFx: 0, 
  constructor: Fx, 
  load: function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[3]++;
  _$jscoverage['/timer/fx.js'].lineData[35]++;
  load(this, cfg);
}, 
  frame: function(pos) {
  _$jscoverage['/timer/fx.js'].functionData[4]++;
  _$jscoverage['/timer/fx.js'].lineData[43]++;
  if (visit44_43_1(this.pos === 1)) {
    _$jscoverage['/timer/fx.js'].lineData[44]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[47]++;
  var self = this, anim = self.anim, prop = self.prop, node = anim.node, from = self.from, propData = self.propData, to = self.to;
  _$jscoverage['/timer/fx.js'].lineData[55]++;
  if (visit45_55_1(pos === undefined)) {
    _$jscoverage['/timer/fx.js'].lineData[56]++;
    pos = getPos(anim, propData);
  }
  _$jscoverage['/timer/fx.js'].lineData[59]++;
  self.pos = pos;
  _$jscoverage['/timer/fx.js'].lineData[61]++;
  if (visit46_61_1(visit47_61_2(from === to) || visit48_61_3(pos === 0))) {
    _$jscoverage['/timer/fx.js'].lineData[62]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[65]++;
  var val = self.interpolate(from, to, self.pos);
  _$jscoverage['/timer/fx.js'].lineData[67]++;
  self.val = val;
  _$jscoverage['/timer/fx.js'].lineData[69]++;
  if (visit49_69_1(propData.frame)) {
    _$jscoverage['/timer/fx.js'].lineData[70]++;
    propData.frame.call(self, anim, self);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[73]++;
    if (visit50_73_1(!self.isCustomFx)) {
      _$jscoverage['/timer/fx.js'].lineData[74]++;
      if (visit51_74_1(val === undefined)) {
        _$jscoverage['/timer/fx.js'].lineData[76]++;
        self.pos = 1;
        _$jscoverage['/timer/fx.js'].lineData[77]++;
        val = to;
        _$jscoverage['/timer/fx.js'].lineData[78]++;
        logger.warn(prop + ' update directly ! : ' + val + ' : ' + from + ' : ' + to);
      } else {
        _$jscoverage['/timer/fx.js'].lineData[80]++;
        val += self.unit;
      }
      _$jscoverage['/timer/fx.js'].lineData[82]++;
      self.val = val;
      _$jscoverage['/timer/fx.js'].lineData[83]++;
      if (visit52_83_1(isAttr(node, prop))) {
        _$jscoverage['/timer/fx.js'].lineData[84]++;
        Dom.attr(node, prop, val, 1);
      } else {
        _$jscoverage['/timer/fx.js'].lineData[86]++;
        Dom.css(node, prop, val);
      }
    }
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/fx.js'].functionData[5]++;
  _$jscoverage['/timer/fx.js'].lineData[101]++;
  if (visit53_101_1((visit54_101_2(typeof from === 'number')) && (visit55_102_1(typeof to === 'number')))) {
    _$jscoverage['/timer/fx.js'].lineData[103]++;
    return Math.round((from + (to - from) * pos) * 1e5) / 1e5;
  } else {
    _$jscoverage['/timer/fx.js'].lineData[105]++;
    return undefined;
  }
}, 
  cur: function() {
  _$jscoverage['/timer/fx.js'].functionData[6]++;
  _$jscoverage['/timer/fx.js'].lineData[114]++;
  var self = this, prop = self.prop, node = self.anim.node;
  _$jscoverage['/timer/fx.js'].lineData[118]++;
  if (visit56_118_1(self.isCustomFx)) {
    _$jscoverage['/timer/fx.js'].lineData[119]++;
    return visit57_119_1(node[prop] || 0);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[121]++;
    if (visit58_121_1(isAttr(node, prop))) {
      _$jscoverage['/timer/fx.js'].lineData[122]++;
      return Dom.attr(node, prop, undefined, 1);
    } else {
      _$jscoverage['/timer/fx.js'].lineData[124]++;
      var parsed, r = Dom.css(node, prop);
      _$jscoverage['/timer/fx.js'].lineData[129]++;
      return isNaN(parsed = parseFloat(r)) ? visit59_130_1(!r || visit60_130_2(r === 'auto')) ? 0 : r : parsed;
    }
  }
}};
  _$jscoverage['/timer/fx.js'].lineData[136]++;
  function isAttr(node, prop) {
    _$jscoverage['/timer/fx.js'].functionData[7]++;
    _$jscoverage['/timer/fx.js'].lineData[138]++;
    if (visit61_138_1((visit62_138_2(!node.style || visit63_138_3(node.style[prop] == null))) && visit64_139_1(Dom.attr(node, prop, undefined, 1) != null))) {
      _$jscoverage['/timer/fx.js'].lineData[140]++;
      return 1;
    }
    _$jscoverage['/timer/fx.js'].lineData[142]++;
    return 0;
  }
  _$jscoverage['/timer/fx.js'].lineData[145]++;
  function getPos(anim, propData) {
    _$jscoverage['/timer/fx.js'].functionData[8]++;
    _$jscoverage['/timer/fx.js'].lineData[146]++;
    var t = S.now(), runTime, startTime = anim.startTime, delay = propData.delay, duration = propData.duration;
    _$jscoverage['/timer/fx.js'].lineData[151]++;
    runTime = t - startTime - delay;
    _$jscoverage['/timer/fx.js'].lineData[152]++;
    if (visit65_152_1(runTime <= 0)) {
      _$jscoverage['/timer/fx.js'].lineData[153]++;
      return 0;
    } else {
      _$jscoverage['/timer/fx.js'].lineData[154]++;
      if (visit66_154_1(runTime >= duration)) {
        _$jscoverage['/timer/fx.js'].lineData[155]++;
        return 1;
      } else {
        _$jscoverage['/timer/fx.js'].lineData[157]++;
        return propData.easing(runTime / duration);
      }
    }
  }
  _$jscoverage['/timer/fx.js'].lineData[161]++;
  Fx.Factories = {};
  _$jscoverage['/timer/fx.js'].lineData[163]++;
  Fx.getFx = function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[9]++;
  _$jscoverage['/timer/fx.js'].lineData[164]++;
  var Constructor = Fx, SubClass;
  _$jscoverage['/timer/fx.js'].lineData[166]++;
  if (visit67_166_1(!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop]))) {
    _$jscoverage['/timer/fx.js'].lineData[167]++;
    Constructor = SubClass;
  }
  _$jscoverage['/timer/fx.js'].lineData[169]++;
  return new Constructor(cfg);
};
  _$jscoverage['/timer/fx.js'].lineData[172]++;
  return Fx;
}, {
  requires: ['dom']});
