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
  _$jscoverage['/io/script-transport.js'].lineData[14] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[31] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[32] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[38] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[39] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[41] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[42] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[44] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[45] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[46] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[49] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[51] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[59] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[60] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[61] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[62] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[64] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[65] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[68] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[70] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[73] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[75] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[78] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[82] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[88] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[89] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[92] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[99] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[102] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[106] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[109] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[110] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[113] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[114] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[117] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[118] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[124] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[128] = 0;
  _$jscoverage['/io/script-transport.js'].lineData[130] = 0;
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
  _$jscoverage['/io/script-transport.js'].branchData['41'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['55'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['56'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['64'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['73'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['75'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['88'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['93'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['94'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['95'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['96'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['102'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['113'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/io/script-transport.js'].branchData['117'] = [];
  _$jscoverage['/io/script-transport.js'].branchData['117'][1] = new BranchData();
}
_$jscoverage['/io/script-transport.js'].branchData['117'][1].init(674, 16, 'event == \'error\'');
function visit126_117_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['113'][2].init(520, 16, 'event != \'error\'');
function visit125_113_2(result) {
  _$jscoverage['/io/script-transport.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['113'][1].init(510, 26, '!abort && event != \'error\'');
function visit124_113_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['102'][1].init(151, 25, 'head && script.parentNode');
function visit123_102_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['96'][1].init(65, 16, 'event == \'error\'');
function visit122_96_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['95'][1].init(42, 82, '/loaded|complete/.test(script.readyState) || event == \'error\'');
function visit121_95_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['94'][1].init(29, 125, '!script.readyState || /loaded|complete/.test(script.readyState) || event == \'error\'');
function visit120_94_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['93'][1].init(21, 155, 'abort || !script.readyState || /loaded|complete/.test(script.readyState) || event == \'error\'');
function visit119_93_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['88'][1].init(188, 7, '!script');
function visit118_88_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['75'][1].init(142, 17, 'e.type || \'error\'');
function visit117_75_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['73'][1].init(30, 14, 'e || win.event');
function visit116_73_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['64'][1].init(432, 18, 'c[\'scriptCharset\']');
function visit115_64_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['56'][1].init(35, 79, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit114_56_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['55'][1].init(128, 115, 'doc[\'head\'] || doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit113_55_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].branchData['41'][1].init(98, 19, '!config.crossDomain');
function visit112_41_1(result) {
  _$jscoverage['/io/script-transport.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/script-transport.js'].lineData[8]++;
KISSY.add('io/script-transport', function(S, IO, _, undefined) {
  _$jscoverage['/io/script-transport.js'].functionData[0]++;
  _$jscoverage['/io/script-transport.js'].lineData[9]++;
  var win = S.Env.host, doc = win.document, OK_CODE = 200, ERROR_CODE = 500;
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
    var config = io.config;
    _$jscoverage['/io/script-transport.js'].lineData[41]++;
    if (visit112_41_1(!config.crossDomain)) {
      _$jscoverage['/io/script-transport.js'].lineData[42]++;
      return new (IO['getTransport']('*'))(io);
    }
    _$jscoverage['/io/script-transport.js'].lineData[44]++;
    this.io = io;
    _$jscoverage['/io/script-transport.js'].lineData[45]++;
    S.log('use ScriptTransport for: ' + config.url);
    _$jscoverage['/io/script-transport.js'].lineData[46]++;
    return this;
  }
  _$jscoverage['/io/script-transport.js'].lineData[49]++;
  S.augment(ScriptTransport, {
  send: function() {
  _$jscoverage['/io/script-transport.js'].functionData[3]++;
  _$jscoverage['/io/script-transport.js'].lineData[51]++;
  var self = this, script, io = self.io, c = io.config, head = visit113_55_1(doc['head'] || visit114_56_1(doc.getElementsByTagName('head')[0] || doc.documentElement));
  _$jscoverage['/io/script-transport.js'].lineData[59]++;
  self.head = head;
  _$jscoverage['/io/script-transport.js'].lineData[60]++;
  script = doc.createElement('script');
  _$jscoverage['/io/script-transport.js'].lineData[61]++;
  self.script = script;
  _$jscoverage['/io/script-transport.js'].lineData[62]++;
  script.async = true;
  _$jscoverage['/io/script-transport.js'].lineData[64]++;
  if (visit115_64_1(c['scriptCharset'])) {
    _$jscoverage['/io/script-transport.js'].lineData[65]++;
    script.charset = c['scriptCharset'];
  }
  _$jscoverage['/io/script-transport.js'].lineData[68]++;
  script.src = io._getUrlForSend();
  _$jscoverage['/io/script-transport.js'].lineData[70]++;
  script.onerror = script.onload = script.onreadystatechange = function(e) {
  _$jscoverage['/io/script-transport.js'].functionData[4]++;
  _$jscoverage['/io/script-transport.js'].lineData[73]++;
  e = visit116_73_1(e || win.event);
  _$jscoverage['/io/script-transport.js'].lineData[75]++;
  self._callback((visit117_75_1(e.type || 'error')).toLowerCase());
};
  _$jscoverage['/io/script-transport.js'].lineData[78]++;
  head.insertBefore(script, head.firstChild);
}, 
  _callback: function(event, abort) {
  _$jscoverage['/io/script-transport.js'].functionData[5]++;
  _$jscoverage['/io/script-transport.js'].lineData[82]++;
  var self = this, script = self.script, io = self.io, head = self.head;
  _$jscoverage['/io/script-transport.js'].lineData[88]++;
  if (visit118_88_1(!script)) {
    _$jscoverage['/io/script-transport.js'].lineData[89]++;
    return;
  }
  _$jscoverage['/io/script-transport.js'].lineData[92]++;
  if (visit119_93_1(abort || visit120_94_1(!script.readyState || visit121_95_1(/loaded|complete/.test(script.readyState) || visit122_96_1(event == 'error'))))) {
    _$jscoverage['/io/script-transport.js'].lineData[99]++;
    script['onerror'] = script.onload = script.onreadystatechange = null;
    _$jscoverage['/io/script-transport.js'].lineData[102]++;
    if (visit123_102_1(head && script.parentNode)) {
      _$jscoverage['/io/script-transport.js'].lineData[106]++;
      head.removeChild(script);
    }
    _$jscoverage['/io/script-transport.js'].lineData[109]++;
    self.script = undefined;
    _$jscoverage['/io/script-transport.js'].lineData[110]++;
    self.head = undefined;
    _$jscoverage['/io/script-transport.js'].lineData[113]++;
    if (visit124_113_1(!abort && visit125_113_2(event != 'error'))) {
      _$jscoverage['/io/script-transport.js'].lineData[114]++;
      io._ioReady(OK_CODE, 'success');
    } else {
      _$jscoverage['/io/script-transport.js'].lineData[117]++;
      if (visit126_117_1(event == 'error')) {
        _$jscoverage['/io/script-transport.js'].lineData[118]++;
        io._ioReady(ERROR_CODE, 'script error');
      }
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/script-transport.js'].functionData[6]++;
  _$jscoverage['/io/script-transport.js'].lineData[124]++;
  this._callback(0, 1);
}});
  _$jscoverage['/io/script-transport.js'].lineData[128]++;
  IO['setupTransport']('script', ScriptTransport);
  _$jscoverage['/io/script-transport.js'].lineData[130]++;
  return IO;
}, {
  requires: ['./base', './xhr-transport']});
