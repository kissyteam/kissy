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
  _$jscoverage['/timer/color.js'].lineData[45] = 0;
  _$jscoverage['/timer/color.js'].lineData[46] = 0;
  _$jscoverage['/timer/color.js'].lineData[47] = 0;
  _$jscoverage['/timer/color.js'].lineData[48] = 0;
  _$jscoverage['/timer/color.js'].lineData[49] = 0;
  _$jscoverage['/timer/color.js'].lineData[55] = 0;
  _$jscoverage['/timer/color.js'].lineData[56] = 0;
  _$jscoverage['/timer/color.js'].lineData[63] = 0;
  _$jscoverage['/timer/color.js'].lineData[64] = 0;
  _$jscoverage['/timer/color.js'].lineData[65] = 0;
  _$jscoverage['/timer/color.js'].lineData[66] = 0;
  _$jscoverage['/timer/color.js'].lineData[69] = 0;
  _$jscoverage['/timer/color.js'].lineData[75] = 0;
  _$jscoverage['/timer/color.js'].lineData[76] = 0;
  _$jscoverage['/timer/color.js'].lineData[80] = 0;
  _$jscoverage['/timer/color.js'].lineData[81] = 0;
  _$jscoverage['/timer/color.js'].lineData[84] = 0;
  _$jscoverage['/timer/color.js'].lineData[85] = 0;
  _$jscoverage['/timer/color.js'].lineData[88] = 0;
  _$jscoverage['/timer/color.js'].lineData[90] = 0;
  _$jscoverage['/timer/color.js'].lineData[91] = 0;
  _$jscoverage['/timer/color.js'].lineData[92] = 0;
  _$jscoverage['/timer/color.js'].lineData[93] = 0;
  _$jscoverage['/timer/color.js'].lineData[95] = 0;
  _$jscoverage['/timer/color.js'].lineData[96] = 0;
  _$jscoverage['/timer/color.js'].lineData[101] = 0;
  _$jscoverage['/timer/color.js'].lineData[102] = 0;
  _$jscoverage['/timer/color.js'].lineData[103] = 0;
  _$jscoverage['/timer/color.js'].lineData[108] = 0;
  _$jscoverage['/timer/color.js'].lineData[109] = 0;
  _$jscoverage['/timer/color.js'].lineData[117] = 0;
  _$jscoverage['/timer/color.js'].lineData[118] = 0;
  _$jscoverage['/timer/color.js'].lineData[123] = 0;
  _$jscoverage['/timer/color.js'].lineData[124] = 0;
  _$jscoverage['/timer/color.js'].lineData[127] = 0;
  _$jscoverage['/timer/color.js'].lineData[129] = 0;
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
  _$jscoverage['/timer/color.js'].branchData['64'] = [];
  _$jscoverage['/timer/color.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['65'] = [];
  _$jscoverage['/timer/color.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['75'] = [];
  _$jscoverage['/timer/color.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['92'] = [];
  _$jscoverage['/timer/color.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['95'] = [];
  _$jscoverage['/timer/color.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['102'] = [];
  _$jscoverage['/timer/color.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['102'][3] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['108'] = [];
  _$jscoverage['/timer/color.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['108'][3] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['114'] = [];
  _$jscoverage['/timer/color.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['114'][2] = new BranchData();
}
_$jscoverage['/timer/color.js'].branchData['114'][2].init(267, 10, 'to[3] || 1');
function visit13_114_2(result) {
  _$jscoverage['/timer/color.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['114'][1].init(253, 12, 'from[3] || 1');
function visit12_114_1(result) {
  _$jscoverage['/timer/color.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['108'][3].init(416, 15, 'to.length === 4');
function visit11_108_3(result) {
  _$jscoverage['/timer/color.js'].branchData['108'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['108'][2].init(395, 17, 'from.length === 4');
function visit10_108_2(result) {
  _$jscoverage['/timer/color.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['108'][1].init(395, 36, 'from.length === 4 || to.length === 4');
function visit9_108_1(result) {
  _$jscoverage['/timer/color.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['102'][3].init(100, 15, 'to.length === 3');
function visit8_102_3(result) {
  _$jscoverage['/timer/color.js'].branchData['102'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['102'][2].init(79, 17, 'from.length === 3');
function visit7_102_2(result) {
  _$jscoverage['/timer/color.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['102'][1].init(79, 36, 'from.length === 3 && to.length === 3');
function visit6_102_1(result) {
  _$jscoverage['/timer/color.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['95'][1].init(202, 7, 'self.to');
function visit5_95_1(result) {
  _$jscoverage['/timer/color.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['92'][1].init(106, 9, 'self.from');
function visit4_92_1(result) {
  _$jscoverage['/timer/color.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['75'][1].init(921, 33, 'KEYWORDS[val = val.toLowerCase()]');
function visit3_75_1(result) {
  _$jscoverage['/timer/color.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['65'][1].init(21, 19, 'match[i].length < 2');
function visit2_65_1(result) {
  _$jscoverage['/timer/color.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['64'][1].init(29, 16, 'i < match.length');
function visit1_64_1(result) {
  _$jscoverage['/timer/color.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/timer/color.js'].functionData[0]++;
  _$jscoverage['/timer/color.js'].lineData[7]++;
  var Fx = require('./fx');
  _$jscoverage['/timer/color.js'].lineData[8]++;
  var logger = S.getLogger('s/anim/timer/color');
  _$jscoverage['/timer/color.js'].lineData[9]++;
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
      _$jscoverage['/timer/color.js'].lineData[55]++;
      if ((match = val.match(RE_RGBA))) {
        _$jscoverage['/timer/color.js'].lineData[56]++;
        return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10), parseInt(match[4], 10)];
      } else {
        _$jscoverage['/timer/color.js'].lineData[63]++;
        if ((match = val.match(RE_HEX))) {
          _$jscoverage['/timer/color.js'].lineData[64]++;
          for (var i = 1; visit1_64_1(i < match.length); i++) {
            _$jscoverage['/timer/color.js'].lineData[65]++;
            if (visit2_65_1(match[i].length < 2)) {
              _$jscoverage['/timer/color.js'].lineData[66]++;
              match[i] += match[i];
            }
          }
          _$jscoverage['/timer/color.js'].lineData[69]++;
          return [parseInt(match[1], HEX_BASE), parseInt(match[2], HEX_BASE), parseInt(match[3], HEX_BASE)];
        }
      }
    }
    _$jscoverage['/timer/color.js'].lineData[75]++;
    if (visit3_75_1(KEYWORDS[val = val.toLowerCase()])) {
      _$jscoverage['/timer/color.js'].lineData[76]++;
      return KEYWORDS[val];
    }
    _$jscoverage['/timer/color.js'].lineData[80]++;
    logger.warn('only allow rgb or hex color string : ' + val);
    _$jscoverage['/timer/color.js'].lineData[81]++;
    return [255, 255, 255];
  }
  _$jscoverage['/timer/color.js'].lineData[84]++;
  function ColorFx() {
    _$jscoverage['/timer/color.js'].functionData[2]++;
    _$jscoverage['/timer/color.js'].lineData[85]++;
    ColorFx.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/timer/color.js'].lineData[88]++;
  S.extend(ColorFx, Fx, {
  load: function() {
  _$jscoverage['/timer/color.js'].functionData[3]++;
  _$jscoverage['/timer/color.js'].lineData[90]++;
  var self = this;
  _$jscoverage['/timer/color.js'].lineData[91]++;
  ColorFx.superclass.load.apply(self, arguments);
  _$jscoverage['/timer/color.js'].lineData[92]++;
  if (visit4_92_1(self.from)) {
    _$jscoverage['/timer/color.js'].lineData[93]++;
    self.from = numericColor(self.from);
  }
  _$jscoverage['/timer/color.js'].lineData[95]++;
  if (visit5_95_1(self.to)) {
    _$jscoverage['/timer/color.js'].lineData[96]++;
    self.to = numericColor(self.to);
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/color.js'].functionData[4]++;
  _$jscoverage['/timer/color.js'].lineData[101]++;
  var interpolate = ColorFx.superclass.interpolate;
  _$jscoverage['/timer/color.js'].lineData[102]++;
  if (visit6_102_1(visit7_102_2(from.length === 3) && visit8_102_3(to.length === 3))) {
    _$jscoverage['/timer/color.js'].lineData[103]++;
    return 'rgb(' + [floor(interpolate(from[0], to[0], pos)), floor(interpolate(from[1], to[1], pos)), floor(interpolate(from[2], to[2], pos))].join(', ') + ')';
  } else {
    _$jscoverage['/timer/color.js'].lineData[108]++;
    if (visit9_108_1(visit10_108_2(from.length === 4) || visit11_108_3(to.length === 4))) {
      _$jscoverage['/timer/color.js'].lineData[109]++;
      return 'rgba(' + [floor(interpolate(from[0], to[0], pos)), floor(interpolate(from[1], to[1], pos)), floor(interpolate(from[2], to[2], pos)), floor(interpolate(visit12_114_1(from[3] || 1), visit13_114_2(to[3] || 1), pos))].join(', ') + ')';
    } else {
      _$jscoverage['/timer/color.js'].lineData[117]++;
      logger.warn('unknown value : ' + from);
      _$jscoverage['/timer/color.js'].lineData[118]++;
      return undefined;
    }
  }
}});
  _$jscoverage['/timer/color.js'].lineData[123]++;
  S.each(COLORS, function(color) {
  _$jscoverage['/timer/color.js'].functionData[5]++;
  _$jscoverage['/timer/color.js'].lineData[124]++;
  Fx.Factories[color] = ColorFx;
});
  _$jscoverage['/timer/color.js'].lineData[127]++;
  Fx.FxTypes.color = ColorFx;
  _$jscoverage['/timer/color.js'].lineData[129]++;
  return ColorFx;
});
