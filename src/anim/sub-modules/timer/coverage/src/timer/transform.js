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
if (! _$jscoverage['/timer/transform.js']) {
  _$jscoverage['/timer/transform.js'] = {};
  _$jscoverage['/timer/transform.js'].lineData = [];
  _$jscoverage['/timer/transform.js'].lineData[6] = 0;
  _$jscoverage['/timer/transform.js'].lineData[7] = 0;
  _$jscoverage['/timer/transform.js'].lineData[8] = 0;
  _$jscoverage['/timer/transform.js'].lineData[9] = 0;
  _$jscoverage['/timer/transform.js'].lineData[13] = 0;
  _$jscoverage['/timer/transform.js'].lineData[14] = 0;
  _$jscoverage['/timer/transform.js'].lineData[15] = 0;
  _$jscoverage['/timer/transform.js'].lineData[16] = 0;
  _$jscoverage['/timer/transform.js'].lineData[18] = 0;
  _$jscoverage['/timer/transform.js'].lineData[22] = 0;
  _$jscoverage['/timer/transform.js'].lineData[23] = 0;
  _$jscoverage['/timer/transform.js'].lineData[24] = 0;
  _$jscoverage['/timer/transform.js'].lineData[31] = 0;
  _$jscoverage['/timer/transform.js'].lineData[33] = 0;
  _$jscoverage['/timer/transform.js'].lineData[34] = 0;
  _$jscoverage['/timer/transform.js'].lineData[35] = 0;
  _$jscoverage['/timer/transform.js'].lineData[37] = 0;
  _$jscoverage['/timer/transform.js'].lineData[38] = 0;
  _$jscoverage['/timer/transform.js'].lineData[39] = 0;
  _$jscoverage['/timer/transform.js'].lineData[41] = 0;
  _$jscoverage['/timer/transform.js'].lineData[42] = 0;
  _$jscoverage['/timer/transform.js'].lineData[43] = 0;
  _$jscoverage['/timer/transform.js'].lineData[44] = 0;
  _$jscoverage['/timer/transform.js'].lineData[46] = 0;
  _$jscoverage['/timer/transform.js'].lineData[47] = 0;
  _$jscoverage['/timer/transform.js'].lineData[48] = 0;
  _$jscoverage['/timer/transform.js'].lineData[49] = 0;
  _$jscoverage['/timer/transform.js'].lineData[50] = 0;
  _$jscoverage['/timer/transform.js'].lineData[55] = 0;
  _$jscoverage['/timer/transform.js'].lineData[60] = 0;
  _$jscoverage['/timer/transform.js'].lineData[71] = 0;
  _$jscoverage['/timer/transform.js'].lineData[72] = 0;
  _$jscoverage['/timer/transform.js'].lineData[83] = 0;
  _$jscoverage['/timer/transform.js'].lineData[84] = 0;
  _$jscoverage['/timer/transform.js'].lineData[87] = 0;
  _$jscoverage['/timer/transform.js'].lineData[88] = 0;
  _$jscoverage['/timer/transform.js'].lineData[89] = 0;
  _$jscoverage['/timer/transform.js'].lineData[95] = 0;
  _$jscoverage['/timer/transform.js'].lineData[96] = 0;
  _$jscoverage['/timer/transform.js'].lineData[102] = 0;
  _$jscoverage['/timer/transform.js'].lineData[103] = 0;
  _$jscoverage['/timer/transform.js'].lineData[104] = 0;
  _$jscoverage['/timer/transform.js'].lineData[105] = 0;
  _$jscoverage['/timer/transform.js'].lineData[106] = 0;
  _$jscoverage['/timer/transform.js'].lineData[111] = 0;
  _$jscoverage['/timer/transform.js'].lineData[112] = 0;
  _$jscoverage['/timer/transform.js'].lineData[117] = 0;
  _$jscoverage['/timer/transform.js'].lineData[118] = 0;
  _$jscoverage['/timer/transform.js'].lineData[121] = 0;
  _$jscoverage['/timer/transform.js'].lineData[122] = 0;
  _$jscoverage['/timer/transform.js'].lineData[123] = 0;
  _$jscoverage['/timer/transform.js'].lineData[124] = 0;
  _$jscoverage['/timer/transform.js'].lineData[126] = 0;
  _$jscoverage['/timer/transform.js'].lineData[130] = 0;
  _$jscoverage['/timer/transform.js'].lineData[131] = 0;
  _$jscoverage['/timer/transform.js'].lineData[132] = 0;
  _$jscoverage['/timer/transform.js'].lineData[133] = 0;
  _$jscoverage['/timer/transform.js'].lineData[136] = 0;
  _$jscoverage['/timer/transform.js'].lineData[137] = 0;
  _$jscoverage['/timer/transform.js'].lineData[138] = 0;
  _$jscoverage['/timer/transform.js'].lineData[139] = 0;
  _$jscoverage['/timer/transform.js'].lineData[142] = 0;
  _$jscoverage['/timer/transform.js'].lineData[146] = 0;
  _$jscoverage['/timer/transform.js'].lineData[149] = 0;
  _$jscoverage['/timer/transform.js'].lineData[150] = 0;
  _$jscoverage['/timer/transform.js'].lineData[153] = 0;
  _$jscoverage['/timer/transform.js'].lineData[155] = 0;
  _$jscoverage['/timer/transform.js'].lineData[156] = 0;
  _$jscoverage['/timer/transform.js'].lineData[158] = 0;
  _$jscoverage['/timer/transform.js'].lineData[159] = 0;
  _$jscoverage['/timer/transform.js'].lineData[160] = 0;
  _$jscoverage['/timer/transform.js'].lineData[162] = 0;
  _$jscoverage['/timer/transform.js'].lineData[164] = 0;
  _$jscoverage['/timer/transform.js'].lineData[165] = 0;
  _$jscoverage['/timer/transform.js'].lineData[167] = 0;
  _$jscoverage['/timer/transform.js'].lineData[172] = 0;
  _$jscoverage['/timer/transform.js'].lineData[173] = 0;
  _$jscoverage['/timer/transform.js'].lineData[174] = 0;
  _$jscoverage['/timer/transform.js'].lineData[175] = 0;
  _$jscoverage['/timer/transform.js'].lineData[176] = 0;
  _$jscoverage['/timer/transform.js'].lineData[177] = 0;
  _$jscoverage['/timer/transform.js'].lineData[178] = 0;
  _$jscoverage['/timer/transform.js'].lineData[179] = 0;
  _$jscoverage['/timer/transform.js'].lineData[180] = 0;
  _$jscoverage['/timer/transform.js'].lineData[181] = 0;
  _$jscoverage['/timer/transform.js'].lineData[189] = 0;
  _$jscoverage['/timer/transform.js'].lineData[191] = 0;
}
if (! _$jscoverage['/timer/transform.js'].functionData) {
  _$jscoverage['/timer/transform.js'].functionData = [];
  _$jscoverage['/timer/transform.js'].functionData[0] = 0;
  _$jscoverage['/timer/transform.js'].functionData[1] = 0;
  _$jscoverage['/timer/transform.js'].functionData[2] = 0;
  _$jscoverage['/timer/transform.js'].functionData[3] = 0;
  _$jscoverage['/timer/transform.js'].functionData[4] = 0;
  _$jscoverage['/timer/transform.js'].functionData[5] = 0;
  _$jscoverage['/timer/transform.js'].functionData[6] = 0;
  _$jscoverage['/timer/transform.js'].functionData[7] = 0;
  _$jscoverage['/timer/transform.js'].functionData[8] = 0;
  _$jscoverage['/timer/transform.js'].functionData[9] = 0;
  _$jscoverage['/timer/transform.js'].functionData[10] = 0;
}
if (! _$jscoverage['/timer/transform.js'].branchData) {
  _$jscoverage['/timer/transform.js'].branchData = {};
  _$jscoverage['/timer/transform.js'].branchData['31'] = [];
  _$jscoverage['/timer/transform.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['46'] = [];
  _$jscoverage['/timer/transform.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['96'] = [];
  _$jscoverage['/timer/transform.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['102'] = [];
  _$jscoverage['/timer/transform.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['123'] = [];
  _$jscoverage['/timer/transform.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['132'] = [];
  _$jscoverage['/timer/transform.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['138'] = [];
  _$jscoverage['/timer/transform.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['158'] = [];
  _$jscoverage['/timer/transform.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['159'] = [];
  _$jscoverage['/timer/transform.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['159'][2] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['164'] = [];
  _$jscoverage['/timer/transform.js'].branchData['164'][1] = new BranchData();
}
_$jscoverage['/timer/transform.js'].branchData['164'][1].init(449, 7, 'self.to');
function visit85_164_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['159'][2].init(264, 20, 'self.from !== \'none\'');
function visit84_159_2(result) {
  _$jscoverage['/timer/transform.js'].branchData['159'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['159'][1].init(251, 33, 'self.from && self.from !== \'none\'');
function visit83_159_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['158'][1].init(181, 51, 'Dom.style(self.anim.node, \'transform\') || self.from');
function visit82_158_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['138'][1].init(149, 16, 'val[1] || val[0]');
function visit81_138_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['132'][1].init(163, 11, 'val[1] || 0');
function visit80_132_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['123'][1].init(140, 14, 'val.length > 1');
function visit79_123_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['102'][1].init(489, 7, '++i < l');
function visit78_102_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['96'][1].init(21, 25, 'value.indexOf(\'deg\') > -1');
function visit77_96_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['46'][1].init(438, 13, 'A * D < B * C');
function visit76_46_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['31'][1].init(252, 13, 'A * D - B * C');
function visit75_31_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/timer/transform.js'].functionData[0]++;
  _$jscoverage['/timer/transform.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/timer/transform.js'].lineData[8]++;
  var Fx = require('./fx');
  _$jscoverage['/timer/transform.js'].lineData[9]++;
  var translateTpl = S.Features.isTransform3dSupported() ? 'translate3d({translateX}px,{translateY}px,0)' : 'translate({translateX}px,{translateY}px)';
  _$jscoverage['/timer/transform.js'].lineData[13]++;
  function toMatrixArray(matrix) {
    _$jscoverage['/timer/transform.js'].functionData[1]++;
    _$jscoverage['/timer/transform.js'].lineData[14]++;
    matrix = matrix.split(/,/);
    _$jscoverage['/timer/transform.js'].lineData[15]++;
    matrix = S.map(matrix, function(v) {
  _$jscoverage['/timer/transform.js'].functionData[2]++;
  _$jscoverage['/timer/transform.js'].lineData[16]++;
  return myParse(v);
});
    _$jscoverage['/timer/transform.js'].lineData[18]++;
    return matrix;
  }
  _$jscoverage['/timer/transform.js'].lineData[22]++;
  function decomposeMatrix(matrix) {
    _$jscoverage['/timer/transform.js'].functionData[3]++;
    _$jscoverage['/timer/transform.js'].lineData[23]++;
    matrix = toMatrixArray(matrix);
    _$jscoverage['/timer/transform.js'].lineData[24]++;
    var scaleX, scaleY, skew, A = matrix[0], B = matrix[1], C = matrix[2], D = matrix[3];
    _$jscoverage['/timer/transform.js'].lineData[31]++;
    if (visit75_31_1(A * D - B * C)) {
      _$jscoverage['/timer/transform.js'].lineData[33]++;
      scaleX = Math.sqrt(A * A + B * B);
      _$jscoverage['/timer/transform.js'].lineData[34]++;
      A /= scaleX;
      _$jscoverage['/timer/transform.js'].lineData[35]++;
      B /= scaleX;
      _$jscoverage['/timer/transform.js'].lineData[37]++;
      skew = A * C + B * D;
      _$jscoverage['/timer/transform.js'].lineData[38]++;
      C -= A * skew;
      _$jscoverage['/timer/transform.js'].lineData[39]++;
      D -= B * skew;
      _$jscoverage['/timer/transform.js'].lineData[41]++;
      scaleY = Math.sqrt(C * C + D * D);
      _$jscoverage['/timer/transform.js'].lineData[42]++;
      C /= scaleY;
      _$jscoverage['/timer/transform.js'].lineData[43]++;
      D /= scaleY;
      _$jscoverage['/timer/transform.js'].lineData[44]++;
      skew /= scaleY;
      _$jscoverage['/timer/transform.js'].lineData[46]++;
      if (visit76_46_1(A * D < B * C)) {
        _$jscoverage['/timer/transform.js'].lineData[47]++;
        A = -A;
        _$jscoverage['/timer/transform.js'].lineData[48]++;
        B = -B;
        _$jscoverage['/timer/transform.js'].lineData[49]++;
        skew = -skew;
        _$jscoverage['/timer/transform.js'].lineData[50]++;
        scaleX = -scaleX;
      }
    } else {
      _$jscoverage['/timer/transform.js'].lineData[55]++;
      scaleX = scaleY = skew = 0;
    }
    _$jscoverage['/timer/transform.js'].lineData[60]++;
    return {
  'translateX': myParse(matrix[4]), 
  'translateY': myParse(matrix[5]), 
  'rotate': myParse(Math.atan2(B, A) * 180 / Math.PI), 
  'skewX': myParse(Math.atan(skew) * 180 / Math.PI), 
  'skewY': 0, 
  'scaleX': myParse(scaleX), 
  'scaleY': myParse(scaleY)};
  }
  _$jscoverage['/timer/transform.js'].lineData[71]++;
  function defaultDecompose() {
    _$jscoverage['/timer/transform.js'].functionData[4]++;
    _$jscoverage['/timer/transform.js'].lineData[72]++;
    return {
  'translateX': 0, 
  'translateY': 0, 
  'rotate': 0, 
  'skewX': 0, 
  'skewY': 0, 
  'scaleX': 1, 
  'scaleY': 1};
  }
  _$jscoverage['/timer/transform.js'].lineData[83]++;
  function myParse(v) {
    _$jscoverage['/timer/transform.js'].functionData[5]++;
    _$jscoverage['/timer/transform.js'].lineData[84]++;
    return Math.round(parseFloat(v) * 1e5) / 1e5;
  }
  _$jscoverage['/timer/transform.js'].lineData[87]++;
  function getTransformInfo(transform) {
    _$jscoverage['/timer/transform.js'].functionData[6]++;
    _$jscoverage['/timer/transform.js'].lineData[88]++;
    transform = transform.split(')');
    _$jscoverage['/timer/transform.js'].lineData[89]++;
    var trim = S.trim, i = -1, l = transform.length - 1, split, prop, val, ret = defaultDecompose();
    _$jscoverage['/timer/transform.js'].lineData[95]++;
    function toRadian(value) {
      _$jscoverage['/timer/transform.js'].functionData[7]++;
      _$jscoverage['/timer/transform.js'].lineData[96]++;
      return visit77_96_1(value.indexOf('deg') > -1) ? parseInt(value, 10) * (Math.PI * 2 / 360) : parseFloat(value);
    }
    _$jscoverage['/timer/transform.js'].lineData[102]++;
    while (visit78_102_1(++i < l)) {
      _$jscoverage['/timer/transform.js'].lineData[103]++;
      split = transform[i].split('(');
      _$jscoverage['/timer/transform.js'].lineData[104]++;
      prop = trim(split[0]);
      _$jscoverage['/timer/transform.js'].lineData[105]++;
      val = split[1];
      _$jscoverage['/timer/transform.js'].lineData[106]++;
      switch (prop) {
        case 'translateX':
        case 'translateY':
        case 'scaleX':
        case 'scaleY':
          _$jscoverage['/timer/transform.js'].lineData[111]++;
          ret[prop] = myParse(val);
          _$jscoverage['/timer/transform.js'].lineData[112]++;
          break;
        case 'rotate':
        case 'skewX':
        case 'skewY':
          _$jscoverage['/timer/transform.js'].lineData[117]++;
          ret[prop] = myParse(toRadian(val));
          _$jscoverage['/timer/transform.js'].lineData[118]++;
          break;
        case 'skew':
          _$jscoverage['/timer/transform.js'].lineData[121]++;
          val = val.split(',');
          _$jscoverage['/timer/transform.js'].lineData[122]++;
          ret.skewX = myParse(toRadian(val[0]));
          _$jscoverage['/timer/transform.js'].lineData[123]++;
          if (visit79_123_1(val.length > 1)) {
            _$jscoverage['/timer/transform.js'].lineData[124]++;
            ret.skewY = myParse(toRadian(val[1]));
          }
          _$jscoverage['/timer/transform.js'].lineData[126]++;
          break;
        case 'translate':
        case 'translate3d':
          _$jscoverage['/timer/transform.js'].lineData[130]++;
          val = val.split(',');
          _$jscoverage['/timer/transform.js'].lineData[131]++;
          ret.translateX = myParse(val[0]);
          _$jscoverage['/timer/transform.js'].lineData[132]++;
          ret.translateY = myParse(visit80_132_1(val[1] || 0));
          _$jscoverage['/timer/transform.js'].lineData[133]++;
          break;
        case 'scale':
          _$jscoverage['/timer/transform.js'].lineData[136]++;
          val = val.split(',');
          _$jscoverage['/timer/transform.js'].lineData[137]++;
          ret.scaleX = myParse(val[0]);
          _$jscoverage['/timer/transform.js'].lineData[138]++;
          ret.scaleY = myParse(visit81_138_1(val[1] || val[0]));
          _$jscoverage['/timer/transform.js'].lineData[139]++;
          break;
        case 'matrix':
          _$jscoverage['/timer/transform.js'].lineData[142]++;
          return decomposeMatrix(val);
      }
    }
    _$jscoverage['/timer/transform.js'].lineData[146]++;
    return ret;
  }
  _$jscoverage['/timer/transform.js'].lineData[149]++;
  function TransformFx() {
    _$jscoverage['/timer/transform.js'].functionData[8]++;
    _$jscoverage['/timer/transform.js'].lineData[150]++;
    TransformFx.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/timer/transform.js'].lineData[153]++;
  S.extend(TransformFx, Fx, {
  load: function() {
  _$jscoverage['/timer/transform.js'].functionData[9]++;
  _$jscoverage['/timer/transform.js'].lineData[155]++;
  var self = this;
  _$jscoverage['/timer/transform.js'].lineData[156]++;
  TransformFx.superclass.load.apply(self, arguments);
  _$jscoverage['/timer/transform.js'].lineData[158]++;
  self.from = visit82_158_1(Dom.style(self.anim.node, 'transform') || self.from);
  _$jscoverage['/timer/transform.js'].lineData[159]++;
  if (visit83_159_1(self.from && visit84_159_2(self.from !== 'none'))) {
    _$jscoverage['/timer/transform.js'].lineData[160]++;
    self.from = getTransformInfo(self.from);
  } else {
    _$jscoverage['/timer/transform.js'].lineData[162]++;
    self.from = defaultDecompose();
  }
  _$jscoverage['/timer/transform.js'].lineData[164]++;
  if (visit85_164_1(self.to)) {
    _$jscoverage['/timer/transform.js'].lineData[165]++;
    self.to = getTransformInfo(self.to);
  } else {
    _$jscoverage['/timer/transform.js'].lineData[167]++;
    self.to = defaultDecompose();
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/transform.js'].functionData[10]++;
  _$jscoverage['/timer/transform.js'].lineData[172]++;
  var interpolate = TransformFx.superclass.interpolate;
  _$jscoverage['/timer/transform.js'].lineData[173]++;
  var ret = {};
  _$jscoverage['/timer/transform.js'].lineData[174]++;
  ret.translateX = interpolate(from.translateX, to.translateX, pos);
  _$jscoverage['/timer/transform.js'].lineData[175]++;
  ret.translateY = interpolate(from.translateY, to.translateY, pos);
  _$jscoverage['/timer/transform.js'].lineData[176]++;
  ret.rotate = interpolate(from.rotate, to.rotate, pos);
  _$jscoverage['/timer/transform.js'].lineData[177]++;
  ret.skewX = interpolate(from.skewX, to.skewX, pos);
  _$jscoverage['/timer/transform.js'].lineData[178]++;
  ret.skewY = interpolate(from.skewY, to.skewY, pos);
  _$jscoverage['/timer/transform.js'].lineData[179]++;
  ret.scaleX = interpolate(from.scaleX, to.scaleX, pos);
  _$jscoverage['/timer/transform.js'].lineData[180]++;
  ret.scaleY = interpolate(from.scaleY, to.scaleY, pos);
  _$jscoverage['/timer/transform.js'].lineData[181]++;
  return S.substitute(translateTpl + ' ' + 'rotate({rotate}deg) ' + 'skewX({skewX}deg) ' + 'skewY({skewY}deg) ' + 'scale({scaleX},{scaleY})', ret);
}});
  _$jscoverage['/timer/transform.js'].lineData[189]++;
  Fx.Factories.transform = TransformFx;
  _$jscoverage['/timer/transform.js'].lineData[191]++;
  return TransformFx;
});
