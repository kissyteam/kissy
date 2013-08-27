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
  _$jscoverage['/timer/transform.js'].lineData[10] = 0;
  _$jscoverage['/timer/transform.js'].lineData[12] = 0;
  _$jscoverage['/timer/transform.js'].lineData[15] = 0;
  _$jscoverage['/timer/transform.js'].lineData[16] = 0;
  _$jscoverage['/timer/transform.js'].lineData[17] = 0;
  _$jscoverage['/timer/transform.js'].lineData[24] = 0;
  _$jscoverage['/timer/transform.js'].lineData[26] = 0;
  _$jscoverage['/timer/transform.js'].lineData[27] = 0;
  _$jscoverage['/timer/transform.js'].lineData[28] = 0;
  _$jscoverage['/timer/transform.js'].lineData[30] = 0;
  _$jscoverage['/timer/transform.js'].lineData[31] = 0;
  _$jscoverage['/timer/transform.js'].lineData[32] = 0;
  _$jscoverage['/timer/transform.js'].lineData[34] = 0;
  _$jscoverage['/timer/transform.js'].lineData[35] = 0;
  _$jscoverage['/timer/transform.js'].lineData[36] = 0;
  _$jscoverage['/timer/transform.js'].lineData[37] = 0;
  _$jscoverage['/timer/transform.js'].lineData[39] = 0;
  _$jscoverage['/timer/transform.js'].lineData[40] = 0;
  _$jscoverage['/timer/transform.js'].lineData[41] = 0;
  _$jscoverage['/timer/transform.js'].lineData[42] = 0;
  _$jscoverage['/timer/transform.js'].lineData[43] = 0;
  _$jscoverage['/timer/transform.js'].lineData[48] = 0;
  _$jscoverage['/timer/transform.js'].lineData[53] = 0;
  _$jscoverage['/timer/transform.js'].lineData[64] = 0;
  _$jscoverage['/timer/transform.js'].lineData[65] = 0;
  _$jscoverage['/timer/transform.js'].lineData[76] = 0;
  _$jscoverage['/timer/transform.js'].lineData[77] = 0;
  _$jscoverage['/timer/transform.js'].lineData[80] = 0;
  _$jscoverage['/timer/transform.js'].lineData[81] = 0;
  _$jscoverage['/timer/transform.js'].lineData[82] = 0;
  _$jscoverage['/timer/transform.js'].lineData[89] = 0;
  _$jscoverage['/timer/transform.js'].lineData[90] = 0;
  _$jscoverage['/timer/transform.js'].lineData[91] = 0;
  _$jscoverage['/timer/transform.js'].lineData[92] = 0;
  _$jscoverage['/timer/transform.js'].lineData[93] = 0;
  _$jscoverage['/timer/transform.js'].lineData[98] = 0;
  _$jscoverage['/timer/transform.js'].lineData[99] = 0;
  _$jscoverage['/timer/transform.js'].lineData[104] = 0;
  _$jscoverage['/timer/transform.js'].lineData[105] = 0;
  _$jscoverage['/timer/transform.js'].lineData[106] = 0;
  _$jscoverage['/timer/transform.js'].lineData[108] = 0;
  _$jscoverage['/timer/transform.js'].lineData[109] = 0;
  _$jscoverage['/timer/transform.js'].lineData[113] = 0;
  _$jscoverage['/timer/transform.js'].lineData[114] = 0;
  _$jscoverage['/timer/transform.js'].lineData[115] = 0;
  _$jscoverage['/timer/transform.js'].lineData[116] = 0;
  _$jscoverage['/timer/transform.js'].lineData[119] = 0;
  _$jscoverage['/timer/transform.js'].lineData[120] = 0;
  _$jscoverage['/timer/transform.js'].lineData[121] = 0;
  _$jscoverage['/timer/transform.js'].lineData[122] = 0;
  _$jscoverage['/timer/transform.js'].lineData[125] = 0;
  _$jscoverage['/timer/transform.js'].lineData[126] = 0;
  _$jscoverage['/timer/transform.js'].lineData[130] = 0;
  _$jscoverage['/timer/transform.js'].lineData[133] = 0;
  _$jscoverage['/timer/transform.js'].lineData[134] = 0;
  _$jscoverage['/timer/transform.js'].lineData[137] = 0;
  _$jscoverage['/timer/transform.js'].lineData[139] = 0;
  _$jscoverage['/timer/transform.js'].lineData[140] = 0;
  _$jscoverage['/timer/transform.js'].lineData[142] = 0;
  _$jscoverage['/timer/transform.js'].lineData[143] = 0;
  _$jscoverage['/timer/transform.js'].lineData[144] = 0;
  _$jscoverage['/timer/transform.js'].lineData[146] = 0;
  _$jscoverage['/timer/transform.js'].lineData[148] = 0;
  _$jscoverage['/timer/transform.js'].lineData[149] = 0;
  _$jscoverage['/timer/transform.js'].lineData[151] = 0;
  _$jscoverage['/timer/transform.js'].lineData[156] = 0;
  _$jscoverage['/timer/transform.js'].lineData[157] = 0;
  _$jscoverage['/timer/transform.js'].lineData[158] = 0;
  _$jscoverage['/timer/transform.js'].lineData[159] = 0;
  _$jscoverage['/timer/transform.js'].lineData[160] = 0;
  _$jscoverage['/timer/transform.js'].lineData[161] = 0;
  _$jscoverage['/timer/transform.js'].lineData[162] = 0;
  _$jscoverage['/timer/transform.js'].lineData[163] = 0;
  _$jscoverage['/timer/transform.js'].lineData[164] = 0;
  _$jscoverage['/timer/transform.js'].lineData[165] = 0;
  _$jscoverage['/timer/transform.js'].lineData[173] = 0;
  _$jscoverage['/timer/transform.js'].lineData[175] = 0;
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
  _$jscoverage['/timer/transform.js'].branchData['24'] = [];
  _$jscoverage['/timer/transform.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['39'] = [];
  _$jscoverage['/timer/transform.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['89'] = [];
  _$jscoverage['/timer/transform.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['105'] = [];
  _$jscoverage['/timer/transform.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['115'] = [];
  _$jscoverage['/timer/transform.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['121'] = [];
  _$jscoverage['/timer/transform.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['142'] = [];
  _$jscoverage['/timer/transform.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['143'] = [];
  _$jscoverage['/timer/transform.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['143'][2] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['148'] = [];
  _$jscoverage['/timer/transform.js'].branchData['148'][1] = new BranchData();
}
_$jscoverage['/timer/transform.js'].branchData['148'][1].init(448, 7, 'self.to');
function visit81_148_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['143'][2].init(264, 19, 'self.from != \'none\'');
function visit80_143_2(result) {
  _$jscoverage['/timer/transform.js'].branchData['143'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['143'][1].init(251, 32, 'self.from && self.from != \'none\'');
function visit79_143_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['142'][1].init(181, 51, 'Dom.style(self.anim.node, \'transform\') || self.from');
function visit78_142_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['121'][1].init(149, 16, 'val[1] || val[0]');
function visit77_121_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['115'][1].init(163, 11, 'val[1] || 0');
function visit76_115_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['105'][1].init(81, 23, '!S.endsWith(val, \'deg\')');
function visit75_105_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['89'][1].init(295, 7, '++i < l');
function visit74_89_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['39'][1].init(438, 13, 'A * D < B * C');
function visit73_39_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['24'][1].init(252, 13, 'A * D - B * C');
function visit72_24_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].lineData[6]++;
KISSY.add('anim/timer/transform', function(S, Dom, Fx) {
  _$jscoverage['/timer/transform.js'].functionData[0]++;
  _$jscoverage['/timer/transform.js'].lineData[7]++;
  function toMatrixArray(matrix) {
    _$jscoverage['/timer/transform.js'].functionData[1]++;
    _$jscoverage['/timer/transform.js'].lineData[8]++;
    matrix = matrix.split(/,/);
    _$jscoverage['/timer/transform.js'].lineData[9]++;
    matrix = S.map(matrix, function(v) {
  _$jscoverage['/timer/transform.js'].functionData[2]++;
  _$jscoverage['/timer/transform.js'].lineData[10]++;
  return myParse(v);
});
    _$jscoverage['/timer/transform.js'].lineData[12]++;
    return matrix;
  }
  _$jscoverage['/timer/transform.js'].lineData[15]++;
  function decomposeMatrix(matrix) {
    _$jscoverage['/timer/transform.js'].functionData[3]++;
    _$jscoverage['/timer/transform.js'].lineData[16]++;
    matrix = toMatrixArray(matrix);
    _$jscoverage['/timer/transform.js'].lineData[17]++;
    var scaleX, scaleY, skew, A = matrix[0], B = matrix[1], C = matrix[2], D = matrix[3];
    _$jscoverage['/timer/transform.js'].lineData[24]++;
    if (visit72_24_1(A * D - B * C)) {
      _$jscoverage['/timer/transform.js'].lineData[26]++;
      scaleX = Math.sqrt(A * A + B * B);
      _$jscoverage['/timer/transform.js'].lineData[27]++;
      A /= scaleX;
      _$jscoverage['/timer/transform.js'].lineData[28]++;
      B /= scaleX;
      _$jscoverage['/timer/transform.js'].lineData[30]++;
      skew = A * C + B * D;
      _$jscoverage['/timer/transform.js'].lineData[31]++;
      C -= A * skew;
      _$jscoverage['/timer/transform.js'].lineData[32]++;
      D -= B * skew;
      _$jscoverage['/timer/transform.js'].lineData[34]++;
      scaleY = Math.sqrt(C * C + D * D);
      _$jscoverage['/timer/transform.js'].lineData[35]++;
      C /= scaleY;
      _$jscoverage['/timer/transform.js'].lineData[36]++;
      D /= scaleY;
      _$jscoverage['/timer/transform.js'].lineData[37]++;
      skew /= scaleY;
      _$jscoverage['/timer/transform.js'].lineData[39]++;
      if (visit73_39_1(A * D < B * C)) {
        _$jscoverage['/timer/transform.js'].lineData[40]++;
        A = -A;
        _$jscoverage['/timer/transform.js'].lineData[41]++;
        B = -B;
        _$jscoverage['/timer/transform.js'].lineData[42]++;
        skew = -skew;
        _$jscoverage['/timer/transform.js'].lineData[43]++;
        scaleX = -scaleX;
      }
    } else {
      _$jscoverage['/timer/transform.js'].lineData[48]++;
      scaleX = scaleY = skew = 0;
    }
    _$jscoverage['/timer/transform.js'].lineData[53]++;
    return {
  'translateX': myParse(matrix[4]), 
  'translateY': myParse(matrix[5]), 
  'rotate': myParse(Math.atan2(B, A) * 180 / Math.PI), 
  'skewX': myParse(Math.atan(skew) * 180 / Math.PI), 
  'skewY': 0, 
  'scaleX': myParse(scaleX), 
  'scaleY': myParse(scaleY)};
  }
  _$jscoverage['/timer/transform.js'].lineData[64]++;
  function defaultDecompose() {
    _$jscoverage['/timer/transform.js'].functionData[4]++;
    _$jscoverage['/timer/transform.js'].lineData[65]++;
    return {
  'translateX': 0, 
  'translateY': 0, 
  'rotate': 0, 
  'skewX': 0, 
  'skewY': 0, 
  'scaleX': 1, 
  'scaleY': 1};
  }
  _$jscoverage['/timer/transform.js'].lineData[76]++;
  function myParse(v) {
    _$jscoverage['/timer/transform.js'].functionData[5]++;
    _$jscoverage['/timer/transform.js'].lineData[77]++;
    return Math.round(parseFloat(v) * 1e5) / 1e5;
  }
  _$jscoverage['/timer/transform.js'].lineData[80]++;
  function getTransformInfo(transform) {
    _$jscoverage['/timer/transform.js'].functionData[6]++;
    _$jscoverage['/timer/transform.js'].lineData[81]++;
    transform = transform.split(")");
    _$jscoverage['/timer/transform.js'].lineData[82]++;
    var trim = S.trim, i = -1, l = transform.length - 1, split, prop, val, ret = defaultDecompose();
    _$jscoverage['/timer/transform.js'].lineData[89]++;
    while (visit74_89_1(++i < l)) {
      _$jscoverage['/timer/transform.js'].lineData[90]++;
      split = transform[i].split("(");
      _$jscoverage['/timer/transform.js'].lineData[91]++;
      prop = trim(split[0]);
      _$jscoverage['/timer/transform.js'].lineData[92]++;
      val = split[1];
      _$jscoverage['/timer/transform.js'].lineData[93]++;
      switch (prop) {
        case "translateX":
        case "translateY":
        case 'scaleX':
        case 'scaleY':
          _$jscoverage['/timer/transform.js'].lineData[98]++;
          ret[prop] = myParse(val);
          _$jscoverage['/timer/transform.js'].lineData[99]++;
          break;
        case 'rotate':
        case 'skewX':
        case 'skewY':
          _$jscoverage['/timer/transform.js'].lineData[104]++;
          var v = myParse(val);
          _$jscoverage['/timer/transform.js'].lineData[105]++;
          if (visit75_105_1(!S.endsWith(val, 'deg'))) {
            _$jscoverage['/timer/transform.js'].lineData[106]++;
            v = v * 180 / Math.PI;
          }
          _$jscoverage['/timer/transform.js'].lineData[108]++;
          ret[prop] = v;
          _$jscoverage['/timer/transform.js'].lineData[109]++;
          break;
        case 'translate':
        case 'translate3d':
          _$jscoverage['/timer/transform.js'].lineData[113]++;
          val = val.split(",");
          _$jscoverage['/timer/transform.js'].lineData[114]++;
          ret.translateX = myParse(val[0]);
          _$jscoverage['/timer/transform.js'].lineData[115]++;
          ret.translateY = myParse(visit76_115_1(val[1] || 0));
          _$jscoverage['/timer/transform.js'].lineData[116]++;
          break;
        case 'scale':
          _$jscoverage['/timer/transform.js'].lineData[119]++;
          val = val.split(",");
          _$jscoverage['/timer/transform.js'].lineData[120]++;
          ret.scaleX = myParse(val[0]);
          _$jscoverage['/timer/transform.js'].lineData[121]++;
          ret.scaleY = myParse(visit77_121_1(val[1] || val[0]));
          _$jscoverage['/timer/transform.js'].lineData[122]++;
          break;
        case 'matrix':
          _$jscoverage['/timer/transform.js'].lineData[125]++;
          return decomposeMatrix(val);
          _$jscoverage['/timer/transform.js'].lineData[126]++;
          break;
      }
    }
    _$jscoverage['/timer/transform.js'].lineData[130]++;
    return ret;
  }
  _$jscoverage['/timer/transform.js'].lineData[133]++;
  function TransformFx() {
    _$jscoverage['/timer/transform.js'].functionData[7]++;
    _$jscoverage['/timer/transform.js'].lineData[134]++;
    TransformFx.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/timer/transform.js'].lineData[137]++;
  S.extend(TransformFx, Fx, {
  load: function() {
  _$jscoverage['/timer/transform.js'].functionData[8]++;
  _$jscoverage['/timer/transform.js'].lineData[139]++;
  var self = this;
  _$jscoverage['/timer/transform.js'].lineData[140]++;
  TransformFx.superclass.load.apply(self, arguments);
  _$jscoverage['/timer/transform.js'].lineData[142]++;
  self.from = visit78_142_1(Dom.style(self.anim.node, 'transform') || self.from);
  _$jscoverage['/timer/transform.js'].lineData[143]++;
  if (visit79_143_1(self.from && visit80_143_2(self.from != 'none'))) {
    _$jscoverage['/timer/transform.js'].lineData[144]++;
    self.from = getTransformInfo(self.from);
  } else {
    _$jscoverage['/timer/transform.js'].lineData[146]++;
    self.from = defaultDecompose();
  }
  _$jscoverage['/timer/transform.js'].lineData[148]++;
  if (visit81_148_1(self.to)) {
    _$jscoverage['/timer/transform.js'].lineData[149]++;
    self.to = getTransformInfo(self.to);
  } else {
    _$jscoverage['/timer/transform.js'].lineData[151]++;
    self.to = defaultDecompose();
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/transform.js'].functionData[9]++;
  _$jscoverage['/timer/transform.js'].lineData[156]++;
  var interpolate = TransformFx.superclass.interpolate;
  _$jscoverage['/timer/transform.js'].lineData[157]++;
  var ret = {};
  _$jscoverage['/timer/transform.js'].lineData[158]++;
  ret.translateX = interpolate(from.translateX, to.translateX, pos);
  _$jscoverage['/timer/transform.js'].lineData[159]++;
  ret.translateY = interpolate(from.translateY, to.translateY, pos);
  _$jscoverage['/timer/transform.js'].lineData[160]++;
  ret.rotate = interpolate(from.rotate, to.rotate, pos);
  _$jscoverage['/timer/transform.js'].lineData[161]++;
  ret.skewX = interpolate(from.skewX, to.skewX, pos);
  _$jscoverage['/timer/transform.js'].lineData[162]++;
  ret.skewY = interpolate(from.skewY, to.skewY, pos);
  _$jscoverage['/timer/transform.js'].lineData[163]++;
  ret.scaleX = interpolate(from.scaleX, to.scaleX, pos);
  _$jscoverage['/timer/transform.js'].lineData[164]++;
  ret.scaleY = interpolate(from.scaleY, to.scaleY, pos);
  _$jscoverage['/timer/transform.js'].lineData[165]++;
  return S.substitute('translate3d({translateX}px,{translateY}px,0) ' + 'rotate({rotate}deg) ' + 'skewX({skewX}deg) ' + 'skewY({skewY}deg) ' + 'scale({scaleX},{scaleY})', ret);
}});
  _$jscoverage['/timer/transform.js'].lineData[173]++;
  Fx.Factories.transform = TransformFx;
  _$jscoverage['/timer/transform.js'].lineData[175]++;
  return TransformFx;
}, {
  requires: ['dom', './fx']});
