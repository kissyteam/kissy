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
if (! _$jscoverage['/kison/utils.js']) {
  _$jscoverage['/kison/utils.js'] = {};
  _$jscoverage['/kison/utils.js'].lineData = [];
  _$jscoverage['/kison/utils.js'].lineData[5] = 0;
  _$jscoverage['/kison/utils.js'].lineData[7] = 0;
  _$jscoverage['/kison/utils.js'].lineData[9] = 0;
  _$jscoverage['/kison/utils.js'].lineData[12] = 0;
  _$jscoverage['/kison/utils.js'].lineData[13] = 0;
  _$jscoverage['/kison/utils.js'].lineData[14] = 0;
  _$jscoverage['/kison/utils.js'].lineData[16] = 0;
  _$jscoverage['/kison/utils.js'].lineData[18] = 0;
  _$jscoverage['/kison/utils.js'].lineData[27] = 0;
  _$jscoverage['/kison/utils.js'].lineData[29] = 0;
  _$jscoverage['/kison/utils.js'].lineData[32] = 0;
  _$jscoverage['/kison/utils.js'].lineData[35] = 0;
  _$jscoverage['/kison/utils.js'].lineData[36] = 0;
  _$jscoverage['/kison/utils.js'].lineData[39] = 0;
  _$jscoverage['/kison/utils.js'].lineData[41] = 0;
  _$jscoverage['/kison/utils.js'].lineData[42] = 0;
  _$jscoverage['/kison/utils.js'].lineData[43] = 0;
  _$jscoverage['/kison/utils.js'].lineData[44] = 0;
  _$jscoverage['/kison/utils.js'].lineData[45] = 0;
  _$jscoverage['/kison/utils.js'].lineData[46] = 0;
  _$jscoverage['/kison/utils.js'].lineData[51] = 0;
  _$jscoverage['/kison/utils.js'].lineData[52] = 0;
  _$jscoverage['/kison/utils.js'].lineData[53] = 0;
  _$jscoverage['/kison/utils.js'].lineData[54] = 0;
  _$jscoverage['/kison/utils.js'].lineData[55] = 0;
  _$jscoverage['/kison/utils.js'].lineData[56] = 0;
  _$jscoverage['/kison/utils.js'].lineData[57] = 0;
  _$jscoverage['/kison/utils.js'].lineData[60] = 0;
  _$jscoverage['/kison/utils.js'].lineData[61] = 0;
  _$jscoverage['/kison/utils.js'].lineData[62] = 0;
  _$jscoverage['/kison/utils.js'].lineData[63] = 0;
  _$jscoverage['/kison/utils.js'].lineData[64] = 0;
  _$jscoverage['/kison/utils.js'].lineData[65] = 0;
  _$jscoverage['/kison/utils.js'].lineData[66] = 0;
  _$jscoverage['/kison/utils.js'].lineData[67] = 0;
  _$jscoverage['/kison/utils.js'].lineData[68] = 0;
  _$jscoverage['/kison/utils.js'].lineData[69] = 0;
  _$jscoverage['/kison/utils.js'].lineData[71] = 0;
  _$jscoverage['/kison/utils.js'].lineData[72] = 0;
  _$jscoverage['/kison/utils.js'].lineData[73] = 0;
  _$jscoverage['/kison/utils.js'].lineData[75] = 0;
  _$jscoverage['/kison/utils.js'].lineData[76] = 0;
  _$jscoverage['/kison/utils.js'].lineData[77] = 0;
  _$jscoverage['/kison/utils.js'].lineData[79] = 0;
  _$jscoverage['/kison/utils.js'].lineData[80] = 0;
  _$jscoverage['/kison/utils.js'].lineData[82] = 0;
}
if (! _$jscoverage['/kison/utils.js'].functionData) {
  _$jscoverage['/kison/utils.js'].functionData = [];
  _$jscoverage['/kison/utils.js'].functionData[0] = 0;
  _$jscoverage['/kison/utils.js'].functionData[1] = 0;
  _$jscoverage['/kison/utils.js'].functionData[2] = 0;
  _$jscoverage['/kison/utils.js'].functionData[3] = 0;
}
if (! _$jscoverage['/kison/utils.js'].branchData) {
  _$jscoverage['/kison/utils.js'].branchData = {};
  _$jscoverage['/kison/utils.js'].branchData['13'] = [];
  _$jscoverage['/kison/utils.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['29'] = [];
  _$jscoverage['/kison/utils.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['30'] = [];
  _$jscoverage['/kison/utils.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['30'][2] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['31'] = [];
  _$jscoverage['/kison/utils.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['35'] = [];
  _$jscoverage['/kison/utils.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['41'] = [];
  _$jscoverage['/kison/utils.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['43'] = [];
  _$jscoverage['/kison/utils.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['45'] = [];
  _$jscoverage['/kison/utils.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['51'] = [];
  _$jscoverage['/kison/utils.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['56'] = [];
  _$jscoverage['/kison/utils.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['63'] = [];
  _$jscoverage['/kison/utils.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['68'] = [];
  _$jscoverage['/kison/utils.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['68'][2] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['72'] = [];
  _$jscoverage['/kison/utils.js'].branchData['72'][1] = new BranchData();
}
_$jscoverage['/kison/utils.js'].branchData['72'][1].init(270, 11, 't === false');
function visit141_72_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['68'][2].init(77, 45, 'S.isRegExp(excludeReg) && i.match(excludeReg)');
function visit140_68_2(result) {
  _$jscoverage['/kison/utils.js'].branchData['68'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['68'][1].init(63, 59, 'excludeReg && S.isRegExp(excludeReg) && i.match(excludeReg)');
function visit139_68_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['63'][1].init(1233, 15, 'S.isObject(obj)');
function visit138_63_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['56'][1].init(87, 11, 't !== false');
function visit137_56_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['51'][1].init(787, 14, 'S.isArray(obj)');
function visit136_51_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['45'][1].init(526, 15, 'S.isRegExp(obj)');
function visit135_45_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['43'][1].init(442, 21, 'typeof obj === \'number\'');
function visit134_43_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['41'][1].init(336, 22, 'typeof obj == \'string\'');
function visit133_41_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['35'][1].init(228, 15, 'r !== undefined');
function visit132_35_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['31'][1].init(54, 30, '(r = excludeReg(obj)) === false');
function visit131_31_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['30'][2].init(76, 32, 'typeof excludeReg === \'function\'');
function visit130_30_2(result) {
  _$jscoverage['/kison/utils.js'].branchData['30'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['30'][1].init(31, 85, '(typeof excludeReg === \'function\') && (r = excludeReg(obj)) === false');
function visit129_30_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['29'][1].init(42, 117, 'excludeReg && (typeof excludeReg === \'function\') && (r = excludeReg(obj)) === false');
function visit128_29_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['13'][1].init(52, 12, 'quote == \'"\'');
function visit127_13_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].lineData[5]++;
KISSY.add("kison/utils", function(S) {
  _$jscoverage['/kison/utils.js'].functionData[0]++;
  _$jscoverage['/kison/utils.js'].lineData[7]++;
  var doubleReg = /"/g, single = /'/g, escapeString;
  _$jscoverage['/kison/utils.js'].lineData[9]++;
  return {
  escapeString: escapeString = function(str, quote) {
  _$jscoverage['/kison/utils.js'].functionData[1]++;
  _$jscoverage['/kison/utils.js'].lineData[12]++;
  var regexp = single;
  _$jscoverage['/kison/utils.js'].lineData[13]++;
  if (visit127_13_1(quote == '"')) {
    _$jscoverage['/kison/utils.js'].lineData[14]++;
    regexp = doubleReg;
  } else {
    _$jscoverage['/kison/utils.js'].lineData[16]++;
    quote = "'";
  }
  _$jscoverage['/kison/utils.js'].lineData[18]++;
  return str.replace(/\\/g, '\\\\').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(regexp, '\\' + quote);
}, 
  serializeObject: function serializeObject(obj, excludeReg) {
  _$jscoverage['/kison/utils.js'].functionData[2]++;
  _$jscoverage['/kison/utils.js'].lineData[27]++;
  var r;
  _$jscoverage['/kison/utils.js'].lineData[29]++;
  if (visit128_29_1(excludeReg && visit129_30_1((visit130_30_2(typeof excludeReg === 'function')) && visit131_31_1((r = excludeReg(obj)) === false)))) {
    _$jscoverage['/kison/utils.js'].lineData[32]++;
    return false;
  }
  _$jscoverage['/kison/utils.js'].lineData[35]++;
  if (visit132_35_1(r !== undefined)) {
    _$jscoverage['/kison/utils.js'].lineData[36]++;
    obj = r;
  }
  _$jscoverage['/kison/utils.js'].lineData[39]++;
  var ret = [];
  _$jscoverage['/kison/utils.js'].lineData[41]++;
  if (visit133_41_1(typeof obj == 'string')) {
    _$jscoverage['/kison/utils.js'].lineData[42]++;
    return "'" + escapeString(obj) + "'";
  } else {
    _$jscoverage['/kison/utils.js'].lineData[43]++;
    if (visit134_43_1(typeof obj === 'number')) {
      _$jscoverage['/kison/utils.js'].lineData[44]++;
      return obj + "";
    } else {
      _$jscoverage['/kison/utils.js'].lineData[45]++;
      if (visit135_45_1(S.isRegExp(obj))) {
        _$jscoverage['/kison/utils.js'].lineData[46]++;
        return '/' + obj.source + '/' + (obj.global ? 'g' : '') + (obj.ignoreCase ? 'i' : '') + (obj.multiline ? 'm' : '');
      } else {
        _$jscoverage['/kison/utils.js'].lineData[51]++;
        if (visit136_51_1(S.isArray(obj))) {
          _$jscoverage['/kison/utils.js'].lineData[52]++;
          ret.push('[');
          _$jscoverage['/kison/utils.js'].lineData[53]++;
          var sub = [];
          _$jscoverage['/kison/utils.js'].lineData[54]++;
          S.each(obj, function(v) {
  _$jscoverage['/kison/utils.js'].functionData[3]++;
  _$jscoverage['/kison/utils.js'].lineData[55]++;
  var t = serializeObject(v, excludeReg);
  _$jscoverage['/kison/utils.js'].lineData[56]++;
  if (visit137_56_1(t !== false)) {
    _$jscoverage['/kison/utils.js'].lineData[57]++;
    sub.push(t);
  }
});
          _$jscoverage['/kison/utils.js'].lineData[60]++;
          ret.push(sub.join(', '));
          _$jscoverage['/kison/utils.js'].lineData[61]++;
          ret.push(']');
          _$jscoverage['/kison/utils.js'].lineData[62]++;
          return ret.join("");
        } else {
          _$jscoverage['/kison/utils.js'].lineData[63]++;
          if (visit138_63_1(S.isObject(obj))) {
            _$jscoverage['/kison/utils.js'].lineData[64]++;
            ret = ['{'];
            _$jscoverage['/kison/utils.js'].lineData[65]++;
            var start = 1;
            _$jscoverage['/kison/utils.js'].lineData[66]++;
            for (var i in obj) {
              _$jscoverage['/kison/utils.js'].lineData[67]++;
              var v = obj[i];
              _$jscoverage['/kison/utils.js'].lineData[68]++;
              if (visit139_68_1(excludeReg && visit140_68_2(S.isRegExp(excludeReg) && i.match(excludeReg)))) {
                _$jscoverage['/kison/utils.js'].lineData[69]++;
                continue;
              }
              _$jscoverage['/kison/utils.js'].lineData[71]++;
              var t = serializeObject(v, excludeReg);
              _$jscoverage['/kison/utils.js'].lineData[72]++;
              if (visit141_72_1(t === false)) {
                _$jscoverage['/kison/utils.js'].lineData[73]++;
                continue;
              }
              _$jscoverage['/kison/utils.js'].lineData[75]++;
              var key = "'" + escapeString(i) + "'";
              _$jscoverage['/kison/utils.js'].lineData[76]++;
              ret.push((start ? '' : ',') + key + ': ' + t);
              _$jscoverage['/kison/utils.js'].lineData[77]++;
              start = 0;
            }
            _$jscoverage['/kison/utils.js'].lineData[79]++;
            ret.push('}');
            _$jscoverage['/kison/utils.js'].lineData[80]++;
            return ret.join('\n');
          } else {
            _$jscoverage['/kison/utils.js'].lineData[82]++;
            return obj + '';
          }
        }
      }
    }
  }
}};
});
