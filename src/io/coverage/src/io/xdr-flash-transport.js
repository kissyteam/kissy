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
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[18] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[19] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[20] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[22] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[23] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[35] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[36] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[39] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[40] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[41] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[44] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[47] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[52] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[54] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[55] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[56] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[58] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[60] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[61] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[64] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[73] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[77] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[85] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[86] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[89] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[91] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[92] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[93] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[95] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[96] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[100] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[101] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[105] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[107] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[108] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[114] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[115] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[117] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[118] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[120] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[124] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[125] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[133] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[134] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[135] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[138] = 0;
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
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['19'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['35'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['50'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['52'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['54'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['68'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['68'][2] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['85'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['103'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['107'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['135'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['135'][1] = new BranchData();
}
_$jscoverage['/io/xdr-flash-transport.js'].branchData['135'][1].init(40, 29, 'xhr && xhr._xdrResponse(e, o)');
function visit144_135_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['107'][1].init(1016, 3, 'ret');
function visit143_107_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['103'][1].init(101, 17, 'c.statusText || e');
function visit142_103_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['85'][1].init(254, 36, 'c && (responseText = c.responseText)');
function visit141_85_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['68'][2].init(118, 22, 'c.hasContent && c.data');
function visit140_68_2(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['68'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['68'][1].init(118, 28, 'c.hasContent && c.data || {}');
function visit139_68_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['54'][1].init(278, 6, '!flash');
function visit138_54_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['52'][1].init(182, 47, 'xdr.src || (S.Config.base + \'io/assets/io.swf\')');
function visit137_52_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['50'][1].init(99, 14, 'c[\'xdr\'] || {}');
function visit136_50_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['35'][1].init(616, 31, 'doc.body || doc.documentElement');
function visit135_35_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['19'][1].init(13, 4, 'init');
function visit134_19_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].lineData[6]++;
KISSY.add('io/xdr-flash-transport', function(S, IO, Dom) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[0]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[7]++;
  var maps = {}, logger = S.getLogger('s/io'), ID = 'io_swf', flash, doc = S.Env.host.document, init = false;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[18]++;
  function _swf(uri, _, uid) {
    _$jscoverage['/io/xdr-flash-transport.js'].functionData[1]++;
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[19]++;
    if (visit134_19_1(init)) {
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[20]++;
      return;
    }
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[22]++;
    init = true;
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[23]++;
    var o = '<object id="' + ID + '" type="application/x-shockwave-flash" data="' + uri + '" width="0" height="0">' + '<param name="movie" value="' + uri + '" />' + '<param name="FlashVars" value="yid=' + _ + '&uid=' + uid + '&host=KISSY.IO" />' + '<param name="allowScriptAccess" value="always" />' + '</object>', c = doc.createElement('div');
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[35]++;
    Dom.prepend(c, visit135_35_1(doc.body || doc.documentElement));
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[36]++;
    c.innerHTML = o;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[39]++;
  function XdrFlashTransport(io) {
    _$jscoverage['/io/xdr-flash-transport.js'].functionData[2]++;
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[40]++;
    logger.info('use XdrFlashTransport for: ' + io.config.url);
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[41]++;
    this.io = io;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[44]++;
  S.augment(XdrFlashTransport, {
  send: function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[3]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[47]++;
  var self = this, io = self.io, c = io.config, xdr = visit136_50_1(c['xdr'] || {});
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[52]++;
  _swf(visit137_52_1(xdr.src || (S.Config.base + 'io/assets/io.swf')), 1, 1);
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[54]++;
  if (visit138_54_1(!flash)) {
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[55]++;
    setTimeout(function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[4]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[56]++;
  self.send();
}, 200);
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[58]++;
    return;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[60]++;
  self._uid = S.guid();
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[61]++;
  maps[self._uid] = self;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[64]++;
  flash.send(io._getUrlForSend(), {
  id: self._uid, 
  uid: self._uid, 
  method: c.type, 
  data: visit139_68_1(visit140_68_2(c.hasContent && c.data) || {})});
}, 
  abort: function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[5]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[73]++;
  flash.abort(this._uid);
}, 
  _xdrResponse: function(e, o) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[6]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[77]++;
  var self = this, ret, id = o.id, responseText, c = o.c, io = self.io;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[85]++;
  if (visit141_85_1(c && (responseText = c.responseText))) {
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[86]++;
    io.responseText = decodeURI(responseText);
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[89]++;
  switch (e) {
    case 'success':
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[91]++;
      ret = {
  status: 200, 
  statusText: 'success'};
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[92]++;
      delete maps[id];
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[93]++;
      break;
    case 'abort':
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[95]++;
      delete maps[id];
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[96]++;
      break;
    case 'timeout':
    case 'transport error':
    case 'failure':
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[100]++;
      delete maps[id];
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[101]++;
      ret = {
  status: 'status' in c ? c.status : 500, 
  statusText: visit142_103_1(c.statusText || e)};
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[105]++;
      break;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[107]++;
  if (visit143_107_1(ret)) {
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[108]++;
    io._ioReady(ret.status, ret.statusText);
  }
}});
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[114]++;
  IO['applyTo'] = function(_, cmd, args) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[7]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[115]++;
  var cmds = cmd.split('.').slice(1), func = IO;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[117]++;
  S.each(cmds, function(c) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[8]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[118]++;
  func = func[c];
});
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[120]++;
  func.apply(null, args);
};
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[124]++;
  IO['xdrReady'] = function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[9]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[125]++;
  flash = doc.getElementById(ID);
};
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[133]++;
  IO['xdrResponse'] = function(e, o) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[10]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[134]++;
  var xhr = maps[o.uid];
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[135]++;
  visit144_135_1(xhr && xhr._xdrResponse(e, o));
};
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[138]++;
  return XdrFlashTransport;
}, {
  requires: ['./base', 'dom']});
