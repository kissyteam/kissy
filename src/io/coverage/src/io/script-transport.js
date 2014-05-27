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
if (! _$jscoverage['/io/script-transport.js']) {
  _$jscoverage['/io/script-transport.js'] = {};
  _$jscoverage['/io/script-transport.js'].lineData = [];
  _$jscoverage['/io/script-transport.js'].lineData[8] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[9] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[10] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[11] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[14] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[31] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[32] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[38] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[39] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[42] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[43] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[45] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[46] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[47] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[50] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[52] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[55] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[58] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[61] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[67] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[71] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[72] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[74] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[75] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[76] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[79] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[80] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[83] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[84] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[89] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[93] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[95] = 0;
}
if (! _$jscoverage['/io/script-transport.js'].functionData) {
  _$jscoverage['/io/script-transport.js'].functionData = [];
  _$jscoverage['/io/script-transport.js'].functionData[0] = 0;
  _$jscoverage['/io/script-transport.js'].functionData[1] = 0;
  _$jscoverage['/io/script-transport.js'].functionData[2] = 0;
  _$jscoverage['/io/script-transport.js'].functionData[3] = 0;
  _$jscoverage['/io/script-transport.js'].functionData[4] = 0;
  _$jscoverage['/io/script-transport.js'].functionData[5] = 0;
  _$jscoverage['/io/script-transport.js'].functionData[6] = 0;
  _$jscoverage['/io/script-transport.js'].functionData[7] = 0;
}
if (! _$jscoverage['/io/script-transport.js'].branchData) {
  _$jscoverage['/io/script-transport.js'].branchData = {};
  _$jscoverage['/io/script-transport.js'].branchData['42'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['71'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['75'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['79'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['83'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['83'][1] = new BranchData();
}
_$jscoverage['/io/script-transport.js'].branchData['83'][1].init(483, 17, 'event === \'error\'');
function visit118_83_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['79'][1].init(348, 17, 'event !== \'error\'');
function visit117_79_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['75'][1].init(248, 5, 'abort');
function visit116_75_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['71'][1].init(146, 7, '!script');
function visit115_71_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['42'][1].init(120, 19, '!config.crossDomain');
function visit114_42_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].lineData[8]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/script-transport.js'].functionData[0]++;
  _$jscoverage['/io/script-transport.js'].lineData[9]++;
  var IO = require('./base');
  _$jscoverage['/io/script-transport.js'].lineData[10]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/script-transport.js'].lineData[11]++;
  var OK_CODE = 200, ERROR_CODE = 500;
  _$jscoverage['/io/script-transport.js'].lineData[14]++;
  IO.setupConfig({
  accepts: {
  script: 'text/javascript, ' + 'application/javascript, ' + 'application/ecmascript, ' + 'application/x-ecmascript'}, 
  contents: {
  script: /javascript|ecmascript/}, 
  converters: {
  text: {
  script: function(text) {
  _$jscoverage['/io/script-transport.js'].functionData[1]++;
  _$jscoverage['/io/script-transport.js'].lineData[31]++;
  S.globalEval(text);
  _$jscoverage['/io/script-transport.js'].lineData[32]++;
  return text;
}}}});
  _$jscoverage['/io/script-transport.js'].lineData[38]++;
  function ScriptTransport(io) {
    _$jscoverage['/io/script-transport.js'].functionData[2]++;
    _$jscoverage['/io/script-transport.js'].lineData[39]++;
    var config = io.config, self = this;
    _$jscoverage['/io/script-transport.js'].lineData[42]++;
    if (visit114_42_1(!config.crossDomain)) {
      _$jscoverage['/io/script-transport.js'].lineData[43]++;
      return new (IO.getTransport('*'))(io);
    }
    _$jscoverage['/io/script-transport.js'].lineData[45]++;
    self.io = io;
    _$jscoverage['/io/script-transport.js'].lineData[46]++;
    logger.info('use ScriptTransport for: ' + config.url);
    _$jscoverage['/io/script-transport.js'].lineData[47]++;
    return self;
  }
  _$jscoverage['/io/script-transport.js'].lineData[50]++;
  S.augment(ScriptTransport, {
  send: function() {
  _$jscoverage['/io/script-transport.js'].functionData[3]++;
  _$jscoverage['/io/script-transport.js'].lineData[52]++;
  var self = this, io = self.io, c = io.config;
  _$jscoverage['/io/script-transport.js'].lineData[55]++;
  self.script = S.getScript(io._getUrlForSend(), {
  charset: c.scriptCharset, 
  success: function() {
  _$jscoverage['/io/script-transport.js'].functionData[4]++;
  _$jscoverage['/io/script-transport.js'].lineData[58]++;
  self._callback('success');
}, 
  error: function() {
  _$jscoverage['/io/script-transport.js'].functionData[5]++;
  _$jscoverage['/io/script-transport.js'].lineData[61]++;
  self._callback('error');
}});
}, 
  _callback: function(event, abort) {
  _$jscoverage['/io/script-transport.js'].functionData[6]++;
  _$jscoverage['/io/script-transport.js'].lineData[67]++;
  var self = this, script = self.script, io = self.io;
  _$jscoverage['/io/script-transport.js'].lineData[71]++;
  if (visit115_71_1(!script)) {
    _$jscoverage['/io/script-transport.js'].lineData[72]++;
    return;
  }
  _$jscoverage['/io/script-transport.js'].lineData[74]++;
  self.script = undefined;
  _$jscoverage['/io/script-transport.js'].lineData[75]++;
  if (visit116_75_1(abort)) {
    _$jscoverage['/io/script-transport.js'].lineData[76]++;
    return;
  }
  _$jscoverage['/io/script-transport.js'].lineData[79]++;
  if (visit117_79_1(event !== 'error')) {
    _$jscoverage['/io/script-transport.js'].lineData[80]++;
    io._ioReady(OK_CODE, 'success');
  } else {
    _$jscoverage['/io/script-transport.js'].lineData[83]++;
    if (visit118_83_1(event === 'error')) {
      _$jscoverage['/io/script-transport.js'].lineData[84]++;
      io._ioReady(ERROR_CODE, 'script error');
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/script-transport.js'].functionData[7]++;
  _$jscoverage['/io/script-transport.js'].lineData[89]++;
  this._callback(0, 1);
}});
  _$jscoverage['/io/script-transport.js'].lineData[93]++;
  IO.setupTransport('script', ScriptTransport);
  _$jscoverage['/io/script-transport.js'].lineData[95]++;
  return IO;
});
