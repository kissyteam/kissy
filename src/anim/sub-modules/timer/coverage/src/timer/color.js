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
if (! _$jscoverage['/timer/color.js']) {
  _$jscoverage['/timer/color.js'] = {};
  _$jscoverage['/timer/color.js'].lineData = [];
  _$jscoverage['/timer/color.js'].lineData[6] = 0;
  _$jscoverage['/timer/color.js'].lineData[7] = 0;
  _$jscoverage['/timer/color.js'].lineData[8] = 0;
  _$jscoverage['/timer/color.js'].lineData[9] = 0;
  _$jscoverage['/timer/color.js'].lineData[10] = 0;
  _$jscoverage['/timer/color.js'].lineData[45] = 0;
  _$jscoverage['/timer/color.js'].lineData[47] = 0;
  _$jscoverage['/timer/color.js'].lineData[54] = 0;
  _$jscoverage['/timer/color.js'].lineData[61] = 0;
  _$jscoverage['/timer/color.js'].lineData[65] = 0;
  _$jscoverage['/timer/color.js'].lineData[69] = 0;
  _$jscoverage['/timer/color.js'].lineData[73] = 0;
  _$jscoverage['/timer/color.js'].lineData[78] = 0;
  _$jscoverage['/timer/color.js'].lineData[79] = 0;
  _$jscoverage['/timer/color.js'].lineData[80] = 0;
  _$jscoverage['/timer/color.js'].lineData[81] = 0;
  _$jscoverage['/timer/color.js'].lineData[82] = 0;
  _$jscoverage['/timer/color.js'].lineData[88] = 0;
  _$jscoverage['/timer/color.js'].lineData[89] = 0;
  _$jscoverage['/timer/color.js'].lineData[96] = 0;
  _$jscoverage['/timer/color.js'].lineData[97] = 0;
  _$jscoverage['/timer/color.js'].lineData[98] = 0;
  _$jscoverage['/timer/color.js'].lineData[99] = 0;
  _$jscoverage['/timer/color.js'].lineData[102] = 0;
  _$jscoverage['/timer/color.js'].lineData[108] = 0;
  _$jscoverage['/timer/color.js'].lineData[109] = 0;
  _$jscoverage['/timer/color.js'].lineData[113] = 0;
  _$jscoverage['/timer/color.js'].lineData[114] = 0;
  _$jscoverage['/timer/color.js'].lineData[117] = 0;
  _$jscoverage['/timer/color.js'].lineData[118] = 0;
  _$jscoverage['/timer/color.js'].lineData[121] = 0;
  _$jscoverage['/timer/color.js'].lineData[123] = 0;
  _$jscoverage['/timer/color.js'].lineData[124] = 0;
  _$jscoverage['/timer/color.js'].lineData[125] = 0;
  _$jscoverage['/timer/color.js'].lineData[126] = 0;
  _$jscoverage['/timer/color.js'].lineData[128] = 0;
  _$jscoverage['/timer/color.js'].lineData[129] = 0;
  _$jscoverage['/timer/color.js'].lineData[134] = 0;
  _$jscoverage['/timer/color.js'].lineData[135] = 0;
  _$jscoverage['/timer/color.js'].lineData[136] = 0;
  _$jscoverage['/timer/color.js'].lineData[141] = 0;
  _$jscoverage['/timer/color.js'].lineData[142] = 0;
  _$jscoverage['/timer/color.js'].lineData[150] = 0;
  _$jscoverage['/timer/color.js'].lineData[151] = 0;
  _$jscoverage['/timer/color.js'].lineData[156] = 0;
  _$jscoverage['/timer/color.js'].lineData[157] = 0;
  _$jscoverage['/timer/color.js'].lineData[160] = 0;
  _$jscoverage['/timer/color.js'].lineData[162] = 0;
}
if (! _$jscoverage['/timer/color.js'].functionData) {
  _$jscoverage['/timer/color.js'].functionData = [];
  _$jscoverage['/timer/color.js'].functionData[0] = 0;
  _$jscoverage['/timer/color.js'].functionData[1] = 0;
  _$jscoverage['/timer/color.js'].functionData[2] = 0;
  _$jscoverage['/timer/color.js'].functionData[3] = 0;
  _$jscoverage['/timer/color.js'].functionData[4] = 0;
  _$jscoverage['/timer/color.js'].functionData[5] = 0;
}
if (! _$jscoverage['/timer/color.js'].branchData) {
  _$jscoverage['/timer/color.js'].branchData = {};
  _$jscoverage['/timer/color.js'].branchData['97'] = [];
  _$jscoverage['/timer/color.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['98'] = [];
  _$jscoverage['/timer/color.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['108'] = [];
  _$jscoverage['/timer/color.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['125'] = [];
  _$jscoverage['/timer/color.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['128'] = [];
  _$jscoverage['/timer/color.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['135'] = [];
  _$jscoverage['/timer/color.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['141'] = [];
  _$jscoverage['/timer/color.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['141'][3] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['147'] = [];
  _$jscoverage['/timer/color.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['147'][2] = new BranchData();
}
_$jscoverage['/timer/color.js'].branchData['147'][2].init(267, 10, 'to[3] || 1');
function visit13_147_2(result) {
  _$jscoverage['/timer/color.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['147'][1].init(253, 12, 'from[3] || 1');
function visit12_147_1(result) {
  _$jscoverage['/timer/color.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['141'][3].init(416, 15, 'to.length === 4');
function visit11_141_3(result) {
  _$jscoverage['/timer/color.js'].branchData['141'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['141'][2].init(395, 17, 'from.length === 4');
function visit10_141_2(result) {
  _$jscoverage['/timer/color.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['141'][1].init(395, 36, 'from.length === 4 || to.length === 4');
function visit9_141_1(result) {
  _$jscoverage['/timer/color.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['135'][3].init(100, 15, 'to.length === 3');
function visit8_135_3(result) {
  _$jscoverage['/timer/color.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['135'][2].init(79, 17, 'from.length === 3');
function visit7_135_2(result) {
  _$jscoverage['/timer/color.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['135'][1].init(79, 36, 'from.length === 3 && to.length === 3');
function visit6_135_1(result) {
  _$jscoverage['/timer/color.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['128'][1].init(202, 7, 'self.to');
function visit5_128_1(result) {
  _$jscoverage['/timer/color.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['125'][1].init(106, 9, 'self.from');
function visit4_125_1(result) {
  _$jscoverage['/timer/color.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['108'][1].init(893, 33, 'KEYWORDS[val = val.toLowerCase()]');
function visit3_108_1(result) {
  _$jscoverage['/timer/color.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['98'][1].init(21, 19, 'match[i].length < 2');
function visit2_98_1(result) {
  _$jscoverage['/timer/color.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['97'][1].init(29, 16, 'i < match.length');
function visit1_97_1(result) {
  _$jscoverage['/timer/color.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/timer/color.js'].functionData[0]++;
  _$jscoverage['/timer/color.js'].lineData[7]++;
  var Fx = require('./fx');
  _$jscoverage['/timer/color.js'].lineData[8]++;
  var SHORT_HANDS = require('./short-hand');
  _$jscoverage['/timer/color.js'].lineData[9]++;
  var logger = S.getLogger('s/anim/timer/color');
  _$jscoverage['/timer/color.js'].lineData[10]++;
  var HEX_BASE = 16, floor = Math.floor, KEYWORDS = {
  'black': [0, 0, 0], 
  'silver': [192, 192, 192], 
  'gray': [128, 128, 128], 
  'white': [255, 255, 255], 
  'maroon': [128, 0, 0], 
  'red': [255, 0, 0], 
  'purple': [128, 0, 128], 
  'fuchsia': [255, 0, 255], 
  'green': [0, 128, 0], 
  'lime': [0, 255, 0], 
  'olive': [128, 128, 0], 
  'yellow': [255, 255, 0], 
  'navy': [0, 0, 128], 
  'blue': [0, 0, 255], 
  'teal': [0, 128, 128], 
  'aqua': [0, 255, 255]}, RE_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i, RE_RGBA = /^rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+),\s*([0-9]+)\)$/i, RE_HEX = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i, COLORS = ['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'];
  _$jscoverage['/timer/color.js'].lineData[45]++;
  SHORT_HANDS.background.push('backgroundColor');
  _$jscoverage['/timer/color.js'].lineData[47]++;
  SHORT_HANDS.borderColor = ['borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor'];
  _$jscoverage['/timer/color.js'].lineData[54]++;
  SHORT_HANDS.border.push('borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor');
  _$jscoverage['/timer/color.js'].lineData[61]++;
  SHORT_HANDS.borderBottom.push('borderBottomColor');
  _$jscoverage['/timer/color.js'].lineData[65]++;
  SHORT_HANDS.borderLeft.push('borderLeftColor');
  _$jscoverage['/timer/color.js'].lineData[69]++;
  SHORT_HANDS.borderRight.push('borderRightColor');
  _$jscoverage['/timer/color.js'].lineData[73]++;
  SHORT_HANDS.borderTop.push('borderTopColor');
  _$jscoverage['/timer/color.js'].lineData[78]++;
  function numericColor(val) {
    _$jscoverage['/timer/color.js'].functionData[1]++;
    _$jscoverage['/timer/color.js'].lineData[79]++;
    val = (val + '');
    _$jscoverage['/timer/color.js'].lineData[80]++;
    var match;
    _$jscoverage['/timer/color.js'].lineData[81]++;
    if ((match = val.match(RE_RGB))) {
      _$jscoverage['/timer/color.js'].lineData[82]++;
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    } else {
      _$jscoverage['/timer/color.js'].lineData[88]++;
      if ((match = val.match(RE_RGBA))) {
        _$jscoverage['/timer/color.js'].lineData[89]++;
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];
      } else {
        _$jscoverage['/timer/color.js'].lineData[96]++;
        if ((match = val.match(RE_HEX))) {
          _$jscoverage['/timer/color.js'].lineData[97]++;
          for (var i = 1; visit1_97_1(i < match.length); i++) {
            _$jscoverage['/timer/color.js'].lineData[98]++;
            if (visit2_98_1(match[i].length < 2)) {
              _$jscoverage['/timer/color.js'].lineData[99]++;
              match[i] += match[i];
            }
          }
          _$jscoverage['/timer/color.js'].lineData[102]++;
          return [parseInt(match[1], HEX_BASE), parseInt(match[2], HEX_BASE), parseInt(match[3], HEX_BASE)];
        }
      }
    }
    _$jscoverage['/timer/color.js'].lineData[108]++;
    if (visit3_108_1(KEYWORDS[val = val.toLowerCase()])) {
      _$jscoverage['/timer/color.js'].lineData[109]++;
      return KEYWORDS[val];
    }
    _$jscoverage['/timer/color.js'].lineData[113]++;
    logger.warn('only allow rgb or hex color string : ' + val);
    _$jscoverage['/timer/color.js'].lineData[114]++;
    return [255, 255, 255];
  }
  _$jscoverage['/timer/color.js'].lineData[117]++;
  function ColorFx() {
    _$jscoverage['/timer/color.js'].functionData[2]++;
    _$jscoverage['/timer/color.js'].lineData[118]++;
    ColorFx.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/timer/color.js'].lineData[121]++;
  S.extend(ColorFx, Fx, {
  load: function() {
  _$jscoverage['/timer/color.js'].functionData[3]++;
  _$jscoverage['/timer/color.js'].lineData[123]++;
  var self = this;
  _$jscoverage['/timer/color.js'].lineData[124]++;
  ColorFx.superclass.load.apply(self, arguments);
  _$jscoverage['/timer/color.js'].lineData[125]++;
  if (visit4_125_1(self.from)) {
    _$jscoverage['/timer/color.js'].lineData[126]++;
    self.from = numericColor(self.from);
  }
  _$jscoverage['/timer/color.js'].lineData[128]++;
  if (visit5_128_1(self.to)) {
    _$jscoverage['/timer/color.js'].lineData[129]++;
    self.to = numericColor(self.to);
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/color.js'].functionData[4]++;
  _$jscoverage['/timer/color.js'].lineData[134]++;
  var interpolate = ColorFx.superclass.interpolate;
  _$jscoverage['/timer/color.js'].lineData[135]++;
  if (visit6_135_1(visit7_135_2(from.length === 3) && visit8_135_3(to.length === 3))) {
    _$jscoverage['/timer/color.js'].lineData[136]++;
    return 'rgb(' + [floor(interpolate(from[0], to[0], pos)), floor(interpolate(from[1], to[1], pos)), floor(interpolate(from[2], to[2], pos))].join(', ') + ')';
  } else {
    _$jscoverage['/timer/color.js'].lineData[141]++;
    if (visit9_141_1(visit10_141_2(from.length === 4) || visit11_141_3(to.length === 4))) {
      _$jscoverage['/timer/color.js'].lineData[142]++;
      return 'rgba(' + [floor(interpolate(from[0], to[0], pos)), floor(interpolate(from[1], to[1], pos)), floor(interpolate(from[2], to[2], pos)), floor(interpolate(visit12_147_1(from[3] || 1), visit13_147_2(to[3] || 1), pos))].join(', ') + ')';
    } else {
      _$jscoverage['/timer/color.js'].lineData[150]++;
      logger.warn('unknown value : ' + from);
      _$jscoverage['/timer/color.js'].lineData[151]++;
      return undefined;
    }
  }
}});
  _$jscoverage['/timer/color.js'].lineData[156]++;
  S.each(COLORS, function(color) {
  _$jscoverage['/timer/color.js'].functionData[5]++;
  _$jscoverage['/timer/color.js'].lineData[157]++;
  Fx.Factories[color] = ColorFx;
});
  _$jscoverage['/timer/color.js'].lineData[160]++;
  Fx.FxTypes.color = ColorFx;
  _$jscoverage['/timer/color.js'].lineData[162]++;
  return ColorFx;
});
