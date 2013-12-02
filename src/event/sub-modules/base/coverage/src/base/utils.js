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
if (! _$jscoverage['/base/utils.js']) {
  _$jscoverage['/base/utils.js'] = {};
  _$jscoverage['/base/utils.js'].lineData = [];
  _$jscoverage['/base/utils.js'].lineData[6] = 0;
  _$jscoverage['/base/utils.js'].lineData[7] = 0;
  _$jscoverage['/base/utils.js'].lineData[9] = 0;
  _$jscoverage['/base/utils.js'].lineData[10] = 0;
  _$jscoverage['/base/utils.js'].lineData[11] = 0;
  _$jscoverage['/base/utils.js'].lineData[13] = 0;
  _$jscoverage['/base/utils.js'].lineData[17] = 0;
  _$jscoverage['/base/utils.js'].lineData[18] = 0;
  _$jscoverage['/base/utils.js'].lineData[19] = 0;
  _$jscoverage['/base/utils.js'].lineData[21] = 0;
  _$jscoverage['/base/utils.js'].lineData[23] = 0;
  _$jscoverage['/base/utils.js'].lineData[26] = 0;
  _$jscoverage['/base/utils.js'].lineData[28] = 0;
  _$jscoverage['/base/utils.js'].lineData[29] = 0;
  _$jscoverage['/base/utils.js'].lineData[30] = 0;
  _$jscoverage['/base/utils.js'].lineData[32] = 0;
  _$jscoverage['/base/utils.js'].lineData[33] = 0;
  _$jscoverage['/base/utils.js'].lineData[34] = 0;
  _$jscoverage['/base/utils.js'].lineData[36] = 0;
  _$jscoverage['/base/utils.js'].lineData[41] = 0;
  _$jscoverage['/base/utils.js'].lineData[43] = 0;
  _$jscoverage['/base/utils.js'].lineData[44] = 0;
  _$jscoverage['/base/utils.js'].lineData[50] = 0;
  _$jscoverage['/base/utils.js'].lineData[53] = 0;
  _$jscoverage['/base/utils.js'].lineData[55] = 0;
  _$jscoverage['/base/utils.js'].lineData[57] = 0;
  _$jscoverage['/base/utils.js'].lineData[59] = 0;
  _$jscoverage['/base/utils.js'].lineData[61] = 0;
  _$jscoverage['/base/utils.js'].lineData[65] = 0;
  _$jscoverage['/base/utils.js'].lineData[68] = 0;
  _$jscoverage['/base/utils.js'].lineData[69] = 0;
  _$jscoverage['/base/utils.js'].lineData[70] = 0;
  _$jscoverage['/base/utils.js'].lineData[71] = 0;
  _$jscoverage['/base/utils.js'].lineData[72] = 0;
  _$jscoverage['/base/utils.js'].lineData[73] = 0;
  _$jscoverage['/base/utils.js'].lineData[74] = 0;
  _$jscoverage['/base/utils.js'].lineData[77] = 0;
  _$jscoverage['/base/utils.js'].lineData[78] = 0;
  _$jscoverage['/base/utils.js'].lineData[79] = 0;
  _$jscoverage['/base/utils.js'].lineData[80] = 0;
  _$jscoverage['/base/utils.js'].lineData[81] = 0;
  _$jscoverage['/base/utils.js'].lineData[87] = 0;
  _$jscoverage['/base/utils.js'].lineData[90] = 0;
  _$jscoverage['/base/utils.js'].lineData[91] = 0;
  _$jscoverage['/base/utils.js'].lineData[92] = 0;
  _$jscoverage['/base/utils.js'].lineData[95] = 0;
  _$jscoverage['/base/utils.js'].lineData[99] = 0;
}
if (! _$jscoverage['/base/utils.js'].functionData) {
  _$jscoverage['/base/utils.js'].functionData = [];
  _$jscoverage['/base/utils.js'].functionData[0] = 0;
  _$jscoverage['/base/utils.js'].functionData[1] = 0;
  _$jscoverage['/base/utils.js'].functionData[2] = 0;
  _$jscoverage['/base/utils.js'].functionData[3] = 0;
  _$jscoverage['/base/utils.js'].functionData[4] = 0;
  _$jscoverage['/base/utils.js'].functionData[5] = 0;
  _$jscoverage['/base/utils.js'].functionData[6] = 0;
  _$jscoverage['/base/utils.js'].functionData[7] = 0;
  _$jscoverage['/base/utils.js'].functionData[8] = 0;
}
if (! _$jscoverage['/base/utils.js'].branchData) {
  _$jscoverage['/base/utils.js'].branchData = {};
  _$jscoverage['/base/utils.js'].branchData['10'] = [];
  _$jscoverage['/base/utils.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['17'] = [];
  _$jscoverage['/base/utils.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['28'] = [];
  _$jscoverage['/base/utils.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['33'] = [];
  _$jscoverage['/base/utils.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['41'] = [];
  _$jscoverage['/base/utils.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['43'] = [];
  _$jscoverage['/base/utils.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['68'] = [];
  _$jscoverage['/base/utils.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['68'][2] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['90'] = [];
  _$jscoverage['/base/utils.js'].branchData['90'][1] = new BranchData();
}
_$jscoverage['/base/utils.js'].branchData['90'][1].init(114, 9, '_ksGroups');
function visit21_90_1(result) {
  _$jscoverage['/base/utils.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['68'][2].init(140, 25, 'typeof types === \'object\'');
function visit20_68_2(result) {
  _$jscoverage['/base/utils.js'].branchData['68'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['68'][1].init(131, 34, 'types && typeof types === \'object\'');
function visit19_68_1(result) {
  _$jscoverage['/base/utils.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['43'][1].init(50, 24, 'typeof fn === \'function\'');
function visit18_43_1(result) {
  _$jscoverage['/base/utils.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['41'][1].init(23, 8, 'fn || {}');
function visit17_41_1(result) {
  _$jscoverage['/base/utils.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['33'][1].init(157, 24, 'type.indexOf(\' \') === -1');
function visit16_33_1(result) {
  _$jscoverage['/base/utils.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['28'][1].init(17, 15, 'S.isArray(type)');
function visit15_28_1(result) {
  _$jscoverage['/base/utils.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['17'][1].init(207, 2, 'gs');
function visit14_17_1(result) {
  _$jscoverage['/base/utils.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['10'][1].init(13, 21, 'type.indexOf(\'.\') < 0');
function visit13_10_1(result) {
  _$jscoverage['/base/utils.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/base/utils.js'].functionData[0]++;
  _$jscoverage['/base/utils.js'].lineData[7]++;
  var splitAndRun, getGroupsRe;
  _$jscoverage['/base/utils.js'].lineData[9]++;
  function getTypedGroups(type) {
    _$jscoverage['/base/utils.js'].functionData[1]++;
    _$jscoverage['/base/utils.js'].lineData[10]++;
    if (visit13_10_1(type.indexOf('.') < 0)) {
      _$jscoverage['/base/utils.js'].lineData[11]++;
      return [type, ''];
    }
    _$jscoverage['/base/utils.js'].lineData[13]++;
    var m = type.match(/([^.]+)?(\..+)?$/), t = m[1], ret = [t], gs = m[2];
    _$jscoverage['/base/utils.js'].lineData[17]++;
    if (visit14_17_1(gs)) {
      _$jscoverage['/base/utils.js'].lineData[18]++;
      gs = gs.split('.').sort();
      _$jscoverage['/base/utils.js'].lineData[19]++;
      ret.push(gs.join('.'));
    } else {
      _$jscoverage['/base/utils.js'].lineData[21]++;
      ret.push('');
    }
    _$jscoverage['/base/utils.js'].lineData[23]++;
    return ret;
  }
  _$jscoverage['/base/utils.js'].lineData[26]++;
  return {
  splitAndRun: splitAndRun = function(type, fn) {
  _$jscoverage['/base/utils.js'].functionData[2]++;
  _$jscoverage['/base/utils.js'].lineData[28]++;
  if (visit15_28_1(S.isArray(type))) {
    _$jscoverage['/base/utils.js'].lineData[29]++;
    S.each(type, fn);
    _$jscoverage['/base/utils.js'].lineData[30]++;
    return;
  }
  _$jscoverage['/base/utils.js'].lineData[32]++;
  type = S.trim(type);
  _$jscoverage['/base/utils.js'].lineData[33]++;
  if (visit16_33_1(type.indexOf(' ') === -1)) {
    _$jscoverage['/base/utils.js'].lineData[34]++;
    fn(type);
  } else {
    _$jscoverage['/base/utils.js'].lineData[36]++;
    S.each(type.split(/\s+/), fn);
  }
}, 
  normalizeParam: function(type, fn, context) {
  _$jscoverage['/base/utils.js'].functionData[3]++;
  _$jscoverage['/base/utils.js'].lineData[41]++;
  var cfg = visit17_41_1(fn || {});
  _$jscoverage['/base/utils.js'].lineData[43]++;
  if (visit18_43_1(typeof fn === 'function')) {
    _$jscoverage['/base/utils.js'].lineData[44]++;
    cfg = {
  fn: fn, 
  context: context};
  } else {
    _$jscoverage['/base/utils.js'].lineData[50]++;
    cfg = S.merge(cfg);
  }
  _$jscoverage['/base/utils.js'].lineData[53]++;
  var typedGroups = getTypedGroups(type);
  _$jscoverage['/base/utils.js'].lineData[55]++;
  type = typedGroups[0];
  _$jscoverage['/base/utils.js'].lineData[57]++;
  cfg.groups = typedGroups[1];
  _$jscoverage['/base/utils.js'].lineData[59]++;
  cfg.type = type;
  _$jscoverage['/base/utils.js'].lineData[61]++;
  return cfg;
}, 
  batchForType: function(fn, num) {
  _$jscoverage['/base/utils.js'].functionData[4]++;
  _$jscoverage['/base/utils.js'].lineData[65]++;
  var args = S.makeArray(arguments), types = args[2 + num];
  _$jscoverage['/base/utils.js'].lineData[68]++;
  if (visit19_68_1(types && visit20_68_2(typeof types === 'object'))) {
    _$jscoverage['/base/utils.js'].lineData[69]++;
    S.each(types, function(value, type) {
  _$jscoverage['/base/utils.js'].functionData[5]++;
  _$jscoverage['/base/utils.js'].lineData[70]++;
  var args2 = [].concat(args);
  _$jscoverage['/base/utils.js'].lineData[71]++;
  args2.splice(0, 2);
  _$jscoverage['/base/utils.js'].lineData[72]++;
  args2[num] = type;
  _$jscoverage['/base/utils.js'].lineData[73]++;
  args2[num + 1] = value;
  _$jscoverage['/base/utils.js'].lineData[74]++;
  fn.apply(null, args2);
});
  } else {
    _$jscoverage['/base/utils.js'].lineData[77]++;
    splitAndRun(types, function(type) {
  _$jscoverage['/base/utils.js'].functionData[6]++;
  _$jscoverage['/base/utils.js'].lineData[78]++;
  var args2 = [].concat(args);
  _$jscoverage['/base/utils.js'].lineData[79]++;
  args2.splice(0, 2);
  _$jscoverage['/base/utils.js'].lineData[80]++;
  args2[num] = type;
  _$jscoverage['/base/utils.js'].lineData[81]++;
  fn.apply(null, args2);
});
  }
}, 
  fillGroupsForEvent: function(type, eventData) {
  _$jscoverage['/base/utils.js'].functionData[7]++;
  _$jscoverage['/base/utils.js'].lineData[87]++;
  var typedGroups = getTypedGroups(type), _ksGroups = typedGroups[1];
  _$jscoverage['/base/utils.js'].lineData[90]++;
  if (visit21_90_1(_ksGroups)) {
    _$jscoverage['/base/utils.js'].lineData[91]++;
    _ksGroups = getGroupsRe(_ksGroups);
    _$jscoverage['/base/utils.js'].lineData[92]++;
    eventData._ksGroups = _ksGroups;
  }
  _$jscoverage['/base/utils.js'].lineData[95]++;
  eventData.type = typedGroups[0];
}, 
  getGroupsRe: getGroupsRe = function(groups) {
  _$jscoverage['/base/utils.js'].functionData[8]++;
  _$jscoverage['/base/utils.js'].lineData[99]++;
  return new RegExp(groups.split('.').join('.*\\.') + '(?:\\.|$)');
}};
});
