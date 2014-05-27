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
  _$jscoverage['/io/jsonp.js'].lineData[10] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[14] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[17] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[18] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[21] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[24] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[25] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[33] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[36] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[39] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[40] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[43] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[47] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[48] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[49] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[50] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[51] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[54] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[57] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[61] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[62] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[70] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[71] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[73] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[75] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[78] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[80] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[81] = 0;
  _$jscoverage['/io/jsonp.js'].lineData[84] = 0;
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
  _$jscoverage['/io/jsonp.js'].branchData['21'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['28'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['39'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['49'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['54'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['62'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/io/jsonp.js'].branchData['71'] = [];
  _$jscoverage['/io/jsonp.js'].branchData['71'][1] = new BranchData();
}
_$jscoverage['/io/jsonp.js'].branchData['71'][1].init(22, 9, '!response');
function visit73_71_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['62'][1].init(1554, 23, 'converters.script || {}');
function visit72_62_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['54'][1].init(266, 8, 'response');
function visit71_54_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['49'][1].init(72, 22, 'previous === undefined');
function visit70_49_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['39'][1].init(122, 20, 'arguments.length > 1');
function visit69_39_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['28'][1].init(126, 36, 'typeof cJsonpCallback === \'function\'');
function visit68_28_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].branchData['21'][1].init(102, 23, 'dataType[0] === \'jsonp\'');
function visit67_21_1(result) {
  _$jscoverage['/io/jsonp.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/jsonp.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/jsonp.js'].functionData[0]++;
  _$jscoverage['/io/jsonp.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/io/jsonp.js'].lineData[8]++;
  var IO = require('./base');
  _$jscoverage['/io/jsonp.js'].lineData[9]++;
  var win = S.Env.host;
  _$jscoverage['/io/jsonp.js'].lineData[10]++;
  IO.setupConfig({
  jsonp: 'callback', 
  jsonpCallback: function() {
  _$jscoverage['/io/jsonp.js'].functionData[1]++;
  _$jscoverage['/io/jsonp.js'].lineData[14]++;
  return util.guid('jsonp');
}});
  _$jscoverage['/io/jsonp.js'].lineData[17]++;
  IO.on('start', function(e) {
  _$jscoverage['/io/jsonp.js'].functionData[2]++;
  _$jscoverage['/io/jsonp.js'].lineData[18]++;
  var io = e.io, c = io.config, dataType = c.dataType;
  _$jscoverage['/io/jsonp.js'].lineData[21]++;
  if (visit67_21_1(dataType[0] === 'jsonp')) {
    _$jscoverage['/io/jsonp.js'].lineData[24]++;
    delete c.contentType;
    _$jscoverage['/io/jsonp.js'].lineData[25]++;
    var response, cJsonpCallback = c.jsonpCallback, converters, jsonpCallback = visit68_28_1(typeof cJsonpCallback === 'function') ? cJsonpCallback() : cJsonpCallback, previous = win[jsonpCallback];
    _$jscoverage['/io/jsonp.js'].lineData[33]++;
    c.uri.query.set(c.jsonp, jsonpCallback);
    _$jscoverage['/io/jsonp.js'].lineData[36]++;
    win[jsonpCallback] = function(r) {
  _$jscoverage['/io/jsonp.js'].functionData[3]++;
  _$jscoverage['/io/jsonp.js'].lineData[39]++;
  if (visit69_39_1(arguments.length > 1)) {
    _$jscoverage['/io/jsonp.js'].lineData[40]++;
    r = util.makeArray(arguments);
  }
  _$jscoverage['/io/jsonp.js'].lineData[43]++;
  response = [r];
};
    _$jscoverage['/io/jsonp.js'].lineData[47]++;
    io.fin(function() {
  _$jscoverage['/io/jsonp.js'].functionData[4]++;
  _$jscoverage['/io/jsonp.js'].lineData[48]++;
  win[jsonpCallback] = previous;
  _$jscoverage['/io/jsonp.js'].lineData[49]++;
  if (visit70_49_1(previous === undefined)) {
    _$jscoverage['/io/jsonp.js'].lineData[50]++;
    try {
      _$jscoverage['/io/jsonp.js'].lineData[51]++;
      delete win[jsonpCallback];
    }    catch (e) {
}
  } else {
    _$jscoverage['/io/jsonp.js'].lineData[54]++;
    if (visit71_54_1(response)) {
      _$jscoverage['/io/jsonp.js'].lineData[57]++;
      previous(response[0]);
    }
  }
});
    _$jscoverage['/io/jsonp.js'].lineData[61]++;
    converters = c.converters;
    _$jscoverage['/io/jsonp.js'].lineData[62]++;
    converters.script = visit72_62_1(converters.script || {});
    _$jscoverage['/io/jsonp.js'].lineData[70]++;
    converters.script.json = function() {
  _$jscoverage['/io/jsonp.js'].functionData[5]++;
  _$jscoverage['/io/jsonp.js'].lineData[71]++;
  if (visit73_71_1(!response)) {
    _$jscoverage['/io/jsonp.js'].lineData[73]++;
    throw new Error('not call jsonpCallback: ' + jsonpCallback);
  }
  _$jscoverage['/io/jsonp.js'].lineData[75]++;
  return response[0];
};
    _$jscoverage['/io/jsonp.js'].lineData[78]++;
    dataType.length = 2;
    _$jscoverage['/io/jsonp.js'].lineData[80]++;
    dataType[0] = 'script';
    _$jscoverage['/io/jsonp.js'].lineData[81]++;
    dataType[1] = 'json';
  }
});
  _$jscoverage['/io/jsonp.js'].lineData[84]++;
  return IO;
});
