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
  _$jscoverage['/base/utils.js'].lineData[8] = 0;
  _$jscoverage['/base/utils.js'].lineData[10] = 0;
  _$jscoverage['/base/utils.js'].lineData[11] = 0;
  _$jscoverage['/base/utils.js'].lineData[12] = 0;
  _$jscoverage['/base/utils.js'].lineData[14] = 0;
  _$jscoverage['/base/utils.js'].lineData[18] = 0;
  _$jscoverage['/base/utils.js'].lineData[19] = 0;
  _$jscoverage['/base/utils.js'].lineData[20] = 0;
  _$jscoverage['/base/utils.js'].lineData[22] = 0;
  _$jscoverage['/base/utils.js'].lineData[24] = 0;
  _$jscoverage['/base/utils.js'].lineData[27] = 0;
  _$jscoverage['/base/utils.js'].lineData[30] = 0;
  _$jscoverage['/base/utils.js'].lineData[31] = 0;
  _$jscoverage['/base/utils.js'].lineData[32] = 0;
  _$jscoverage['/base/utils.js'].lineData[34] = 0;
  _$jscoverage['/base/utils.js'].lineData[35] = 0;
  _$jscoverage['/base/utils.js'].lineData[36] = 0;
  _$jscoverage['/base/utils.js'].lineData[38] = 0;
  _$jscoverage['/base/utils.js'].lineData[43] = 0;
  _$jscoverage['/base/utils.js'].lineData[45] = 0;
  _$jscoverage['/base/utils.js'].lineData[46] = 0;
  _$jscoverage['/base/utils.js'].lineData[52] = 0;
  _$jscoverage['/base/utils.js'].lineData[55] = 0;
  _$jscoverage['/base/utils.js'].lineData[57] = 0;
  _$jscoverage['/base/utils.js'].lineData[59] = 0;
  _$jscoverage['/base/utils.js'].lineData[61] = 0;
  _$jscoverage['/base/utils.js'].lineData[63] = 0;
  _$jscoverage['/base/utils.js'].lineData[67] = 0;
  _$jscoverage['/base/utils.js'].lineData[70] = 0;
  _$jscoverage['/base/utils.js'].lineData[71] = 0;
  _$jscoverage['/base/utils.js'].lineData[72] = 0;
  _$jscoverage['/base/utils.js'].lineData[73] = 0;
  _$jscoverage['/base/utils.js'].lineData[74] = 0;
  _$jscoverage['/base/utils.js'].lineData[75] = 0;
  _$jscoverage['/base/utils.js'].lineData[76] = 0;
  _$jscoverage['/base/utils.js'].lineData[79] = 0;
  _$jscoverage['/base/utils.js'].lineData[80] = 0;
  _$jscoverage['/base/utils.js'].lineData[81] = 0;
  _$jscoverage['/base/utils.js'].lineData[82] = 0;
  _$jscoverage['/base/utils.js'].lineData[83] = 0;
  _$jscoverage['/base/utils.js'].lineData[89] = 0;
  _$jscoverage['/base/utils.js'].lineData[92] = 0;
  _$jscoverage['/base/utils.js'].lineData[93] = 0;
  _$jscoverage['/base/utils.js'].lineData[94] = 0;
  _$jscoverage['/base/utils.js'].lineData[97] = 0;
  _$jscoverage['/base/utils.js'].lineData[101] = 0;
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
  _$jscoverage['/base/utils.js'].branchData['11'] = [];
  _$jscoverage['/base/utils.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['18'] = [];
  _$jscoverage['/base/utils.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['30'] = [];
  _$jscoverage['/base/utils.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['35'] = [];
  _$jscoverage['/base/utils.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['43'] = [];
  _$jscoverage['/base/utils.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['45'] = [];
  _$jscoverage['/base/utils.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['70'] = [];
  _$jscoverage['/base/utils.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['70'][2] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['92'] = [];
  _$jscoverage['/base/utils.js'].branchData['92'][1] = new BranchData();
}
_$jscoverage['/base/utils.js'].branchData['92'][1].init(119, 10, '_ks_groups');
function visit21_92_1(result) {
  _$jscoverage['/base/utils.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['70'][2].init(144, 24, 'typeof types == \'object\'');
function visit20_70_2(result) {
  _$jscoverage['/base/utils.js'].branchData['70'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['70'][1].init(135, 33, 'types && typeof types == \'object\'');
function visit19_70_1(result) {
  _$jscoverage['/base/utils.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['45'][1].init(53, 24, 'typeof fn === \'function\'');
function visit18_45_1(result) {
  _$jscoverage['/base/utils.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['43'][1].init(24, 8, 'fn || {}');
function visit17_43_1(result) {
  _$jscoverage['/base/utils.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['35'][1].init(163, 23, 'type.indexOf(\' \') == -1');
function visit16_35_1(result) {
  _$jscoverage['/base/utils.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['30'][1].init(18, 15, 'S.isArray(type)');
function visit15_30_1(result) {
  _$jscoverage['/base/utils.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['18'][1].init(215, 2, 'gs');
function visit14_18_1(result) {
  _$jscoverage['/base/utils.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['11'][1].init(14, 21, 'type.indexOf(\'.\') < 0');
function visit13_11_1(result) {
  _$jscoverage['/base/utils.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].lineData[6]++;
KISSY.add('event/base/utils', function(S) {
  _$jscoverage['/base/utils.js'].functionData[0]++;
  _$jscoverage['/base/utils.js'].lineData[8]++;
  var splitAndRun, getGroupsRe;
  _$jscoverage['/base/utils.js'].lineData[10]++;
  function getTypedGroups(type) {
    _$jscoverage['/base/utils.js'].functionData[1]++;
    _$jscoverage['/base/utils.js'].lineData[11]++;
    if (visit13_11_1(type.indexOf('.') < 0)) {
      _$jscoverage['/base/utils.js'].lineData[12]++;
      return [type, ''];
    }
    _$jscoverage['/base/utils.js'].lineData[14]++;
    var m = type.match(/([^.]+)?(\..+)?$/), t = m[1], ret = [t], gs = m[2];
    _$jscoverage['/base/utils.js'].lineData[18]++;
    if (visit14_18_1(gs)) {
      _$jscoverage['/base/utils.js'].lineData[19]++;
      gs = gs.split('.').sort();
      _$jscoverage['/base/utils.js'].lineData[20]++;
      ret.push(gs.join('.'));
    } else {
      _$jscoverage['/base/utils.js'].lineData[22]++;
      ret.push('');
    }
    _$jscoverage['/base/utils.js'].lineData[24]++;
    return ret;
  }
  _$jscoverage['/base/utils.js'].lineData[27]++;
  return {
  splitAndRun: splitAndRun = function(type, fn) {
  _$jscoverage['/base/utils.js'].functionData[2]++;
  _$jscoverage['/base/utils.js'].lineData[30]++;
  if (visit15_30_1(S.isArray(type))) {
    _$jscoverage['/base/utils.js'].lineData[31]++;
    S.each(type, fn);
    _$jscoverage['/base/utils.js'].lineData[32]++;
    return;
  }
  _$jscoverage['/base/utils.js'].lineData[34]++;
  type = S.trim(type);
  _$jscoverage['/base/utils.js'].lineData[35]++;
  if (visit16_35_1(type.indexOf(' ') == -1)) {
    _$jscoverage['/base/utils.js'].lineData[36]++;
    fn(type);
  } else {
    _$jscoverage['/base/utils.js'].lineData[38]++;
    S.each(type.split(/\s+/), fn);
  }
}, 
  normalizeParam: function(type, fn, context) {
  _$jscoverage['/base/utils.js'].functionData[3]++;
  _$jscoverage['/base/utils.js'].lineData[43]++;
  var cfg = visit17_43_1(fn || {});
  _$jscoverage['/base/utils.js'].lineData[45]++;
  if (visit18_45_1(typeof fn === 'function')) {
    _$jscoverage['/base/utils.js'].lineData[46]++;
    cfg = {
  fn: fn, 
  context: context};
  } else {
    _$jscoverage['/base/utils.js'].lineData[52]++;
    cfg = S.merge(cfg);
  }
  _$jscoverage['/base/utils.js'].lineData[55]++;
  var typedGroups = getTypedGroups(type);
  _$jscoverage['/base/utils.js'].lineData[57]++;
  type = typedGroups[0];
  _$jscoverage['/base/utils.js'].lineData[59]++;
  cfg.groups = typedGroups[1];
  _$jscoverage['/base/utils.js'].lineData[61]++;
  cfg.type = type;
  _$jscoverage['/base/utils.js'].lineData[63]++;
  return cfg;
}, 
  batchForType: function(fn, num) {
  _$jscoverage['/base/utils.js'].functionData[4]++;
  _$jscoverage['/base/utils.js'].lineData[67]++;
  var args = S.makeArray(arguments), types = args[2 + num];
  _$jscoverage['/base/utils.js'].lineData[70]++;
  if (visit19_70_1(types && visit20_70_2(typeof types == 'object'))) {
    _$jscoverage['/base/utils.js'].lineData[71]++;
    S.each(types, function(value, type) {
  _$jscoverage['/base/utils.js'].functionData[5]++;
  _$jscoverage['/base/utils.js'].lineData[72]++;
  var args2 = [].concat(args);
  _$jscoverage['/base/utils.js'].lineData[73]++;
  args2.splice(0, 2);
  _$jscoverage['/base/utils.js'].lineData[74]++;
  args2[num] = type;
  _$jscoverage['/base/utils.js'].lineData[75]++;
  args2[num + 1] = value;
  _$jscoverage['/base/utils.js'].lineData[76]++;
  fn.apply(null, args2);
});
  } else {
    _$jscoverage['/base/utils.js'].lineData[79]++;
    splitAndRun(types, function(type) {
  _$jscoverage['/base/utils.js'].functionData[6]++;
  _$jscoverage['/base/utils.js'].lineData[80]++;
  var args2 = [].concat(args);
  _$jscoverage['/base/utils.js'].lineData[81]++;
  args2.splice(0, 2);
  _$jscoverage['/base/utils.js'].lineData[82]++;
  args2[num] = type;
  _$jscoverage['/base/utils.js'].lineData[83]++;
  fn.apply(null, args2);
});
  }
}, 
  fillGroupsForEvent: function(type, eventData) {
  _$jscoverage['/base/utils.js'].functionData[7]++;
  _$jscoverage['/base/utils.js'].lineData[89]++;
  var typedGroups = getTypedGroups(type), _ks_groups = typedGroups[1];
  _$jscoverage['/base/utils.js'].lineData[92]++;
  if (visit21_92_1(_ks_groups)) {
    _$jscoverage['/base/utils.js'].lineData[93]++;
    _ks_groups = getGroupsRe(_ks_groups);
    _$jscoverage['/base/utils.js'].lineData[94]++;
    eventData._ks_groups = _ks_groups;
  }
  _$jscoverage['/base/utils.js'].lineData[97]++;
  eventData.type = typedGroups[0];
}, 
  getGroupsRe: getGroupsRe = function(groups) {
  _$jscoverage['/base/utils.js'].functionData[8]++;
  _$jscoverage['/base/utils.js'].lineData[101]++;
  return new RegExp(groups.split('.').join('.*\\.') + '(?:\\.|$)');
}};
});
