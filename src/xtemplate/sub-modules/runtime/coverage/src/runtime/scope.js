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
  _$jscoverage['/runtime/scope.js'].lineData[80] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[83] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[84] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[85] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[86] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[87] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[88] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[89] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[93] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[94] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[97] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[99] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[100] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[103] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[104] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[105] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[107] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[109] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[114] = 0;
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
  _$jscoverage['/runtime/scope.js'].branchData['83'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['87'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['88'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['93'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['101'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['103'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['104'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['104'][2] = new BranchData();
}
_$jscoverage['/runtime/scope.js'].branchData['104'][2].init(35, 7, 'i < len');
function visit51_104_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['104'][1].init(30, 12, 'v && i < len');
function visit50_104_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['103'][1].init(832, 10, 'v && scope');
function visit49_103_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['101'][2].init(770, 15, 'v === undefined');
function visit48_101_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['101'][1].init(65, 41, 'v === undefined && (scope = scope.parent)');
function visit47_101_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['93'][1].init(592, 4, '!len');
function visit46_93_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['88'][1].init(25, 16, 'scope && depth--');
function visit45_88_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['87'][1].init(444, 5, 'depth');
function visit44_87_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['83'][2].init(303, 19, 'parts[0] === \'root\'');
function visit43_83_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['83'][1].init(296, 26, 'len && parts[0] === \'root\'');
function visit42_83_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['74'][2].init(60, 18, 'parts.length === 1');
function visit41_74_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['74'][1].init(50, 28, '!depth && parts.length === 1');
function visit40_74_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['64'][1].init(399, 15, 'name === \'root\'');
function visit39_64_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['60'][1].init(316, 15, 'name === \'this\'');
function visit38_60_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['56'][1].init(217, 24, 'affix && (name in affix)');
function visit37_56_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['50'][1].init(98, 15, 'v !== undefined');
function visit36_50_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['48'][1].init(59, 18, 'data && data[name]');
function visit35_48_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['39'][1].init(18, 11, '!this.affix');
function visit34_39_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['24'][1].init(18, 11, '!this.affix');
function visit33_24_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['8'][1].init(37, 10, 'data || {}');
function visit32_8_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].lineData[5]++;
KISSY.add(function(S) {
  _$jscoverage['/runtime/scope.js'].functionData[0]++;
  _$jscoverage['/runtime/scope.js'].lineData[6]++;
  function Scope(data, affix) {
    _$jscoverage['/runtime/scope.js'].functionData[1]++;
    _$jscoverage['/runtime/scope.js'].lineData[8]++;
    this.data = visit32_8_1(data || {});
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
  if (visit33_24_1(!this.affix)) {
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
  if (visit34_39_1(!this.affix)) {
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
  var v = visit35_48_1(data && data[name]);
  _$jscoverage['/runtime/scope.js'].lineData[50]++;
  if (visit36_50_1(v !== undefined)) {
    _$jscoverage['/runtime/scope.js'].lineData[51]++;
    return v;
  }
  _$jscoverage['/runtime/scope.js'].lineData[54]++;
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[56]++;
  if (visit37_56_1(affix && (name in affix))) {
    _$jscoverage['/runtime/scope.js'].lineData[57]++;
    return affix[name];
  }
  _$jscoverage['/runtime/scope.js'].lineData[60]++;
  if (visit38_60_1(name === 'this')) {
    _$jscoverage['/runtime/scope.js'].lineData[61]++;
    return data;
  }
  _$jscoverage['/runtime/scope.js'].lineData[64]++;
  if (visit39_64_1(name === 'root')) {
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
  if (visit40_74_1(!depth && visit41_74_2(parts.length === 1))) {
    _$jscoverage['/runtime/scope.js'].lineData[75]++;
    return self.get(parts[0]);
  }
  _$jscoverage['/runtime/scope.js'].lineData[78]++;
  var len = parts.length, i, v;
  _$jscoverage['/runtime/scope.js'].lineData[80]++;
  var scope = self;
  _$jscoverage['/runtime/scope.js'].lineData[83]++;
  if (visit42_83_1(len && visit43_83_2(parts[0] === 'root'))) {
    _$jscoverage['/runtime/scope.js'].lineData[84]++;
    parts.shift();
    _$jscoverage['/runtime/scope.js'].lineData[85]++;
    scope = scope.root;
    _$jscoverage['/runtime/scope.js'].lineData[86]++;
    len--;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[87]++;
    if (visit44_87_1(depth)) {
      _$jscoverage['/runtime/scope.js'].lineData[88]++;
      while (visit45_88_1(scope && depth--)) {
        _$jscoverage['/runtime/scope.js'].lineData[89]++;
        scope = scope.parent;
      }
    }
  }
  _$jscoverage['/runtime/scope.js'].lineData[93]++;
  if (visit46_93_1(!len)) {
    _$jscoverage['/runtime/scope.js'].lineData[94]++;
    return scope.data;
  }
  _$jscoverage['/runtime/scope.js'].lineData[97]++;
  var part0 = parts[0];
  _$jscoverage['/runtime/scope.js'].lineData[99]++;
  do {
    _$jscoverage['/runtime/scope.js'].lineData[100]++;
    v = scope.get(part0);
  } while (visit47_101_1(visit48_101_2(v === undefined) && (scope = scope.parent)));
  _$jscoverage['/runtime/scope.js'].lineData[103]++;
  if (visit49_103_1(v && scope)) {
    _$jscoverage['/runtime/scope.js'].lineData[104]++;
    for (i = 1; visit50_104_1(v && visit51_104_2(i < len)); i++) {
      _$jscoverage['/runtime/scope.js'].lineData[105]++;
      v = v[parts[i]];
    }
    _$jscoverage['/runtime/scope.js'].lineData[107]++;
    return v;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[109]++;
    return undefined;
  }
}};
  _$jscoverage['/runtime/scope.js'].lineData[114]++;
  return Scope;
});
