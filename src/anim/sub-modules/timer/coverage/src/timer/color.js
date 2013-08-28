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
  _$jscoverage['/timer/color.js'].lineData[41] = 0;
  _$jscoverage['/timer/color.js'].lineData[43] = 0;
  _$jscoverage['/timer/color.js'].lineData[50] = 0;
  _$jscoverage['/timer/color.js'].lineData[57] = 0;
  _$jscoverage['/timer/color.js'].lineData[61] = 0;
  _$jscoverage['/timer/color.js'].lineData[65] = 0;
  _$jscoverage['/timer/color.js'].lineData[69] = 0;
  _$jscoverage['/timer/color.js'].lineData[74] = 0;
  _$jscoverage['/timer/color.js'].lineData[75] = 0;
  _$jscoverage['/timer/color.js'].lineData[76] = 0;
  _$jscoverage['/timer/color.js'].lineData[77] = 0;
  _$jscoverage['/timer/color.js'].lineData[78] = 0;
  _$jscoverage['/timer/color.js'].lineData[84] = 0;
  _$jscoverage['/timer/color.js'].lineData[85] = 0;
  _$jscoverage['/timer/color.js'].lineData[92] = 0;
  _$jscoverage['/timer/color.js'].lineData[93] = 0;
  _$jscoverage['/timer/color.js'].lineData[94] = 0;
  _$jscoverage['/timer/color.js'].lineData[95] = 0;
  _$jscoverage['/timer/color.js'].lineData[98] = 0;
  _$jscoverage['/timer/color.js'].lineData[104] = 0;
  _$jscoverage['/timer/color.js'].lineData[105] = 0;
  _$jscoverage['/timer/color.js'].lineData[109] = 0;
  _$jscoverage['/timer/color.js'].lineData[110] = 0;
  _$jscoverage['/timer/color.js'].lineData[113] = 0;
  _$jscoverage['/timer/color.js'].lineData[114] = 0;
  _$jscoverage['/timer/color.js'].lineData[117] = 0;
  _$jscoverage['/timer/color.js'].lineData[119] = 0;
  _$jscoverage['/timer/color.js'].lineData[120] = 0;
  _$jscoverage['/timer/color.js'].lineData[121] = 0;
  _$jscoverage['/timer/color.js'].lineData[122] = 0;
  _$jscoverage['/timer/color.js'].lineData[124] = 0;
  _$jscoverage['/timer/color.js'].lineData[125] = 0;
  _$jscoverage['/timer/color.js'].lineData[130] = 0;
  _$jscoverage['/timer/color.js'].lineData[131] = 0;
  _$jscoverage['/timer/color.js'].lineData[132] = 0;
  _$jscoverage['/timer/color.js'].lineData[137] = 0;
  _$jscoverage['/timer/color.js'].lineData[138] = 0;
  _$jscoverage['/timer/color.js'].lineData[146] = 0;
  _$jscoverage['/timer/color.js'].lineData[151] = 0;
  _$jscoverage['/timer/color.js'].lineData[152] = 0;
  _$jscoverage['/timer/color.js'].lineData[155] = 0;
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
  _$jscoverage['/timer/color.js'].branchData['77'] = [];
  _$jscoverage['/timer/color.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['84'] = [];
  _$jscoverage['/timer/color.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['92'] = [];
  _$jscoverage['/timer/color.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['93'] = [];
  _$jscoverage['/timer/color.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['94'] = [];
  _$jscoverage['/timer/color.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['104'] = [];
  _$jscoverage['/timer/color.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['121'] = [];
  _$jscoverage['/timer/color.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['124'] = [];
  _$jscoverage['/timer/color.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['131'] = [];
  _$jscoverage['/timer/color.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['131'][3] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['137'] = [];
  _$jscoverage['/timer/color.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['137'][3] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['143'] = [];
  _$jscoverage['/timer/color.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/timer/color.js'].branchData['143'][2] = new BranchData();
}
_$jscoverage['/timer/color.js'].branchData['143'][2].init(272, 10, 'to[3] || 1');
function visit16_143_2(result) {
  _$jscoverage['/timer/color.js'].branchData['143'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['143'][1].init(258, 12, 'from[3] || 1');
function visit15_143_1(result) {
  _$jscoverage['/timer/color.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['137'][3].init(421, 14, 'to.length == 4');
function visit14_137_3(result) {
  _$jscoverage['/timer/color.js'].branchData['137'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['137'][2].init(401, 16, 'from.length == 4');
function visit13_137_2(result) {
  _$jscoverage['/timer/color.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['137'][1].init(401, 34, 'from.length == 4 || to.length == 4');
function visit12_137_1(result) {
  _$jscoverage['/timer/color.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['131'][3].init(101, 14, 'to.length == 3');
function visit11_131_3(result) {
  _$jscoverage['/timer/color.js'].branchData['131'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['131'][2].init(81, 16, 'from.length == 3');
function visit10_131_2(result) {
  _$jscoverage['/timer/color.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['131'][1].init(81, 34, 'from.length == 3 && to.length == 3');
function visit9_131_1(result) {
  _$jscoverage['/timer/color.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['124'][1].init(208, 7, 'self.to');
function visit8_124_1(result) {
  _$jscoverage['/timer/color.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['121'][1].init(109, 9, 'self.from');
function visit7_121_1(result) {
  _$jscoverage['/timer/color.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['104'][1].init(917, 33, 'KEYWORDS[val = val.toLowerCase()]');
function visit6_104_1(result) {
  _$jscoverage['/timer/color.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['94'][1].init(22, 19, 'match[i].length < 2');
function visit5_94_1(result) {
  _$jscoverage['/timer/color.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['93'][1].init(30, 16, 'i < match.length');
function visit4_93_1(result) {
  _$jscoverage['/timer/color.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['92'][1].init(513, 25, 'match = val.match(re_hex)');
function visit3_92_1(result) {
  _$jscoverage['/timer/color.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['84'][1].init(268, 26, 'match = val.match(re_RGBA)');
function visit2_84_1(result) {
  _$jscoverage['/timer/color.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].branchData['77'][1].init(61, 25, 'match = val.match(re_RGB)');
function visit1_77_1(result) {
  _$jscoverage['/timer/color.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/color.js'].lineData[6]++;
KISSY.add('anim/timer/color', function(S, Dom, Fx, SHORT_HANDS) {
  _$jscoverage['/timer/color.js'].functionData[0]++;
  _$jscoverage['/timer/color.js'].lineData[7]++;
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
  _$jscoverage['/timer/color.js'].lineData[41]++;
  SHORT_HANDS['background'].push('backgroundColor');
  _$jscoverage['/timer/color.js'].lineData[43]++;
  SHORT_HANDS['borderColor'] = ['borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor'];
  _$jscoverage['/timer/color.js'].lineData[50]++;
  SHORT_HANDS['border'].push('borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor');
  _$jscoverage['/timer/color.js'].lineData[57]++;
  SHORT_HANDS['borderBottom'].push('borderBottomColor');
  _$jscoverage['/timer/color.js'].lineData[61]++;
  SHORT_HANDS['borderLeft'].push('borderLeftColor');
  _$jscoverage['/timer/color.js'].lineData[65]++;
  SHORT_HANDS['borderRight'].push('borderRightColor');
  _$jscoverage['/timer/color.js'].lineData[69]++;
  SHORT_HANDS['borderTop'].push('borderTopColor');
  _$jscoverage['/timer/color.js'].lineData[74]++;
  function numericColor(val) {
    _$jscoverage['/timer/color.js'].functionData[1]++;
    _$jscoverage['/timer/color.js'].lineData[75]++;
    val = (val + '');
    _$jscoverage['/timer/color.js'].lineData[76]++;
    var match;
    _$jscoverage['/timer/color.js'].lineData[77]++;
    if (visit1_77_1(match = val.match(re_RGB))) {
      _$jscoverage['/timer/color.js'].lineData[78]++;
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    } else {
      _$jscoverage['/timer/color.js'].lineData[84]++;
      if (visit2_84_1(match = val.match(re_RGBA))) {
        _$jscoverage['/timer/color.js'].lineData[85]++;
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];
      } else {
        _$jscoverage['/timer/color.js'].lineData[92]++;
        if (visit3_92_1(match = val.match(re_hex))) {
          _$jscoverage['/timer/color.js'].lineData[93]++;
          for (var i = 1; visit4_93_1(i < match.length); i++) {
            _$jscoverage['/timer/color.js'].lineData[94]++;
            if (visit5_94_1(match[i].length < 2)) {
              _$jscoverage['/timer/color.js'].lineData[95]++;
              match[i] += match[i];
            }
          }
          _$jscoverage['/timer/color.js'].lineData[98]++;
          return [parseInt(match[1], HEX_BASE), parseInt(match[2], HEX_BASE), parseInt(match[3], HEX_BASE)];
        }
      }
    }
    _$jscoverage['/timer/color.js'].lineData[104]++;
    if (visit6_104_1(KEYWORDS[val = val.toLowerCase()])) {
      _$jscoverage['/timer/color.js'].lineData[105]++;
      return KEYWORDS[val];
    }
    _$jscoverage['/timer/color.js'].lineData[109]++;
    S.log('only allow rgb or hex color string : ' + val, 'warn');
    _$jscoverage['/timer/color.js'].lineData[110]++;
    return [255, 255, 255];
  }
  _$jscoverage['/timer/color.js'].lineData[113]++;
  function ColorFx() {
    _$jscoverage['/timer/color.js'].functionData[2]++;
    _$jscoverage['/timer/color.js'].lineData[114]++;
    ColorFx.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/timer/color.js'].lineData[117]++;
  S.extend(ColorFx, Fx, {
  load: function() {
  _$jscoverage['/timer/color.js'].functionData[3]++;
  _$jscoverage['/timer/color.js'].lineData[119]++;
  var self = this;
  _$jscoverage['/timer/color.js'].lineData[120]++;
  ColorFx.superclass.load.apply(self, arguments);
  _$jscoverage['/timer/color.js'].lineData[121]++;
  if (visit7_121_1(self.from)) {
    _$jscoverage['/timer/color.js'].lineData[122]++;
    self.from = numericColor(self.from);
  }
  _$jscoverage['/timer/color.js'].lineData[124]++;
  if (visit8_124_1(self.to)) {
    _$jscoverage['/timer/color.js'].lineData[125]++;
    self.to = numericColor(self.to);
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/color.js'].functionData[4]++;
  _$jscoverage['/timer/color.js'].lineData[130]++;
  var interpolate = ColorFx.superclass.interpolate;
  _$jscoverage['/timer/color.js'].lineData[131]++;
  if (visit9_131_1(visit10_131_2(from.length == 3) && visit11_131_3(to.length == 3))) {
    _$jscoverage['/timer/color.js'].lineData[132]++;
    return 'rgb(' + [floor(interpolate(from[0], to[0], pos)), floor(interpolate(from[1], to[1], pos)), floor(interpolate(from[2], to[2], pos))].join(', ') + ')';
  } else {
    _$jscoverage['/timer/color.js'].lineData[137]++;
    if (visit12_137_1(visit13_137_2(from.length == 4) || visit14_137_3(to.length == 4))) {
      _$jscoverage['/timer/color.js'].lineData[138]++;
      return 'rgba(' + [floor(interpolate(from[0], to[0], pos)), floor(interpolate(from[1], to[1], pos)), floor(interpolate(from[2], to[2], pos)), floor(interpolate(visit15_143_1(from[3] || 1), visit16_143_2(to[3] || 1), pos))].join(', ') + ')';
    } else {
      _$jscoverage['/timer/color.js'].lineData[146]++;
      return S.log('anim/color unknown value : ' + from);
    }
  }
}});
  _$jscoverage['/timer/color.js'].lineData[151]++;
  S.each(COLORS, function(color) {
  _$jscoverage['/timer/color.js'].functionData[5]++;
  _$jscoverage['/timer/color.js'].lineData[152]++;
  Fx.Factories[color] = ColorFx;
});
  _$jscoverage['/timer/color.js'].lineData[155]++;
  return ColorFx;
}, {
  requires: ['dom', './fx', './short-hand']});
