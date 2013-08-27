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
  _$jscoverage['/lang/type.js'].lineData[71] = 0;
  _$jscoverage['/lang/type.js'].lineData[74] = 0;
  _$jscoverage['/lang/type.js'].lineData[76] = 0;
  _$jscoverage['/lang/type.js'].lineData[78] = 0;
  _$jscoverage['/lang/type.js'].lineData[79] = 0;
  _$jscoverage['/lang/type.js'].lineData[83] = 0;
  _$jscoverage['/lang/type.js'].lineData[90] = 0;
  _$jscoverage['/lang/type.js'].lineData[93] = 0;
  _$jscoverage['/lang/type.js'].lineData[97] = 0;
  _$jscoverage['/lang/type.js'].lineData[98] = 0;
  _$jscoverage['/lang/type.js'].lineData[166] = 0;
  _$jscoverage['/lang/type.js'].lineData[168] = 0;
  _$jscoverage['/lang/type.js'].lineData[171] = 0;
  _$jscoverage['/lang/type.js'].lineData[172] = 0;
  _$jscoverage['/lang/type.js'].lineData[175] = 0;
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
  _$jscoverage['/lang/type.js'].branchData['70'][5] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['78'] = [];
  _$jscoverage['/lang/type.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['93'] = [];
  _$jscoverage['/lang/type.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['93'][2] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['97'] = [];
  _$jscoverage['/lang/type.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['172'] = [];
  _$jscoverage['/lang/type.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/lang/type.js'].branchData['175'] = [];
  _$jscoverage['/lang/type.js'].branchData['175'][1] = new BranchData();
}
_$jscoverage['/lang/type.js'].branchData['175'][1].init(4799, 26, 'Array.isArray || S.isArray');
function visit274_175_1(result) {
  _$jscoverage['/lang/type.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['172'][1].init(21, 15, 'S.type(o) == lc');
function visit273_172_1(result) {
  _$jscoverage['/lang/type.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['97'][1].init(2627, 9, '\'@DEBUG@\'');
function visit272_97_1(result) {
  _$jscoverage['/lang/type.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['93'][2].init(1050, 17, 'key === undefined');
function visit271_93_2(result) {
  _$jscoverage['/lang/type.js'].branchData['93'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['93'][1].init(1050, 45, 'key === undefined || hasOwnProperty(obj, key)');
function visit270_93_1(result) {
  _$jscoverage['/lang/type.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['78'][2].init(124, 97, '!hasOwnProperty(obj, "constructor") && !hasOwnProperty(objConstructor.prototype, "isPrototypeOf")');
function visit269_78_2(result) {
  _$jscoverage['/lang/type.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['78'][1].init(87, 134, '(objConstructor = obj.constructor) && !hasOwnProperty(obj, "constructor") && !hasOwnProperty(objConstructor.prototype, "isPrototypeOf")');
function visit268_78_1(result) {
  _$jscoverage['/lang/type.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['70'][5].init(288, 17, 'obj.window == obj');
function visit267_70_5(result) {
  _$jscoverage['/lang/type.js'].branchData['70'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['70'][4].init(272, 33, 'obj.nodeType || obj.window == obj');
function visit266_70_4(result) {
  _$jscoverage['/lang/type.js'].branchData['70'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['70'][3].init(244, 24, 'S.type(obj) !== "object"');
function visit265_70_3(result) {
  _$jscoverage['/lang/type.js'].branchData['70'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['70'][2].init(244, 61, 'S.type(obj) !== "object" || obj.nodeType || obj.window == obj');
function visit264_70_2(result) {
  _$jscoverage['/lang/type.js'].branchData['70'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['70'][1].init(236, 69, '!obj || S.type(obj) !== "object" || obj.nodeType || obj.window == obj');
function visit263_70_1(result) {
  _$jscoverage['/lang/type.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['54'][1].init(22, 15, 'p !== undefined');
function visit262_54_1(result) {
  _$jscoverage['/lang/type.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['45'][1].init(21, 15, 'o === undefined');
function visit261_45_1(result) {
  _$jscoverage['/lang/type.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['36'][1].init(21, 10, 'o === null');
function visit260_36_1(result) {
  _$jscoverage['/lang/type.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['27'][1].init(57, 40, 'class2type[toString.call(o)] || \'object\'');
function visit259_27_1(result) {
  _$jscoverage['/lang/type.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/type.js'].branchData['25'][1].init(21, 9, 'o == null');
function visit258_25_1(result) {
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
  return visit258_25_1(o == null) ? String(o) : visit259_27_1(class2type[toString.call(o)] || 'object');
}, 
  isNull: function(o) {
  _$jscoverage['/lang/type.js'].functionData[3]++;
  _$jscoverage['/lang/type.js'].lineData[36]++;
  return visit260_36_1(o === null);
}, 
  isUndefined: function(o) {
  _$jscoverage['/lang/type.js'].functionData[4]++;
  _$jscoverage['/lang/type.js'].lineData[45]++;
  return visit261_45_1(o === undefined);
}, 
  isEmptyObject: function(o) {
  _$jscoverage['/lang/type.js'].functionData[5]++;
  _$jscoverage['/lang/type.js'].lineData[53]++;
  for (var p in o) {
    _$jscoverage['/lang/type.js'].lineData[54]++;
    if (visit262_54_1(p !== undefined)) {
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
  if (visit263_70_1(!obj || visit264_70_2(visit265_70_3(S.type(obj) !== "object") || visit266_70_4(obj.nodeType || visit267_70_5(obj.window == obj))))) {
    _$jscoverage['/lang/type.js'].lineData[71]++;
    return FALSE;
  }
  _$jscoverage['/lang/type.js'].lineData[74]++;
  var key, objConstructor;
  _$jscoverage['/lang/type.js'].lineData[76]++;
  try {
    _$jscoverage['/lang/type.js'].lineData[78]++;
    if (visit268_78_1((objConstructor = obj.constructor) && visit269_78_2(!hasOwnProperty(obj, "constructor") && !hasOwnProperty(objConstructor.prototype, "isPrototypeOf")))) {
      _$jscoverage['/lang/type.js'].lineData[79]++;
      return FALSE;
    }
  }  catch (e) {
  _$jscoverage['/lang/type.js'].lineData[83]++;
  return FALSE;
}
  _$jscoverage['/lang/type.js'].lineData[90]++;
  for (key in obj) {
  }
  _$jscoverage['/lang/type.js'].lineData[93]++;
  return visit270_93_1(visit271_93_2(key === undefined) || hasOwnProperty(obj, key));
}});
  _$jscoverage['/lang/type.js'].lineData[97]++;
  if (visit272_97_1('@DEBUG@')) {
    _$jscoverage['/lang/type.js'].lineData[98]++;
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
  _$jscoverage['/lang/type.js'].lineData[166]++;
  S.each('Boolean Number String Function Date RegExp Object Array'.split(' '), function(name, lc) {
  _$jscoverage['/lang/type.js'].functionData[7]++;
  _$jscoverage['/lang/type.js'].lineData[168]++;
  class2type['[object ' + name + ']'] = (lc = name.toLowerCase());
  _$jscoverage['/lang/type.js'].lineData[171]++;
  S['is' + name] = function(o) {
  _$jscoverage['/lang/type.js'].functionData[8]++;
  _$jscoverage['/lang/type.js'].lineData[172]++;
  return visit273_172_1(S.type(o) == lc);
};
});
  _$jscoverage['/lang/type.js'].lineData[175]++;
  S.isArray = visit274_175_1(Array.isArray || S.isArray);
})(KISSY);
