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
  _$jscoverage['/io/script-transport.js'].lineData[17] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[34] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[35] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[41] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[42] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[44] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[45] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[47] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[48] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[49] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[52] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[54] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[62] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[63] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[64] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[65] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[67] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[68] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[71] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[73] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[76] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[78] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[81] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[85] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[91] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[92] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[95] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[101] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[104] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[108] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[111] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[112] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[115] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[116] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[119] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[120] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[126] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[130] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[132] = 0;
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
  _$jscoverage['/io/script-transport.js'].branchData['44'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['58'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['59'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['67'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['76'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['78'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['91'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['96'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['97'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['98'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['104'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['115'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['119'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['119'][1] = new BranchData();
}
_$jscoverage['/io/script-transport.js'].branchData['119'][1].init(652, 17, 'event === \'error\'');
function visit124_119_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['115'][2].init(501, 17, 'event !== \'error\'');
function visit123_115_2(result) {
  _$jscoverage['/io/script-transport.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['115'][1].init(491, 27, '!abort && event !== \'error\'');
function visit122_115_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['104'][1].init(143, 25, 'head && script.parentNode');
function visit121_104_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['98'][1].init(64, 17, 'event === \'error\'');
function visit120_98_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['97'][1].init(41, 82, '/loaded|complete/.test(script.readyState) || event === \'error\'');
function visit119_97_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['96'][2].init(274, 124, '!script.readyState || /loaded|complete/.test(script.readyState) || event === \'error\'');
function visit118_96_2(result) {
  _$jscoverage['/io/script-transport.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['96'][1].init(20, 133, 'abort || !script.readyState || /loaded|complete/.test(script.readyState) || event === \'error\'');
function visit117_96_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['91'][1].init(181, 7, '!script');
function visit116_91_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['78'][1].init(139, 17, 'e.type || \'error\'');
function visit115_78_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['76'][1].init(29, 14, 'e || win.event');
function visit114_76_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['67'][1].init(415, 15, 'c.scriptCharset');
function visit113_67_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['59'][1].init(31, 78, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit112_59_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['58'][1].init(124, 110, 'doc.head || doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit111_58_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['44'][1].init(95, 19, '!config.crossDomain');
function visit110_44_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].lineData[8]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/script-transport.js'].functionData[0]++;
  _$jscoverage['/io/script-transport.js'].lineData[9]++;
  var IO = require('./base');
  _$jscoverage['/io/script-transport.js'].lineData[10]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/script-transport.js'].lineData[11]++;
  var win = S.Env.host, doc = win.document, OK_CODE = 200, ERROR_CODE = 500;
  _$jscoverage['/io/script-transport.js'].lineData[17]++;
  IO.setupConfig({
  accepts: {
  script: 'text/javascript, ' + 'application/javascript, ' + 'application/ecmascript, ' + 'application/x-ecmascript'}, 
  contents: {
  script: /javascript|ecmascript/}, 
  converters: {
  text: {
  script: function(text) {
  _$jscoverage['/io/script-transport.js'].functionData[1]++;
  _$jscoverage['/io/script-transport.js'].lineData[34]++;
  S.globalEval(text);
  _$jscoverage['/io/script-transport.js'].lineData[35]++;
  return text;
}}}});
  _$jscoverage['/io/script-transport.js'].lineData[41]++;
  function ScriptTransport(io) {
    _$jscoverage['/io/script-transport.js'].functionData[2]++;
    _$jscoverage['/io/script-transport.js'].lineData[42]++;
    var config = io.config;
    _$jscoverage['/io/script-transport.js'].lineData[44]++;
    if (visit110_44_1(!config.crossDomain)) {
      _$jscoverage['/io/script-transport.js'].lineData[45]++;
      return new (IO.getTransport('*'))(io);
    }
    _$jscoverage['/io/script-transport.js'].lineData[47]++;
    this.io = io;
    _$jscoverage['/io/script-transport.js'].lineData[48]++;
    logger.info('use ScriptTransport for: ' + config.url);
    _$jscoverage['/io/script-transport.js'].lineData[49]++;
    return this;
  }
  _$jscoverage['/io/script-transport.js'].lineData[52]++;
  S.augment(ScriptTransport, {
  send: function() {
  _$jscoverage['/io/script-transport.js'].functionData[3]++;
  _$jscoverage['/io/script-transport.js'].lineData[54]++;
  var self = this, script, io = self.io, c = io.config, head = visit111_58_1(doc.head || visit112_59_1(doc.getElementsByTagName('head')[0] || doc.documentElement));
  _$jscoverage['/io/script-transport.js'].lineData[62]++;
  self.head = head;
  _$jscoverage['/io/script-transport.js'].lineData[63]++;
  script = doc.createElement('script');
  _$jscoverage['/io/script-transport.js'].lineData[64]++;
  self.script = script;
  _$jscoverage['/io/script-transport.js'].lineData[65]++;
  script.async = true;
  _$jscoverage['/io/script-transport.js'].lineData[67]++;
  if (visit113_67_1(c.scriptCharset)) {
    _$jscoverage['/io/script-transport.js'].lineData[68]++;
    script.charset = c.scriptCharset;
  }
  _$jscoverage['/io/script-transport.js'].lineData[71]++;
  script.src = io._getUrlForSend();
  _$jscoverage['/io/script-transport.js'].lineData[73]++;
  script.onerror = script.onload = script.onreadystatechange = function(e) {
  _$jscoverage['/io/script-transport.js'].functionData[4]++;
  _$jscoverage['/io/script-transport.js'].lineData[76]++;
  e = visit114_76_1(e || win.event);
  _$jscoverage['/io/script-transport.js'].lineData[78]++;
  self._callback((visit115_78_1(e.type || 'error')).toLowerCase());
};
  _$jscoverage['/io/script-transport.js'].lineData[81]++;
  head.insertBefore(script, head.firstChild);
}, 
  _callback: function(event, abort) {
  _$jscoverage['/io/script-transport.js'].functionData[5]++;
  _$jscoverage['/io/script-transport.js'].lineData[85]++;
  var self = this, script = self.script, io = self.io, head = self.head;
  _$jscoverage['/io/script-transport.js'].lineData[91]++;
  if (visit116_91_1(!script)) {
    _$jscoverage['/io/script-transport.js'].lineData[92]++;
    return;
  }
  _$jscoverage['/io/script-transport.js'].lineData[95]++;
  if (visit117_96_1(abort || visit118_96_2(!script.readyState || visit119_97_1(/loaded|complete/.test(script.readyState) || visit120_98_1(event === 'error'))))) {
    _$jscoverage['/io/script-transport.js'].lineData[101]++;
    script.onerror = script.onload = script.onreadystatechange = null;
    _$jscoverage['/io/script-transport.js'].lineData[104]++;
    if (visit121_104_1(head && script.parentNode)) {
      _$jscoverage['/io/script-transport.js'].lineData[108]++;
      head.removeChild(script);
    }
    _$jscoverage['/io/script-transport.js'].lineData[111]++;
    self.script = undefined;
    _$jscoverage['/io/script-transport.js'].lineData[112]++;
    self.head = undefined;
    _$jscoverage['/io/script-transport.js'].lineData[115]++;
    if (visit122_115_1(!abort && visit123_115_2(event !== 'error'))) {
      _$jscoverage['/io/script-transport.js'].lineData[116]++;
      io._ioReady(OK_CODE, 'success');
    } else {
      _$jscoverage['/io/script-transport.js'].lineData[119]++;
      if (visit124_119_1(event === 'error')) {
        _$jscoverage['/io/script-transport.js'].lineData[120]++;
        io._ioReady(ERROR_CODE, 'script error');
      }
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/script-transport.js'].functionData[6]++;
  _$jscoverage['/io/script-transport.js'].lineData[126]++;
  this._callback(0, 1);
}});
  _$jscoverage['/io/script-transport.js'].lineData[130]++;
  IO.setupTransport('script', ScriptTransport);
  _$jscoverage['/io/script-transport.js'].lineData[132]++;
  return IO;
});
