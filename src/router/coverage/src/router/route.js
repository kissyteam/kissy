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
  _$jscoverage['/router/route.js'].lineData[14] = 0;
  _$jscoverage['/router/route.js'].lineData[15] = 0;
  _$jscoverage['/router/route.js'].lineData[18] = 0;
  _$jscoverage['/router/route.js'].lineData[20] = 0;
  _$jscoverage['/router/route.js'].lineData[21] = 0;
  _$jscoverage['/router/route.js'].lineData[22] = 0;
  _$jscoverage['/router/route.js'].lineData[23] = 0;
  _$jscoverage['/router/route.js'].lineData[24] = 0;
  _$jscoverage['/router/route.js'].lineData[26] = 0;
  _$jscoverage['/router/route.js'].lineData[27] = 0;
  _$jscoverage['/router/route.js'].lineData[29] = 0;
  _$jscoverage['/router/route.js'].lineData[30] = 0;
  _$jscoverage['/router/route.js'].lineData[33] = 0;
  _$jscoverage['/router/route.js'].lineData[34] = 0;
  _$jscoverage['/router/route.js'].lineData[38] = 0;
  _$jscoverage['/router/route.js'].lineData[44] = 0;
  _$jscoverage['/router/route.js'].lineData[45] = 0;
  _$jscoverage['/router/route.js'].lineData[46] = 0;
  _$jscoverage['/router/route.js'].lineData[47] = 0;
  _$jscoverage['/router/route.js'].lineData[48] = 0;
  _$jscoverage['/router/route.js'].lineData[50] = 0;
  _$jscoverage['/router/route.js'].lineData[54] = 0;
  _$jscoverage['/router/route.js'].lineData[56] = 0;
  _$jscoverage['/router/route.js'].lineData[59] = 0;
  _$jscoverage['/router/route.js'].lineData[60] = 0;
  _$jscoverage['/router/route.js'].lineData[63] = 0;
  _$jscoverage['/router/route.js'].lineData[66] = 0;
  _$jscoverage['/router/route.js'].lineData[67] = 0;
  _$jscoverage['/router/route.js'].lineData[69] = 0;
  _$jscoverage['/router/route.js'].lineData[71] = 0;
  _$jscoverage['/router/route.js'].lineData[72] = 0;
  _$jscoverage['/router/route.js'].lineData[74] = 0;
  _$jscoverage['/router/route.js'].lineData[78] = 0;
  _$jscoverage['/router/route.js'].lineData[82] = 0;
}
if (! _$jscoverage['/router/route.js'].functionData) {
  _$jscoverage['/router/route.js'].functionData = [];
  _$jscoverage['/router/route.js'].functionData[0] = 0;
  _$jscoverage['/router/route.js'].functionData[1] = 0;
  _$jscoverage['/router/route.js'].functionData[2] = 0;
  _$jscoverage['/router/route.js'].functionData[3] = 0;
  _$jscoverage['/router/route.js'].functionData[4] = 0;
}
if (! _$jscoverage['/router/route.js'].branchData) {
  _$jscoverage['/router/route.js'].branchData = {};
  _$jscoverage['/router/route.js'].branchData['22'] = [];
  _$jscoverage['/router/route.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['26'] = [];
  _$jscoverage['/router/route.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['29'] = [];
  _$jscoverage['/router/route.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['33'] = [];
  _$jscoverage['/router/route.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['47'] = [];
  _$jscoverage['/router/route.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['59'] = [];
  _$jscoverage['/router/route.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['66'] = [];
  _$jscoverage['/router/route.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['69'] = [];
  _$jscoverage['/router/route.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/router/route.js'].branchData['71'] = [];
  _$jscoverage['/router/route.js'].branchData['71'][1] = new BranchData();
}
_$jscoverage['/router/route.js'].branchData['71'][1].init(146, 3, 'key');
function visit10_71_1(result) {
  _$jscoverage['/router/route.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['69'][1].init(70, 24, '\'string\' === typeof m[i]');
function visit9_69_1(result) {
  _$jscoverage['/router/route.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['66'][1].init(263, 7, 'i < len');
function visit8_66_1(result) {
  _$jscoverage['/router/route.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['59'][1].init(96, 2, '!m');
function visit7_59_1(result) {
  _$jscoverage['/router/route.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['47'][1].init(78, 24, 'typeof path === \'string\'');
function visit6_47_1(result) {
  _$jscoverage['/router/route.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['33'][1].init(363, 2, 'g4');
function visit5_33_1(result) {
  _$jscoverage['/router/route.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['29'][1].init(262, 2, 'g2');
function visit4_29_1(result) {
  _$jscoverage['/router/route.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['26'][1].init(184, 8, 'g2 || g4');
function visit3_26_1(result) {
  _$jscoverage['/router/route.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].branchData['22'][1].init(45, 19, 'S.endsWith(g2, \'?\')');
function visit2_22_1(result) {
  _$jscoverage['/router/route.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/route.js'].lineData[5]++;
KISSY.add(function(S) {
  _$jscoverage['/router/route.js'].functionData[0]++;
  _$jscoverage['/router/route.js'].lineData[6]++;
  var grammar = /(:([\w\d]+\??))|(\\\*([\w\d]+))/g;
  _$jscoverage['/router/route.js'].lineData[14]++;
  function pathRegexp(path) {
    _$jscoverage['/router/route.js'].functionData[1]++;
    _$jscoverage['/router/route.js'].lineData[15]++;
    var keys = [];
    _$jscoverage['/router/route.js'].lineData[18]++;
    path = S.escapeRegExp(path);
    _$jscoverage['/router/route.js'].lineData[20]++;
    path = path.replace(grammar, function(m, g1, g2, g3, g4) {
  _$jscoverage['/router/route.js'].functionData[2]++;
  _$jscoverage['/router/route.js'].lineData[21]++;
  var key = {};
  _$jscoverage['/router/route.js'].lineData[22]++;
  if (visit2_22_1(S.endsWith(g2, '?'))) {
    _$jscoverage['/router/route.js'].lineData[23]++;
    key.optional = true;
    _$jscoverage['/router/route.js'].lineData[24]++;
    g2 = g2.slice(0, -1);
  }
  _$jscoverage['/router/route.js'].lineData[26]++;
  key.name = visit3_26_1(g2 || g4);
  _$jscoverage['/router/route.js'].lineData[27]++;
  keys.push(key);
  _$jscoverage['/router/route.js'].lineData[29]++;
  if (visit4_29_1(g2)) {
    _$jscoverage['/router/route.js'].lineData[30]++;
    return '([^/]+)';
  } else {
    _$jscoverage['/router/route.js'].lineData[33]++;
    if (visit5_33_1(g4)) {
      _$jscoverage['/router/route.js'].lineData[34]++;
      return '(.*)';
    }
  }
});
    _$jscoverage['/router/route.js'].lineData[38]++;
    return {
  keys: keys, 
  regexp: new RegExp('^' + path + '$')};
  }
  _$jscoverage['/router/route.js'].lineData[44]++;
  function Route(path, callbacks) {
    _$jscoverage['/router/route.js'].functionData[3]++;
    _$jscoverage['/router/route.js'].lineData[45]++;
    this.path = path;
    _$jscoverage['/router/route.js'].lineData[46]++;
    this.callbacks = callbacks;
    _$jscoverage['/router/route.js'].lineData[47]++;
    if (visit6_47_1(typeof path === 'string')) {
      _$jscoverage['/router/route.js'].lineData[48]++;
      S.mix(this, pathRegexp(path));
    } else {
      _$jscoverage['/router/route.js'].lineData[50]++;
      this.regexp = path;
    }
  }
  _$jscoverage['/router/route.js'].lineData[54]++;
  Route.prototype = {
  match: function(path) {
  _$jscoverage['/router/route.js'].functionData[4]++;
  _$jscoverage['/router/route.js'].lineData[56]++;
  var self = this, m = path.match(self.regexp);
  _$jscoverage['/router/route.js'].lineData[59]++;
  if (visit7_59_1(!m)) {
    _$jscoverage['/router/route.js'].lineData[60]++;
    return false;
  }
  _$jscoverage['/router/route.js'].lineData[63]++;
  var keys = self.keys, params = [];
  _$jscoverage['/router/route.js'].lineData[66]++;
  for (var i = 1, len = m.length; visit8_66_1(i < len); ++i) {
    _$jscoverage['/router/route.js'].lineData[67]++;
    var key = keys[i - 1];
    _$jscoverage['/router/route.js'].lineData[69]++;
    var val = visit9_69_1('string' === typeof m[i]) ? S.urlDecode(m[i]) : m[i];
    _$jscoverage['/router/route.js'].lineData[71]++;
    if (visit10_71_1(key)) {
      _$jscoverage['/router/route.js'].lineData[72]++;
      params[key.name] = val;
    } else {
      _$jscoverage['/router/route.js'].lineData[74]++;
      params.push(val);
    }
  }
  _$jscoverage['/router/route.js'].lineData[78]++;
  return params;
}};
  _$jscoverage['/router/route.js'].lineData[82]++;
  return Route;
});
