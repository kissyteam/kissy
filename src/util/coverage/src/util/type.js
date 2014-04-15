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
if (! _$jscoverage['/util/type.js']) {
  _$jscoverage['/util/type.js'] = {};
  _$jscoverage['/util/type.js'].lineData = [];
  _$jscoverage['/util/type.js'].lineData[7] = 0;
  _$jscoverage['/util/type.js'].lineData[9] = 0;
  _$jscoverage['/util/type.js'].lineData[16] = 0;
  _$jscoverage['/util/type.js'].lineData[17] = 0;
  _$jscoverage['/util/type.js'].lineData[20] = 0;
  _$jscoverage['/util/type.js'].lineData[26] = 0;
  _$jscoverage['/util/type.js'].lineData[40] = 0;
  _$jscoverage['/util/type.js'].lineData[44] = 0;
  _$jscoverage['/util/type.js'].lineData[47] = 0;
  _$jscoverage['/util/type.js'].lineData[49] = 0;
  _$jscoverage['/util/type.js'].lineData[51] = 0;
  _$jscoverage['/util/type.js'].lineData[52] = 0;
  _$jscoverage['/util/type.js'].lineData[56] = 0;
  _$jscoverage['/util/type.js'].lineData[62] = 0;
  _$jscoverage['/util/type.js'].lineData[65] = 0;
  _$jscoverage['/util/type.js'].lineData[69] = 0;
  _$jscoverage['/util/type.js'].lineData[70] = 0;
  _$jscoverage['/util/type.js'].lineData[138] = 0;
  _$jscoverage['/util/type.js'].lineData[139] = 0;
  _$jscoverage['/util/type.js'].lineData[141] = 0;
  _$jscoverage['/util/type.js'].lineData[143] = 0;
  _$jscoverage['/util/type.js'].lineData[146] = 0;
  _$jscoverage['/util/type.js'].lineData[147] = 0;
  _$jscoverage['/util/type.js'].lineData[152] = 0;
}
if (! _$jscoverage['/util/type.js'].functionData) {
  _$jscoverage['/util/type.js'].functionData = [];
  _$jscoverage['/util/type.js'].functionData[0] = 0;
  _$jscoverage['/util/type.js'].functionData[1] = 0;
  _$jscoverage['/util/type.js'].functionData[2] = 0;
  _$jscoverage['/util/type.js'].functionData[3] = 0;
  _$jscoverage['/util/type.js'].functionData[4] = 0;
  _$jscoverage['/util/type.js'].functionData[5] = 0;
}
if (! _$jscoverage['/util/type.js'].branchData) {
  _$jscoverage['/util/type.js'].branchData = {};
  _$jscoverage['/util/type.js'].branchData['26'] = [];
  _$jscoverage['/util/type.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['28'] = [];
  _$jscoverage['/util/type.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['40'] = [];
  _$jscoverage['/util/type.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['40'][3] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['40'][4] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['43'] = [];
  _$jscoverage['/util/type.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['51'] = [];
  _$jscoverage['/util/type.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['51'][2] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['65'] = [];
  _$jscoverage['/util/type.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['69'] = [];
  _$jscoverage['/util/type.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['139'] = [];
  _$jscoverage['/util/type.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['147'] = [];
  _$jscoverage['/util/type.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['152'] = [];
  _$jscoverage['/util/type.js'].branchData['152'][1] = new BranchData();
}
_$jscoverage['/util/type.js'].branchData['152'][1].init(4390, 26, 'Array.isArray || S.isArray');
function visit186_152_1(result) {
  _$jscoverage['/util/type.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['147'][1].init(25, 16, 'S.type(o) === lc');
function visit185_147_1(result) {
  _$jscoverage['/util/type.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['139'][1].init(3977, 16, 'i < types.length');
function visit184_139_1(result) {
  _$jscoverage['/util/type.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['69'][1].init(2071, 9, '\'@DEBUG@\'');
function visit183_69_1(result) {
  _$jscoverage['/util/type.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['65'][2].init(1180, 13, 'key === undef');
function visit182_65_2(result) {
  _$jscoverage['/util/type.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['65'][1].init(1180, 42, '(key === undef) || hasOwnProperty(obj, key)');
function visit181_65_1(result) {
  _$jscoverage['/util/type.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['51'][2].init(124, 97, '!hasOwnProperty(obj, \'constructor\') && !hasOwnProperty(objConstructor.prototype, \'isPrototypeOf\')');
function visit180_51_2(result) {
  _$jscoverage['/util/type.js'].branchData['51'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['51'][1].init(87, 134, '(objConstructor = obj.constructor) && !hasOwnProperty(obj, \'constructor\') && !hasOwnProperty(objConstructor.prototype, \'isPrototypeOf\')');
function visit179_51_1(result) {
  _$jscoverage['/util/type.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['43'][1].init(109, 17, 'obj.window == obj');
function visit178_43_1(result) {
  _$jscoverage['/util/type.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['40'][4].init(272, 127, 'obj.nodeType || obj.window == obj');
function visit177_40_4(result) {
  _$jscoverage['/util/type.js'].branchData['40'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['40'][3].init(244, 24, 'S.type(obj) !== \'object\'');
function visit176_40_3(result) {
  _$jscoverage['/util/type.js'].branchData['40'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['40'][2].init(244, 155, 'S.type(obj) !== \'object\' || obj.nodeType || obj.window == obj');
function visit175_40_2(result) {
  _$jscoverage['/util/type.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['40'][1].init(236, 163, '!obj || S.type(obj) !== \'object\' || obj.nodeType || obj.window == obj');
function visit174_40_1(result) {
  _$jscoverage['/util/type.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['28'][1].init(57, 40, 'class2type[toString.call(o)] || \'object\'');
function visit173_28_1(result) {
  _$jscoverage['/util/type.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['26'][1].init(21, 9, 'o == null');
function visit172_26_1(result) {
  _$jscoverage['/util/type.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].lineData[7]++;
KISSY.add(function(S) {
  _$jscoverage['/util/type.js'].functionData[0]++;
  _$jscoverage['/util/type.js'].lineData[9]++;
  var class2type = {}, FALSE = false, undef, noop = S.noop, OP = Object.prototype, toString = OP.toString;
  _$jscoverage['/util/type.js'].lineData[16]++;
  function hasOwnProperty(o, p) {
    _$jscoverage['/util/type.js'].functionData[1]++;
    _$jscoverage['/util/type.js'].lineData[17]++;
    return OP.hasOwnProperty.call(o, p);
  }
  _$jscoverage['/util/type.js'].lineData[20]++;
  S.mix(S, {
  type: function(o) {
  _$jscoverage['/util/type.js'].functionData[2]++;
  _$jscoverage['/util/type.js'].lineData[26]++;
  return visit172_26_1(o == null) ? String(o) : visit173_28_1(class2type[toString.call(o)] || 'object');
}, 
  isPlainObject: function(obj) {
  _$jscoverage['/util/type.js'].functionData[3]++;
  _$jscoverage['/util/type.js'].lineData[40]++;
  if (visit174_40_1(!obj || visit175_40_2(visit176_40_3(S.type(obj) !== 'object') || visit177_40_4(obj.nodeType || visit178_43_1(obj.window == obj))))) {
    _$jscoverage['/util/type.js'].lineData[44]++;
    return FALSE;
  }
  _$jscoverage['/util/type.js'].lineData[47]++;
  var key, objConstructor;
  _$jscoverage['/util/type.js'].lineData[49]++;
  try {
    _$jscoverage['/util/type.js'].lineData[51]++;
    if (visit179_51_1((objConstructor = obj.constructor) && visit180_51_2(!hasOwnProperty(obj, 'constructor') && !hasOwnProperty(objConstructor.prototype, 'isPrototypeOf')))) {
      _$jscoverage['/util/type.js'].lineData[52]++;
      return FALSE;
    }
  }  catch (e) {
  _$jscoverage['/util/type.js'].lineData[56]++;
  return FALSE;
}
  _$jscoverage['/util/type.js'].lineData[62]++;
  for (key in obj) {
  }
  _$jscoverage['/util/type.js'].lineData[65]++;
  return (visit181_65_1((visit182_65_2(key === undef)) || hasOwnProperty(obj, key)));
}});
  _$jscoverage['/util/type.js'].lineData[69]++;
  if (visit183_69_1('@DEBUG@')) {
    _$jscoverage['/util/type.js'].lineData[70]++;
    S.mix(S, {
  isBoolean: noop, 
  isNumber: noop, 
  isString: noop, 
  isFunction: noop, 
  isArray: noop, 
  isDate: noop, 
  isRegExp: noop, 
  isObject: noop});
  }
  _$jscoverage['/util/type.js'].lineData[138]++;
  var types = 'Boolean Number String Function Date RegExp Object Array'.split(' ');
  _$jscoverage['/util/type.js'].lineData[139]++;
  for (var i = 0; visit184_139_1(i < types.length); i++) {
    _$jscoverage['/util/type.js'].lineData[141]++;
    (function(name, lc) {
  _$jscoverage['/util/type.js'].functionData[4]++;
  _$jscoverage['/util/type.js'].lineData[143]++;
  class2type['[object ' + name + ']'] = (lc = name.toLowerCase());
  _$jscoverage['/util/type.js'].lineData[146]++;
  S['is' + name] = function(o) {
  _$jscoverage['/util/type.js'].functionData[5]++;
  _$jscoverage['/util/type.js'].lineData[147]++;
  return visit185_147_1(S.type(o) === lc);
};
})(types[i], i);
  }
  _$jscoverage['/util/type.js'].lineData[152]++;
  S.isArray = visit186_152_1(Array.isArray || S.isArray);
});
