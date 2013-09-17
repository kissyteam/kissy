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
  _$jscoverage['/kison/utils.js'].lineData[6] = 0;
  _$jscoverage['/kison/utils.js'].lineData[7] = 0;
  _$jscoverage['/kison/utils.js'].lineData[14] = 0;
  _$jscoverage['/kison/utils.js'].lineData[16] = 0;
  _$jscoverage['/kison/utils.js'].lineData[17] = 0;
  _$jscoverage['/kison/utils.js'].lineData[18] = 0;
  _$jscoverage['/kison/utils.js'].lineData[20] = 0;
  _$jscoverage['/kison/utils.js'].lineData[22] = 0;
  _$jscoverage['/kison/utils.js'].lineData[30] = 0;
  _$jscoverage['/kison/utils.js'].lineData[32] = 0;
  _$jscoverage['/kison/utils.js'].lineData[35] = 0;
  _$jscoverage['/kison/utils.js'].lineData[38] = 0;
  _$jscoverage['/kison/utils.js'].lineData[39] = 0;
  _$jscoverage['/kison/utils.js'].lineData[42] = 0;
  _$jscoverage['/kison/utils.js'].lineData[44] = 0;
  _$jscoverage['/kison/utils.js'].lineData[45] = 0;
  _$jscoverage['/kison/utils.js'].lineData[46] = 0;
  _$jscoverage['/kison/utils.js'].lineData[47] = 0;
  _$jscoverage['/kison/utils.js'].lineData[48] = 0;
  _$jscoverage['/kison/utils.js'].lineData[49] = 0;
  _$jscoverage['/kison/utils.js'].lineData[54] = 0;
  _$jscoverage['/kison/utils.js'].lineData[55] = 0;
  _$jscoverage['/kison/utils.js'].lineData[56] = 0;
  _$jscoverage['/kison/utils.js'].lineData[57] = 0;
  _$jscoverage['/kison/utils.js'].lineData[58] = 0;
  _$jscoverage['/kison/utils.js'].lineData[59] = 0;
  _$jscoverage['/kison/utils.js'].lineData[60] = 0;
  _$jscoverage['/kison/utils.js'].lineData[63] = 0;
  _$jscoverage['/kison/utils.js'].lineData[64] = 0;
  _$jscoverage['/kison/utils.js'].lineData[65] = 0;
  _$jscoverage['/kison/utils.js'].lineData[66] = 0;
  _$jscoverage['/kison/utils.js'].lineData[67] = 0;
  _$jscoverage['/kison/utils.js'].lineData[68] = 0;
  _$jscoverage['/kison/utils.js'].lineData[69] = 0;
  _$jscoverage['/kison/utils.js'].lineData[70] = 0;
  _$jscoverage['/kison/utils.js'].lineData[71] = 0;
  _$jscoverage['/kison/utils.js'].lineData[72] = 0;
  _$jscoverage['/kison/utils.js'].lineData[74] = 0;
  _$jscoverage['/kison/utils.js'].lineData[75] = 0;
  _$jscoverage['/kison/utils.js'].lineData[76] = 0;
  _$jscoverage['/kison/utils.js'].lineData[78] = 0;
  _$jscoverage['/kison/utils.js'].lineData[79] = 0;
  _$jscoverage['/kison/utils.js'].lineData[80] = 0;
  _$jscoverage['/kison/utils.js'].lineData[82] = 0;
  _$jscoverage['/kison/utils.js'].lineData[83] = 0;
  _$jscoverage['/kison/utils.js'].lineData[85] = 0;
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
  _$jscoverage['/kison/utils.js'].branchData['17'] = [];
  _$jscoverage['/kison/utils.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['32'] = [];
  _$jscoverage['/kison/utils.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['33'] = [];
  _$jscoverage['/kison/utils.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['34'] = [];
  _$jscoverage['/kison/utils.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['38'] = [];
  _$jscoverage['/kison/utils.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['44'] = [];
  _$jscoverage['/kison/utils.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['46'] = [];
  _$jscoverage['/kison/utils.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['48'] = [];
  _$jscoverage['/kison/utils.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['54'] = [];
  _$jscoverage['/kison/utils.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['59'] = [];
  _$jscoverage['/kison/utils.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['66'] = [];
  _$jscoverage['/kison/utils.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['71'] = [];
  _$jscoverage['/kison/utils.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['71'][2] = new BranchData();
  _$jscoverage['/kison/utils.js'].branchData['75'] = [];
  _$jscoverage['/kison/utils.js'].branchData['75'][1] = new BranchData();
}
_$jscoverage['/kison/utils.js'].branchData['75'][1].init(270, 11, 't === false');
function visit141_75_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['71'][2].init(77, 45, 'S.isRegExp(excludeReg) && i.match(excludeReg)');
function visit140_71_2(result) {
  _$jscoverage['/kison/utils.js'].branchData['71'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['71'][1].init(63, 59, 'excludeReg && S.isRegExp(excludeReg) && i.match(excludeReg)');
function visit139_71_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['66'][1].init(1231, 15, 'S.isObject(obj)');
function visit138_66_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['59'][1].init(87, 11, 't !== false');
function visit137_59_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['54'][1].init(785, 14, 'S.isArray(obj)');
function visit136_54_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['48'][1].init(524, 15, 'S.isRegExp(obj)');
function visit135_48_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['46'][1].init(440, 21, 'typeof obj === \'number\'');
function visit134_46_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['44'][1].init(334, 22, 'typeof obj == \'string\'');
function visit133_44_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['38'][1].init(226, 15, 'r !== undefined');
function visit132_38_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['34'][1].init(54, 30, '(r = excludeReg(obj)) === false');
function visit131_34_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['33'][2].init(74, 32, 'typeof excludeReg === \'function\'');
function visit130_33_2(result) {
  _$jscoverage['/kison/utils.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['33'][1].init(31, 85, '(typeof excludeReg === \'function\') && (r = excludeReg(obj)) === false');
function visit129_33_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['32'][1].init(40, 117, 'excludeReg && (typeof excludeReg === \'function\') && (r = excludeReg(obj)) === false');
function visit128_32_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].branchData['17'][1].init(52, 12, 'quote == \'"\'');
function visit127_17_1(result) {
  _$jscoverage['/kison/utils.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/utils.js'].lineData[6]++;
KISSY.add("kison/utils", function(S) {
  _$jscoverage['/kison/utils.js'].functionData[0]++;
  _$jscoverage['/kison/utils.js'].lineData[7]++;
  var doubleReg = /"/g, single = /'/g, escapeString;
  _$jscoverage['/kison/utils.js'].lineData[14]++;
  return {
  escapeString: escapeString = function(str, quote) {
  _$jscoverage['/kison/utils.js'].functionData[1]++;
  _$jscoverage['/kison/utils.js'].lineData[16]++;
  var regexp = single;
  _$jscoverage['/kison/utils.js'].lineData[17]++;
  if (visit127_17_1(quote == '"')) {
    _$jscoverage['/kison/utils.js'].lineData[18]++;
    regexp = doubleReg;
  } else {
    _$jscoverage['/kison/utils.js'].lineData[20]++;
    quote = "'";
  }
  _$jscoverage['/kison/utils.js'].lineData[22]++;
  return str.replace(/\\/g, '\\\\').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(regexp, '\\' + quote);
}, 
  serializeObject: function serializeObject(obj, excludeReg) {
  _$jscoverage['/kison/utils.js'].functionData[2]++;
  _$jscoverage['/kison/utils.js'].lineData[30]++;
  var r;
  _$jscoverage['/kison/utils.js'].lineData[32]++;
  if (visit128_32_1(excludeReg && visit129_33_1((visit130_33_2(typeof excludeReg === 'function')) && visit131_34_1((r = excludeReg(obj)) === false)))) {
    _$jscoverage['/kison/utils.js'].lineData[35]++;
    return false;
  }
  _$jscoverage['/kison/utils.js'].lineData[38]++;
  if (visit132_38_1(r !== undefined)) {
    _$jscoverage['/kison/utils.js'].lineData[39]++;
    obj = r;
  }
  _$jscoverage['/kison/utils.js'].lineData[42]++;
  var ret = [];
  _$jscoverage['/kison/utils.js'].lineData[44]++;
  if (visit133_44_1(typeof obj == 'string')) {
    _$jscoverage['/kison/utils.js'].lineData[45]++;
    return "'" + escapeString(obj) + "'";
  } else {
    _$jscoverage['/kison/utils.js'].lineData[46]++;
    if (visit134_46_1(typeof obj === 'number')) {
      _$jscoverage['/kison/utils.js'].lineData[47]++;
      return obj + "";
    } else {
      _$jscoverage['/kison/utils.js'].lineData[48]++;
      if (visit135_48_1(S.isRegExp(obj))) {
        _$jscoverage['/kison/utils.js'].lineData[49]++;
        return '/' + obj.source + '/' + (obj.global ? 'g' : '') + (obj.ignoreCase ? 'i' : '') + (obj.multiline ? 'm' : '');
      } else {
        _$jscoverage['/kison/utils.js'].lineData[54]++;
        if (visit136_54_1(S.isArray(obj))) {
          _$jscoverage['/kison/utils.js'].lineData[55]++;
          ret.push('[');
          _$jscoverage['/kison/utils.js'].lineData[56]++;
          var sub = [];
          _$jscoverage['/kison/utils.js'].lineData[57]++;
          S.each(obj, function(v) {
  _$jscoverage['/kison/utils.js'].functionData[3]++;
  _$jscoverage['/kison/utils.js'].lineData[58]++;
  var t = serializeObject(v, excludeReg);
  _$jscoverage['/kison/utils.js'].lineData[59]++;
  if (visit137_59_1(t !== false)) {
    _$jscoverage['/kison/utils.js'].lineData[60]++;
    sub.push(t);
  }
});
          _$jscoverage['/kison/utils.js'].lineData[63]++;
          ret.push(sub.join(', '));
          _$jscoverage['/kison/utils.js'].lineData[64]++;
          ret.push(']');
          _$jscoverage['/kison/utils.js'].lineData[65]++;
          return ret.join("");
        } else {
          _$jscoverage['/kison/utils.js'].lineData[66]++;
          if (visit138_66_1(S.isObject(obj))) {
            _$jscoverage['/kison/utils.js'].lineData[67]++;
            ret = ['{'];
            _$jscoverage['/kison/utils.js'].lineData[68]++;
            var start = 1;
            _$jscoverage['/kison/utils.js'].lineData[69]++;
            for (var i in obj) {
              _$jscoverage['/kison/utils.js'].lineData[70]++;
              var v = obj[i];
              _$jscoverage['/kison/utils.js'].lineData[71]++;
              if (visit139_71_1(excludeReg && visit140_71_2(S.isRegExp(excludeReg) && i.match(excludeReg)))) {
                _$jscoverage['/kison/utils.js'].lineData[72]++;
                continue;
              }
              _$jscoverage['/kison/utils.js'].lineData[74]++;
              var t = serializeObject(v, excludeReg);
              _$jscoverage['/kison/utils.js'].lineData[75]++;
              if (visit141_75_1(t === false)) {
                _$jscoverage['/kison/utils.js'].lineData[76]++;
                continue;
              }
              _$jscoverage['/kison/utils.js'].lineData[78]++;
              var key = "'" + escapeString(i) + "'";
              _$jscoverage['/kison/utils.js'].lineData[79]++;
              ret.push((start ? '' : ',') + key + ': ' + t);
              _$jscoverage['/kison/utils.js'].lineData[80]++;
              start = 0;
            }
            _$jscoverage['/kison/utils.js'].lineData[82]++;
            ret.push('}');
            _$jscoverage['/kison/utils.js'].lineData[83]++;
            return ret.join('\n');
          } else {
            _$jscoverage['/kison/utils.js'].lineData[85]++;
            return obj + '';
          }
        }
      }
    }
  }
}};
});
