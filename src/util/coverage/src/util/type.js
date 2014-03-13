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
  _$jscoverage['/util/type.js'].lineData[39] = 0;
  _$jscoverage['/util/type.js'].lineData[43] = 0;
  _$jscoverage['/util/type.js'].lineData[46] = 0;
  _$jscoverage['/util/type.js'].lineData[48] = 0;
  _$jscoverage['/util/type.js'].lineData[50] = 0;
  _$jscoverage['/util/type.js'].lineData[51] = 0;
  _$jscoverage['/util/type.js'].lineData[55] = 0;
  _$jscoverage['/util/type.js'].lineData[61] = 0;
  _$jscoverage['/util/type.js'].lineData[64] = 0;
  _$jscoverage['/util/type.js'].lineData[68] = 0;
  _$jscoverage['/util/type.js'].lineData[69] = 0;
  _$jscoverage['/util/type.js'].lineData[106] = 0;
  _$jscoverage['/util/type.js'].lineData[108] = 0;
  _$jscoverage['/util/type.js'].lineData[111] = 0;
  _$jscoverage['/util/type.js'].lineData[112] = 0;
  _$jscoverage['/util/type.js'].lineData[115] = 0;
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
  _$jscoverage['/util/type.js'].branchData['25'] = [];
  _$jscoverage['/util/type.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['27'] = [];
  _$jscoverage['/util/type.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['39'] = [];
  _$jscoverage['/util/type.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['39'][3] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['39'][4] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['42'] = [];
  _$jscoverage['/util/type.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['50'] = [];
  _$jscoverage['/util/type.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['64'] = [];
  _$jscoverage['/util/type.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['64'][2] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['68'] = [];
  _$jscoverage['/util/type.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['112'] = [];
  _$jscoverage['/util/type.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/util/type.js'].branchData['115'] = [];
  _$jscoverage['/util/type.js'].branchData['115'][1] = new BranchData();
}
_$jscoverage['/util/type.js'].branchData['115'][1].init(3218, 26, 'Array.isArray || S.isArray');
function visit137_115_1(result) {
  _$jscoverage['/util/type.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['112'][1].init(20, 16, 'S.type(o) === lc');
function visit136_112_1(result) {
  _$jscoverage['/util/type.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['68'][1].init(1998, 9, '\'@DEBUG@\'');
function visit135_68_1(result) {
  _$jscoverage['/util/type.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['64'][2].init(1151, 17, 'key === undefined');
function visit134_64_2(result) {
  _$jscoverage['/util/type.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['64'][1].init(1151, 46, '(key === undefined) || hasOwnProperty(obj, key)');
function visit133_64_1(result) {
  _$jscoverage['/util/type.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['50'][2].init(122, 97, '!hasOwnProperty(obj, \'constructor\') && !hasOwnProperty(objConstructor.prototype, \'isPrototypeOf\')');
function visit132_50_2(result) {
  _$jscoverage['/util/type.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['50'][1].init(85, 134, '(objConstructor = obj.constructor) && !hasOwnProperty(obj, \'constructor\') && !hasOwnProperty(objConstructor.prototype, \'isPrototypeOf\')');
function visit131_50_1(result) {
  _$jscoverage['/util/type.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['42'][1].init(106, 17, 'obj.window == obj');
function visit130_42_1(result) {
  _$jscoverage['/util/type.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['39'][4].init(268, 124, 'obj.nodeType || obj.window == obj');
function visit129_39_4(result) {
  _$jscoverage['/util/type.js'].branchData['39'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['39'][3].init(240, 24, 'S.type(obj) !== \'object\'');
function visit128_39_3(result) {
  _$jscoverage['/util/type.js'].branchData['39'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['39'][2].init(240, 152, 'S.type(obj) !== \'object\' || obj.nodeType || obj.window == obj');
function visit127_39_2(result) {
  _$jscoverage['/util/type.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/type.js'].branchData['39'][1].init(232, 160, '!obj || S.type(obj) !== \'object\' || obj.nodeType || obj.window == obj');
function visit126_39_1(result) {
  _$jscoverage['/util/type.js'].branchData['39'][1].ranCondition(result);
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
  isPlainObject: function(obj) {
  _$jscoverage['/util/type.js'].functionData[3]++;
  _$jscoverage['/util/type.js'].lineData[39]++;
  if (visit126_39_1(!obj || visit127_39_2(visit128_39_3(S.type(obj) !== 'object') || visit129_39_4(obj.nodeType || visit130_42_1(obj.window == obj))))) {
    _$jscoverage['/util/type.js'].lineData[43]++;
    return FALSE;
  }
  _$jscoverage['/util/type.js'].lineData[46]++;
  var key, objConstructor;
  _$jscoverage['/util/type.js'].lineData[48]++;
  try {
    _$jscoverage['/util/type.js'].lineData[50]++;
    if (visit131_50_1((objConstructor = obj.constructor) && visit132_50_2(!hasOwnProperty(obj, 'constructor') && !hasOwnProperty(objConstructor.prototype, 'isPrototypeOf')))) {
      _$jscoverage['/util/type.js'].lineData[51]++;
      return FALSE;
    }
  }  catch (e) {
  _$jscoverage['/util/type.js'].lineData[55]++;
  return FALSE;
}
  _$jscoverage['/util/type.js'].lineData[61]++;
  for (key in obj) {
  }
  _$jscoverage['/util/type.js'].lineData[64]++;
  return (visit133_64_1((visit134_64_2(key === undefined)) || hasOwnProperty(obj, key)));
}});
  _$jscoverage['/util/type.js'].lineData[68]++;
  if (visit135_68_1('@DEBUG@')) {
    _$jscoverage['/util/type.js'].lineData[69]++;
    S.mix(S, {
  isArray: noop, 
  isDate: noop, 
  isRegExp: noop, 
  isObject: noop});
  }
  _$jscoverage['/util/type.js'].lineData[106]++;
  S.each('Object Date RegExp Array'.split(' '), function(name, lc) {
  _$jscoverage['/util/type.js'].functionData[4]++;
  _$jscoverage['/util/type.js'].lineData[108]++;
  class2type['[object ' + name + ']'] = (lc = name.toLowerCase());
  _$jscoverage['/util/type.js'].lineData[111]++;
  S['is' + name] = function(o) {
  _$jscoverage['/util/type.js'].functionData[5]++;
  _$jscoverage['/util/type.js'].lineData[112]++;
  return visit136_112_1(S.type(o) === lc);
};
});
  _$jscoverage['/util/type.js'].lineData[115]++;
  S.isArray = visit137_115_1(Array.isArray || S.isArray);
});
