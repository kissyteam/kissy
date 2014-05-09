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
  _$jscoverage['/runtime/scope.js'].lineData[41] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[43] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[44] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[49] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[51] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[53] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[54] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[57] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[59] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[61] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[62] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[65] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[66] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[67] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[68] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[71] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[75] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[77] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[78] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[81] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[86] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[87] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[88] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[89] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[90] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[91] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[92] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[96] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[97] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[100] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[102] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[103] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[106] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[107] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[108] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[110] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[112] = 0;
  _$jscoverage['/runtime/scope.js'].lineData[117] = 0;
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
  _$jscoverage['/runtime/scope.js'].branchData['40'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['51'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['53'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['59'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['61'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['65'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['67'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['77'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['86'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['90'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['91'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['96'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['104'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['104'][2] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['106'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['107'] = [];
  _$jscoverage['/runtime/scope.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/runtime/scope.js'].branchData['107'][2] = new BranchData();
}
_$jscoverage['/runtime/scope.js'].branchData['107'][2].init(35, 7, 'i < len');
function visit53_107_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['107'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['107'][1].init(30, 12, 'v && i < len');
function visit52_107_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['106'][1].init(832, 10, 'v && scope');
function visit51_106_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['104'][2].init(770, 15, 'v === undefined');
function visit50_104_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['104'][1].init(65, 41, 'v === undefined && (scope = scope.parent)');
function visit49_104_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['96'][1].init(592, 4, '!len');
function visit48_96_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['91'][1].init(25, 16, 'scope && depth--');
function visit47_91_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['90'][1].init(444, 5, 'depth');
function visit46_90_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['86'][2].init(303, 19, 'parts[0] === \'root\'');
function visit45_86_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['86'][1].init(296, 26, 'len && parts[0] === \'root\'');
function visit44_86_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['77'][2].init(60, 18, 'parts.length === 1');
function visit43_77_2(result) {
  _$jscoverage['/runtime/scope.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['77'][1].init(50, 28, '!depth && parts.length === 1');
function visit42_77_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['67'][1].init(412, 15, 'name === \'root\'');
function visit41_67_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['65'][1].init(338, 15, 'name === \'this\'');
function visit40_65_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['61'][1].init(258, 15, 'v !== undefined');
function visit39_61_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['59'][1].init(217, 20, 'affix && affix[name]');
function visit38_59_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['53'][1].init(98, 15, 'v !== undefined');
function visit37_53_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['51'][1].init(59, 18, 'data && data[name]');
function visit36_51_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['40'][1].init(55, 6, '!affix');
function visit35_40_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['24'][1].init(18, 11, '!this.affix');
function visit34_24_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].branchData['8'][1].init(37, 10, 'data || {}');
function visit33_8_1(result) {
  _$jscoverage['/runtime/scope.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/scope.js'].lineData[5]++;
KISSY.add(function() {
  _$jscoverage['/runtime/scope.js'].functionData[0]++;
  _$jscoverage['/runtime/scope.js'].lineData[6]++;
  function Scope(data, affix) {
    _$jscoverage['/runtime/scope.js'].functionData[1]++;
    _$jscoverage['/runtime/scope.js'].lineData[8]++;
    this.data = visit33_8_1(data || {});
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
  if (visit34_24_1(!this.affix)) {
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
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[40]++;
  if (visit35_40_1(!affix)) {
    _$jscoverage['/runtime/scope.js'].lineData[41]++;
    affix = this.affix = {};
  }
  _$jscoverage['/runtime/scope.js'].lineData[43]++;
  for (var name in v) {
    _$jscoverage['/runtime/scope.js'].lineData[44]++;
    affix[name] = v[name];
  }
}, 
  get: function(name) {
  _$jscoverage['/runtime/scope.js'].functionData[7]++;
  _$jscoverage['/runtime/scope.js'].lineData[49]++;
  var data = this.data;
  _$jscoverage['/runtime/scope.js'].lineData[51]++;
  var v = visit36_51_1(data && data[name]);
  _$jscoverage['/runtime/scope.js'].lineData[53]++;
  if (visit37_53_1(v !== undefined)) {
    _$jscoverage['/runtime/scope.js'].lineData[54]++;
    return v;
  }
  _$jscoverage['/runtime/scope.js'].lineData[57]++;
  var affix = this.affix;
  _$jscoverage['/runtime/scope.js'].lineData[59]++;
  v = visit38_59_1(affix && affix[name]);
  _$jscoverage['/runtime/scope.js'].lineData[61]++;
  if (visit39_61_1(v !== undefined)) {
    _$jscoverage['/runtime/scope.js'].lineData[62]++;
    return v;
  }
  _$jscoverage['/runtime/scope.js'].lineData[65]++;
  if (visit40_65_1(name === 'this')) {
    _$jscoverage['/runtime/scope.js'].lineData[66]++;
    return data;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[67]++;
    if (visit41_67_1(name === 'root')) {
      _$jscoverage['/runtime/scope.js'].lineData[68]++;
      return this.root.data;
    }
  }
  _$jscoverage['/runtime/scope.js'].lineData[71]++;
  return v;
}, 
  resolve: function(parts, depth) {
  _$jscoverage['/runtime/scope.js'].functionData[8]++;
  _$jscoverage['/runtime/scope.js'].lineData[75]++;
  var self = this;
  _$jscoverage['/runtime/scope.js'].lineData[77]++;
  if (visit42_77_1(!depth && visit43_77_2(parts.length === 1))) {
    _$jscoverage['/runtime/scope.js'].lineData[78]++;
    return self.get(parts[0]);
  }
  _$jscoverage['/runtime/scope.js'].lineData[81]++;
  var len = parts.length, scope = self, i, v;
  _$jscoverage['/runtime/scope.js'].lineData[86]++;
  if (visit44_86_1(len && visit45_86_2(parts[0] === 'root'))) {
    _$jscoverage['/runtime/scope.js'].lineData[87]++;
    parts.shift();
    _$jscoverage['/runtime/scope.js'].lineData[88]++;
    scope = scope.root;
    _$jscoverage['/runtime/scope.js'].lineData[89]++;
    len--;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[90]++;
    if (visit46_90_1(depth)) {
      _$jscoverage['/runtime/scope.js'].lineData[91]++;
      while (visit47_91_1(scope && depth--)) {
        _$jscoverage['/runtime/scope.js'].lineData[92]++;
        scope = scope.parent;
      }
    }
  }
  _$jscoverage['/runtime/scope.js'].lineData[96]++;
  if (visit48_96_1(!len)) {
    _$jscoverage['/runtime/scope.js'].lineData[97]++;
    return scope.data;
  }
  _$jscoverage['/runtime/scope.js'].lineData[100]++;
  var part0 = parts[0];
  _$jscoverage['/runtime/scope.js'].lineData[102]++;
  do {
    _$jscoverage['/runtime/scope.js'].lineData[103]++;
    v = scope.get(part0);
  } while (visit49_104_1(visit50_104_2(v === undefined) && (scope = scope.parent)));
  _$jscoverage['/runtime/scope.js'].lineData[106]++;
  if (visit51_106_1(v && scope)) {
    _$jscoverage['/runtime/scope.js'].lineData[107]++;
    for (i = 1; visit52_107_1(v && visit53_107_2(i < len)); i++) {
      _$jscoverage['/runtime/scope.js'].lineData[108]++;
      v = v[parts[i]];
    }
    _$jscoverage['/runtime/scope.js'].lineData[110]++;
    return v;
  } else {
    _$jscoverage['/runtime/scope.js'].lineData[112]++;
    return undefined;
  }
}};
  _$jscoverage['/runtime/scope.js'].lineData[117]++;
  return Scope;
});
