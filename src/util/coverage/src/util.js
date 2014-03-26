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
if (! _$jscoverage['/util.js']) {
  _$jscoverage['/util.js'] = {};
  _$jscoverage['/util.js'].lineData = [];
  _$jscoverage['/util.js'].lineData[7] = 0;
  _$jscoverage['/util.js'].lineData[8] = 0;
  _$jscoverage['/util.js'].lineData[11] = 0;
  _$jscoverage['/util.js'].lineData[12] = 0;
  _$jscoverage['/util.js'].lineData[13] = 0;
  _$jscoverage['/util.js'].lineData[15] = 0;
  _$jscoverage['/util.js'].lineData[18] = 0;
  _$jscoverage['/util.js'].lineData[19] = 0;
  _$jscoverage['/util.js'].lineData[20] = 0;
  _$jscoverage['/util.js'].lineData[21] = 0;
  _$jscoverage['/util.js'].lineData[22] = 0;
  _$jscoverage['/util.js'].lineData[23] = 0;
  _$jscoverage['/util.js'].lineData[24] = 0;
  _$jscoverage['/util.js'].lineData[26] = 0;
  _$jscoverage['/util.js'].lineData[41] = 0;
  _$jscoverage['/util.js'].lineData[43] = 0;
  _$jscoverage['/util.js'].lineData[45] = 0;
  _$jscoverage['/util.js'].lineData[46] = 0;
  _$jscoverage['/util.js'].lineData[47] = 0;
  _$jscoverage['/util.js'].lineData[48] = 0;
  _$jscoverage['/util.js'].lineData[50] = 0;
  _$jscoverage['/util.js'].lineData[54] = 0;
  _$jscoverage['/util.js'].lineData[55] = 0;
  _$jscoverage['/util.js'].lineData[59] = 0;
  _$jscoverage['/util.js'].lineData[60] = 0;
  _$jscoverage['/util.js'].lineData[65] = 0;
  _$jscoverage['/util.js'].lineData[66] = 0;
  _$jscoverage['/util.js'].lineData[72] = 0;
  _$jscoverage['/util.js'].lineData[74] = 0;
  _$jscoverage['/util.js'].lineData[75] = 0;
  _$jscoverage['/util.js'].lineData[77] = 0;
  _$jscoverage['/util.js'].lineData[78] = 0;
  _$jscoverage['/util.js'].lineData[79] = 0;
  _$jscoverage['/util.js'].lineData[80] = 0;
  _$jscoverage['/util.js'].lineData[82] = 0;
  _$jscoverage['/util.js'].lineData[83] = 0;
  _$jscoverage['/util.js'].lineData[84] = 0;
  _$jscoverage['/util.js'].lineData[90] = 0;
  _$jscoverage['/util.js'].lineData[92] = 0;
  _$jscoverage['/util.js'].lineData[102] = 0;
  _$jscoverage['/util.js'].lineData[103] = 0;
  _$jscoverage['/util.js'].lineData[104] = 0;
  _$jscoverage['/util.js'].lineData[106] = 0;
  _$jscoverage['/util.js'].lineData[107] = 0;
  _$jscoverage['/util.js'].lineData[109] = 0;
  _$jscoverage['/util.js'].lineData[111] = 0;
  _$jscoverage['/util.js'].lineData[117] = 0;
  _$jscoverage['/util.js'].lineData[120] = 0;
}
if (! _$jscoverage['/util.js'].functionData) {
  _$jscoverage['/util.js'].functionData = [];
  _$jscoverage['/util.js'].functionData[0] = 0;
  _$jscoverage['/util.js'].functionData[1] = 0;
  _$jscoverage['/util.js'].functionData[2] = 0;
  _$jscoverage['/util.js'].functionData[3] = 0;
  _$jscoverage['/util.js'].functionData[4] = 0;
}
if (! _$jscoverage['/util.js'].branchData) {
  _$jscoverage['/util.js'].branchData = {};
  _$jscoverage['/util.js'].branchData['46'] = [];
  _$jscoverage['/util.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['65'] = [];
  _$jscoverage['/util.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['72'] = [];
  _$jscoverage['/util.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['75'] = [];
  _$jscoverage['/util.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['78'] = [];
  _$jscoverage['/util.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['102'] = [];
  _$jscoverage['/util.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['103'] = [];
  _$jscoverage['/util.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['106'] = [];
  _$jscoverage['/util.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['109'] = [];
  _$jscoverage['/util.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['110'] = [];
  _$jscoverage['/util.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['110'][2] = new BranchData();
}
_$jscoverage['/util.js'].branchData['110'][2].init(50, 43, 'f.call(input, input[k], k, input) !== FALSE');
function visit228_110_2(result) {
  _$jscoverage['/util.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['110'][1].init(43, 51, '!f || (f.call(input, input[k], k, input) !== FALSE)');
function visit227_110_1(result) {
  _$jscoverage['/util.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['109'][2].init(24, 18, 'k !== CLONE_MARKER');
function visit226_109_2(result) {
  _$jscoverage['/util.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['109'][1].init(24, 96, 'k !== CLONE_MARKER && (!f || (f.call(input, input[k], k, input) !== FALSE))');
function visit225_109_1(result) {
  _$jscoverage['/util.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['106'][1].init(2121, 13, 'isPlainObject');
function visit224_106_1(result) {
  _$jscoverage['/util.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['103'][1].init(30, 22, 'i < destination.length');
function visit223_103_1(result) {
  _$jscoverage['/util.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['102'][1].init(1938, 7, 'isArray');
function visit222_102_1(result) {
  _$jscoverage['/util.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['78'][1].init(93, 63, 'S.inArray(Constructor, [Boolean, String, Number, Date, RegExp])');
function visit221_78_1(result) {
  _$jscoverage['/util.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['75'][1].init(515, 25, 'typeof input === \'object\'');
function visit220_75_1(result) {
  _$jscoverage['/util.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['72'][1].init(385, 19, 'input[CLONE_MARKER]');
function visit219_72_1(result) {
  _$jscoverage['/util.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['65'][1].init(134, 6, '!input');
function visit218_65_1(result) {
  _$jscoverage['/util.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['46'][1].init(84, 15, 'v[CLONE_MARKER]');
function visit217_46_1(result) {
  _$jscoverage['/util.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/util.js'].functionData[0]++;
  _$jscoverage['/util.js'].lineData[8]++;
  var FALSE = false, CLONE_MARKER = '__~ks_cloned';
  _$jscoverage['/util.js'].lineData[11]++;
  S.mix = function(to, from) {
  _$jscoverage['/util.js'].functionData[1]++;
  _$jscoverage['/util.js'].lineData[12]++;
  for (var i in from) {
    _$jscoverage['/util.js'].lineData[13]++;
    to[i] = from[i];
  }
  _$jscoverage['/util.js'].lineData[15]++;
  return to;
};
  _$jscoverage['/util.js'].lineData[18]++;
  require('util/array');
  _$jscoverage['/util.js'].lineData[19]++;
  require('util/escape');
  _$jscoverage['/util.js'].lineData[20]++;
  require('util/function');
  _$jscoverage['/util.js'].lineData[21]++;
  require('util/object');
  _$jscoverage['/util.js'].lineData[22]++;
  require('util/string');
  _$jscoverage['/util.js'].lineData[23]++;
  require('util/type');
  _$jscoverage['/util.js'].lineData[24]++;
  require('util/web');
  _$jscoverage['/util.js'].lineData[26]++;
  S.mix(S, {
  clone: function(input, filter) {
  _$jscoverage['/util.js'].functionData[2]++;
  _$jscoverage['/util.js'].lineData[41]++;
  var memory = {}, ret = cloneInternal(input, filter, memory);
  _$jscoverage['/util.js'].lineData[43]++;
  S.each(memory, function(v) {
  _$jscoverage['/util.js'].functionData[3]++;
  _$jscoverage['/util.js'].lineData[45]++;
  v = v.input;
  _$jscoverage['/util.js'].lineData[46]++;
  if (visit217_46_1(v[CLONE_MARKER])) {
    _$jscoverage['/util.js'].lineData[47]++;
    try {
      _$jscoverage['/util.js'].lineData[48]++;
      delete v[CLONE_MARKER];
    }    catch (e) {
  _$jscoverage['/util.js'].lineData[50]++;
  v[CLONE_MARKER] = undefined;
}
  }
});
  _$jscoverage['/util.js'].lineData[54]++;
  memory = null;
  _$jscoverage['/util.js'].lineData[55]++;
  return ret;
}});
  _$jscoverage['/util.js'].lineData[59]++;
  function cloneInternal(input, f, memory) {
    _$jscoverage['/util.js'].functionData[4]++;
    _$jscoverage['/util.js'].lineData[60]++;
    var destination = input, isArray, isPlainObject, k, stamp;
    _$jscoverage['/util.js'].lineData[65]++;
    if (visit218_65_1(!input)) {
      _$jscoverage['/util.js'].lineData[66]++;
      return destination;
    }
    _$jscoverage['/util.js'].lineData[72]++;
    if (visit219_72_1(input[CLONE_MARKER])) {
      _$jscoverage['/util.js'].lineData[74]++;
      return memory[input[CLONE_MARKER]].destination;
    } else {
      _$jscoverage['/util.js'].lineData[75]++;
      if (visit220_75_1(typeof input === 'object')) {
        _$jscoverage['/util.js'].lineData[77]++;
        var Constructor = input.constructor;
        _$jscoverage['/util.js'].lineData[78]++;
        if (visit221_78_1(S.inArray(Constructor, [Boolean, String, Number, Date, RegExp]))) {
          _$jscoverage['/util.js'].lineData[79]++;
          destination = new Constructor(input.valueOf());
        } else {
          _$jscoverage['/util.js'].lineData[80]++;
          if ((isArray = S.isArray(input))) {
            _$jscoverage['/util.js'].lineData[82]++;
            destination = f ? S.filter(input, f) : input.concat();
          } else {
            _$jscoverage['/util.js'].lineData[83]++;
            if ((isPlainObject = S.isPlainObject(input))) {
              _$jscoverage['/util.js'].lineData[84]++;
              destination = {};
            }
          }
        }
        _$jscoverage['/util.js'].lineData[90]++;
        input[CLONE_MARKER] = (stamp = S.guid('c'));
        _$jscoverage['/util.js'].lineData[92]++;
        memory[stamp] = {
  destination: destination, 
  input: input};
      }
    }
    _$jscoverage['/util.js'].lineData[102]++;
    if (visit222_102_1(isArray)) {
      _$jscoverage['/util.js'].lineData[103]++;
      for (var i = 0; visit223_103_1(i < destination.length); i++) {
        _$jscoverage['/util.js'].lineData[104]++;
        destination[i] = cloneInternal(destination[i], f, memory);
      }
    } else {
      _$jscoverage['/util.js'].lineData[106]++;
      if (visit224_106_1(isPlainObject)) {
        _$jscoverage['/util.js'].lineData[107]++;
        for (k in input) {
          _$jscoverage['/util.js'].lineData[109]++;
          if (visit225_109_1(visit226_109_2(k !== CLONE_MARKER) && (visit227_110_1(!f || (visit228_110_2(f.call(input, input[k], k, input) !== FALSE)))))) {
            _$jscoverage['/util.js'].lineData[111]++;
            destination[k] = cloneInternal(input[k], f, memory);
          }
        }
      }
    }
    _$jscoverage['/util.js'].lineData[117]++;
    return destination;
  }
  _$jscoverage['/util.js'].lineData[120]++;
  return S;
});
