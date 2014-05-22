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
if (! _$jscoverage['/io/xdr-flash-transport.js']) {
  _$jscoverage['/io/xdr-flash-transport.js'] = {};
  _$jscoverage['/io/xdr-flash-transport.js'].lineData = [];
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[6] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[7] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[8] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[10] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[11] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[22] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[23] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[24] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[26] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[27] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[39] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[40] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[43] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[44] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[45] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[48] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[51] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[56] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[58] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[59] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[60] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[62] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[64] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[65] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[68] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[77] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[81] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[89] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[90] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[93] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[95] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[99] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[100] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[102] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[103] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[107] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[108] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[112] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[114] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[115] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[121] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[122] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[124] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[125] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[127] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[131] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[132] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[140] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[141] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[142] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[143] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[147] = 0;
}
if (! _$jscoverage['/io/xdr-flash-transport.js'].functionData) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData = [];
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[0] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[1] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[2] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[3] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[4] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[5] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[6] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[7] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[8] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[9] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[10] = 0;
}
if (! _$jscoverage['/io/xdr-flash-transport.js'].branchData) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData = {};
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['23'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['39'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['54'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['56'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['58'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['72'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['89'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['110'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['114'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['142'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['142'][1] = new BranchData();
}
_$jscoverage['/io/xdr-flash-transport.js'].branchData['142'][1].init(46, 3, 'xhr');
function visit134_142_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['114'][1].init(1118, 3, 'ret');
function visit133_114_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['110'][1].init(103, 17, 'c.statusText || e');
function visit132_110_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['89'][1].init(263, 36, 'c && (responseText = c.responseText)');
function visit131_89_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['72'][2].init(122, 22, 'c.hasContent && c.data');
function visit130_72_2(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['72'][1].init(122, 28, 'c.hasContent && c.data || {}');
function visit129_72_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['58'][1].init(286, 6, '!flash');
function visit128_58_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['56'][1].init(185, 50, 'xdr.src || (S.config(\'base\') + \'io/assets/io.swf\')');
function visit127_56_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['54'][1].init(102, 11, 'c.xdr || {}');
function visit126_54_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['39'][1].init(633, 31, 'doc.body || doc.documentElement');
function visit125_39_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['23'][1].init(14, 4, 'init');
function visit124_23_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[0]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[8]++;
  var IO = require('./base'), Dom = require('dom');
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[10]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[11]++;
  var maps = {}, ID = 'io_swf', flash, doc = S.Env.host.document, init = false;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[22]++;
  function _swf(uri, _, uid) {
    _$jscoverage['/io/xdr-flash-transport.js'].functionData[1]++;
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[23]++;
    if (visit124_23_1(init)) {
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[24]++;
      return;
    }
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[26]++;
    init = true;
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[27]++;
    var o = '<object id="' + ID + '" type="application/x-shockwave-flash" data="' + uri + '" width="0" height="0">' + '<param name="movie" value="' + uri + '" />' + '<param name="FlashVars" value="yid=' + _ + '&uid=' + uid + '&host=KISSY.IO" />' + '<param name="allowScriptAccess" value="always" />' + '</object>', c = doc.createElement('div');
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[39]++;
    Dom.prepend(c, visit125_39_1(doc.body || doc.documentElement));
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[40]++;
    c.innerHTML = o;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[43]++;
  function XdrFlashTransport(io) {
    _$jscoverage['/io/xdr-flash-transport.js'].functionData[2]++;
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[44]++;
    logger.info('use XdrFlashTransport for: ' + io.config.url);
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[45]++;
    this.io = io;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[48]++;
  util.augment(XdrFlashTransport, {
  send: function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[3]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[51]++;
  var self = this, io = self.io, c = io.config, xdr = visit126_54_1(c.xdr || {});
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[56]++;
  _swf(visit127_56_1(xdr.src || (S.config('base') + 'io/assets/io.swf')), 1, 1);
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[58]++;
  if (visit128_58_1(!flash)) {
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[59]++;
    setTimeout(function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[4]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[60]++;
  self.send();
}, 200);
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[62]++;
    return;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[64]++;
  self._uid = util.guid();
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[65]++;
  maps[self._uid] = self;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[68]++;
  flash.send(io._getUrlForSend(), {
  id: self._uid, 
  uid: self._uid, 
  method: c.type, 
  data: visit129_72_1(visit130_72_2(c.hasContent && c.data) || {})});
}, 
  abort: function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[5]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[77]++;
  flash.abort(this._uid);
}, 
  _xdrResponse: function(e, o) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[6]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[81]++;
  var self = this, ret, id = o.id, responseText, c = o.c, io = self.io;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[89]++;
  if (visit131_89_1(c && (responseText = c.responseText))) {
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[90]++;
    io.responseText = decodeURI(responseText);
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[93]++;
  switch (e) {
    case 'success':
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[95]++;
      ret = {
  status: 200, 
  statusText: 'success'};
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[99]++;
      delete maps[id];
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[100]++;
      break;
    case 'abort':
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[102]++;
      delete maps[id];
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[103]++;
      break;
    case 'timeout':
    case 'transport error':
    case 'failure':
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[107]++;
      delete maps[id];
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[108]++;
      ret = {
  status: 'status' in c ? c.status : 500, 
  statusText: visit132_110_1(c.statusText || e)};
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[112]++;
      break;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[114]++;
  if (visit133_114_1(ret)) {
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[115]++;
    io._ioReady(ret.status, ret.statusText);
  }
}});
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[121]++;
  IO.applyTo = function(_, cmd, args) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[7]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[122]++;
  var cmds = cmd.split('.').slice(1), func = IO;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[124]++;
  util.each(cmds, function(c) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[8]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[125]++;
  func = func[c];
});
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[127]++;
  func.apply(null, args);
};
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[131]++;
  IO.xdrReady = function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[9]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[132]++;
  flash = doc.getElementById(ID);
};
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[140]++;
  IO.xdrResponse = function(e, o) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[10]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[141]++;
  var xhr = maps[o.uid];
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[142]++;
  if (visit134_142_1(xhr)) {
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[143]++;
    xhr._xdrResponse(e, o);
  }
};
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[147]++;
  return XdrFlashTransport;
});
