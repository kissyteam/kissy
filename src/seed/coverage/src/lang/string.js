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
if (! _$jscoverage['/lang/string.js']) {
  _$jscoverage['/lang/string.js'] = {};
  _$jscoverage['/lang/string.js'].lineData = [];
  _$jscoverage['/lang/string.js'].lineData[7] = 0;
  _$jscoverage['/lang/string.js'].lineData[12] = 0;
  _$jscoverage['/lang/string.js'].lineData[15] = 0;
  _$jscoverage['/lang/string.js'].lineData[25] = 0;
  _$jscoverage['/lang/string.js'].lineData[26] = 0;
  _$jscoverage['/lang/string.js'].lineData[29] = 0;
  _$jscoverage['/lang/string.js'].lineData[30] = 0;
  _$jscoverage['/lang/string.js'].lineData[31] = 0;
  _$jscoverage['/lang/string.js'].lineData[33] = 0;
  _$jscoverage['/lang/string.js'].lineData[43] = 0;
  _$jscoverage['/lang/string.js'].lineData[44] = 0;
}
if (! _$jscoverage['/lang/string.js'].functionData) {
  _$jscoverage['/lang/string.js'].functionData = [];
  _$jscoverage['/lang/string.js'].functionData[0] = 0;
  _$jscoverage['/lang/string.js'].functionData[1] = 0;
  _$jscoverage['/lang/string.js'].functionData[2] = 0;
  _$jscoverage['/lang/string.js'].functionData[3] = 0;
}
if (! _$jscoverage['/lang/string.js'].branchData) {
  _$jscoverage['/lang/string.js'].branchData = {};
  _$jscoverage['/lang/string.js'].branchData['25'] = [];
  _$jscoverage['/lang/string.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/lang/string.js'].branchData['25'][2] = new BranchData();
  _$jscoverage['/lang/string.js'].branchData['29'] = [];
  _$jscoverage['/lang/string.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/lang/string.js'].branchData['30'] = [];
  _$jscoverage['/lang/string.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/lang/string.js'].branchData['33'] = [];
  _$jscoverage['/lang/string.js'].branchData['33'][1] = new BranchData();
}
_$jscoverage['/lang/string.js'].branchData['33'][1].init(134, 21, 'o[name] === undefined');
function visit232_33_1(result) {
  _$jscoverage['/lang/string.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/string.js'].branchData['30'][1].init(21, 24, 'match.charAt(0) === \'\\\\\'');
function visit231_30_1(result) {
  _$jscoverage['/lang/string.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/string.js'].branchData['29'][1].init(124, 24, 'regexp || SUBSTITUTE_REG');
function visit230_29_1(result) {
  _$jscoverage['/lang/string.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/string.js'].branchData['25'][2].init(17, 23, 'typeof str !== \'string\'');
function visit229_25_2(result) {
  _$jscoverage['/lang/string.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/string.js'].branchData['25'][1].init(17, 29, 'typeof str !== \'string\' || !o');
function visit228_25_1(result) {
  _$jscoverage['/lang/string.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/string.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/string.js'].functionData[0]++;
  _$jscoverage['/lang/string.js'].lineData[12]++;
  var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g, EMPTY = '';
  _$jscoverage['/lang/string.js'].lineData[15]++;
  S.mix(S, {
  substitute: function(str, o, regexp) {
  _$jscoverage['/lang/string.js'].functionData[1]++;
  _$jscoverage['/lang/string.js'].lineData[25]++;
  if (visit228_25_1(visit229_25_2(typeof str !== 'string') || !o)) {
    _$jscoverage['/lang/string.js'].lineData[26]++;
    return str;
  }
  _$jscoverage['/lang/string.js'].lineData[29]++;
  return str.replace(visit230_29_1(regexp || SUBSTITUTE_REG), function(match, name) {
  _$jscoverage['/lang/string.js'].functionData[2]++;
  _$jscoverage['/lang/string.js'].lineData[30]++;
  if (visit231_30_1(match.charAt(0) === '\\')) {
    _$jscoverage['/lang/string.js'].lineData[31]++;
    return match.slice(1);
  }
  _$jscoverage['/lang/string.js'].lineData[33]++;
  return (visit232_33_1(o[name] === undefined)) ? EMPTY : o[name];
});
}, 
  ucfirst: function(s) {
  _$jscoverage['/lang/string.js'].functionData[3]++;
  _$jscoverage['/lang/string.js'].lineData[43]++;
  s += '';
  _$jscoverage['/lang/string.js'].lineData[44]++;
  return s.charAt(0).toUpperCase() + s.substring(1);
}});
})(KISSY);
