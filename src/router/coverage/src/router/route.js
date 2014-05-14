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
if (! _$jscoverage['/router/route.js']) {
  _$jscoverage['/router/route.js'] = {};
  _$jscoverage['/router/route.js'].lineData = [];
  _$jscoverage['/router/route.js'].lineData[5] = 0;
  _$jscoverage['/router/route.js'].lineData[6] = 0;
  _$jscoverage['/router/route.js'].lineData[13] = 0;
  _$jscoverage['/router/route.js'].lineData[14] = 0;
  _$jscoverage['/router/route.js'].lineData[15] = 0;
  _$jscoverage['/router/route.js'].lineData[17] = 0;
  _$jscoverage['/router/route.js'].lineData[21] = 0;
  _$jscoverage['/router/route.js'].lineData[22] = 0;
  _$jscoverage['/router/route.js'].lineData[23] = 0;
  _$jscoverage['/router/route.js'].lineData[29] = 0;
  _$jscoverage['/router/route.js'].lineData[35] = 0;
  _$jscoverage['/router/route.js'].lineData[36] = 0;
  _$jscoverage['/router/route.js'].lineData[37] = 0;
  _$jscoverage['/router/route.js'].lineData[38] = 0;
  _$jscoverage['/router/route.js'].lineData[39] = 0;
  _$jscoverage['/router/route.js'].lineData[40] = 0;
  _$jscoverage['/router/route.js'].lineData[41] = 0;
  _$jscoverage['/router/route.js'].lineData[43] = 0;
  _$jscoverage['/router/route.js'].lineData[47] = 0;
  _$jscoverage['/router/route.js'].lineData[49] = 0;
  _$jscoverage['/router/route.js'].lineData[52] = 0;
  _$jscoverage['/router/route.js'].lineData[53] = 0;
  _$jscoverage['/router/route.js'].lineData[56] = 0;
  _$jscoverage['/router/route.js'].lineData[59] = 0;
  _$jscoverage['/router/route.js'].lineData[60] = 0;
  _$jscoverage['/router/route.js'].lineData[62] = 0;
  _$jscoverage['/router/route.js'].lineData[64] = 0;
  _$jscoverage['/router/route.js'].lineData[65] = 0;
  _$jscoverage['/router/route.js'].lineData[67] = 0;
  _$jscoverage['/router/route.js'].lineData[71] = 0;
  _$jscoverage['/router/route.js'].lineData[75] = 0;
  _$jscoverage['/router/route.js'].lineData[76] = 0;
  _$jscoverage['/router/route.js'].lineData[77] = 0;
  _$jscoverage['/router/route.js'].lineData[78] = 0;
  _$jscoverage['/router/route.js'].lineData[84] = 0;
}
if (! _$jscoverage['/router/route.js'].functionData) {
  _$jscoverage['/router/route.js'].functionData = [];
  _$jscoverage['/router/route.js'].functionData[0] = 0;
  _$jscoverage['/router/route.js'].functionData[1] = 0;
  _$jscoverage['/router/route.js'].functionData[2] = 0;
  _$jscoverage['/router/route.js'].functionData[3] = 0;
  _$jscoverage['/router/route.js'].functionData[4] = 0;
  _$jscoverage['/router/route.js'].functionData[5] = 0;
}
if (! _$jscoverage['/router/route.js'].branchData) {
  _$jscoverage['/router/route.js'].branchData = {};
  _$jscoverage['/router/route.js'].branchData['14'] = [];
  _$jscoverage['/router/route.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['22'] = [];
  _$jscoverage['/router/route.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['24'] = [];
  _$jscoverage['/router/route.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['24'][2] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['24'][3] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['24'][4] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['25'] = [];
  _$jscoverage['/router/route.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['40'] = [];
  _$jscoverage['/router/route.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['52'] = [];
  _$jscoverage['/router/route.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['59'] = [];
  _$jscoverage['/router/route.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['62'] = [];
  _$jscoverage['/router/route.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['64'] = [];
  _$jscoverage['/router/route.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['75'] = [];
  _$jscoverage['/router/route.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['76'] = [];
  _$jscoverage['/router/route.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['77'] = [];
  _$jscoverage['/router/route.js'].branchData['77'][1] = new BranchData();
}
_$jscoverage['/router/route.js'].branchData['77'][1].init(22, 22, 'callbacks === callback');
function visit17_77_1(result) {
  _$jscoverage['/router/route.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['76'][1].init(100, 6, 'i >= 0');
function visit16_76_1(result) {
  _$jscoverage['/router/route.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['75'][1].init(30, 20, 'this.callbacks || []');
function visit15_75_1(result) {
  _$jscoverage['/router/route.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['64'][1].init(149, 3, 'key');
function visit14_64_1(result) {
  _$jscoverage['/router/route.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['62'][1].init(70, 24, '\'string\' === typeof m[i]');
function visit13_62_1(result) {
  _$jscoverage['/router/route.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['59'][1].init(262, 7, 'i < len');
function visit12_59_1(result) {
  _$jscoverage['/router/route.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['52'][1].init(96, 2, '!m');
function visit11_52_1(result) {
  _$jscoverage['/router/route.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['40'][2].init(129, 24, 'typeof path === \'string\'');
function visit10_40_2(result) {
  _$jscoverage['/router/route.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['40'][1].init(129, 46, 'typeof path === \'string\' || util.isArray(path)');
function visit9_40_1(result) {
  _$jscoverage['/router/route.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['25'][1].init(183, 14, 'optional || \'\'');
function visit8_25_1(result) {
  _$jscoverage['/router/route.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['24'][4].init(115, 21, 'format && \'([^/.]+?)\'');
function visit7_24_4(result) {
  _$jscoverage['/router/route.js'].branchData['24'][4].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['24'][3].init(115, 35, 'format && \'([^/.]+?)\' || \'([^/]+?)\'');
function visit6_24_3(result) {
  _$jscoverage['/router/route.js'].branchData['24'][3].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['24'][2].init(103, 48, 'capture || (format && \'([^/.]+?)\' || \'([^/]+?)\')');
function visit5_24_2(result) {
  _$jscoverage['/router/route.js'].branchData['24'][2].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['24'][1].init(86, 12, 'format || \'\'');
function visit4_24_1(result) {
  _$jscoverage['/router/route.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['22'][1].init(59, 11, 'slash || \'\'');
function visit3_22_1(result) {
  _$jscoverage['/router/route.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['14'][1].init(14, 18, 'util.isArray(path)');
function visit2_14_1(result) {
  _$jscoverage['/router/route.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/router/route.js'].functionData[0]++;
  _$jscoverage['/router/route.js'].lineData[6]++;
  var util = require('util');
  _$jscoverage['/router/route.js'].lineData[13]++;
  function pathRegexp(path, keys, strict, sensitive) {
    _$jscoverage['/router/route.js'].functionData[1]++;
    _$jscoverage['/router/route.js'].lineData[14]++;
    if (visit2_14_1(util.isArray(path))) {
      _$jscoverage['/router/route.js'].lineData[15]++;
      path = '(' + path.join('|') + ')';
    }
    _$jscoverage['/router/route.js'].lineData[17]++;
    path = path.concat(strict ? '' : '/?').replace(/\/\(/g, '(?:/').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star) {
  _$jscoverage['/router/route.js'].functionData[2]++;
  _$jscoverage['/router/route.js'].lineData[21]++;
  keys.push(key);
  _$jscoverage['/router/route.js'].lineData[22]++;
  slash = visit3_22_1(slash || '');
  _$jscoverage['/router/route.js'].lineData[23]++;
  return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (visit4_24_1(format || '')) + (visit5_24_2(capture || (visit6_24_3(visit7_24_4(format && '([^/.]+?)') || '([^/]+?)')))) + ')' + (visit8_25_1(optional || '')) + (star ? '(/*)?' : '');
}).replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.*)');
    _$jscoverage['/router/route.js'].lineData[29]++;
    return {
  keys: keys, 
  regexp: new RegExp('^' + path + '$', sensitive ? '' : 'i')};
  }
  _$jscoverage['/router/route.js'].lineData[35]++;
  function Route(path, callbacks, option) {
    _$jscoverage['/router/route.js'].functionData[3]++;
    _$jscoverage['/router/route.js'].lineData[36]++;
    var self = this;
    _$jscoverage['/router/route.js'].lineData[37]++;
    self.path = path;
    _$jscoverage['/router/route.js'].lineData[38]++;
    self.callbacks = callbacks;
    _$jscoverage['/router/route.js'].lineData[39]++;
    self.keys = [];
    _$jscoverage['/router/route.js'].lineData[40]++;
    if (visit9_40_1(visit10_40_2(typeof path === 'string') || util.isArray(path))) {
      _$jscoverage['/router/route.js'].lineData[41]++;
      util.mix(self, pathRegexp(path, self.keys, option.strict, option.caseSensitive));
    } else {
      _$jscoverage['/router/route.js'].lineData[43]++;
      self.regexp = path;
    }
  }
  _$jscoverage['/router/route.js'].lineData[47]++;
  Route.prototype = {
  match: function(path) {
  _$jscoverage['/router/route.js'].functionData[4]++;
  _$jscoverage['/router/route.js'].lineData[49]++;
  var self = this, m = path.match(self.regexp);
  _$jscoverage['/router/route.js'].lineData[52]++;
  if (visit11_52_1(!m)) {
    _$jscoverage['/router/route.js'].lineData[53]++;
    return false;
  }
  _$jscoverage['/router/route.js'].lineData[56]++;
  var keys = self.keys, params = [];
  _$jscoverage['/router/route.js'].lineData[59]++;
  for (var i = 1, len = m.length; visit12_59_1(i < len); ++i) {
    _$jscoverage['/router/route.js'].lineData[60]++;
    var key = keys[i - 1];
    _$jscoverage['/router/route.js'].lineData[62]++;
    var val = visit13_62_1('string' === typeof m[i]) ? util.urlDecode(m[i]) : m[i];
    _$jscoverage['/router/route.js'].lineData[64]++;
    if (visit14_64_1(key)) {
      _$jscoverage['/router/route.js'].lineData[65]++;
      params[key] = val;
    } else {
      _$jscoverage['/router/route.js'].lineData[67]++;
      params.push(val);
    }
  }
  _$jscoverage['/router/route.js'].lineData[71]++;
  return params;
}, 
  removeCallback: function(callback) {
  _$jscoverage['/router/route.js'].functionData[5]++;
  _$jscoverage['/router/route.js'].lineData[75]++;
  var callbacks = visit15_75_1(this.callbacks || []);
  _$jscoverage['/router/route.js'].lineData[76]++;
  for (var i = callbacks.length - 1; visit16_76_1(i >= 0); i++) {
    _$jscoverage['/router/route.js'].lineData[77]++;
    if (visit17_77_1(callbacks === callback)) {
      _$jscoverage['/router/route.js'].lineData[78]++;
      callbacks.splice(i, 1);
    }
  }
}};
  _$jscoverage['/router/route.js'].lineData[84]++;
  return Route;
});
