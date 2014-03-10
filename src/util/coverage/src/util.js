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
  _$jscoverage['/util.js'].lineData[14] = 0;
  _$jscoverage['/util.js'].lineData[15] = 0;
  _$jscoverage['/util.js'].lineData[16] = 0;
  _$jscoverage['/util.js'].lineData[17] = 0;
  _$jscoverage['/util.js'].lineData[19] = 0;
  _$jscoverage['/util.js'].lineData[34] = 0;
  _$jscoverage['/util.js'].lineData[36] = 0;
  _$jscoverage['/util.js'].lineData[38] = 0;
  _$jscoverage['/util.js'].lineData[39] = 0;
  _$jscoverage['/util.js'].lineData[40] = 0;
  _$jscoverage['/util.js'].lineData[41] = 0;
  _$jscoverage['/util.js'].lineData[43] = 0;
  _$jscoverage['/util.js'].lineData[47] = 0;
  _$jscoverage['/util.js'].lineData[48] = 0;
  _$jscoverage['/util.js'].lineData[52] = 0;
  _$jscoverage['/util.js'].lineData[53] = 0;
  _$jscoverage['/util.js'].lineData[58] = 0;
  _$jscoverage['/util.js'].lineData[59] = 0;
  _$jscoverage['/util.js'].lineData[65] = 0;
  _$jscoverage['/util.js'].lineData[67] = 0;
  _$jscoverage['/util.js'].lineData[68] = 0;
  _$jscoverage['/util.js'].lineData[70] = 0;
  _$jscoverage['/util.js'].lineData[71] = 0;
  _$jscoverage['/util.js'].lineData[72] = 0;
  _$jscoverage['/util.js'].lineData[73] = 0;
  _$jscoverage['/util.js'].lineData[75] = 0;
  _$jscoverage['/util.js'].lineData[76] = 0;
  _$jscoverage['/util.js'].lineData[77] = 0;
  _$jscoverage['/util.js'].lineData[83] = 0;
  _$jscoverage['/util.js'].lineData[85] = 0;
  _$jscoverage['/util.js'].lineData[95] = 0;
  _$jscoverage['/util.js'].lineData[96] = 0;
  _$jscoverage['/util.js'].lineData[97] = 0;
  _$jscoverage['/util.js'].lineData[99] = 0;
  _$jscoverage['/util.js'].lineData[100] = 0;
  _$jscoverage['/util.js'].lineData[102] = 0;
  _$jscoverage['/util.js'].lineData[104] = 0;
  _$jscoverage['/util.js'].lineData[110] = 0;
  _$jscoverage['/util.js'].lineData[113] = 0;
}
if (! _$jscoverage['/util.js'].functionData) {
  _$jscoverage['/util.js'].functionData = [];
  _$jscoverage['/util.js'].functionData[0] = 0;
  _$jscoverage['/util.js'].functionData[1] = 0;
  _$jscoverage['/util.js'].functionData[2] = 0;
  _$jscoverage['/util.js'].functionData[3] = 0;
}
if (! _$jscoverage['/util.js'].branchData) {
  _$jscoverage['/util.js'].branchData = {};
  _$jscoverage['/util.js'].branchData['39'] = [];
  _$jscoverage['/util.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['58'] = [];
  _$jscoverage['/util.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['65'] = [];
  _$jscoverage['/util.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['68'] = [];
  _$jscoverage['/util.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['71'] = [];
  _$jscoverage['/util.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['95'] = [];
  _$jscoverage['/util.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['96'] = [];
  _$jscoverage['/util.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['99'] = [];
  _$jscoverage['/util.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['102'] = [];
  _$jscoverage['/util.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['103'] = [];
  _$jscoverage['/util.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['103'][2] = new BranchData();
}
_$jscoverage['/util.js'].branchData['103'][2].init(50, 43, 'f.call(input, input[k], k, input) !== FALSE');
function visit181_103_2(result) {
  _$jscoverage['/util.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['103'][1].init(43, 51, '!f || (f.call(input, input[k], k, input) !== FALSE)');
function visit180_103_1(result) {
  _$jscoverage['/util.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['102'][2].init(24, 18, 'k !== CLONE_MARKER');
function visit179_102_2(result) {
  _$jscoverage['/util.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['102'][1].init(24, 96, 'k !== CLONE_MARKER && (!f || (f.call(input, input[k], k, input) !== FALSE))');
function visit178_102_1(result) {
  _$jscoverage['/util.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['99'][1].init(2121, 13, 'isPlainObject');
function visit177_99_1(result) {
  _$jscoverage['/util.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['96'][1].init(30, 22, 'i < destination.length');
function visit176_96_1(result) {
  _$jscoverage['/util.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['95'][1].init(1938, 7, 'isArray');
function visit175_95_1(result) {
  _$jscoverage['/util.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['71'][1].init(93, 63, 'S.inArray(Constructor, [Boolean, String, Number, Date, RegExp])');
function visit174_71_1(result) {
  _$jscoverage['/util.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['68'][1].init(515, 25, 'typeof input === \'object\'');
function visit173_68_1(result) {
  _$jscoverage['/util.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['65'][1].init(385, 19, 'input[CLONE_MARKER]');
function visit172_65_1(result) {
  _$jscoverage['/util.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['58'][1].init(134, 6, '!input');
function visit171_58_1(result) {
  _$jscoverage['/util.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['39'][1].init(84, 15, 'v[CLONE_MARKER]');
function visit170_39_1(result) {
  _$jscoverage['/util.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/util.js'].functionData[0]++;
  _$jscoverage['/util.js'].lineData[8]++;
  var FALSE = false, CLONE_MARKER = '__~ks_cloned';
  _$jscoverage['/util.js'].lineData[11]++;
  require('util/array');
  _$jscoverage['/util.js'].lineData[12]++;
  require('util/escape');
  _$jscoverage['/util.js'].lineData[13]++;
  require('util/function');
  _$jscoverage['/util.js'].lineData[14]++;
  require('util/object');
  _$jscoverage['/util.js'].lineData[15]++;
  require('util/string');
  _$jscoverage['/util.js'].lineData[16]++;
  require('util/type');
  _$jscoverage['/util.js'].lineData[17]++;
  require('util/web');
  _$jscoverage['/util.js'].lineData[19]++;
  S.mix(S, {
  clone: function(input, filter) {
  _$jscoverage['/util.js'].functionData[1]++;
  _$jscoverage['/util.js'].lineData[34]++;
  var memory = {}, ret = cloneInternal(input, filter, memory);
  _$jscoverage['/util.js'].lineData[36]++;
  S.each(memory, function(v) {
  _$jscoverage['/util.js'].functionData[2]++;
  _$jscoverage['/util.js'].lineData[38]++;
  v = v.input;
  _$jscoverage['/util.js'].lineData[39]++;
  if (visit170_39_1(v[CLONE_MARKER])) {
    _$jscoverage['/util.js'].lineData[40]++;
    try {
      _$jscoverage['/util.js'].lineData[41]++;
      delete v[CLONE_MARKER];
    }    catch (e) {
  _$jscoverage['/util.js'].lineData[43]++;
  v[CLONE_MARKER] = undefined;
}
  }
});
  _$jscoverage['/util.js'].lineData[47]++;
  memory = null;
  _$jscoverage['/util.js'].lineData[48]++;
  return ret;
}});
  _$jscoverage['/util.js'].lineData[52]++;
  function cloneInternal(input, f, memory) {
    _$jscoverage['/util.js'].functionData[3]++;
    _$jscoverage['/util.js'].lineData[53]++;
    var destination = input, isArray, isPlainObject, k, stamp;
    _$jscoverage['/util.js'].lineData[58]++;
    if (visit171_58_1(!input)) {
      _$jscoverage['/util.js'].lineData[59]++;
      return destination;
    }
    _$jscoverage['/util.js'].lineData[65]++;
    if (visit172_65_1(input[CLONE_MARKER])) {
      _$jscoverage['/util.js'].lineData[67]++;
      return memory[input[CLONE_MARKER]].destination;
    } else {
      _$jscoverage['/util.js'].lineData[68]++;
      if (visit173_68_1(typeof input === 'object')) {
        _$jscoverage['/util.js'].lineData[70]++;
        var Constructor = input.constructor;
        _$jscoverage['/util.js'].lineData[71]++;
        if (visit174_71_1(S.inArray(Constructor, [Boolean, String, Number, Date, RegExp]))) {
          _$jscoverage['/util.js'].lineData[72]++;
          destination = new Constructor(input.valueOf());
        } else {
          _$jscoverage['/util.js'].lineData[73]++;
          if ((isArray = S.isArray(input))) {
            _$jscoverage['/util.js'].lineData[75]++;
            destination = f ? S.filter(input, f) : input.concat();
          } else {
            _$jscoverage['/util.js'].lineData[76]++;
            if ((isPlainObject = S.isPlainObject(input))) {
              _$jscoverage['/util.js'].lineData[77]++;
              destination = {};
            }
          }
        }
        _$jscoverage['/util.js'].lineData[83]++;
        input[CLONE_MARKER] = (stamp = S.guid('c'));
        _$jscoverage['/util.js'].lineData[85]++;
        memory[stamp] = {
  destination: destination, 
  input: input};
      }
    }
    _$jscoverage['/util.js'].lineData[95]++;
    if (visit175_95_1(isArray)) {
      _$jscoverage['/util.js'].lineData[96]++;
      for (var i = 0; visit176_96_1(i < destination.length); i++) {
        _$jscoverage['/util.js'].lineData[97]++;
        destination[i] = cloneInternal(destination[i], f, memory);
      }
    } else {
      _$jscoverage['/util.js'].lineData[99]++;
      if (visit177_99_1(isPlainObject)) {
        _$jscoverage['/util.js'].lineData[100]++;
        for (k in input) {
          _$jscoverage['/util.js'].lineData[102]++;
          if (visit178_102_1(visit179_102_2(k !== CLONE_MARKER) && (visit180_103_1(!f || (visit181_103_2(f.call(input, input[k], k, input) !== FALSE)))))) {
            _$jscoverage['/util.js'].lineData[104]++;
            destination[k] = cloneInternal(input[k], f, memory);
          }
        }
      }
    }
    _$jscoverage['/util.js'].lineData[110]++;
    return destination;
  }
  _$jscoverage['/util.js'].lineData[113]++;
  return S;
});
