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
  _$jscoverage['/timer/color.js'].lineData[8] = 0;
  _$jscoverage['/timer/color.js'].lineData[42] = 0;
  _$jscoverage['/timer/color.js'].lineData[44] = 0;
  _$jscoverage['/timer/color.js'].lineData[51] = 0;
  _$jscoverage['/timer/color.js'].lineData[58] = 0;
  _$jscoverage['/timer/color.js'].lineData[62] = 0;
  _$jscoverage['/timer/color.js'].lineData[66] = 0;
  _$jscoverage['/timer/color.js'].lineData[70] = 0;
  _$jscoverage['/timer/color.js'].lineData[75] = 0;
  _$jscoverage['/timer/color.js'].lineData[76] = 0;
  _$jscoverage['/timer/color.js'].lineData[77] = 0;
  _$jscoverage['/timer/color.js'].lineData[78] = 0;
  _$jscoverage['/timer/color.js'].lineData[79] = 0;
  _$jscoverage['/timer/color.js'].lineData[85] = 0;
  _$jscoverage['/timer/color.js'].lineData[86] = 0;
  _$jscoverage['/timer/color.js'].lineData[93] = 0;
  _$jscoverage['/timer/color.js'].lineData[94] = 0;
  _$jscoverage['/timer/color.js'].lineData[95] = 0;
  _$jscoverage['/timer/color.js'].lineData[96] = 0;
  _$jscoverage['/timer/color.js'].lineData[99] = 0;
  _$jscoverage['/timer/color.js'].lineData[105] = 0;
  _$jscoverage['/timer/color.js'].lineData[106] = 0;
  _$jscoverage['/timer/color.js'].lineData[110] = 0;
  _$jscoverage['/timer/color.js'].lineData[111] = 0;
  _$jscoverage['/timer/color.js'].lineData[114] = 0;
  _$jscoverage['/timer/color.js'].lineData[115] = 0;
  _$jscoverage['/timer/color.js'].lineData[118] = 0;
  _$jscoverage['/timer/color.js'].lineData[121] = 0;
  _$jscoverage['/timer/color.js'].lineData[122] = 0;
  _$jscoverage['/timer/color.js'].lineData[123] = 0;
  _$jscoverage['/timer/color.js'].lineData[124] = 0;
  _$jscoverage['/timer/color.js'].lineData[126] = 0;
  _$jscoverage['/timer/color.js'].lineData[127] = 0;
  _$jscoverage['/timer/color.js'].lineData[132] = 0;
  _$jscoverage['/timer/color.js'].lineData[133] = 0;
  _$jscoverage['/timer/color.js'].lineData[134] = 0;
  _$jscoverage['/timer/color.js'].lineData[139] = 0;
  _$jscoverage['/timer/color.js'].lineData[140] = 0;
  _$jscoverage['/timer/color.js'].lineData[148] = 0;
  _$jscoverage['/timer/color.js'].lineData[154] = 0;
  _$jscoverage['/timer/color.js'].lineData[155] = 0;
  _$jscoverage['/timer/color.js'].lineData[158] = 0;
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
  _$jscoverage['/timer/color.js'].branchData['78'] = [];
  _$jscoverage['/timer/color.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['85'] = [];
  _$jscoverage['/timer/color.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['93'] = [];
  _$jscoverage['/timer/color.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['94'] = [];
  _$jscoverage['/timer/color.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['95'] = [];
  _$jscoverage['/timer/color.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['105'] = [];
  _$jscoverage['/timer/color.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['123'] = [];
  _$jscoverage['/timer/color.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['126'] = [];
  _$jscoverage['/timer/color.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['133'] = [];
  _$jscoverage['/timer/color.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['133'][2] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['133'][3] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['139'] = [];
  _$jscoverage['/timer/color.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['139'][3] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['145'] = [];
  _$jscoverage['/timer/color.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['145'][2] = new BranchData();
}
_$jscoverage['/timer/color.js'].branchData['145'][2].init(272, 10, 'to[3] || 1');
function visit16_145_2(result) {
  _$jscoverage['/timer/color.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['145'][1].init(258, 12, 'from[3] || 1');
function visit15_145_1(result) {
  _$jscoverage['/timer/color.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['139'][3].init(421, 14, 'to.length == 4');
function visit14_139_3(result) {
  _$jscoverage['/timer/color.js'].branchData['139'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['139'][2].init(401, 16, 'from.length == 4');
function visit13_139_2(result) {
  _$jscoverage['/timer/color.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['139'][1].init(401, 34, 'from.length == 4 || to.length == 4');
function visit12_139_1(result) {
  _$jscoverage['/timer/color.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['133'][3].init(101, 14, 'to.length == 3');
function visit11_133_3(result) {
  _$jscoverage['/timer/color.js'].branchData['133'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['133'][2].init(81, 16, 'from.length == 3');
function visit10_133_2(result) {
  _$jscoverage['/timer/color.js'].branchData['133'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['133'][1].init(81, 34, 'from.length == 3 && to.length == 3');
function visit9_133_1(result) {
  _$jscoverage['/timer/color.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['126'][1].init(208, 7, 'self.to');
function visit8_126_1(result) {
  _$jscoverage['/timer/color.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['123'][1].init(109, 9, 'self.from');
function visit7_123_1(result) {
  _$jscoverage['/timer/color.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['105'][1].init(917, 33, 'KEYWORDS[val = val.toLowerCase()]');
function visit6_105_1(result) {
  _$jscoverage['/timer/color.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['95'][1].init(22, 19, 'match[i].length < 2');
function visit5_95_1(result) {
  _$jscoverage['/timer/color.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['94'][1].init(30, 16, 'i < match.length');
function visit4_94_1(result) {
  _$jscoverage['/timer/color.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['93'][1].init(513, 25, 'match = val.match(re_hex)');
function visit3_93_1(result) {
  _$jscoverage['/timer/color.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['85'][1].init(268, 26, 'match = val.match(re_RGBA)');
function visit2_85_1(result) {
  _$jscoverage['/timer/color.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['78'][1].init(61, 25, 'match = val.match(re_RGB)');
function visit1_78_1(result) {
  _$jscoverage['/timer/color.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].lineData[6]++;
KISSY.add('anim/timer/color', function(S, Dom, Fx, SHORT_HANDS) {
  _$jscoverage['/timer/color.js'].functionData[0]++;
  _$jscoverage['/timer/color.js'].lineData[8]++;
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
  'aqua': [0, 255, 255]}, re_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i, re_RGBA = /^rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+),\s*([0-9]+)\)$/i, re_hex = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i, COLORS = ['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'];
  _$jscoverage['/timer/color.js'].lineData[42]++;
  SHORT_HANDS['background'].push('backgroundColor');
  _$jscoverage['/timer/color.js'].lineData[44]++;
  SHORT_HANDS['borderColor'] = ['borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor'];
  _$jscoverage['/timer/color.js'].lineData[51]++;
  SHORT_HANDS['border'].push('borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor');
  _$jscoverage['/timer/color.js'].lineData[58]++;
  SHORT_HANDS['borderBottom'].push('borderBottomColor');
  _$jscoverage['/timer/color.js'].lineData[62]++;
  SHORT_HANDS['borderLeft'].push('borderLeftColor');
  _$jscoverage['/timer/color.js'].lineData[66]++;
  SHORT_HANDS['borderRight'].push('borderRightColor');
  _$jscoverage['/timer/color.js'].lineData[70]++;
  SHORT_HANDS['borderTop'].push('borderTopColor');
  _$jscoverage['/timer/color.js'].lineData[75]++;
  function numericColor(val) {
    _$jscoverage['/timer/color.js'].functionData[1]++;
    _$jscoverage['/timer/color.js'].lineData[76]++;
    val = (val + '');
    _$jscoverage['/timer/color.js'].lineData[77]++;
    var match;
    _$jscoverage['/timer/color.js'].lineData[78]++;
    if (visit1_78_1(match = val.match(re_RGB))) {
      _$jscoverage['/timer/color.js'].lineData[79]++;
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    } else {
      _$jscoverage['/timer/color.js'].lineData[85]++;
      if (visit2_85_1(match = val.match(re_RGBA))) {
        _$jscoverage['/timer/color.js'].lineData[86]++;
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];
      } else {
        _$jscoverage['/timer/color.js'].lineData[93]++;
        if (visit3_93_1(match = val.match(re_hex))) {
          _$jscoverage['/timer/color.js'].lineData[94]++;
          for (var i = 1; visit4_94_1(i < match.length); i++) {
            _$jscoverage['/timer/color.js'].lineData[95]++;
            if (visit5_95_1(match[i].length < 2)) {
              _$jscoverage['/timer/color.js'].lineData[96]++;
              match[i] += match[i];
            }
          }
          _$jscoverage['/timer/color.js'].lineData[99]++;
          return [parseInt(match[1], HEX_BASE), parseInt(match[2], HEX_BASE), parseInt(match[3], HEX_BASE)];
        }
      }
    }
    _$jscoverage['/timer/color.js'].lineData[105]++;
    if (visit6_105_1(KEYWORDS[val = val.toLowerCase()])) {
      _$jscoverage['/timer/color.js'].lineData[106]++;
      return KEYWORDS[val];
    }
    _$jscoverage['/timer/color.js'].lineData[110]++;
    S.log('only allow rgb or hex color string : ' + val, 'warn');
    _$jscoverage['/timer/color.js'].lineData[111]++;
    return [255, 255, 255];
  }
  _$jscoverage['/timer/color.js'].lineData[114]++;
  function ColorFx() {
    _$jscoverage['/timer/color.js'].functionData[2]++;
    _$jscoverage['/timer/color.js'].lineData[115]++;
    ColorFx.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/timer/color.js'].lineData[118]++;
  S.extend(ColorFx, Fx, {
  load: function() {
  _$jscoverage['/timer/color.js'].functionData[3]++;
  _$jscoverage['/timer/color.js'].lineData[121]++;
  var self = this;
  _$jscoverage['/timer/color.js'].lineData[122]++;
  ColorFx.superclass.load.apply(self, arguments);
  _$jscoverage['/timer/color.js'].lineData[123]++;
  if (visit7_123_1(self.from)) {
    _$jscoverage['/timer/color.js'].lineData[124]++;
    self.from = numericColor(self.from);
  }
  _$jscoverage['/timer/color.js'].lineData[126]++;
  if (visit8_126_1(self.to)) {
    _$jscoverage['/timer/color.js'].lineData[127]++;
    self.to = numericColor(self.to);
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/color.js'].functionData[4]++;
  _$jscoverage['/timer/color.js'].lineData[132]++;
  var interpolate = ColorFx.superclass.interpolate;
  _$jscoverage['/timer/color.js'].lineData[133]++;
  if (visit9_133_1(visit10_133_2(from.length == 3) && visit11_133_3(to.length == 3))) {
    _$jscoverage['/timer/color.js'].lineData[134]++;
    return 'rgb(' + [floor(interpolate(from[0], to[0], pos)), floor(interpolate(from[1], to[1], pos)), floor(interpolate(from[2], to[2], pos))].join(', ') + ')';
  } else {
    _$jscoverage['/timer/color.js'].lineData[139]++;
    if (visit12_139_1(visit13_139_2(from.length == 4) || visit14_139_3(to.length == 4))) {
      _$jscoverage['/timer/color.js'].lineData[140]++;
      return 'rgba(' + [floor(interpolate(from[0], to[0], pos)), floor(interpolate(from[1], to[1], pos)), floor(interpolate(from[2], to[2], pos)), floor(interpolate(visit15_145_1(from[3] || 1), visit16_145_2(to[3] || 1), pos))].join(', ') + ')';
    } else {
      _$jscoverage['/timer/color.js'].lineData[148]++;
      return S.log('anim/color unknown value : ' + from);
    }
  }
}});
  _$jscoverage['/timer/color.js'].lineData[154]++;
  S.each(COLORS, function(color) {
  _$jscoverage['/timer/color.js'].functionData[5]++;
  _$jscoverage['/timer/color.js'].lineData[155]++;
  Fx.Factories[color] = ColorFx;
});
  _$jscoverage['/timer/color.js'].lineData[158]++;
  return ColorFx;
}, {
  requires: ['dom', './fx', './short-hand']});
