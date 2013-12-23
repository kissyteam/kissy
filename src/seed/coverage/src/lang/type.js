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
if (! _$jscoverage['/lang/type.js']) {
  _$jscoverage['/lang/type.js'] = {};
  _$jscoverage['/lang/type.js'].lineData = [];
  _$jscoverage['/lang/type.js'].lineData[7] = 0;
  _$jscoverage['/lang/type.js'].lineData[9] = 0;
  _$jscoverage['/lang/type.js'].lineData[15] = 0;
  _$jscoverage['/lang/type.js'].lineData[16] = 0;
  _$jscoverage['/lang/type.js'].lineData[19] = 0;
  _$jscoverage['/lang/type.js'].lineData[25] = 0;
  _$jscoverage['/lang/type.js'].lineData[36] = 0;
  _$jscoverage['/lang/type.js'].lineData[45] = 0;
  _$jscoverage['/lang/type.js'].lineData[53] = 0;
  _$jscoverage['/lang/type.js'].lineData[54] = 0;
  _$jscoverage['/lang/type.js'].lineData[55] = 0;
  _$jscoverage['/lang/type.js'].lineData[58] = 0;
  _$jscoverage['/lang/type.js'].lineData[70] = 0;
  _$jscoverage['/lang/type.js'].lineData[74] = 0;
  _$jscoverage['/lang/type.js'].lineData[77] = 0;
  _$jscoverage['/lang/type.js'].lineData[79] = 0;
  _$jscoverage['/lang/type.js'].lineData[81] = 0;
  _$jscoverage['/lang/type.js'].lineData[82] = 0;
  _$jscoverage['/lang/type.js'].lineData[86] = 0;
  _$jscoverage['/lang/type.js'].lineData[92] = 0;
  _$jscoverage['/lang/type.js'].lineData[95] = 0;
  _$jscoverage['/lang/type.js'].lineData[99] = 0;
  _$jscoverage['/lang/type.js'].lineData[100] = 0;
  _$jscoverage['/lang/type.js'].lineData[168] = 0;
  _$jscoverage['/lang/type.js'].lineData[170] = 0;
  _$jscoverage['/lang/type.js'].lineData[173] = 0;
  _$jscoverage['/lang/type.js'].lineData[174] = 0;
  _$jscoverage['/lang/type.js'].lineData[177] = 0;
}
if (! _$jscoverage['/lang/type.js'].functionData) {
  _$jscoverage['/lang/type.js'].functionData = [];
  _$jscoverage['/lang/type.js'].functionData[0] = 0;
  _$jscoverage['/lang/type.js'].functionData[1] = 0;
  _$jscoverage['/lang/type.js'].functionData[2] = 0;
  _$jscoverage['/lang/type.js'].functionData[3] = 0;
  _$jscoverage['/lang/type.js'].functionData[4] = 0;
  _$jscoverage['/lang/type.js'].functionData[5] = 0;
  _$jscoverage['/lang/type.js'].functionData[6] = 0;
  _$jscoverage['/lang/type.js'].functionData[7] = 0;
  _$jscoverage['/lang/type.js'].functionData[8] = 0;
}
if (! _$jscoverage['/lang/type.js'].branchData) {
  _$jscoverage['/lang/type.js'].branchData = {};
  _$jscoverage['/lang/type.js'].branchData['25'] = [];
  _$jscoverage['/lang/type.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['27'] = [];
  _$jscoverage['/lang/type.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['36'] = [];
  _$jscoverage['/lang/type.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['45'] = [];
  _$jscoverage['/lang/type.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['54'] = [];
  _$jscoverage['/lang/type.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['70'] = [];
  _$jscoverage['/lang/type.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['70'][2] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['70'][3] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['70'][4] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['73'] = [];
  _$jscoverage['/lang/type.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['81'] = [];
  _$jscoverage['/lang/type.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['81'][2] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['95'] = [];
  _$jscoverage['/lang/type.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['95'][2] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['99'] = [];
  _$jscoverage['/lang/type.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['174'] = [];
  _$jscoverage['/lang/type.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['177'] = [];
  _$jscoverage['/lang/type.js'].branchData['177'][1] = new BranchData();
}
_$jscoverage['/lang/type.js'].branchData['177'][1].init(4763, 26, 'Array.isArray || S.isArray');
function visit313_177_1(result) {
  _$jscoverage['/lang/type.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['174'][1].init(20, 16, 'S.type(o) === lc');
function visit312_174_1(result) {
  _$jscoverage['/lang/type.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['99'][1].init(2667, 9, '\'@DEBUG@\'');
function visit311_99_1(result) {
  _$jscoverage['/lang/type.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['95'][2].init(1151, 17, 'key === undefined');
function visit310_95_2(result) {
  _$jscoverage['/lang/type.js'].branchData['95'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['95'][1].init(1151, 46, '(key === undefined) || hasOwnProperty(obj, key)');
function visit309_95_1(result) {
  _$jscoverage['/lang/type.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['81'][2].init(122, 97, '!hasOwnProperty(obj, \'constructor\') && !hasOwnProperty(objConstructor.prototype, \'isPrototypeOf\')');
function visit308_81_2(result) {
  _$jscoverage['/lang/type.js'].branchData['81'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['81'][1].init(85, 134, '(objConstructor = obj.constructor) && !hasOwnProperty(obj, \'constructor\') && !hasOwnProperty(objConstructor.prototype, \'isPrototypeOf\')');
function visit307_81_1(result) {
  _$jscoverage['/lang/type.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['73'][1].init(106, 17, 'obj.window == obj');
function visit306_73_1(result) {
  _$jscoverage['/lang/type.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['70'][4].init(268, 124, 'obj.nodeType || obj.window == obj');
function visit305_70_4(result) {
  _$jscoverage['/lang/type.js'].branchData['70'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['70'][3].init(240, 24, 'S.type(obj) !== \'object\'');
function visit304_70_3(result) {
  _$jscoverage['/lang/type.js'].branchData['70'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['70'][2].init(240, 152, 'S.type(obj) !== \'object\' || obj.nodeType || obj.window == obj');
function visit303_70_2(result) {
  _$jscoverage['/lang/type.js'].branchData['70'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['70'][1].init(232, 160, '!obj || S.type(obj) !== \'object\' || obj.nodeType || obj.window == obj');
function visit302_70_1(result) {
  _$jscoverage['/lang/type.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['54'][1].init(21, 15, 'p !== undefined');
function visit301_54_1(result) {
  _$jscoverage['/lang/type.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['45'][1].init(20, 15, 'o === undefined');
function visit300_45_1(result) {
  _$jscoverage['/lang/type.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['36'][1].init(20, 10, 'o === null');
function visit299_36_1(result) {
  _$jscoverage['/lang/type.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['27'][1].init(55, 40, 'class2type[toString.call(o)] || \'object\'');
function visit298_27_1(result) {
  _$jscoverage['/lang/type.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['25'][1].init(20, 9, 'o == null');
function visit297_25_1(result) {
  _$jscoverage['/lang/type.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/type.js'].functionData[0]++;
  _$jscoverage['/lang/type.js'].lineData[9]++;
  var class2type = {}, FALSE = false, noop = S.noop, OP = Object.prototype, toString = OP.toString;
  _$jscoverage['/lang/type.js'].lineData[15]++;
  function hasOwnProperty(o, p) {
    _$jscoverage['/lang/type.js'].functionData[1]++;
    _$jscoverage['/lang/type.js'].lineData[16]++;
    return OP.hasOwnProperty.call(o, p);
  }
  _$jscoverage['/lang/type.js'].lineData[19]++;
  S.mix(S, {
  type: function(o) {
  _$jscoverage['/lang/type.js'].functionData[2]++;
  _$jscoverage['/lang/type.js'].lineData[25]++;
  return visit297_25_1(o == null) ? String(o) : visit298_27_1(class2type[toString.call(o)] || 'object');
}, 
  isNull: function(o) {
  _$jscoverage['/lang/type.js'].functionData[3]++;
  _$jscoverage['/lang/type.js'].lineData[36]++;
  return visit299_36_1(o === null);
}, 
  isUndefined: function(o) {
  _$jscoverage['/lang/type.js'].functionData[4]++;
  _$jscoverage['/lang/type.js'].lineData[45]++;
  return visit300_45_1(o === undefined);
}, 
  isEmptyObject: function(o) {
  _$jscoverage['/lang/type.js'].functionData[5]++;
  _$jscoverage['/lang/type.js'].lineData[53]++;
  for (var p in o) {
    _$jscoverage['/lang/type.js'].lineData[54]++;
    if (visit301_54_1(p !== undefined)) {
      _$jscoverage['/lang/type.js'].lineData[55]++;
      return FALSE;
    }
  }
  _$jscoverage['/lang/type.js'].lineData[58]++;
  return true;
}, 
  isPlainObject: function(obj) {
  _$jscoverage['/lang/type.js'].functionData[6]++;
  _$jscoverage['/lang/type.js'].lineData[70]++;
  if (visit302_70_1(!obj || visit303_70_2(visit304_70_3(S.type(obj) !== 'object') || visit305_70_4(obj.nodeType || visit306_73_1(obj.window == obj))))) {
    _$jscoverage['/lang/type.js'].lineData[74]++;
    return FALSE;
  }
  _$jscoverage['/lang/type.js'].lineData[77]++;
  var key, objConstructor;
  _$jscoverage['/lang/type.js'].lineData[79]++;
  try {
    _$jscoverage['/lang/type.js'].lineData[81]++;
    if (visit307_81_1((objConstructor = obj.constructor) && visit308_81_2(!hasOwnProperty(obj, 'constructor') && !hasOwnProperty(objConstructor.prototype, 'isPrototypeOf')))) {
      _$jscoverage['/lang/type.js'].lineData[82]++;
      return FALSE;
    }
  }  catch (e) {
  _$jscoverage['/lang/type.js'].lineData[86]++;
  return FALSE;
}
  _$jscoverage['/lang/type.js'].lineData[92]++;
  for (key in obj) {
  }
  _$jscoverage['/lang/type.js'].lineData[95]++;
  return (visit309_95_1((visit310_95_2(key === undefined)) || hasOwnProperty(obj, key)));
}});
  _$jscoverage['/lang/type.js'].lineData[99]++;
  if (visit311_99_1('@DEBUG@')) {
    _$jscoverage['/lang/type.js'].lineData[100]++;
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
  _$jscoverage['/lang/type.js'].lineData[168]++;
  S.each('Boolean Number String Function Date RegExp Object Array'.split(' '), function(name, lc) {
  _$jscoverage['/lang/type.js'].functionData[7]++;
  _$jscoverage['/lang/type.js'].lineData[170]++;
  class2type['[object ' + name + ']'] = (lc = name.toLowerCase());
  _$jscoverage['/lang/type.js'].lineData[173]++;
  S['is' + name] = function(o) {
  _$jscoverage['/lang/type.js'].functionData[8]++;
  _$jscoverage['/lang/type.js'].lineData[174]++;
  return visit312_174_1(S.type(o) === lc);
};
});
  _$jscoverage['/lang/type.js'].lineData[177]++;
  S.isArray = visit313_177_1(Array.isArray || S.isArray);
})(KISSY);
