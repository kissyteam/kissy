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
  _$jscoverage['/util/type.js'].lineData[15] = 0;
  _$jscoverage['/util/type.js'].lineData[16] = 0;
  _$jscoverage['/util/type.js'].lineData[19] = 0;
  _$jscoverage['/util/type.js'].lineData[25] = 0;
  _$jscoverage['/util/type.js'].lineData[36] = 0;
  _$jscoverage['/util/type.js'].lineData[45] = 0;
  _$jscoverage['/util/type.js'].lineData[57] = 0;
  _$jscoverage['/util/type.js'].lineData[61] = 0;
  _$jscoverage['/util/type.js'].lineData[64] = 0;
  _$jscoverage['/util/type.js'].lineData[66] = 0;
  _$jscoverage['/util/type.js'].lineData[68] = 0;
  _$jscoverage['/util/type.js'].lineData[69] = 0;
  _$jscoverage['/util/type.js'].lineData[73] = 0;
  _$jscoverage['/util/type.js'].lineData[79] = 0;
  _$jscoverage['/util/type.js'].lineData[82] = 0;
  _$jscoverage['/util/type.js'].lineData[86] = 0;
  _$jscoverage['/util/type.js'].lineData[87] = 0;
  _$jscoverage['/util/type.js'].lineData[155] = 0;
  _$jscoverage['/util/type.js'].lineData[157] = 0;
  _$jscoverage['/util/type.js'].lineData[160] = 0;
  _$jscoverage['/util/type.js'].lineData[161] = 0;
  _$jscoverage['/util/type.js'].lineData[164] = 0;
}
if (! _$jscoverage['/util/type.js'].functionData) {
  _$jscoverage['/util/type.js'].functionData = [];
  _$jscoverage['/util/type.js'].functionData[0] = 0;
  _$jscoverage['/util/type.js'].functionData[1] = 0;
  _$jscoverage['/util/type.js'].functionData[2] = 0;
  _$jscoverage['/util/type.js'].functionData[3] = 0;
  _$jscoverage['/util/type.js'].functionData[4] = 0;
  _$jscoverage['/util/type.js'].functionData[5] = 0;
  _$jscoverage['/util/type.js'].functionData[6] = 0;
  _$jscoverage['/util/type.js'].functionData[7] = 0;
}
if (! _$jscoverage['/util/type.js'].branchData) {
  _$jscoverage['/util/type.js'].branchData = {};
  _$jscoverage['/util/type.js'].branchData['25'] = [];
  _$jscoverage['/util/type.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['27'] = [];
  _$jscoverage['/util/type.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['36'] = [];
  _$jscoverage['/util/type.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['45'] = [];
  _$jscoverage['/util/type.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['57'] = [];
  _$jscoverage['/util/type.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['57'][3] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['57'][4] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['60'] = [];
  _$jscoverage['/util/type.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['68'] = [];
  _$jscoverage['/util/type.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['68'][2] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['82'] = [];
  _$jscoverage['/util/type.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['86'] = [];
  _$jscoverage['/util/type.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['161'] = [];
  _$jscoverage['/util/type.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['164'] = [];
  _$jscoverage['/util/type.js'].branchData['164'][1] = new BranchData();
}
_$jscoverage['/util/type.js'].branchData['164'][1].init(4455, 26, 'Array.isArray || S.isArray');
function visit139_164_1(result) {
  _$jscoverage['/util/type.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['161'][1].init(20, 16, 'S.type(o) === lc');
function visit138_161_1(result) {
  _$jscoverage['/util/type.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['86'][1].init(2359, 9, '\'@DEBUG@\'');
function visit137_86_1(result) {
  _$jscoverage['/util/type.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['82'][2].init(1151, 17, 'key === undefined');
function visit136_82_2(result) {
  _$jscoverage['/util/type.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['82'][1].init(1151, 46, '(key === undefined) || hasOwnProperty(obj, key)');
function visit135_82_1(result) {
  _$jscoverage['/util/type.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['68'][2].init(122, 97, '!hasOwnProperty(obj, \'constructor\') && !hasOwnProperty(objConstructor.prototype, \'isPrototypeOf\')');
function visit134_68_2(result) {
  _$jscoverage['/util/type.js'].branchData['68'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['68'][1].init(85, 134, '(objConstructor = obj.constructor) && !hasOwnProperty(obj, \'constructor\') && !hasOwnProperty(objConstructor.prototype, \'isPrototypeOf\')');
function visit133_68_1(result) {
  _$jscoverage['/util/type.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['60'][1].init(106, 17, 'obj.window == obj');
function visit132_60_1(result) {
  _$jscoverage['/util/type.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['57'][4].init(268, 124, 'obj.nodeType || obj.window == obj');
function visit131_57_4(result) {
  _$jscoverage['/util/type.js'].branchData['57'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['57'][3].init(240, 24, 'S.type(obj) !== \'object\'');
function visit130_57_3(result) {
  _$jscoverage['/util/type.js'].branchData['57'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['57'][2].init(240, 152, 'S.type(obj) !== \'object\' || obj.nodeType || obj.window == obj');
function visit129_57_2(result) {
  _$jscoverage['/util/type.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['57'][1].init(232, 160, '!obj || S.type(obj) !== \'object\' || obj.nodeType || obj.window == obj');
function visit128_57_1(result) {
  _$jscoverage['/util/type.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['45'][1].init(20, 15, 'o === undefined');
function visit127_45_1(result) {
  _$jscoverage['/util/type.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['36'][1].init(20, 10, 'o === null');
function visit126_36_1(result) {
  _$jscoverage['/util/type.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['27'][1].init(55, 40, 'class2type[toString.call(o)] || \'object\'');
function visit125_27_1(result) {
  _$jscoverage['/util/type.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['25'][1].init(20, 9, 'o == null');
function visit124_25_1(result) {
  _$jscoverage['/util/type.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].lineData[7]++;
KISSY.add(function(S, undefined) {
  _$jscoverage['/util/type.js'].functionData[0]++;
  _$jscoverage['/util/type.js'].lineData[9]++;
  var class2type = {}, FALSE = false, noop = S.noop, OP = Object.prototype, toString = OP.toString;
  _$jscoverage['/util/type.js'].lineData[15]++;
  function hasOwnProperty(o, p) {
    _$jscoverage['/util/type.js'].functionData[1]++;
    _$jscoverage['/util/type.js'].lineData[16]++;
    return OP.hasOwnProperty.call(o, p);
  }
  _$jscoverage['/util/type.js'].lineData[19]++;
  S.mix(S, {
  type: function(o) {
  _$jscoverage['/util/type.js'].functionData[2]++;
  _$jscoverage['/util/type.js'].lineData[25]++;
  return visit124_25_1(o == null) ? String(o) : visit125_27_1(class2type[toString.call(o)] || 'object');
}, 
  isNull: function(o) {
  _$jscoverage['/util/type.js'].functionData[3]++;
  _$jscoverage['/util/type.js'].lineData[36]++;
  return visit126_36_1(o === null);
}, 
  isUndefined: function(o) {
  _$jscoverage['/util/type.js'].functionData[4]++;
  _$jscoverage['/util/type.js'].lineData[45]++;
  return visit127_45_1(o === undefined);
}, 
  isPlainObject: function(obj) {
  _$jscoverage['/util/type.js'].functionData[5]++;
  _$jscoverage['/util/type.js'].lineData[57]++;
  if (visit128_57_1(!obj || visit129_57_2(visit130_57_3(S.type(obj) !== 'object') || visit131_57_4(obj.nodeType || visit132_60_1(obj.window == obj))))) {
    _$jscoverage['/util/type.js'].lineData[61]++;
    return FALSE;
  }
  _$jscoverage['/util/type.js'].lineData[64]++;
  var key, objConstructor;
  _$jscoverage['/util/type.js'].lineData[66]++;
  try {
    _$jscoverage['/util/type.js'].lineData[68]++;
    if (visit133_68_1((objConstructor = obj.constructor) && visit134_68_2(!hasOwnProperty(obj, 'constructor') && !hasOwnProperty(objConstructor.prototype, 'isPrototypeOf')))) {
      _$jscoverage['/util/type.js'].lineData[69]++;
      return FALSE;
    }
  }  catch (e) {
  _$jscoverage['/util/type.js'].lineData[73]++;
  return FALSE;
}
  _$jscoverage['/util/type.js'].lineData[79]++;
  for (key in obj) {
  }
  _$jscoverage['/util/type.js'].lineData[82]++;
  return (visit135_82_1((visit136_82_2(key === undefined)) || hasOwnProperty(obj, key)));
}});
  _$jscoverage['/util/type.js'].lineData[86]++;
  if (visit137_86_1('@DEBUG@')) {
    _$jscoverage['/util/type.js'].lineData[87]++;
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
  _$jscoverage['/util/type.js'].lineData[155]++;
  S.each('Boolean Number String Function Date RegExp Object Array'.split(' '), function(name, lc) {
  _$jscoverage['/util/type.js'].functionData[6]++;
  _$jscoverage['/util/type.js'].lineData[157]++;
  class2type['[object ' + name + ']'] = (lc = name.toLowerCase());
  _$jscoverage['/util/type.js'].lineData[160]++;
  S['is' + name] = function(o) {
  _$jscoverage['/util/type.js'].functionData[7]++;
  _$jscoverage['/util/type.js'].lineData[161]++;
  return visit138_161_1(S.type(o) === lc);
};
});
  _$jscoverage['/util/type.js'].lineData[164]++;
  S.isArray = visit139_164_1(Array.isArray || S.isArray);
});
