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
  _$jscoverage['/timer/transform.js'].lineData[21] = 0;
  _$jscoverage['/timer/transform.js'].lineData[22] = 0;
  _$jscoverage['/timer/transform.js'].lineData[23] = 0;
  _$jscoverage['/timer/transform.js'].lineData[30] = 0;
  _$jscoverage['/timer/transform.js'].lineData[31] = 0;
  _$jscoverage['/timer/transform.js'].lineData[32] = 0;
  _$jscoverage['/timer/transform.js'].lineData[33] = 0;
  _$jscoverage['/timer/transform.js'].lineData[35] = 0;
  _$jscoverage['/timer/transform.js'].lineData[36] = 0;
  _$jscoverage['/timer/transform.js'].lineData[37] = 0;
  _$jscoverage['/timer/transform.js'].lineData[42] = 0;
  _$jscoverage['/timer/transform.js'].lineData[47] = 0;
  _$jscoverage['/timer/transform.js'].lineData[58] = 0;
  _$jscoverage['/timer/transform.js'].lineData[59] = 0;
  _$jscoverage['/timer/transform.js'].lineData[70] = 0;
  _$jscoverage['/timer/transform.js'].lineData[71] = 0;
  _$jscoverage['/timer/transform.js'].lineData[74] = 0;
  _$jscoverage['/timer/transform.js'].lineData[75] = 0;
  _$jscoverage['/timer/transform.js'].lineData[76] = 0;
  _$jscoverage['/timer/transform.js'].lineData[83] = 0;
  _$jscoverage['/timer/transform.js'].lineData[84] = 0;
  _$jscoverage['/timer/transform.js'].lineData[85] = 0;
  _$jscoverage['/timer/transform.js'].lineData[86] = 0;
  _$jscoverage['/timer/transform.js'].lineData[87] = 0;
  _$jscoverage['/timer/transform.js'].lineData[92] = 0;
  _$jscoverage['/timer/transform.js'].lineData[93] = 0;
  _$jscoverage['/timer/transform.js'].lineData[98] = 0;
  _$jscoverage['/timer/transform.js'].lineData[99] = 0;
  _$jscoverage['/timer/transform.js'].lineData[100] = 0;
  _$jscoverage['/timer/transform.js'].lineData[102] = 0;
  _$jscoverage['/timer/transform.js'].lineData[103] = 0;
  _$jscoverage['/timer/transform.js'].lineData[107] = 0;
  _$jscoverage['/timer/transform.js'].lineData[108] = 0;
  _$jscoverage['/timer/transform.js'].lineData[109] = 0;
  _$jscoverage['/timer/transform.js'].lineData[110] = 0;
  _$jscoverage['/timer/transform.js'].lineData[113] = 0;
  _$jscoverage['/timer/transform.js'].lineData[114] = 0;
  _$jscoverage['/timer/transform.js'].lineData[115] = 0;
  _$jscoverage['/timer/transform.js'].lineData[116] = 0;
  _$jscoverage['/timer/transform.js'].lineData[119] = 0;
  _$jscoverage['/timer/transform.js'].lineData[123] = 0;
  _$jscoverage['/timer/transform.js'].lineData[126] = 0;
  _$jscoverage['/timer/transform.js'].lineData[127] = 0;
  _$jscoverage['/timer/transform.js'].lineData[130] = 0;
  _$jscoverage['/timer/transform.js'].lineData[132] = 0;
  _$jscoverage['/timer/transform.js'].lineData[133] = 0;
  _$jscoverage['/timer/transform.js'].lineData[135] = 0;
  _$jscoverage['/timer/transform.js'].lineData[136] = 0;
  _$jscoverage['/timer/transform.js'].lineData[137] = 0;
  _$jscoverage['/timer/transform.js'].lineData[139] = 0;
  _$jscoverage['/timer/transform.js'].lineData[141] = 0;
  _$jscoverage['/timer/transform.js'].lineData[142] = 0;
  _$jscoverage['/timer/transform.js'].lineData[144] = 0;
  _$jscoverage['/timer/transform.js'].lineData[149] = 0;
  _$jscoverage['/timer/transform.js'].lineData[150] = 0;
  _$jscoverage['/timer/transform.js'].lineData[151] = 0;
  _$jscoverage['/timer/transform.js'].lineData[152] = 0;
  _$jscoverage['/timer/transform.js'].lineData[153] = 0;
  _$jscoverage['/timer/transform.js'].lineData[154] = 0;
  _$jscoverage['/timer/transform.js'].lineData[155] = 0;
  _$jscoverage['/timer/transform.js'].lineData[156] = 0;
  _$jscoverage['/timer/transform.js'].lineData[157] = 0;
  _$jscoverage['/timer/transform.js'].lineData[158] = 0;
  _$jscoverage['/timer/transform.js'].lineData[166] = 0;
  _$jscoverage['/timer/transform.js'].lineData[168] = 0;
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
  _$jscoverage['/timer/transform.js'].branchData['30'] = [];
  _$jscoverage['/timer/transform.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['35'] = [];
  _$jscoverage['/timer/transform.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['83'] = [];
  _$jscoverage['/timer/transform.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['99'] = [];
  _$jscoverage['/timer/transform.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['109'] = [];
  _$jscoverage['/timer/transform.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['115'] = [];
  _$jscoverage['/timer/transform.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['135'] = [];
  _$jscoverage['/timer/transform.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['136'] = [];
  _$jscoverage['/timer/transform.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/timer/transform.js'].branchData['141'] = [];
  _$jscoverage['/timer/transform.js'].branchData['141'][1] = new BranchData();
}
_$jscoverage['/timer/transform.js'].branchData['141'][1].init(439, 7, 'self.to');
function visit84_141_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['136'][2].init(259, 20, 'self.from !== \'none\'');
function visit83_136_2(result) {
  _$jscoverage['/timer/transform.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['136'][1].init(246, 33, 'self.from && self.from !== \'none\'');
function visit82_136_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['135'][1].init(177, 51, 'Dom.style(self.anim.node, \'transform\') || self.from');
function visit81_135_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['115'][1].init(146, 16, 'val[1] || val[0]');
function visit80_115_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['109'][1].init(160, 11, 'val[1] || 0');
function visit79_109_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['99'][1].init(79, 23, '!S.endsWith(val, \'deg\')');
function visit78_99_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['83'][1].init(286, 7, '++i < l');
function visit77_83_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['35'][1].init(189, 13, 'A * D < B * C');
function visit76_35_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/transform.js'].branchData['30'][1].init(243, 13, 'A * D - B * C');
function visit75_30_1(result) {
  _$jscoverage['/timer/transform.js'].branchData['30'][1].ranCondition(result);
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
  _$jscoverage['/timer/transform.js'].lineData[21]++;
  function decomposeMatrix(matrix) {
    _$jscoverage['/timer/transform.js'].functionData[3]++;
    _$jscoverage['/timer/transform.js'].lineData[22]++;
    matrix = toMatrixArray(matrix);
    _$jscoverage['/timer/transform.js'].lineData[23]++;
    var scaleX, scaleY, skew, A = matrix[0], B = matrix[1], C = matrix[2], D = matrix[3];
    _$jscoverage['/timer/transform.js'].lineData[30]++;
    if (visit75_30_1(A * D - B * C)) {
      _$jscoverage['/timer/transform.js'].lineData[31]++;
      scaleX = Math.sqrt(A * A + B * B);
      _$jscoverage['/timer/transform.js'].lineData[32]++;
      skew = (A * C + B * D) / (A * D - C * B);
      _$jscoverage['/timer/transform.js'].lineData[33]++;
      scaleY = (A * D - B * C) / scaleX;
      _$jscoverage['/timer/transform.js'].lineData[35]++;
      if (visit76_35_1(A * D < B * C)) {
        _$jscoverage['/timer/transform.js'].lineData[36]++;
        skew = -skew;
        _$jscoverage['/timer/transform.js'].lineData[37]++;
        scaleX = -scaleX;
      }
    } else {
      _$jscoverage['/timer/transform.js'].lineData[42]++;
      scaleX = scaleY = skew = 0;
    }
    _$jscoverage['/timer/transform.js'].lineData[47]++;
    return {
  'translateX': myParse(matrix[4]), 
  'translateY': myParse(matrix[5]), 
  'rotate': myParse(Math.atan2(B, A) * 180 / Math.PI), 
  'skewX': myParse(Math.atan(skew) * 180 / Math.PI), 
  'skewY': 0, 
  'scaleX': myParse(scaleX), 
  'scaleY': myParse(scaleY)};
  }
  _$jscoverage['/timer/transform.js'].lineData[58]++;
  function defaultDecompose() {
    _$jscoverage['/timer/transform.js'].functionData[4]++;
    _$jscoverage['/timer/transform.js'].lineData[59]++;
    return {
  'translateX': 0, 
  'translateY': 0, 
  'rotate': 0, 
  'skewX': 0, 
  'skewY': 0, 
  'scaleX': 1, 
  'scaleY': 1};
  }
  _$jscoverage['/timer/transform.js'].lineData[70]++;
  function myParse(v) {
    _$jscoverage['/timer/transform.js'].functionData[5]++;
    _$jscoverage['/timer/transform.js'].lineData[71]++;
    return Math.round(parseFloat(v) * 1e5) / 1e5;
  }
  _$jscoverage['/timer/transform.js'].lineData[74]++;
  function getTransformInfo(transform) {
    _$jscoverage['/timer/transform.js'].functionData[6]++;
    _$jscoverage['/timer/transform.js'].lineData[75]++;
    transform = transform.split(')');
    _$jscoverage['/timer/transform.js'].lineData[76]++;
    var trim = S.trim, i = -1, l = transform.length - 1, split, prop, val, ret = defaultDecompose();
    _$jscoverage['/timer/transform.js'].lineData[83]++;
    while (visit77_83_1(++i < l)) {
      _$jscoverage['/timer/transform.js'].lineData[84]++;
      split = transform[i].split('(');
      _$jscoverage['/timer/transform.js'].lineData[85]++;
      prop = trim(split[0]);
      _$jscoverage['/timer/transform.js'].lineData[86]++;
      val = split[1];
      _$jscoverage['/timer/transform.js'].lineData[87]++;
      switch (prop) {
        case 'translateX':
        case 'translateY':
        case 'scaleX':
        case 'scaleY':
          _$jscoverage['/timer/transform.js'].lineData[92]++;
          ret[prop] = myParse(val);
          _$jscoverage['/timer/transform.js'].lineData[93]++;
          break;
        case 'rotate':
        case 'skewX':
        case 'skewY':
          _$jscoverage['/timer/transform.js'].lineData[98]++;
          var v = myParse(val);
          _$jscoverage['/timer/transform.js'].lineData[99]++;
          if (visit78_99_1(!S.endsWith(val, 'deg'))) {
            _$jscoverage['/timer/transform.js'].lineData[100]++;
            v = v * 180 / Math.PI;
          }
          _$jscoverage['/timer/transform.js'].lineData[102]++;
          ret[prop] = v;
          _$jscoverage['/timer/transform.js'].lineData[103]++;
          break;
        case 'translate':
        case 'translate3d':
          _$jscoverage['/timer/transform.js'].lineData[107]++;
          val = val.split(',');
          _$jscoverage['/timer/transform.js'].lineData[108]++;
          ret.translateX = myParse(val[0]);
          _$jscoverage['/timer/transform.js'].lineData[109]++;
          ret.translateY = myParse(visit79_109_1(val[1] || 0));
          _$jscoverage['/timer/transform.js'].lineData[110]++;
          break;
        case 'scale':
          _$jscoverage['/timer/transform.js'].lineData[113]++;
          val = val.split(',');
          _$jscoverage['/timer/transform.js'].lineData[114]++;
          ret.scaleX = myParse(val[0]);
          _$jscoverage['/timer/transform.js'].lineData[115]++;
          ret.scaleY = myParse(visit80_115_1(val[1] || val[0]));
          _$jscoverage['/timer/transform.js'].lineData[116]++;
          break;
        case 'matrix':
          _$jscoverage['/timer/transform.js'].lineData[119]++;
          return decomposeMatrix(val);
      }
    }
    _$jscoverage['/timer/transform.js'].lineData[123]++;
    return ret;
  }
  _$jscoverage['/timer/transform.js'].lineData[126]++;
  function TransformFx() {
    _$jscoverage['/timer/transform.js'].functionData[7]++;
    _$jscoverage['/timer/transform.js'].lineData[127]++;
    TransformFx.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/timer/transform.js'].lineData[130]++;
  S.extend(TransformFx, Fx, {
  load: function() {
  _$jscoverage['/timer/transform.js'].functionData[8]++;
  _$jscoverage['/timer/transform.js'].lineData[132]++;
  var self = this;
  _$jscoverage['/timer/transform.js'].lineData[133]++;
  TransformFx.superclass.load.apply(self, arguments);
  _$jscoverage['/timer/transform.js'].lineData[135]++;
  self.from = visit81_135_1(Dom.style(self.anim.node, 'transform') || self.from);
  _$jscoverage['/timer/transform.js'].lineData[136]++;
  if (visit82_136_1(self.from && visit83_136_2(self.from !== 'none'))) {
    _$jscoverage['/timer/transform.js'].lineData[137]++;
    self.from = getTransformInfo(self.from);
  } else {
    _$jscoverage['/timer/transform.js'].lineData[139]++;
    self.from = defaultDecompose();
  }
  _$jscoverage['/timer/transform.js'].lineData[141]++;
  if (visit84_141_1(self.to)) {
    _$jscoverage['/timer/transform.js'].lineData[142]++;
    self.to = getTransformInfo(self.to);
  } else {
    _$jscoverage['/timer/transform.js'].lineData[144]++;
    self.to = defaultDecompose();
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/transform.js'].functionData[9]++;
  _$jscoverage['/timer/transform.js'].lineData[149]++;
  var interpolate = TransformFx.superclass.interpolate;
  _$jscoverage['/timer/transform.js'].lineData[150]++;
  var ret = {};
  _$jscoverage['/timer/transform.js'].lineData[151]++;
  ret.translateX = interpolate(from.translateX, to.translateX, pos);
  _$jscoverage['/timer/transform.js'].lineData[152]++;
  ret.translateY = interpolate(from.translateY, to.translateY, pos);
  _$jscoverage['/timer/transform.js'].lineData[153]++;
  ret.rotate = interpolate(from.rotate, to.rotate, pos);
  _$jscoverage['/timer/transform.js'].lineData[154]++;
  ret.skewX = interpolate(from.skewX, to.skewX, pos);
  _$jscoverage['/timer/transform.js'].lineData[155]++;
  ret.skewY = interpolate(from.skewY, to.skewY, pos);
  _$jscoverage['/timer/transform.js'].lineData[156]++;
  ret.scaleX = interpolate(from.scaleX, to.scaleX, pos);
  _$jscoverage['/timer/transform.js'].lineData[157]++;
  ret.scaleY = interpolate(from.scaleY, to.scaleY, pos);
  _$jscoverage['/timer/transform.js'].lineData[158]++;
  return S.substitute(translateTpl + ' ' + 'rotate({rotate}deg) ' + 'skewX({skewX}deg) ' + 'skewY({skewY}deg) ' + 'scale({scaleX},{scaleY})', ret);
}});
  _$jscoverage['/timer/transform.js'].lineData[166]++;
  Fx.Factories.transform = TransformFx;
  _$jscoverage['/timer/transform.js'].lineData[168]++;
  return TransformFx;
});
