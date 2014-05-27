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
if (! _$jscoverage['/io/jsonp.js']) {
  _$jscoverage['/io/jsonp.js'] = {};
  _$jscoverage['/io/jsonp.js'].lineData = [];
  _$jscoverage['/io/jsonp.js'].lineData[6] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[7] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[8] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[9] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[13] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[16] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[17] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[20] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[23] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[24] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[32] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[35] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[38] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[39] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[42] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[46] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[47] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[48] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[49] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[50] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[53] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[56] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[60] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[61] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[69] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[70] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[71] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[73] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[76] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[78] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[79] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[82] = 0;
}
if (! _$jscoverage['/io/jsonp.js'].functionData) {
  _$jscoverage['/io/jsonp.js'].functionData = [];
  _$jscoverage['/io/jsonp.js'].functionData[0] = 0;
  _$jscoverage['/io/jsonp.js'].functionData[1] = 0;
  _$jscoverage['/io/jsonp.js'].functionData[2] = 0;
  _$jscoverage['/io/jsonp.js'].functionData[3] = 0;
  _$jscoverage['/io/jsonp.js'].functionData[4] = 0;
  _$jscoverage['/io/jsonp.js'].functionData[5] = 0;
}
if (! _$jscoverage['/io/jsonp.js'].branchData) {
  _$jscoverage['/io/jsonp.js'].branchData = {};
  _$jscoverage['/io/jsonp.js'].branchData['20'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['27'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['38'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['48'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['53'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['61'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['70'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['70'][1] = new BranchData();
}
_$jscoverage['/io/jsonp.js'].branchData['70'][1].init(21, 9, '!response');
function visit72_70_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['61'][1].init(1510, 23, 'converters.script || {}');
function visit71_61_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['53'][1].init(259, 8, 'response');
function visit70_53_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['48'][1].init(70, 22, 'previous === undefined');
function visit69_48_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['38'][1].init(119, 20, 'arguments.length > 1');
function visit68_38_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['27'][1].init(123, 36, 'typeof cJsonpCallback === \'function\'');
function visit67_27_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['20'][1].init(98, 23, 'dataType[0] === \'jsonp\'');
function visit66_20_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/jsonp.js'].functionData[0]++;
  _$jscoverage['/io/jsonp.js'].lineData[7]++;
  var IO = require('./base');
  _$jscoverage['/io/jsonp.js'].lineData[8]++;
  var win = S.Env.host;
  _$jscoverage['/io/jsonp.js'].lineData[9]++;
  IO.setupConfig({
  jsonp: 'callback', 
  jsonpCallback: function() {
  _$jscoverage['/io/jsonp.js'].functionData[1]++;
  _$jscoverage['/io/jsonp.js'].lineData[13]++;
  return S.guid('jsonp');
}});
  _$jscoverage['/io/jsonp.js'].lineData[16]++;
  IO.on('start', function(e) {
  _$jscoverage['/io/jsonp.js'].functionData[2]++;
  _$jscoverage['/io/jsonp.js'].lineData[17]++;
  var io = e.io, c = io.config, dataType = c.dataType;
  _$jscoverage['/io/jsonp.js'].lineData[20]++;
  if (visit66_20_1(dataType[0] === 'jsonp')) {
    _$jscoverage['/io/jsonp.js'].lineData[23]++;
    delete c.contentType;
    _$jscoverage['/io/jsonp.js'].lineData[24]++;
    var response, cJsonpCallback = c.jsonpCallback, converters, jsonpCallback = visit67_27_1(typeof cJsonpCallback === 'function') ? cJsonpCallback() : cJsonpCallback, previous = win[jsonpCallback];
    _$jscoverage['/io/jsonp.js'].lineData[32]++;
    c.uri.query.set(c.jsonp, jsonpCallback);
    _$jscoverage['/io/jsonp.js'].lineData[35]++;
    win[jsonpCallback] = function(r) {
  _$jscoverage['/io/jsonp.js'].functionData[3]++;
  _$jscoverage['/io/jsonp.js'].lineData[38]++;
  if (visit68_38_1(arguments.length > 1)) {
    _$jscoverage['/io/jsonp.js'].lineData[39]++;
    r = S.makeArray(arguments);
  }
  _$jscoverage['/io/jsonp.js'].lineData[42]++;
  response = [r];
};
    _$jscoverage['/io/jsonp.js'].lineData[46]++;
    io.fin(function() {
  _$jscoverage['/io/jsonp.js'].functionData[4]++;
  _$jscoverage['/io/jsonp.js'].lineData[47]++;
  win[jsonpCallback] = previous;
  _$jscoverage['/io/jsonp.js'].lineData[48]++;
  if (visit69_48_1(previous === undefined)) {
    _$jscoverage['/io/jsonp.js'].lineData[49]++;
    try {
      _$jscoverage['/io/jsonp.js'].lineData[50]++;
      delete win[jsonpCallback];
    }    catch (e) {
}
  } else {
    _$jscoverage['/io/jsonp.js'].lineData[53]++;
    if (visit70_53_1(response)) {
      _$jscoverage['/io/jsonp.js'].lineData[56]++;
      previous(response[0]);
    }
  }
});
    _$jscoverage['/io/jsonp.js'].lineData[60]++;
    converters = c.converters;
    _$jscoverage['/io/jsonp.js'].lineData[61]++;
    converters.script = visit71_61_1(converters.script || {});
    _$jscoverage['/io/jsonp.js'].lineData[69]++;
    converters.script.json = function() {
  _$jscoverage['/io/jsonp.js'].functionData[5]++;
  _$jscoverage['/io/jsonp.js'].lineData[70]++;
  if (visit72_70_1(!response)) {
    _$jscoverage['/io/jsonp.js'].lineData[71]++;
    throw new Error('not call jsonpCallback: ' + jsonpCallback);
  }
  _$jscoverage['/io/jsonp.js'].lineData[73]++;
  return response[0];
};
    _$jscoverage['/io/jsonp.js'].lineData[76]++;
    dataType.length = 2;
    _$jscoverage['/io/jsonp.js'].lineData[78]++;
    dataType[0] = 'script';
    _$jscoverage['/io/jsonp.js'].lineData[79]++;
    dataType[1] = 'json';
  }
});
  _$jscoverage['/io/jsonp.js'].lineData[82]++;
  return IO;
});
