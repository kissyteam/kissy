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
if (! _$jscoverage['/runtime/scope.js']) {
  _$jscoverage['/runtime/scope.js'] = {};
  _$jscoverage['/runtime/scope.js'].lineData = [];
  _$jscoverage['/runtime/scope.js'].lineData[5] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[6] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[8] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[10] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[11] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[14] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[18] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[19] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[24] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[25] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[27] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[31] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[35] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[39] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[40] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[42] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[46] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[48] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[50] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[51] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[54] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[56] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[57] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[60] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[61] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[64] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[65] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[68] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[72] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[74] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[75] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[78] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[79] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[82] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[83] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[84] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[85] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[86] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[87] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[91] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[93] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[95] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[96] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[99] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[100] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[101] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[103] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[104] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[106] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[108] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[113] = 0;
}
if (! _$jscoverage['/runtime/scope.js'].functionData) {
  _$jscoverage['/runtime/scope.js'].functionData = [];
  _$jscoverage['/runtime/scope.js'].functionData[0] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[1] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[2] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[3] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[4] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[5] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[6] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[7] = 0;
  _$jscoverage['/runtime/scope.js'].functionData[8] = 0;
}
if (! _$jscoverage['/runtime/scope.js'].branchData) {
  _$jscoverage['/runtime/scope.js'].branchData = {};
  _$jscoverage['/runtime/scope.js'].branchData['8'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['24'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['39'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['48'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['50'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['56'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['60'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['64'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['74'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['82'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['85'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['86'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['97'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['99'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['100'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['103'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['103'][1] = new BranchData();
}
_$jscoverage['/runtime/scope.js'].branchData['103'][1].init(129, 23, 'typeof v === \'function\'');
function visit52_103_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['100'][2].init(35, 7, 'i < len');
function visit51_100_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['100'][1].init(30, 12, 'v && i < len');
function visit50_100_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['99'][1].init(726, 10, 'v && scope');
function visit49_99_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['97'][2].init(664, 15, 'v === undefined');
function visit48_97_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['97'][1].init(65, 41, 'v === undefined && (scope = scope.parent)');
function visit47_97_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['86'][1].init(25, 16, 'scope && depth--');
function visit46_86_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['85'][1].init(381, 5, 'depth');
function visit45_85_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['82'][1].init(264, 19, 'parts[0] === \'root\'');
function visit44_82_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['74'][2].init(60, 18, 'parts.length === 1');
function visit43_74_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['74'][1].init(50, 28, '!depth && parts.length === 1');
function visit42_74_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['64'][1].init(399, 15, 'name === \'root\'');
function visit41_64_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['60'][1].init(316, 15, 'name === \'this\'');
function visit40_60_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['56'][1].init(217, 24, 'affix && (name in affix)');
function visit39_56_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['50'][1].init(98, 15, 'v !== undefined');
function visit38_50_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['48'][1].init(59, 18, 'data && data[name]');
function visit37_48_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['39'][1].init(18, 11, '!this.affix');
function visit36_39_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['24'][1].init(18, 11, '!this.affix');
function visit35_24_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['8'][1].init(37, 10, 'data || {}');
function visit34_8_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].lineData[5]++;
KISSY.add(function(S) {
  _$jscoverage['/runtime/scope.js'].functionData[0]++;
  _$jscoverage['/runtime/scope.js'].lineData[6]++;
  function Scope(data, affix) {
    _$jscoverage['/runtime/scope.js'].functionData[1]++;
    _$jscoverage['/runtime/scope.js'].lineData[8]++;
    this.data = visit34_8_1(data || {});
    _$jscoverage['/runtime/scope.js'].lineData[10]++;
    this.affix = affix;
    _$jscoverage['/runtime/scope.js'].lineData[11]++;
    this.root = this;
  }
  _$jscoverage['/runtime/scope.js'].lineData[14]++;
  Scope.prototype = {
  isScope: 1, 
  setParent: function(parentScope) {
  _$jscoverage['/runtime/scope.js'].functionData[2]++;
  _$jscoverage['/runtime/scope.js'].lineData[18]++;
  this.parent = parentScope;
  _$jscoverage['/runtime/scope.js'].lineData[19]++;
  this.root = parentScope.root;
}, 
  set: function(name, value) {
  _$jscoverage['/runtime/scope.js'].functionData[3]++;
  _$jscoverage['/runtime/scope.js'].lineData[24]++;
  if (visit35_24_1(!this.affix)) {
    _$jscoverage['/runtime/scope.js'].lineData[25]++;
    this.affix = {};
  }
  _$jscoverage['/runtime/scope.js'].lineData[27]++;
  this.affix[name] = value;
}, 
  setData: function(data) {
  _$jscoverage['/runtime/scope.js'].functionData[4]++;
  _$jscoverage['/runtime/scope.js'].lineData[31]++;
  this.data = data;
}, 
  getData: function() {
  _$jscoverage['/runtime/scope.js'].functionData[5]++;
  _$jscoverage['/runtime/scope.js'].lineData[35]++;
  return this.data;
}, 
  mix: function(v) {
  _$jscoverage['/runtime/scope.js'].functionData[6]++;
  _$jscoverage['/runtime/scope.js'].lineData[39]++;
  if (visit36_39_1(!this.affix)) {
    _$jscoverage['/runtime/scope.js'].lineData[40]++;
    this.affix = {};
  }
  _$jscoverage['/runtime/scope.js'].lineData[42]++;
  S.mix(this.affix, v);
}, 
  get: function(name) {
  _$jscoverage['/runtime/scope.js'].functionData[7]++;
  _$jscoverage['/runtime/scope.js'].lineData[46]++;
  var data = this.data;
  _$jscoverage['/runtime/scope.js'].lineData[48]++;
  var v = visit37_48_1(data && data[name]);
  _$jscoverage['/runtime/scope.js'].lineData[50]++;
  if (visit38_50_1(v !== undefined)) {
    _$jscoverage['/runtime/scope.js'].lineData[51]++;
    return v;
  }
  _$jscoverage['/runtime/scope.js'].lineData[54]++;
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[56]++;
  if (visit39_56_1(affix && (name in affix))) {
    _$jscoverage['/runtime/scope.js'].lineData[57]++;
    return affix[name];
  }
  _$jscoverage['/runtime/scope.js'].lineData[60]++;
  if (visit40_60_1(name === 'this')) {
    _$jscoverage['/runtime/scope.js'].lineData[61]++;
    return data;
  }
  _$jscoverage['/runtime/scope.js'].lineData[64]++;
  if (visit41_64_1(name === 'root')) {
    _$jscoverage['/runtime/scope.js'].lineData[65]++;
    return this.root.data;
  }
  _$jscoverage['/runtime/scope.js'].lineData[68]++;
  return v;
}, 
  resolve: function(parts, depth) {
  _$jscoverage['/runtime/scope.js'].functionData[8]++;
  _$jscoverage['/runtime/scope.js'].lineData[72]++;
  var self = this;
  _$jscoverage['/runtime/scope.js'].lineData[74]++;
  if (visit42_74_1(!depth && visit43_74_2(parts.length === 1))) {
    _$jscoverage['/runtime/scope.js'].lineData[75]++;
    return self.get(parts[0]);
  }
  _$jscoverage['/runtime/scope.js'].lineData[78]++;
  var len, i, v;
  _$jscoverage['/runtime/scope.js'].lineData[79]++;
  var scope = self;
  _$jscoverage['/runtime/scope.js'].lineData[82]++;
  if (visit44_82_1(parts[0] === 'root')) {
    _$jscoverage['/runtime/scope.js'].lineData[83]++;
    parts.shift();
    _$jscoverage['/runtime/scope.js'].lineData[84]++;
    scope = scope.root;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[85]++;
    if (visit45_85_1(depth)) {
      _$jscoverage['/runtime/scope.js'].lineData[86]++;
      while (visit46_86_1(scope && depth--)) {
        _$jscoverage['/runtime/scope.js'].lineData[87]++;
        scope = scope.parent;
      }
    }
  }
  _$jscoverage['/runtime/scope.js'].lineData[91]++;
  len = parts.length;
  _$jscoverage['/runtime/scope.js'].lineData[93]++;
  var part0 = parts[0];
  _$jscoverage['/runtime/scope.js'].lineData[95]++;
  do {
    _$jscoverage['/runtime/scope.js'].lineData[96]++;
    v = scope.get(part0);
  } while (visit47_97_1(visit48_97_2(v === undefined) && (scope = scope.parent)));
  _$jscoverage['/runtime/scope.js'].lineData[99]++;
  if (visit49_99_1(v && scope)) {
    _$jscoverage['/runtime/scope.js'].lineData[100]++;
    for (i = 1; visit50_100_1(v && visit51_100_2(i < len)); i++) {
      _$jscoverage['/runtime/scope.js'].lineData[101]++;
      v = v[parts[i]];
    }
    _$jscoverage['/runtime/scope.js'].lineData[103]++;
    if (visit52_103_1(typeof v === 'function')) {
      _$jscoverage['/runtime/scope.js'].lineData[104]++;
      v = v.call(this.data);
    }
    _$jscoverage['/runtime/scope.js'].lineData[106]++;
    return v;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[108]++;
    return undefined;
  }
}};
  _$jscoverage['/runtime/scope.js'].lineData[113]++;
  return Scope;
});
