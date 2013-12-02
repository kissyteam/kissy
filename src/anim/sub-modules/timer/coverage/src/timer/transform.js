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
  _$jscoverage['/timer/transform.js'].lineData[12] = 0;
  _$jscoverage['/timer/transform.js'].lineData[13] = 0;
  _$jscoverage['/timer/transform.js'].lineData[14] = 0;
  _$jscoverage['/timer/transform.js'].lineData[15] = 0;
  _$jscoverage['/timer/transform.js'].lineData[17] = 0;
  _$jscoverage['/timer/transform.js'].lineData[20] = 0;
  _$jscoverage['/timer/transform.js'].lineData[21] = 0;
  _$jscoverage['/timer/transform.js'].lineData[22] = 0;
  _$jscoverage['/timer/transform.js'].lineData[29] = 0;
  _$jscoverage['/timer/transform.js'].lineData[31] = 0;
  _$jscoverage['/timer/transform.js'].lineData[32] = 0;
  _$jscoverage['/timer/transform.js'].lineData[33] = 0;
  _$jscoverage['/timer/transform.js'].lineData[35] = 0;
  _$jscoverage['/timer/transform.js'].lineData[36] = 0;
  _$jscoverage['/timer/transform.js'].lineData[37] = 0;
  _$jscoverage['/timer/transform.js'].lineData[39] = 0;
  _$jscoverage['/timer/transform.js'].lineData[40] = 0;
  _$jscoverage['/timer/transform.js'].lineData[41] = 0;
  _$jscoverage['/timer/transform.js'].lineData[42] = 0;
  _$jscoverage['/timer/transform.js'].lineData[44] = 0;
  _$jscoverage['/timer/transform.js'].lineData[45] = 0;
  _$jscoverage['/timer/transform.js'].lineData[46] = 0;
  _$jscoverage['/timer/transform.js'].lineData[47] = 0;
  _$jscoverage['/timer/transform.js'].lineData[48] = 0;
  _$jscoverage['/timer/transform.js'].lineData[53] = 0;
  _$jscoverage['/timer/transform.js'].lineData[58] = 0;
  _$jscoverage['/timer/transform.js'].lineData[69] = 0;
  _$jscoverage['/timer/transform.js'].lineData[70] = 0;
  _$jscoverage['/timer/transform.js'].lineData[81] = 0;
  _$jscoverage['/timer/transform.js'].lineData[82] = 0;
  _$jscoverage['/timer/transform.js'].lineData[85] = 0;
  _$jscoverage['/timer/transform.js'].lineData[86] = 0;
  _$jscoverage['/timer/transform.js'].lineData[87] = 0;
  _$jscoverage['/timer/transform.js'].lineData[94] = 0;
  _$jscoverage['/timer/transform.js'].lineData[95] = 0;
  _$jscoverage['/timer/transform.js'].lineData[96] = 0;
  _$jscoverage['/timer/transform.js'].lineData[97] = 0;
  _$jscoverage['/timer/transform.js'].lineData[98] = 0;
  _$jscoverage['/timer/transform.js'].lineData[103] = 0;
  _$jscoverage['/timer/transform.js'].lineData[104] = 0;
  _$jscoverage['/timer/transform.js'].lineData[109] = 0;
  _$jscoverage['/timer/transform.js'].lineData[110] = 0;
  _$jscoverage['/timer/transform.js'].lineData[111] = 0;
  _$jscoverage['/timer/transform.js'].lineData[113] = 0;
  _$jscoverage['/timer/transform.js'].lineData[114] = 0;
  _$jscoverage['/timer/transform.js'].lineData[118] = 0;
  _$jscoverage['/timer/transform.js'].lineData[119] = 0;
  _$jscoverage['/timer/transform.js'].lineData[120] = 0;
  _$jscoverage['/timer/transform.js'].lineData[121] = 0;
  _$jscoverage['/timer/transform.js'].lineData[124] = 0;
  _$jscoverage['/timer/transform.js'].lineData[125] = 0;
  _$jscoverage['/timer/transform.js'].lineData[126] = 0;
  _$jscoverage['/timer/transform.js'].lineData[127] = 0;
  _$jscoverage['/timer/transform.js'].lineData[130] = 0;
  _$jscoverage['/timer/transform.js'].lineData[134] = 0;
  _$jscoverage['/timer/transform.js'].lineData[137] = 0;
  _$jscoverage['/timer/transform.js'].lineData[138] = 0;
  _$jscoverage['/timer/transform.js'].lineData[141] = 0;
  _$jscoverage['/timer/transform.js'].lineData[143] = 0;
  _$jscoverage['/timer/transform.js'].lineData[144] = 0;
  _$jscoverage['/timer/transform.js'].lineData[146] = 0;
  _$jscoverage['/timer/transform.js'].lineData[147] = 0;
  _$jscoverage['/timer/transform.js'].lineData[148] = 0;
  _$jscoverage['/timer/transform.js'].lineData[150] = 0;
  _$jscoverage['/timer/transform.js'].lineData[152] = 0;
  _$jscoverage['/timer/transform.js'].lineData[153] = 0;
  _$jscoverage['/timer/transform.js'].lineData[155] = 0;
  _$jscoverage['/timer/transform.js'].lineData[160] = 0;
  _$jscoverage['/timer/transform.js'].lineData[161] = 0;
  _$jscoverage['/timer/transform.js'].lineData[162] = 0;
  _$jscoverage['/timer/transform.js'].lineData[163] = 0;
  _$jscoverage['/timer/transform.js'].lineData[164] = 0;
  _$jscoverage['/timer/transform.js'].lineData[165] = 0;
  _$jscoverage['/timer/transform.js'].lineData[166] = 0;
  _$jscoverage['/timer/transform.js'].lineData[167] = 0;
  _$jscoverage['/timer/transform.js'].lineData[168] = 0;
  _$jscoverage['/timer/transform.js'].lineData[169] = 0;
  _$jscoverage['/timer/transform.js'].lineData[177] = 0;
  _$jscoverage['/timer/transform.js'].lineData[179] = 0;
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
}
if (! _$jscoverage['/timer/transform.js'].branchData) {
  _$jscoverage['/timer/transform.js'].branchData = {};
  _$jscoverage['/timer/transform.js'].branchData['29'] = [];
  _$jscoverage['/timer/transform.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['44'] = [];
  _$jscoverage['/timer/transform.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['94'] = [];
  _$jscoverage['/timer/transform.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['110'] = [];
  _$jscoverage['/timer/transform.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['120'] = [];
  _$jscoverage['/timer/transform.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['126'] = [];
  _$jscoverage['/timer/transform.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['146'] = [];
  _$jscoverage['/timer/transform.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['147'] = [];
  _$jscoverage['/timer/transform.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['152'] = [];
  _$jscoverage['/timer/transform.js'].branchData['152'][1] = new BranchData();
}
_$jscoverage['/timer/transform.js'].branchData['152'][1].init(439, 7, 'self.to');
function visit84_152_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['147'][2].init(259, 20, 'self.from !== \'none\'');
function visit83_147_2(result) {
  _$jscoverage['/timer/transform.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['147'][1].init(246, 33, 'self.from && self.from !== \'none\'');
function visit82_147_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['146'][1].init(177, 51, 'Dom.style(self.anim.node, \'transform\') || self.from');
function visit81_146_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['126'][1].init(146, 16, 'val[1] || val[0]');
function visit80_126_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['120'][1].init(160, 11, 'val[1] || 0');
function visit79_120_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['110'][1].init(79, 23, '!S.endsWith(val, \'deg\')');
function visit78_110_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['94'][1].init(286, 7, '++i < l');
function visit77_94_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['44'][1].init(423, 13, 'A * D < B * C');
function visit76_44_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['29'][1].init(243, 13, 'A * D - B * C');
function visit75_29_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['29'][1].ranCondition(result);
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
  _$jscoverage['/timer/transform.js'].lineData[12]++;
  function toMatrixArray(matrix) {
    _$jscoverage['/timer/transform.js'].functionData[1]++;
    _$jscoverage['/timer/transform.js'].lineData[13]++;
    matrix = matrix.split(/,/);
    _$jscoverage['/timer/transform.js'].lineData[14]++;
    matrix = S.map(matrix, function(v) {
  _$jscoverage['/timer/transform.js'].functionData[2]++;
  _$jscoverage['/timer/transform.js'].lineData[15]++;
  return myParse(v);
});
    _$jscoverage['/timer/transform.js'].lineData[17]++;
    return matrix;
  }
  _$jscoverage['/timer/transform.js'].lineData[20]++;
  function decomposeMatrix(matrix) {
    _$jscoverage['/timer/transform.js'].functionData[3]++;
    _$jscoverage['/timer/transform.js'].lineData[21]++;
    matrix = toMatrixArray(matrix);
    _$jscoverage['/timer/transform.js'].lineData[22]++;
    var scaleX, scaleY, skew, A = matrix[0], B = matrix[1], C = matrix[2], D = matrix[3];
    _$jscoverage['/timer/transform.js'].lineData[29]++;
    if (visit75_29_1(A * D - B * C)) {
      _$jscoverage['/timer/transform.js'].lineData[31]++;
      scaleX = Math.sqrt(A * A + B * B);
      _$jscoverage['/timer/transform.js'].lineData[32]++;
      A /= scaleX;
      _$jscoverage['/timer/transform.js'].lineData[33]++;
      B /= scaleX;
      _$jscoverage['/timer/transform.js'].lineData[35]++;
      skew = A * C + B * D;
      _$jscoverage['/timer/transform.js'].lineData[36]++;
      C -= A * skew;
      _$jscoverage['/timer/transform.js'].lineData[37]++;
      D -= B * skew;
      _$jscoverage['/timer/transform.js'].lineData[39]++;
      scaleY = Math.sqrt(C * C + D * D);
      _$jscoverage['/timer/transform.js'].lineData[40]++;
      C /= scaleY;
      _$jscoverage['/timer/transform.js'].lineData[41]++;
      D /= scaleY;
      _$jscoverage['/timer/transform.js'].lineData[42]++;
      skew /= scaleY;
      _$jscoverage['/timer/transform.js'].lineData[44]++;
      if (visit76_44_1(A * D < B * C)) {
        _$jscoverage['/timer/transform.js'].lineData[45]++;
        A = -A;
        _$jscoverage['/timer/transform.js'].lineData[46]++;
        B = -B;
        _$jscoverage['/timer/transform.js'].lineData[47]++;
        skew = -skew;
        _$jscoverage['/timer/transform.js'].lineData[48]++;
        scaleX = -scaleX;
      }
    } else {
      _$jscoverage['/timer/transform.js'].lineData[53]++;
      scaleX = scaleY = skew = 0;
    }
    _$jscoverage['/timer/transform.js'].lineData[58]++;
    return {
  'translateX': myParse(matrix[4]), 
  'translateY': myParse(matrix[5]), 
  'rotate': myParse(Math.atan2(B, A) * 180 / Math.PI), 
  'skewX': myParse(Math.atan(skew) * 180 / Math.PI), 
  'skewY': 0, 
  'scaleX': myParse(scaleX), 
  'scaleY': myParse(scaleY)};
  }
  _$jscoverage['/timer/transform.js'].lineData[69]++;
  function defaultDecompose() {
    _$jscoverage['/timer/transform.js'].functionData[4]++;
    _$jscoverage['/timer/transform.js'].lineData[70]++;
    return {
  'translateX': 0, 
  'translateY': 0, 
  'rotate': 0, 
  'skewX': 0, 
  'skewY': 0, 
  'scaleX': 1, 
  'scaleY': 1};
  }
  _$jscoverage['/timer/transform.js'].lineData[81]++;
  function myParse(v) {
    _$jscoverage['/timer/transform.js'].functionData[5]++;
    _$jscoverage['/timer/transform.js'].lineData[82]++;
    return Math.round(parseFloat(v) * 1e5) / 1e5;
  }
  _$jscoverage['/timer/transform.js'].lineData[85]++;
  function getTransformInfo(transform) {
    _$jscoverage['/timer/transform.js'].functionData[6]++;
    _$jscoverage['/timer/transform.js'].lineData[86]++;
    transform = transform.split(')');
    _$jscoverage['/timer/transform.js'].lineData[87]++;
    var trim = S.trim, i = -1, l = transform.length - 1, split, prop, val, ret = defaultDecompose();
    _$jscoverage['/timer/transform.js'].lineData[94]++;
    while (visit77_94_1(++i < l)) {
      _$jscoverage['/timer/transform.js'].lineData[95]++;
      split = transform[i].split('(');
      _$jscoverage['/timer/transform.js'].lineData[96]++;
      prop = trim(split[0]);
      _$jscoverage['/timer/transform.js'].lineData[97]++;
      val = split[1];
      _$jscoverage['/timer/transform.js'].lineData[98]++;
      switch (prop) {
        case 'translateX':
        case 'translateY':
        case 'scaleX':
        case 'scaleY':
          _$jscoverage['/timer/transform.js'].lineData[103]++;
          ret[prop] = myParse(val);
          _$jscoverage['/timer/transform.js'].lineData[104]++;
          break;
        case 'rotate':
        case 'skewX':
        case 'skewY':
          _$jscoverage['/timer/transform.js'].lineData[109]++;
          var v = myParse(val);
          _$jscoverage['/timer/transform.js'].lineData[110]++;
          if (visit78_110_1(!S.endsWith(val, 'deg'))) {
            _$jscoverage['/timer/transform.js'].lineData[111]++;
            v = v * 180 / Math.PI;
          }
          _$jscoverage['/timer/transform.js'].lineData[113]++;
          ret[prop] = v;
          _$jscoverage['/timer/transform.js'].lineData[114]++;
          break;
        case 'translate':
        case 'translate3d':
          _$jscoverage['/timer/transform.js'].lineData[118]++;
          val = val.split(',');
          _$jscoverage['/timer/transform.js'].lineData[119]++;
          ret.translateX = myParse(val[0]);
          _$jscoverage['/timer/transform.js'].lineData[120]++;
          ret.translateY = myParse(visit79_120_1(val[1] || 0));
          _$jscoverage['/timer/transform.js'].lineData[121]++;
          break;
        case 'scale':
          _$jscoverage['/timer/transform.js'].lineData[124]++;
          val = val.split(',');
          _$jscoverage['/timer/transform.js'].lineData[125]++;
          ret.scaleX = myParse(val[0]);
          _$jscoverage['/timer/transform.js'].lineData[126]++;
          ret.scaleY = myParse(visit80_126_1(val[1] || val[0]));
          _$jscoverage['/timer/transform.js'].lineData[127]++;
          break;
        case 'matrix':
          _$jscoverage['/timer/transform.js'].lineData[130]++;
          return decomposeMatrix(val);
      }
    }
    _$jscoverage['/timer/transform.js'].lineData[134]++;
    return ret;
  }
  _$jscoverage['/timer/transform.js'].lineData[137]++;
  function TransformFx() {
    _$jscoverage['/timer/transform.js'].functionData[7]++;
    _$jscoverage['/timer/transform.js'].lineData[138]++;
    TransformFx.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/timer/transform.js'].lineData[141]++;
  S.extend(TransformFx, Fx, {
  load: function() {
  _$jscoverage['/timer/transform.js'].functionData[8]++;
  _$jscoverage['/timer/transform.js'].lineData[143]++;
  var self = this;
  _$jscoverage['/timer/transform.js'].lineData[144]++;
  TransformFx.superclass.load.apply(self, arguments);
  _$jscoverage['/timer/transform.js'].lineData[146]++;
  self.from = visit81_146_1(Dom.style(self.anim.node, 'transform') || self.from);
  _$jscoverage['/timer/transform.js'].lineData[147]++;
  if (visit82_147_1(self.from && visit83_147_2(self.from !== 'none'))) {
    _$jscoverage['/timer/transform.js'].lineData[148]++;
    self.from = getTransformInfo(self.from);
  } else {
    _$jscoverage['/timer/transform.js'].lineData[150]++;
    self.from = defaultDecompose();
  }
  _$jscoverage['/timer/transform.js'].lineData[152]++;
  if (visit84_152_1(self.to)) {
    _$jscoverage['/timer/transform.js'].lineData[153]++;
    self.to = getTransformInfo(self.to);
  } else {
    _$jscoverage['/timer/transform.js'].lineData[155]++;
    self.to = defaultDecompose();
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/transform.js'].functionData[9]++;
  _$jscoverage['/timer/transform.js'].lineData[160]++;
  var interpolate = TransformFx.superclass.interpolate;
  _$jscoverage['/timer/transform.js'].lineData[161]++;
  var ret = {};
  _$jscoverage['/timer/transform.js'].lineData[162]++;
  ret.translateX = interpolate(from.translateX, to.translateX, pos);
  _$jscoverage['/timer/transform.js'].lineData[163]++;
  ret.translateY = interpolate(from.translateY, to.translateY, pos);
  _$jscoverage['/timer/transform.js'].lineData[164]++;
  ret.rotate = interpolate(from.rotate, to.rotate, pos);
  _$jscoverage['/timer/transform.js'].lineData[165]++;
  ret.skewX = interpolate(from.skewX, to.skewX, pos);
  _$jscoverage['/timer/transform.js'].lineData[166]++;
  ret.skewY = interpolate(from.skewY, to.skewY, pos);
  _$jscoverage['/timer/transform.js'].lineData[167]++;
  ret.scaleX = interpolate(from.scaleX, to.scaleX, pos);
  _$jscoverage['/timer/transform.js'].lineData[168]++;
  ret.scaleY = interpolate(from.scaleY, to.scaleY, pos);
  _$jscoverage['/timer/transform.js'].lineData[169]++;
  return S.substitute(translateTpl + ' ' + 'rotate({rotate}deg) ' + 'skewX({skewX}deg) ' + 'skewY({skewY}deg) ' + 'scale({scaleX},{scaleY})', ret);
}});
  _$jscoverage['/timer/transform.js'].lineData[177]++;
  Fx.Factories.transform = TransformFx;
  _$jscoverage['/timer/transform.js'].lineData[179]++;
  return TransformFx;
});
