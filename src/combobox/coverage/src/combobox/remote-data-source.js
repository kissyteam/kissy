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
  _$jscoverage['/combobox/remote-data-source.js'].lineData[12] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[20] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[26] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[27] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[29] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[30] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[32] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[33] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[35] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[36] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[37] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[40] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[41] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[42] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[43] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[44] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[45] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[47] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[48] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[49] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[51] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[53] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[54] = 0;
}
if (! _$jscoverage['/combobox/remote-data-source.js'].functionData) {
  _$jscoverage['/combobox/remote-data-source.js'].functionData = [];
  _$jscoverage['/combobox/remote-data-source.js'].functionData[0] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].functionData[1] = 0;
  _$jscoverage['/combobox/remote-data-source.js'].functionData[2] = 0;
}
if (! _$jscoverage['/combobox/remote-data-source.js'].branchData) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData = {};
  _$jscoverage['/combobox/remote-data-source.js'].branchData['26'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['27'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['32'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['32'][2] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['35'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['36'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['41'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['44'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/combobox/remote-data-source.js'].branchData['48'] = [];
  _$jscoverage['/combobox/remote-data-source.js'].branchData['48'][1] = new BranchData();
}
_$jscoverage['/combobox/remote-data-source.js'].branchData['48'][1].init(171, 5, 'cache');
function visit115_48_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['44'][1].init(22, 5, 'parse');
function visit114_44_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['41'][1].init(802, 17, 'xhrCfg.data || {}');
function visit113_41_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['36'][1].init(22, 25, 'v = self.caches[inputVal]');
function visit112_36_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['35'][1].init(581, 5, 'cache');
function visit111_35_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['32'][2].init(474, 19, 'allowEmpty !== true');
function visit110_32_2(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['32'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['32'][1].init(461, 32, '!inputVal && allowEmpty !== true');
function visit109_32_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['27'][1].init(308, 7, 'self.io');
function visit108_27_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].branchData['26'][1].init(272, 17, 'self.caches || {}');
function visit107_26_1(result) {
  _$jscoverage['/combobox/remote-data-source.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/remote-data-source.js'].lineData[6]++;
KISSY.add("combobox/remote-data-source", function(S, IO, Base, undefined) {
  _$jscoverage['/combobox/remote-data-source.js'].functionData[0]++;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[12]++;
  return Base.extend({
  fetchData: function(inputVal, callback, context) {
  _$jscoverage['/combobox/remote-data-source.js'].functionData[1]++;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[20]++;
  var self = this, v, paramName = self.get("paramName"), parse = self.get("parse"), cache = self.get("cache"), allowEmpty = self.get("allowEmpty");
  _$jscoverage['/combobox/remote-data-source.js'].lineData[26]++;
  self.caches = visit107_26_1(self.caches || {});
  _$jscoverage['/combobox/remote-data-source.js'].lineData[27]++;
  if (visit108_27_1(self.io)) {
    _$jscoverage['/combobox/remote-data-source.js'].lineData[29]++;
    self.io.abort();
    _$jscoverage['/combobox/remote-data-source.js'].lineData[30]++;
    self.io = null;
  }
  _$jscoverage['/combobox/remote-data-source.js'].lineData[32]++;
  if (visit109_32_1(!inputVal && visit110_32_2(allowEmpty !== true))) {
    _$jscoverage['/combobox/remote-data-source.js'].lineData[33]++;
    return callback.call(context, []);
  }
  _$jscoverage['/combobox/remote-data-source.js'].lineData[35]++;
  if (visit111_35_1(cache)) {
    _$jscoverage['/combobox/remote-data-source.js'].lineData[36]++;
    if (visit112_36_1(v = self.caches[inputVal])) {
      _$jscoverage['/combobox/remote-data-source.js'].lineData[37]++;
      return callback.call(context, v);
    }
  }
  _$jscoverage['/combobox/remote-data-source.js'].lineData[40]++;
  var xhrCfg = self.get("xhrCfg");
  _$jscoverage['/combobox/remote-data-source.js'].lineData[41]++;
  xhrCfg.data = visit113_41_1(xhrCfg.data || {});
  _$jscoverage['/combobox/remote-data-source.js'].lineData[42]++;
  xhrCfg.data[paramName] = inputVal;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[43]++;
  xhrCfg.success = function(data) {
  _$jscoverage['/combobox/remote-data-source.js'].functionData[2]++;
  _$jscoverage['/combobox/remote-data-source.js'].lineData[44]++;
  if (visit114_44_1(parse)) {
    _$jscoverage['/combobox/remote-data-source.js'].lineData[45]++;
    data = parse(inputVal, data);
  }
  _$jscoverage['/combobox/remote-data-source.js'].lineData[47]++;
  self.setInternal("data", data);
  _$jscoverage['/combobox/remote-data-source.js'].lineData[48]++;
  if (visit115_48_1(cache)) {
    _$jscoverage['/combobox/remote-data-source.js'].lineData[49]++;
    self.caches[inputVal] = data;
  }
  _$jscoverage['/combobox/remote-data-source.js'].lineData[51]++;
  callback.call(context, data);
};
  _$jscoverage['/combobox/remote-data-source.js'].lineData[53]++;
  self.io = IO(xhrCfg);
  _$jscoverage['/combobox/remote-data-source.js'].lineData[54]++;
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
}, {
  requires: ['io', 'base']});
