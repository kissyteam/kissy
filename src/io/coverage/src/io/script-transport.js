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
  _$jscoverage['/io/script-transport.js'].lineData[11] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[12] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[18] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[35] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[36] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[42] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[43] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[45] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[46] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[48] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[49] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[50] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[53] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[55] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[63] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[64] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[65] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[66] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[68] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[69] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[72] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[74] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[77] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[79] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[82] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[86] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[92] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[93] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[96] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[103] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[106] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[110] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[113] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[114] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[117] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[118] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[121] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[122] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[128] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[132] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[134] = 0;
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
}
if (! _$jscoverage['/io/script-transport.js'].branchData) {
  _$jscoverage['/io/script-transport.js'].branchData = {};
  _$jscoverage['/io/script-transport.js'].branchData['45'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['59'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['60'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['68'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['77'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['79'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['92'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['97'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['98'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['99'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['100'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['106'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['117'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['121'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['121'][1] = new BranchData();
}
_$jscoverage['/io/script-transport.js'].branchData['121'][1].init(654, 16, 'event == \'error\'');
function visit127_121_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['117'][2].init(504, 16, 'event != \'error\'');
function visit126_117_2(result) {
  _$jscoverage['/io/script-transport.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['117'][1].init(494, 26, '!abort && event != \'error\'');
function visit125_117_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['106'][1].init(146, 25, 'head && script.parentNode');
function visit124_106_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['100'][1].init(64, 16, 'event == \'error\'');
function visit123_100_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['99'][1].init(41, 81, '/loaded|complete/.test(script.readyState) || event == \'error\'');
function visit122_99_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['98'][1].init(28, 123, '!script.readyState || /loaded|complete/.test(script.readyState) || event == \'error\'');
function visit121_98_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['97'][1].init(20, 152, 'abort || !script.readyState || /loaded|complete/.test(script.readyState) || event == \'error\'');
function visit120_97_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['92'][1].init(181, 7, '!script');
function visit119_92_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['79'][1].init(139, 17, 'e.type || \'error\'');
function visit118_79_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['77'][1].init(29, 14, 'e || win.event');
function visit117_77_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['68'][1].init(418, 18, 'c[\'scriptCharset\']');
function visit116_68_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['60'][1].init(34, 78, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit115_60_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['59'][1].init(124, 113, 'doc[\'head\'] || doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit114_59_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['45'][1].init(95, 19, '!config.crossDomain');
function visit113_45_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].lineData[8]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/script-transport.js'].functionData[0]++;
  _$jscoverage['/io/script-transport.js'].lineData[9]++;
  var undefined = undefined, IO = require('./base');
  _$jscoverage['/io/script-transport.js'].lineData[11]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/script-transport.js'].lineData[12]++;
  var win = S.Env.host, doc = win.document, OK_CODE = 200, ERROR_CODE = 500;
  _$jscoverage['/io/script-transport.js'].lineData[18]++;
  IO.setupConfig({
  accepts: {
  script: 'text/javascript, ' + 'application/javascript, ' + 'application/ecmascript, ' + 'application/x-ecmascript'}, 
  contents: {
  script: /javascript|ecmascript/}, 
  converters: {
  text: {
  script: function(text) {
  _$jscoverage['/io/script-transport.js'].functionData[1]++;
  _$jscoverage['/io/script-transport.js'].lineData[35]++;
  S.globalEval(text);
  _$jscoverage['/io/script-transport.js'].lineData[36]++;
  return text;
}}}});
  _$jscoverage['/io/script-transport.js'].lineData[42]++;
  function ScriptTransport(io) {
    _$jscoverage['/io/script-transport.js'].functionData[2]++;
    _$jscoverage['/io/script-transport.js'].lineData[43]++;
    var config = io.config;
    _$jscoverage['/io/script-transport.js'].lineData[45]++;
    if (visit113_45_1(!config.crossDomain)) {
      _$jscoverage['/io/script-transport.js'].lineData[46]++;
      return new (IO['getTransport']('*'))(io);
    }
    _$jscoverage['/io/script-transport.js'].lineData[48]++;
    this.io = io;
    _$jscoverage['/io/script-transport.js'].lineData[49]++;
    logger.info('use ScriptTransport for: ' + config.url);
    _$jscoverage['/io/script-transport.js'].lineData[50]++;
    return this;
  }
  _$jscoverage['/io/script-transport.js'].lineData[53]++;
  S.augment(ScriptTransport, {
  send: function() {
  _$jscoverage['/io/script-transport.js'].functionData[3]++;
  _$jscoverage['/io/script-transport.js'].lineData[55]++;
  var self = this, script, io = self.io, c = io.config, head = visit114_59_1(doc['head'] || visit115_60_1(doc.getElementsByTagName('head')[0] || doc.documentElement));
  _$jscoverage['/io/script-transport.js'].lineData[63]++;
  self.head = head;
  _$jscoverage['/io/script-transport.js'].lineData[64]++;
  script = doc.createElement('script');
  _$jscoverage['/io/script-transport.js'].lineData[65]++;
  self.script = script;
  _$jscoverage['/io/script-transport.js'].lineData[66]++;
  script.async = true;
  _$jscoverage['/io/script-transport.js'].lineData[68]++;
  if (visit116_68_1(c['scriptCharset'])) {
    _$jscoverage['/io/script-transport.js'].lineData[69]++;
    script.charset = c['scriptCharset'];
  }
  _$jscoverage['/io/script-transport.js'].lineData[72]++;
  script.src = io._getUrlForSend();
  _$jscoverage['/io/script-transport.js'].lineData[74]++;
  script.onerror = script.onload = script.onreadystatechange = function(e) {
  _$jscoverage['/io/script-transport.js'].functionData[4]++;
  _$jscoverage['/io/script-transport.js'].lineData[77]++;
  e = visit117_77_1(e || win.event);
  _$jscoverage['/io/script-transport.js'].lineData[79]++;
  self._callback((visit118_79_1(e.type || 'error')).toLowerCase());
};
  _$jscoverage['/io/script-transport.js'].lineData[82]++;
  head.insertBefore(script, head.firstChild);
}, 
  _callback: function(event, abort) {
  _$jscoverage['/io/script-transport.js'].functionData[5]++;
  _$jscoverage['/io/script-transport.js'].lineData[86]++;
  var self = this, script = self.script, io = self.io, head = self.head;
  _$jscoverage['/io/script-transport.js'].lineData[92]++;
  if (visit119_92_1(!script)) {
    _$jscoverage['/io/script-transport.js'].lineData[93]++;
    return;
  }
  _$jscoverage['/io/script-transport.js'].lineData[96]++;
  if (visit120_97_1(abort || visit121_98_1(!script.readyState || visit122_99_1(/loaded|complete/.test(script.readyState) || visit123_100_1(event == 'error'))))) {
    _$jscoverage['/io/script-transport.js'].lineData[103]++;
    script['onerror'] = script.onload = script.onreadystatechange = null;
    _$jscoverage['/io/script-transport.js'].lineData[106]++;
    if (visit124_106_1(head && script.parentNode)) {
      _$jscoverage['/io/script-transport.js'].lineData[110]++;
      head.removeChild(script);
    }
    _$jscoverage['/io/script-transport.js'].lineData[113]++;
    self.script = undefined;
    _$jscoverage['/io/script-transport.js'].lineData[114]++;
    self.head = undefined;
    _$jscoverage['/io/script-transport.js'].lineData[117]++;
    if (visit125_117_1(!abort && visit126_117_2(event != 'error'))) {
      _$jscoverage['/io/script-transport.js'].lineData[118]++;
      io._ioReady(OK_CODE, 'success');
    } else {
      _$jscoverage['/io/script-transport.js'].lineData[121]++;
      if (visit127_121_1(event == 'error')) {
        _$jscoverage['/io/script-transport.js'].lineData[122]++;
        io._ioReady(ERROR_CODE, 'script error');
      }
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/script-transport.js'].functionData[6]++;
  _$jscoverage['/io/script-transport.js'].lineData[128]++;
  this._callback(0, 1);
}});
  _$jscoverage['/io/script-transport.js'].lineData[132]++;
  IO['setupTransport']('script', ScriptTransport);
  _$jscoverage['/io/script-transport.js'].lineData[134]++;
  return IO;
});
