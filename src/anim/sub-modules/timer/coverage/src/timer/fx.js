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
  _$jscoverage['/timer/fx.js'].lineData[8] = 0;
  _$jscoverage['/timer/fx.js'].lineData[9] = 0;
  _$jscoverage['/timer/fx.js'].lineData[10] = 0;
  _$jscoverage['/timer/fx.js'].lineData[11] = 0;
  _$jscoverage['/timer/fx.js'].lineData[19] = 0;
  _$jscoverage['/timer/fx.js'].lineData[20] = 0;
  _$jscoverage['/timer/fx.js'].lineData[23] = 0;
  _$jscoverage['/timer/fx.js'].lineData[35] = 0;
  _$jscoverage['/timer/fx.js'].lineData[43] = 0;
  _$jscoverage['/timer/fx.js'].lineData[44] = 0;
  _$jscoverage['/timer/fx.js'].lineData[45] = 0;
  _$jscoverage['/timer/fx.js'].lineData[46] = 0;
  _$jscoverage['/timer/fx.js'].lineData[59] = 0;
  _$jscoverage['/timer/fx.js'].lineData[61] = 0;
  _$jscoverage['/timer/fx.js'].lineData[63] = 0;
  _$jscoverage['/timer/fx.js'].lineData[72] = 0;
  _$jscoverage['/timer/fx.js'].lineData[80] = 0;
  _$jscoverage['/timer/fx.js'].lineData[82] = 0;
  _$jscoverage['/timer/fx.js'].lineData[83] = 0;
  _$jscoverage['/timer/fx.js'].lineData[84] = 0;
  _$jscoverage['/timer/fx.js'].lineData[85] = 0;
  _$jscoverage['/timer/fx.js'].lineData[88] = 0;
  _$jscoverage['/timer/fx.js'].lineData[89] = 0;
  _$jscoverage['/timer/fx.js'].lineData[90] = 0;
  _$jscoverage['/timer/fx.js'].lineData[93] = 0;
  _$jscoverage['/timer/fx.js'].lineData[103] = 0;
  _$jscoverage['/timer/fx.js'].lineData[106] = 0;
  _$jscoverage['/timer/fx.js'].lineData[107] = 0;
  _$jscoverage['/timer/fx.js'].lineData[109] = 0;
  _$jscoverage['/timer/fx.js'].lineData[114] = 0;
  _$jscoverage['/timer/fx.js'].lineData[120] = 0;
  _$jscoverage['/timer/fx.js'].lineData[122] = 0;
  _$jscoverage['/timer/fx.js'].lineData[124] = 0;
  _$jscoverage['/timer/fx.js'].lineData[126] = 0;
  _$jscoverage['/timer/fx.js'].lineData[129] = 0;
  _$jscoverage['/timer/fx.js'].lineData[130] = 0;
  _$jscoverage['/timer/fx.js'].lineData[135] = 0;
  _$jscoverage['/timer/fx.js'].lineData[136] = 0;
  _$jscoverage['/timer/fx.js'].lineData[137] = 0;
  _$jscoverage['/timer/fx.js'].lineData[138] = 0;
  _$jscoverage['/timer/fx.js'].lineData[139] = 0;
  _$jscoverage['/timer/fx.js'].lineData[141] = 0;
  _$jscoverage['/timer/fx.js'].lineData[145] = 0;
  _$jscoverage['/timer/fx.js'].lineData[147] = 0;
  _$jscoverage['/timer/fx.js'].lineData[149] = 0;
  _$jscoverage['/timer/fx.js'].lineData[150] = 0;
  _$jscoverage['/timer/fx.js'].lineData[151] = 0;
  _$jscoverage['/timer/fx.js'].lineData[154] = 0;
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
  _$jscoverage['/timer/fx.js'].functionData[10] = 0;
}
if (! _$jscoverage['/timer/fx.js'].branchData) {
  _$jscoverage['/timer/fx.js'].branchData = {};
  _$jscoverage['/timer/fx.js'].branchData['11'] = [];
  _$jscoverage['/timer/fx.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['46'] = [];
  _$jscoverage['/timer/fx.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['59'] = [];
  _$jscoverage['/timer/fx.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['60'] = [];
  _$jscoverage['/timer/fx.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['80'] = [];
  _$jscoverage['/timer/fx.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['82'] = [];
  _$jscoverage['/timer/fx.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['89'] = [];
  _$jscoverage['/timer/fx.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['106'] = [];
  _$jscoverage['/timer/fx.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['115'] = [];
  _$jscoverage['/timer/fx.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['122'] = [];
  _$jscoverage['/timer/fx.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['122'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['122'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['123'] = [];
  _$jscoverage['/timer/fx.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['136'] = [];
  _$jscoverage['/timer/fx.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['138'] = [];
  _$jscoverage['/timer/fx.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['150'] = [];
  _$jscoverage['/timer/fx.js'].branchData['150'][1] = new BranchData();
}
_$jscoverage['/timer/fx.js'].branchData['150'][1].init(28, 28, 'Fx.Factories[cfg.prop] || Fx');
function visit61_150_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['138'][1].init(285, 19, 'runTime >= duration');
function visit60_138_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['136'][1].init(225, 12, 'runTime <= 0');
function visit59_136_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['123'][1].init(58, 42, 'Dom.attr(node, prop, undefined, 1) != null');
function visit58_123_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['122'][3].init(70, 26, 'node.style[prop] == null');
function visit57_122_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['122'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['122'][2].init(55, 41, '!node.style || node.style[prop] == null');
function visit56_122_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['122'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['122'][1].init(55, 101, '(!node.style || node.style[prop] == null) && Dom.attr(node, prop, undefined, 1) != null');
function visit55_122_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['115'][2].init(54, 12, 'r === \'auto\'');
function visit54_115_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['115'][1].init(48, 18, '!r || r === \'auto\'');
function visit53_115_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['106'][1].init(123, 18, 'isAttr(node, prop)');
function visit52_106_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['89'][1].init(57, 18, 'isAttr(node, prop)');
function visit51_89_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['82'][1].init(56, 14, '!self.finished');
function visit50_82_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['80'][1].init(282, 42, 'val === undefined');
function visit49_80_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['60'][1].init(46, 22, 'typeof to === \'number\'');
function visit48_60_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['59'][2].init(51, 24, 'typeof from === \'number\'');
function visit47_59_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['59'][1].init(51, 70, '(typeof from === \'number\') && (typeof to === \'number\')');
function visit46_59_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['46'][2].init(134, 8, 'pos == 1');
function visit45_46_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['46'][1].init(117, 25, 'self.finished || pos == 1');
function visit44_46_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['11'][1].init(72, 15, 'self.unit || \'\'');
function visit43_11_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].lineData[6]++;
KISSY.add('anim/timer/fx', function(S, Dom, undefined) {
  _$jscoverage['/timer/fx.js'].functionData[0]++;
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
  isBasicFx: 1, 
  constructor: Fx, 
  load: function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[3]++;
  _$jscoverage['/timer/fx.js'].lineData[35]++;
  load(this, cfg);
}, 
  frame: function(pos) {
  _$jscoverage['/timer/fx.js'].functionData[4]++;
  _$jscoverage['/timer/fx.js'].lineData[43]++;
  var self = this;
  _$jscoverage['/timer/fx.js'].lineData[44]++;
  self.pos = pos;
  _$jscoverage['/timer/fx.js'].lineData[45]++;
  self.update();
  _$jscoverage['/timer/fx.js'].lineData[46]++;
  self.finished = visit44_46_1(self.finished || visit45_46_2(pos == 1));
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/fx.js'].functionData[5]++;
  _$jscoverage['/timer/fx.js'].lineData[59]++;
  if (visit46_59_1((visit47_59_2(typeof from === 'number')) && (visit48_60_1(typeof to === 'number')))) {
    _$jscoverage['/timer/fx.js'].lineData[61]++;
    return Math.round((from + (to - from) * pos) * 1e5) / 1e5;
  } else {
    _$jscoverage['/timer/fx.js'].lineData[63]++;
    return undefined;
  }
}, 
  update: function() {
  _$jscoverage['/timer/fx.js'].functionData[6]++;
  _$jscoverage['/timer/fx.js'].lineData[72]++;
  var self = this, anim = self.anim, prop = self.prop, node = anim.node, from = self.from, to = self.to, val = self.interpolate(from, to, self.pos);
  _$jscoverage['/timer/fx.js'].lineData[80]++;
  if (visit49_80_1(val === undefined)) {
    _$jscoverage['/timer/fx.js'].lineData[82]++;
    if (visit50_82_1(!self.finished)) {
      _$jscoverage['/timer/fx.js'].lineData[83]++;
      self.finished = 1;
      _$jscoverage['/timer/fx.js'].lineData[84]++;
      Dom.css(node, prop, to);
      _$jscoverage['/timer/fx.js'].lineData[85]++;
      S.log(prop + ' update directly ! : ' + val + ' : ' + from + ' : ' + to);
    }
  } else {
    _$jscoverage['/timer/fx.js'].lineData[88]++;
    val += self.unit;
    _$jscoverage['/timer/fx.js'].lineData[89]++;
    if (visit51_89_1(isAttr(node, prop))) {
      _$jscoverage['/timer/fx.js'].lineData[90]++;
      Dom.attr(node, prop, val, 1);
    } else {
      _$jscoverage['/timer/fx.js'].lineData[93]++;
      Dom.css(node, prop, val);
    }
  }
}, 
  cur: function() {
  _$jscoverage['/timer/fx.js'].functionData[7]++;
  _$jscoverage['/timer/fx.js'].lineData[103]++;
  var self = this, prop = self.prop, node = self.anim.node;
  _$jscoverage['/timer/fx.js'].lineData[106]++;
  if (visit52_106_1(isAttr(node, prop))) {
    _$jscoverage['/timer/fx.js'].lineData[107]++;
    return Dom.attr(node, prop, undefined, 1);
  }
  _$jscoverage['/timer/fx.js'].lineData[109]++;
  var parsed, r = Dom.css(node, prop);
  _$jscoverage['/timer/fx.js'].lineData[114]++;
  return isNaN(parsed = parseFloat(r)) ? visit53_115_1(!r || visit54_115_2(r === 'auto')) ? 0 : r : parsed;
}};
  _$jscoverage['/timer/fx.js'].lineData[120]++;
  function isAttr(node, prop) {
    _$jscoverage['/timer/fx.js'].functionData[8]++;
    _$jscoverage['/timer/fx.js'].lineData[122]++;
    if (visit55_122_1((visit56_122_2(!node.style || visit57_122_3(node.style[prop] == null))) && visit58_123_1(Dom.attr(node, prop, undefined, 1) != null))) {
      _$jscoverage['/timer/fx.js'].lineData[124]++;
      return 1;
    }
    _$jscoverage['/timer/fx.js'].lineData[126]++;
    return 0;
  }
  _$jscoverage['/timer/fx.js'].lineData[129]++;
  function getPos(anim, propData) {
    _$jscoverage['/timer/fx.js'].functionData[9]++;
    _$jscoverage['/timer/fx.js'].lineData[130]++;
    var t = S.now(), runTime, startTime = anim.startTime, delay = propData.delay, duration = propData.duration;
    _$jscoverage['/timer/fx.js'].lineData[135]++;
    runTime = t - startTime - delay;
    _$jscoverage['/timer/fx.js'].lineData[136]++;
    if (visit59_136_1(runTime <= 0)) {
      _$jscoverage['/timer/fx.js'].lineData[137]++;
      return 0;
    } else {
      _$jscoverage['/timer/fx.js'].lineData[138]++;
      if (visit60_138_1(runTime >= duration)) {
        _$jscoverage['/timer/fx.js'].lineData[139]++;
        return 1;
      } else {
        _$jscoverage['/timer/fx.js'].lineData[141]++;
        return propData.easing(runTime / duration);
      }
    }
  }
  _$jscoverage['/timer/fx.js'].lineData[145]++;
  Fx.Factories = {};
  _$jscoverage['/timer/fx.js'].lineData[147]++;
  Fx.getPos = getPos;
  _$jscoverage['/timer/fx.js'].lineData[149]++;
  Fx.getFx = function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[10]++;
  _$jscoverage['/timer/fx.js'].lineData[150]++;
  var Constructor = visit61_150_1(Fx.Factories[cfg.prop] || Fx);
  _$jscoverage['/timer/fx.js'].lineData[151]++;
  return new Constructor(cfg);
};
  _$jscoverage['/timer/fx.js'].lineData[154]++;
  return Fx;
}, {
  requires: ['dom']});
