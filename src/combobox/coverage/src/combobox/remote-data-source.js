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
if (! _$jscoverage['/combobox/remote-data-source.js']) {
  _$jscoverage['/combobox/remote-data-source.js'] = {};
  _$jscoverage['/combobox/remote-data-source.js'].lineData = [];
  _$jscoverage['/combobox/remote-data-source.js'].lineData[6] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[7] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[8] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[9] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[15] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[23] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[29] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[30] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[32] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[33] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[35] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[36] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[38] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[39] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[40] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[43] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[44] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[45] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[46] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[47] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[48] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[50] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[51] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[52] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[54] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[56] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[57] = 0;
}
if (! _$jscoverage['/combobox/remote-data-source.js'].functionData) {
  _$jscoverage['/combobox/remote-data-source.js'].functionData = [];
  _$jscoverage['/combobox/remote-data-source.js'].functionData[0] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].functionData[1] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].functionData[2] = 0;
}
if (! _$jscoverage['/combobox/remote-data-source.js'].branchData) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData = {};
  _$jscoverage['/combobox/remote-data-source.js'].branchData['29'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['30'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['35'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['35'][2] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['38'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['39'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['44'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['47'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['51'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['51'][1] = new BranchData();
}
_$jscoverage['/combobox/remote-data-source.js'].branchData['51'][1].init(166, 5, 'cache');
function visit117_51_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['47'][1].init(21, 5, 'parse');
function visit116_47_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['44'][1].init(780, 17, 'xhrCfg.data || {}');
function visit115_44_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['39'][1].init(21, 25, 'v = self.caches[inputVal]');
function visit114_39_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['38'][1].init(565, 5, 'cache');
function visit113_38_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['35'][2].init(461, 19, 'allowEmpty !== true');
function visit112_35_2(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['35'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['35'][1].init(448, 32, '!inputVal && allowEmpty !== true');
function visit111_35_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['30'][1].init(300, 7, 'self.io');
function visit110_30_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['29'][1].init(265, 17, 'self.caches || {}');
function visit109_29_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/combobox/remote-data-source.js'].functionData[0]++;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[7]++;
  var undefined = undefined;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[8]++;
  var IO = require('io');
  _$jscoverage['/combobox/remote-data-source.js'].lineData[9]++;
  var Attribute = require('attribute');
  _$jscoverage['/combobox/remote-data-source.js'].lineData[15]++;
  return Attribute.extend({
  fetchData: function(inputVal, callback, context) {
  _$jscoverage['/combobox/remote-data-source.js'].functionData[1]++;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[23]++;
  var self = this, v, paramName = self.get("paramName"), parse = self.get("parse"), cache = self.get("cache"), allowEmpty = self.get("allowEmpty");
  _$jscoverage['/combobox/remote-data-source.js'].lineData[29]++;
  self.caches = visit109_29_1(self.caches || {});
  _$jscoverage['/combobox/remote-data-source.js'].lineData[30]++;
  if (visit110_30_1(self.io)) {
    _$jscoverage['/combobox/remote-data-source.js'].lineData[32]++;
    self.io.abort();
    _$jscoverage['/combobox/remote-data-source.js'].lineData[33]++;
    self.io = null;
  }
  _$jscoverage['/combobox/remote-data-source.js'].lineData[35]++;
  if (visit111_35_1(!inputVal && visit112_35_2(allowEmpty !== true))) {
    _$jscoverage['/combobox/remote-data-source.js'].lineData[36]++;
    return callback.call(context, []);
  }
  _$jscoverage['/combobox/remote-data-source.js'].lineData[38]++;
  if (visit113_38_1(cache)) {
    _$jscoverage['/combobox/remote-data-source.js'].lineData[39]++;
    if (visit114_39_1(v = self.caches[inputVal])) {
      _$jscoverage['/combobox/remote-data-source.js'].lineData[40]++;
      return callback.call(context, v);
    }
  }
  _$jscoverage['/combobox/remote-data-source.js'].lineData[43]++;
  var xhrCfg = self.get("xhrCfg");
  _$jscoverage['/combobox/remote-data-source.js'].lineData[44]++;
  xhrCfg.data = visit115_44_1(xhrCfg.data || {});
  _$jscoverage['/combobox/remote-data-source.js'].lineData[45]++;
  xhrCfg.data[paramName] = inputVal;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[46]++;
  xhrCfg.success = function(data) {
  _$jscoverage['/combobox/remote-data-source.js'].functionData[2]++;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[47]++;
  if (visit116_47_1(parse)) {
    _$jscoverage['/combobox/remote-data-source.js'].lineData[48]++;
    data = parse(inputVal, data);
  }
  _$jscoverage['/combobox/remote-data-source.js'].lineData[50]++;
  self.setInternal("data", data);
  _$jscoverage['/combobox/remote-data-source.js'].lineData[51]++;
  if (visit117_51_1(cache)) {
    _$jscoverage['/combobox/remote-data-source.js'].lineData[52]++;
    self.caches[inputVal] = data;
  }
  _$jscoverage['/combobox/remote-data-source.js'].lineData[54]++;
  callback.call(context, data);
};
  _$jscoverage['/combobox/remote-data-source.js'].lineData[56]++;
  self.io = IO(xhrCfg);
  _$jscoverage['/combobox/remote-data-source.js'].lineData[57]++;
  return undefined;
}}, {
  ATTRS: {
  paramName: {
  value: 'q'}, 
  allowEmpty: {}, 
  cache: {}, 
  parse: {}, 
  xhrCfg: {
  value: {}}}});
});
