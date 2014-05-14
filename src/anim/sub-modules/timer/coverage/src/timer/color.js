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
  _$jscoverage['/timer/color.js'].lineData[46] = 0;
  _$jscoverage['/timer/color.js'].lineData[47] = 0;
  _$jscoverage['/timer/color.js'].lineData[48] = 0;
  _$jscoverage['/timer/color.js'].lineData[49] = 0;
  _$jscoverage['/timer/color.js'].lineData[54] = 0;
  _$jscoverage['/timer/color.js'].lineData[55] = 0;
  _$jscoverage['/timer/color.js'].lineData[61] = 0;
  _$jscoverage['/timer/color.js'].lineData[62] = 0;
  _$jscoverage['/timer/color.js'].lineData[63] = 0;
  _$jscoverage['/timer/color.js'].lineData[64] = 0;
  _$jscoverage['/timer/color.js'].lineData[67] = 0;
  _$jscoverage['/timer/color.js'].lineData[73] = 0;
  _$jscoverage['/timer/color.js'].lineData[74] = 0;
  _$jscoverage['/timer/color.js'].lineData[78] = 0;
  _$jscoverage['/timer/color.js'].lineData[79] = 0;
  _$jscoverage['/timer/color.js'].lineData[82] = 0;
  _$jscoverage['/timer/color.js'].lineData[83] = 0;
  _$jscoverage['/timer/color.js'].lineData[86] = 0;
  _$jscoverage['/timer/color.js'].lineData[88] = 0;
  _$jscoverage['/timer/color.js'].lineData[89] = 0;
  _$jscoverage['/timer/color.js'].lineData[90] = 0;
  _$jscoverage['/timer/color.js'].lineData[91] = 0;
  _$jscoverage['/timer/color.js'].lineData[93] = 0;
  _$jscoverage['/timer/color.js'].lineData[94] = 0;
  _$jscoverage['/timer/color.js'].lineData[99] = 0;
  _$jscoverage['/timer/color.js'].lineData[100] = 0;
  _$jscoverage['/timer/color.js'].lineData[101] = 0;
  _$jscoverage['/timer/color.js'].lineData[106] = 0;
  _$jscoverage['/timer/color.js'].lineData[107] = 0;
  _$jscoverage['/timer/color.js'].lineData[115] = 0;
  _$jscoverage['/timer/color.js'].lineData[116] = 0;
  _$jscoverage['/timer/color.js'].lineData[121] = 0;
  _$jscoverage['/timer/color.js'].lineData[122] = 0;
  _$jscoverage['/timer/color.js'].lineData[125] = 0;
  _$jscoverage['/timer/color.js'].lineData[127] = 0;
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
  _$jscoverage['/timer/color.js'].branchData['62'] = [];
  _$jscoverage['/timer/color.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['63'] = [];
  _$jscoverage['/timer/color.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['73'] = [];
  _$jscoverage['/timer/color.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['90'] = [];
  _$jscoverage['/timer/color.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['93'] = [];
  _$jscoverage['/timer/color.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['100'] = [];
  _$jscoverage['/timer/color.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['100'][3] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['106'] = [];
  _$jscoverage['/timer/color.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['106'][3] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['112'] = [];
  _$jscoverage['/timer/color.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['112'][2] = new BranchData();
}
_$jscoverage['/timer/color.js'].branchData['112'][2].init(272, 10, 'to[3] || 1');
function visit13_112_2(result) {
  _$jscoverage['/timer/color.js'].branchData['112'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['112'][1].init(258, 12, 'from[3] || 1');
function visit12_112_1(result) {
  _$jscoverage['/timer/color.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['106'][3].init(424, 15, 'to.length === 4');
function visit11_106_3(result) {
  _$jscoverage['/timer/color.js'].branchData['106'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['106'][2].init(403, 17, 'from.length === 4');
function visit10_106_2(result) {
  _$jscoverage['/timer/color.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['106'][1].init(403, 36, 'from.length === 4 || to.length === 4');
function visit9_106_1(result) {
  _$jscoverage['/timer/color.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['100'][3].init(102, 15, 'to.length === 3');
function visit8_100_3(result) {
  _$jscoverage['/timer/color.js'].branchData['100'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['100'][2].init(81, 17, 'from.length === 3');
function visit7_100_2(result) {
  _$jscoverage['/timer/color.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['100'][1].init(81, 36, 'from.length === 3 && to.length === 3');
function visit6_100_1(result) {
  _$jscoverage['/timer/color.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['93'][1].init(208, 7, 'self.to');
function visit5_93_1(result) {
  _$jscoverage['/timer/color.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['90'][1].init(109, 9, 'self.from');
function visit4_90_1(result) {
  _$jscoverage['/timer/color.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['73'][1].init(933, 33, 'KEYWORDS[val = val.toLowerCase()]');
function visit3_73_1(result) {
  _$jscoverage['/timer/color.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['63'][1].init(22, 19, 'match[i].length < 2');
function visit2_63_1(result) {
  _$jscoverage['/timer/color.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['62'][1].init(30, 16, 'i < match.length');
function visit1_62_1(result) {
  _$jscoverage['/timer/color.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/timer/color.js'].functionData[0]++;
  _$jscoverage['/timer/color.js'].lineData[7]++;
  var logger = S.getLogger('s/anim/timer/color');
  _$jscoverage['/timer/color.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/timer/color.js'].lineData[9]++;
  var Fx = require('./fx');
  _$jscoverage['/timer/color.js'].lineData[10]++;
  var HEX_BASE = 16, floor = Math.floor, KEYWORDS = {
  black: [0, 0, 0], 
  silver: [192, 192, 192], 
  gray: [128, 128, 128], 
  white: [255, 255, 255], 
  maroon: [128, 0, 0], 
  red: [255, 0, 0], 
  purple: [128, 0, 128], 
  fuchsia: [255, 0, 255], 
  green: [0, 128, 0], 
  lime: [0, 255, 0], 
  olive: [128, 128, 0], 
  yellow: [255, 255, 0], 
  navy: [0, 0, 128], 
  blue: [0, 0, 255], 
  teal: [0, 128, 128], 
  aqua: [0, 255, 255]}, RE_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i, RE_RGBA = /^rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+),\s*([0-9]+)\)$/i, RE_HEX = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i, COLORS = ['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'];
  _$jscoverage['/timer/color.js'].lineData[45]++;
  function numericColor(val) {
    _$jscoverage['/timer/color.js'].functionData[1]++;
    _$jscoverage['/timer/color.js'].lineData[46]++;
    val = (val + '');
    _$jscoverage['/timer/color.js'].lineData[47]++;
    var match;
    _$jscoverage['/timer/color.js'].lineData[48]++;
    if ((match = val.match(RE_RGB))) {
      _$jscoverage['/timer/color.js'].lineData[49]++;
      return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
    } else {
      _$jscoverage['/timer/color.js'].lineData[54]++;
      if ((match = val.match(RE_RGBA))) {
        _$jscoverage['/timer/color.js'].lineData[55]++;
        return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10), parseInt(match[4], 10)];
      } else {
        _$jscoverage['/timer/color.js'].lineData[61]++;
        if ((match = val.match(RE_HEX))) {
          _$jscoverage['/timer/color.js'].lineData[62]++;
          for (var i = 1; visit1_62_1(i < match.length); i++) {
            _$jscoverage['/timer/color.js'].lineData[63]++;
            if (visit2_63_1(match[i].length < 2)) {
              _$jscoverage['/timer/color.js'].lineData[64]++;
              match[i] += match[i];
            }
          }
          _$jscoverage['/timer/color.js'].lineData[67]++;
          return [parseInt(match[1], HEX_BASE), parseInt(match[2], HEX_BASE), parseInt(match[3], HEX_BASE)];
        }
      }
    }
    _$jscoverage['/timer/color.js'].lineData[73]++;
    if (visit3_73_1(KEYWORDS[val = val.toLowerCase()])) {
      _$jscoverage['/timer/color.js'].lineData[74]++;
      return KEYWORDS[val];
    }
    _$jscoverage['/timer/color.js'].lineData[78]++;
    logger.warn('only allow rgb or hex color string : ' + val);
    _$jscoverage['/timer/color.js'].lineData[79]++;
    return [255, 255, 255];
  }
  _$jscoverage['/timer/color.js'].lineData[82]++;
  function ColorFx() {
    _$jscoverage['/timer/color.js'].functionData[2]++;
    _$jscoverage['/timer/color.js'].lineData[83]++;
    ColorFx.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/timer/color.js'].lineData[86]++;
  util.extend(ColorFx, Fx, {
  load: function() {
  _$jscoverage['/timer/color.js'].functionData[3]++;
  _$jscoverage['/timer/color.js'].lineData[88]++;
  var self = this;
  _$jscoverage['/timer/color.js'].lineData[89]++;
  ColorFx.superclass.load.apply(self, arguments);
  _$jscoverage['/timer/color.js'].lineData[90]++;
  if (visit4_90_1(self.from)) {
    _$jscoverage['/timer/color.js'].lineData[91]++;
    self.from = numericColor(self.from);
  }
  _$jscoverage['/timer/color.js'].lineData[93]++;
  if (visit5_93_1(self.to)) {
    _$jscoverage['/timer/color.js'].lineData[94]++;
    self.to = numericColor(self.to);
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/color.js'].functionData[4]++;
  _$jscoverage['/timer/color.js'].lineData[99]++;
  var interpolate = ColorFx.superclass.interpolate;
  _$jscoverage['/timer/color.js'].lineData[100]++;
  if (visit6_100_1(visit7_100_2(from.length === 3) && visit8_100_3(to.length === 3))) {
    _$jscoverage['/timer/color.js'].lineData[101]++;
    return 'rgb(' + [floor(interpolate(from[0], to[0], pos)), floor(interpolate(from[1], to[1], pos)), floor(interpolate(from[2], to[2], pos))].join(', ') + ')';
  } else {
    _$jscoverage['/timer/color.js'].lineData[106]++;
    if (visit9_106_1(visit10_106_2(from.length === 4) || visit11_106_3(to.length === 4))) {
      _$jscoverage['/timer/color.js'].lineData[107]++;
      return 'rgba(' + [floor(interpolate(from[0], to[0], pos)), floor(interpolate(from[1], to[1], pos)), floor(interpolate(from[2], to[2], pos)), floor(interpolate(visit12_112_1(from[3] || 1), visit13_112_2(to[3] || 1), pos))].join(', ') + ')';
    } else {
      _$jscoverage['/timer/color.js'].lineData[115]++;
      logger.warn('unknown value : ' + from);
      _$jscoverage['/timer/color.js'].lineData[116]++;
      return undefined;
    }
  }
}});
  _$jscoverage['/timer/color.js'].lineData[121]++;
  util.each(COLORS, function(color) {
  _$jscoverage['/timer/color.js'].functionData[5]++;
  _$jscoverage['/timer/color.js'].lineData[122]++;
  Fx.Factories[color] = ColorFx;
});
  _$jscoverage['/timer/color.js'].lineData[125]++;
  Fx.FxTypes.color = ColorFx;
  _$jscoverage['/timer/color.js'].lineData[127]++;
  return ColorFx;
});
