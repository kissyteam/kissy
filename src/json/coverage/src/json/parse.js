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
if (! _$jscoverage['/json/parse.js']) {
  _$jscoverage['/json/parse.js'] = {};
  _$jscoverage['/json/parse.js'].lineData = [];
  _$jscoverage['/json/parse.js'].lineData[6] = 0;
  _$jscoverage['/json/parse.js'].lineData[7] = 0;
  _$jscoverage['/json/parse.js'].lineData[9] = 0;
  _$jscoverage['/json/parse.js'].lineData[13] = 0;
  _$jscoverage['/json/parse.js'].lineData[14] = 0;
  _$jscoverage['/json/parse.js'].lineData[17] = 0;
  _$jscoverage['/json/parse.js'].lineData[18] = 0;
  _$jscoverage['/json/parse.js'].lineData[19] = 0;
  _$jscoverage['/json/parse.js'].lineData[20] = 0;
  _$jscoverage['/json/parse.js'].lineData[21] = 0;
  _$jscoverage['/json/parse.js'].lineData[22] = 0;
  _$jscoverage['/json/parse.js'].lineData[23] = 0;
  _$jscoverage['/json/parse.js'].lineData[24] = 0;
  _$jscoverage['/json/parse.js'].lineData[25] = 0;
  _$jscoverage['/json/parse.js'].lineData[28] = 0;
  _$jscoverage['/json/parse.js'].lineData[30] = 0;
  _$jscoverage['/json/parse.js'].lineData[31] = 0;
  _$jscoverage['/json/parse.js'].lineData[32] = 0;
  _$jscoverage['/json/parse.js'].lineData[33] = 0;
  _$jscoverage['/json/parse.js'].lineData[34] = 0;
  _$jscoverage['/json/parse.js'].lineData[35] = 0;
  _$jscoverage['/json/parse.js'].lineData[37] = 0;
  _$jscoverage['/json/parse.js'].lineData[43] = 0;
  _$jscoverage['/json/parse.js'].lineData[46] = 0;
  _$jscoverage['/json/parse.js'].lineData[47] = 0;
  _$jscoverage['/json/parse.js'].lineData[48] = 0;
  _$jscoverage['/json/parse.js'].lineData[49] = 0;
  _$jscoverage['/json/parse.js'].lineData[53] = 0;
}
if (! _$jscoverage['/json/parse.js'].functionData) {
  _$jscoverage['/json/parse.js'].functionData = [];
  _$jscoverage['/json/parse.js'].functionData[0] = 0;
  _$jscoverage['/json/parse.js'].functionData[1] = 0;
  _$jscoverage['/json/parse.js'].functionData[2] = 0;
}
if (! _$jscoverage['/json/parse.js'].branchData) {
  _$jscoverage['/json/parse.js'].branchData = {};
  _$jscoverage['/json/parse.js'].branchData['17'] = [];
  _$jscoverage['/json/parse.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/json/parse.js'].branchData['18'] = [];
  _$jscoverage['/json/parse.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/json/parse.js'].branchData['22'] = [];
  _$jscoverage['/json/parse.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/json/parse.js'].branchData['24'] = [];
  _$jscoverage['/json/parse.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/json/parse.js'].branchData['31'] = [];
  _$jscoverage['/json/parse.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/json/parse.js'].branchData['34'] = [];
  _$jscoverage['/json/parse.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/json/parse.js'].branchData['48'] = [];
  _$jscoverage['/json/parse.js'].branchData['48'][1] = new BranchData();
}
_$jscoverage['/json/parse.js'].branchData['48'][1].init(59, 7, 'reviver');
function visit7_48_1(result) {
  _$jscoverage['/json/parse.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parse.js'].branchData['34'][1].init(118, 24, 'newElement === undefined');
function visit6_34_1(result) {
  _$jscoverage['/json/parse.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parse.js'].branchData['31'][1].init(88, 7, 'i < len');
function visit5_31_1(result) {
  _$jscoverage['/json/parse.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parse.js'].branchData['24'][1].init(89, 24, 'newElement !== undefined');
function visit4_24_1(result) {
  _$jscoverage['/json/parse.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parse.js'].branchData['22'][1].init(114, 7, 'i < len');
function visit3_22_1(result) {
  _$jscoverage['/json/parse.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parse.js'].branchData['18'][1].init(17, 14, 'S.isArray(val)');
function visit2_18_1(result) {
  _$jscoverage['/json/parse.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parse.js'].branchData['17'][1].init(78, 23, 'typeof val === \'object\'');
function visit1_17_1(result) {
  _$jscoverage['/json/parse.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parse.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/json/parse.js'].functionData[0]++;
  _$jscoverage['/json/parse.js'].lineData[7]++;
  var parser = require('./parser'), Quote = require('./quote');
  _$jscoverage['/json/parse.js'].lineData[9]++;
  parser.yy = {
  unQuote: Quote.unQuote};
  _$jscoverage['/json/parse.js'].lineData[13]++;
  function walk(holder, name, reviver) {
    _$jscoverage['/json/parse.js'].functionData[1]++;
    _$jscoverage['/json/parse.js'].lineData[14]++;
    var val = holder[name], i, len, newElement;
    _$jscoverage['/json/parse.js'].lineData[17]++;
    if (visit1_17_1(typeof val === 'object')) {
      _$jscoverage['/json/parse.js'].lineData[18]++;
      if (visit2_18_1(S.isArray(val))) {
        _$jscoverage['/json/parse.js'].lineData[19]++;
        i = 0;
        _$jscoverage['/json/parse.js'].lineData[20]++;
        len = val.length;
        _$jscoverage['/json/parse.js'].lineData[21]++;
        var newVal = [];
        _$jscoverage['/json/parse.js'].lineData[22]++;
        while (visit3_22_1(i < len)) {
          _$jscoverage['/json/parse.js'].lineData[23]++;
          newElement = walk(val, String(i), reviver);
          _$jscoverage['/json/parse.js'].lineData[24]++;
          if (visit4_24_1(newElement !== undefined)) {
            _$jscoverage['/json/parse.js'].lineData[25]++;
            newVal[newVal.length] = newElement;
          }
        }
        _$jscoverage['/json/parse.js'].lineData[28]++;
        val = newVal;
      } else {
        _$jscoverage['/json/parse.js'].lineData[30]++;
        var keys = S.keys(val);
        _$jscoverage['/json/parse.js'].lineData[31]++;
        for (i = 0 , len = keys.length; visit5_31_1(i < len); i++) {
          _$jscoverage['/json/parse.js'].lineData[32]++;
          var p = keys[i];
          _$jscoverage['/json/parse.js'].lineData[33]++;
          newElement = walk(val, p, reviver);
          _$jscoverage['/json/parse.js'].lineData[34]++;
          if (visit6_34_1(newElement === undefined)) {
            _$jscoverage['/json/parse.js'].lineData[35]++;
            delete val[p];
          } else {
            _$jscoverage['/json/parse.js'].lineData[37]++;
            val[p] = newElement;
          }
        }
      }
    }
    _$jscoverage['/json/parse.js'].lineData[43]++;
    return reviver.call(holder, name, val);
  }
  _$jscoverage['/json/parse.js'].lineData[46]++;
  return function(str, reviver) {
  _$jscoverage['/json/parse.js'].functionData[2]++;
  _$jscoverage['/json/parse.js'].lineData[47]++;
  var root = parser.parse(String(str));
  _$jscoverage['/json/parse.js'].lineData[48]++;
  if (visit7_48_1(reviver)) {
    _$jscoverage['/json/parse.js'].lineData[49]++;
    return walk({
  '': root}, '', reviver);
  } else {
    _$jscoverage['/json/parse.js'].lineData[53]++;
    return root;
  }
};
});
